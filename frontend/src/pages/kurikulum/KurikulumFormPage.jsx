import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { FormActions } from '../../components/common/FormActions';
import { KurikulumForm } from '../../components/kurikulum/KurikulumForm';
import { useResourceMutations } from '../../hooks/useResourceMutations';
import { KURIKULUM_LIST } from '../../constants/mockData';

const empty = {
  nama: '',
  tahun: '',
  skRektor: '',
  tanggalKeputusan: '',
  pihak: '',
  tanggalDisetujui: '',
  masaIdeal: 8,
  masaMaks: 14,
};

export const KurikulumFormPage = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const existing = id ? KURIKULUM_LIST.find((k) => k.id === id) : null;
  const [values, setValues] = useState(existing ? { ...existing } : empty);
  const isEdit = Boolean(existing);
  const mutations = useResourceMutations('kurikulum', {
    create: params.get('prodi') ? `Kurikulum ditambahkan untuk ${params.get('prodi')}.` : undefined,
  });
  const saving = mutations.create.isPending || mutations.update.isPending;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (isEdit) {
      await mutations.update.mutateAsync({ id: values.id, payload: values });
    } else {
      await mutations.create.mutateAsync({ ...values, prodi: params.get('prodi') || values.prodi });
    }
    navigate('/kurikulum/data');
  };

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
