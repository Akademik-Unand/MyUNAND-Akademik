import { MasterListPage } from "../../components/master/MasterListPage";
import { SemesterProdiForm } from "../../components/master/SemesterProdiForm";
import { Badge } from "../../components/ui/Badge";
import {
  programStudiLabel,
  prodiDepartemenLabel,
  semesterAkademikLabel,
} from "../../helpers/semesterProdi";
import { useResourceQuery } from "../../hooks/useResourceQuery";

const statusBadge = (is_aktif) =>
  is_aktif ? (
    <Badge variant="success" size="xs">
      Aktif
    </Badge>
  ) : (
    <Badge variant="ghost" size="xs">
      Nonaktif
    </Badge>
  );

export const SemesterProdiPage = () => {
  const { data: semesters = [] } = useResourceQuery("setting-semester");
  const activeSemester = semesters.find((row) => row.is_aktif);

  return (
    <MasterListPage
      title="Semester Prodi"
      subtitle="Pengaturan semester yang berjalan per program studi: jendela KRS, revisi, dan kuota SKS"
      breadcrumbs={[
        { label: "Master Data" },
        { label: "Semester" },
        { label: "Semester Prodi" },
      ]}
      subject="SemesterProdi"
      resource="semester-prodi"
      idKey="id"
      FormComponent={SemesterProdiForm}
      emptyForm={{
        program_studi_id: "",
        semester_id: "",
        is_aktif: false,
        tanggal_krs_mulai: "",
        tanggal_krs_selesai: "",
        tanggal_revisi_mulai: "",
        tanggal_revisi_selesai: "",
        sks_default: 15,
        sks_maksimal: 24,
      }}
      createDefaults={
        activeSemester ? { semester_id: activeSemester.id } : undefined
      }
      rowKey={(row) => row.id}
      searchPlaceholder="Cari program studi..."
      columns={[
        {
          key: "program_studi_id",
          header: "Program Studi",
          render: (row) => (
            <div>
              <p className="font-medium">
                {programStudiLabel(row.programStudi)}
              </p>
              {row.programStudi?.departemen && (
                <p className="text-xs text-base-content/60">
                  {prodiDepartemenLabel(row.programStudi)}
                </p>
              )}
            </div>
          ),
        },
        {
          key: "semester_id",
          header: "Semester",
          render: (row) => semesterAkademikLabel(row.semester),
        },
        {
          key: "is_aktif",
          header: "Status",
          sortable: true,
          render: (row) => statusBadge(row.is_aktif),
        },
        { key: "tanggal_krs_mulai", header: "KRS Mulai", sortable: true },
        { key: "tanggal_krs_selesai", header: "KRS Selesai", sortable: true },
        {
          key: "sks_default",
          header: "SKS",
          render: (row) =>
            row.sks_default || row.sks_maksimal
              ? `${row.sks_default ?? "—"}/${row.sks_maksimal ?? "—"}`
              : "—",
        },
      ]}
      detailItems={(row) => [
        {
          label: "Program Studi",
          value: prodiDepartemenLabel(row.programStudi),
        },
        {
          label: "Semester",
          value: row.semester?.is_aktif
            ? `${semesterAkademikLabel(row.semester)} (Aktif)`
            : semesterAkademikLabel(row.semester),
        },
        { label: "Status", value: row.is_aktif ? "Aktif" : "Nonaktif" },
        { label: "KRS mulai", value: row.tanggal_krs_mulai || "—" },
        { label: "KRS selesai", value: row.tanggal_krs_selesai || "—" },
        { label: "Revisi mulai", value: row.tanggal_revisi_mulai || "—" },
        { label: "Revisi selesai", value: row.tanggal_revisi_selesai || "—" },
        { label: "SKS default", value: row.sks_default ?? "—" },
        { label: "SKS maksimal", value: row.sks_maksimal ?? "—" },
      ]}
    />
  );
};
