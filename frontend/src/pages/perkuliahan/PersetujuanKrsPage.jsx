import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Eye, ListTree } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { DataTable } from '../../components/common/DataTable';
import { IconButton } from '../../components/common/IconButton';
import { CpmkOutline } from '../../components/cpmk/CpmkOutline';
import { approveKrs } from '../../services/krs.service';
import { semesterAkademikLabel } from '../../helpers/semesterProdi';
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

export const PersetujuanKrsPage = () => {
  const client = useQueryClient();
  const [detailTarget, setDetailTarget] = useState(null);
  const [cpmkTarget, setCpmkTarget] = useState(null);

  const mutation = useMutation({
    mutationFn: approveKrs,
    onSuccess: (_data, variables) => {
      client.invalidateQueries({ queryKey: ['table'] });
      // Invalidate the mahasiswa KRS context so the student page reflects the
      // latest approval status without a hard refresh.
      client.invalidateQueries({ queryKey: ['krs'] });
      // Patch the stale detailTarget snapshot so the open modal immediately
      // reflects the approval (both header badge and per-row statuses).
      if (detailTarget?.id === variables) {
        setDetailTarget((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            approval_ke: (prev.approval_ke || 0) + 1,
            krsDetil: (prev.krsDetil || []).map((d) =>
              d.is_cross_enrollment ? d : { ...d, approved: '1' },
            ),
          };
        });
      }
      toast.success('KRS berhasil disetujui.');
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
      key: 'semester_prodi_id',
      header: 'Semester',
      render: (row) => semesterAkademikLabel(row.semesterProdi?.semester),
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
      render: (row) =>
        row.approval_ke > 0 ? (
          <Badge variant="success" size="xs">Disetujui ({row.approval_ke})</Badge>
        ) : (
          <Badge variant="warning" size="xs">Menunggu</Badge>
        ),
    },
    {
      header: 'Aksi',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <IconButton
            label="Lihat detail KRS"
            icon={Eye}
            onClick={() => setDetailTarget(row)}
          />
          <Button
            size="xs"
            variant={row.approval_ke > 0 ? 'ghost' : 'primary'}
            disabled={row.approval_ke > 0}
            isLoading={mutation.isPending}
            onClick={() => mutation.mutate(row.id)}
          >
            {row.approval_ke > 0 ? 'Disetujui' : 'Setujui'}
          </Button>
        </div>
      ),
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
        subtitle="Setujui KRS reguler mahasiswa bimbingan Anda"
        breadcrumbs={[{ label: 'Perkuliahan' }, { label: 'Persetujuan KRS' }]}
      />
      <Card title="Daftar KRS">
        <DataTable
          resource="krs"
          tableKey="krs_approve_"
          rowKey={(row) => row.id}
          searchPlaceholder="Cari nama atau NIU mahasiswa..."
          columns={columns}
        />
      </Card>

      <Modal
        open={Boolean(detailTarget)}
        onClose={() => setDetailTarget(null)}
        title="Detail KRS"
        subtitle={
          detailTarget
            ? `${detailTarget.mahasiswa?.nama || 'Mahasiswa'} — ${semesterAkademikLabel(detailTarget.semesterProdi?.semester)}`
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
                  {detailTarget.mahasiswa?.programStudi?.nama_resmi || '—'}
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
                  {detailTarget.approval_ke > 0
                    ? `Disetujui (ke-${detailTarget.approval_ke})`
                    : 'Menunggu'}
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