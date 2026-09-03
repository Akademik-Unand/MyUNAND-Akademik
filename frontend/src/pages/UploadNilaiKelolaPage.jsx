import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { DataTable } from '../components/common/DataTable';
import { PageSkeleton } from '../components/common/PageSkeleton';
import { useMockQuery } from '../hooks/useMockQuery';
import { UPLOAD_NILAI, NILAI_KELAS } from '../constants/mockData';

export const UploadNilaiKelolaPage = () => {
  const { kode } = useParams();
  const kelas = UPLOAD_NILAI.find((k) => k.kelas === decodeURIComponent(kode || '')) || UPLOAD_NILAI[0];
  const { data, isLoading } = useMockQuery(NILAI_KELAS);

  if (isLoading) return <PageSkeleton showFilter={false} tableCols={6} />;

  const columns = [
    { header: '#', render: (_, idx) => idx + 1 },
    { key: 'bp', header: 'BP' },
    { key: 'nama', header: 'Nama' },
    { key: 'uts', header: 'UTS' },
    { key: 'uas', header: 'UAS' },
    { key: 'tugas', header: 'Tugas' },
    { key: 'akhir', header: 'Nilai Akhir' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola Nilai"
        subtitle={`${kelas.kelas} · ${kelas.mataKuliah}`}
        breadcrumbs={[
          { label: 'Semester & Perkuliahan' },
          { label: 'Upload Nilai', path: '/perkuliahan/upload-nilai' },
          { label: kelas.kelas },
        ]}
        action={
          <Button
            size="sm"
            onClick={() =>
              toast.success('Nilai tersimpan (mock)', {
                description: 'Upload nilai belum tersambung ke API.',
              })
            }
          >
            Simpan Nilai
          </Button>
        }
      />
      <Card title="Daftar Nilai Mahasiswa">
        <DataTable columns={columns} data={data} rowKey={(r) => r.bp} />
        <Link to="/perkuliahan/upload-nilai" className="btn btn-ghost btn-sm mt-4">
          Kembali
        </Link>
      </Card>
    </div>
  );
};
