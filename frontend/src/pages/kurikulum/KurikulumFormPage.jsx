import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { FormActions } from '../../components/common/FormActions';
import { PageSkeleton } from '../../components/common/PageSkeleton';
import { KurikulumForm } from '../../components/kurikulum/KurikulumForm';
import { useResourceMutations } from '../../hooks/useResourceMutations';
import { useResourceItem } from '../../hooks/useResourceQuery';

const empty = {
  program_studi_id: '',
  nama: '',
  tahun: '',
  masa_studi_ideal: 8,
  masa_studi_maksimal: 14,
};

export const KurikulumFormPage = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const existing = useResourceItem('kurikulum', id);
  const [values, setValues] = useState({ ...empty, program_studi_id: params.get('prodi') || '' });
  const isEdit = Boolean(id);
  const mutations = useResourceMutations('kurikulum');
  const saving = mutations.create.isPending || mutations.update.isPending;

  useEffect(() => {
    if (existing.data) {
      setValues({
        program_studi_id: existing.data.program_studi_id || '',
        nama: existing.data.nama || '',
        tahun: existing.data.tahun || '',
        masa_studi_ideal: existing.data.masa_studi_ideal ?? 8,
        masa_studi_maksimal: existing.data.masa_studi_maksimal ?? 14,
      });
    }
  }, [existing.data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    const payload = {
      ...values,
      tahun: values.tahun === '' ? null : Number(values.tahun),
      masa_studi_ideal: Number(values.masa_studi_ideal),
      masa_studi_maksimal: Number(values.masa_studi_maksimal),
    };
    if (isEdit) {
      await mutations.update.mutateAsync({ id, payload });
    } else {
      await mutations.create.mutateAsync(payload);
    }
    navigate('/kurikulum/data');
  };

  if (isEdit && existing.isPending) return <PageSkeleton cards={1} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? 'Ubah Kurikulum' : 'Tambah Kurikulum'}
        breadcrumbs={[
          { label: 'Kurikulum' },
          { label: 'Data Kurikulum', path: '/kurikulum/data' },
          { label: isEdit ? 'Ubah' : 'Tambah' },
        ]}
      />
      <Card title="Form Kurikulum">
        <form onSubmit={handleSubmit}>
          <KurikulumForm values={values} onChange={setValues} />
          <div className="mt-4">
            <FormActions
              onCancel={() => navigate('/kurikulum/data')}
              submitLabel={isEdit ? 'Perbarui' : 'Simpan'}
              isLoading={saving}
            />
          </div>
        </form>
      </Card>
    </div>
  );
};
