import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { PageHeader } from "../../components/common/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { PageSkeleton } from "../../components/common/PageSkeleton";
import { PeriodOperationNotice } from "../../components/common/PeriodOperationNotice";
import { AturCPMKSemesterForm } from "../../components/mk-semester/AturCPMKSemesterForm";
import {
  useResourceItem,
  useResourceQuery,
} from "../../hooks/useResourceQuery";
import {
  createResourceItem,
  deleteResourceItem,
  updateResourceItem,
} from "../../services/api";
import { mkKode, mkLabel } from "../../helpers/mkSemester";
import { MAX_MK_BOBOT } from "../../helpers/cpmkBobot";
import { assessmentSaveOperations, buildAssessmentMatrix, totalAssessmentWeight } from "../../helpers/assessmentMatrix";
import { useCpmkPeriodOpen } from "../../hooks/usePeriodes";
import { useCan } from "../../hooks/useCan";

export const AturCPMKSemesterPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const semesterId = searchParams.get("semester_id") || "";
  const mk = useResourceItem("matakuliah", id);
  const query = useResourceQuery("cpmk-semester", {
    params: id ? { filter: { matakuliah_id: id } } : {},
    enabled: Boolean(id),
  });
  const navigate = useNavigate();
  const items = useMemo(
    () => (query.data || []).map((row) => ({ ...row, sumberPenilaian: row.sumberPenilaian || [] })),
    [query.data],
  );
  const [matrixState, setMatrixState] = useState({ source: null, columns: [] });
  const columns = matrixState.source === query.data
    ? matrixState.columns
    : buildAssessmentMatrix(items);
  const setColumns = (next) => setMatrixState({ source: query.data, columns: next });
  const [saving, setSaving] = useState(false);
  const can = useCan();
  const cpmkPeriod = useCpmkPeriodOpen();
  const cpmkOpen = cpmkPeriod.open;
  const back = `/perkuliahan/mk-semester/${id}${semesterId ? `?semester_id=${encodeURIComponent(semesterId)}` : ""}`;
  const operations = useMemo(() => assessmentSaveOperations(items, columns), [items, columns]);
  const saveOperations = useMemo(() => {
    const previousWeights = new Map(items.flatMap((item) =>
      (item.sumberPenilaian || []).map((source) => [source.id, Number(source.bobot || 0)]),
    ));
    return [...operations].sort((left, right) => {
      const delta = (operation) => operation.type === "delete"
        ? Number.NEGATIVE_INFINITY
        : operation.type === "create"
          ? Number(operation.payload.bobot || 0)
          : Number(operation.payload.bobot || 0) - (previousWeights.get(operation.id) || 0);
      return delta(left) - delta(right);
    });
  }, [items, operations]);
  const totalBobot = totalAssessmentWeight(columns);
  const overMax = totalBobot > MAX_MK_BOBOT + 0.01;
  const missingPermissions = [...new Set(operations
    .filter((operation) => !can(operation.type, "SumberPenilaian"))
    .map((operation) => operation.type))];
  const hasUnnamedSelectedColumn = columns.some((column) =>
    Object.values(column.cells).some((cell) => cell.selected) && !column.nama.trim(),
  );

  const save = async () => {
    if (saving) return;
    if (hasUnnamedSelectedColumn) {
      toast.error("Isi nama komponen penilaian untuk setiap kolom yang dipetakan.");
      return;
    }
    if (overMax) {
      toast.error(`Total bobot komponen penilaian maksimal ${MAX_MK_BOBOT}%.`);
      return;
    }
    if (missingPermissions.length) {
      toast.error("Akun belum memiliki izin sumber penilaian: " + missingPermissions.join(", ") + ".");
      return;
    }
    setSaving(true);
    try {
      for (const operation of saveOperations) {
        if (operation.type === "create") {
          await createResourceItem("sumber-penilaian", operation.payload);
        } else if (operation.type === "update") {
          await updateResourceItem("sumber-penilaian", operation.id, operation.payload);
        } else {
          await deleteResourceItem("sumber-penilaian", operation.id);
        }
      }
      toast.success(operations.length ? "Pemetaan komponen penilaian berhasil disimpan." : "Tidak ada perubahan untuk disimpan.");
      navigate(back);
    } catch (err) {
      toast.error(err.message || "Gagal menyimpan CPMK semester");
    } finally {
      setSaving(false);
    }
  };

  if (mk.isPending || query.isPending)
    return <PageSkeleton showFilter={false} cards={3} />;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Atur CPMK Semester"
        subtitle={`${mkLabel(mk.data)} · ${mkKode(mk.data)}`}
        breadcrumbs={[
          { label: "Kurikulum & MK" },
          { label: "MK Semester", path: "/perkuliahan/mk-semester" },
          { label: mkKode(mk.data) || "MK", path: back },
          { label: "Atur CPMK" },
        ]}
      />

      <PeriodOperationNotice
        period={cpmkPeriod.period}
        label="CPMK dan sumber penilaian"
        isLoading={cpmkPeriod.isPending}
      />

      <Card title={`Sumber penilaian untuk ${mkLabel(mk.data)}`}>
        <AturCPMKSemesterForm items={items} columns={columns} onChange={setColumns} disabled={!cpmkOpen || cpmkPeriod.isPending || saving} />
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(back)}
            disabled={saving}
          >
            Batal
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setColumns(buildAssessmentMatrix(items))}
            disabled={saving}
          >
            Reset
          </Button>
          {cpmkOpen && (
            <Button
              size="sm"
              onClick={save}
              isLoading={saving}
              disabled={overMax || hasUnnamedSelectedColumn || missingPermissions.length > 0}
              title={missingPermissions.length ? "Perlu izin sumber penilaian: " + missingPermissions.join(", ") : undefined}
            >
              Simpan
            </Button>
          )}
        </div>
        {missingPermissions.length > 0 && (
          <p className="mt-3 text-right text-xs text-warning">
            Perubahan ini memerlukan izin sumber penilaian: {missingPermissions.join(", ")}. Minta admin memperbarui akses role.
          </p>
        )}
      </Card>
    </div>
  );
};
