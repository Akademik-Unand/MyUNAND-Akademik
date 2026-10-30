"use strict";

const { v4: uuidv4 } = require("uuid");
const { MasterSumberPenilaian, Fakultas, sequelize } = require("../../models");
const { paginate } = require("../../helpers/listQuery");
const AppError = require("../../helpers/AppError");
const { restoreRecord } = require("../../helpers/softDelete");

const DEFAULT_MASTER_SUMBER_PENILAIAN = [
  {
    kode: "QUIZ",
    nama: "Quiz",
    kategori: "Kognitif / Formatif",
    bobot_default: 10,
    urutan: 1,
    deskripsi: "Evaluasi kuis berkala untuk mengukur pemahaman materi mingguan.",
  },
  {
    kode: "TUGAS",
    nama: "Tugas",
    kategori: "Kognitif / Terstruktur",
    bobot_default: 15,
    urutan: 2,
    deskripsi: "Penugasan mandiri atau kelompok terstruktur.",
  },
  {
    kode: "PRAKTIKUM",
    nama: "Pratikum",
    kategori: "Psikomotorik",
    bobot_default: 15,
    urutan: 3,
    deskripsi: "Penilaian keterampilan laboratorium atau praktik lapangan.",
  },
  {
    kode: "UTS",
    nama: "UTS",
    kategori: "Kognitif / Sumatif",
    bobot_default: 25,
    urutan: 4,
    deskripsi: "Ujian Tengah Semester (Sumatif Tengah Semester).",
  },
  {
    kode: "UAS",
    nama: "UAS",
    kategori: "Kognitif / Sumatif",
    bobot_default: 25,
    urutan: 5,
    deskripsi: "Ujian Akhir Semester (Sumatif Akhir Semester).",
  },
  {
    kode: "PJBL",
    nama: "Project",
    kategori: "Psikomotorik & Kolaboratif (IKU-7)",
    bobot_default: 30,
    urutan: 6,
    deskripsi: "Team-Based Project (PjBL) sesuai standar OBE & IKU-7 PTN-BH.",
  },
  {
    kode: "PBL",
    nama: "PBL",
    kategori: "Kognitif & Pemecahan Masalah (IKU-7)",
    bobot_default: 20,
    urutan: 7,
    deskripsi: "Problem-Based Learning / Case Method sesuai standar OBE & IKU-7.",
  },
  {
    kode: "AKTIF",
    nama: "Keaktifan",
    kategori: "Afektif & Partisipatif",
    bobot_default: 10,
    urutan: 8,
    deskripsi: "Partisipasi diskusi kelas, sikap, dan kontribusi aktif.",
  },
];

let initializedPromise = null;

const ensureInitialized = async () => {
  if (initializedPromise) return initializedPromise;
  initializedPromise = (async () => {
    try {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS master_sumber_penilaian (
          id CHAR(36) NOT NULL PRIMARY KEY,
          kode VARCHAR(30) NOT NULL,
          nama VARCHAR(100) NOT NULL,
          kategori VARCHAR(100) NULL DEFAULT 'Kognitif / Formatif',
          bobot_default DECIMAL(5,2) NULL DEFAULT 0,
          fakultas_id CHAR(36) NULL,
          deskripsi TEXT NULL,
          urutan INT NOT NULL DEFAULT 0,
          is_aktif TINYINT(1) NOT NULL DEFAULT 1,
          createdAt DATETIME NOT NULL,
          updatedAt DATETIME NOT NULL,
          deletedAt DATETIME NULL
        )
      `);
      const count = await MasterSumberPenilaian.count({ paranoid: false });
      if (count === 0) {
        const now = new Date();
        await MasterSumberPenilaian.bulkCreate(
          DEFAULT_MASTER_SUMBER_PENILAIAN.map((item) => ({
            id: uuidv4(),
            ...item,
            fakultas_id: null,
            is_aktif: true,
            createdAt: now,
            updatedAt: now,
          })),
        );
      }
    } catch (err) {
      initializedPromise = null;
      throw err;
    }
  })();
  return initializedPromise;
};

const LIST_OPTIONS = {
  searchFields: ["kode", "nama", "kategori", "deskripsi"],
  sortableFields: ["urutan", "kode", "nama", "kategori", "bobot_default", "createdAt"],
  filterableFields: ["fakultas_id", "kategori", "is_aktif"],
  defaultInclude: [{ model: Fakultas, as: "fakultas" }],
};

const list = async (query = {}) => {
  await ensureInitialized();
  const normalizedQuery = {
    sort: "urutan:asc",
    ...query,
  };
  return paginate(MasterSumberPenilaian, normalizedQuery, LIST_OPTIONS);
};

const getById = async (id) => {
  await ensureInitialized();
  const item = await MasterSumberPenilaian.findByPk(id, {
    include: LIST_OPTIONS.defaultInclude,
  });
  if (!item) {
    throw new AppError("Master Sumber Penilaian tidak ditemukan", 404);
  }
  return item;
};

const create = async (payload) => {
  await ensureInitialized();
  const item = await MasterSumberPenilaian.create({
    ...payload,
    fakultas_id: payload.fakultas_id || null,
  });
  return MasterSumberPenilaian.findByPk(item.id, {
    include: LIST_OPTIONS.defaultInclude,
  });
};

const update = async (id, payload) => {
  const item = await getById(id);
  await item.update({
    ...payload,
    fakultas_id:
      payload.fakultas_id === "" ? null : (payload.fakultas_id ?? item.fakultas_id),
  });
  return MasterSumberPenilaian.findByPk(item.id, {
    include: LIST_OPTIONS.defaultInclude,
  });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

const restore = async (id) => {
  await ensureInitialized();
  return restoreRecord(MasterSumberPenilaian, id, "Master Sumber Penilaian");
};

module.exports = { list, getById, create, update, remove, restore };
