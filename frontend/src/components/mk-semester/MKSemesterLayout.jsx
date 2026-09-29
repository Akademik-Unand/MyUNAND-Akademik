import { NavLink, useParams, useSearchParams } from "react-router-dom";
import { PageHeader } from "../common/PageHeader";
import { Card } from "../ui/Card";
import { ResourceSelect } from "../common/ResourceSelect";
import { useResourceItem } from "../../hooks/useResourceQuery";
import { PageSkeleton } from "../common/PageSkeleton";
import { mkKode, mkLabel } from "../../helpers/mkSemester";
import { semesterAkademikLabel } from "../../helpers/academicLabel";

export const MKSemesterLayout = ({
  children,
  action,
  semester,
  onSemesterChange,
}) => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const contextualSemester = searchParams.get("semester_id") || "";
  const semesterValue = contextualSemester || semester || "";
  const semesterQuery = useResourceItem("setting-semester", contextualSemester);
  const semesterSuffix = contextualSemester
    ? `?semester_id=${encodeURIComponent(contextualSemester)}`
    : "";
  const mkQuery = useResourceItem("matakuliah", id);
  const mk = mkQuery.data;

  if (mkQuery.isPending) return <PageSkeleton cards={2} />;

  const base = `/perkuliahan/mk-semester/${id}`;
  const tabs = [
    { id: "pengaturan", to: `${base}${semesterSuffix}`, label: "Pengaturan CPMK Semester" },
    { id: "evaluasi", to: `${base}/evaluasi${semesterSuffix}`, label: "Evaluasi CPMK Semester" },
    { id: "dokumen", to: `${base}/dokumen${semesterSuffix}`, label: "Dokumen Evaluasi" },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Kelola MK Semester"
        subtitle={`${mkLabel(mk)} (${mkKode(mk)})`}
        breadcrumbs={[
          { label: "Kurikulum & MK" },
          { label: "MK Semester", path: "/perkuliahan/mk-semester" },
          { label: mkKode(mk) || "MK" },
        ]}
        action={action}
      />

      <Card>
        {contextualSemester ? (
          <div>
            <p className="text-sm text-base-content/60">Semester</p>
            <p className="mt-1 font-medium">
              {semesterQuery.isPending ? "Memuat semester..." : semesterAkademikLabel(semesterQuery.data)}
            </p>
          </div>
        ) : (
          <ResourceSelect
            resource="setting-semester"
            label="Semester"
            size="sm"
            value={semesterValue}
            onChange={(e) => onSemesterChange?.(e.target.value)}
            getLabel={(row) =>
              `${row.jenisSemester?.nama || "Semester"} ${row.tahun}`
            }
          />
        )}
      </Card>

      <Card>
        <dl className="max-w-xl space-y-2 text-sm">
          <InfoRow label="Mata Kuliah" value={mkLabel(mk)} strong />
          <InfoRow label="Kode Mk" value={mkKode(mk)} />
          <InfoRow label="SKS" value={mk?.jumlah_sks_kurikulum} />
          <InfoRow label="Jenis semester" value={mk?.jenisSemester?.nama} />
        </dl>
      </Card>

      <div className="tabs tabs-box w-fit bg-base-200">
        {tabs.map((tab) => (
          <NavLink
            key={tab.id}
            to={tab.to}
            end={tab.id === "pengaturan"}
            className={({ isActive }) => `tab ${isActive ? "tab-active" : ""}`}
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      {children}
    </div>
  );
};

const InfoRow = ({ label, value, strong }) => (
  <div className="grid grid-cols-[8rem_1fr] gap-2">
    <dt className="text-base-content/60">{label}</dt>
    <dd>
      :{" "}
      {strong ? (
        <span className="font-medium">{value || "—"}</span>
      ) : (
        value || "—"
      )}
    </dd>
  </div>
);
