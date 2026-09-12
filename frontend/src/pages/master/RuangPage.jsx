import { MasterListPage } from "../../components/master/MasterListPage";
import { RuangForm } from "../../components/master/RuangForm";
export const RuangPage = () => (
  <MasterListPage
    title="Ruang"
    subtitle="Kelola ruang dan kapasitas per gedung"
    breadcrumbs={[{ label: "Master Data" }, { label: "Ruang" }]}
    subject="Ruang"
    resource="ruang"
    idKey="id"
    FormComponent={RuangForm}
    emptyForm={{ gedung_id: "", kode: "", nama: "", kapasitas: 0 }}
    rowKey={(row) => row.id}
    columns={[
      {
        key: "gedung_id",
        header: "Gedung",
        sortable: true,
        render: (row) => row.gedung?.nama || "—",
      },
      { key: "kode", header: "Kode", sortable: true },
      { key: "nama", header: "Nama Ruang", sortable: true },
      { key: "kapasitas", header: "Kapasitas", sortable: true },
    ]}
    detailItems={(row) => [
      { label: "Gedung", value: row.gedung?.nama },
      { label: "Kode", value: row.kode },
      { label: "Nama", value: row.nama },
      { label: "Kapasitas", value: row.kapasitas },
    ]}
  />
);
