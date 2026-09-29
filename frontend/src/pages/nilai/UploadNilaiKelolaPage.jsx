import { Link, useParams } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { PageSkeleton } from "../../components/common/PageSkeleton";
import { KelasInfoCard } from "../../components/kelas/KelasInfoCard";
import { KelasHub } from "../../components/kelas/KelasHub";
import { useResourceItem } from "../../hooks/useResourceQuery";
import { kelasDisplayName, kelasTitle } from "../../helpers/kelasInfo";
import { PeriodOperationNotice } from "../../components/common/PeriodOperationNotice";
import { findPeriode, JENIS_PERIODE } from "../../helpers/academicPeriod";
import { usePeriodes } from "../../hooks/usePeriodes";

export const UploadNilaiKelolaPage = () => {
  const { id } = useParams();
  const kelas = useResourceItem("kelas", id);
  const periodesQuery = usePeriodes();
  const title = kelasTitle(kelas.data);
  const display = kelasDisplayName(kelas.data);
  const nilaiPeriod = findPeriode(
    periodesQuery.data,
    kelas.data?.semester_id || kelas.data?.semester?.id,
    JENIS_PERIODE.NILAI,
  );

  if (kelas.isPending) return <PageSkeleton cards={2} />;

  return (
    <div className="space-y-4">
      <PageHeader
        title={display}
        subtitle={title}
        breadcrumbs={[
          { label: "Perkuliahan" },
          { label: "Upload Nilai", path: "/perkuliahan/upload-nilai" },
          { label: display },
        ]}
      />

      <PeriodOperationNotice
        period={nilaiPeriod}
        label="input nilai untuk semester kelas ini"
        isLoading={periodesQuery.isPending}
      />

      <KelasInfoCard kelas={kelas.data} />
      <KelasHub kelas={kelas.data} nilaiToolbar="upload" />

      <Link to="/perkuliahan/upload-nilai" className="btn btn-ghost btn-sm">
        Kembali
      </Link>
    </div>
  );
};
