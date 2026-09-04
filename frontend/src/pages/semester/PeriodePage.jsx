import { MasterListPage } from '../../components/master/MasterListPage';
import { PeriodeForm } from '../../components/master/PeriodeForm';
import { semesterAkademikLabel } from '../../helpers/semesterProdi';
import { jenisPeriodeLabel } from '../../helpers/academicPeriod';

export const PeriodePage = () => (
  <MasterListPage
    title="Periode"
    subtitle="Jendela operasi CPMK dan nilai per semester"
    breadcrumbs={[{ label: 'Master Data' }, { label: 'Semester' }, { label: 'Periode' }]}
    subject="Periode"
    resource="periode"
    idKey="id"
    FormComponent={PeriodeForm}
    emptyForm={{ semester_id: '', jenis: '', tanggal_mulai: '', tanggal_selesai: '' }}
    rowKey={(row) => row.id}
    searchPlaceholder="Cari jenis periode..."
    columns={[
      {
        key: 'semester_id',
        header: 'Semester',
        sortable: true,
        render: (row) => semesterAkademikLabel(row.semester),
      },
      {
        key: 'jenis',
        header: 'Jenis',
        sortable: true,
        render: (row) => jenisPeriodeLabel(row.jenis),
      },
      { key: 'tanggal_mulai', header: 'Mulai', sortable: true },
      { key: 'tanggal_selesai', header: 'Selesai', sortable: true },
    ]}
    detailItems={(row) => [
      { label: 'Semester', value: semesterAkademikLabel(row.semester) },
      { label: 'Jenis', value: jenisPeriodeLabel(row.jenis) },
      { label: 'Tanggal mulai', value: row.tanggal_mulai },
      { label: 'Tanggal selesai', value: row.tanggal_selesai },
    ]}
  />
);
