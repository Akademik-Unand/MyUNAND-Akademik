import { MasterListPage } from '../components/master/MasterListPage';
import { FakultasForm } from '../components/master/FakultasForm';

export const FakultasPage = () => (
  <MasterListPage
    title="Fakultas"
    subtitle="Kelola data fakultas pada SIAKAD Kurikulum"
    breadcrumbs={[{ label: 'Master Data' }, { label: 'Fakultas' }]}
    resource="fakultas"
    idKey="kode"
    FormComponent={FakultasForm}
    emptyForm={{ kode: '', universitas: 'Universitas Andalas', nama: '', singkat: '' }}
    rowKey={(r) => r.kode}
    searchPlaceholder="Cari kode atau nama fakultas..."
    columns={[
      { key: 'kode', header: 'Kode Fakultas', sortable: true },
      { key: 'universitas', header: 'Universitas', sortable: true },
      { key: 'nama', header: 'Nama Resmi', sortable: true },
      { key: 'singkat', header: 'Nama Singkat', sortable: true },
    ]}
    detailItems={(d) => [
      { label: 'Kode', value: d.kode },
      { label: 'Universitas', value: d.universitas },
      { label: 'Nama resmi', value: d.nama },
      { label: 'Nama singkat', value: d.singkat },
    ]}
  />
);
