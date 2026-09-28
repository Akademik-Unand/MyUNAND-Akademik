import {
  calendarBounds, calendarTime, KRS_CALENDAR_DAYS, layoutCalendarDay,
} from "../../helpers/krsCalendar";
import { KrsCalendarEvent } from "./KrsCalendarEvent";

export const KrsWeeklyCalendar = ({ events, conflictingIds, onSelect }) => {
  const bounds = calendarBounds(events);
  const duration = bounds.end - bounds.start;
  const hours = Array.from({ length: duration / 60 + 1 }, (_, index) => bounds.start + index * 60);
  const days = KRS_CALENDAR_DAYS.map((hari) => {
    const items = layoutCalendarDay(events.filter((event) => event.hari === hari));
    return { hari, items, width: Math.max(9, ...items.map((event) => event.columns * 8)) };
  });
  return (
    <>
      <div className="hidden max-h-[38rem] overflow-auto rounded-box border border-base-300 lg:block"
        role="region" aria-label="Kalender mingguan KRS" tabIndex={0}>
        <div className="grid" style={{
          gridTemplateColumns: "4rem " + days.map((day) => "minmax(" + day.width + "rem, 1fr)").join(" "),
          minWidth: (4 + days.reduce((sum, day) => sum + day.width, 0)) + "rem",
        }}>
          <div className="sticky left-0 top-0 z-20 border-b border-base-300 bg-base-100 p-2 text-xs">Jam</div>
          {days.map(({ hari }) => (
            <div key={hari} className="sticky top-0 z-10 border-b border-l border-base-300 bg-base-100 p-2 text-center text-sm font-medium">
              {hari}
            </div>
          ))}
          <div className="sticky left-0 z-10 bg-base-100" style={{ height: duration / 60 * 6 + "rem" }}>
            {hours.map((hour) => (
              <span key={hour} className="absolute right-1 text-xs text-base-content/60"
                style={{ top: (hour - bounds.start) / duration * 100 + "%", transform: hour === bounds.end ? "translateY(-100%)" : undefined }}>
                {calendarTime(hour)}
              </span>
            ))}
          </div>
          {days.map(({ hari, items }) => (
            <div key={hari} className="relative border-l border-base-300" style={{ height: duration / 60 * 6 + "rem" }}>
              {hours.slice(0, -1).map((hour) => (
                <div key={hour} aria-hidden="true" className="absolute w-full border-t border-base-200"
                  style={{ top: (hour - bounds.start) / duration * 100 + "%" }} />
              ))}
              {items.map((event) => (
                <KrsCalendarEvent key={event.id} event={event} compact
                  conflict={conflictingIds.has(event.id)} onSelect={onSelect}
                  style={{
                    top: (event.start - bounds.start) / duration * 100 + "%",
                    height: (event.end - event.start) / duration * 100 + "%",
                    left: "calc(" + event.column / event.columns * 100 + "% + 2px)",
                    width: "calc(" + 100 / event.columns + "% - 4px)",
                  }} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3 lg:hidden" role="region" aria-label="Agenda mingguan KRS">
        {days.map(({ hari, items }) => (
          <section key={hari} aria-label={hari}>
            <h4 className="mb-1 text-sm font-medium">{hari}</h4>
            {items.length ? (
              <div className="space-y-1.5">
                {items.map((event) => (
                  <KrsCalendarEvent key={event.id} event={event}
                    conflict={conflictingIds.has(event.id)} onSelect={onSelect} />
                ))}
              </div>
            ) : <p className="text-xs text-base-content/60">Tidak ada jadwal.</p>}
          </section>
        ))}
      </div>
    </>
  );
};