import { CalendarClock, MapPin } from "lucide-react";

const timeLabel = (value) => (value ? String(value).slice(0, 5) : "—");

/** Jadwal kuliah beserta ruang dan shift untuk kolom tabel KRS. */
export const KrsScheduleInfo = ({ kelas }) => {
  const schedules = kelas?.jadwalKelas || [];

  if (!schedules.length) {
    return <span className="text-xs text-warning">Belum dijadwalkan</span>;
  }

  return (
    <ul className="min-w-44 space-y-1.5 text-xs">
      {schedules.map((schedule) => (
        <li key={schedule.id} className="space-y-0.5">
          <p className="flex items-center gap-1.5 font-medium">
            <CalendarClock size={13} className="shrink-0 text-base-content/50" />
            {schedule.hari}, {timeLabel(schedule.jam_mulai)}–{timeLabel(schedule.jam_selesai)}
          </p>
          <p className="pl-5 text-base-content/60">
            <MapPin size={11} className="mr-1 inline" />
            {schedule.ruang?.nama || schedule.ruang?.kode || "Ruang belum ditentukan"}
            {schedule.shift?.kode ? ` · Shift ${schedule.shift.kode}` : ""}
          </p>
        </li>
      ))}
    </ul>
  );
};
