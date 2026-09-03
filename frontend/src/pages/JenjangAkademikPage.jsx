import { MasterListPage } from '../components/master/MasterListPage';
import { JenjangForm } from '../components/master/JenjangForm';

export const JenjangAkademikPage = () => (
  <MasterListPage
    title="Jenjang Akademik"
    subtitle="Kelola data jenjang akademik pada SIAKAD Kurikulum"
    breadcrumbs={[{ label: 'Master Data' }, { label: 'Jenjang Akademik' }]}
    resource="jenjang-akademik"
    idKey="kode"
    FormComponent={JenjangForm}
    emptyForm={{ kode: '', nama: '' }}
    rowKey={(r) => r.kode}
    searchPlaceholder="Cari kode atau nama jenjang..."
    columns={[
      { key: 'kode', header: 'Kode Jenjang', sortable: true },
      { key: 'nama', header: 'Nama Jenjang', sortable: true },
    ]}
    detailItems={(d) => [
      { label: 'Kode', value: d.kode },
      { label: 'Nama', value: d.nama },
    ]}
  />
);
