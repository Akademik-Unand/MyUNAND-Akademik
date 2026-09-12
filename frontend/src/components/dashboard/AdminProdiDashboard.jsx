import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  BookPlus,
  BookOpenCheck,
  ClipboardCheck,
  ClipboardList,
  GraduationCap,
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
import { getProdiDashboardSummary } from "../../services/api";
import { krsPeriodStatus } from "../../helpers/krsPeriod";
import { useOrganizationContext } from "../../contexts/OrganizationContext";

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

  const status = krsPeriodStatus(data?.periode);
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
          subtitle="Tinjau dan setujui KRS mahasiswa prodi Anda — termasuk pengajuan mata kuliah lintas prodi."
          action="Buka Persetujuan"
          onClick={() => navigate("/perkuliahan/persetujuan/krs")}
        />
        <QuickAction
          icon={BookPlus}
          title="Penawaran MK Semester"
          subtitle="Kelola daftar mata kuliah yang ditawarkan semester ini."
          action="Lihat Penawaran"
          variant="secondary"
          onClick={() => navigate("/perkuliahan/penawaran-mk")}
        />
        <QuickAction
          icon={Layers}
          title="Kurikulum & MK"
          subtitle="Kelola kurikulum, mata kuliah, dan CPMK prodi Anda."
          action="Kelola Kurikulum"
          variant="outline"
          onClick={() => navigate("/kurikulum/data")}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
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
