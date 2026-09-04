import { formatTanggalId } from '../utils/formatTanggal';

export const JENIS_PERIODE = {
  CPMK: 'cpmk',
  NILAI: 'nilai',
};

export const jenisPeriodeLabel = (jenis) => {
  if (jenis === JENIS_PERIODE.CPMK) return 'CPMK';
  if (jenis === JENIS_PERIODE.NILAI) return 'Nilai';
  return jenis || '—';
};

export const todayDateOnly = (now = new Date()) => {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const isPeriodeOpen = (row, today = todayDateOnly()) => {
  if (!row?.tanggal_mulai || !row?.tanggal_selesai) return false;
  return row.tanggal_mulai <= today && today <= row.tanggal_selesai;
};

export const findPeriode = (periodes, semesterId, jenis) =>
  (periodes || []).find((row) => row.semester_id === semesterId && row.jenis === jenis) || null;

const activeSemesterId = (periodes, activeSemester) =>
  activeSemester?.id
  || (periodes || []).find((row) => row.jenis === JENIS_PERIODE.CPMK && row.semester?.is_aktif)?.semester_id
  || null;

export const bolehCpmk = (periodes, activeSemester) =>
  isPeriodeOpen(findPeriode(periodes, activeSemesterId(periodes, activeSemester), JENIS_PERIODE.CPMK));

export const semesterIdKelas = (kelas) =>
  kelas?.semesterProdi?.semester_id || kelas?.semesterProdi?.semester?.id || null;

export const bolehNilai = (periodes, kelas) =>
  isPeriodeOpen(findPeriode(periodes, semesterIdKelas(kelas), JENIS_PERIODE.NILAI));

export const periodeInputNilai = (kelas, periodes) => {
  const row = findPeriode(periodes, semesterIdKelas(kelas), JENIS_PERIODE.NILAI);
  if (!row) return { label: '—', boleh: false, hasRange: false };
  const start = formatTanggalId(row.tanggal_mulai);
  const end = formatTanggalId(row.tanggal_selesai);
  return {
    label: [start, end].filter(Boolean).join(' — '),
    boleh: isPeriodeOpen(row),
    hasRange: true,
  };
};
