import { PageHeader } from "../../components/common/PageHeader";
import { ApprovalQueue } from "../../components/cross-enrollment/ApprovalQueue";
import { useApprovalDecisions } from "../../hooks/useCrossEnrollment";

export const PersetujuanPaPage = () => {
  const mutations = useApprovalDecisions();
  return (
    <div className="space-y-4">
      <PageHeader
        title="Persetujuan Lintas Program Studi"
        subtitle="Tinjau pengajuan mata kuliah lintas prodi dari mahasiswa bimbingan Anda"
        breadcrumbs={[
          { label: "Perkuliahan" },
          { label: "Persetujuan Dosen PA" },
        ]}
      />
      <ApprovalQueue
        resource="persetujuan-lintas-pa"
        statusFilter="pending_pa"
        title="Antrean Persetujuan"
        mutations={mutations}
      />
    </div>
  );
};
