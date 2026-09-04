const dash = (value) => (value === null || value === undefined || value === '' ? '—' : value);

const percent = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  return `${value}%`;
};

export const rekapCpColumns = [
  { header: '#', render: (_, idx) => idx + 1 },
  { key: 'niu', header: 'BP', render: (row) => row.niu || '—' },
  {
    key: 'mahasiswa_nama',
    header: 'Mahasiswa',
    cellClassName: 'font-medium text-primary',
    render: (row) => row.mahasiswa_nama || '—',
  },
  { key: 'angkatan', header: 'Angkatan', render: (row) => dash(row.angkatan) },
  { key: 'semester_label', header: 'Semester', render: (row) => row.semester_label || '—' },
  {
    key: 'matakuliah_nama',
    header: 'MK',
    render: (row) => row.matakuliah_nama || '—',
  },
  { key: 'kelas_nama', header: 'Kelas', render: (row) => row.kelas_nama || '—' },
  { key: 'cpmk_nama', header: 'CPMK', render: (row) => row.cpmk_nama || '—' },
  { key: 'cp_nama', header: 'CP', render: (row) => row.cp_nama || '—' },
  { key: 'scp_nama', header: 'SCP', render: (row) => row.scp_nama || '—' },
  { key: 'target_nilai_min', header: 'Target Nilai Minimal', render: (row) => dash(row.target_nilai_min) },
  {
    key: 'target_persen',
    header: 'Target Mencapai Nilai Minimal',
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
  { key: 'lulus', header: 'Lulus', render: (row) => Number(row.lulus) || 0 },
];
