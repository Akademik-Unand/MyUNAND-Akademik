import { Badge } from '../ui/Badge';

const dash = (value) => (value === null || value === undefined || value === '' ? '—' : value);

const percent = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  return `${value}%`;
};

export const rekapStudentKey = (row) =>
  [row.niu, row.mahasiswa_nama, row.angkatan, row.semester_label].join('\u001f');

export const rekapMkKey = (row) =>
  [rekapStudentKey(row), row.matakuliah_nama, row.kelas_nama].join('\u001f');

export const rekapCpmkKey = (row) =>
  [rekapMkKey(row), row.cpmk_nama, row.cp_nama, row.scp_nama].join('\u001f');

const mergeCell = 'align-middle text-center border-r border-base-300';

export const rekapCpColumns = [
  { header: '#', render: (_, idx) => idx + 1 },
  { key: 'niu', header: 'BP', groupBy: rekapStudentKey, cellClassName: mergeCell, render: (row) => row.niu || '—' },
  {
    key: 'mahasiswa_nama',
    header: 'Mahasiswa',
    groupBy: rekapStudentKey,
    cellClassName: `font-medium text-primary ${mergeCell}`,
    render: (row) => row.mahasiswa_nama || '—',
  },
  {
    key: 'angkatan',
    header: 'Angkatan',
    groupBy: rekapStudentKey,
    cellClassName: mergeCell,
    render: (row) => dash(row.angkatan),
  },
  {
    key: 'semester_label',
    header: 'Semester',
    groupBy: rekapStudentKey,
    cellClassName: mergeCell,
    render: (row) => row.semester_label || '—',
  },
  {
    key: 'matakuliah_nama',
    header: 'MK',
    groupBy: rekapMkKey,
    cellClassName: mergeCell,
    render: (row) => row.matakuliah_nama || '—',
  },
  {
    key: 'kelas_nama',
    header: 'Kelas',
    groupBy: rekapMkKey,
    cellClassName: mergeCell,
    render: (row) => row.kelas_nama || '—',
  },
  {
    key: 'cpmk_nama',
    header: 'CPMK',
    groupBy: rekapCpmkKey,
    cellClassName: mergeCell,
    render: (row) => row.cpmk_nama || '—',
  },
  {
    key: 'cp_nama',
    header: 'CP',
    groupBy: rekapCpmkKey,
    cellClassName: mergeCell,
    render: (row) => row.cp_nama || '—',
  },
  {
    key: 'scp_nama',
    header: 'SCP',
    groupBy: rekapCpmkKey,
    cellClassName: mergeCell,
    render: (row) => row.scp_nama || '—',
  },
  {
    key: 'target_nilai_min',
    header: 'Target Nilai Minimal',
    groupBy: rekapCpmkKey,
    cellClassName: mergeCell,
    render: (row) => dash(row.target_nilai_min),
  },
  {
    key: 'target_persen',
    header: 'Target Mencapai Nilai Minimal',
    groupBy: rekapCpmkKey,
    cellClassName: mergeCell,
    render: (row) => percent(row.target_persen),
  },
  {
    key: 'capaian_target',
    header: 'Capaian Target',
    render: (row) => (row.capaian_target == null ? '%' : `${row.capaian_target}%`),
  },
  { key: 'status_tercapai', header: 'Status CP/SCP Tercapai', render: (row) => Number(row.status_tercapai) || 0 },
  { key: 'sumber_nama', header: 'Sumber Penilaian', render: (row) => row.sumber_nama || '—' },
  { key: 'bobot', header: 'Bobot', render: (row) => percent(row.bobot) },
  { key: 'nilai', header: 'Nilai', render: (row) => dash(row.nilai) },
  {
    key: 'lulus',
    header: 'Lulus',
    cellClassName: 'whitespace-nowrap',
    render: (row) =>
      Number(row.lulus) ? (
        <Badge variant="success" size="sm" outline className="h-auto shrink-0 whitespace-nowrap px-2">
          Lulus
        </Badge>
      ) : (
        <Badge variant="error" size="sm" outline className="h-auto shrink-0 whitespace-nowrap px-2">
          Tidak lulus
        </Badge>
      ),
  },
];
