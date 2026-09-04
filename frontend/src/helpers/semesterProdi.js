export const semesterAkademikLabel = (semester) => {
  if (!semester) return '—';
  const jenis = semester.jenisSemester?.nama || semester.jenisSemester?.alias;
  const tahun = Number(semester.tahun);
  const tahunAjaran = Number.isFinite(tahun) ? `${tahun}/${tahun + 1}` : semester.tahun;
  const term = [jenis, tahunAjaran].filter((part) => part !== undefined && part !== null && part !== '').join(' ');
  return term || '—';
};

export const prodiDepartemenLabel = (prodi) => {
  if (!prodi) return '—';
  const nama = prodi.nama_resmi || prodi.nama_singkat;
  const jurusan = prodi.departemen?.nama_resmi || prodi.departemen?.nama_singkat;
  if (nama && jurusan) return `${nama} – ${jurusan}`;
  return nama || '—';
};

export const semesterProdiLabel = (row) => {
  if (!row) return '—';
  const term = semesterAkademikLabel(row.semester);
  const prodi = row.programStudi?.nama_singkat || row.programStudi?.nama_resmi;
  if (term === '—') return prodi || '—';
  return prodi ? `${term} · ${prodi}` : term;
};
