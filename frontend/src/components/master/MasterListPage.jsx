import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '../common/PageHeader';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { DataTable } from '../common/DataTable';
import { PageSkeleton } from '../common/PageSkeleton';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { Modal } from '../ui/Modal';
import { Drawer } from '../ui/Drawer';
import { DetailList } from '../common/DetailList';
import { RowActions } from '../common/RowActions';
import { FormActions } from '../common/FormActions';
import { Plus } from 'lucide-react';
import { useMockQuery } from '../../hooks/useMockQuery';
import { useConfirmDelete } from '../../hooks/useConfirmDelete';

/**
 * Shared list page for master entities that use modal create/edit + drawer detail.
 */
export const MasterListPage = ({
  title,
  subtitle,
  breadcrumbs,
  columns,
  mockData,
  FormComponent,
  emptyForm,
  rowKey,
  detailItems,
  tableCols = 4,
}) => {
  const { data, isLoading, setData } = useMockQuery(mockData);
  const del = useConfirmDelete();
  const [modal, setModal] = useState({ open: false, mode: 'create', values: emptyForm });
  const [detail, setDetail] = useState(null);

  const openCreate = () => setModal({ open: true, mode: 'create', values: { ...emptyForm } });
  const openEdit = (row) => setModal({ open: true, mode: 'edit', values: { ...row } });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modal.mode === 'create') {
      setData((prev) => [{ ...modal.values, no: prev.length + 1 }, ...prev]);
      toast.success('Data berhasil ditambahkan');
    } else {
      setData((prev) =>
        prev.map((row) => (rowKey(row) === rowKey(modal.values) ? { ...row, ...modal.values } : row))
      );
      toast.success('Data berhasil diperbarui');
    }
    setModal({ open: false, mode: 'create', values: emptyForm });
  };

  if (isLoading) return <PageSkeleton showFilter={false} tableCols={tableCols} />;

  const tableColumns = [
    ...columns,
    {
      header: 'Aksi',
      align: 'right',
      cellClassName: 'text-right',
      render: (row) => (
        <RowActions
          onDetail={() => setDetail(row)}
          onEdit={() => openEdit(row)}
          onDelete={() => del.askDelete(row)}
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
        <DataTable columns={tableColumns} data={data} rowKey={rowKey} />
      </Card>

      <Modal
        open={modal.open}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
        title={modal.mode === 'create' ? `Tambah ${title}` : `Ubah ${title}`}
        footer={
          <FormActions
            onCancel={() => setModal((m) => ({ ...m, open: false }))}
            submitLabel={modal.mode === 'create' ? 'Simpan' : 'Perbarui'}
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
        open={del.isOpen}
        onClose={del.close}
        onConfirm={() =>
          del.confirm((item) => setData((prev) => prev.filter((row) => rowKey(row) !== rowKey(item))))
        }
        message={`Yakin ingin menghapus ${title.toLowerCase()} ini?`}
      />
    </div>
  );
};
