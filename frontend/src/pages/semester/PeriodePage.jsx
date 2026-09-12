import { MasterListPage } from "../../components/master/MasterListPage";
import { PeriodeForm } from "../../components/master/PeriodeForm";
import { Badge } from "../../components/ui/Badge";
import { semesterAkademikLabel } from "../../helpers/academicLabel";
import {
  jenisPeriodeLabel,
  JENIS_PERIODE,
  validasiPeriode,
} from "../../helpers/academicPeriod";
import { krsPeriodStatus } from "../../helpers/krsPeriod";
import { useResourceQuery } from "../../hooks/useResourceQuery";

const PeriodBadge = ({ row }) => {
  const status = krsPeriodStatus(row);
  return (
    <Badge variant={status.variant} size="xs" outline>
      {status.label}
    </Badge>
  );
};

export const PeriodePage = () => {
  const { data: semesters = [] } = useResourceQuery("setting-semester");
  const activeSemester = semesters.find((row) => row.is_aktif);

  return (
    <MasterListPage
      title="Periode"
      subtitle="Jendela operasi CPMK, nilai, dan pengambilan KRS per semester"
      breadcrumbs={[
        { label: "Master Data" },
        { label: "Semester" },
        { label: "Periode" },
      ]}
      subject="Periode"
      resource="periode"
      idKey="id"
      FormComponent={PeriodeForm}
      emptyForm={{
        semester_id: "",
        jenis: "",
        tanggal_mulai: "",
        tanggal_selesai: "",
      }}
      createDefaults={
        activeSemester ? { semester_id: activeSemester.id } : undefined
      }
      validate={(values) =>
        validasiPeriode(
          values,
          semesters.find((row) => row.id === values.semester_id),
        )
      }
      rowKey={(row) => row.id}
      searchPlaceholder="Cari jenis periode..."
      columns={[
        {
          key: "semester_id",
          header: "Semester",
          sortable: true,
          render: (row) => (
            <div className="flex items-center gap-2">
              <span>{semesterAkademikLabel(row.semester)}</span>
              {row.semester?.is_aktif && (
                <Badge variant="success" size="xs">
                  Aktif
                </Badge>
              )}
            </div>
          ),
        },
        {
          key: "jenis",
          header: "Jenis",
          sortable: true,
          filter: {
            type: "select",
            options: [
              { value: JENIS_PERIODE.KRS, label: "KRS" },
              { value: JENIS_PERIODE.CPMK, label: "CPMK" },
              { value: JENIS_PERIODE.NILAI, label: "Nilai" },
            ],
          },
          render: (row) => jenisPeriodeLabel(row.jenis),
        },
        { key: "tanggal_mulai", header: "Mulai", sortable: true },
        { key: "tanggal_selesai", header: "Selesai", sortable: true },
        {
          key: "status",
          header: "Status",
          render: (row) => <PeriodBadge row={row} />,
        },
      ]}
      detailItems={(row) => [
        {
          label: "Semester",
          value: row.semester?.is_aktif
            ? `${semesterAkademikLabel(row.semester)} (Aktif)`
            : semesterAkademikLabel(row.semester),
        },
        { label: "Jenis", value: jenisPeriodeLabel(row.jenis) },
        { label: "Tanggal mulai", value: row.tanggal_mulai },
        { label: "Tanggal selesai", value: row.tanggal_selesai },
        { label: "Status", value: krsPeriodStatus(row).label },
      ]}
    />
  );
};
