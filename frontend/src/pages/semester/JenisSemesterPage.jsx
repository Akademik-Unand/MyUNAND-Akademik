import { MasterListPage } from '../../components/master/MasterListPage';
import { JenisSemesterForm } from '../../components/master/JenisSemesterForm';

export const JenisSemesterPage = () => (
  <MasterListPage
    title="Jenis Semester"
    subtitle="Kelola data jenis semester pada SIAKAD Kurikulum"
    breadcrumbs={[{ label: 'Master Data' }, { label: 'Semester' }, { label: 'Jenis Semester' }]}
    subject="JenisSemester"
    resource="jenis-semester"
    idKey="id"
    FormComponent={JenisSemesterForm}
    emptyForm={{ nama: '', alias: '', urut: 0 }}
    rowKey={(row) => row.id}
    searchPlaceholder="Cari nama atau alias semester..."
    columns={[
      { key: 'nama', header: 'Nama', sortable: true },
      { key: 'alias', header: 'Alias', sortable: true },
      { key: 'urut', header: 'Urutan', sortable: true },
    ]}
    detailItems={(row) => [
      { label: 'Nama', value: row.nama },
      { label: 'Alias', value: row.alias },
      { label: 'Urutan', value: row.urut },
    ]}
  />
);
