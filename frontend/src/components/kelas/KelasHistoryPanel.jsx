import { Eye } from 'lucide-react';
import { useState } from 'react';
import { Card } from '../ui/Card';
import { DataTable } from '../common/DataTable';
import { Drawer } from '../ui/Drawer';
import { DetailList } from '../common/DetailList';
import { IconButton } from '../common/IconButton';

export const KelasHistoryPanel = ({ kelasId, extraFilter, tableKey = 'hist_' }) => {
  const [item, setItem] = useState(null);
  const mergedFilter = { ...(extraFilter || {}), ...(kelasId ? { kelas_id: kelasId } : {}) };
  const columns = [
    { header: '#', render: (_, idx) => idx + 1 },
    { key: 'createdAt', header: 'Waktu', sortable: true },
    {
      key: 'user_id',
      header: 'Pengunggah',
      render: (row) => row.user?.name || '—',
    },
    { key: 'file_name', header: 'Berkas', sortable: true },
    { key: 'tipe', header: 'Tipe', sortable: true },
    {
      header: 'Aksi',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <IconButton
          label="Lihat detail"
          icon={Eye}
          tone="text-info"
          tooltipPosition="tooltip-left"
          onClick={() => setItem(row)}
        />
      ),
    },
  ];

  return (
    <Card title="History Upload Nilai">
      <DataTable
        resource="upload-history"
        tableKey={tableKey}
        columns={columns}
        extraFilter={Object.keys(mergedFilter).length ? mergedFilter : undefined}
        rowKey={(row) => row.id}
        searchPlaceholder="Cari berkas atau pengunggah..."
      />
      <Drawer open={Boolean(item)} onClose={() => setItem(null)} title="Detail Upload">
        {item && (
          <DetailList
            items={[
              { label: 'Pengunggah', value: item.user?.name },
              { label: 'Waktu', value: item.createdAt },
              { label: 'Berkas', value: item.file_name },
              { label: 'Tipe', value: item.tipe },
              { label: 'Keterangan', value: item.keterangan },
            ]}
          />
        )}
      </Drawer>
    </Card>
  );
};
