import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { FormActions } from '../../components/common/FormActions';
import { SettingSemesterForm } from '../../components/master/SettingSemesterForm';
import { useResourceMutations } from '../../hooks/useResourceMutations';
import { SETTING_SEMESTER } from '../../constants/mockData';

const empty = {
  tahun: '',
  semester: 'Genap',
  periodeMulai: '',
  periodeSelesai: '',
  rencanaMulai: '',
  rencanaSelesai: '',
  ubahMulai: '',
  ubahSelesai: '',
  nilaiMulai: '',
  nilaiSelesai: '',
};

export const SettingSemesterFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const existing = id ? SETTING_SEMESTER.find((s) => s.id === id) : null;
  const [values, setValues] = useState(existing ? { ...existing } : empty);
  const isEdit = Boolean(existing);
  const mutations = useResourceMutations('setting-semester');
  const saving = mutations.create.isPending || mutations.update.isPending;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (isEdit) {
      await mutations.update.mutateAsync({ id: values.id, payload: values });
    } else {
      await mutations.create.mutateAsync(values);
    }
    navigate('/master/semester/setting');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? 'Ubah Setting Semester' : 'Tambah Setting Semester'}
        subtitle="Atur periode akademik, KRS, dan input nilai"
        breadcrumbs={[
          { label: 'Master Data' },
          { label: 'Setting Semester', path: '/master/semester/setting' },
          { label: isEdit ? 'Ubah' : 'Tambah' },
        ]}
      />
      <Card title="Form Setting Semester">
        <form onSubmit={handleSubmit}>
          <SettingSemesterForm values={values} onChange={setValues} />
          <div className="mt-4">
            <FormActions
              onCancel={() => navigate('/master/semester/setting')}
              submitLabel={isEdit ? 'Perbarui' : 'Simpan'}
              isLoading={saving}
            />
          </div>
        </form>
      </Card>
    </div>
  );
};
