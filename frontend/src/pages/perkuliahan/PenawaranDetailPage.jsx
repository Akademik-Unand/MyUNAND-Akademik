import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, Check, CircleAlert, ClipboardCheck } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { Card } from "../../components/ui/Card";
import { DataTable } from "../../components/common/DataTable";
import { PageSkeleton } from "../../components/common/PageSkeleton";
import { useResourceItem } from "../../hooks/useResourceQuery";
import { semesterAkademikLabel, programStudiLabel } from "../../helpers/academicLabel";
import { kelasDosenNames } from "../../helpers/kelasInfo";
import {
  participantName,
  participantProgram,
} from "../../utils/crossEnrollment";
import { useCan } from "../../hooks/useCan";
import { useBulkOfferings } from "../../hooks/useBulkOfferings";
import { getOfferingReadiness } from "../../helpers/offeringReadiness";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { PeriodOperationNotice } from "../../components/common/PeriodOperationNotice";
import { findPeriode, isPeriodeOpen, JENIS_PERIODE } from "../../helpers/academicPeriod";
import { usePeriodes } from "../../hooks/usePeriodes";

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
  const can = useCan();
  const mutations = useBulkOfferings();
  const [reviewOpen, setReviewOpen] = useState(false);
  const query = useResourceItem("penawaran-matakuliah", id);
  const periodesQuery = usePeriodes();
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
  const prodi = programStudiLabel(offering.programStudi);
  const semester = semesterAkademikLabel(offering.semester);
  const readiness = getOfferingReadiness(offering);
  const krsPeriod = findPeriode(
    periodesQuery.data,
    offering.semester_id,
    JENIS_PERIODE.KRS,
  );
  const krsPeriodOpen = isPeriodeOpen(krsPeriod);
  const returnTo = `/perkuliahan/penawaran-mk/${id}`;
  const nextAction = readiness.results
    .map(({ detail, classes, issues, ready }) => {
      if (ready) return null;
      if (!classes.length) {
        const query = new URLSearchParams({
          semesterId: offering.semester_id,
          detailId: detail.id,
          returnTo,
        });
        return {
          label: `Tambah kelas ${detail.matakuliah?.kode_matakuliah || ""}`.trim(),
          to: `/perkuliahan/kelas?${query.toString()}`,
          permission: ["create", "Kelas"],
        };
      }
      const incomplete = classes.find(
        (kelas) =>
          !(kelas.dosenKelas || []).length ||
          !(kelas.jadwalKelas || []).some(
            (item) => item.hari && item.jam_mulai && item.jam_selesai,
          ),
      );
      const query = new URLSearchParams({ hub: "jadwal", returnTo });
      return {
        label: `Atur dosen & jadwal kelas ${incomplete?.nama || ""}`.trim(),
        to: `/perkuliahan/kelas/${incomplete?.id}?${query.toString()}`,
        permission: "kelas-setup",
        issues,
      };
    })
    .find(Boolean);

  const rows = details.map((detail) => ({
    id: detail.id,
    nama:
      detail.matakuliah?.nama_resmi ||
      detail.matakuliah?.kode_matakuliah ||
      "—",
    kode: detail.matakuliah?.kode_matakuliah || "—",
    sks: detail.matakuliah?.jumlah_sks_kurikulum,
    kapasitasTotal: detail.jumlah_peserta_max_default ?? 40,
    kuotaInternal: detail.jumlah_peserta_internal_max_default ?? 40,
    kuotaLintas: offering.akses === "internal" ? null : detail.kuota_lintas_prodi ?? 0,
    kelas: detail.kelas || [],
    readiness: getOfferingReadiness({ matakuliahDitawarkan: [detail] }).results[0],
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

      <PeriodOperationNotice
        period={krsPeriod}
        label="KRS untuk semester penawaran"
        isLoading={periodesQuery.isPending}
      />

      <Card>
        <dl className="max-w-xl space-y-2 text-sm">
          <InfoRow label="Program Studi" value={prodi} />
          <InfoRow label="Semester" value={semester} />
          <InfoRow label="Status" value={statusBadge(offering.status)} plain />
          <InfoRow
            label="Akses"
            value={
              offering.akses === "terpilih"
                ? "Program Studi Terpilih"
                : offering.akses === "internal"
                  ? "Prodi Penyelenggara"
                  : "Semua Program Studi"
            }
          />
          {offering.akses === "terpilih" && (
            <InfoRow
              label="Prodi Tujuan"
              value={(offering.prodiTujuan || [])
                .map((row) => row.programStudi?.nama_singkat || row.programStudi?.nama_resmi)
                .filter(Boolean)
                .join(", ") || "Belum dipilih"}
            />
          )}
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

      <Card title="Kesiapan Pembukaan KRS">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-medium">
              {readiness.ready ? "Siap dipublikasikan" : "Masih perlu persiapan"}
            </p>
            <p className="mt-1 text-sm text-base-content/60">
              Status dihitung dari kelas, dosen pengampu, dan jadwal tersimpan.
            </p>
          </div>
          {offering.status === "draft" && readiness.ready && can("publish", "PenawaranMatakuliah") ? (
            <Button
              size="sm"
              className="gap-2"
              disabled={!krsPeriodOpen || periodesQuery.isPending}
              title={!krsPeriodOpen ? "Publikasi penawaran hanya tersedia selama periode KRS semester ini." : undefined}
              onClick={() => setReviewOpen(true)}
            >
              <ClipboardCheck size={15} /> Review & Publish
            </Button>
          ) : nextAction && (
            nextAction.permission === "kelas-setup"
              ? can("create", "DosenKelas") || can("create", "JadwalKelas")
              : can(...nextAction.permission)
          ) ? (
            <Link to={nextAction.to} className="btn btn-primary btn-sm gap-2">
              {nextAction.label} <ArrowRight size={15} />
            </Link>
          ) : null}
        </div>
        <ul className="mt-4 space-y-2">
          {readiness.results.map(({ detail, classes, ready, issues }) => (
            <li key={detail.id} className="rounded-box bg-base-200/40 p-3">
              <div className="flex items-start gap-2">
                {ready ? <Check size={16} className="mt-0.5 text-success" /> : <CircleAlert size={16} className="mt-0.5 text-warning" />}
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{detail.matakuliah?.kode_matakuliah} — {detail.matakuliah?.nama_resmi}</p>
                  <p className="text-xs text-base-content/60">
                    {ready
                      ? `${classes.length} kelas siap; akses ${offering.akses === "internal" ? "prodi penyelenggara" : "lintas prodi sesuai kebijakan penawaran"}; kuota diatur pada mata kuliah dan tiap kelas.`
                      : issues.join(" · ")}
                  </p>
                  {!!classes.length && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {classes.map((kelas) => (
                        <Link
                          key={kelas.id}
                          className="link link-primary text-xs"
                          to={`/perkuliahan/kelas/${kelas.id}?hub=jadwal&returnTo=${encodeURIComponent(returnTo)}`}
                        >
                          Kelas {kelas.nama}: {kelasDosenNames(kelas) || "atur dosen"} · {(kelas.jadwalKelas || []).length ? "atur jadwal" : "tambah jadwal"}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
        {offering.status === "draft" && readiness.ready && !can("publish", "PenawaranMatakuliah") && (
          <p className="mt-3 text-sm text-base-content/60">
            Konfigurasi siap. Anda tidak memiliki izin untuk memublikasikan penawaran.
          </p>
        )}
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
            { key: "kapasitasTotal", header: "Total Awal/Kelas" },
            { key: "kuotaInternal", header: "Internal Awal/Kelas" },
            ...(offering.akses !== "internal" ? [{
              key: "kuotaLintas",
              header: "Kuota Lintas Prodi",
              render: (row) => row.kuotaLintas ?? "—",
            }] : []),
            {
              key: "kelas",
              header: "Kelas, Dosen & Jadwal",
              render: (row) => row.kelas.length
                ? row.kelas.map((kelas) => `${kelas.nama} — ${kelasDosenNames(kelas) || "dosen belum diatur"} — ${(kelas.jadwalKelas || []).length ? `${kelas.jadwalKelas.length} jadwal` : "jadwal belum diatur"}`).join("; ")
                : "Belum ada kelas",
            },
            {
              key: "statusKesiapan",
              header: "Kesiapan",
              render: (row) => <span className={`badge badge-sm ${row.readiness.ready ? "badge-success" : "badge-warning"}`}>{row.readiness.ready ? "Siap" : "Perlu tindakan"}</span>,
            },
            {
              key: "peserta",
              header: "Peserta",
              render: (row) => row.peserta || "—",
            },
          ]}
        />
      </Card>

      <Modal
        open={reviewOpen}
        onClose={() => !mutations.status.isPending && setReviewOpen(false)}
        title="Review & Publish Penawaran"
        subtitle={`${prodi || "—"} · ${semester}`}
        closeOnBackdrop={!mutations.status.isPending}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setReviewOpen(false)} disabled={mutations.status.isPending}>Periksa lagi</Button>
            <Button size="sm" disabled={!krsPeriodOpen} isLoading={mutations.status.isPending} onClick={async () => {
              await mutations.status.mutateAsync({ id, action: "publish" });
              setReviewOpen(false);
            }}>Publish Penawaran</Button>
          </div>
        }
      >
        <div className="space-y-3 text-sm">
          <p>Setelah dipublikasikan, penawaran tampil pada KRS mahasiswa yang sesuai target akses.</p>
          <p><strong>Target:</strong> {offering.akses === "internal" ? "Mahasiswa prodi penyelenggara" : offering.akses === "terpilih" ? (offering.prodiTujuan || []).map((row) => row.programStudi?.nama_singkat || row.programStudi?.nama_resmi).filter(Boolean).join(", ") : "Semua prodi sesuai kebijakan cross enrollment"}</p>
          <ul className="space-y-2">
            {details.map((detail) => (
              <li key={detail.id} className="rounded-box bg-base-200/50 p-3">
                <p className="font-medium">{detail.matakuliah?.kode_matakuliah} — {detail.matakuliah?.nama_resmi}</p>
                <p className="text-base-content/70">{(detail.kelas || []).map((kelas) => `Kelas ${kelas.nama}: ${kelasDosenNames(kelas)}; ${(kelas.jadwalKelas || []).map((jadwal) => `${jadwal.hari} ${String(jadwal.jam_mulai || "").slice(0,5)}-${String(jadwal.jam_selesai || "").slice(0,5)}`).join(", ")}`).join(" · ")}</p>
                <p className="text-base-content/70">Kuota awal per kelas: total {detail.jumlah_peserta_max_default ?? 40}, internal {detail.jumlah_peserta_internal_max_default ?? 40}, lintas {offering.akses === "internal" ? 0 : detail.kuota_lintas_prodi ?? 0} mahasiswa.</p>
              </li>
            ))}
          </ul>
        </div>
      </Modal>
    </div>
  );
};

const InfoRow = ({ label, value, plain }) => (
  <div className="grid grid-cols-[8rem_1fr] gap-2">
    <dt className="text-base-content/60">{label}</dt>
    <dd>{plain ? value : `: ${value || "—"}`}</dd>
  </div>
);
