import { BookPlus } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { DataTable } from '../../components/common/DataTable';
import { Button } from '../../components/ui/Button';
import { useSubmitCrossEnrollment } from '../../hooks/useCrossEnrollment';
import { Can } from '../../components/auth/Can';
import { formatDateTime } from '../../utils/crossEnrollment';

export const KatalogLintasProdiPage = () => {
  const submit = useSubmitCrossEnrollment();
  return (
    <div className="space-y-4">
      <PageHeader title="Katalog Lintas Program Studi" subtitle="Pilih mata kuliah yang tersedia di program studi lain" breadcrumbs={[{ label: 'KRS' }, { label: 'Katalog Lintas Prodi' }]} />
      <Card title="Mata Kuliah Tersedia">
        <DataTable
          resource="katalog-lintas-prodi"
          rowKey={(row) => row.id}
          searchPlaceholder="Cari kode, mata kuliah, atau program studi..."
          columns={[
            { key: 'matakuliah_id', header: 'Mata Kuliah', sortable: true, render: (row) => <div><div className="font-medium">{row.matakuliah?.nama_resmi}</div><div className="text-xs text-base-content/60">{row.matakuliah?.kode_matakuliah} · {row.matakuliah?.jumlah_sks_kurikulum} SKS</div></div> },
            { key: 'semester_prodi_id', header: 'Penyelenggara', render: (row) => row.semesterProdi?.programStudi?.nama_resmi || '—' },
            { key: 'kuota_lintas_prodi', header: 'Kuota Lintas', render: (row) => row.kuota_lintas_prodi ?? '—' },
            { key: 'tanggal_selesai', header: 'Batas Daftar', render: (row) => formatDateTime(row.tanggal_selesai) },
            { header: 'Kelas / Aksi', className: 'text-right', cellClassName: 'text-right', render: (row) => <div className="flex flex-wrap justify-end gap-2"><Can I="enroll" a="CrossEnrollment">{(row.kelas || []).map((kelas) => <Button key={kelas.id} size="xs" className="gap-1" disabled={submit.isPending} onClick={() => submit.mutate({ penawaranId: row.id, kelasId: kelas.id })}><BookPlus size={14} /> Ambil {kelas.nama}</Button>)}</Can></div> },
          ]}
        />
      </Card>
    </div>
  );
};
