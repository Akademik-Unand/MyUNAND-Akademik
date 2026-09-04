import { Card } from '../ui/Card';
import { DataTable } from '../common/DataTable';

const columns = [
  { header: '#', render: (_, idx) => idx + 1 },
  {
    key: 'cpmk_id',
    header: 'CPMK',
    render: (row) => row.cpmk?.nama_cpmk || '—',
  },
  { key: 'target_nilai_min', header: 'Target nilai min' },
  { key: 'target_persen_lulus', header: 'Target persen lulus' },
  { key: 'capaian_persen', header: 'Capaian' },
  { key: 'rata_rata', header: 'Rata-rata' },
  { key: 'jumlah_lulus', header: 'Jumlah lulus' },
  { key: 'analisis', header: 'Analisis', render: (row) => row.analisis || '—' },
];

export const KelasEvaluasiPanel = ({ kelasId }) => (
  <Card title="Rangkuman Evaluasi CPMK Kelas">
    <DataTable
      resource="evaluasi-cpmk"
      tableKey="evk_"
      columns={columns}
      extraFilter={kelasId ? { kelas_id: kelasId } : undefined}
      rowKey={(row) => row.id}
      searchPlaceholder="Cari evaluasi..."
    />
  </Card>
);
