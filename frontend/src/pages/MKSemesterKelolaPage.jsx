import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { PageSkeleton } from '../components/common/PageSkeleton';
import { useMockQuery } from '../hooks/useMockQuery';
import { MK_SEMESTER, MK_SEMESTER_DETAIL_CPMK } from '../constants/mockData';

export const MKSemesterKelolaPage = () => {
  const { kode } = useParams();
  const mk = MK_SEMESTER.find((m) => m.kode === decodeURIComponent(kode || '')) || MK_SEMESTER[0];
  const { data, isLoading } = useMockQuery(MK_SEMESTER_DETAIL_CPMK);

  if (isLoading) return <PageSkeleton showFilter={false} tableCols={3} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="CPMK Semester"
        subtitle={`${mk.nama} · ${mk.kode} · ${mk.sks} SKS`}
        breadcrumbs={[
          { label: 'Semester & Perkuliahan' },
          { label: 'MK Semester', path: '/perkuliahan/mk-semester' },
          { label: mk.kode },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Informasi MK">
          <dl className="text-sm space-y-2">
            <div className="flex justify-between"><dt className="text-base-content/60">Kelas</dt><dd>{mk.kelas}</dd></div>
            <div className="flex justify-between"><dt className="text-base-content/60">Peserta</dt><dd>{mk.peserta}</dd></div>
            <div className="flex justify-between"><dt className="text-base-content/60">Transkrip</dt><dd>{mk.transkrip}</dd></div>
          </dl>
        </Card>
        <Card title="Dokumen Evaluasi">
          <p className="text-sm text-base-content/60">Belum ada dokumen diunggah.</p>
        </Card>
        <Card title="Status">
          <span className="badge badge-warning">CPMK Semester Belum Lengkap</span>
        </Card>
      </div>

      <Card title="Daftar CPMK Semester">
        <table className="table table-sm w-full">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Deskripsi</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.nama}>
                <td className="font-semibold">{row.nama}</td>
                <td>{row.deskripsi}</td>
                <td>
                  <span className={`badge badge-sm ${row.status === 'Disetujui' ? 'badge-success' : row.status === 'Menunggu' ? 'badge-warning' : 'badge-ghost'}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Link to="/perkuliahan/mk-semester" className="btn btn-ghost btn-sm mt-4">
          Kembali
        </Link>
      </Card>
    </div>
  );
};
