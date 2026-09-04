import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { StackedBarOverview } from '../components/dashboard/StackedBarOverview';
import { QuickActionCard } from '../components/dashboard/QuickActionCard';
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton';
import { Button } from '../components/ui/Button';
import { Users, GraduationCap, BookOpen, Award, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '../services/api';

export const DashboardPage = () => {
  const { data, isPending } = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: getDashboardSummary,
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
