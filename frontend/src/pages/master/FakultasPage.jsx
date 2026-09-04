import { MasterListPage } from '../../components/master/MasterListPage';
import { FakultasForm } from '../../components/master/FakultasForm';

export const FakultasPage = () => (
  <MasterListPage
    title="Fakultas"
    subtitle="Kelola data fakultas pada SIAKAD Kurikulum"
    breadcrumbs={[{ label: 'Master Data' }, { label: 'Fakultas' }]}
    subject="Fakultas"
    resource="fakultas"
    idKey="id"
    FormComponent={FakultasForm}
    emptyForm={{ kode_fakultas: '', universitas_id: '', nama_resmi: '', nama_singkat: '' }}
    rowKey={(row) => row.id}
    searchPlaceholder="Cari kode atau nama fakultas..."
    columns={[
      { key: 'kode_fakultas', header: 'Kode Fakultas', sortable: true },
      {
        key: 'universitas_id',
        header: 'Universitas',
        sortable: true,
        render: (row) => row.universitas?.nama_resmi || '—',
      },
      { key: 'nama_resmi', header: 'Nama Resmi', sortable: true },
      { key: 'nama_singkat', header: 'Nama Singkat', sortable: true },
    ]}
    detailItems={(row) => [
      { label: 'Kode', value: row.kode_fakultas },
      { label: 'Universitas', value: row.universitas?.nama_resmi },
      { label: 'Nama resmi', value: row.nama_resmi },
      { label: 'Nama singkat', value: row.nama_singkat },
    ]}
  />
);
