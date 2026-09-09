import { NavLink, useParams } from 'react-router-dom';
import { PageHeader } from '../common/PageHeader';
import { Card } from '../ui/Card';
import { ResourceSelect } from '../common/ResourceSelect';
import { useResourceItem } from '../../hooks/useResourceQuery';
import { PageSkeleton } from '../common/PageSkeleton';
import { mkKode, mkLabel } from '../../helpers/mkSemester';
import { kelasDosenNames } from '../../helpers/kelasInfo';
import { participantName, participantProgram } from '../../utils/crossEnrollment';

export const MKSemesterLayout = ({ children, action, semester, onSemesterChange }) => {
  const { id } = useParams();
  const mkQuery = useResourceItem('penawaran-matakuliah', id);
  const offering = mkQuery.data;
  const mk = offering?.matakuliah || offering;

  if (mkQuery.isPending) return <PageSkeleton cards={2} />;

  const base = `/perkuliahan/mk-semester/${id}`;
  const tabs = [
    { id: 'pengaturan', to: base, label: 'Pengaturan CPMK Semester' },
    { id: 'evaluasi', to: `${base}/evaluasi`, label: 'Evaluasi CPMK Semester' },
    { id: 'dokumen', to: `${base}/dokumen`, label: 'Dokumen Evaluasi' },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Kelola MK Semester"
        subtitle={`${mkLabel(mk)} (${mkKode(mk)})`}
        breadcrumbs={[
          { label: 'Semester & Perkuliahan' },
          { label: 'MK Semester', path: '/perkuliahan/mk-semester' },
          { label: mkKode(mk) || 'MK' },
        ]}
        action={action}
      />

      <Card>
        <ResourceSelect
          resource="setting-semester"
          label="Semester"
          size="sm"
          value={semester || ''}
          onChange={(e) => onSemesterChange?.(e.target.value)}
          getLabel={(row) => `${row.jenisSemester?.nama || 'Semester'} ${row.tahun}`}
        />
      </Card>

      <Card>
        <dl className="space-y-2 text-sm max-w-xl">
          <InfoRow label="Mata Kuliah" value={mkLabel(mk)} strong />
          <InfoRow label="Kode Mk" value={mkKode(mk)} />
          <InfoRow label="SKS" value={mk?.jumlah_sks_kurikulum} />
          <InfoRow label="Program Studi" value={offering?.semesterProdi?.programStudi?.nama_resmi} />
          <InfoRow label="Kurikulum" value={offering?.kurikulum?.nama || offering?.kurikulum?.nama_kurikulum} />
          <InfoRow label="Semester" value={offering?.semesterProdi?.semester?.nama || offering?.semesterProdi?.semester?.tahun} />
          <InfoRow label="Jumlah Peserta" value={offering?.jumlah_peserta ?? offering?.peserta?.length} />
          <InfoRow label="Peserta" value={offering?.peserta?.map((row) => `${participantName(row)} — ${participantProgram(row)}`).join(', ')} />
          <InfoRow label="Kelas & Dosen" value={offering?.kelas?.map((kelas) => `${kelas.nama}: ${kelasDosenNames(kelas)}`).join('; ')} />
        </dl>
      </Card>

      <div className="tabs tabs-box w-fit bg-base-200">
        {tabs.map((tab) => (
          <NavLink
            key={tab.id}
            to={tab.to}
            end={tab.id === 'pengaturan'}
            className={({ isActive }) => `tab ${isActive ? 'tab-active' : ''}`}
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      {children}
    </div>
  );
};

const InfoRow = ({ label, value, strong }) => (
  <div className="grid grid-cols-[8rem_1fr] gap-2">
    <dt className="text-base-content/60">{label}</dt>
    <dd>
      : {strong ? <span className="font-medium">{value || '—'}</span> : value || '—'}
    </dd>
  </div>
);
