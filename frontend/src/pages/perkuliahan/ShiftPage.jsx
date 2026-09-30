import { MasterListPage } from "../../components/master/MasterListPage";
import { ShiftForm } from "../../components/master/ShiftForm";
import { useAcademicFilter } from "../../hooks/useAcademicFilter";

const formatJam = (value) => (value ? String(value).slice(0, 5) : "");

export const ShiftPage = () => {
  return (
    <MasterListPage
      title="Shift Jadwal"
      subtitle="Slot waktu standar Universitas — dipakai saat mengisi jadwal kelas"
      breadcrumbs={[{ label: "Perkuliahan" }, { label: "Shift Jadwal" }]}
      subject="Shift"
      resource="shift"
      idKey="id"
      FormComponent={ShiftForm}
      emptyForm={{ sistem_sks: "2 SKS", kode: "", jam_mulai: "", jam_selesai: "" }}
      rowKey={(row) => row.id}
      searchPlaceholder="Cari shift..."
      columns={[
        {
          key: "sistem_sks",
          header: "Sistem SKS",
          sortable: true,
          cellClassName: "font-medium",
        },
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
      ]}
      detailItems={(row) => [
        { label: "Sistem SKS", value: row.sistem_sks },
        { label: "Kode", value: row.kode },
        {
          label: "Jam",
          value: `${formatJam(row.jam_mulai)}–${formatJam(row.jam_selesai)}`,
        },
      ]}
    />
  );
};
