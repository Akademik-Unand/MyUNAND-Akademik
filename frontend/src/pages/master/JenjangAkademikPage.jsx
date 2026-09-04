import { MasterListPage } from '../../components/master/MasterListPage';
import { JenjangForm } from '../../components/master/JenjangForm';

export const JenjangAkademikPage = () => (
  <MasterListPage
    title="Jenjang Akademik"
    subtitle="Kelola data jenjang akademik pada SIAKAD Kurikulum"
    breadcrumbs={[{ label: 'Master Data' }, { label: 'Jenjang Akademik' }]}
    resource="jenjang-akademik"
    idKey="id"
    FormComponent={JenjangForm}
    emptyForm={{ kode_jenjang: '', nama_jenjang: '' }}
    rowKey={(row) => row.id}
    searchPlaceholder="Cari kode atau nama jenjang..."
    columns={[
      { key: 'kode_jenjang', header: 'Kode Jenjang', sortable: true },
      { key: 'nama_jenjang', header: 'Nama Jenjang', sortable: true },
    ]}
    detailItems={(row) => [
      { label: 'Kode', value: row.kode_jenjang },
      { label: 'Nama', value: row.nama_jenjang },
    ]}
  />
);
