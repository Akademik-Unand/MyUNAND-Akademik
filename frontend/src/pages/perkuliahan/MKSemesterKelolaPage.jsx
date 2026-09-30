import { Link, useParams, useSearchParams } from "react-router-dom";
import { MKSemesterLayout } from "../../components/mk-semester/MKSemesterLayout";
import { CPMKSemesterTable } from "../../components/mk-semester/CPMKSemesterTable";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { PageSkeleton } from "../../components/common/PageSkeleton";
import { PeriodOperationNotice } from "../../components/common/PeriodOperationNotice";
import { Can } from "../../components/auth/Can";
import { useResourceQuery } from "../../hooks/useResourceQuery";
import { useCpmkPeriodOpen } from "../../hooks/usePeriodes";

export const MKSemesterKelolaPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const contextualSemester = searchParams.get("semester_id") || "";
  const query = useResourceQuery("cpmk-semester", {
    params: id ? { filter: { matakuliah_id: id } } : {},
    enabled: Boolean(id),
  });
  const cpmkPeriod = useCpmkPeriodOpen();
  const cpmkOpen = cpmkPeriod.open;

  if (query.isPending) return <PageSkeleton showFilter={false} tableCols={4} />;

  return (
    <MKSemesterLayout>
      <PeriodOperationNotice
        period={cpmkPeriod.period}
        label="CPMK dan sumber penilaian"
        isLoading={cpmkPeriod.isPending}
      />
      <Card
        title="Pengaturan CPMK Semester"
        actions={
          <div className="flex flex-wrap gap-2">
            <Can I="read" a="Cpmk">
              <Link to={`/kurikulum/cpmk/${id}`}>
                <Button variant="secondary" size="sm">
                  Lihat Master CPMK Kurikulum
                </Button>
              </Link>
            </Can>
            <Can I="update" a="Cpmk">
              <Link to={`/perkuliahan/mk-semester/${id}/atur${contextualSemester ? `?semester_id=${encodeURIComponent(contextualSemester)}` : ""}`}>
                <Button size="sm">
                  {cpmkOpen ? "Atur Sumber Penilaian" : "Lihat Sumber Penilaian"}
                </Button>
              </Link>
            </Can>
          </div>
        }
      >
        <CPMKSemesterTable items={query.data ?? []} />
        <p className="mt-3 text-xs text-base-content/60">
          Sumber penilaian diatur melalui tombol Atur CPMK Semester ini selama
          periode CPMK sedang dibuka.
        </p>
        <Link
          to="/perkuliahan/mk-semester"
          className="btn btn-ghost btn-sm mt-4"
        >
          Kembali
        </Link>
      </Card>
    </MKSemesterLayout>
  );
};
