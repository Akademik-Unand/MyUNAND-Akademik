import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "../../components/common/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { DataTable } from "../../components/common/DataTable";
import { Modal } from "../../components/ui/Modal";
import { FormActions } from "../../components/common/FormActions";
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
  ringkasHasilBulk,
  toggleAllIds,
  toggleId,
} from "../../helpers/bimbinganPa";
import { programStudiLabel } from "../../helpers/academicLabel";

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
  const academic = useAcademicFilter({ keys: FILTER_KEYS, applyImmediately: true });
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
  const [formValues, setFormValues] = useState(EMPTY_PA_FORM);

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkValues, setBulkValues] = useState(EMPTY_BULK_FORM);
  const [bulkSelected, setBulkSelected] = useState([]);
  const [bulkSearch, setBulkSearch] = useState("");
  const [bulkResult, setBulkResult] = useState(null);


  const candidatesQuery = useResourceQuery("bimbingan-candidates", {
    params: {
      limit: CANDIDATE_LIMIT,
      ...(extraFilter ? { filter: extraFilter } : {}),
    },
    enabled: bulkOpen,
  });

  const openCreate = () => {
    setFormValues(EMPTY_PA_FORM);
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
    const mahasiswaId = formValues.mahasiswa_id;
    if (!mahasiswaId || !formValues.dosen_id) return;
    await mutations.create.mutateAsync(
      payloadFrom(formValues, {
        mahasiswa_id: mahasiswaId,
        dosen_id: formValues.dosen_id,
      }),
    );
    setFormOpen(false);
    setFormValues(EMPTY_PA_FORM);
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
      key: "nama",
      header: "Dosen PA",
      render: (row) => (
        <div className="min-w-0">
          <p className="font-medium text-base-content">
            {row.nama || "—"}
          </p>
          <p className="text-xs text-base-content/60">
            {row.nip || "—"} {row.nidn ? `· ${row.nidn}` : ""}
          </p>
        </div>
      ),
    },
    {
      header: "Program Studi",
      render: (row) => programStudiLabel(row.programStudi),
    },
    {
      key: "jumlah_mahasiswa",
      header: "Mahasiswa Bimbingan",
      render: (row) => row.jumlah_mahasiswa || 0,
    },
    {
      key: "krs_menunggu",
      header: "KRS Menunggu",
      render: (row) => <Badge variant={row.krs_menunggu ? "warning" : "ghost"}>{row.krs_menunggu || 0}</Badge>,
    },
    {
      header: "Status Akun",
      render: (row) => (
        <span className={`badge badge-sm ${row.status_akun === "aktif" ? "badge-success" : row.status_akun === "nonaktif" ? "badge-ghost" : "badge-warning"}`}>
          {row.status_akun === "aktif" ? "Aktif" : row.status_akun === "nonaktif" ? "Nonaktif" : "Belum memiliki akun"}
        </span>
      ),
    },
    {
      header: "Aksi",
      className: "text-right",
      cellClassName: "text-right",
      render: (row) => <Link className="btn btn-ghost btn-xs" to={`/kemahasiswaan/dosen-pa/${row.id}`}>Lihat Detail</Link>,
    },
  ];

  const bulkRows = candidatesQuery.data || [];
  const bulkTruncated = bulkRows.length >= CANDIDATE_LIMIT;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Kelola Dosen PA"
        subtitle="Pantau Dosen PA, mahasiswa bimbingan, dan pengajuan KRS yang menunggu persetujuan"
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

      <Card title="Daftar Bimbingan Akademik">
        <DataTable
          resource="dosen-pa"
          tableKey="pa_"
          columns={columns}
          extraFilter={extraFilter}
          dataLocked={academic.locked}
          toolbarFilters={academic.fields}
          onApplyToolbarFilters={academic.apply}
          onResetToolbarFilters={academic.reset}
          toolbarFiltersDisabled={!academic.canApply}
          rowKey={(row) => row.id}
          searchPlaceholder="Cari nama, NIP, NIDN, atau email dosen..."
        />
      </Card>

      <Modal
        open={formOpen}
        onClose={closeForm}
        title="Tetapkan Dosen PA"
        subtitle="Untuk mahasiswa yang belum memiliki pembimbing akademik"
        closeOnBackdrop={!mutations.create.isPending}
        footer={
          <FormActions
            onCancel={closeForm}
            submitLabel="Tetapkan"
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
            mahasiswa={null}
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

    </div>
  );
};
