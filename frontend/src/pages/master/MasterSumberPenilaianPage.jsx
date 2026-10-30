import { MasterListPage } from "../../components/master/MasterListPage";
import { MasterSumberPenilaianForm } from "../../components/master/MasterSumberPenilaianForm";

export const MasterSumberPenilaianPage = () => (
  <MasterListPage
    title="Sumber Penilaian"
    subtitle="Kelola data master sumber penilaian standar pada SIAKAD Kurikulum"
    breadcrumbs={[{ label: "Master Data" }, { label: "Sumber Penilaian" }]}
    subject="SumberPenilaian"
    resource="master-sumber-penilaian"
    idKey="id"
    FormComponent={MasterSumberPenilaianForm}
    emptyForm={{
      kode: "",
      nama: "",
      deskripsi: "",
    }}
    rowKey={(row) => row.id}
    searchPlaceholder="Cari kode atau nama sumber penilaian..."
    columns={[
      { key: "kode", header: "Kode", sortable: true },
      { key: "nama", header: "Nama Sumber Penilaian", sortable: true },
      {
        key: "deskripsi",
        header: "Keterangan",
        render: (row) => row.deskripsi || "—",
      },
    ]}
    detailItems={(row) => [
      { label: "Kode", value: row.kode },
      { label: "Nama Sumber Penilaian", value: row.nama },
      { label: "Keterangan", value: row.deskripsi || "—" },
    ]}
  />
);
