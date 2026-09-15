import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  BookOpen,
  BookOpenCheck,
  ClipboardList,
  Clock3,
  GraduationCap,
  LibraryBig,
  Users,
} from "lucide-react";
import { PageHeader } from "../components/common/PageHeader";
import { StatCard } from "../components/common/StatCard";
import { AdminOrgDashboard } from "../components/dashboard/AdminOrgDashboard";
import { DosenDashboard } from "../components/dashboard/DosenDashboard";
import { QuickActionCard } from "../components/dashboard/QuickActionCard";
import { DashboardSkeleton } from "../components/dashboard/DashboardSkeleton";
import { PeriodeAkademikCard } from "../components/dashboard/PeriodeAkademikCard";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { useAuthStore } from "../store/auth.store";
import { isPrimaryDosen, isPrimaryMahasiswa } from "../helpers/navigation";
import { isScopedRole } from "../contexts/OrganizationContext";
import { getUniversityDashboard, getAcademicDashboard } from "../services/dashboard.service";
import { useDashboardQuery } from "../hooks/useDashboardQuery";
import {
  countBarChart,
  krsParticipationRadialChart,
  statusDonutChart,
  trendLineChart,
} from "../helpers/dashboardChart";
import { AcademicProgress } from "../components/dashboard/AcademicProgress";
import { DashboardChart } from "../components/dashboard/DashboardChart";
import { ParentDashboard } from "../components/dashboard/ParentDashboard";
import { getStudentKrsContext } from "../services/krs.service";
import { krsPeriodStatus } from "../helpers/krsPeriod";

const StudentAction = ({
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

const StudentDashboard = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const contextQuery = useQuery({
    queryKey: ["krs", "student-context", user?.id],
    queryFn: getStudentKrsContext,
    enabled: Boolean(user?.id),
  });
  const academicQuery = useDashboardQuery("academic-summary", getAcademicDashboard);

  const semester = contextQuery.data?.semester;
  const periode = contextQuery.data?.periode;
  const currentKrs = contextQuery.data?.krs;

  const items = currentKrs?.krsDetil || [];
  const regularCount = items.filter((row) => !row.is_cross_enrollment).length;
  const crossItems = items.filter((row) => row.is_cross_enrollment);
  const approvedCross = crossItems.filter(
    (row) => row.cross_enrollment_status === "approved",
  ).length;
  const pendingCross = crossItems.filter(
    (row) => row.cross_enrollment_status === "pending_pa",
  ).length;
  const totalSks = items.reduce(
    (sum, row) => sum + (row.kelas?.matakuliah?.jumlah_sks_kurikulum || 0),
    0,
  );
  const status = krsPeriodStatus(periode);
  const isLoading = contextQuery.isPending;

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Dashboard Mahasiswa"
        subtitle="Ringkasan pengambilan kelas dan pengajuan KRS semester berjalan"
        breadcrumbs={[{ label: "Dashboard" }]}
        action={
          <Badge variant={status.variant} size="sm">
            {status.label}
          </Badge>
        }
      />

      <PeriodeAkademikCard
        title="Periode Pengambilan KRS"
        semester={semester}
        periode={periode}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total SKS"
          value={String(totalSks)}
          subtitle={`Maksimal ${contextQuery.data?.sks_maksimal ?? "-"} SKS`}
          icon={BookOpenCheck}
        />
        <StatCard
          title="Kelas Reguler"
          value={String(regularCount)}
          subtitle="Masuk KRS semester ini"
          icon={ClipboardList}
        />
        <StatCard
          title="Lintas Disetujui"
          value={String(approvedCross)}
          subtitle="Pengajuan lintas prodi"
          icon={LibraryBig}
        />
        <StatCard
          title="Menunggu PA"
          value={String(pendingCross)}
          subtitle="Butuh keputusan dosen PA"
          icon={Clock3}
        />
      </div>

      <AcademicProgress data={academicQuery.data} />

      <div className="grid gap-4 lg:grid-cols-3">
        <StudentAction
          icon={ClipboardList}
          title="Pengambilan KRS"
          subtitle="Pilih kelas yang dibuka prodi untuk semester aktif."
          action="Buka KRS"
          onClick={() => navigate("/krs/pengambilan")}
        />
        <StudentAction
          icon={LibraryBig}
          title="Katalog Lintas Prodi"
          subtitle="Lihat mata kuliah lintas prodi beserta CPMK dan Sub-CPMK."
          action="Lihat Katalog"
          variant="secondary"
          onClick={() => navigate("/mahasiswa/katalog-lintas-prodi")}
        />
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { data, isPending } = useDashboardQuery(
    "summary",
    getUniversityDashboard,
  );

  if (isPending) return <DashboardSkeleton />;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Dashboard Admin"
        subtitle="Ringkasan capaian kurikulum dan perkuliahan semester berjalan"
        breadcrumbs={[{ label: "Dashboard" }]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Mahasiswa"
          value={String(data?.mahasiswa ?? 0)}
          subtitle="Data aktif di sistem"
          icon={Users}
        />
        <StatCard
          title="Mata Kuliah"
          value={String(data?.matakuliah ?? 0)}
          subtitle="Terdaftar di kurikulum"
          icon={BookOpen}
        />
        <StatCard
          title="Dosen"
          value={String(data?.dosen ?? 0)}
          subtitle="Dosen terdaftar"
          icon={GraduationCap}
        />
        <StatCard
          title="Kelas"
          value={String(data?.kelas ?? 0)}
          subtitle="Kelas perkuliahan"
          icon={Award}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <DashboardChart
            title="Sebaran Mahasiswa per Fakultas"
            subtitle="Jumlah mahasiswa aktif berdasarkan fakultas"
            config={countBarChart(
              data?.fakultas?.filter((row) => Number(row.mahasiswa) > 0),
              "mahasiswa",
            )}
            height={320}
          />
        </div>
        <DashboardChart
          title="Status KRS Semester Aktif"
          subtitle="Disetujui, menunggu, dan belum mengisi"
          config={statusDonutChart(data?.status_krs)}
          type="donut"
          height={320}
        />
        <DashboardChart
          title="Partisipasi KRS"
          subtitle="Persentase mahasiswa yang sudah mengisi KRS semester aktif"
          config={krsParticipationRadialChart(data?.status_krs)}
          type="radialBar"
          height={300}
        />
        <div className="xl:col-span-2">
          <DashboardChart
            title="Tren Aktivitas Akademik"
            subtitle="Mahasiswa aktif dan peserta KRS per semester"
            config={trendLineChart(data?.tren_akademik)}
            type="line"
            height={300}
          />
        </div>
      </div>
      <QuickActionCard />
    </div>
  );
};

export const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);
  const roleNames = new Set([user?.role, ...(user?.roles || []).map((role) => role.name)]);
  if (isPrimaryMahasiswa(user)) return <StudentDashboard />;
  if (roleNames.has("orang-tua")) return <ParentDashboard />;
  if (isPrimaryDosen(user)) return <DosenDashboard />;
  if (isScopedRole(user)) return <AdminOrgDashboard />;
  return <AdminDashboard />;
};
