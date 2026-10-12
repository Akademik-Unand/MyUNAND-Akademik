import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DataTable } from "../common/DataTable";
import { policyFormSchema, splitList } from "../../validations/penjadwalan";
const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
function Windows({ name, register, control, rooms, lecturers, faculties }) {
  const { fields, append, remove } = useFieldArray({ control, name });
  const values = useWatch({ control, name }) || [];
  return (
    <section className="space-y-2">
      <h3 className="font-semibold">
        {name === "unavailable" ? "Waktu tidak tersedia" : "Reservasi fakultas"}
      </h3>
      {fields.map((f, i) => (
        <div key={f.id} className="flex flex-wrap gap-2">
          {name === "unavailable" ? (
            <>
              <select
                aria-label="Jenis sumber daya"
                className="select select-sm w-28"
                {...register(`${name}.${i}.resource`)}
              >
                <option value="room">Ruang</option>
                <option value="lecturer">Dosen</option>
              </select>
              <select
                aria-label="Sumber daya"
                className="select select-sm w-48"
                {...register(`${name}.${i}.resource_id`)}
              >
                <option value="">Pilih</option>
                {(values[i]?.resource === "lecturer" ? lecturers : rooms).map(
                  (r) => (
                    <option key={r.id} value={r.id}>
                      {r.nama || r.kode || r.id}
                    </option>
                  ),
                )}
              </select>
            </>
          ) : (
            <>
              <select
                aria-label="Ruang reservasi"
                className="select select-sm w-40"
                {...register(`${name}.${i}.ruang_id`)}
              >
                <option value="">Pilih ruang</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.kode} {r.nama}
                  </option>
                ))}
              </select>
              <select
                aria-label="Fakultas pemakai"
                className="select select-sm w-48"
                {...register(`${name}.${i}.fakultas_id`)}
              >
                <option value="">Pilih fakultas</option>
                {faculties.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nama_resmi}
                  </option>
                ))}
              </select>
            </>
          )}
          <select
            aria-label="Hari aturan"
            className="select select-sm w-28"
            {...register(`${name}.${i}.hari`)}
          >
            {days.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <input
            aria-label="Mulai aturan"
            type="time"
            className="input input-sm w-28"
            {...register(`${name}.${i}.jam_mulai`)}
          />
          <input
            aria-label="Selesai aturan"
            type="time"
            className="input input-sm w-28"
            {...register(`${name}.${i}.jam_selesai`)}
          />
          <select
            aria-label="Minggu aturan"
            className="select select-sm w-28"
            {...register(`${name}.${i}.frekuensi`)}
          >
            {["Mingguan", "Ganjil", "Genap"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() => remove(i)}
          >
            Hapus
          </button>
        </div>
      ))}
      <button
        type="button"
        className="btn btn-sm"
        onClick={() =>
          append({
            ...(name === "unavailable"
              ? { resource: "room", resource_id: "" }
              : { ruang_id: "", fakultas_id: "" }),
            hari: "Senin",
            jam_mulai: "12:00",
            jam_selesai: "13:00",
            frekuensi: "Mingguan",
          })
        }
      >
        Tambah aturan
      </button>
    </section>
  );
}
export function PolicyForm({ setup, faculties, onSave, busy }) {
  const existing = setup.policy?.config;
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(policyFormSchema),
    defaultValues: {
      main_buildings: existing?.main_buildings || [],
      backup_buildings: existing?.backup_buildings || [],
      rooms: setup.rooms.map((r) => {
        const detail = existing?.rooms.find((v) => v.id === r.id);
        return {
          id: r.id,
          type: detail?.type || "",
          facilities: detail?.facilities.join(", ") || "",
          zone: detail?.zone || "",
        };
      }),
      travel: existing?.travel || [],
      unavailable: existing?.unavailable || [],
      reservations: existing?.reservations || [],
    },
  });
  const main = useWatch({ control, name: "main_buildings" }),
    backup = useWatch({ control, name: "backup_buildings" });
  const travel = useFieldArray({ control, name: "travel" });
  const rooms = setup.rooms
    .map((r, index) => ({ ...r, index }))
    .filter((r) => [...main, ...backup].includes(r.gedung_id));
  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit((v) =>
        onSave({
          ...v,
          rooms: v.rooms
            .filter((r) => rooms.some((x) => x.id === r.id))
            .map((r) => ({ ...r, facilities: splitList(r.facilities) })),
        }),
      )}
    >
      <p className="text-sm">
        Pilih F dan G sebagai gedung utama FTI setelah alokasi dikonfirmasi.
        Gedung cadangan hanya boleh dipakai setelah persetujuan pusat pada hasil
        simulasi.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {[
          ["main_buildings", "Gedung utama"],
          ["backup_buildings", "Gedung cadangan"],
        ].map(([name, label]) => (
          <fieldset key={name} className="fieldset">
            <legend className="fieldset-legend">{label}</legend>
            <Controller
              control={control}
              name={name}
              render={({ field }) => (
                <div className="flex flex-wrap gap-3">
                  {setup.buildings.map((b) => (
                    <label key={b.id} className="flex gap-2 items-center">
                      <input
                        className="checkbox checkbox-sm"
                        type="checkbox"
                        checked={field.value.includes(b.id)}
                        onChange={(e) =>
                          field.onChange(
                            e.target.checked
                              ? [...field.value, b.id]
                              : field.value.filter((v) => v !== b.id),
                          )
                        }
                      />
                      {b.kode} — {b.nama}
                    </label>
                  ))}
                </div>
              )}
            />
          </fieldset>
        ))}
      </div>
      <h3 className="font-semibold">Inventaris ruang yang diizinkan</h3>
      <p className="text-sm">
        Jenis ruang dan zona wajib diisi untuk ruang yang dipilih. Nama
        jenis/fasilitas harus sama dengan kebutuhan sesi.
      </p>
      <DataTable
        rows={rooms}
        tableKey="policy_room_"
        rowKey={(r) => r.id}
        searchableFields={["kode", "nama"]}
        columns={[
          {
            key: "nama",
            header: "Ruang / kapasitas",
            render: (r) => `${r.kode} ${r.nama} · ${r.kapasitas} kursi`,
          },
          {
            key: "type",
            header: "Jenis",
            render: (r) => (
              <input
                className="input input-sm"
                aria-label={`Jenis ${r.kode}`}
                placeholder="teori / lab"
                {...register(`rooms.${r.index}.type`)}
              />
            ),
          },
          {
            key: "facilities",
            header: "Fasilitas",
            render: (r) => (
              <input
                className="input input-sm"
                aria-label={`Fasilitas ${r.kode}`}
                placeholder="proyektor, komputer"
                {...register(`rooms.${r.index}.facilities`)}
              />
            ),
          },
          {
            key: "zone",
            header: "Kampus / zona",
            render: (r) => (
              <input
                className="input input-sm"
                aria-label={`Zona ${r.kode}`}
                placeholder="Limau Manis"
                {...register(`rooms.${r.index}.zone`)}
              />
            ),
          },
        ]}
      />
      <section className="space-y-2">
        <h3 className="font-semibold">Waktu perpindahan antargedung</h3>
        <p className="text-sm">
          Masukkan kedua arah. Jika belum ditentukan, perpindahan antargedung
          pada hari yang sama untuk dosen/kelompok yang sama akan diblokir.
        </p>
        {travel.fields.map((t, i) => (
          <div key={t.id} className="flex flex-wrap gap-2">
            {["from", "to"].map((key) => (
              <select
                key={key}
                aria-label={key === "from" ? "Gedung asal" : "Gedung tujuan"}
                className="select select-sm w-44"
                {...register(`travel.${i}.${key}`)}
              >
                <option value="">Pilih gedung</option>
                {setup.buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.kode} {b.nama}
                  </option>
                ))}
              </select>
            ))}
            <input
              aria-label="Menit perpindahan"
              type="number"
              className="input input-sm w-28"
              {...register(`travel.${i}.minutes`)}
            />
            <span className="self-center text-sm">menit</span>
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={() => travel.remove(i)}
            >
              Hapus
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => travel.append({ from: "", to: "", minutes: 15 })}
        >
          Tambah jalur
        </button>
      </section>
      <Windows
        name="unavailable"
        {...{
          register,
          control,
          rooms: setup.rooms,
          lecturers: setup.lecturers || [],
          faculties,
        }}
      />
      <Windows
        name="reservations"
        {...{ register, control, rooms: setup.rooms, lecturers: [], faculties }}
      />
      {Object.keys(errors).length > 0 && (
        <div className="alert alert-error" role="alert">
          Periksa pilihan gedung, ruang, waktu, dan jalur perpindahan.
        </div>
      )}
      <button className="btn btn-primary" disabled={busy}>
        {busy && <span className="loading loading-spinner loading-xs" />}Simpan
        kebijakan fakultas
      </button>
    </form>
  );
}
