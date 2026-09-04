import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { FormActions } from '../../components/common/FormActions';
import { PageSkeleton } from '../../components/common/PageSkeleton';
import { SettingSemesterForm } from '../../components/master/SettingSemesterForm';
import { useResourceMutations } from '../../hooks/useResourceMutations';
import { useResourceItem } from '../../hooks/useResourceQuery';

const empty = {
  tahun: '',
  jenis_semester_id: '',
  tanggal_mulai: '',
  tanggal_selesai: '',
};

export const SettingSemesterFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const existing = useResourceItem('setting-semester', id);
  const [values, setValues] = useState(empty);
  const isEdit = Boolean(id);
  const mutations = useResourceMutations('setting-semester');
  const saving = mutations.create.isPending || mutations.update.isPending;

  useEffect(() => {
    if (existing.data) {
      setValues({
        tahun: existing.data.tahun || '',
        jenis_semester_id: existing.data.jenis_semester_id || '',
        tanggal_mulai: existing.data.tanggal_mulai || '',
        tanggal_selesai: existing.data.tanggal_selesai || '',
      });
    }
  }, [existing.data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    const payload = {
      ...values,
      tahun: Number(values.tahun),
      tanggal_mulai: values.tanggal_mulai || null,
      tanggal_selesai: values.tanggal_selesai || null,
    };
    if (isEdit) {
      await mutations.update.mutateAsync({ id, payload });
    } else {
      await mutations.create.mutateAsync(payload);
    }
    navigate('/master/semester/setting');
  };

  if (isEdit && existing.isPending) return <PageSkeleton cards={1} />;

  return (
    <div className="space-y-4">
      <PageHeader
        title={isEdit ? 'Ubah Setting Semester' : 'Tambah Setting Semester'}
        subtitle="Atur tahun, jenis, dan periode semester"
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
