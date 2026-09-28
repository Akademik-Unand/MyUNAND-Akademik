import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Eye, ListTree } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { DataTable } from '../../components/common/DataTable';
import { FilterBar } from '../../components/common/FilterBar';
import { IconButton } from '../../components/common/IconButton';
import { CpmkOutline } from '../../components/cpmk/CpmkOutline';
import { RejectKrsModal } from '../../components/krs/RejectKrsModal';
import {
  approveKrs,
  getKrsApprovalSemesters,
  rejectKrs,
} from '../../services/krs.service';
import { semesterAkademikLabel } from '../../helpers/academicLabel';
import { programStudiLabel } from '../../helpers/academicLabel';
import { kelasDosenNames, kelasJadwalLines } from '../../helpers/kelasInfo';
import {
  krsRowStatus,
  approvalStatusLabel,
} from '../../utils/crossEnrollment';

const DETIL_STATUS_VARIANT = {
  pending_pa: 'warning',
  approved: 'success',
  rejected: 'error',
};

const detilStatus = (row) => {
  const status = krsRowStatus(row);
  return {
    label: approvalStatusLabel(status),
    variant: DETIL_STATUS_VARIANT[status] || 'ghost',
  };
};

const approvalStatus = (row) => {
  if (row.status_persetujuan) return row.status_persetujuan;
  if (Number(row.approval_ke) > 0) return 'approved';
  const details = row.krsDetil || [];
  const hasPending = details.some((detail) => {
    if (detail.is_cross_enrollment) {
      return !['approved', 'rejected'].includes(detail.cross_enrollment_status);
    }
    return !['1', '2'].includes(String(detail.approved ?? '0'));
  });
  if (hasPending) return 'pending_pa';
  return details.some(
    (detail) =>
      detail.cross_enrollment_status === 'rejected' ||
      String(detail.approved) === '2',
  )
    ? 'rejected'
    : 'pending_pa';
};

const HEADER_STATUS = {
  approved: { label: 'Disetujui', variant: 'success' },
  rejected: { label: 'Ditolak', variant: 'error' },
  pending_pa: { label: 'Menunggu', variant: 'warning' },
};

export const PersetujuanKrsPage = () => {
  const client = useQueryClient();
  const [detailTarget, setDetailTarget] = useState(null);
  const [cpmkTarget, setCpmkTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const semesterQuery = useQuery({
    queryKey: ['krs', 'approval-semesters'],
    queryFn: getKrsApprovalSemesters,
  });
  const semesterRows = semesterQuery.data || [];
  const defaultSemester =
    semesterRows.find((row) => row.is_aktif && row.pending_count > 0) ||
    semesterRows.find((row) => row.pending_count > 0) ||
    semesterRows.find((row) => row.is_aktif) ||
    semesterRows[0];
  const [draftSemester, setDraftSemester] = useState('');
  const [appliedSemester, setAppliedSemester] = useState('');
  const effectiveSemester = appliedSemester || defaultSemester?.id || '';
  const extraFilter = effectiveSemester
    ? { semester_id: effectiveSemester }
    : undefined;

  const semesterField = {
    name: 'semester_id',
    label: 'Semester',
    placeholder: semesterQuery.isPending
      ? 'Memuat semester...'
      : semesterRows.length
        ? 'Pilih Semester'
        : 'Tidak ada pengajuan KRS',
    options: semesterRows.map((row) => ({
      value: row.id,
      label: `${semesterAkademikLabel(row)}${row.is_aktif ? ' (Aktif)' : ''}${row.pending_count ? ` · ${row.pending_count} menunggu` : ''}`,
    })),
    value: draftSemester || defaultSemester?.id || '',
    onChange: (e) => setDraftSemester(e.target.value),
    disabled: semesterQuery.isPending || semesterQuery.isError,
  };

  const refreshAfterDecision = (data, id, status) => {
    client.invalidateQueries({ queryKey: ['table'] });
    client.invalidateQueries({ queryKey: ['krs'] });
    client.invalidateQueries({ queryKey: ['dashboard'] });
    if (detailTarget?.id === id) {
      setDetailTarget({ ...data, status_persetujuan: status });
    }
  };

  const approveMutation = useMutation({
    mutationFn: ({ id, semesterId }) => approveKrs(id, semesterId),
    onSuccess: (data, variables) => {
      refreshAfterDecision(data, variables.id, 'approved');
      toast.success('KRS berhasil disetujui.');
    },
    onError: (error) => toast.error(error.message),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, semesterId, reason }) =>
      rejectKrs(id, semesterId, reason),
    onSuccess: (data, variables) => {
      refreshAfterDecision(data, variables.id, 'rejected');
      setRejectTarget(null);
      toast.success('KRS berhasil ditolak.');
    },
    onError: (error) => toast.error(error.message),
  });

  const totalSks = (row) =>
    (row.krsDetil || []).reduce(
      (sum, detil) => sum + (detil.kelas?.matakuliah?.jumlah_sks_kurikulum || 0),
      0
    );

  const columns = [
    {
      key: 'mahasiswa_id',
      header: 'Mahasiswa',
      render: (row) => (
        <div>
          <div className="font-medium">{row.mahasiswa?.nama || '—'}</div>
          <div className="text-xs text-base-content/60">{row.mahasiswa?.niu}</div>
        </div>
      ),
    },
    {
      key: 'semester_id',
      header: 'Semester',
      render: (row) => semesterAkademikLabel(row.semester),
    },
    {
      key: 'jumlah_mk',
      header: 'Jumlah MK',
      render: (row) => (row.krsDetil || []).length || '—',
    },
    {
      key: 'total_sks',
      header: 'Total SKS',
      render: (row) => totalSks(row) || '—',
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const status = approvalStatus(row);
        const meta = HEADER_STATUS[status] || HEADER_STATUS.pending_pa;
        return (
          <Badge variant={meta.variant} size="xs">
            {meta.label}{status === 'approved' ? ` (${row.approval_ke})` : ''}
          </Badge>
        );
      },
    },
    {
      header: 'Aksi',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => {
        const pending = approvalStatus(row) === 'pending_pa';
        return (
          <div className="flex justify-end gap-1">
            <IconButton
              label="Lihat detail KRS"
              icon={Eye}
              onClick={() => setDetailTarget(row)}
            />
            <Button
              size="xs"
              variant="error"
              disabled={
                !pending ||
                approveMutation.isPending ||
                rejectMutation.isPending
              }
              onClick={() => setRejectTarget(row)}
            >
              Tolak
            </Button>
            <Button
              size="xs"
              variant={pending ? 'primary' : 'ghost'}
              disabled={!pending || rejectMutation.isPending}
              isLoading={approveMutation.isPending}
              onClick={() =>
                approveMutation.mutate({
                  id: row.id,
                  semesterId: row.semester_id,
                })
              }
            >
              {pending ? 'Setujui' : HEADER_STATUS[approvalStatus(row)]?.label}
            </Button>
          </div>
        );
      },
    },
  ];

  const detilRows = (detailTarget?.krsDetil || []).map((row) => ({
    ...row,
    nama: row.kelas?.matakuliah?.nama_resmi || '—',
    kode: row.kelas?.matakuliah?.kode_matakuliah || '—',
    sks: row.kelas?.matakuliah?.jumlah_sks_kurikulum ?? '—',
  }));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Persetujuan KRS"
        subtitle="Setujui KRS mahasiswa bimbingan Anda — pengajuan mata kuliah lintas prodi ikut diputuskan di sini"
        breadcrumbs={[{ label: 'Perkuliahan' }, { label: 'Persetujuan KRS' }]}
      />
      <Card title="Filter KRS">
        <FilterBar
          fields={[semesterField]}
          onApply={() => setAppliedSemester(draftSemester)}
          onReset={() => {
            setDraftSemester('');
            setAppliedSemester('');
          }}
          applyDisabled={!draftSemester}
        />
        {semesterQuery.isError && (
          <p role="alert" className="mt-2 text-sm text-error">
            Gagal memuat semester persetujuan. {semesterQuery.error.message}
          </p>
        )}
      </Card>
      <Card title="Daftar KRS">
        <DataTable
          resource="krs"
          tableKey="krs_approve_"
          rowKey={(row) => row.id}
          searchPlaceholder="Cari nama atau NIU mahasiswa..."
          columns={columns}
          extraFilter={extraFilter}
          dataLocked={Boolean(effectiveSemester)}
          emptyText="Tidak ada KRS mahasiswa bimbingan pada semester ini."
        />
      </Card>

      <Modal
        open={Boolean(detailTarget)}
        onClose={() => setDetailTarget(null)}
        title="Detail KRS"
        subtitle={
          detailTarget
            ? `${detailTarget.mahasiswa?.nama || 'Mahasiswa'} — ${semesterAkademikLabel(detailTarget.semester)}`
            : ''
        }
        size="xl"
      >
        {detailTarget && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
              <div>
                <p className="text-xs text-base-content/60">NIU</p>
                <p className="font-medium">{detailTarget.mahasiswa?.niu || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-base-content/60">Program Studi</p>
                <p className="font-medium">
                  {detailTarget.mahasiswa?.programStudi ? programStudiLabel(detailTarget.mahasiswa.programStudi) : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-base-content/60">Total MK / SKS</p>
                <p className="font-medium">
                  {(detailTarget.krsDetil || []).length} MK &middot; {totalSks(detailTarget)} SKS
                </p>
              </div>
              <div>
                <p className="text-xs text-base-content/60">Status Persetujuan</p>
                <p className="font-medium">
                  {HEADER_STATUS[approvalStatus(detailTarget)]?.label || 'Menunggu'}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="table table-sm w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase text-base-content/60">
                    <th>Mata Kuliah</th>
                    <th>Kelas</th>
                    <th>SKS</th>
                    <th>Dosen</th>
                    <th>Jadwal</th>
                    <th>CPMK</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {detilRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-base-content/50">
                        Tidak ada mata kuliah dalam KRS ini.
                      </td>
                    </tr>
                  ) : (
                    detilRows.map((row) => {
                      const st = detilStatus(row);
                      const jadwal = kelasJadwalLines(row.kelas);
                      const cpmkCount = row.kelas?.matakuliah?.cpmk?.length || 0;
                      return (
                        <tr key={row.id}>
                          <td>
                            <div className="font-medium">{row.nama}</div>
                            <div className="text-xs text-base-content/60">{row.kode}</div>
                          </td>
                          <td>{row.kelas?.nama || '—'}</td>
                          <td>{row.sks}</td>
                          <td className="text-xs">{kelasDosenNames(row.kelas)}</td>
                          <td className="text-xs">
                            {jadwal.length > 0 ? (
                              <div className="flex flex-col gap-0.5">
                                {jadwal.map((line, idx) => (
                                  <span key={idx}>{line}</span>
                                ))}
                              </div>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td>
                            {row.is_cross_enrollment ? (
                              <Button
                                size="xs"
                                variant="info"
                                className="gap-1 whitespace-nowrap"
                                onClick={() => setCpmkTarget(row)}
                              >
                                <ListTree size={13} /> Lihat CPMK
                                {cpmkCount ? ` (${cpmkCount})` : ''}
                              </Button>
                            ) : (
                              <span className="text-base-content/40">—</span>
                            )}
                          </td>
                          <td>
                            <Badge variant={st.variant} size="xs">{st.label}</Badge>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      {rejectTarget && (
        <RejectKrsModal
          target={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onConfirm={(reason) =>
            rejectMutation.mutate({
              id: rejectTarget.id,
              semesterId: rejectTarget.semester_id,
              reason,
            })
          }
          isLoading={rejectMutation.isPending}
        />
      )}

      <Modal
        open={Boolean(cpmkTarget)}
        onClose={() => setCpmkTarget(null)}
        title="CPMK & Sub-CPMK"
        subtitle={cpmkTarget ? `${cpmkTarget.kode} — ${cpmkTarget.nama}` : ''}
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-box border border-info/30 bg-info/5 px-3 py-2 text-sm text-info">
            <ListTree size={16} />
            <span>
              CPMK berikut hanya dari mata kuliah lintas prodi — pastikan cakupannya
              sesuai dengan rencana studi mahasiswa sebelum menyetujui.
            </span>
          </div>
          <CpmkOutline cpmk={cpmkTarget?.kelas?.matakuliah?.cpmk || []} />
        </div>
      </Modal>
    </div>
  );
};
