import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '../common/PageHeader';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { DataTable } from '../common/DataTable';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { Modal } from '../ui/Modal';
import { Drawer } from '../ui/Drawer';
import { DetailList } from '../common/DetailList';
import { RowActions } from '../common/RowActions';
import { FormActions } from '../common/FormActions';
import { useResourceMutations } from '../../hooks/useResourceMutations';
import { useBusyAction } from '../../hooks/useBusyAction';

/**
 * Halaman daftar bersama untuk entitas master: create/edit lewat modal,
 * detail lewat drawer, dan tabel standar yang state-nya tersimpan di URL.
 */
export const MasterListPage = ({
  title,
  subtitle,
  breadcrumbs,
  columns,
  resource,
  idKey,
  FormComponent,
  emptyForm,
  rowKey,
  detailItems,
  searchPlaceholder,
  afterSave,
}) => {
  const mutations = useResourceMutations(resource, {
    create: `${title} berhasil ditambahkan.`,
    update: `${title} berhasil diperbarui.`,
    remove: `${title} berhasil dihapus.`,
  });

  const { busy, run } = useBusyAction();
  const [modal, setModal] = useState({ open: false, mode: 'create', values: emptyForm });
  const [detail, setDetail] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const closeModal = () => {
    if (busy || mutations.create.isPending || mutations.update.isPending) return;
    setModal((m) => ({ ...m, open: false }));
  };
  const openCreate = () => setModal({ open: true, mode: 'create', values: { ...emptyForm } });
  const openEdit = (row) => setModal({ open: true, mode: 'edit', values: { ...row } });

  const saving = busy || mutations.create.isPending || mutations.update.isPending;

  const handleSubmit = (e) => {
    e.preventDefault();
    run(async () => {
      const saved =
        modal.mode === 'create'
          ? await mutations.create.mutateAsync(modal.values)
          : await mutations.update.mutateAsync({ id: modal.values[idKey], payload: modal.values });
      if (afterSave) await afterSave(saved, modal.values, modal.mode);
      setModal((m) => ({ ...m, open: false }));
    });
  };

  const tableColumns = [
    ...columns,
    {
      header: 'Aksi',
      cellClassName: 'text-right',
      className: 'text-right',
      render: (row) => (
        <RowActions
          onDetail={() => setDetail(row)}
          onEdit={() => openEdit(row)}
          onDelete={() => setDeleteTarget(row)}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        subtitle={subtitle}
        breadcrumbs={breadcrumbs}
        action={
          <Button size="sm" className="gap-1.5 font-semibold" onClick={openCreate}>
            <Plus size={15} /> Tambahkan Data
          </Button>
        }
      />

      <Card title={`Daftar ${title}`}>
        <DataTable
          resource={resource}
          columns={tableColumns}
          rowKey={rowKey}
          searchPlaceholder={searchPlaceholder || `Cari ${title.toLowerCase()}...`}
        />
      </Card>

      <Modal
        open={modal.open}
        onClose={closeModal}
        title={modal.mode === 'create' ? `Tambah ${title}` : `Ubah ${title}`}
        closeOnBackdrop={!saving}
        footer={
          <FormActions
            onCancel={closeModal}
            submitLabel={modal.mode === 'create' ? 'Simpan' : 'Perbarui'}
            isLoading={saving}
            onSubmitClick={() => document.getElementById('master-form')?.requestSubmit()}
          />
        }
      >
        <form id="master-form" onSubmit={handleSubmit}>
          <FormComponent
            values={modal.values}
            onChange={(values) => setModal((m) => ({ ...m, values }))}
          />
        </form>
      </Modal>

      <Drawer
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={`Detail ${title}`}
        subtitle={detail ? rowKey(detail) : ''}
      >
        {detail && <DetailList items={detailItems(detail)} />}
      </Drawer>

      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          await mutations.remove.mutateAsync(deleteTarget[idKey]);
          setDeleteTarget(null);
        }}
        isLoading={mutations.remove.isPending}
        title={`Hapus ${title}`}
        message={`Yakin ingin menghapus ${title.toLowerCase()} ini? Data akan diarsipkan.`}
      />
    </div>
  );
};
