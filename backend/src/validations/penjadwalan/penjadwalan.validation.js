"use strict";
const Joi = require("joi");
const uuid = Joi.string().uuid();
const day = Joi.string().valid("Senin", "Selasa", "Rabu", "Kamis", "Jumat");
const time = Joi.string().pattern(/^([01]\d|2[0-3]):[0-5]\d$/);
const frequency = Joi.string()
  .valid("Mingguan", "Ganjil", "Genap")
  .default("Mingguan");
const placement = Joi.object({
  session_id: Joi.string().max(80).required(),
  ruang_id: uuid.required(),
  hari: day.required(),
  jam_mulai: time.required(),
  jam_selesai: time.required(),
  frekuensi: frequency,
});
const window = {
  hari: day.required(),
  jam_mulai: time.required(),
  jam_selesai: time.required(),
  frekuensi: frequency,
};
const validWindow = (v, h) =>
  v.jam_selesai > v.jam_mulai ? v : h.error("any.invalid");
const config = Joi.object({
  main_buildings: Joi.array().items(uuid).min(1).unique().required(),
  backup_buildings: Joi.array().items(uuid).unique().default([]),
  rooms: Joi.array()
    .items(
      Joi.object({
        id: uuid.required(),
        type: Joi.string().max(80).required(),
        facilities: Joi.array()
          .items(Joi.string().max(80))
          .unique()
          .default([]),
        zone: Joi.string().max(80).required(),
      }),
    )
    .unique("id")
    .default([]),
  travel: Joi.array()
    .items(
      Joi.object({
        from: uuid.required(),
        to: uuid.required(),
        minutes: Joi.number().integer().min(0).max(240).required(),
      }),
    )
    .default([]),
  unavailable: Joi.array()
    .items(
      Joi.object({
        resource: Joi.string().valid("room", "lecturer").required(),
        resource_id: uuid.required(),
        ...window,
      }),
    )
    .default([]),
  reservations: Joi.array()
    .items(
      Joi.object({
        ruang_id: uuid.required(),
        fakultas_id: uuid.required(),
        ...window,
      }),
    )
    .default([]),
}).required();
const input = Joi.object({
  sessions: Joi.array()
    .items(
      Joi.object({
        id: Joi.string()
          .pattern(/^[A-Za-z0-9_-]+$/)
          .max(80)
          .required(),
        kelas_id: uuid.required(),
        duration: Joi.number().integer().min(10).max(600).required(),
        frekuensi: frequency,
        groups: Joi.array()
          .items(Joi.string().max(100))
          .min(1)
          .unique()
          .required(),
        type: Joi.string().max(80).required(),
        facilities: Joi.array()
          .items(Joi.string().max(80))
          .unique()
          .default([]),
        lock_room: Joi.boolean().default(false),
        lock_time: Joi.boolean().default(false),
      }),
    )
    .min(1)
    .max(2000)
    .unique("id")
    .required(),
  slots: Joi.array()
    .items(Joi.object(window).custom(validWindow))
    .min(1)
    .max(500)
    .required(),
  baseline: Joi.array().items(placement).unique("session_id").default([]),
  max_seconds: Joi.number().integer().min(1).max(1800).default(120),
}).required();
const idParam = Joi.object({ id: uuid.required() });
const list = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(200).default(20),
  search: Joi.string().allow(""),
  sortBy: Joi.string().valid("nama", "status", "revision", "createdAt"),
  sortOrder: Joi.string().valid("asc", "desc"),
  filter: Joi.object().unknown(true),
  semester_id: uuid,
  fakultas_id: uuid,
});
module.exports = {
  input,
  config,
  placement,
  idParam,
  list,
  policy: Joi.object({
    semester_id: uuid.required(),
    fakultas_id: uuid.required(),
    config,
  }),
  create: Joi.object({
    semester_id: uuid.required(),
    fakultas_id: uuid.required(),
    nama: Joi.string().trim().max(200).required(),
    input,
  }),
  edit: Joi.object({
    revision: Joi.number().integer().min(1).required(),
    nama: Joi.string().trim().max(200),
    input,
    assignments: Joi.array().items(placement).min(1),
  }),
  revision: Joi.object({ revision: Joi.number().integer().min(1).required() }),
  decision: Joi.object({
    revision: Joi.number().integer().min(1).required(),
    action: Joi.string().valid("review", "approve", "backup").required(),
    approved: Joi.boolean().required(),
    session_id: Joi.string().max(80),
    note: Joi.string().trim().max(2000).allow("").default(""),
  }).custom((v, h) =>
    v.action === "backup" && !v.session_id ? h.error("any.invalid") : v,
  ),
  import: Joi.object({
    revision: Joi.number().integer().min(1).required(),
    format: Joi.string().valid("csv", "xlsx").required(),
    content: Joi.string().max(12000000).required(),
    mapping: Joi.object()
      .pattern(
        Joi.string().valid(
          "session_id",
          "ruang_id",
          "hari",
          "jam_mulai",
          "jam_selesai",
          "frekuensi",
          "kelas_id",
          "kode_matakuliah",
          "nama_kelas",
          "kode_prodi",
          "nomor_sesi",
          "kode_ruang",
          "kode_gedung",
        ),
        Joi.string().max(100),
      )
      .default({}),
  }),
  baseline: Joi.object({
    revision: Joi.number().integer().min(1).required(),
    baseline: Joi.array()
      .items(placement)
      .min(1)
      .unique("session_id")
      .required(),
  }),
  fork: Joi.object({
    nama: Joi.string().trim().max(200).required(),
    source_revision: Joi.number().integer().min(1),
  }),
};
