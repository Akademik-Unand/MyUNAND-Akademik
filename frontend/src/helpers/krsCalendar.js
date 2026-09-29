import { HARI_JADWAL, jadwalBertabrakan } from "./jadwal";

export const KRS_CALENDAR_DAYS = [...HARI_JADWAL];

// TIME diperlakukan sebagai jam lokal perkuliahan, tanpa konversi Date/timezone.
const minutes = (value) => {
  const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value || "");
  if (!match) return null;
  const [, hour, minute, second = "0"] = match;
  if (+hour > 23 || +minute > 59 || +second > 59) return null;
  return +hour * 60 + +minute;
};

export const calendarTime = (value) =>
  String(Math.floor(value / 60)).padStart(2, "0") + ":" +
  String(value % 60).padStart(2, "0");

export const calendarClassLabel = (event) =>
  event.kode + " " + event.nama + " (kelas " + event.kelasNama + ")";

export const isCompleteKrsSchedule = (kelas) =>
  Boolean(kelas?.jadwalKelas?.length) && kelas.jadwalKelas.every((session) => {
    const start = minutes(session.jam_mulai);
    const end = minutes(session.jam_selesai);
    return KRS_CALENDAR_DAYS.includes(session.hari) &&
      start != null && end != null && start < end;
  });

/** Seluruh konteks KRS dipakai; tidak mengikuti pagination/filter katalog. */
export const buildKrsCalendar = (registeredRows = [], preview = null) => {
  const activeRows = registeredRows.filter((row) => row.aktif);
  const classes = activeRows.map((row) => ({ ...row, preview: false }));
  if (preview && !activeRows.some((row) => String(row.kelas_id) === String(preview.id))) {
    classes.push({ kelas: preview, preview: true, lintas: preview.lintas });
  }
  const events = [];
  const unscheduled = [];
  for (const row of classes) {
    const kelas = row.kelas;
    const info = {
      kelasId: kelas?.id || row.kelas_id,
      kelasNama: kelas?.nama || "—",
      kode: kelas?.matakuliah?.kode_matakuliah || row.kode || "—",
      nama: kelas?.matakuliah?.nama_resmi || row.nama || "Mata kuliah",
      preview: row.preview,
      lintas: row.lintas,
      status: row.status,
    };
    if (!isCompleteKrsSchedule(kelas)) unscheduled.push(info);
    for (const [index, session] of (kelas?.jadwalKelas || []).entries()) {
      const start = minutes(session.jam_mulai);
      const end = minutes(session.jam_selesai);
      if (!KRS_CALENDAR_DAYS.includes(session.hari) || start == null || end == null || start >= end) continue;
      events.push({
        ...info,
        id: String(info.kelasId) + ":" + (session.id || index),
        hari: session.hari,
        jam_mulai: session.jam_mulai,
        jam_selesai: session.jam_selesai,
        ruang: session.ruang?.nama || session.ruang?.kode || "Belum ditetapkan",
        start,
        end,
      });
    }
  }
  const conflicts = [];
  const conflictingIds = new Set();
  for (let i = 0; i < events.length; i += 1) {
    for (let j = i + 1; j < events.length; j += 1) {
      const a = events[i];
      const b = events[j];
      if (!jadwalBertabrakan(a, b)) continue;
      conflictingIds.add(a.id);
      conflictingIds.add(b.id);
      conflicts.push({ a, b, start: Math.max(a.start, b.start), end: Math.min(a.end, b.end) });
    }
  }
  return { events, conflicts, conflictingIds, unscheduled };
};

/** Kolom terpisah untuk kelompok sesi beririsan, termasuk bentrok berantai. */
export const layoutCalendarDay = (events) => {
  const sorted = [...events].sort((a, b) => a.start - b.start || a.end - b.end);
  const result = [];
  let group = [];
  let ends = [];
  let groupEnd = -1;
  const flush = () => {
    result.push(...group.map((event) => ({ ...event, columns: ends.length })));
    group = [];
    ends = [];
  };
  for (const event of sorted) {
    if (event.start >= groupEnd) flush();
    let column = ends.findIndex((end) => end <= event.start);
    if (column < 0) column = ends.length;
    ends[column] = event.end;
    group.push({ ...event, column });
    groupEnd = Math.max(groupEnd, event.end);
  }
  flush();
  return result;
};

export const calendarBounds = (events) => ({
  start: Math.floor(Math.min(7 * 60, ...events.map((event) => event.start)) / 60) * 60,
  end: Math.ceil(Math.max(18 * 60, ...events.map((event) => event.end)) / 60) * 60,
});
