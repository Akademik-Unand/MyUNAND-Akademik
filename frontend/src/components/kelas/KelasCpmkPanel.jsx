import { Card } from '../ui/Card';
import { DataTable } from '../common/DataTable';

const columns = [
  { header: '#', render: (_, idx) => idx + 1 },
  { key: 'nama_cpmk', header: 'CPMK', sortable: true, cellClassName: 'font-semibold' },
  { key: 'deskripsi', header: 'Deskripsi', render: (row) => row.deskripsi || '—' },
  {
    key: 'sumber',
    header: 'Sumber penilaian',
    render: (row) => {
      const items = row.sumberPenilaian || [];
      if (!items.length) return '—';
      return items.map((item) => `${item.nama_sumber_penilaian} (${item.bobot})`).join(', ');
    },
  },
];

export const KelasCpmkPanel = ({ matakuliahId }) => (
  <Card title="Informasi CPMK">
    <DataTable
      resource="cpmk-kurikulum"
      tableKey="cpmk_"
      columns={columns}
      extraFilter={matakuliahId ? { matakuliah_id: matakuliahId } : undefined}
      rowKey={(row) => row.id}
      searchPlaceholder="Cari CPMK..."
    />
  </Card>
);
