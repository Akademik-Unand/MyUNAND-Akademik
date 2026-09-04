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
import { FilterBar } from '../../components/common/FilterBar';
import { Can } from '../../components/auth/Can';
import { useResourceMutations } from '../../hooks/useResourceMutations';
import { useAcademicFilter } from '../../hooks/useAcademicFilter';

const FILTER_KEYS = ['fakultas', 'departemen', 'prodi'];

export const KurikulumDataPage = () => {
  const mutations = useResourceMutations('kurikulum', { remove: 'Kurikulum berhasil dihapus.' });
  const academic = useAcademicFilter({ keys: FILTER_KEYS });
  const extraFilter = academic.extraFilter;
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
          <Can I="update" a="Kurikulum">
            <IconLink label="Ubah kurikulum" icon={Pencil} tone="text-warning" to={`/kurikulum/data/${row.id}/edit`} />
          </Can>
          <Can I="delete" a="Kurikulum">
            <IconButton
              label="Hapus kurikulum"
              icon={Trash2}
              tone="text-error"
              tooltipPosition="tooltip-left"
              onClick={() => setDeleteTarget(row)}
            />
          </Can>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Data Kurikulum"
        subtitle="Pilih fakultas, departemen, lalu prodi, kemudian terapkan untuk melihat kurikulum"
        breadcrumbs={[{ label: 'Kurikulum' }, { label: 'Data Kurikulum' }]}
      />

      <Card title="Filter">
        <FilterBar
          fields={academic.fields}
          onApply={academic.apply}
          onReset={academic.reset}
          applyDisabled={!academic.canApply}
        />
      </Card>

      {!extraFilter && (
        <p className="text-sm text-base-content/60">Pilih fakultas, departemen, lalu prodi, kemudian klik Terapkan.</p>
      )}

      {extraFilter && (
        <Card
          title="Kurikulum"
          actions={
            academic.applied.prodiId ? (
              <Can I="create" a="Kurikulum">
                <Link to={`/kurikulum/data/baru?prodi=${encodeURIComponent(academic.applied.prodiId)}`}>
                  <Button size="sm" className="gap-1.5">
                    <Plus size={14} /> Tambahkan Data
                  </Button>
                </Link>
              </Can>
            ) : null
          }
        >
          <DataTable
            resource="kurikulum"
            columns={columns}
            rowKey={(row) => row.id}
            extraFilter={extraFilter}
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
