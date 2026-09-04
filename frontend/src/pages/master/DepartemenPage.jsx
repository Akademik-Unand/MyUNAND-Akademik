import { MasterListPage } from '../../components/master/MasterListPage';
import { DepartemenForm } from '../../components/master/DepartemenForm';

export const DepartemenPage = () => (
  <MasterListPage
    title="Departemen"
    subtitle="Kelola data departemen pada SIAKAD Kurikulum"
    breadcrumbs={[{ label: 'Master Data' }, { label: 'Departemen' }]}
    subject="Departemen"
    resource="departemen"
    idKey="id"
    FormComponent={DepartemenForm}
    emptyForm={{
      kode_departemen: '',
      universitas_id: '',
      fakultas_id: '',
      nama_resmi: '',
      nama_singkat: '',
    }}
    rowKey={(row) => row.id}
    searchPlaceholder="Cari kode atau nama departemen..."
    columns={[
      { key: 'kode_departemen', header: 'Kode Departemen', sortable: true },
      {
        key: 'fakultas_id',
        header: 'Fakultas',
        sortable: true,
        render: (row) => row.fakultas?.nama_resmi || '—',
      },
      { key: 'nama_resmi', header: 'Nama Resmi Departemen', sortable: true },
      { key: 'nama_singkat', header: 'Nama Singkat', sortable: true },
    ]}
    detailItems={(row) => [
      { label: 'Kode', value: row.kode_departemen },
      { label: 'Fakultas', value: row.fakultas?.nama_resmi },
      { label: 'Nama resmi', value: row.nama_resmi },
      { label: 'Nama singkat', value: row.nama_singkat },
    ]}
  />
);
