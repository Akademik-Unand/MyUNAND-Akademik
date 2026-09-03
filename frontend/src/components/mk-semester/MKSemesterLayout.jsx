import { NavLink, useParams } from 'react-router-dom';
import { PageHeader } from '../common/PageHeader';
import { Card } from '../ui/Card';
import { Select } from '../ui/Select';
import { FILTER_SEMESTER } from '../../constants/mockData';
import { findMataKuliah } from '../../helpers/mkSemester';

export const MKSemesterLayout = ({ children, active, action, semester, onSemesterChange }) => {
  const { kode } = useParams();
  const mk = findMataKuliah(kode);
  const base = `/perkuliahan/mk-semester/${encodeURIComponent(mk.kode)}`;

  const tabs = [
    { id: 'pengaturan', to: base, label: 'Pengaturan CPMK Semester' },
    { id: 'evaluasi', to: `${base}/evaluasi`, label: 'Evaluasi CPMK Semester' },
    { id: 'dokumen', to: `${base}/dokumen`, label: 'Dokumen Evaluasi' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola MK Semester"
        subtitle={`${mk.nama} (${mk.kode})`}
        breadcrumbs={[
          { label: 'Semester & Perkuliahan' },
          { label: 'MK Semester', path: '/perkuliahan/mk-semester' },
          { label: mk.kode },
        ]}
        action={action}
      />

      <Card>
        <Select
          label="Semester"
          size="sm"
          className="max-w-xs"
          value={semester}
          onChange={(e) => onSemesterChange?.(e.target.value)}
          options={FILTER_SEMESTER.map((item) => ({ value: item, label: item }))}
        />
      </Card>

      <Card>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <dl className="space-y-2 text-sm">
            <InfoRow label="Mata Kuliah" value={mk.nama} strong />
            <InfoRow label="Kode Mk" value={mk.kode} />
            <InfoRow label="SKS" value={mk.sks} />
            <InfoRow label="Program Studi" value={mk.prodi} />
            <InfoRow label="Kurikulum" value={mk.kurikulum} />
            <InfoRow label="Semester" value={mk.semester} />
            <InfoRow label="Jumlah Peserta" value={mk.peserta} />
          </dl>
          <div>
            <p className="mb-2 text-sm font-medium">Kelas Penyelenggara Mata Kuliah</p>
            <ul className="space-y-2 text-sm">
              <li>
                <NavLink to={`/perkuliahan/kelas/${encodeURIComponent(mk.kelasKode)}`} className="btn btn-neutral btn-sm">
                  Kelas {mk.kelasKode}
                </NavLink>
                <p className="mt-1 text-xs text-base-content/70">
                  {mk.peserta} peserta,{' '}
                  <span className="text-success">
                    Dosen <strong>{mk.dosen}</strong>
                  </span>
                </p>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      <div className="tabs tabs-box w-fit bg-base-200">
        {tabs.map((tab) => (
          <NavLink
            key={tab.id}
            to={tab.to}
            end={tab.id === 'pengaturan'}
            className={({ isActive }) => `tab ${isActive || active === tab.id ? 'tab-active' : ''}`}
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
      : {strong ? <span className="font-medium">{value}</span> : value}
    </dd>
  </div>
);
