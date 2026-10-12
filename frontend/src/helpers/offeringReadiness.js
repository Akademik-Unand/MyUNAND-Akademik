const hasSchedule = (kelas) =>
  (kelas?.jadwalKelas || []).some(
    (item) => item.hari && item.jam_mulai && item.jam_selesai,
  );

export const getOfferingDetailReadiness = (detail) => {
  const classes = detail?.kelas || [];
  const issues = [];

  if (!classes.length) {
    issues.push("Belum ada kelas");
  } else {
    const allocated = classes.reduce(
      (sum, kelas) => sum + Number(kelas.jumlah_peserta_max || 0),
      0,
    );
    const globalQuota = Number(detail?.jumlah_peserta_max_default);
    if (
      classes.some((kelas) => kelas.jumlah_peserta_max == null) ||
      allocated !== globalQuota
    ) {
      issues.push(
        `Total kuota kelas ${allocated} harus sama dengan kuota global ${globalQuota}`,
      );
    }
    for (const kelas of classes) {
      if (!(kelas.dosenKelas || []).length)
        issues.push(`Kelas ${kelas.nama}: dosen belum diatur`);
      if (!hasSchedule(kelas))
        issues.push(`Kelas ${kelas.nama}: jadwal belum diatur`);
    }
  }

  return { ready: issues.length === 0, issues, classes };
};

export const getOfferingReadiness = (offering) => {
  const details = offering?.matakuliahDitawarkan || [];
  const results = details.map((detail) => ({
    detail,
    ...getOfferingDetailReadiness(detail),
  }));
  return {
    ready: results.length > 0 && results.every((row) => row.ready),
    results,
    issues: results.flatMap((row) => row.issues),
  };
};
