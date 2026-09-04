import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { FormActions } from '../../components/common/FormActions';
import { PageSkeleton } from '../../components/common/PageSkeleton';
import { ResourceSelect } from '../../components/common/ResourceSelect';
import { LaporanCpPickTable } from '../../components/laporan-cp/LaporanCpPickTable';
import { useResourceMutations } from '../../hooks/useResourceMutations';
import { useResourceItem } from '../../hooks/useResourceQuery';
import { useLaporanCpPreview } from '../../hooks/useLaporanCpPreview';
import { itemsFromSelected, selectedFromItems } from '../../helpers/laporanCp';
import { semesterDanSebelumnyaLabel } from '../../helpers/semesterProdi';

const empty = {
  nama_laporan: '',
  keterangan: '',
  kurikulum_id: '',
  semester_id: '',
};

export const LaporanCPFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const existing = useResourceItem('laporan-cp', id);
  const [values, setValues] = useState(empty);
  const [selected, setSelected] = useState(() => new Set());
  const isEdit = Boolean(id);
  const mutations = useResourceMutations('laporan-cp');
  const saving = mutations.create.isPending || mutations.update.isPending;
  const preview = useLaporanCpPreview(values.kurikulum_id, values.semester_id);
  const rows = preview.data || [];

  useEffect(() => {
    if (!existing.data) return;
    setValues({
      nama_laporan: existing.data.nama_laporan || '',
      keterangan: existing.data.keterangan || '',
      kurikulum_id: existing.data.kurikulum_id || '',
      semester_id: existing.data.semester_id || '',
    });
    setSelected(selectedFromItems(existing.data.items || []));
  }, [existing.data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (!values.kurikulum_id) {
      toast.error('Pilih kurikulum.');
      return;
    }
    const payload = {
      nama_laporan: values.nama_laporan,
      keterangan: values.keterangan || null,
      kurikulum_id: values.kurikulum_id,
      semester_id: values.semester_id || null,
      items: itemsFromSelected(rows, selected),
    };
    if (isEdit) {
      await mutations.update.mutateAsync({ id, payload });
    } else {
      await mutations.create.mutateAsync(payload);
    }
    navigate('/perkuliahan/laporan-cp');
  };

  if (isEdit && existing.isPending) return <PageSkeleton cards={2} />;

  return (
    <div className="space-y-4">
      <PageHeader
        title={isEdit ? 'Ubah Laporan CP' : 'Buat Laporan CP'}
        breadcrumbs={[
          { label: 'Semester & Perkuliahan' },
          { label: 'Laporan CP', path: '/perkuliahan/laporan-cp' },
          { label: isEdit ? 'Ubah' : 'Tambah' },
        ]}
      />
      <Card title="Data Laporan">
        <form id="laporan-cp-form" onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
          <Input
            label="Judul *"
            value={values.nama_laporan}
            onChange={(e) => setValues({ ...values, nama_laporan: e.target.value })}
            required
          />
          <Textarea
            label="Keterangan"
            value={values.keterangan}
            onChange={(e) => setValues({ ...values, keterangan: e.target.value })}
          />
          <ResourceSelect
            resource="kurikulum"
            label="Kurikulum *"
            value={values.kurikulum_id}
            onChange={(e) => {
              setValues({ ...values, kurikulum_id: e.target.value });
              setSelected(new Set());
            }}
            getLabel={(row) => row.nama || String(row.tahun || row.id)}
            required
          />
          <ResourceSelect
            resource="setting-semester"
            label="Semester"
            value={values.semester_id}
            onChange={(e) => setValues({ ...values, semester_id: e.target.value })}
            getLabel={(row) => semesterDanSebelumnyaLabel(row)}
            placeholder="Semua semester"
            params={{ sortBy: 'tahun', sortOrder: 'desc' }}
          />
        </form>
      </Card>

      <Card title="Pilih mata kuliah yang memenuhi CP/SCP">
        {!values.kurikulum_id ? (
          <p className="text-sm text-base-content/60">Pilih kurikulum untuk menampilkan pemetaan CP, SCP, CPMK, dan mata kuliah.</p>
        ) : preview.isPending ? (
          <PageSkeleton showFilter={false} tableCols={8} />
        ) : preview.isError ? (
          <p className="text-sm text-error">{preview.error?.message || 'Gagal memuat pratinjau.'}</p>
        ) : (
          <LaporanCpPickTable rows={rows} selected={selected} onChange={setSelected} />
        )}
        <div className="mt-4">
          <FormActions
            formId="laporan-cp-form"
            onCancel={() => navigate('/perkuliahan/laporan-cp')}
            submitLabel={isEdit ? 'Perbarui' : 'Simpan'}
            isLoading={saving}
          />
        </div>
      </Card>
    </div>
  );
};
