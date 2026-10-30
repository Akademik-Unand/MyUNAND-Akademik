import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DataTable } from "../common/DataTable";
import { sessionFormSchema, sessionInput } from "../../validations/penjadwalan";
const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
const defaultSlots = () =>
  days.flatMap((hari) =>
    Array.from({ length: 20 }, (_, i) => ({
      hari,
      jam_mulai: `${String(7 + Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`,
      jam_selesai: "18:00",
      frekuensi: "Mingguan",
    })),
  );
const initial = (setup) =>
  setup.classes.flatMap((c) => {
    const schedules = setup.schedules.filter((s) => s.kelas_id === c.id);
    return (schedules.length ? schedules : [null]).map((s, i) => ({
      id: s?.id || `${c.id}_${i + 1}`,
      kelas_id: c.id,
      duration:
        s?.jam_mulai && s?.jam_selesai
          ? Number(s.jam_selesai.slice(0, 2)) * 60 +
            Number(s.jam_selesai.slice(3, 5)) -
            (Number(s.jam_mulai.slice(0, 2)) * 60 +
              Number(s.jam_mulai.slice(3, 5)))
          : 100,
      frekuensi: s?.frekuensi || "Mingguan",
      groups: "",
      type: "teori",
      facilities: "",
      lock_room: false,
      lock_time: false,
    }));
  });
export function SessionForm({ setup, scenario, onSave, busy }) {
  const defaults = scenario
    ? {
        nama: scenario.nama,
        ...scenario.input,
        sessions: [
          ...scenario.input.sessions.map((s) => ({
            ...s,
            groups: s.groups.join(", "),
            facilities: s.facilities.join(", "),
          })),
          ...initial(setup).filter(
            (s) =>
              !scenario.input.sessions.some((v) => v.kelas_id === s.kelas_id),
          ),
        ],
      }
    : {
        nama: "",
        sessions: initial(setup),
        slots: defaultSlots(),
        max_seconds: 120,
      };
  const {
    register,
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: defaults,
  });
  const sessions = useFieldArray({
    control,
    name: "sessions",
    keyName: "fieldKey",
  });
  const slots = useFieldArray({ control, name: "slots", keyName: "fieldKey" });
  const label = (id) => setup.classes.find((c) => c.id === id)?.label || id;
  const columns = [
    {
      key: "kelas_id",
      header: "Kelas / sesi",
      render: (r) => (
        <div>
          {label(r.kelas_id)}
          <div className="text-xs opacity-60">{r.id}</div>
        </div>
      ),
    },
    {
      key: "duration",
      header: "Durasi (menit)",
      render: (r, i) => (
        <input
          aria-label={`Durasi ${r.id}`}
          className="input input-sm w-24"
          type="number"
          {...register(`sessions.${i}.duration`)}
        />
      ),
    },
    {
      key: "frekuensi",
      header: "Minggu",
      render: (r, i) => (
        <select
          aria-label={`Frekuensi ${r.id}`}
          className="select select-sm w-28"
          {...register(`sessions.${i}.frekuensi`)}
        >
          {["Mingguan", "Ganjil", "Genap"].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      ),
    },
    {
      key: "groups",
      header: "Kelompok paket",
      render: (r, i) => (
        <input
          aria-label={`Kelompok ${r.id}`}
          className="input input-sm w-44"
          placeholder="TI-2025-A, MKU-1"
          {...register(`sessions.${i}.groups`)}
        />
      ),
    },
    {
      key: "type",
      header: "Jenis / fasilitas ruang",
      render: (r, i) => (
        <div className="space-y-1">
          <input
            aria-label={`Jenis ruang ${r.id}`}
            className="input input-sm w-36"
            placeholder="teori / lab"
            {...register(`sessions.${i}.type`)}
          />
          <input
            aria-label={`Fasilitas ${r.id}`}
            className="input input-sm w-36"
            placeholder="komputer, proyektor"
            {...register(`sessions.${i}.facilities`)}
          />
        </div>
      ),
    },
    {
      key: "lock",
      header: "Kunci acuan",
      render: (r, i) => (
        <div className="space-y-1">
          <label className="flex gap-2">
            <input
              className="checkbox checkbox-sm"
              type="checkbox"
              {...register(`sessions.${i}.lock_room`)}
            />
            Ruang
          </label>
          <label className="flex gap-2">
            <input
              className="checkbox checkbox-sm"
              type="checkbox"
              {...register(`sessions.${i}.lock_time`)}
            />
            Waktu
          </label>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Sesi",
      render: (r, i) => (
        <div className="flex gap-1">
          <button
            type="button"
            className="btn btn-xs"
            onClick={() =>
              sessions.append({
                ...getValues(`sessions.${i}`),
                id: `${r.kelas_id}_${crypto.randomUUID().slice(0, 8)}`,
                lock_room: false,
                lock_time: false,
              })
            }
          >
            Tambah
          </button>
          <button
            type="button"
            className="btn btn-xs btn-ghost"
            onClick={() => sessions.remove(i)}
          >
            Hapus
          </button>
        </div>
      ),
    },
  ];
  // Stable source indices are necessary because DataTable can sort and paginate rows.
  const rows = sessions.fields.map((r, index) => ({ ...r, index }));
  const indexedColumns = columns.map((c) => ({
    ...c,
    render: c.render ? (r) => c.render(r, r.index) : undefined,
  }));
  return (
    <form
      onSubmit={handleSubmit((v) =>
        onSave({
          nama: v.nama,
          input: sessionInput(v, scenario?.input.baseline || []),
        }),
      )}
      className="space-y-4"
    >
      <label className="fieldset">
        <span className="fieldset-legend">Nama skenario</span>
        <input className="input w-full" {...register("nama")} />
      </label>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-sm max-w-3xl">
          Tentukan kelompok mahasiswa yang wajib bisa mengikuti kelas bersama.
          Gunakan nama kelompok yang sama untuk sesi yang tidak boleh bentrok;
          pisahkan beberapa kelompok dengan koma. Periksa durasi teori/praktikum
          sebelum menyimpan.
        </p>
        <button
          type="button"
          className="btn btn-xs btn-outline"
          onClick={() => {
            const current = getValues("sessions") || [];
            const defaultFacility =
              setup.policy?.config?.rooms?.[0]?.facilities?.[0] || "";
            const defaultType =
              setup.policy?.config?.rooms?.[0]?.type || "teori";
            current.forEach((s, idx) => {
              if (!String(s.groups || "").trim()) {
                const cls = setup.classes.find((c) => c.id === s.kelas_id);
                const code = cls?.course_code || `KELAS-${idx + 1}`;
                const section = cls?.nama || "A";
                setValue(`sessions.${idx}.groups`, `${code}-${section}`, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }
              if (!String(s.type || "").trim()) {
                setValue(`sessions.${idx}.type`, defaultType, {
                  shouldDirty: true,
                });
              }
              if (!String(s.facilities || "").trim() && defaultFacility) {
                setValue(`sessions.${idx}.facilities`, defaultFacility, {
                  shouldDirty: true,
                });
              }
            });
          }}
        >
          Isi otomatis kelompok paket kosong
        </button>
      </div>
      <p className="text-sm opacity-70">
        Prioritas simulasi: gedung utama, jumlah sesi berubah, perubahan waktu,
        gedung dan ruang, lalu perpindahan, jeda serta keseimbangan beban.
      </p>
      <DataTable
        rows={rows}
        tableKey="session_"
        columns={indexedColumns}
        rowKey={(r) => r.fieldKey}
        searchableFields={["id", "kelas_id"]}
        emptyText="Belum ada kebutuhan sesi."
      />
      <details className="collapse collapse-arrow border border-base-300">
        <summary className="collapse-title">
          Waktu mulai yang diizinkan dan batas pencarian
        </summary>
        <div className="collapse-content space-y-3">
          <p className="text-sm">
            Setiap baris menyediakan waktu mulai; sesi harus selesai sebelum
            batas akhir. Atur waktu istirahat melalui ketidaktersediaan
            ruang/dosen.
          </p>
          {slots.fields.map((s, i) => (
            <div key={s.fieldKey} className="flex flex-wrap gap-2">
              <select
                className="select select-sm w-28"
                aria-label="Hari"
                {...register(`slots.${i}.hari`)}
              >
                {days.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
              <input
                className="input input-sm w-28"
                type="time"
                aria-label="Jam mulai"
                {...register(`slots.${i}.jam_mulai`)}
              />
              <input
                className="input input-sm w-28"
                type="time"
                aria-label="Batas selesai"
                {...register(`slots.${i}.jam_selesai`)}
              />
              <select
                className="select select-sm w-28"
                aria-label="Pola minggu"
                {...register(`slots.${i}.frekuensi`)}
              >
                {["Mingguan", "Ganjil", "Genap"].map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={() => slots.remove(i)}
              >
                Hapus
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-sm"
            onClick={() =>
              slots.append({
                hari: "Senin",
                jam_mulai: "08:00",
                jam_selesai: "17:00",
                frekuensi: "Mingguan",
              })
            }
          >
            Tambah waktu mulai
          </button>
          <label className="fieldset">
            <span>Batas pencarian (detik)</span>
            <input
              className="input w-40"
              type="number"
              {...register("max_seconds")}
            />
          </label>
        </div>
      </details>
      {Object.keys(errors).length > 0 && (
        <div role="alert" className="alert alert-error">
          Periksa nama, durasi, kelompok paket, jenis ruang, serta rentang
          waktu. Semua sesi wajib memiliki kelompok paket.
        </div>
      )}
      <button className="btn btn-primary" disabled={busy}>
        {busy && <span className="loading loading-spinner loading-xs" />}Simpan
        kebutuhan sesi
      </button>
    </form>
  );
}
