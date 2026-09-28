import { useState } from "react";
import { AlertTriangle, CalendarDays, List, RefreshCw } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { KrsWeeklyCalendar } from "./KrsWeeklyCalendar";
import { KrsScheduleDetails } from "./KrsScheduleDetails";
import { KrsDocumentDownload } from "./KrsDocumentDownload";
import { buildKrsCalendar, calendarClassLabel, calendarTime } from "../../helpers/krsCalendar";

export const KrsSchedulePanel = ({
  rows, preview, view, onViewChange, onClearPreview, semesterLabel,
  refreshing, error, onRefresh, sectionRef, krs, downloading, onDownload, children,
}) => {
  const [selectedId, setSelectedId] = useState(null);
  const { events, conflicts, conflictingIds, unscheduled } = buildKrsCalendar(rows, preview);
  const selectedEvent = events.find((event) => event.id === selectedId);
  const hasPreview = events.some((event) => event.preview) || unscheduled.some((item) => item.preview);
  return (
    <section ref={sectionRef} className="scroll-mt-24" aria-label="Jadwal KRS mahasiswa">
      <Card title="Mata Kuliah di KRS Anda"
        actions={refreshing ? <span className="text-xs text-base-content/60">Menyegarkan…</span> : null}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1" role="group" aria-label="Tampilan KRS">
            <button type="button" aria-pressed={view === "list"}
              className={"btn btn-sm " + (view === "list" ? "btn-active" : "btn-ghost")}
              onClick={() => onViewChange("list")}><List size={14} /> Daftar KRS</button>
            <button type="button" aria-pressed={view === "calendar"}
              className={"btn btn-sm " + (view === "calendar" ? "btn-active" : "btn-ghost")}
              onClick={() => onViewChange("calendar")}><CalendarDays size={14} /> Kalender Mingguan</button>
          </div>
          <Button size="xs" variant="ghost" disabled={refreshing} onClick={onRefresh}>
            <RefreshCw size={13} /> Muat ulang jadwal
          </Button>
        </div>
        <KrsDocumentDownload krs={krs} rows={rows} busy={downloading} onDownload={onDownload} />
        {error && (
          <p role="alert" className="text-sm text-error">
            Gagal memperbarui jadwal. Data mungkin belum terbaru; muat ulang sebelum mengambil kelas.
          </p>
        )}
        {view === "list" ? children : (
          <div className={"space-y-3 " + (refreshing ? "opacity-60" : "")} aria-busy={refreshing}>
            <p className="text-xs text-base-content/70">
              Jadwal mingguan berulang{semesterLabel ? " — " + semesterLabel : ""}. Klik sesi untuk detail.
              {" "}Kelas yang menunggu dosen PA ikut diperhitungkan.
            </p>
            {hasPreview && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-box border border-info/30 bg-info/5 p-3">
                <p className="min-w-0 text-sm">
                  <span className="font-medium">Pratinjau: </span>
                  {preview.matakuliah?.kode_matakuliah} {preview.matakuliah?.nama_resmi} · Kelas {preview.nama}
                  <span className="block text-xs text-base-content/70">Belum masuk KRS. Gunakan Ambil/Ajukan pada daftar mata kuliah setelah memeriksa jadwal.</span>
                </p>
                <Button size="xs" variant="ghost" onClick={onClearPreview}>Batalkan pratinjau</Button>
              </div>
            )}
            <div role="status" aria-live="polite" className="space-y-2 text-sm">
              {unscheduled.length > 0 && (
                <div className="rounded-box border border-warning/40 bg-warning/10 p-3">
                  <p className="flex items-center gap-1 font-medium"><AlertTriangle size={15} /> Jadwal belum dapat diperiksa sepenuhnya</p>
                  <ul className="mt-1 list-disc pl-4">
                    {unscheduled.map((item) => (
                      <li key={item.kelasId}>{calendarClassLabel(item)}: jadwal belum lengkap.</li>
                    ))}
                  </ul>
                </div>
              )}
              {conflicts.length > 0 ? (
                <div className="rounded-box border border-error/30 bg-error/10 p-3">
                  <p className="font-medium text-error">{conflicts.length} pasangan sesi bentrok</p>
                  <ul className="mt-1 list-disc space-y-1 pl-4">
                    {conflicts.map(({ a, b, start, end }) => (
                      <li key={a.id + ":" + b.id}>
                        {calendarClassLabel(a)} dengan {calendarClassLabel(b)} — {a.hari}, {calendarTime(start)}–{calendarTime(end)}.
                      </li>
                    ))}
                  </ul>
                </div>
              ) : events.length > 0 && unscheduled.length === 0 && !error && !refreshing ? (
                <p className="text-base-content/70">Tidak ada bentrok pada jadwal yang ditampilkan.</p>
              ) : null}
            </div>
            {events.length > 0 ? (
              <>
                <div className="flex flex-wrap gap-3 text-xs text-base-content/70" aria-label="Keterangan kalender">
                  <span>Blok biasa: di KRS</span>
                  <span>Garis putus-putus: pratinjau</span>
                  <span className="flex items-center gap-1 text-error"><AlertTriangle size={12} /> Bentrok</span>
                </div>
                <KrsWeeklyCalendar events={events} conflictingIds={conflictingIds} onSelect={setSelectedId} />
              </>
            ) : (
              <p className="py-4 text-sm text-base-content/60">
                Belum ada jadwal yang dapat ditampilkan. Pilih kelas lalu klik Pratinjau jadwal.
              </p>
            )}
          </div>
        )}
      </Card>
      <KrsScheduleDetails event={selectedEvent}
        conflicts={conflicts.filter(({ a, b }) => a.id === selectedId || b.id === selectedId)}
        onClose={() => setSelectedId(null)} />
    </section>
  );
};