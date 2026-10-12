import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Can } from "../auth/Can";
import { DataTable } from "../common/DataTable";
import { useSchedulingMutation } from "../../hooks/usePenjadwalan";
import {
  schedulingAction,
  schedulingEdit,
} from "../../services/penjadwalan.service";
import { downloadSchedule } from "../../helpers/schedulingDownload";
const clock = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const manualSchema = z.object({
  assignments: z
    .array(
      z.object({
        session_id: z.string(),
        ruang_id: z.string().uuid(),
        hari: z.enum(["Senin", "Selasa", "Rabu", "Kamis", "Jumat"]),
        jam_mulai: clock,
        jam_selesai: clock,
        frekuensi: z.enum(["Mingguan", "Ganjil", "Genap"]),
      }),
    )
    .min(1),
});
export function ResultsPanel({ scenario, setup }) {
  const [editing, setEditing] = useState(false),
    [selected, setSelected] = useState([]),
    [filters, setFilters] = useState({}),
    [note, setNote] = useState("");
  const assignments = scenario.result?.assignments || [];
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(manualSchema),
    defaultValues: { assignments },
  });
  const run = useSchedulingMutation(({ action, body }) =>
    schedulingAction(scenario.id, action, {
      revision: scenario.revision,
      ...body,
    }),
  );
  const edit = useSchedulingMutation((body) =>
    schedulingEdit(scenario.id, { revision: scenario.revision, ...body }),
  );
  const repair = useSchedulingMutation(async () => {
    const input = {
      ...scenario.input,
      baseline: assignments,
      sessions: scenario.input.sessions.map((s) => ({
        ...s,
        lock_room: s.lock_room || !selected.includes(s.id),
        lock_time: s.lock_time || !selected.includes(s.id),
      })),
    };
    const item = await schedulingEdit(scenario.id, {
      revision: scenario.revision,
      input,
    });
    return schedulingAction(scenario.id, "simulate", {
      revision: item.revision,
    });
  });
  const room = (id) => {
    const r = setup.rooms.find((r) => r.id === id);
    return r
      ? `${setup.buildings.find((b) => b.id === r.gedung_id)?.kode || ""} / ${r.kode} ${r.nama}`
      : id;
  };
  const label = (id) =>
    setup.classes.find(
      (c) =>
        c.id === scenario.input.sessions.find((s) => s.id === id)?.kelas_id,
    )?.label || id;
  const last = (action, session) =>
    scenario.decisions
      ?.filter(
        (d) =>
          d.revision === scenario.revision &&
          d.action === action &&
          (action !== "backup" || d.session_id === session),
      )
      .at(-1);
  const decision = (action, approved, session_id) =>
    run.mutate({
      action: "decisions",
      body: { action, approved, session_id, note },
    });
  if (!assignments.length)
    return (
      <div className="space-y-3">
        <div className="alert">
          {scenario.status === "infeasible"
            ? "Tidak ada solusi yang memenuhi seluruh aturan."
            : scenario.status === "unknown"
              ? "Pencarian berakhir tanpa kesimpulan. Jadwal belum dinyatakan mustahil."
              : "Belum ada hasil jadwal lengkap."}
        </div>
        {scenario.result?.diagnosis?.map((d, i) => (
          <p key={i}>
            {d.session_id} {d.reason} (
            {d.verified ? "terverifikasi" : "belum terbukti"})
          </p>
        ))}
      </div>
    );
  const comparisons = scenario.result.comparison || [];
  const changed = comparisons.filter((r) => r.changed).length;
  const pending = [
    ...(!last("review")?.approved ? ["Tinjauan fakultas belum disetujui"] : []),
    ...(!last("approve")?.approved ? ["Pengesahan pusat belum disetujui"] : []),
    ...comparisons
      .filter((r) => r.backup && !last("backup", r.session_id)?.approved)
      .map((r) => `Cadangan sesi ${r.session_id} belum disetujui`),
  ];
  const rows = assignments
    .map((r, index) => ({
      ...r,
      index,
      ...comparisons.find((c) => c.session_id === r.session_id),
    }))
    .filter((r) => {
      const s = scenario.input.sessions.find((s) => s.id === r.session_id);
      const c = setup.classes.find((c) => c.id === s?.kelas_id);
      return (
        (!filters.prodi || c?.program_studi_id === filters.prodi) &&
        (!filters.room || r.ruang_id === filters.room) &&
        (!filters.group || s?.groups.includes(filters.group)) &&
        (!filters.lecturer ||
          setup.teachers.some(
            (t) =>
              t.kelas_id === s?.kelas_id && t.dosen_id === filters.lecturer,
          ))
      );
    });
  const busy = run.isPending || edit.isPending || repair.isPending;
  const mutable = scenario.status === "solved";
  return (
    <div className="space-y-4">
      <div className="alert alert-info">
        {assignments.length} sesi terjadwal · {changed} berubah (
        {Math.round((changed / assignments.length) * 100)}%) ·{" "}
        {comparisons.filter((r) => r.backup).length} usulan gedung cadangan.
        Status solver: {scenario.result.status}.
      </div>
      <p className="text-sm">
        Prioritas: gedung utama → jumlah sesi berubah → perubahan waktu →
        perubahan gedung/ruang → perpindahan, jeda dan keseimbangan beban.
      </p>
      <div className="flex flex-wrap gap-2">
        {[
          [
            "prodi",
            "Semua prodi",
            setup.programs.map((p) => [p.id, p.nama_resmi]),
          ],
          ["room", "Semua ruang", setup.rooms.map((r) => [r.id, room(r.id)])],
          [
            "group",
            "Semua kelompok",
            [...new Set(scenario.input.sessions.flatMap((s) => s.groups))].map(
              (g) => [g, g],
            ),
          ],
          [
            "lecturer",
            "Semua dosen",
            (setup.lecturers || []).map((d) => [d.id, d.nama]),
          ],
        ].map(([key, text, options]) => (
          <select
            key={key}
            aria-label={text}
            className="select select-sm w-48"
            value={filters[key] || ""}
            onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
          >
            <option value="">{text}</option>
            {options.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        ))}
        <button
          className="btn btn-sm"
          onClick={() => downloadSchedule(scenario.id, "csv")}
        >
          Ekspor CSV
        </button>
        <button
          className="btn btn-sm"
          onClick={() => downloadSchedule(scenario.id, "xlsx")}
        >
          Ekspor Excel
        </button>
      </div>
      <div className="grid gap-2 lg:grid-cols-5">
        {["Senin", "Selasa", "Rabu", "Kamis", "Jumat"].map((day) => (
          <section key={day} className="border border-base-300 p-3 space-y-2">
            <h3 className="font-semibold">{day}</h3>
            {rows
              .filter((r) => r.hari === day)
              .sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai))
              .map((r) => (
                <div
                  key={r.session_id}
                  className="border-t border-base-300 pt-2 text-sm"
                >
                  <div>
                    {r.jam_mulai}–{r.jam_selesai} · {r.frekuensi}
                  </div>
                  <div>{label(r.session_id)}</div>
                  <div className="opacity-70">{room(r.ruang_id)}</div>
                  {r.backup && (
                    <span className="badge badge-warning badge-sm">
                      Cadangan
                    </span>
                  )}
                </div>
              ))}
          </section>
        ))}
      </div>
      <form
        onSubmit={handleSubmit(async (v) => {
          await edit
            .mutateAsync({ input: scenario.input, assignments: v.assignments })
            .catch(() => null);
          setEditing(false);
        })}
        className="space-y-3"
      >
        <DataTable
          rows={rows}
          tableKey="result_"
          searchableFields={["session_id", "hari", "reason"]}
          rowKey={(r) => r.session_id}
          columns={[
            {
              key: "session_id",
              header: "Kelas",
              render: (r) => (
                <div>
                  {label(r.session_id)}
                  <div className="text-xs opacity-60">{r.session_id}</div>
                  {mutable && (
                    <Can I="update" a="Penjadwalan">
                      <label className="flex gap-2 mt-1 text-sm">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          checked={selected.includes(r.session_id)}
                          onChange={(e) =>
                            setSelected(
                              e.target.checked
                                ? [...selected, r.session_id]
                                : selected.filter((id) => id !== r.session_id),
                            )
                          }
                        />
                        Perbaiki sesi ini
                      </label>
                    </Can>
                  )}
                </div>
              ),
            },
            {
              key: "baseline",
              header: "Acuan",
              render: (r) =>
                r.baseline
                  ? `${r.baseline.hari} ${r.baseline.jam_mulai}–${r.baseline.jam_selesai} · ${room(r.baseline.ruang_id)}`
                  : "Sesi baru",
            },
            {
              key: "hari",
              header: "Usulan waktu",
              render: (r) =>
                editing ? (
                  <div className="space-y-1">
                    <select
                      aria-label="Hari usulan"
                      className="select select-sm"
                      {...register(`assignments.${r.index}.hari`)}
                    >
                      {["Senin", "Selasa", "Rabu", "Kamis", "Jumat"].map(
                        (d) => (
                          <option key={d}>{d}</option>
                        ),
                      )}
                    </select>
                    <input
                      aria-label="Jam mulai usulan"
                      type="time"
                      className="input input-sm"
                      {...register(`assignments.${r.index}.jam_mulai`)}
                    />
                    <input
                      aria-label="Jam selesai usulan"
                      type="time"
                      className="input input-sm"
                      {...register(`assignments.${r.index}.jam_selesai`)}
                    />
                  </div>
                ) : (
                  `${r.hari} ${r.jam_mulai}–${r.jam_selesai} (${r.frekuensi})`
                ),
            },
            {
              key: "ruang_id",
              header: "Usulan ruang",
              render: (r) =>
                editing ? (
                  <select
                    aria-label="Ruang usulan"
                    className="select select-sm w-44"
                    {...register(`assignments.${r.index}.ruang_id`)}
                  >
                    {setup.rooms.map((s) => (
                      <option key={s.id} value={s.id}>
                        {room(s.id)}
                      </option>
                    ))}
                  </select>
                ) : (
                  room(r.ruang_id)
                ),
            },
            {
              key: "reason",
              header: "Perubahan / persetujuan",
              render: (r) => (
                <div className="space-y-2 text-sm">
                  <p>{r.reason}</p>
                  {r.backup && (
                    <>
                      <p>
                        {last("backup", r.session_id)?.approved
                          ? "Cadangan disetujui"
                          : last("backup", r.session_id)?.approved === false
                            ? "Cadangan ditolak"
                            : "Menunggu persetujuan cadangan"}
                      </p>
                      {mutable && (
                        <Can I="approve" a="Penjadwalan">
                          <div className="flex gap-1">
                            <button
                              type="button"
                              className="btn btn-xs"
                              disabled={busy}
                              onClick={() =>
                                decision("backup", true, r.session_id)
                              }
                            >
                              Setujui
                            </button>
                            <button
                              type="button"
                              className="btn btn-xs btn-ghost"
                              disabled={busy}
                              onClick={() =>
                                decision("backup", false, r.session_id)
                              }
                            >
                              Tolak
                            </button>
                          </div>
                        </Can>
                      )}
                    </>
                  )}
                </div>
              ),
            },
          ]}
        />
        {Object.keys(errors).length > 0 && (
          <p className="text-error">Periksa waktu serta ruang usulan.</p>
        )}
        {mutable && (
          <Can I="update" a="Penjadwalan">
            <div className="flex gap-2">
              {editing ? (
                <>
                  <button className="btn btn-primary" disabled={busy}>
                    Validasi dan simpan perubahan
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setEditing(false)}
                  >
                    Batal
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="btn"
                  onClick={() => setEditing(true)}
                >
                  Ubah penempatan manual
                </button>
              )}
              <button
                type="button"
                className="btn"
                disabled={!selected.length || busy}
                onClick={() => repair.mutate()}
              >
                Susun ulang sesi terpilih
              </button>
            </div>
            <p className="text-sm">
              Perubahan membatalkan persetujuan versi ini. Penyusunan ulang
              mengunci sesi yang tidak dipilih pada penempatan hasil saat ini.
            </p>
          </Can>
        )}
      </form>
      {mutable && (
        <section className="space-y-3">
          <label className="fieldset">
            <span>Catatan keputusan</span>
            <textarea
              className="textarea w-full"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={2000}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <Can I="review" a="Penjadwalan">
              <button
                className="btn"
                disabled={busy}
                onClick={() => decision("review", true)}
              >
                Setujui tinjauan fakultas
              </button>
              <button
                className="btn btn-ghost"
                disabled={busy}
                onClick={() => decision("review", false)}
              >
                Tolak tinjauan
              </button>
            </Can>
            <Can I="approve" a="Penjadwalan">
              <button
                className="btn"
                disabled={busy}
                onClick={() => decision("approve", true)}
              >
                Sahkan versi ini
              </button>
              <button
                className="btn btn-ghost"
                disabled={busy}
                onClick={() => decision("approve", false)}
              >
                Cabut pengesahan
              </button>
            </Can>
          </div>
          <p className="text-sm">
            Tinjauan fakultas:{" "}
            {last("review")?.approved ? "disetujui" : "belum disetujui"} ·
            Pengesahan pusat:{" "}
            {last("approve")?.approved ? "disetujui" : "belum disetujui"}
          </p>
          <Can I="publish" a="Penjadwalan">
            <PublishButton
              pending={pending}
              onPublish={() => run.mutate({ action: "publish", body: {} })}
              busy={busy}
            />
          </Can>
        </section>
      )}
      <DataTable
        rows={scenario.decisions || []}
        tableKey="decisions_"
        columns={[
          { key: "at", header: "Waktu" },
          { key: "action", header: "Keputusan" },
          {
            key: "approved",
            header: "Hasil",
            render: (r) => (r.approved ? "Disetujui" : "Ditolak"),
          },
          { key: "note", header: "Catatan" },
        ]}
        rowKey={(r, i) => i}
        emptyText="Belum ada keputusan pada versi ini."
      />
    </div>
  );
}
function PublishButton({ onPublish, busy, pending }) {
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="checkbox checkbox-sm"
          checked={confirm}
          onChange={(e) => setConfirm(e.target.checked)}
        />
        Saya sudah meninjau perubahan dan akan mengganti jadwal aktif fakultas
        pada semester ini.
      </label>
      <button
        className="btn btn-primary"
        disabled={!confirm || busy || pending.length > 0}
        onClick={onPublish}
      >
        Publikasikan jadwal
      </button>
      {pending.length > 0 && (
        <p className="text-sm text-warning">
          Belum dapat dipublikasikan: {pending.join("; ")}.
        </p>
      )}
    </div>
  );
}
