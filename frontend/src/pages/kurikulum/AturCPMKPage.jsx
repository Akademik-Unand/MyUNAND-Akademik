import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { IconButton } from '../../components/common/IconButton';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { FormActions } from '../../components/common/FormActions';
import { ConfirmDeleteModal } from '../../components/common/ConfirmDeleteModal';
import { CPMKItemForm } from '../../components/kurikulum/CPForms';
import { useResourceItem, useResourceQuery } from '../../hooks/useResourceQuery';
import { useResourceMutations } from '../../hooks/useResourceMutations';
import { useConfirmDelete } from '../../hooks/useConfirmDelete';
import { PageSkeleton } from '../../components/common/PageSkeleton';

export const AturCPMKPage = () => {
  const { id } = useParams();
  const mk = useResourceItem('matakuliah', id);
  const query = useResourceQuery('cpmk-detail', {
    params: id ? { filter: { matakuliah_id: id } } : {},
    enabled: Boolean(id),
  });
  const mutations = useResourceMutations('cpmk-detail');
  const del = useConfirmDelete();
  const [modal, setModal] = useState({ open: false, mode: 'create', values: {} });
  const data = query.data ?? [];
  const saving = mutations.create.isPending || mutations.update.isPending;

  const save = async (e) => {
    e.preventDefault();
    if (saving) return;
    const payload = {
      matakuliah_id: id,
      nama_cpmk: modal.values.nama_cpmk,
      deskripsi: modal.values.deskripsi || null,
    };
    if (modal.mode === 'edit') {
      await mutations.update.mutateAsync({ id: modal.values.id, payload });
    } else {
      await mutations.create.mutateAsync(payload);
    }
    setModal({ open: false, mode: 'create', values: {} });
  };

  if (mk.isPending || query.isPending) return <PageSkeleton showFilter={false} tableCols={4} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola CPMK"
        subtitle={`${mk.data?.nama_resmi || ''} | ${mk.data?.kode_matakuliah || ''} | ${mk.data?.jumlah_sks_kurikulum || 0} sks`}
        breadcrumbs={[
          { label: 'Kurikulum' },
          { label: 'CPMK Kurikulum', path: '/kurikulum/cpmk' },
          { label: 'Kelola CPMK' },
        ]}
        action={
          <div className="flex gap-2">
            <Link to={`/perkuliahan/mk-semester/${id}`}>
              <Button variant="secondary" size="sm">
                Lihat MK Semester
              </Button>
            </Link>
            <Button size="sm" className="gap-1.5" onClick={() => setModal({ open: true, mode: 'create', values: {} })}>
              <Plus size={15} /> Tambah CPMK
            </Button>
          </div>
        }
      />

      <Card>
        <div className="overflow-x-auto">
          <table className="table table-sm w-full">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Deskripsi</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td className="font-semibold">{item.nama_cpmk}</td>
                  <td>{item.deskripsi}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <IconButton
                        label="Ubah CPMK"
                        icon={Pencil}
                        tone="text-warning"
                        onClick={() => setModal({ open: true, mode: 'edit', values: item })}
                      />
                      <IconButton
                        label="Hapus CPMK"
                        icon={Trash2}
                        tone="text-error"
                        tooltipPosition="tooltip-left"
                        onClick={() => del.askDelete(item)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <Link to="/kurikulum/cpmk" className="btn btn-ghost btn-sm">
            Kembali
          </Link>
        </div>
      </Card>

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, mode: 'create', values: {} })}
        title={modal.mode === 'edit' ? 'Ubah CPMK' : 'Tambah CPMK'}
        closeOnBackdrop={!saving}
        footer={
          <FormActions
            onCancel={() => setModal({ open: false, mode: 'create', values: {} })}
            isLoading={saving}
            onSubmitClick={() => document.getElementById('cpmk-item-form')?.requestSubmit()}
          />
        }
      >
        <form id="cpmk-item-form" onSubmit={save}>
          <CPMKItemForm values={modal.values} onChange={(values) => setModal((m) => ({ ...m, values }))} />
        </form>
      </Modal>

      <ConfirmDeleteModal
        open={del.isOpen}
        onClose={del.close}
        isLoading={del.pending}
        onConfirm={() => del.confirm((item) => mutations.remove.mutateAsync(item.id))}
      />
    </div>
  );
};
