import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  BookOpen,
  BookPlus,
  BookOpenCheck,
  ClipboardCheck,
  ClipboardList,
  Clock,
  GraduationCap,
  Layers,
  ListChecks,
  UploadCloud,
} from "lucide-react";
import { PageHeader } from "../common/PageHeader";
import { StatCard } from "../common/StatCard";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { getProdiDashboardSummary } from "../../services/api";
import { semesterAkademikLabel } from "../../helpers/semesterProdi";
import { useOrganizationContext } from "../../contexts/OrganizationContext";

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

export const AdminProdiDashboard = () => {
  const navigate = useNavigate();
  const organization = useOrganizationContext();
  const { data, isPending } = useQuery({
    queryKey: ["dashboard", "prodi-summary"],
    queryFn: getProdiDashboardSummary,
  });

  const semesterProdi = data?.semesterProdi;
  const status = periodStatus(semesterProdi);
  const prodiLabel = organization.label || "Program Studi";

  if (isPending) return <DashboardSkeleton />;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Dashboard Admin Prodi"
        subtitle={`Ringkasan data dan aktivitas ${prodiLabel}`}
        breadcrumbs={[{ label: "Dashboard" }]}
        action={
          <Badge variant={status.variant} size="sm">
            {status.label}
          </Badge>
        }
      />

      {/* Semester Info */}
      {semesterProdi && (
        <Card title="Periode Akademik Berjalan" icon={Clock}>
          <div className="grid gap-3 md:grid-cols-4">
            <div>
              <p className="text-xs text-base-content/60">Semester</p>
              <p className="text-sm font-medium">
                {semesterAkademikLabel(semesterProdi.semester)}
              </p>
            </div>
            <div>
              <p className="text-xs text-base-content/60">KRS Mulai</p>
              <p className="text-sm font-medium">
                {formatDate(semesterProdi.tanggal_krs_mulai)}
              </p>
            </div>
            <div>
              <p className="text-xs text-base-content/60">KRS Selesai</p>
              <p className="text-sm font-medium">
                {formatDate(semesterProdi.tanggal_krs_selesai)}
              </p>
            </div>
            <div>
              <p className="text-xs text-base-content/60">Maksimal SKS</p>
              <p className="text-sm font-medium">
                {semesterProdi.sks_maksimal ?? "-"} SKS
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Mahasiswa"
          value={String(data?.mahasiswa ?? 0)}
          subtitle="Terdaftar di prodi"
          icon={GraduationCap}
        />
        <StatCard
          title="Dosen"
          value={String(data?.dosen ?? 0)}
          subtitle="Dosen prodi"
          icon={Award}
        />
        <StatCard
          title="Kelas Aktif"
          value={String(data?.kelas ?? 0)}
          subtitle="Kelas semester ini"
          icon={BookOpenCheck}
        />
        <StatCard
          title="KRS Menunggu"
          value={String(data?.krs_pending ?? 0)}
          subtitle="Belum disetujui"
          icon={ClipboardCheck}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        <QuickAction
          icon={ClipboardCheck}
          title="Persetujuan KRS"
          subtitle="Tinjau dan setujui KRS mahasiswa prodi Anda."
          action="Buka Persetujuan"
          onClick={() => navigate("/perkuliahan/persetujuan/krs")}
        />
        <QuickAction
          icon={ListChecks}
          title="Persetujuan Lintas Prodi"
          subtitle="Setujui pengajuan lintas prodi dari dosen PA."
          action="Buka Persetujuan"
          variant="secondary"
          onClick={() => navigate("/perkuliahan/persetujuan/lintas-prodi")}
        />
        <QuickAction
          icon={BookPlus}
          title="Penawaran MK Semester"
          subtitle="Kelola daftar mata kuliah yang ditawarkan semester ini."
          action="Lihat Penawaran"
          variant="outline"
          onClick={() => navigate("/perkuliahan/penawaran-mk")}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <QuickAction
          icon={Layers}
          title="Kurikulum & MK"
          subtitle="Kelola kurikulum, mata kuliah, dan CPMK prodi Anda."
          action="Kelola Kurikulum"
          onClick={() => navigate("/kurikulum/data")}
        />
        <QuickAction
          icon={UploadCloud}
          title="Upload Nilai"
          subtitle="Unggah dan kelola nilai mahasiswa per kelas."
          action="Buka Upload"
          variant="secondary"
          onClick={() => navigate("/perkuliahan/upload-nilai")}
        />
        <QuickAction
          icon={ClipboardList}
          title="Kelas Perkuliahan"
          subtitle="Kelola kelas, jadwal, dan dosen pengampu."
          action="Lihat Kelas"
          variant="outline"
          onClick={() => navigate("/perkuliahan/kelas")}
        />
      </div>
    </div>
  );
};
