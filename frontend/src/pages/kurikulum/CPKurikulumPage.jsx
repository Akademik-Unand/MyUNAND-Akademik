import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { IconButton } from '../../components/common/IconButton';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { FilterBar } from '../../components/common/FilterBar';
import { PageSkeleton } from '../../components/common/PageSkeleton';
import { Modal } from '../../components/ui/Modal';
import { Drawer } from '../../components/ui/Drawer';
import { DetailList } from '../../components/common/DetailList';
import { ConfirmDeleteModal } from '../../components/common/ConfirmDeleteModal';
import { FormActions } from '../../components/common/FormActions';
import { CPForm, SCPForm } from '../../components/kurikulum/CPForms';
import { useResourceQuery } from '../../hooks/useResourceQuery';
import { useResourceMutations } from '../../hooks/useResourceMutations';
import { useConfirmDelete } from '../../hooks/useConfirmDelete';
import { Can } from '../../components/auth/Can';
import { useAcademicFilter } from '../../hooks/useAcademicFilter';

const FILTER_KEYS = ['fakultas', 'departemen', 'prodi', 'kurikulum'];

export const CPKurikulumPage = () => {
  const academic = useAcademicFilter({ keys: FILTER_KEYS });
  const kurikulumId = academic.applied.kurikulumId;
  const extraFilter = academic.extraFilter;
  const query = useResourceQuery('kurikulum-cp', {
    params: extraFilter ? { filter: extraFilter } : {},
    enabled: Boolean(extraFilter),
  });
  const cpMutations = useResourceMutations('kurikulum-cp', {
    create: 'CP berhasil ditambahkan.',
    update: 'CP berhasil diperbarui.',
    remove: 'CP berhasil dihapus.',
  });
  const scpMutations = useResourceMutations('kurikulum-scp', {
    create: 'SCP berhasil ditambahkan.',
    update: 'SCP berhasil diperbarui.',
    remove: 'SCP berhasil dihapus.',
  });
  const del = useConfirmDelete();
  const [cpModal, setCpModal] = useState({ open: false, mode: 'create', values: {} });
  const [scpModal, setScpModal] = useState({ open: false, parent: null, values: {} });
  const [detail, setDetail] = useState(null);
  const data = query.data ?? [];
  const saving = cpMutations.create.isPending || cpMutations.update.isPending || scpMutations.create.isPending || scpMutations.update.isPending;

  const saveCp = async (e) => {
    e.preventDefault();
    if (saving) return;
    const payload = {
      kurikulum_id: kurikulumId || cpModal.values.kurikulum_id,
      nama_cp: cpModal.values.nama_cp,
      deskripsi: cpModal.values.deskripsi || null,
      nilai_max: Number(cpModal.values.nilai_max ?? 100),
      nilai_min: Number(cpModal.values.nilai_min ?? 0),
    };
    if (cpModal.mode === 'create') {
      await cpMutations.create.mutateAsync(payload);
    } else {
      await cpMutations.update.mutateAsync({ id: cpModal.values.id, payload });
    }
    setCpModal({ open: false, mode: 'create', values: {} });
  };

  const saveScp = async (e) => {
    e.preventDefault();
    if (saving) return;
    const payload = {
      cp_id: scpModal.parent,
      nama_scp: scpModal.values.nama_scp,
      deskripsi: scpModal.values.deskripsi || null,
      persen_capai_nilai_min: Number(scpModal.values.persen_capai_nilai_min ?? 0),
      nilai_min: Number(scpModal.values.nilai_min ?? 0),
    };
    if (scpModal.mode === 'edit') {
      await scpMutations.update.mutateAsync({ id: scpModal.values.id, payload });
    } else {
      await scpMutations.create.mutateAsync(payload);
    }
    setScpModal({ open: false, parent: null, values: {} });
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Kelola CP"
        subtitle="Kelola capaian pembelajaran (CP) dan sub-CP (SCP) pada kurikulum"
        breadcrumbs={[{ label: 'Kurikulum' }, { label: 'CP Kurikulum' }]}
        action={
          <Can I="create" a="Cp">
            <Button
              size="sm"
              className="gap-1.5 font-semibold"
              disabled={!kurikulumId}
              title={!kurikulumId ? 'Pilih kurikulum dulu' : undefined}
              onClick={() => setCpModal({ open: true, mode: 'create', values: { kurikulum_id: kurikulumId } })}
            >
              <Plus size={15} /> Tambah CP
            </Button>
          </Can>
        }
      />

      <Card title="Filter">
        <FilterBar
          fields={academic.fields}
          onApply={academic.apply}
          onReset={academic.reset}
          applyDisabled={!academic.canApply}
        />
      </Card>

      <div className="space-y-4">
        {extraFilter && query.isPending && <PageSkeleton showFilter={false} cards={3} />}
        {data.map((so) => (
          <Card key={so.id}>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-3">
              <button type="button" className="text-left flex flex-col items-start gap-2 min-w-0 flex-1" onClick={() => setDetail(so)}>
                <Badge variant="primary" wrap>
                  {so.nama_cp}
                </Badge>
                {so.deskripsi && (
                  <p className="text-sm text-base-content/80 leading-relaxed">{so.deskripsi}</p>
                )}
              </button>
              <div className="flex items-center gap-2 shrink-0">
                <Can I="update" a="Cp">
                  <IconButton
                    label="Ubah CP"
                    icon={Pencil}
                    tone="text-warning"
                    onClick={() => setCpModal({ open: true, mode: 'edit', values: so })}
                  />
                </Can>
                <Can I="delete" a="Cp">
                  <IconButton
                    label="Hapus CP"
                    icon={Trash2}
                    tone="text-error"
                    tooltipPosition="tooltip-left"
                    onClick={() => del.askDelete(so)}
                  />
                </Can>
              </div>
            </div>
            <p className="text-xs text-base-content/60 mb-3">
              Nilai {so.nama_cp}: <strong>{so.nilai_min}</strong> — <strong>{so.nilai_max}</strong>
            </p>
            <table className="table table-sm w-full">
              <thead>
                <tr className="text-xs uppercase text-base-content/60">
                  <th>SCP</th>
                  <th>Deskripsi</th>
                  <th>Target</th>
                  <th>Nilai Minimal</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {(so.scp || []).map((row) => (
                  <tr key={row.id}>
                    <td className="font-semibold">{row.nama_scp}</td>
                    <td>{row.deskripsi}</td>
                    <td>{row.persen_capai_nilai_min}</td>
                    <td>{row.nilai_min}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Can I="update" a="Scp">
                          <IconButton
                            label="Ubah SCP"
                            icon={Pencil}
                            tone="text-warning"
                            onClick={() =>
                              setScpModal({ open: true, parent: so.id, values: row, mode: 'edit' })
                            }
                          />
                        </Can>
                        <Can I="delete" a="Scp">
                          <IconButton
                            label="Hapus SCP"
                            icon={Trash2}
                            tone="text-error"
                            onClick={() => scpMutations.remove.mutateAsync(row.id)}
                          />
                        </Can>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3">
              <Can I="create" a="Scp">
                <Button
                  variant="secondary"
                  size="xs"
                  className="gap-1"
                  onClick={() => setScpModal({ open: true, parent: so.id, values: {}, mode: 'create' })}
                >
                  <Plus size={13} /> Tambah SCP
                </Button>
              </Can>
            </div>
          </Card>
        ))}
        {!query.isPending && data.length === 0 && (
          <p className="text-sm text-base-content/60">
            {extraFilter
              ? 'Belum ada CP pada filter ini. Tambah CP setelah kurikulum dipilih.'
              : 'Pilih fakultas hingga kurikulum, lalu klik Terapkan.'}
          </p>
        )}
      </div>

      <Modal
        open={cpModal.open}
        onClose={() => setCpModal({ open: false, mode: 'create', values: {} })}
        title={cpModal.mode === 'create' ? 'Tambah CP' : 'Ubah CP'}
        closeOnBackdrop={!saving}
        footer={
          <FormActions
            onCancel={() => setCpModal({ open: false, mode: 'create', values: {} })}
            isLoading={saving}
            onSubmitClick={() => document.getElementById('cp-form')?.requestSubmit()}
          />
        }
      >
        <form id="cp-form" onSubmit={saveCp}>
          <CPForm values={cpModal.values} onChange={(values) => setCpModal((m) => ({ ...m, values }))} />
        </form>
      </Modal>

      <Modal
        open={scpModal.open}
        onClose={() => setScpModal({ open: false, parent: null, values: {} })}
        title={`${scpModal.mode === 'edit' ? 'Ubah' : 'Tambah'} SCP`}
        closeOnBackdrop={!saving}
        footer={
          <FormActions
            onCancel={() => setScpModal({ open: false, parent: null, values: {} })}
            isLoading={saving}
            onSubmitClick={() => document.getElementById('scp-form')?.requestSubmit()}
          />
        }
      >
        <form id="scp-form" onSubmit={saveScp}>
          <SCPForm values={scpModal.values} onChange={(values) => setScpModal((m) => ({ ...m, values }))} />
        </form>
      </Modal>

      <Drawer open={Boolean(detail)} onClose={() => setDetail(null)} title={`Detail ${detail?.nama_cp || 'CP'}`}>
        {detail && (
          <DetailList
            items={[
              { label: 'Nama', value: detail.nama_cp },
              { label: 'Deskripsi', value: detail.deskripsi },
              { label: 'Jumlah SCP', value: detail.scp?.length },
              { label: 'Nilai min / max', value: `${detail.nilai_min} / ${detail.nilai_max}` },
            ]}
          />
        )}
      </Drawer>

      <ConfirmDeleteModal
        open={del.isOpen}
        onClose={del.close}
        isLoading={del.pending}
        onConfirm={() => del.confirm((item) => cpMutations.remove.mutateAsync(item.id))}
      />
    </div>
  );
};
