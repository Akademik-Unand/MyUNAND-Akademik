import { useNavigate } from "react-router-dom";
import {
  Award,
  BookPlus,
  BookOpenCheck,
  Building2,
  ClipboardCheck,
  ClipboardList,
  GraduationCap,
  Landmark,
  Layers,
  UploadCloud,
} from "lucide-react";
import { PageHeader } from "../common/PageHeader";
import { StatCard } from "../common/StatCard";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { PeriodeAkademikCard } from "./PeriodeAkademikCard";
import { getOrganizationDashboard } from "../../services/dashboard.service";
import { useDashboardQuery } from "../../hooks/useDashboardQuery";
import { countBarChart, cplBarChart } from "../../helpers/dashboardChart";
import { DashboardChart } from "./DashboardChart";
import { krsPeriodStatus } from "../../helpers/krsPeriod";
import { isPrimaryPimpinan } from "../../helpers/navigation";
import { useOrganizationContext } from "../../contexts/OrganizationContext";
import { useAuthStore } from "../../store/auth.store";

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

/** Konfigurasi judul & subtitle per scope level */
const SCOPE_META = {
  prodi: {
    title: "Dashboard Admin Prodi",
    icon: GraduationCap,
    subtitle: (label) => `Ringkasan data dan aktivitas ${label}`,
  },
  departemen: {
    title: "Dashboard Admin Departemen",
    icon: Building2,
    subtitle: (label) => `Ringkasan data departemen ${label}`,
  },
  fakultas: {
    title: "Dashboard Admin Fakultas",
    icon: Landmark,
    subtitle: (label) => `Ringkasan data fakultas ${label}`,
  },
};

const PIMPINAN_TITLES = {
  prodi: "Dashboard Pimpinan Prodi",
  departemen: "Dashboard Pimpinan Departemen",
  fakultas: "Dashboard Pimpinan Fakultas",
};

/** Quick actions yang relevan per level */
const quickActionsForLevel = (level) => {
  const common = [
    {
      icon: ClipboardCheck,
      title: "Persetujuan KRS",
      subtitle: "Tinjau dan setujui KRS mahasiswa.",
      action: "Buka Persetujuan",
      path: "/perkuliahan/persetujuan/krs",
    },
    {
      icon: BookPlus,
      title: "Penawaran MK Semester",
      subtitle: "Kelola daftar mata kuliah yang ditawarkan.",
      action: "Lihat Penawaran",
      variant: "secondary",
      path: "/perkuliahan/penawaran-mk",
    },
    {
      icon: Layers,
      title: "Kurikulum & MK",
      subtitle: "Kelola kurikulum, mata kuliah, dan CPMK.",
      action: "Kelola Kurikulum",
      variant: "outline",
      path: "/kurikulum/data",
    },
  ];

  if (level === "prodi") {
    return [
      ...common,
      {
        icon: UploadCloud,
        title: "Upload Nilai",
        subtitle: "Unggah dan kelola nilai mahasiswa per kelas.",
        action: "Buka Upload",
        variant: "secondary",
        path: "/perkuliahan/upload-nilai",
      },
      {
        icon: ClipboardList,
        title: "Kelas Perkuliahan",
        subtitle: "Kelola kelas, jadwal, dan dosen pengampu.",
        action: "Lihat Kelas",
        variant: "outline",
        path: "/perkuliahan/kelas",
      },
    ];
  }

  // departemen / fakultas — lebih ke pengawasan
  return [
    ...common,
    {
      icon: ClipboardList,
      title: "Kelas Perkuliahan",
      subtitle: "Lihat kelas dan jadwal perkuliahan.",
      action: "Lihat Kelas",
      variant: "outline",
      path: "/perkuliahan/kelas",
    },
    {
      icon: UploadCloud,
      title: "Upload Nilai",
      subtitle: "Akses upload dan rekap nilai mahasiswa.",
      action: "Buka Upload",
      variant: "outline",
      path: "/perkuliahan/upload-nilai",
    },
  ];
};

export const AdminOrgDashboard = () => {
  const navigate = useNavigate();
  const organization = useOrganizationContext();
  const scopeLevel = organization.scopeLevel || "prodi";
  const user = useAuthStore((state) => state.user);

  const { data, isPending } = useDashboardQuery(
    "org-summary",
    getOrganizationDashboard,
  );

  const scope = SCOPE_META[scopeLevel] || SCOPE_META.prodi;
  const title = isPrimaryPimpinan(user)
    ? PIMPINAN_TITLES[scopeLevel] || PIMPINAN_TITLES.prodi
    : scope.title;
  const meta = { ...scope, title };
  const status = krsPeriodStatus(data?.periode);
  const unitLabel = organization.label || "Unit Organisasi";
  const actions = quickActionsForLevel(scopeLevel);

  if (isPending) return <DashboardSkeleton />;

  return (
    <div className="space-y-4">
      <PageHeader
        title={meta.title}
        subtitle={meta.subtitle(unitLabel)}
        breadcrumbs={[{ label: "Dashboard" }]}
        action={
          <Badge variant={status.variant} size="sm">
            {status.label}
          </Badge>
        }
      />

      {/* Jendela KRS & kuota SKS semester berjalan */}
      {data?.semester && (
        <PeriodeAkademikCard
          semester={data.semester}
          periode={data?.periode}
          sksMaksimal={data?.sks_maksimal}
        />
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Mahasiswa"
          value={String(data?.mahasiswa ?? 0)}
          subtitle="Terdaftar"
          icon={GraduationCap}
        />
        <StatCard
          title="Dosen"
          value={String(data?.dosen ?? 0)}
          subtitle="Dosen aktif"
          icon={Award}
        />
        <StatCard
          title="Kelas Aktif"
          value={String(data?.kelas ?? 0)}
          subtitle="Semester ini"
          icon={BookOpenCheck}
        />
        <StatCard
          title="KRS Menunggu"
          value={String(data?.krs_pending ?? 0)}
          subtitle="Belum disetujui"
          icon={ClipboardCheck}
        />
      </div>

      <DashboardChart
        title={isPrimaryPimpinan(user) ? "Capaian CPL Semester Aktif" : "Mahasiswa per Program Studi"}
        subtitle={isPrimaryPimpinan(user) ? "Rata-rata capaian dibanding target" : "Distribusi dalam scope organisasi"}
        config={isPrimaryPimpinan(user) ? cplBarChart(data?.cpl) : countBarChart(data?.prodi, "mahasiswa")}
      />

      {/* Quick Actions — 3 kolom pertama */}
      <div className="grid gap-4 lg:grid-cols-3">
        {actions.slice(0, 3).map((item) => (
          <QuickAction
            key={item.path}
            icon={item.icon}
            title={item.title}
            subtitle={item.subtitle}
            action={item.action}
            variant={item.variant}
            onClick={() => navigate(item.path)}
          />
        ))}
      </div>

      {/* Quick Actions — 3 kolom berikutnya */}
      {actions.length > 3 && (
        <div className="grid gap-4 lg:grid-cols-3">
          {actions.slice(3, 6).map((item) => (
            <QuickAction
              key={item.path}
              icon={item.icon}
              title={item.title}
              subtitle={item.subtitle}
              action={item.action}
              variant={item.variant}
              onClick={() => navigate(item.path)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
