import { MasterListPage } from '../components/master/MasterListPage';
import { JenjangForm } from '../components/master/JenjangForm';
import { JENJANG_AKADEMIK } from '../constants/mockData';

export const JenjangAkademikPage = () => (
  <MasterListPage
    title="Jenjang Akademik"
    subtitle="Kelola data jenjang akademik pada SIAKAD Kurikulum"
    breadcrumbs={[{ label: 'Master Data' }, { label: 'Jenjang Akademik' }]}
    mockData={JENJANG_AKADEMIK}
    FormComponent={JenjangForm}
    emptyForm={{ kode: '', nama: '' }}
    rowKey={(r) => r.kode}
    tableCols={3}
    columns={[
      { key: 'kode', header: 'Kode Jenjang' },
      { key: 'nama', header: 'Nama Jenjang' },
    ]}
    detailItems={(d) => [
      { label: 'Kode', value: d.kode },
      { label: 'Nama', value: d.nama },
    ]}
  />
);
