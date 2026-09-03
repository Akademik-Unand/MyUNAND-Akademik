import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { DataTable } from '../components/common/DataTable';
import { UPLOAD_NILAI } from '../constants/mockData';

export const UploadNilaiKelolaPage = () => {
  const { kode } = useParams();
  const kelas = UPLOAD_NILAI.find((k) => k.kelas === decodeURIComponent(kode || '')) || UPLOAD_NILAI[0];

  const columns = [
    { header: '#', render: (_, idx) => idx + 1 },
    { key: 'bp', header: 'BP', sortable: true },
    { key: 'nama', header: 'Nama', sortable: true },
    { key: 'uts', header: 'UTS', sortable: true },
    { key: 'uas', header: 'UAS', sortable: true },
    { key: 'tugas', header: 'Tugas', sortable: true },
    { key: 'akhir', header: 'Nilai Akhir', sortable: true },
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
        <DataTable
          resource="nilai-kelas"
          columns={columns}
          rowKey={(r) => r.bp}
          searchPlaceholder="Cari mahasiswa..."
        />
        <Link to="/perkuliahan/upload-nilai" className="btn btn-ghost btn-sm mt-4">
          Kembali
        </Link>
      </Card>
    </div>
  );
};
