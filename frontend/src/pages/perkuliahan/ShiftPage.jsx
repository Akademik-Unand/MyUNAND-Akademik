import { MasterListPage } from "../../components/master/MasterListPage";
import { ShiftForm } from "../../components/master/ShiftForm";
import { FilterBar } from "../../components/common/FilterBar";
import { Card } from "../../components/ui/Card";
import { useAcademicFilter } from "../../hooks/useAcademicFilter";

const formatJam = (value) => (value ? String(value).slice(0, 5) : "");

export const ShiftPage = () => {
  const academic = useAcademicFilter({ keys: ["fakultas"] });

  return (
    <MasterListPage
      title="Shift Jadwal"
      subtitle="Slot waktu standar per fakultas — dipakai saat mengisi jadwal kelas"
      breadcrumbs={[{ label: "Perkuliahan" }, { label: "Shift Jadwal" }]}
      subject="Shift"
      resource="shift"
      idKey="id"
      FormComponent={ShiftForm}
      emptyForm={{ fakultas_id: "", kode: "", jam_mulai: "", jam_selesai: "" }}
      createDefaults={
        academic.applied.fakultasId
          ? { fakultas_id: academic.applied.fakultasId }
          : undefined
      }
      extraFilter={academic.extraFilter}
      dataLocked={academic.locked}
      beforeTable={
        <Card title="Filter Shift">
          <FilterBar
            fields={academic.fields}
            onApply={academic.apply}
            onReset={academic.reset}
            applyDisabled={!academic.canApply}
          />
        </Card>
      }
      rowKey={(row) => row.id}
      searchPlaceholder="Cari shift..."
      columns={[
        {
          key: "kode",
          header: "Kode",
          sortable: true,
          cellClassName: "font-semibold",
        },
        {
          key: "jam_mulai",
          header: "Jam Mulai",
          render: (row) => formatJam(row.jam_mulai) || "—",
        },
        {
          key: "jam_selesai",
          header: "Jam Selesai",
          render: (row) => formatJam(row.jam_selesai) || "—",
        },
        {
          key: "fakultas_id",
          header: "Fakultas",
          render: (row) =>
            row.fakultas?.nama_resmi || row.fakultas?.nama_singkat || "—",
        },
      ]}
      detailItems={(row) => [
        { label: "Kode", value: row.kode },
        {
          label: "Jam",
          value: `${formatJam(row.jam_mulai)}–${formatJam(row.jam_selesai)}`,
        },
        {
          label: "Fakultas",
          value: row.fakultas?.nama_resmi || row.fakultas?.nama_singkat || "—",
        },
      ]}
    />
  );
};
