import { useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { FormActions } from '../../components/common/FormActions';
import { PageSkeleton } from '../../components/common/PageSkeleton';
import { CpmkForm } from '../../components/kurikulum/CpmkForm';
import { BulkCpmkFields } from '../../components/kurikulum/BulkCpmkFields';
import { useResourceMutations } from '../../hooks/useResourceMutations';
import { useResourceItem, useResourceQuery } from '../../hooks/useResourceQuery';
import { bulkCreateResourceItems } from '../../services/api';
import { cpmkBulkError, emptyCpmkRow, toCpmkPayload } from '../../helpers/cpmkForm';
import { useCpmkPeriodOpen } from '../../hooks/usePeriodes';

const querySuffix = (kurikulumId) => (kurikulumId ? `?kurikulum_id=${kurikulumId}` : '');

export const CpmkFormPage = () => {
  const { id, cpmkId } = useParams();
  const location = useLocation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isSubCreate = location.pathname.endsWith('/sub/baru');
  const isEdit = Boolean(cpmkId) && !isSubCreate;
  const isRootCreate = !isEdit && !isSubCreate;
  const mk = useResourceItem('matakuliah', id);
  const mkLinks = useResourceQuery('mk-semester', {
    params: id ? { filter: { matakuliah_id: id } } : {},
    enabled: Boolean(id),
  });
  const existing = useResourceItem('cpmk-detail', isEdit ? cpmkId : null);
  const parent = useResourceItem('cpmk-detail', isSubCreate ? cpmkId : null);
  const [rows, setRows] = useState(() => [emptyCpmkRow()]);
  const [values, setValues] = useState(() => emptyCpmkRow());
  const [syncedEditId, setSyncedEditId] = useState(null);
  const [bulkSaving, setBulkSaving] = useState(false);
  const isChild = isSubCreate || Boolean(existing.data?.parent_cpmk_id);
  const mutations = useResourceMutations('cpmk-detail', {
    create: isSubCreate ? 'Sub-CPMK berhasil ditambahkan.' : 'CPMK berhasil ditambahkan.',
    update: isChild ? 'Sub-CPMK berhasil diperbarui.' : 'CPMK berhasil diperbarui.',
  });
  const saving = mutations.create.isPending || mutations.update.isPending || bulkSaving;
  const kurikulumId =
    params.get('kurikulum_id') ||
    mk.data?.kurikulum?.[0]?.id ||
    mk.data?.matakuliahKurikulum?.[0]?.kurikulum_id ||
    mkLinks.data?.[0]?.kurikulum_id ||
    '';
  const suffix = querySuffix(kurikulumId);
  const backTo = `/kurikulum/cpmk/${id}${suffix}`;
  const hasChildren = Boolean(existing.data?.subCpmk?.length);
  const scpRequired = isChild || (isEdit && !isChild && !hasChildren);
  const showScp = isChild || (isEdit && !isChild && !hasChildren);
  const cpmkOpen = useCpmkPeriodOpen().open;

  // Muat nilai awal form edit begitu detail CPMK tersedia (guard biar hanya sekali).
  if (isEdit && existing.data && existing.data.id !== syncedEditId) {
    setSyncedEditId(existing.data.id);
    setValues({
      ...emptyCpmkRow(),
      nama_cpmk: existing.data.nama_cpmk || '',
      deskripsi: existing.data.deskripsi || '',
      scp_ids: (existing.data.scp || []).map((row) => row.id),
    });
  }

  const submitBulk = async (e) => {
    e.preventDefault();
    if (saving) return;
    const error = cpmkBulkError(rows);
    if (error) {
      toast.error(error);
      return;
    }
    const payload = rows.map((row) => toCpmkPayload(row, id));
    setBulkSaving(true);
    try {
      await bulkCreateResourceItems('cpmk-detail', payload);
      queryClient.invalidateQueries({ queryKey: ['table', 'cpmk-detail'] });
      queryClient.invalidateQueries({ queryKey: ['cpmk-detail'] });
      toast.success(`${payload.length} CPMK berhasil ditambahkan.`);
      navigate(backTo);
    } catch (err) {
      toast.error(err.message || 'Gagal menambahkan CPMK.');
    } finally {
      setBulkSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (scpRequired && !(values.scp_ids || []).length) {
      toast.error('Pilih minimal satu SCP pada CP yang terkait.');
      return;
    }
    const payload = {
      matakuliah_id: id,
      nama_cpmk: values.nama_cpmk?.trim() || '',
      deskripsi: values.deskripsi?.trim() || '',
      parent_cpmk_id: isSubCreate ? cpmkId : existing.data?.parent_cpmk_id || null,
      scp_ids: values.scp_ids || [],
    };
    if (isEdit) {
      await mutations.update.mutateAsync({ id: cpmkId, payload });
      navigate(backTo);
      return;
    }
    await mutations.create.mutateAsync(payload);
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
    <div className="space-y-4">
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
        {!cpmkOpen ? (
          <p className="text-sm text-base-content/70">Di luar periode CPMK. Form tidak tersedia.</p>
        ) : (
        <form onSubmit={isRootCreate ? submitBulk : handleSubmit}>
          {isRootCreate ? (
            <BulkCpmkFields rows={rows} onChange={setRows} kurikulumId={kurikulumId} />
          ) : (
            <CpmkForm
              values={values}
              onChange={setValues}
              showScp={showScp}
              showHasSub={false}
              scpRequired={scpRequired}
              kurikulumId={kurikulumId}
            />
          )}
          <div className="mt-4">
            <FormActions
              onCancel={() => navigate(backTo)}
              submitLabel={isEdit ? 'Perbarui' : 'Simpan'}
              isLoading={saving}
            />
          </div>
        </form>
        )}
      </Card>
    </div>
  );
};
