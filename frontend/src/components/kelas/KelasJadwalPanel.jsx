import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Select } from "../ui/Select";
import { Modal } from "../ui/Modal";
import { FormActions } from "../common/FormActions";
import { ConfirmDeleteModal } from "../common/ConfirmDeleteModal";
import { IconButton } from "../common/IconButton";
import { useResourceQuery } from "../../hooks/useResourceQuery";
import { useResourceMutations } from "../../hooks/useResourceMutations";
import { useCan } from "../../hooks/useCan";

const HARI_OPTIONS = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
].map((hari) => ({
  value: hari,
  label: hari,
}));
const EMPTY_JADWAL = { shift_id: "", ruang_id: "", hari: "" };

const formatJam = (value) => (value ? String(value).slice(0, 5) : "");

/**
 * Panel pengaturan kelas: dosen pengampu (DosenKelas, level kelas) dan jadwal
 * kuliah (JadwalKelas: ruang, hari, jam). Dosen pengampu bukan berasal dari
 * mata kuliah — satu MK bisa punya banyak kelas dengan dosen berbeda.
 */
export const KelasJadwalPanel = ({ kelas }) => {
  const client = useQueryClient();
  const can = useCan();
  const { data: ruangRows = [] } = useResourceQuery("ruang");
  const kelasProdiId = kelas?.semesterProdi?.program_studi_id;
  const kelasFakultasId = kelas?.semesterProdi?.programStudi?.fakultas_id;
  const { data: dosenRows = [] } = useResourceQuery("dosen", {
    params: kelasProdiId
      ? { filter: { program_studi_id: kelasProdiId } }
      : undefined,
    enabled: Boolean(kelasProdiId),
  });
  const { data: shiftRows = [] } = useResourceQuery("shift", {
    params: kelasFakultasId
      ? { filter: { fakultas_id: kelasFakultasId } }
      : undefined,
    enabled: Boolean(kelasFakultasId),
  });
  const [addDosenOpen, setAddDosenOpen] = useState(false);
  const [dosenId, setDosenId] = useState("");
  const [jadwalModal, setJadwalModal] = useState(null); // { mode: 'create' } | { mode: 'edit', row }
  const [jadwalValues, setJadwalValues] = useState(EMPTY_JADWAL);
  const [deleteTarget, setDeleteTarget] = useState(null); // { kind, id, label }

  const dosenMutations = useResourceMutations("dosen-kelas", {
    create: "Dosen pengampu ditambahkan.",
    remove: "Dosen pengampu dihapus.",
  });
  const jadwalMutations = useResourceMutations("jadwal-kelas", {
    create: "Jadwal kuliah ditambahkan.",
    update: "Jadwal kuliah diperbarui.",
    remove: "Jadwal kuliah dihapus.",
  });
  const invalidateKelas = () =>
    client.invalidateQueries({ queryKey: ["kelas", kelas?.id] });

  const ruangOptions = ruangRows.map((row) => ({
    value: row.id,
    label: `${row.kode || ""} ${row.nama || ""}`.trim() || "Ruang",
  }));
  // Dosen yang sudah menjadi pengampu kelas ini tidak perlu muncul lagi di dropdown.
  const assignedDosenIds = new Set(
    (kelas?.dosenKelas || []).map((row) => row.dosen_id),
  );
  const dosenOptions = dosenRows
    .filter((row) => !assignedDosenIds.has(row.id))
    .map((row) => ({ value: row.id, label: row.nama }));
  const shiftOptions = shiftRows.map((row) => ({
    value: row.id,
    label: `${row.kode} (${formatJam(row.jam_mulai)}–${formatJam(row.jam_selesai)})`,
  }));

  const addDosen = async (event) => {
    event.preventDefault();
    if (!dosenId) return;
    await dosenMutations.create.mutateAsync({
      dosen_id: dosenId,
      kelas_id: kelas.id,
      dosen_ke: (kelas?.dosenKelas?.length || 0) + 1,
    });
    invalidateKelas();
    setDosenId("");
    setAddDosenOpen(false);
  };

  const openAddJadwal = () => {
    setJadwalValues(EMPTY_JADWAL);
    setJadwalModal({ mode: "create" });
  };

  const openEditJadwal = (row) => {
    setJadwalValues({
      shift_id: row.shift_id || "",
      ruang_id: row.ruang_id || "",
      hari: row.hari || "",
    });
    setJadwalModal({ mode: "edit", row });
  };

  const saveJadwal = async (event) => {
    event.preventDefault();
    const payload = {
      kelas_id: kelas.id,
      shift_id: jadwalValues.shift_id || null,
      ruang_id: jadwalValues.ruang_id || null,
      hari: jadwalValues.hari,
    };
    if (jadwalModal?.mode === "edit") {
      await jadwalMutations.update.mutateAsync({
        id: jadwalModal.row.id,
        payload,
      });
    } else {
      await jadwalMutations.create.mutateAsync(payload);
    }
    invalidateKelas();
    setJadwalModal(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.kind === "dosen") {
      await dosenMutations.remove.mutateAsync(deleteTarget.id);
    } else {
      await jadwalMutations.remove.mutateAsync(deleteTarget.id);
    }
    invalidateKelas();
    setDeleteTarget(null);
  };

  const dosenList = [...(kelas?.dosenKelas || [])].sort(
    (a, b) => (a.dosen_ke || 0) - (b.dosen_ke || 0),
  );
  const jadwalList = kelas?.jadwalKelas || [];

  return (
    <div className="space-y-4">
      <Card
        title="Dosen Pengampu"
        actions={
          can("create", "DosenKelas") ? (
            <Button
              size="xs"
              className="gap-1"
              onClick={() => setAddDosenOpen(true)}
            >
              <Plus size={13} /> Tambah Dosen
            </Button>
          ) : null
        }
      >
        {dosenList.length ? (
          <ul className="space-y-2 text-sm">
            {dosenList.map((row) => (
              <li
                key={row.id}
                className="flex items-center justify-between gap-2 rounded-box bg-base-200/50 px-3 py-2"
              >
                <span>
                  <Badge variant="ghost" size="xs">
                    {row.dosen_ke || "—"}
                  </Badge>
                  <span className="ml-2">{row.dosen?.nama || "—"}</span>
                </span>
                {can("delete", "DosenKelas") && (
                  <IconButton
                    label="Hapus dosen pengampu"
                    icon={Trash2}
                    tone="text-error"
                    onClick={() =>
                      setDeleteTarget({
                        kind: "dosen",
                        id: row.id,
                        label: row.dosen?.nama || "Dosen",
                      })
                    }
                  />
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-base-content/60">
            Belum ada dosen pengampu untuk kelas ini.
          </p>
        )}
      </Card>

      <Card
        title="Jadwal Kuliah"
        actions={
          can("create", "JadwalKelas") ? (
            <Button size="xs" className="gap-1" onClick={openAddJadwal}>
              <Plus size={13} /> Tambah Jadwal
            </Button>
          ) : null
        }
      >
        {jadwalList.length ? (
          <ul className="space-y-2 text-sm">
            {jadwalList.map((row) => {
              const jam = [formatJam(row.jam_mulai), formatJam(row.jam_selesai)]
                .filter(Boolean)
                .join("–");
              const ruang = row.ruang?.kode || row.ruang?.nama;
              return (
                <li
                  key={row.id}
                  className="flex items-center justify-between gap-2 rounded-box bg-base-200/50 px-3 py-2"
                >
                  <span>
                    {[row.shift?.kode, row.hari, jam, ruang]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </span>
                  <span className="flex gap-1">
                    {can("update", "JadwalKelas") && (
                      <IconButton
                        label="Ubah jadwal"
                        icon={Pencil}
                        tone="text-info"
                        onClick={() => openEditJadwal(row)}
                      />
                    )}
                    {can("delete", "JadwalKelas") && (
                      <IconButton
                        label="Hapus jadwal"
                        icon={Trash2}
                        tone="text-error"
                        onClick={() =>
                          setDeleteTarget({
                            kind: "jadwal",
                            id: row.id,
                            label: `${row.hari} ${jam}`.trim(),
                          })
                        }
                      />
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-base-content/60">
            Belum ada jadwal kuliah untuk kelas ini.
          </p>
        )}
      </Card>

      <Modal
        open={addDosenOpen}
        onClose={() => setAddDosenOpen(false)}
        title="Tambah Dosen Pengampu"
        subtitle="Dosen pengampu diatur per kelas, bukan per mata kuliah"
        closeOnBackdrop={!dosenMutations.create.isPending}
        footer={
          dosenOptions.length ? (
            <FormActions
              onCancel={() => setAddDosenOpen(false)}
              submitLabel="Simpan"
              isLoading={dosenMutations.create.isPending}
              onSubmitClick={() =>
                document.getElementById("kelas-dosen-form")?.requestSubmit()
              }
            />
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setAddDosenOpen(false)}
            >
              Tutup
            </Button>
          )
        }
      >
        <form id="kelas-dosen-form" onSubmit={addDosen}>
          {dosenOptions.length ? (
            <Select
              label="Dosen *"
              placeholder="Pilih dosen"
              options={dosenOptions}
              value={dosenId}
              onChange={(e) => setDosenId(e.target.value)}
              required
            />
          ) : (
            <p className="text-sm text-base-content/60">
              {dosenRows.length
                ? "Semua dosen program studi ini sudah menjadi pengampu kelas ini."
                : "Belum ada data dosen pada program studi ini."}
            </p>
          )}
        </form>
      </Modal>

      <Modal
        open={Boolean(jadwalModal)}
        onClose={() => setJadwalModal(null)}
        title={
          jadwalModal?.mode === "edit"
            ? "Ubah Jadwal Kuliah"
            : "Tambah Jadwal Kuliah"
        }
        closeOnBackdrop={
          !jadwalMutations.create.isPending && !jadwalMutations.update.isPending
        }
        footer={
          <FormActions
            onCancel={() => setJadwalModal(null)}
            submitLabel="Simpan"
            isLoading={
              jadwalMutations.create.isPending ||
              jadwalMutations.update.isPending
            }
            onSubmitClick={() =>
              document.getElementById("kelas-jadwal-form")?.requestSubmit()
            }
          />
        }
      >
        <form id="kelas-jadwal-form" onSubmit={saveJadwal}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Select
              label="Shift *"
              placeholder="Pilih shift"
              options={shiftOptions}
              value={jadwalValues.shift_id}
              onChange={(e) =>
                setJadwalValues((prev) => ({
                  ...prev,
                  shift_id: e.target.value,
                }))
              }
              required
            />
            <Select
              label="Hari *"
              placeholder="Pilih hari"
              options={HARI_OPTIONS}
              value={jadwalValues.hari}
              onChange={(e) =>
                setJadwalValues((prev) => ({ ...prev, hari: e.target.value }))
              }
              required
            />
            <Select
              label="Ruang"
              placeholder="Pilih ruang"
              options={ruangOptions}
              value={jadwalValues.ruang_id}
              onChange={(e) =>
                setJadwalValues((prev) => ({
                  ...prev,
                  ruang_id: e.target.value,
                }))
              }
            />
          </div>
          <p className="mt-2 text-xs text-base-content/60">
            Jam otomatis mengikuti shift yang dipilih. Satu ruang tidak boleh
            dipakai dua jadwal pada hari dan jam yang sama.
          </p>
        </form>
      </Modal>

      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title={
          deleteTarget?.kind === "dosen"
            ? "Hapus Dosen Pengampu"
            : "Hapus Jadwal"
        }
        message={
          deleteTarget ? `Yakin ingin menghapus ${deleteTarget.label}?` : ""
        }
        onConfirm={confirmDelete}
        isLoading={
          dosenMutations.remove.isPending || jadwalMutations.remove.isPending
        }
      />
    </div>
  );
};
