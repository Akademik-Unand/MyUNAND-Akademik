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
  PlusCircle,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "../components/common/PageHeader";
import { StatCard } from "../components/common/StatCard";
import { AdminOrgDashboard } from "../components/dashboard/AdminOrgDashboard";
import { DosenDashboard } from "../components/dashboard/DosenDashboard";
import { StackedBarOverview } from "../components/dashboard/StackedBarOverview";
import { QuickActionCard } from "../components/dashboard/QuickActionCard";
import { DashboardSkeleton } from "../components/dashboard/DashboardSkeleton";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { useAuthStore } from "../store/auth.store";
import { isPrimaryDosen, isPrimaryMahasiswa } from "../helpers/navigation";
import { isScopedRole } from "../contexts/OrganizationContext";
import { getDashboardSummary } from "../services/api";
import { getStudentKrsContext } from "../services/krs.service";
import { semesterAkademikLabel } from "../helpers/semesterProdi";

const today = () => new Date().toISOString().slice(0, 10);

const periodStatus = (semesterProdi) => {
  if (
    !semesterProdi?.tanggal_krs_mulai ||
    !semesterProdi?.tanggal_krs_selesai
  ) {
    return { label: "Belum diatur", variant: "ghost" };
  }
  const current = today();
  if (current < semesterProdi.tanggal_krs_mulai)
    return { label: "Belum dibuka", variant: "warning" };
  if (current > semesterProdi.tanggal_krs_selesai)
    return { label: "Ditutup", variant: "error" };
  return { label: "Sedang dibuka", variant: "success" };
};

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(
        new Date(value),
      )
    : "-";

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

  const semesterProdi = contextQuery.data?.semesterProdi;
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
  const status = periodStatus(semesterProdi);
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

      <Card title="Periode Pengambilan KRS" icon={Clock3}>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <p className="text-xs text-base-content/60">Semester</p>
            <p className="text-sm font-medium">
              {semesterProdi
                ? semesterAkademikLabel(semesterProdi.semester)
                : "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-base-content/60">Mulai</p>
            <p className="text-sm font-medium">
              {formatDate(semesterProdi?.tanggal_krs_mulai)}
            </p>
          </div>
          <div>
            <p className="text-xs text-base-content/60">Selesai</p>
            <p className="text-sm font-medium">
              {formatDate(semesterProdi?.tanggal_krs_selesai)}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total SKS"
          value={String(totalSks)}
          subtitle={`Maksimal ${semesterProdi?.sks_maksimal ?? "-"} SKS`}
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
  const { data, isPending } = useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: getDashboardSummary,
  });

  const handleCreate = () => {
    toast.info("Fitur Input Data", {
      description: "Silakan pilih menu pada sidebar untuk menginput data baru.",
    });
  };

  if (isPending) return <DashboardSkeleton />;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Dashboard Admin"
        subtitle="Ringkasan capaian kurikulum dan perkuliahan semester berjalan"
        breadcrumbs={[{ label: "Dashboard" }]}
        action={
          <Button
            variant="primary"
            size="sm"
            className="gap-1.5 text-xs font-semibold"
            onClick={handleCreate}
          >
            <PlusCircle size={15} />
            <span>Input Data Baru</span>
          </Button>
        }
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

      <StackedBarOverview />
      <QuickActionCard />
    </div>
  );
};

export const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);
  if (isPrimaryMahasiswa(user)) return <StudentDashboard />;
  if (isPrimaryDosen(user)) return <DosenDashboard />;
  if (isScopedRole(user)) return <AdminOrgDashboard />;
  return <AdminDashboard />;
};
