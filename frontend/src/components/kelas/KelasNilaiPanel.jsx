import { Card } from '../ui/Card';
import { DataTable } from '../common/DataTable';
import { kelasPesertaColumns } from './kelasPesertaColumns';
import { NilaiPesertaMatrix } from './NilaiPesertaMatrix';
import { NilaiPesertaToolbar } from './NilaiPesertaToolbar';
import { useCan } from '../../hooks/useCan';
import { useKelasNilaiMatriks } from '../../hooks/useKelasNilaiMatriks';
import { Skeleton } from '../ui/Skeleton';

export const KelasNilaiPanel = ({ kelas, toolbar = 'link' }) => {
  const kelasId = kelas?.id;
  const can = useCan();
  const canNilai = can('read', 'NilaiMahasiswa');
  const query = useKelasNilaiMatriks(kelasId, { enabled: canNilai && Boolean(kelasId) });

  if (!canNilai) {
    return (
      <Card title="Daftar Peserta">
        <DataTable
          resource="kelas-peserta"
          tableKey="pst_"
          columns={kelasPesertaColumns}
          extraFilter={kelasId ? { kelas_id: kelasId } : undefined}
          rowKey={(row) => row.id}
          searchPlaceholder="Cari NIU atau nama mahasiswa..."
        />
      </Card>
    );
  }

  if (query.isPending) {
    return (
      <Card title="Nilai Peserta Matakuliah">
        <Skeleton className="h-48 w-full" />
      </Card>
    );
  }

  if (query.isError) {
    return (
      <Card title="Daftar Peserta">
        <p className="text-sm text-error mb-3">{query.error?.message || 'Gagal memuat matriks nilai.'}</p>
        <DataTable
          resource="kelas-peserta"
          tableKey="pst_"
          columns={kelasPesertaColumns}
          extraFilter={kelasId ? { kelas_id: kelasId } : undefined}
          rowKey={(row) => row.id}
          searchPlaceholder="Cari NIU atau nama mahasiswa..."
        />
      </Card>
    );
  }

  return (
    <Card
      title="Nilai Peserta Matakuliah"
      actions={<NilaiPesertaToolbar kelas={kelas} data={query.data} mode={toolbar} />}
    >
      <NilaiPesertaMatrix data={query.data} />
    </Card>
  );
};
