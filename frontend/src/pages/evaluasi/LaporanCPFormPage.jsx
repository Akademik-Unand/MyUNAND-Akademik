import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { FormActions } from '../../components/common/FormActions';
import { PageSkeleton } from '../../components/common/PageSkeleton';
import { ResourceSelect } from '../../components/common/ResourceSelect';
import { useResourceMutations } from '../../hooks/useResourceMutations';
import { useResourceItem } from '../../hooks/useResourceQuery';
import { useAuthStore } from '../../store/auth.store';

const empty = {
  nama_laporan: '',
  keterangan: '',
  program_studi_id: '',
  kurikulum_id: '',
  file_path: '',
};

export const LaporanCPFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const existing = useResourceItem('laporan-cp', id);
  const user = useAuthStore((state) => state.user);
  const [values, setValues] = useState(empty);
  const isEdit = Boolean(id);
  const mutations = useResourceMutations('laporan-cp');
  const saving = mutations.create.isPending || mutations.update.isPending;

  useEffect(() => {
    if (existing.data) {
      setValues({
        nama_laporan: existing.data.nama_laporan || '',
        keterangan: existing.data.keterangan || '',
        program_studi_id: existing.data.program_studi_id || '',
        kurikulum_id: existing.data.kurikulum_id || '',
        file_path: existing.data.file_path || '',
      });
    }
  }, [existing.data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    const payload = {
      ...values,
      kurikulum_id: values.kurikulum_id || null,
      file_path: values.file_path || null,
      dibuat_oleh: user?.id || null,
    };
    if (isEdit) {
      await mutations.update.mutateAsync({ id, payload });
    } else {
      await mutations.create.mutateAsync(payload);
    }
    navigate('/perkuliahan/laporan-cp');
  };

  if (isEdit && existing.isPending) return <PageSkeleton cards={1} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? 'Ubah Laporan CP' : 'Buat Laporan CP'}
        breadcrumbs={[
          { label: 'Semester & Perkuliahan' },
          { label: 'Laporan CP', path: '/perkuliahan/laporan-cp' },
          { label: isEdit ? 'Ubah' : 'Tambah' },
        ]}
      />
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Judul Laporan CP"
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
            resource="prodi"
            label="Program Studi *"
            value={values.program_studi_id}
            onChange={(e) => setValues({ ...values, program_studi_id: e.target.value })}
            required
          />
          <ResourceSelect
            resource="kurikulum"
            label="Kurikulum"
            value={values.kurikulum_id}
            onChange={(e) => setValues({ ...values, kurikulum_id: e.target.value })}
            getLabel={(row) => row.nama || String(row.tahun || row.id)}
          />
          <Input
            label="Path berkas"
            value={values.file_path}
            onChange={(e) => setValues({ ...values, file_path: e.target.value })}
          />
          <FormActions
            onCancel={() => navigate('/perkuliahan/laporan-cp')}
            submitLabel={isEdit ? 'Perbarui' : 'Simpan'}
            isLoading={saving}
          />
        </form>
      </Card>
    </div>
  );
};
