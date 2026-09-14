import { MasterListPage } from "../../components/master/MasterListPage";
import { DosenForm } from "../../components/master/DosenForm";
import { FilterBar } from "../../components/common/FilterBar";
import { Card } from "../../components/ui/Card";
import { useAcademicFilter } from "../../hooks/useAcademicFilter";
import { programStudiLabel } from "../../helpers/academicLabel";

const emptyForm = {
  nip: "",
  program_studi_id: "",
  nama: "",
  nidn: "",
  nip_lama: "",
  nip_baru: "",
};

export const DosenPage = () => {
  const academic = useAcademicFilter({
    keys: ["fakultas", "departemen", "prodi"],
  });

  return (
    <MasterListPage
      title="Dosen"
      subtitle="Kelola data dosen berdasarkan program studi"
      breadcrumbs={[{ label: "Master Data" }, { label: "Dosen" }]}
      subject="Dosen"
      resource="dosen"
      idKey="id"
      FormComponent={DosenForm}
      emptyForm={emptyForm}
      createDefaults={{ program_studi_id: academic.applied.prodiId || "" }}
      extraFilter={academic.extraFilter}
      dataLocked={academic.locked}
      beforeTable={
        <Card title="Filter Dosen">
          <FilterBar
            fields={academic.fields}
            onApply={academic.apply}
            onReset={academic.reset}
            applyDisabled={!academic.canApply}
          />
        </Card>
      }
      rowKey={(row) => row.id}
      columns={[
        {
          key: "program_studi_id",
          header: "Program Studi",
          sortable: true,
          render: (row) => programStudiLabel(row.programStudi),
        },
        { key: "nip", header: "NIP", sortable: true },
        { key: "nama", header: "Nama", sortable: true },
        { key: "nidn", header: "NIDN", sortable: true },
      ]}
      detailItems={(row) => [
        { label: "Program Studi", value: programStudiLabel(row.programStudi, "") },
        { label: "NIP", value: row.nip },
        { label: "Nama", value: row.nama },
        { label: "NIDN", value: row.nidn },
        { label: "NIP Lama", value: row.nip_lama },
        { label: "NIP Baru", value: row.nip_baru },
      ]}
    />
  );
};
