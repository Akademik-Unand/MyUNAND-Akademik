import { useMemo, useState } from "react";
import { UserPlus, Users, UserMinus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "../../components/common/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { FilterBar } from "../../components/common/FilterBar";
import { DataTable } from "../../components/common/DataTable";
import { Modal } from "../../components/ui/Modal";
import { FormActions } from "../../components/common/FormActions";
import { ConfirmDeleteModal } from "../../components/common/ConfirmDeleteModal";
import { IconButton } from "../../components/common/IconButton";
import { Can } from "../../components/auth/Can";
import { BimbinganSummaryCards } from "../../components/bimbingan/BimbinganSummaryCards";
import { TetapkanPaForm } from "../../components/bimbingan/TetapkanPaForm";
import { AssignPaBulkForm } from "../../components/bimbingan/AssignPaBulkForm";
import { useAcademicFilter } from "../../hooks/useAcademicFilter";
import {
  useBimbinganMutations,
  useBimbinganSummary,
} from "../../hooks/useBimbinganAkademik";
import { useResourceQuery } from "../../hooks/useResourceQuery";
import {
  PA_STATUS_OPTIONS,
  dosenLabel,
  mahasiswaLabel,
  paStatusLabel,
  paStatusVariant,
  ringkasHasilBulk,
  toggleAllIds,
  toggleId,
  unitLabel,
} from "../../helpers/bimbinganPa";

const FILTER_KEYS = ["fakultas", "departemen", "prodi"];
const CANDIDATE_LIMIT = 200;

const EMPTY_PA_FORM = {
  mahasiswa_id: "",
  dosen_id: "",
  tahun_akademik: "",
  catatan: "",
};
const EMPTY_BULK_FORM = { dosen_id: "", tahun_akademik: "", catatan: "" };

const payloadFrom = (values, extra = {}) => ({
  ...extra,
  tahun_akademik: values.tahun_akademik?.trim() || null,
  catatan: values.catatan?.trim() || null,
});

export const DosenPaPage = () => {
  const academic = useAcademicFilter({ keys: FILTER_KEYS });
  const extraFilter = academic.extraFilter;
  const summaryParams = useMemo(
    () => (extraFilter ? { filter: extraFilter } : undefined),
    [extraFilter],
  );

  const summary = useBimbinganSummary(summaryParams, {
    enabled: academic.locked,
  });
  const mutations = useBimbinganMutations();

  const [formOpen, setFormOpen] = useState(false);
  const [formMahasiswa, setFormMahasiswa] = useState(null);
  const [formValues, setFormValues] = useState(EMPTY_PA_FORM);

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkValues, setBulkValues] = useState(EMPTY_BULK_FORM);
  const [bulkSelected, setBulkSelected] = useState([]);
  const [bulkSearch, setBulkSearch] = useState("");
  const [bulkResult, setBulkResult] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const candidatesQuery = useResourceQuery("bimbingan-candidates", {
    params: {
      limit: CANDIDATE_LIMIT,
      ...(extraFilter ? { filter: extraFilter } : {}),
    },
    enabled: bulkOpen,
  });

  const openCreate = () => {
    setFormMahasiswa(null);
    setFormValues(EMPTY_PA_FORM);
    setFormOpen(true);
  };

  const openGanti = (row) => {
    setFormMahasiswa(row.mahasiswa || null);
    setFormValues({
      ...EMPTY_PA_FORM,
      mahasiswa_id: row.mahasiswa_id,
      dosen_id: "",
    });
    setFormOpen(true);
  };

  const openBulk = () => {
    setBulkValues(EMPTY_BULK_FORM);
    setBulkSelected([]);
    setBulkSearch("");
    setBulkResult(null);
    setBulkOpen(true);
  };

  const closeForm = () => {
    if (mutations.create.isPending) return;
    setFormOpen(false);
  };

  const submitForm = async (event) => {
    event.preventDefault();
    if (mutations.create.isPending) return;
    const mahasiswaId = formMahasiswa?.id || formValues.mahasiswa_id;
    if (!mahasiswaId || !formValues.dosen_id) return;
    await mutations.create.mutateAsync(
      payloadFrom(formValues, {
        mahasiswa_id: mahasiswaId,
        dosen_id: formValues.dosen_id,
      }),
    );
    setFormOpen(false);
    setFormValues(EMPTY_PA_FORM);
    setFormMahasiswa(null);
  };

  const submitBulk = async (event) => {
    event.preventDefault();
    if (
      mutations.assignBulk.isPending ||
      !bulkValues.dosen_id ||
      bulkSelected.length === 0
    )
      return;
    const hasil = await mutations.assignBulk.mutateAsync(
      payloadFrom(bulkValues, {
        dosen_id: bulkValues.dosen_id,
        mahasiswa_ids: bulkSelected,
      }),
    );
    toast.success(`Penetapan massal selesai: ${ringkasHasilBulk(hasil)}.`);
    setBulkResult(hasil);
    setBulkSelected([]);
  };

  const columns = [
    {
      key: "mahasiswa",
      header: "Mahasiswa",
      render: (row) => (
        <div className="min-w-0">
          <p className="font-medium text-base-content">
            {row.mahasiswa?.nama || "—"}
          </p>
          <p className="text-xs text-base-content/60">
            {row.mahasiswa?.niu || "—"}
          </p>
        </div>
      ),
    },
    {
      header: "Program Studi",
      render: (row) => (
        <span className="text-sm">{unitLabel(row.mahasiswa)}</span>
      ),
    },
    {
      header: "Dosen PA",
      render: (row) => (
        <div className="min-w-0">
          <p className="text-sm text-base-content">{row.dosen?.nama || "—"}</p>
          <p className="text-xs text-base-content/60">{unitLabel(row.dosen)}</p>
        </div>
      ),
    },
    {
      key: "tahun_akademik",
      header: "Tahun Akad.",
      sortable: true,
      render: (row) => row.tahun_akademik || "—",
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      filter: { type: "select", options: PA_STATUS_OPTIONS },
      render: (row) => (
        <Badge variant={paStatusVariant(row.status)}>
          {paStatusLabel(row.status)}
        </Badge>
      ),
    },
    {
      header: "Aksi",
      className: "text-right",
      cellClassName: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          {row.status === "aktif" && (
            <Can I="update" a="BimbinganAkademik">
              <IconButton
                label="Ganti dosen PA"
                icon={Users}
                tone="text-primary"
                onClick={() => openGanti(row)}
              />
            </Can>
          )}
          <Can I="delete" a="BimbinganAkademik">
            <IconButton
              label="Lepas dosen PA"
              icon={UserMinus}
              tone="text-error"
              onClick={() => setDeleteTarget(row)}
            />
          </Can>
        </div>
      ),
    },
  ];

  const bulkRows = candidatesQuery.data || [];
  const bulkTruncated = bulkRows.length >= CANDIDATE_LIMIT;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Kelola Dosen PA"
        subtitle="Tetapkan pembimbing akademik agar mahasiswa bisa mengambil KRS reguler maupun lintas prodi"
        breadcrumbs={[{ label: "Kemahasiswaan" }, { label: "Dosen PA" }]}
        action={
          <Can I="create" a="BimbinganAkademik">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={openBulk}
              >
                <Users size={15} /> Tetapkan Massal
              </Button>
              <Button size="sm" className="gap-1.5" onClick={openCreate}>
                <UserPlus size={15} /> Tetapkan PA
              </Button>
            </div>
          </Can>
        }
      />

      {academic.locked && (
        <BimbinganSummaryCards
          summary={summary.data}
          isLoading={summary.isPending}
        />
      )}

      <Card title="Filter">
        <FilterBar
          fields={academic.fields}
          onApply={academic.apply}
          onReset={academic.reset}
          applyDisabled={!academic.canApply}
        />
      </Card>

      <Card title="Daftar Bimbingan Akademik">
        <DataTable
          resource="bimbingan-akademik"
          tableKey="pa_"
          columns={columns}
          extraFilter={extraFilter}
          dataLocked={academic.locked}
          rowKey={(row) => row.id}
          searchPlaceholder="Cari nama/NIU mahasiswa atau nama dosen..."
        />
      </Card>

      <Modal
        open={formOpen}
        onClose={closeForm}
        title={formMahasiswa ? "Ganti Dosen PA" : "Tetapkan Dosen PA"}
        subtitle={
          formMahasiswa
            ? "PA sebelumnya otomatis ditutup sebagai selesai"
            : "Untuk mahasiswa yang belum punya pembimbing akademik"
        }
        closeOnBackdrop={!mutations.create.isPending}
        footer={
          <FormActions
            onCancel={closeForm}
            submitLabel={formMahasiswa ? "Ganti" : "Tetapkan"}
            isLoading={mutations.create.isPending}
            onSubmitClick={() =>
              document.getElementById("pa-form")?.requestSubmit()
            }
          />
        }
      >
        <form id="pa-form" onSubmit={submitForm}>
          <TetapkanPaForm
            values={formValues}
            onChange={setFormValues}
            mahasiswa={formMahasiswa}
          />
        </form>
      </Modal>

      <Modal
        open={bulkOpen}
        onClose={() => {
          if (mutations.assignBulk.isPending) return;
          setBulkOpen(false);
        }}
        title="Tetapkan Dosen PA Massal"
        subtitle="Satu dosen untuk banyak mahasiswa sekaligus"
        size="lg"
        closeOnBackdrop={!mutations.assignBulk.isPending}
        footer={
          bulkResult ? (
            <Button size="sm" onClick={() => setBulkOpen(false)}>
              Tutup
            </Button>
          ) : (
            <FormActions
              onCancel={() => setBulkOpen(false)}
              submitLabel={`Tetapkan (${bulkSelected.length})`}
              isLoading={mutations.assignBulk.isPending}
              onSubmitClick={() =>
                document.getElementById("pa-bulk-form")?.requestSubmit()
              }
            />
          )
        }
      >
        {bulkResult ? (
          <div className="space-y-3 text-sm">
            <p className="text-base-content">
              <span className="font-semibold">{bulkResult.ditetapkan}</span>{" "}
              mahasiswa kini dibimbing{" "}
              <span className="font-medium">{bulkResult.dosen?.nama}</span>.
              {bulkResult.ditutup > 0 &&
                ` ${bulkResult.ditutup} PA lama ditutup.`}
            </p>
            {bulkResult.dilewati?.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-base-content/60">
                  Dilewati ({bulkResult.dilewati.length})
                </p>
                <ul className="max-h-52 space-y-1 overflow-y-auto rounded-box border border-base-300 p-2 text-xs text-base-content/80">
                  {bulkResult.dilewati.map((row, idx) => (
                    <li key={`${row.mahasiswa_id}-${idx}`}>
                      <span className="font-medium">{row.nama}</span> —{" "}
                      {row.alasan}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <form id="pa-bulk-form" onSubmit={submitBulk}>
            <AssignPaBulkForm
              values={bulkValues}
              onChange={setBulkValues}
              rows={bulkRows}
              isLoading={candidatesQuery.isPending}
              dosenFilter={extraFilter}
              selectedIds={bulkSelected}
              onToggle={(id) => setBulkSelected((prev) => toggleId(prev, id))}
              onToggleAll={(rows) =>
                setBulkSelected((prev) => toggleAllIds(prev, rows))
              }
              search={bulkSearch}
              onSearchChange={setBulkSearch}
            />
            {bulkTruncated && (
              <p className="mt-2 text-xs text-warning">
                Menampilkan {CANDIDATE_LIMIT} mahasiswa pertama. Persempit
                filter unit untuk melihat sisanya.
              </p>
            )}
          </form>
        )}
      </Modal>

      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          await mutations.remove.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
        isLoading={mutations.remove.isPending}
        title="Lepas Dosen PA"
        message={
          deleteTarget
            ? `Lepas ${dosenLabel(deleteTarget.dosen)} dari ${mahasiswaLabel(deleteTarget.mahasiswa)}? Selama belum ditetapkan PA baru, mahasiswa ini tidak bisa mengambil KRS.`
            : ""
        }
      />
    </div>
  );
};
