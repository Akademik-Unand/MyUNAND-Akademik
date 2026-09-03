import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { StackedBarOverview } from '../components/dashboard/StackedBarOverview';
import { DeadlineCard } from '../components/dashboard/DeadlineCard';
import { QuickActionCard } from '../components/dashboard/QuickActionCard';
import { ProjectProgressCard } from '../components/dashboard/ProjectProgressCard';
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton';
import { Button } from '../components/ui/Button';
import { Users, GraduationCap, BookOpen, Award, RefreshCw, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useMockQuery } from '../hooks/useMockQuery';

const DASHBOARD_READY = [{ ok: true }];

export const DashboardPage = () => {
  const { isLoading } = useMockQuery(DASHBOARD_READY, 450);

  const handleSync = () => {
    toast.success('Sinkronisasi berhasil', {
      description: 'Data kurikulum berhasil disinkronkan dengan SIAKAD.',
    });
  };

  const handleCreate = () => {
    toast.info('Fitur Input Data', {
      description: 'Silakan pilih menu pada sidebar untuk menginput data baru.',
    });
  };

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: 'Dashboard Admin' }]}
        action={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={handleSync}>
              <RefreshCw size={14} />
              <span>Sinkron Data</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="gap-1.5 text-xs font-semibold"
              onClick={handleCreate}
            >
              <PlusCircle size={15} />
              <span>Input Data Baru</span>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Mahasiswa"
          value="3.842"
          subtitle="Aktif Semester Ini"
          icon={Users}
          trend={{ value: '4.2%', isPositive: true }}
        />
        <StatCard
          title="Mata Kuliah Aktif"
          value="248"
          subtitle="Tersebar di 5 Departemen"
          icon={BookOpen}
        />
        <StatCard
          title="Dosen Pengampu"
          value="182"
          subtitle="Dosen FT Unand"
          icon={GraduationCap}
        />
        <StatCard
          title="Rerata Capaian CPL"
          value="82.4%"
          subtitle="Target OBE > 75%"
          icon={Award}
          trend={{ value: '2.1%', isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        <div className="xl:col-span-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DeadlineCard />
            <QuickActionCard />
          </div>
          <StackedBarOverview />
        </div>
        <div className="xl:col-span-4">
          <ProjectProgressCard />
        </div>
      </div>
    </div>
  );
};
