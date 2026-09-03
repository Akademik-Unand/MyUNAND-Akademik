import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { DataTable } from '../components/common/DataTable';
import { KELAS } from '../constants/mockData';

export const KelasKelolaPage = () => {
  const { kode } = useParams();
  const kelas = KELAS.find((k) => k.kode === decodeURIComponent(kode || '')) || KELAS[0];

  const columns = [
    { header: '#', render: (_, idx) => idx + 1 },
    { key: 'bp', header: 'BP', sortable: true },
    { key: 'nama', header: 'Nama', sortable: true },
    { key: 'angkatan', header: 'Angkatan', sortable: true },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      filter: { type: 'select', options: ['Aktif', 'Cuti'] },
      render: (row) => (
        <span className={`badge badge-sm ${row.status === 'Aktif' ? 'badge-success' : 'badge-ghost'}`}>{row.status}</span>
      ),
    },
    { key: 'nilai', header: 'Nilai', sortable: true },
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
          <p><span className="text-base-content/60">Program Studi:</span> {kelas.prodi}</p>
          <p><span className="text-base-content/60">SKS:</span> {kelas.sks}</p>
          <p><span className="text-base-content/60">Jumlah peserta:</span> {kelas.peserta}</p>
        </div>
      </Card>

      <Card title="Daftar Peserta">
        <DataTable
          resource="kelas-peserta"
          columns={columns}
          rowKey={(r) => r.bp}
          searchPlaceholder="Cari BP atau nama mahasiswa..."
        />
        <Link to="/perkuliahan/kelas" className="btn btn-ghost btn-sm mt-4">
          Kembali
        </Link>
      </Card>
    </div>
  );
};
