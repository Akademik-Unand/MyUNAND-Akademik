import { CalendarDays } from "lucide-react";
import { Button } from "../ui/Button";
import { isEligibleKelasSelection } from "../../helpers/kelasKrsEligibility";
import { isCompleteKrsSchedule } from "../../helpers/krsCalendar";

export const KrsClassActions = ({ row, selection, conflicts, blocked, blockReason, busy, onPreview, onTake }) => {
  if (row.taken) return <span className="text-xs text-base-content/50">Diambil</span>;
  const kelas = row.kelas.find((item) => String(item.id) === String(selection));
  const unavailable = !kelas || !isEligibleKelasSelection(row.options, selection) || !isCompleteKrsSchedule(kelas);
  const selectedOption = row.options.find((option) => String(option.value) === String(selection));
  const reason = blocked
    ? blockReason
    : !kelas
      ? "Pilih kelas terlebih dahulu."
      : unavailable
        ? selectedOption?.label?.includes("Tidak siap:")
          ? selectedOption.label.split("Tidak siap:")[1].trim()
          : "Jadwal kelas belum lengkap."
        : conflicts.length
          ? "Jadwal bentrok dengan mata kuliah di KRS Anda."
          : null;
  return (
    <div className="flex flex-wrap justify-end gap-1">
      <Button size="xs" variant="ghost" disabled={!kelas} onClick={onPreview}>
        <CalendarDays size={13} /> Pratinjau jadwal
      </Button>
      <Button size="xs" disabled={blocked || unavailable || conflicts.length > 0}
        isLoading={busy} onClick={onTake}>
        {row.lintas ? "Ajukan" : "Ambil"}
      </Button>
      {reason && <span className="basis-full text-right text-xs text-warning" role="status">{reason}</span>}
    </div>
  );
};
