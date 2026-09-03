import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { FormActions } from '../components/common/FormActions';
import { KurikulumForm } from '../components/kurikulum/KurikulumForm';
import { KURIKULUM_LIST } from '../constants/mockData';

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

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success(isEdit ? 'Kurikulum berhasil diperbarui' : 'Kurikulum berhasil ditambahkan', {
      description: params.get('prodi') ? `Prodi: ${params.get('prodi')}` : 'Data mock sesi ini.',
    });
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
            <FormActions onCancel={() => navigate('/kurikulum/data')} submitLabel={isEdit ? 'Perbarui' : 'Simpan'} />
          </div>
        </form>
      </Card>
    </div>
  );
};
