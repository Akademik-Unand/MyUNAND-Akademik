import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { FormActions } from '../components/common/FormActions';
import { ProdiForm } from '../components/master/ProdiForm';
import { PRODI } from '../constants/mockData';

const empty = { kode: '', jenjang: 'S1', model: '', univ: '', fakultas: '', departemen: '', nama: '', singkat: '' };

export const ProdiFormPage = () => {
  const { kode } = useParams();
  const navigate = useNavigate();
  const existing = kode ? PRODI.find((p) => p.kode === decodeURIComponent(kode)) : null;
  const [values, setValues] = useState(existing ? { ...existing } : empty);
  const isEdit = Boolean(existing);

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success(isEdit ? 'Program studi berhasil diperbarui' : 'Program studi berhasil ditambahkan', {
      description: 'Perubahan hanya disimpan di sesi ini (data mock).',
    });
    navigate('/master/prodi');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? 'Ubah Program Studi' : 'Tambah Program Studi'}
        subtitle={isEdit ? `Mengubah ${existing.nama}` : 'Lengkapi data program studi'}
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
            <FormActions onCancel={() => navigate('/master/prodi')} submitLabel={isEdit ? 'Perbarui' : 'Simpan'} />
          </div>
        </form>
      </Card>
    </div>
  );
};
