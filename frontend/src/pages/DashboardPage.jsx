import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { StackedBarOverview } from '../components/dashboard/StackedBarOverview';
import { QuickActionCard } from '../components/dashboard/QuickActionCard';
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton';
import { Button } from '../components/ui/Button';
import { Users, GraduationCap, BookOpen, Award, RefreshCw, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { useBusyAction } from '../hooks/useBusyAction';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const DashboardPage = () => {
  const { busy, runMock } = useBusyAction();
  const { isPending } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => wait(450).then(() => true),
  });

  const handleSync = () =>
    runMock(() => {
      toast.success('Sinkronisasi berhasil', {
        description: 'Data kurikulum berhasil disinkronkan dengan SIAKAD.',
      });
    });

  const handleCreate = () => {
    toast.info('Fitur Input Data', {
      description: 'Silakan pilih menu pada sidebar untuk menginput data baru.',
    });
  };

  if (isPending) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Admin"
        subtitle="Ringkasan capaian kurikulum dan perkuliahan semester berjalan"
        breadcrumbs={[{ label: 'Dashboard' }]}
        action={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={handleSync} isLoading={busy}>
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

      <StackedBarOverview />
      <QuickActionCard />
    </div>
  );
};
