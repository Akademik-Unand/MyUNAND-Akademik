import { MasterListPage } from "../../components/master/MasterListPage";
import { GedungForm } from "../../components/master/GedungForm";
export const GedungPage = () => (
  <MasterListPage
    title="Gedung"
    subtitle="Kelola gedung perkuliahan"
    breadcrumbs={[{ label: "Master Data" }, { label: "Gedung" }]}
    subject="Gedung"
    resource="gedung"
    idKey="id"
    FormComponent={GedungForm}
    emptyForm={{ kode: "", nama: "", alamat: "" }}
    rowKey={(row) => row.id}
    columns={[
      { key: "kode", header: "Kode", sortable: true },
      { key: "nama", header: "Nama Gedung", sortable: true },
      { key: "alamat", header: "Alamat" },
    ]}
    detailItems={(row) => [
      { label: "Kode", value: row.kode },
      { label: "Nama", value: row.nama },
      { label: "Alamat", value: row.alamat },
    ]}
  />
);
