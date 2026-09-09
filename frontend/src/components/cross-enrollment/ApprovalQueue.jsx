import { Check, X } from 'lucide-react';
import { DataTable } from '../common/DataTable';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { participantName, participantProgram, approvalStatusLabel } from '../../utils/crossEnrollment';
import { Can } from '../auth/Can';

export const ApprovalQueue = ({ resource, statusFilter, title, mutations }) => (
  <Card title={title}>
    <DataTable
      resource={resource}
      tableKey={`${resource}_`}
      extraFilter={{ cross_enrollment_status: statusFilter }}
      rowKey={(row) => row.id}
      searchPlaceholder="Cari mahasiswa atau mata kuliah..."
      columns={[
        {
          key: 'mahasiswa_id',
          header: 'Mahasiswa',
          render: (row) => (
            <div>
              <div className="font-medium">{participantName(row)}</div>
              <div className="text-xs text-base-content/60">
                {row.krs?.mahasiswa?.niu || row.niu || '—'} · {participantProgram(row)}
              </div>
            </div>
          ),
        },
        {
          key: 'kelas_id',
          header: 'Mata Kuliah',
          render: (row) => `${row.kelas?.matakuliah?.kode_matakuliah || ''} ${row.kelas?.matakuliah?.nama_resmi || ''}`,
        },
        {
          key: 'cross_enrollment_status',
          header: 'Status',
          render: (row) => (
            <span className="badge badge-ghost badge-sm">
              {approvalStatusLabel(row.cross_enrollment_status)}
            </span>
          ),
        },
        {
          header: 'Aksi',
          className: 'text-right',
          cellClassName: 'text-right',
          render: (row) => (
            <Can I="approve-host" a="CrossEnrollment">
              <div className="flex justify-end gap-2">
                <Button size="xs" className="gap-1" disabled={mutations.isPending} onClick={() => mutations.approve(row.id)}>
                  <Check size={14} /> Setujui
                </Button>
                <Button
                  size="xs"
                  variant="error"
                  className="gap-1"
                  disabled={mutations.isPending}
                  onClick={() => {
                    const reason = window.prompt('Alasan penolakan:');
                    if (reason?.trim()) mutations.reject(row.id, reason.trim());
                  }}
                >
                  <X size={14} /> Tolak
                </Button>
              </div>
            </Can>
          ),
        },
      ]}
    />
  </Card>
);
