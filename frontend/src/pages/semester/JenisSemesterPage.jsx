import { MasterListPage } from '../../components/master/MasterListPage';
import { JenisSemesterForm } from '../../components/master/JenisSemesterForm';

export const JenisSemesterPage = () => (
  <MasterListPage
    title="Jenis Semester"
    subtitle="Kelola data jenis semester pada SIAKAD Kurikulum"
    breadcrumbs={[{ label: 'Master Data' }, { label: 'Semester' }, { label: 'Jenis Semester' }]}
    resource="jenis-semester"
    idKey="no"
    FormComponent={JenisSemesterForm}
    emptyForm={{ no: '', kategori: 'Reguler', periode: '', label: '', singkat: '' }}
    rowKey={(r) => String(r.no)}
    searchPlaceholder="Cari periode atau label semester..."
    columns={[
      { key: 'no', header: 'No', sortable: true },
      {
        key: 'kategori',
        header: 'Kategori',
        sortable: true,
        filter: { type: 'select', options: ['Reguler', 'Non Reguler'] },
      },
      {
        key: 'periode',
        header: 'Periode',
        sortable: true,
        filter: { type: 'select', options: ['Semester I', 'Semester II'] },
      },
      { key: 'label', header: 'Label', sortable: true },
      { key: 'singkat', header: 'Label Singkat', sortable: true },
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
