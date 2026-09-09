import { PageHeader } from '../../components/common/PageHeader';
import { ApprovalQueue } from '../../components/cross-enrollment/ApprovalQueue';
import { useApprovalDecisions } from '../../hooks/useCrossEnrollment';
export const PersetujuanHostPage = () => { const mutations = useApprovalDecisions('host'); return <div className="space-y-4"><PageHeader title="Persetujuan Prodi Penyelenggara" subtitle="Tinjau mahasiswa dari program studi lain yang mendaftar" breadcrumbs={[{ label: 'Semester & Perkuliahan' }, { label: 'Persetujuan Penyelenggara' }]} /><ApprovalQueue resource="persetujuan-lintas-host" statusFilter="pending_host" title="Antrean Persetujuan" mutations={mutations} /></div>; };
