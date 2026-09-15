import { PageHeader } from "../common/PageHeader";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { AcademicProgress } from "./AcademicProgress";
import { useDashboardQuery } from "../../hooks/useDashboardQuery";
import { getAcademicDashboard } from "../../services/dashboard.service";

export const ParentDashboard = () => {
  const { data, isPending, error, refetch } = useDashboardQuery("parent-academic-summary", getAcademicDashboard);
  if (isPending) return <DashboardSkeleton />;
  return (
    <div className="space-y-4">
      <PageHeader title="Dashboard Orang Tua" subtitle="Ringkasan akademik mahasiswa terkait, tanpa akses perubahan" breadcrumbs={[{ label: "Dashboard" }]} />
      {error ? (
        <button className="btn btn-outline btn-sm" onClick={() => refetch()}>Muat ulang ringkasan</button>
      ) : (
        <AcademicProgress data={data} readOnly />
      )}
    </div>
  );
};
