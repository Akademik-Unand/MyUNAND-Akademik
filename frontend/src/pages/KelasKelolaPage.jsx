import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { DataTable } from '../components/common/DataTable';
import { PageSkeleton } from '../components/common/PageSkeleton';
import { useMockQuery } from '../hooks/useMockQuery';
import { KELAS, KELAS_PESERTA } from '../constants/mockData';

export const KelasKelolaPage = () => {
  const { kode } = useParams();
  const kelas = KELAS.find((k) => k.kode === decodeURIComponent(kode || '')) || KELAS[0];
  const { data, isLoading } = useMockQuery(KELAS_PESERTA);

  if (isLoading) return <PageSkeleton showFilter={false} tableCols={5} />;

  const columns = [
    { header: '#', render: (_, idx) => idx + 1 },
    { key: 'bp', header: 'BP' },
    { key: 'nama', header: 'Nama' },
    { key: 'angkatan', header: 'Angkatan' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span className={`badge badge-sm ${row.status === 'Aktif' ? 'badge-success' : 'badge-ghost'}`}>{row.status}</span>
      ),
    },
    { key: 'nilai', header: 'Nilai' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola Kelas"
        subtitle={kelas.kode}
        breadcrumbs={[
          { label: 'Semester & Perkuliahan' },
          { label: 'Kelas', path: '/perkuliahan/kelas' },
          { label: kelas.kode },
        ]}
      />

      <Card title="Informasi Kelas">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <p><span className="text-base-content/60">Nama kelas:</span> <strong>{kelas.kode}</strong></p>
          <p><span className="text-base-content/60">Mata kuliah:</span> <strong>{kelas.mataKuliah}</strong></p>
          <p><span className="text-base-content/60">Semester:</span> {kelas.semester}</p>
          <p><span className="text-base-content/60">Program studi:</span> {kelas.prodi}</p>
          <p><span className="text-base-content/60">SKS:</span> {kelas.sks}</p>
          <p><span className="text-base-content/60">Jumlah peserta:</span> {kelas.peserta}</p>
        </div>
      </Card>

      <Card title="Daftar Peserta">
        <DataTable columns={columns} data={data} rowKey={(r) => r.bp} />
        <Link to="/perkuliahan/kelas" className="btn btn-ghost btn-sm mt-4">
          Kembali
        </Link>
      </Card>
    </div>
  );
};
