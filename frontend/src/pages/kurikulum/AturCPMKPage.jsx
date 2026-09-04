import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { IconButton } from '../../components/common/IconButton';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { FormActions } from '../../components/common/FormActions';
import { ConfirmDeleteModal } from '../../components/common/ConfirmDeleteModal';
import { CPMKItemForm } from '../../components/kurikulum/CPForms';
import { useResourceQuery } from '../../hooks/useResourceQuery';
import { useResourceMutations } from '../../hooks/useResourceMutations';
import { useConfirmDelete } from '../../hooks/useConfirmDelete';
import { CPMK_KURIKULUM } from '../../constants/mockData';
import { PageSkeleton } from '../../components/common/PageSkeleton';

export const AturCPMKPage = () => {
  const { kode } = useParams();
  const mk = CPMK_KURIKULUM.find((m) => m.kode === decodeURIComponent(kode || '')) || CPMK_KURIKULUM[0];
  const query = useResourceQuery('cpmk-detail');
  const mutations = useResourceMutations('cpmk-detail');
  const del = useConfirmDelete();
  const [modal, setModal] = useState({ open: false, mode: 'create', values: {} });
  const data = query.data ?? [];

  const save = async (e) => {
    e.preventDefault();
    if (mutations.replaceAll.isPending) return;
    if (modal.mode === 'edit') {
      await mutations.replaceAll.mutateAsync(
        data.map((item) =>
          item.nama === modal.values.nama ? { ...item, deskripsi: modal.values.deskripsi } : item
        )
      );
      toast.success('CPMK berhasil diperbarui');
    } else {
      await mutations.replaceAll.mutateAsync([
        ...data,
        {
          nama: modal.values.nama,
          deskripsi: modal.values.deskripsi,
          status: 'Draft',
          mappings: [{ cpl: modal.values.cpl || 'SO A', cplDesc: '—', pi: modal.values.pi || 'PI 1', piDesc: '—' }],
        },
      ]);
      toast.success('CPMK berhasil ditambahkan');
    }
    setModal({ open: false, mode: 'create', values: {} });
  };

  if (query.isPending) return <PageSkeleton showFilter={false} tableCols={6} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola CPMK"
        subtitle={`${mk.nama} | ${mk.kode} | ${mk.sks} sks`}
        breadcrumbs={[
          { label: 'Kurikulum' },
          { label: 'CPMK Kurikulum', path: '/kurikulum/cpmk' },
          { label: 'Kelola CPMK' },
        ]}
        action={
          <div className="flex gap-2">
            <Link to={`/perkuliahan/mk-semester/${encodeURIComponent(mk.kode)}`}>
              <Button variant="secondary" size="sm">
                Lihat CPMK Semester (Genap 2024)
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
          <table className="table table-sm table-bordered w-full">
            <thead>
              <tr className="text-center">
                <th>Nama</th>
                <th>Deskripsi</th>
                <th>Kode CPL</th>
                <th>Deskripsi CPL</th>
                <th>Kode PI</th>
                <th>Deskripsi PI</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.flatMap((item) =>
                item.mappings.map((map, idx) => (
                  <tr key={`${item.nama}-${idx}`}>
                    {idx === 0 && (
                      <>
                        <td rowSpan={item.mappings.length} className="font-semibold align-top">
                          {item.nama}
                        </td>
                        <td rowSpan={item.mappings.length} className="align-top max-w-xs">
                          {item.deskripsi}
                        </td>
                      </>
                    )}
                    <td>{map.cpl}</td>
                    <td className="max-w-xs text-xs">{map.cplDesc}</td>
                    <td>{map.pi}</td>
                    <td className="max-w-xs text-xs">{map.piDesc}</td>
                    {idx === 0 && (
                      <>
                        <td rowSpan={item.mappings.length} className="align-top">
                          <span className={`badge badge-sm ${item.status === 'Aktif' ? 'badge-success' : 'badge-ghost'}`}>
                            {item.status}
                          </span>
                        </td>
                        <td rowSpan={item.mappings.length} className="align-top">
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
                      </>
                    )}
                  </tr>
                ))
              )}
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
        closeOnBackdrop={!mutations.replaceAll.isPending}
        footer={
          <FormActions
            onCancel={() => setModal({ open: false, mode: 'create', values: {} })}
            isLoading={mutations.replaceAll.isPending}
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
        onConfirm={() => del.confirm((item) => mutations.replaceAll.mutateAsync(data.filter((r) => r.nama !== item.nama)))}
      />
    </div>
  );
};
