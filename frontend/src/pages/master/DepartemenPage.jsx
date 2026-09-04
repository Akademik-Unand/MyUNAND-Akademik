import { MasterListPage } from '../../components/master/MasterListPage';
import { DepartemenForm } from '../../components/master/DepartemenForm';

export const DepartemenPage = () => (
  <MasterListPage
    title="Departemen"
    subtitle="Kelola data departemen pada SIAKAD Kurikulum"
    breadcrumbs={[{ label: 'Master Data' }, { label: 'Departemen' }]}
    resource="departemen"
    idKey="kode"
    FormComponent={DepartemenForm}
    emptyForm={{ kode: '', fakultas: '', nama: '', singkat: '' }}
    rowKey={(r) => r.kode}
    searchPlaceholder="Cari kode atau nama departemen..."
    columns={[
      { key: 'kode', header: 'Kode Departemen', sortable: true },
      {
        key: 'fakultas',
        header: 'Fakultas',
        sortable: true,
        filter: { type: 'select', options: ['Fakultas Teknik', 'Fakultas Ekonomi'] },
      },
      { key: 'nama', header: 'Nama Resmi Departemen', sortable: true },
      { key: 'singkat', header: 'Nama Singkat', sortable: true },
    ]}
    detailItems={(d) => [
      { label: 'Kode', value: d.kode },
      { label: 'Fakultas', value: d.fakultas },
      { label: 'Nama resmi', value: d.nama },
      { label: 'Nama singkat', value: d.singkat },
    ]}
  />
);
