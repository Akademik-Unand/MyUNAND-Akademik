import { z } from "zod";
const uuid = z.string().uuid();
const clock = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const windowSchema = z
  .object({
    hari: z.enum(["Senin", "Selasa", "Rabu", "Kamis", "Jumat"]),
    jam_mulai: clock,
    jam_selesai: clock,
    frekuensi: z.enum(["Mingguan", "Ganjil", "Genap"]),
  })
  .refine((v) => v.jam_selesai > v.jam_mulai, {
    message: "Jam selesai harus setelah jam mulai",
    path: ["jam_selesai"],
  });
export const sessionFormSchema = z.object({
  nama: z.string().trim().min(1, "Nama skenario wajib diisi").max(200),
  sessions: z
    .array(
      z.object({
        id: z.string().min(1),
        kelas_id: uuid,
        duration: z.coerce.number().int().min(10).max(600),
        frekuensi: z.enum(["Mingguan", "Ganjil", "Genap"]),
        groups: z.string().trim().min(1, "Kelompok paket wajib diisi"),
        type: z.string().trim().min(1, "Jenis ruang wajib diisi"),
        facilities: z.string(),
        lock_room: z.boolean(),
        lock_time: z.boolean(),
      }),
    )
    .min(1),
  slots: z.array(windowSchema).min(1),
  max_seconds: z.coerce.number().int().min(1).max(1800),
});
export const policyFormSchema = z
  .object({
    main_buildings: z.array(uuid).min(1, "Pilih gedung utama"),
    backup_buildings: z.array(uuid),
    rooms: z.array(
      z.object({
        id: uuid,
        type: z.string(),
        facilities: z.string(),
        zone: z.string(),
      }),
    ),
    travel: z.array(
      z.object({
        from: uuid,
        to: uuid,
        minutes: z.coerce.number().int().min(0).max(240),
      }),
    ),
    unavailable: z.array(
      z.object({
        resource: z.enum(["room", "lecturer"]),
        resource_id: uuid,
        ...windowSchema.shape,
      }),
    ),
    reservations: z.array(
      z.object({ ruang_id: uuid, fakultas_id: uuid, ...windowSchema.shape }),
    ),
  })
  .refine(
    (v) => !v.main_buildings.some((id) => v.backup_buildings.includes(id)),
    {
      message: "Gedung utama dan cadangan harus berbeda",
      path: ["backup_buildings"],
    },
  );
export const splitList = (v) =>
  String(v || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
export function sessionInput(values, baseline = []) {
  return {
    sessions: values.sessions.map((s) => ({
      ...s,
      groups: splitList(s.groups),
      facilities: splitList(s.facilities),
    })),
    slots: values.slots,
    max_seconds: values.max_seconds,
    baseline: baseline.filter((b) =>
      values.sessions.some((s) => s.id === b.session_id),
    ),
  };
}
