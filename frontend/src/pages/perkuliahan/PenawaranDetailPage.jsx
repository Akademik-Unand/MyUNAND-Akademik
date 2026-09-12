import { Link, useParams } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { Card } from "../../components/ui/Card";
import { DataTable } from "../../components/common/DataTable";
import { PageSkeleton } from "../../components/common/PageSkeleton";
import { useResourceItem } from "../../hooks/useResourceQuery";
import { semesterAkademikLabel } from "../../helpers/academicLabel";
import { kelasDosenNames } from "../../helpers/kelasInfo";
import {
  participantName,
  participantProgram,
} from "../../utils/crossEnrollment";

const statusBadge = (status) => {
  const map = {
    draft: "badge-ghost",
    published: "badge-success",
    closed: "badge-warning",
  };
  return (
    <span className={`badge badge-sm ${map[status] || "badge-ghost"}`}>
      {status || "draft"}
    </span>
  );
};

export const PenawaranDetailPage = () => {
  const { id } = useParams();
  const query = useResourceItem("penawaran-matakuliah", id);
  const offering = query.data;

  if (query.isPending) return <PageSkeleton cards={2} />;
  if (!offering) {
    return (
      <Card title="Detail Penawaran MK Semester">
        <p className="text-sm text-base-content/60">
          Penawaran tidak ditemukan.
        </p>
        <Link
          to="/perkuliahan/penawaran-mk"
          className="btn btn-ghost btn-sm mt-4"
        >
          Kembali
        </Link>
      </Card>
    );
  }

  const details = offering.matakuliahDitawarkan || [];
  const kelasList = details.flatMap((detail) => detail.kelas || []);
  const pesertaRows = kelasList.flatMap((kelas) => kelas.krsDetil || []);
  const jumlahPeserta = pesertaRows.length;
  const prodi = offering.programStudi?.nama_resmi;
  const semester = semesterAkademikLabel(offering.semester);

  const rows = details.map((detail) => ({
    id: detail.id,
    nama:
      detail.matakuliah?.nama_resmi ||
      detail.matakuliah?.kode_matakuliah ||
      "—",
    kode: detail.matakuliah?.kode_matakuliah || "—",
    sks: detail.matakuliah?.jumlah_sks_kurikulum,
    kapasitas: detail.kuota_lintas_prodi ?? offering.kuota_lintas_prodi_default,
    kelas:
      (detail.kelas || [])
        .map((kelas) => `${kelas.nama}: ${kelasDosenNames(kelas)}`)
        .join("; ") || "—",
    peserta: (detail.kelas || []).reduce(
      (sum, kelas) => sum + (kelas.krsDetil || []).length,
      0,
    ),
  }));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Detail Penawaran MK Semester"
        subtitle={`${prodi || "—"} · ${semester} · ${details.length} mata kuliah`}
        breadcrumbs={[
          { label: "Perkuliahan" },
          { label: "Penawaran MK Semester", path: "/perkuliahan/penawaran-mk" },
          { label: "Detail" },
        ]}
        action={
          <Link to="/perkuliahan/penawaran-mk" className="btn btn-ghost btn-sm">
            Kembali
          </Link>
        }
      />

      <Card>
        <dl className="max-w-xl space-y-2 text-sm">
          <InfoRow label="Program Studi" value={prodi} />
          <InfoRow label="Semester" value={semester} />
          <InfoRow label="Status" value={statusBadge(offering.status)} plain />
          <InfoRow
            label="Kapasitas Lintas"
            value={offering.kuota_lintas_prodi_default ?? "—"}
          />
          <InfoRow
            label="Akses"
            value={
              offering.akses === "terpilih"
                ? "Program Studi Terpilih"
                : "Semua Program Studi"
            }
          />
          <InfoRow label="Jumlah Peserta" value={jumlahPeserta || "—"} />
          <InfoRow
            label="Peserta"
            value={
              pesertaRows.length
                ? pesertaRows
                    .map(
                      (row) =>
                        `${participantName(row)} — ${participantProgram(row)}`,
                    )
                    .join(", ")
                : "—"
            }
          />
        </dl>
      </Card>

      <Card title="Mata Kuliah yang Ditawarkan">
        <DataTable
          data={rows}
          tableKey="offering_detail_"
          rowKey={(row) => row.id}
          searchableFields={["nama", "kode"]}
          searchPlaceholder="Cari mata kuliah..."
          emptyText="Belum ada mata kuliah pada penawaran ini."
          columns={[
            { key: "nama", header: "Mata Kuliah" },
            { key: "kode", header: "Kode" },
            { key: "sks", header: "SKS", render: (row) => row.sks ?? "—" },
            {
              key: "kapasitas",
              header: "Kapasitas Lintas",
              render: (row) => row.kapasitas ?? "—",
            },
            { key: "kelas", header: "Kelas & Dosen" },
            {
              key: "peserta",
              header: "Peserta",
              render: (row) => row.peserta || "—",
            },
          ]}
        />
      </Card>
    </div>
  );
};

const InfoRow = ({ label, value, plain }) => (
  <div className="grid grid-cols-[8rem_1fr] gap-2">
    <dt className="text-base-content/60">{label}</dt>
    <dd>{plain ? value : `: ${value || "—"}`}</dd>
  </div>
);
