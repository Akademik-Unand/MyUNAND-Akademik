import { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { DataTable } from '../../components/common/DataTable';
import { Drawer } from '../../components/ui/Drawer';
import { DetailList } from '../../components/common/DetailList';
import { RowActions } from '../../components/common/RowActions';

const formatTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('id-ID');
};

export const ActivityLogsPage = () => {
  const [detail, setDetail] = useState(null);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Jejak Aktivitas"
        subtitle="Pantau siapa yang menambah, mengubah, atau mengarsipkan data"
        breadcrumbs={[{ label: 'Pengguna & Akses' }, { label: 'Aktivitas' }]}
      />
      <Card title="Riwayat aksi tulis">
        <DataTable
          resource="activity-logs"
          tableKey="activity_"
          rowKey={(row) => row.id}
          searchPlaceholder="Cari user, aksi, subject, atau IP..."
          columns={[
            {
              key: 'createdAt',
              header: 'Waktu',
              sortable: true,
              render: (row) => formatTime(row.createdAt),
            },
            {
              key: 'user_email',
              header: 'User',
              sortable: true,
              filter: { type: 'text', placeholder: 'Email' },
              render: (row) => row.user_name || row.user_email || '—',
            },
            {
              key: 'action',
              header: 'Aksi',
              sortable: true,
              filter: {
                type: 'select',
                options: ['create', 'update', 'delete', 'restore', 'login', 'assign-roles', 'sync-permissions'],
              },
            },
            { key: 'subject', header: 'Subject', sortable: true, filter: { type: 'text' } },
            { key: 'resource_id', header: 'Resource' },
            { key: 'ip', header: 'IP' },
            { key: 'summary', header: 'Ringkasan' },
            {
              header: 'Aksi',
              className: 'text-right',
              cellClassName: 'text-right',
              render: (row) => <RowActions onDetail={() => setDetail(row)} />,
            },
          ]}
        />
      </Card>
      <Drawer
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title="Detail aktivitas"
        subtitle={detail?.summary}
      >
        {detail && (
          <DetailList
            items={[
              { label: 'Waktu', value: formatTime(detail.createdAt) },
              { label: 'User', value: detail.user_name || '—' },
              { label: 'Email', value: detail.user_email },
              { label: 'Aksi', value: detail.action },
              { label: 'Subject', value: detail.subject },
              { label: 'Resource', value: detail.resource_id },
              { label: 'Method', value: detail.method },
              { label: 'Path', value: detail.path },
              { label: 'Status', value: detail.status_code },
              { label: 'IP', value: detail.ip },
              { label: 'Browser', value: detail.user_agent },
              {
                label: 'Payload',
                value: detail.payload ? JSON.stringify(detail.payload, null, 2) : '—',
              },
            ]}
          />
        )}
      </Drawer>
    </div>
  );
};
