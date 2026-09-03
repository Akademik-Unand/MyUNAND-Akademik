import { MasterListPage } from '../components/master/MasterListPage';
import { DepartemenForm } from '../components/master/DepartemenForm';
import { DEPARTEMEN } from '../constants/mockData';

export const DepartemenPage = () => (
  <MasterListPage
    title="Departemen"
    subtitle="Kelola data departemen pada SIAKAD Kurikulum"
    breadcrumbs={[{ label: 'Master Data' }, { label: 'Departemen' }]}
    mockData={DEPARTEMEN}
    FormComponent={DepartemenForm}
    emptyForm={{ kode: '', fakultas: '', nama: '', singkat: '' }}
    rowKey={(r) => r.kode}
    columns={[
      { key: 'kode', header: 'Kode Departemen' },
      { key: 'fakultas', header: 'Fakultas' },
      { key: 'nama', header: 'Nama Resmi Departemen' },
      { key: 'singkat', header: 'Nama Singkat' },
    ]}
    detailItems={(d) => [
      { label: 'Kode', value: d.kode },
      { label: 'Fakultas', value: d.fakultas },
      { label: 'Nama resmi', value: d.nama },
      { label: 'Nama singkat', value: d.singkat },
    ]}
  />
);
