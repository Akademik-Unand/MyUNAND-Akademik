import { Link, useParams, useSearchParams } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { PageSkeleton } from "../../components/common/PageSkeleton";
import { KelasInfoCard } from "../../components/kelas/KelasInfoCard";
import { KelasHub } from "../../components/kelas/KelasHub";
import { useResourceItem } from "../../hooks/useResourceQuery";
import { kelasTitle } from "../../helpers/kelasInfo";

export const KelasKelolaPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const kelas = useResourceItem("kelas", id);
  const title = kelasTitle(kelas.data);

  if (kelas.isPending) return <PageSkeleton cards={2} />;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Kelola Kelas"
        subtitle={title}
        breadcrumbs={[
          { label: "Perkuliahan" },
          { label: "Kelas", path: "/perkuliahan/kelas" },
          { label: title },
        ]}
      />

      <KelasInfoCard kelas={kelas.data} />
      <KelasHub kelas={kelas.data} />

      <Link to={returnTo || "/perkuliahan/kelas"} className="btn btn-ghost btn-sm">
        {returnTo ? "Kembali ke Penawaran" : "Kembali"}
      </Link>
    </div>
  );
};
