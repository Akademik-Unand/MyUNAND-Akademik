import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { FilterBar } from '../components/common/FilterBar';
import { PageSkeleton } from '../components/common/PageSkeleton';
import { Modal } from '../components/ui/Modal';
import { Drawer } from '../components/ui/Drawer';
import { DetailList } from '../components/common/DetailList';
import { ConfirmDeleteModal } from '../components/common/ConfirmDeleteModal';
import { FormActions } from '../components/common/FormActions';
import { CPForm, SCPForm } from '../components/kurikulum/CPForms';
import { useMockQuery } from '../hooks/useMockQuery';
import { useConfirmDelete } from '../hooks/useConfirmDelete';
import { KURIKULUM_CP, FILTER_DEPARTEMEN, FILTER_PRODI, FILTER_KURIKULUM } from '../constants/mockData';

const filterFields = [
  { label: 'Departemen', placeholder: 'Pilih Departemen', options: FILTER_DEPARTEMEN.map((d) => ({ value: d, label: d })) },
  { label: 'Prodi', placeholder: 'Pilih', options: FILTER_PRODI.map((p) => ({ value: p, label: p })) },
  { label: 'Kurikulum', placeholder: 'Pilih Kurikulum', options: FILTER_KURIKULUM.map((k) => ({ value: k, label: k })) },
];

export const CPKurikulumPage = () => {
  const { data, isLoading, setData } = useMockQuery(KURIKULUM_CP);
  const del = useConfirmDelete();
  const [cpModal, setCpModal] = useState({ open: false, mode: 'create', values: {} });
  const [scpModal, setScpModal] = useState({ open: false, parent: null, values: {} });
  const [detail, setDetail] = useState(null);

  const saveCp = (e) => {
    e.preventDefault();
    if (cpModal.mode === 'create') {
      setData((prev) => [
        { kode: cpModal.values.kode, deskripsi: cpModal.values.deskripsi, targetAktif: true, scp: [] },
        ...prev,
      ]);
      toast.success('CP berhasil ditambahkan');
    } else {
      setData((prev) =>
        prev.map((so) => (so.kode === cpModal.values.kode ? { ...so, ...cpModal.values } : so))
      );
      toast.success('CP berhasil diperbarui');
    }
    setCpModal({ open: false, mode: 'create', values: {} });
  };

  const saveScp = (e) => {
    e.preventDefault();
    setData((prev) =>
      prev.map((so) =>
        so.kode === scpModal.parent
          ? { ...so, scp: [...so.scp, { ...scpModal.values }] }
          : so
      )
    );
    toast.success('SCP berhasil ditambahkan');
    setScpModal({ open: false, parent: null, values: {} });
  };

  if (isLoading) return <PageSkeleton showFilter cards={3} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola CP"
        subtitle="Kelola capaian pembelajaran (CP) dan sub-CP (SCP) pada kurikulum"
        breadcrumbs={[{ label: 'Kurikulum' }, { label: 'CP Kurikulum' }]}
        action={
          <Button size="sm" className="gap-1.5 font-semibold" onClick={() => setCpModal({ open: true, mode: 'create', values: {} })}>
            <Plus size={15} /> Tambah CP
          </Button>
        }
      />

      <Card title="Filter">
        <FilterBar fields={filterFields} />
      </Card>

      <div className="space-y-4">
        {data.map((so) => (
          <Card key={so.kode}>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-3">
              <button type="button" className="text-left flex items-start gap-3" onClick={() => setDetail(so)}>
                <Badge variant="primary">{so.kode}</Badge>
                <p className="text-sm text-base-content/80 leading-relaxed">{so.deskripsi}</p>
              </button>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="success" outline>Aktif</Badge>
                <button className="btn btn-xs btn-ghost text-warning" onClick={() => setCpModal({ open: true, mode: 'edit', values: so })}>
                  <Pencil size={14} />
                </button>
                <button className="btn btn-xs btn-ghost text-error" onClick={() => del.askDelete(so)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <p className="text-xs text-base-content/60 mb-3">
              Target {so.kode}: <strong>60%</strong> — Nilai Minimal: <strong>55 dari skala 100</strong>
            </p>
            <table className="table table-sm w-full">
              <thead>
                <tr className="text-xs uppercase text-base-content/60">
                  <th>SCP</th>
                  <th>Deskripsi</th>
                  <th>Target</th>
                  <th>Nilai Minimal Target</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {so.scp.map((row) => (
                  <tr key={row.kode}>
                    <td className="font-semibold">{row.kode}</td>
                    <td>{row.deskripsi}</td>
                    <td>{row.target}</td>
                    <td>{row.nilaiMinimal}</td>
                    <td>
                      <span className="badge badge-success badge-outline badge-sm">Aktif</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3">
              <Button variant="secondary" size="xs" className="gap-1" onClick={() => setScpModal({ open: true, parent: so.kode, values: {} })}>
                <Plus size={13} /> Tambah SCP
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={cpModal.open} onClose={() => setCpModal({ open: false, mode: 'create', values: {} })} title={cpModal.mode === 'create' ? 'Tambah CP' : 'Ubah CP'} footer={<FormActions onCancel={() => setCpModal({ open: false, mode: 'create', values: {} })} onSubmitClick={() => document.getElementById('cp-form')?.requestSubmit()} />}>
        <form id="cp-form" onSubmit={saveCp}>
          <CPForm values={cpModal.values} onChange={(values) => setCpModal((m) => ({ ...m, values }))} />
        </form>
      </Modal>

      <Modal open={scpModal.open} onClose={() => setScpModal({ open: false, parent: null, values: {} })} title={`Tambah SCP — ${scpModal.parent || ''}`} footer={<FormActions onCancel={() => setScpModal({ open: false, parent: null, values: {} })} onSubmitClick={() => document.getElementById('scp-form')?.requestSubmit()} />}>
        <form id="scp-form" onSubmit={saveScp}>
          <SCPForm values={scpModal.values} onChange={(values) => setScpModal((m) => ({ ...m, values }))} />
        </form>
      </Modal>

      <Drawer open={Boolean(detail)} onClose={() => setDetail(null)} title={`Detail ${detail?.kode || 'CP'}`}>
        {detail && (
          <DetailList
            items={[
              { label: 'Kode', value: detail.kode },
              { label: 'Deskripsi', value: detail.deskripsi },
              { label: 'Jumlah SCP', value: detail.scp?.length },
              { label: 'Target', value: '60%' },
            ]}
          />
        )}
      </Drawer>

      <ConfirmDeleteModal
        open={del.isOpen}
        onClose={del.close}
        onConfirm={() => del.confirm((item) => setData((prev) => prev.filter((r) => r.kode !== item.kode)))}
      />
    </div>
  );
};
