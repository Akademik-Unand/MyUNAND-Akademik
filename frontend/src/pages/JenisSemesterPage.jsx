import { MasterListPage } from '../components/master/MasterListPage';
import { JenisSemesterForm } from '../components/master/JenisSemesterForm';
import { JENIS_SEMESTER } from '../constants/mockData';

export const JenisSemesterPage = () => (
  <MasterListPage
    title="Jenis Semester"
    subtitle="Kelola data jenis semester pada SIAKAD Kurikulum"
    breadcrumbs={[{ label: 'Master Data' }, { label: 'Semester' }, { label: 'Jenis Semester' }]}
    mockData={JENIS_SEMESTER}
    FormComponent={JenisSemesterForm}
    emptyForm={{ no: '', kategori: 'Reguler', periode: '', label: '', singkat: '' }}
    rowKey={(r) => String(r.no)}
    columns={[
      { key: 'no', header: 'No' },
      { key: 'kategori', header: 'Kategori' },
      { key: 'periode', header: 'Periode' },
      { key: 'label', header: 'Label' },
      { key: 'singkat', header: 'Label Singkat' },
    ]}
    detailItems={(d) => [
      { label: 'No', value: d.no },
      { label: 'Kategori', value: d.kategori },
      { label: 'Periode', value: d.periode },
      { label: 'Label', value: d.label },
      { label: 'Singkat', value: d.singkat },
    ]}
  />
);
