import { CalendarDays } from "lucide-react";
import { Button } from "../ui/Button";
import { isEligibleKelasSelection } from "../../helpers/kelasKrsEligibility";
import { isCompleteKrsSchedule } from "../../helpers/krsCalendar";

export const KrsClassActions = ({ row, selection, conflicts, blocked, busy, onPreview, onTake }) => {
  if (row.taken) return <span className="text-xs text-base-content/50">Diambil</span>;
  const kelas = row.kelas.find((item) => String(item.id) === String(selection));
  const unavailable = !kelas || !isEligibleKelasSelection(row.options, selection) || !isCompleteKrsSchedule(kelas);
  return (
    <div className="flex flex-wrap justify-end gap-1">
      <Button size="xs" variant="ghost" disabled={!kelas} onClick={onPreview}>
        <CalendarDays size={13} /> Pratinjau jadwal
      </Button>
      <Button size="xs" disabled={blocked || unavailable || conflicts.length > 0}
        isLoading={busy} onClick={onTake}>
        {row.lintas ? "Ajukan" : "Ambil"}
      </Button>
    </div>
  );
};