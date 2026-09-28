import { Modal } from "../ui/Modal";
import { approvalStatusLabel } from "../../utils/crossEnrollment";
import { calendarClassLabel, calendarTime } from "../../helpers/krsCalendar";

export const KrsScheduleDetails = ({ event, conflicts, onClose }) => (
  <Modal open={Boolean(event)} onClose={onClose} title="Detail jadwal"
    subtitle={event ? calendarClassLabel(event) : ""}>
    {event && (
      <div className="space-y-3 text-sm">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
          <dt className="text-base-content/60">Hari / jam</dt>
          <dd>{event.hari}, {calendarTime(event.start)}–{calendarTime(event.end)}</dd>
          <dt className="text-base-content/60">Ruangan</dt><dd>{event.ruang}</dd>
          <dt className="text-base-content/60">Status</dt>
          <dd>{event.preview ? "Pratinjau — belum masuk KRS" : approvalStatusLabel(event.status)}</dd>
          <dt className="text-base-content/60">Pengambilan</dt>
          <dd>{event.lintas ? "Lintas program studi" : "Program studi sendiri"}</dd>
        </dl>
        {conflicts.length > 0 && (
          <div className="rounded-box border border-error/30 bg-error/10 p-3">
            <p className="font-medium text-error">Bentrok jadwal</p>
            <ul className="mt-1 list-disc space-y-1 pl-4">
              {conflicts.map(({ a, b, start, end }) => (
                <li key={a.id + ":" + b.id}>
                  Dengan {calendarClassLabel(a.id === event.id ? b : a)} pada {a.hari}, {calendarTime(start)}–{calendarTime(end)}.
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )}
  </Modal>
);