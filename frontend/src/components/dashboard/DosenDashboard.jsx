import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  BarChart3,
  BookOpenCheck,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  UploadCloud,
  Users,
} from "lucide-react";
import { PageHeader } from "../common/PageHeader";
import { StatCard } from "../common/StatCard";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { getLecturerDashboard } from "../../services/dashboard.service";
import { useDashboardQuery } from "../../hooks/useDashboardQuery";
import { statusDonutChart } from "../../helpers/dashboardChart";
import { DashboardChart } from "./DashboardChart";
import { semesterAkademikLabel } from "../../helpers/academicLabel";

const QuickAction = ({
  icon: Icon,
  title,
  subtitle,
  action,
  onClick,
  variant = "primary",
}) => (
  <Card className="h-full">
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-base-200 text-base-content/60">
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-base-content">{title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-base-content/70">
            {subtitle}
          </p>
        </div>
      </div>
      <div className="mt-auto">
        <Button
          size="sm"
          variant={variant}
          className="gap-1.5"
          onClick={onClick}
        >
          {action}
        </Button>
      </div>
    </div>
  </Card>
);

const SebaranAngkatan = ({ angkatan = [] }) => {
  if (!angkatan.length) {
    return (
      <p className="text-sm text-base-content/60">
        Belum ada mahasiswa bimbingan.
      </p>
    );
  }
  const terbanyak = Math.max(...angkatan.map((row) => row.jumlah), 1);
  return (
    <div className="space-y-3">
      {angkatan.map((row) => (
        <div
          key={row.angkatan ?? "tanpa-angkatan"}
          className="flex items-center gap-3"
        >
          <span className="w-28 shrink-0 text-xs text-base-content/60">
            {row.angkatan ? `Angkatan ${row.angkatan}` : "Tanpa angkatan"}
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-base-200">
            <div
              className="h-full rounded-full bg-primary"
              style={{
                width: `${Math.round((row.jumlah / terbanyak) * 100)}%`,
              }}
            />
          </div>
          <span className="w-8 shrink-0 text-right text-xs font-medium">
            {row.jumlah}
          </span>
        </div>
      ))}
    </div>
  );
};

/**
 * Dashboard dosen & dosen PA. Angka bimbingan berasal dari relasi PA milik dosen
 * yang sedang login, bukan agregat universitas.
 */
export const DosenDashboard = () => {
  const navigate = useNavigate();
  const { data, isPending, error } = useDashboardQuery(
    "dosen-summary",
    getLecturerDashboard,
  );

  if (isPending) return <DashboardSkeleton />;

  // Akun ber-role dosen yang belum tertaut ke baris dosen tidak punya bimbingan.
  if (error) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Dashboard Dosen"
          subtitle="Ringkasan bimbingan akademik dan tugas persetujuan"
          breadcrumbs={[{ label: "Dashboard" }]}
        />
        <Card>
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 shrink-0 text-warning" size={20} />
            <div>
              <p className="text-sm font-medium text-base-content">
                Ringkasan bimbingan belum tersedia
              </p>
              <p className="mt-1 text-sm text-base-content/70">
                {error.message}
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const total = data?.mahasiswa_bimbingan ?? 0;
  // Pengajuan lintas prodi ikut disetujui lewat persetujuan KRS, jadi tugas
  // menunggu cukup dihitung dari KRS yang belum disetujui.
  const menunggu = data?.krs_menunggu ?? 0;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Dashboard Dosen"
        subtitle="Ringkasan bimbingan akademik dan tugas persetujuan Anda"
        breadcrumbs={[{ label: "Dashboard" }]}
        action={
          data?.semester ? (
            <Badge variant="outline" size="sm">
              {semesterAkademikLabel(data.semester)} · maks{" "}
              {data?.sks_maksimal ?? "-"} SKS
            </Badge>
          ) : null
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Mahasiswa Bimbingan"
          value={String(total)}
          subtitle="PA aktif Anda"
          icon={Users}
        />
        <StatCard
          title="Belum Isi KRS"
          value={String(data?.belum_isi_krs ?? 0)}
          subtitle="Perlu diingatkan"
          icon={ClipboardList}
        />
        <StatCard
          title="KRS Menunggu"
          value={String(data?.krs_menunggu ?? 0)}
          subtitle="Butuh persetujuan Anda"
          icon={ClipboardCheck}
        />
      </div>

      {menunggu > 0 && (
        <Card>
          <div className="flex flex-wrap items-center gap-3">
            <Clock3 className="shrink-0 text-warning" size={20} />
            <p className="text-sm text-base-content/80">
              Ada{" "}
              <span className="font-semibold">{menunggu} tugas menunggu</span>{" "}
              dari mahasiswa bimbingan Anda.
            </p>
            <div className="ml-auto flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => navigate("/perkuliahan/persetujuan/krs")}
              >
                Tinjau KRS
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardChart title="Status KRS Bimbingan" subtitle="Status yang saling eksklusif pada semester aktif" config={statusDonutChart(data?.status_krs)} type="donut" />
        <Card title="Sebaran Angkatan Mahasiswa Bimbingan" icon={BarChart3}>
          <SebaranAngkatan angkatan={data?.angkatan} />
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickAction
          icon={Users}
          title="Mahasiswa Bimbingan"
          subtitle="Lihat daftar mahasiswa bimbingan beserta status KRS semester berjalan."
          action="Buka Bimbingan"
          onClick={() => navigate("/kemahasiswaan/mahasiswa-bimbingan")}
        />
        <QuickAction
          icon={ClipboardCheck}
          title="Persetujuan KRS"
          subtitle="Setujui KRS mahasiswa bimbingan — termasuk pengajuan mata kuliah lintas prodi di dalamnya."
          action="Tinjau KRS"
          variant="secondary"
          onClick={() => navigate("/perkuliahan/persetujuan/krs")}
        />
        <QuickAction
          icon={BookOpenCheck}
          title="Rekap Nilai CP"
          subtitle="Pantau capaian pembelajaran mahasiswa pada kelas yang Anda ampu."
          action="Lihat Rekap"
          variant="secondary"
          onClick={() => navigate("/perkuliahan/rekap-cp")}
        />
        <QuickAction
          icon={UploadCloud}
          title="Upload Nilai"
          subtitle="Unggah dan kelola nilai mahasiswa pada kelas yang Anda ampu."
          action="Buka Upload"
          variant="outline"
          onClick={() => navigate("/perkuliahan/upload-nilai")}
        />
      </div>
    </div>
  );
};
