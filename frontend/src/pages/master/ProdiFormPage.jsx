import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { FormActions } from '../../components/common/FormActions';
import { PageSkeleton } from '../../components/common/PageSkeleton';
import { ProdiForm } from '../../components/master/ProdiForm';
import { useResourceMutations } from '../../hooks/useResourceMutations';
import { useResourceItem } from '../../hooks/useResourceQuery';

const empty = {
  kode_prodi: '',
  jenjang_akademik_id: '',
  model_kurikulum_id: '',
  universitas_id: '',
  fakultas_id: '',
  departemen_id: '',
  nama_resmi: '',
  nama_singkat: '',
};

export const ProdiFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const existing = useResourceItem('prodi', id);
  const [values, setValues] = useState(empty);
  const isEdit = Boolean(id);
  const mutations = useResourceMutations('prodi');
  const saving = mutations.create.isPending || mutations.update.isPending;

  useEffect(() => {
    if (existing.data) {
      setValues({
        ...empty,
        ...existing.data,
        jenjang_akademik_id: existing.data.jenjang_akademik_id || '',
        model_kurikulum_id: existing.data.model_kurikulum_id || '',
        universitas_id: existing.data.universitas_id || '',
        fakultas_id: existing.data.fakultas_id || '',
        departemen_id: existing.data.departemen_id || '',
      });
    }
  }, [existing.data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    const payload = {
      ...values,
      jenjang_akademik_id: values.jenjang_akademik_id || null,
      model_kurikulum_id: values.model_kurikulum_id || null,
      universitas_id: values.universitas_id || null,
      departemen_id: values.departemen_id || null,
    };
    if (isEdit) {
      await mutations.update.mutateAsync({ id, payload });
    } else {
      await mutations.create.mutateAsync(payload);
    }
    navigate('/master/prodi');
  };

  if (isEdit && existing.isPending) return <PageSkeleton cards={1} />;

  return (
    <div className="space-y-4">
      <PageHeader
        title={isEdit ? 'Ubah Program Studi' : 'Tambah Program Studi'}
        subtitle={isEdit ? `Mengubah ${values.nama_resmi || ''}` : 'Lengkapi data program studi'}
        breadcrumbs={[
          { label: 'Master Data' },
          { label: 'Program Studi', path: '/master/prodi' },
          { label: isEdit ? 'Ubah' : 'Tambah' },
        ]}
      />
      <Card title={isEdit ? 'Form Ubah' : 'Form Tambah'}>
        <form onSubmit={handleSubmit}>
          <ProdiForm values={values} onChange={setValues} />
          <div className="mt-4">
            <FormActions
              onCancel={() => navigate('/master/prodi')}
              submitLabel={isEdit ? 'Perbarui' : 'Simpan'}
              isLoading={saving}
            />
          </div>
        </form>
      </Card>
    </div>
  );
};
