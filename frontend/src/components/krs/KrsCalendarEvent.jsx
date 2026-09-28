import { AlertTriangle } from "lucide-react";
import { calendarClassLabel, calendarTime } from "../../helpers/krsCalendar";

/** Blok sesi dapat dibuka lewat klik/keyboard, termasuk ketika teks grid terpotong. */
export const KrsCalendarEvent = ({ event, conflict, onSelect, style, compact = false }) => {
  const time = calendarTime(event.start) + "–" + calendarTime(event.end);
  const label = [
    calendarClassLabel(event), event.hari, time,
    event.preview ? "Pratinjau" : "", conflict ? "Bentrok" : "",
  ].filter(Boolean).join(", ");
  const tone = conflict
    ? "border-error bg-error/10 text-base-content hover:bg-error/20"
    : event.preview
      ? "border-info bg-info/10 text-base-content hover:bg-info/20"
      : "border-base-300 bg-base-200 text-base-content hover:bg-base-300";
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => onSelect(event.id)}
      style={style}
      className={[
        "flex w-full flex-col items-stretch justify-start overflow-hidden rounded-field border p-2 text-left text-xs",
        "transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        event.preview ? "border-dashed border-2" : "",
        compact ? "absolute" : "",
        tone,
      ].join(" ")}
    >
      <span className="block truncate font-medium">{event.kode} · {event.kelasNama}</span>
      <span className="block">{time}</span>
      {conflict && (
        <span className="flex items-center gap-1 font-medium text-error">
          <AlertTriangle size={12} className="shrink-0" /> Bentrok
        </span>
      )}
      {event.preview && <span className="block text-info">Pratinjau</span>}
      <span className={compact ? "block truncate" : "block break-words"}>{event.nama}</span>
      <span className={compact ? "block truncate text-base-content/70" : "block text-base-content/70"}>
        Ruang: {event.ruang}
      </span>
    </button>
  );
};