import { kelasDosenNames, kelasJadwalLines } from "./kelasInfo";

export const kelasKrsEligibility = (kelas) => {
  const hasSchedule = (kelas?.jadwalKelas || []).some(
    (jadwal) => jadwal.hari && jadwal.jam_mulai && jadwal.jam_selesai,
  );
  const hasLecturer = (kelas?.dosenKelas || []).length > 0;
  const reasons = [];
  if (!hasSchedule) reasons.push("jadwal belum lengkap");
  if (!hasLecturer) reasons.push("dosen belum ditetapkan");
  return { eligible: reasons.length === 0, reasons };
};

export const kelasKrsOption = (kelas, conflictCode) => {
  const eligibility = kelasKrsEligibility(kelas);
  const info = eligibility.eligible
    ? `${kelasJadwalLines(kelas).join("; ")} — ${kelasDosenNames(kelas)}`
    : `Tidak siap: ${eligibility.reasons.join(" dan ")}`;
  return {
    value: kelas.id,
    disabled: !eligibility.eligible,
    label: `Kelas ${kelas.nama} — ${info}${conflictCode ? ` ⚠ bentrok ${conflictCode}` : ""}`,
  };
};

export const isEligibleKelasSelection = (options, kelasId) =>
  options.some(
    (option) => String(option.value) === String(kelasId) && !option.disabled,
  );
