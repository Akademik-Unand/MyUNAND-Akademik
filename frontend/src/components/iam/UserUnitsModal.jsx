import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { IconButton } from "../common/IconButton";
import { FormActions } from "../common/FormActions";
import { useResourceItem } from "../../hooks/useResourceQuery";
import { useFilterOptions } from "../../hooks/useFilterOptions";
import { assignUserUnits } from "../../services/api";

const emptyRow = () => ({
  key: crypto.randomUUID(),
  fakultas_id: "",
  departemen_id: "",
  program_studi_id: "",
});

const toRow = (unit) => ({
  key: crypto.randomUUID(),
  fakultas_id: unit.fakultas_id || "",
  departemen_id: unit.departemen_id || "",
  program_studi_id: unit.program_studi_id || "",
});

const academicUnitSuggestion = (user) => {
  const profile = user.mahasiswa || user.dosen;
  const program = profile?.programStudi;
  if (!profile?.program_studi_id && !program?.id) return null;
  return {
    fakultas_id: program?.fakultas_id || "",
    departemen_id: program?.departemen_id || "",
    program_studi_id: profile.program_studi_id || program?.id || "",
  };
};

const UserUnitsEditor = ({ user, onClose }) => {
  const queryClient = useQueryClient();
  const options = useFilterOptions();
  const suggestion = academicUnitSuggestion(user);
  const [rows, setRows] = useState(() => {
    if (user.units?.length) return user.units.map(toRow);
    return [suggestion ? toRow(suggestion) : emptyRow()];
  });
  const [saving, setSaving] = useState(false);

  const updateAt = (index, patch) =>
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );

  const prodiForRow = (row) =>
    (options.prodiRows || []).find((prodi) => prodi.id === row.program_studi_id);

  const departemenForRow = (row) =>
    (options.departemenRows || []).find((departemen) =>
      departemen.id === row.departemen_id || departemen.id === prodiForRow(row)?.departemen_id,
    );

  const facultyIdForRow = (row) =>
    row.fakultas_id || prodiForRow(row)?.fakultas_id || departemenForRow(row)?.fakultas_id || "";

  const departemenIdForRow = (row) =>
    row.departemen_id || prodiForRow(row)?.departemen_id || "";

  const departemenOptions = (row) =>
    (options.departemenRows || []).filter(
      (d) => !facultyIdForRow(row) || d.fakultas_id === facultyIdForRow(row),
    );

  const prodiOptions = (row) =>
    (options.prodiRows || []).filter(
      (p) => !departemenIdForRow(row) || p.departemen_id === departemenIdForRow(row),
    );

  const save = async () => {
    if (saving) return;
    const units = rows
      .filter(
        (row) => row.fakultas_id || row.departemen_id || row.program_studi_id,
      )
      .map((row) => {
        if (row.program_studi_id) {
          return { fakultas_id: null, departemen_id: null, program_studi_id: row.program_studi_id };
        }
        if (row.departemen_id) {
          return { fakultas_id: null, departemen_id: row.departemen_id, program_studi_id: null };
        }
        return { fakultas_id: row.fakultas_id || null, departemen_id: null, program_studi_id: null };
      });
    setSaving(true);
    try {
      await assignUserUnits(user.id, units);
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["table", "users"] });
      toast.success("Unit organisasi user berhasil diperbarui.");
      onClose();
    } catch (err) {
      toast.error(err.message || "Gagal memperbarui unit user.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-base-content/60">
        Tentukan unit akses user. Boleh lebih dari satu baris (multi-unit).
        Setiap baris wajib memilih minimal satu level; pilih yang paling tinggi
        yang relevan (fakultas &gt; departemen &gt; prodi).
      </p>
      {!user.units?.length && suggestion && (
        <p className="alert alert-info py-2 text-xs">
          Unit akses belum ditetapkan. Prodi pada profil akademik ditampilkan sebagai saran; klik Simpan untuk menetapkannya.
        </p>
      )}
      {rows.map((row, index) => (
        <div
          key={row.key}
          className="space-y-3 rounded-box border border-base-300 p-3"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Unit {index + 1}</p>
            {rows.length > 1 && (
              <IconButton
                label="Hapus unit"
                icon={Trash2}
                tone="text-error"
                onClick={() =>
                  setRows((prev) => prev.filter((_, i) => i !== index))
                }
              />
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Select
              label="Fakultas"
              size="sm"
              placeholder="Pilih fakultas"
              options={options.fakultas}
              value={row.fakultas_id}
              onChange={(e) =>
                updateAt(index, {
                  fakultas_id: e.target.value,
                  departemen_id: "",
                  program_studi_id: "",
                })
              }
            />
            <Select
              label="Departemen"
              size="sm"
              placeholder="Pilih departemen"
              options={departemenOptions(row).map((d) => ({
                value: d.id,
                label: d.nama_resmi || d.nama_singkat || d.kode_departemen,
              }))}
              value={departemenIdForRow(row)}
              disabled={!facultyIdForRow(row)}
              onChange={(e) =>
                updateAt(index, {
                  departemen_id: e.target.value,
                  program_studi_id: "",
                })
              }
            />
            <Select
              label="Prodi"
              size="sm"
              placeholder="Pilih prodi"
              options={prodiOptions(row).map((p) => ({
                value: p.id,
                label: p.nama_singkat || p.kode_prodi,
              }))}
              value={row.program_studi_id}
              disabled={!departemenIdForRow(row)}
              onChange={(e) =>
                updateAt(index, { program_studi_id: e.target.value })
              }
            />
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="gap-1.5"
        onClick={() => setRows((prev) => [...prev, emptyRow()])}
      >
        <Plus size={15} /> Tambah unit
      </Button>
      <div className="flex items-center justify-end gap-2">
        <FormActions
          onCancel={onClose}
          submitLabel="Simpan"
          isLoading={saving}
          onSubmitClick={save}
        />
      </div>
    </div>
  );
};

export const UserUnitsModal = ({ target, onClose }) => {
  const detail = useResourceItem("users", target?.id, {
    enabled: Boolean(target?.id),
  });
  return (
    <Modal
      open={Boolean(target)}
      onClose={onClose}
      title={`Atur Unit Organisasi — ${target?.name || "User"}`}
      closeOnBackdrop={!detail.isPending}
    >
      {detail.isPending ? (
        <p className="text-sm text-base-content/60">Memuat unit user...</p>
      ) : detail.data ? (
        <UserUnitsEditor
          key={detail.data.id}
          user={detail.data}
          onClose={onClose}
        />
      ) : (
        <p className="text-sm text-base-content/60">User tidak ditemukan.</p>
      )}
    </Modal>
  );
};
