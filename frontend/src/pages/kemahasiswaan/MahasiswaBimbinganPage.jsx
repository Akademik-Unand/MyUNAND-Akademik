import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, ClipboardList, Clock3, Users } from "lucide-react";
import { DashboardSkeleton } from "../../components/dashboard/DashboardSkeleton";
import { PageHeader } from "../../components/common/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useAuthStore } from "../../store/auth.store";
import { can } from "../../policies/defineAbility";
import { Badge } from "../../components/ui/Badge";
import { DataTable } from "../../components/common/DataTable";
import { StatCard } from "../../components/common/StatCard";
import { getDosenDashboardSummary } from "../../services/api";
import { semesterAkademikLabel } from "../../helpers/academicLabel";
import { unitLabel } from "../../helpers/bimbinganPa";

const krsStatus = (row) => {
  if (!row.krs) return { label: "Belum isi KRS", variant: "warning" };
  if (row.krs.approval_ke > 0)
    return { label: "KRS disetujui", variant: "success" };
  return { label: "Menunggu persetujuan", variant: "info" };
};

export const MahasiswaBimbinganPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const bolehKelolaPa = can(user, "create", "BimbinganAkademik");
  const summary = useQuery({
    queryKey: ["dashboard", "dosen-summary"],
    queryFn: getDosenDashboardSummary,
  });
  const data = summary.data;

  if (summary.isPending) return <DashboardSkeleton />;

  // Akun ber-role dosen yang belum tertaut ke baris dosen tidak punya bimbingan.
  if (summary.error) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Mahasiswa Bimbingan"
          subtitle="Daftar mahasiswa yang Anda bimbing beserta status KRS semester berjalan"
          breadcrumbs={[
            { label: "Kemahasiswaan" },
            { label: "Mahasiswa Bimbingan" },
          ]}
        />
        <Card>
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 shrink-0 text-warning" size={20} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-base-content">
                Daftar bimbingan belum tersedia
              </p>
              <p className="mt-1 text-sm text-base-content/70">
                {summary.error.message}
              </p>
              {bolehKelolaPa && (
                <p className="mt-2 text-xs text-base-content/60">
                  Halaman ini menampilkan bimbingan milik dosen yang sedang
                  login. Untuk mengelola penetapan dosen PA, gunakan halaman
                  Dosen PA.
                </p>
              )}
            </div>
            {bolehKelolaPa && (
              <Button
                size="sm"
                variant="secondary"
                className="ml-auto shrink-0"
                onClick={() => navigate("/kemahasiswaan/dosen-pa")}
              >
                Kelola Dosen PA
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

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
            {row.mahasiswa?.angkatan
              ? ` · Angkatan ${row.mahasiswa.angkatan}`
              : ""}
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
      header: "Semester",
      render: (row) => (
        <span className="text-sm">
          {semesterAkademikLabel(row.semester)}
        </span>
      ),
    },
    {
      key: "tahun_akademik",
      header: "Tahun PA",
      sortable: true,
      render: (row) => (
        <span className="text-sm">{row.tahun_akademik || "—"}</span>
      ),
    },
    {
      header: "Status KRS",
      render: (row) => {
        const status = krsStatus(row);
        return <Badge variant={status.variant}>{status.label}</Badge>;
      },
    },
    {
      header: "MK / SKS",
      render: (row) =>
        row.krs ? (
          <span className="text-sm">
            {row.krs.jumlah_mk} MK · {row.krs.total_sks} SKS
          </span>
        ) : (
          <span className="text-base-content/40">—</span>
        ),
    },
    {
      header: "Lintas Prodi",
      render: (row) =>
        row.krs?.cross_pending > 0 ? (
          // Pengajuan lintas prodi diputuskan bersamaan dengan persetujuan KRS.
          <Link to="/perkuliahan/persetujuan/krs">
            <Badge variant="warning">{row.krs.cross_pending} menunggu</Badge>
          </Link>
        ) : (
          <span className="text-base-content/40">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Mahasiswa Bimbingan"
        subtitle="Daftar mahasiswa yang Anda bimbing beserta status KRS semester berjalan"
        breadcrumbs={[
          { label: "Kemahasiswaan" },
          { label: "Mahasiswa Bimbingan" },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Mahasiswa Bimbingan"
          value={String(data?.mahasiswa_bimbingan ?? 0)}
          subtitle="Bimbingan aktif"
          icon={Users}
        />
        <StatCard
          title="Belum Isi KRS"
          value={String(data?.belum_isi_krs ?? 0)}
          subtitle="Semester berjalan"
          icon={ClipboardList}
        />
        <StatCard
          title="KRS Menunggu"
          value={String(data?.krs_menunggu ?? 0)}
          subtitle="Termasuk pengajuan lintas prodi"
          icon={Clock3}
        />
      </div>

      <Card title="Daftar Mahasiswa Bimbingan">
        <DataTable
          resource="bimbingan-saya"
          tableKey="bimbingan_saya_"
          columns={columns}
          rowKey={(row) => row.id}
          searchPlaceholder="Cari nama atau NIU mahasiswa..."
        />
      </Card>
    </div>
  );
};
