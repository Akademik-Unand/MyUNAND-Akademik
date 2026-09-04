import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { FormActions } from '../../components/common/FormActions';
import { PageSkeleton } from '../../components/common/PageSkeleton';
import { CpmkForm } from '../../components/kurikulum/CpmkForm';
import { useResourceMutations } from '../../hooks/useResourceMutations';
import { useResourceItem, useResourceQuery } from '../../hooks/useResourceQuery';

const empty = { nama_cpmk: '', deskripsi: '', scp_ids: [], has_sub: false };

const querySuffix = (kurikulumId) => (kurikulumId ? `?kurikulum_id=${kurikulumId}` : '');

export const CpmkFormPage = () => {
  const { id, cpmkId } = useParams();
  const location = useLocation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const isSubCreate = location.pathname.endsWith('/sub/baru');
  const isEdit = Boolean(cpmkId) && !isSubCreate;
  const mk = useResourceItem('matakuliah', id);
  const mkLinks = useResourceQuery('mk-semester', {
    params: id ? { filter: { matakuliah_id: id } } : {},
    enabled: Boolean(id),
  });
  const existing = useResourceItem('cpmk-detail', isEdit ? cpmkId : null);
  const parent = useResourceItem('cpmk-detail', isSubCreate ? cpmkId : null);
  const [values, setValues] = useState(empty);
  const isChild = isSubCreate || Boolean(existing.data?.parent_cpmk_id);
  const mutations = useResourceMutations('cpmk-detail', {
    create: isSubCreate ? 'Sub-CPMK berhasil ditambahkan.' : 'CPMK berhasil ditambahkan.',
    update: isChild ? 'Sub-CPMK berhasil diperbarui.' : 'CPMK berhasil diperbarui.',
  });
  const saving = mutations.create.isPending || mutations.update.isPending;
  const kurikulumId =
    params.get('kurikulum_id') ||
    mk.data?.kurikulum?.[0]?.id ||
    mk.data?.matakuliahKurikulum?.[0]?.kurikulum_id ||
    mkLinks.data?.[0]?.kurikulum_id ||
    '';
  const suffix = querySuffix(kurikulumId);
  const backTo = `/kurikulum/cpmk/${id}${suffix}`;
  const isRootCreate = !isEdit && !isSubCreate;
  const showHasSub = isRootCreate;
  const scpRequired = isChild || (isRootCreate && !values.has_sub);
  const showScp = isChild || isRootCreate || isEdit;

  useEffect(() => {
    if (!existing.data) return;
    setValues({
      nama_cpmk: existing.data.nama_cpmk || '',
      deskripsi: existing.data.deskripsi || '',
      scp_ids: (existing.data.scp || []).map((row) => row.id),
      has_sub: false,
    });
  }, [existing.data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (scpRequired && !(values.scp_ids || []).length) {
      toast.error('Pilih minimal satu SCP pada CP yang terkait.');
      return;
    }
    const payload = {
      matakuliah_id: id,
      nama_cpmk: values.nama_cpmk,
      deskripsi: values.deskripsi || null,
      parent_cpmk_id: isSubCreate ? cpmkId : existing.data?.parent_cpmk_id || null,
      scp_ids: values.scp_ids || [],
    };
    if (isEdit) {
      await mutations.update.mutateAsync({ id: cpmkId, payload });
      navigate(backTo);
      return;
    }
    const created = await mutations.create.mutateAsync(payload);
    if (isRootCreate && values.has_sub && created?.id) {
      navigate(`/kurikulum/cpmk/${id}/${created.id}/sub/baru${suffix}`);
      return;
    }
    navigate(backTo);
  };

  if (mk.isPending || (isEdit && existing.isPending)) return <PageSkeleton cards={1} />;

  const title = isSubCreate
    ? 'Tambah Sub-CPMK'
    : isEdit
      ? existing.data?.parent_cpmk_id
        ? 'Ubah Sub-CPMK'
        : 'Ubah CPMK'
      : 'Tambah CPMK';

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        subtitle={`${mk.data?.nama_resmi || ''} | ${mk.data?.kode_matakuliah || ''}${
          isSubCreate && parent.data?.nama_cpmk ? ` | Induk: ${parent.data.nama_cpmk}` : ''
        }`}
        breadcrumbs={[
          { label: 'Kurikulum' },
          { label: 'CPMK Kurikulum', path: '/kurikulum/cpmk' },
          { label: 'Kelola CPMK', path: backTo },
          { label: isEdit ? 'Ubah' : 'Tambah' },
        ]}
      />
      <Card title="Form">
        <form onSubmit={handleSubmit}>
          <CpmkForm
            values={values}
            onChange={setValues}
            showScp={showScp}
            showHasSub={showHasSub}
            scpRequired={scpRequired}
            kurikulumId={kurikulumId}
          />
          <div className="mt-4">
            <FormActions
              onCancel={() => navigate(backTo)}
              submitLabel={isEdit ? 'Perbarui' : 'Simpan'}
              isLoading={saving}
            />
          </div>
        </form>
      </Card>
    </div>
  );
};
