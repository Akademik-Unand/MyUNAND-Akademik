import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { IconButton, IconLink } from '../../components/common/IconButton';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/common/DataTable';
import { ConfirmDeleteModal } from '../../components/common/ConfirmDeleteModal';
import { Drawer } from '../../components/ui/Drawer';
import { DetailList } from '../../components/common/DetailList';
import { ResourceSelect } from '../../components/common/ResourceSelect';
import { useResourceMutations } from '../../hooks/useResourceMutations';

export const KurikulumDataPage = () => {
  const mutations = useResourceMutations('kurikulum', { remove: 'Kurikulum berhasil dihapus.' });
  const [prodiId, setProdiId] = useState('');
  const [opened, setOpened] = useState('');
  const [detail, setDetail] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const columns = [
    { header: 'No.', render: (_, idx) => idx + 1 },
    { key: 'nama', header: 'Kurikulum', sortable: true },
    { key: 'tahun', header: 'Tahun', sortable: true },
    { key: 'masa_studi_ideal', header: 'Masa Studi Ideal', sortable: true },
    { key: 'masa_studi_maksimal', header: 'Masa Studi Maks.', sortable: true },
    {
      header: 'Aksi',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <IconButton label="Lihat detail" icon={Eye} tone="text-info" onClick={() => setDetail(row)} />
          <IconLink label="Ubah kurikulum" icon={Pencil} tone="text-warning" to={`/kurikulum/data/${row.id}/edit`} />
          <IconButton
            label="Hapus kurikulum"
            icon={Trash2}
            tone="text-error"
            tooltipPosition="tooltip-left"
            onClick={() => setDeleteTarget(row)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Kurikulum"
        subtitle="Pilih program studi untuk melihat data kurikulum"
        breadcrumbs={[{ label: 'Kurikulum' }, { label: 'Data Kurikulum' }]}
      />

      <Card title="Data Kurikulum">
        <div className="max-w-xl">
          <ResourceSelect
            resource="prodi"
            label="Pilih Program Studi"
            placeholder="Pilih Program Studi"
            value={prodiId}
            onChange={(e) => setProdiId(e.target.value)}
          />
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              className="font-semibold"
              disabled={!prodiId}
              onClick={() => setOpened(prodiId)}
            >
              BUKA &raquo;
            </Button>
          </div>
        </div>
      </Card>

      {opened && (
        <Card
          title="Kurikulum"
          actions={
            <Link to={`/kurikulum/data/baru?prodi=${encodeURIComponent(opened)}`}>
              <Button size="sm" className="gap-1.5">
                <Plus size={14} /> Tambahkan Data
              </Button>
            </Link>
          }
        >
          <DataTable
            resource="kurikulum"
            columns={columns}
            rowKey={(row) => row.id}
            extraFilter={{ program_studi_id: opened }}
            searchPlaceholder="Cari nama kurikulum atau tahun..."
          />
        </Card>
      )}

      <Drawer open={Boolean(detail)} onClose={() => setDetail(null)} title="Detail Kurikulum" subtitle={detail?.nama}>
        {detail && (
          <DetailList
            items={[
              { label: 'Nama', value: detail.nama },
              { label: 'Tahun', value: detail.tahun },
              { label: 'Program studi', value: detail.programStudi?.nama_resmi },
              { label: 'Masa ideal', value: detail.masa_studi_ideal },
              { label: 'Masa maksimum', value: detail.masa_studi_maksimal },
            ]}
          />
        )}
      </Drawer>

      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Kurikulum"
        message={`Yakin ingin menghapus kurikulum ${deleteTarget?.nama || ''}?`}
        onConfirm={async () => {
          await mutations.remove.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
        isLoading={mutations.remove.isPending}
      />
    </div>
  );
};
