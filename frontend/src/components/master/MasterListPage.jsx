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
import { Can } from '../auth/Can';
import { useCan } from '../../hooks/useCan';
import { useResourceMutations } from '../../hooks/useResourceMutations';
import { useBusyAction } from '../../hooks/useBusyAction';
import { useResourceItem } from '../../hooks/useResourceQuery';

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
  subject,
  rowActionExtra,
  detailResource,
}) => {
  const can = useCan();
  const mutations = useResourceMutations(resource, {
    create: `${title} berhasil ditambahkan.`,
    update: `${title} berhasil diperbarui.`,
    remove: `${title} berhasil dihapus.`,
  });

  const { busy, run } = useBusyAction();
  const [modal, setModal] = useState({ open: false, mode: 'create', values: emptyForm });
  const [detail, setDetail] = useState(null);
  // Bila ada detailResource, drawer memuat baris segar dari API (mis. user) supaya
  // field yang tidak ada di daftar (roles/units) tetap tampil benar.
  const liveDetail = useResourceItem(detailResource, detail ? detail[idKey] : null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const closeModal = () => {
    if (busy || mutations.create.isPending || mutations.update.isPending) return;
    setModal((m) => ({ ...m, open: false }));
  };
  const openCreate = () => setModal({ open: true, mode: 'create', values: { ...emptyForm } });
  const openEdit = (row) => setModal({ open: true, mode: 'edit', values: { ...row } });

  const saving = busy || mutations.create.isPending || mutations.update.isPending;

  const pickPayload = (values) => {
    const payload = {};
    for (const key of Object.keys(emptyForm || {})) {
      if (values[key] === undefined) continue;
      if (values[key] === '' && key === 'password') continue;
      payload[key] = values[key] === '' ? null : values[key];
    }
    return payload;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    run(async () => {
      const payload = pickPayload(modal.values);
      const saved =
        modal.mode === 'create'
          ? await mutations.create.mutateAsync(payload)
          : await mutations.update.mutateAsync({ id: modal.values[idKey], payload });
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
        <div className="flex items-center justify-end gap-1">
          {rowActionExtra?.(row)}
          <RowActions
            onDetail={() => setDetail(row)}
            onEdit={subject && can('update', subject) ? () => openEdit(row) : undefined}
            onDelete={subject && can('delete', subject) ? () => setDeleteTarget(row) : undefined}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={title}
        subtitle={subtitle}
        breadcrumbs={breadcrumbs}
        action={
          subject ? (
            <Can I="create" a={subject}>
              <Button size="sm" className="gap-1.5 font-semibold" onClick={openCreate}>
                <Plus size={15} /> Tambahkan Data
              </Button>
            </Can>
          ) : (
            <Button size="sm" className="gap-1.5 font-semibold" onClick={openCreate}>
              <Plus size={15} /> Tambahkan Data
            </Button>
          )
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
        {detail &&
          (detailResource ? (
            liveDetail.isPending ? (
              <p className="text-sm text-base-content/60">Memuat detail...</p>
            ) : (
              <DetailList items={detailItems(liveDetail.data)} />
            )
          ) : (
            <DetailList items={detailItems(detail)} />
          ))}
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
