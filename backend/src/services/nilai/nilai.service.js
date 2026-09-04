'use strict';

const {
  sequelize,
  NilaiMahasiswa,
  KrsDetil,
  SumberPenilaian,
  Cpmk,
  Kelas,
  Matakuliah,
  Mahasiswa,
  Krs,
  HistoryUploadNilai,
} = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const logger = require('../../utils/logger');
const { assertNilaiPeriodForKelas, assertNilaiPeriodForKrsDetil } = require('../../helpers/academicPeriod');

const LIST_OPTIONS = {
  searchFields: [],
  sortableFields: ['nilai', 'createdAt'],
  filterableFields: ['krs_detil_id', 'sumber_penilaian_id'],
  defaultInclude: [
    {
      model: KrsDetil,
      as: 'krsDetil',
      include: [
        {
          model: Krs,
          as: 'krs',
          include: [{ model: Mahasiswa, as: 'mahasiswa' }],
        },
        {
          model: Kelas,
          as: 'kelas',
          include: [{ model: Matakuliah, as: 'matakuliah' }],
        },
      ],
    },
    {
      model: SumberPenilaian,
      as: 'sumberPenilaian',
      include: [{ model: Cpmk, as: 'cpmk' }],
    },
  ],
};

const list = (query) => paginate(NilaiMahasiswa, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await NilaiMahasiswa.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('Nilai mahasiswa dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const create = async (payload) => {
  await assertNilaiPeriodForKrsDetil(payload.krs_detil_id);
  const item = await NilaiMahasiswa.create(payload);
  return NilaiMahasiswa.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload) => {
  const item = await getById(id);
  await assertNilaiPeriodForKrsDetil(item.krs_detil_id);
  await item.update(payload);
  return NilaiMahasiswa.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id) => {
  const item = await getById(id);
  await assertNilaiPeriodForKrsDetil(item.krs_detil_id);
  await item.destroy();
  return { id };
};

const uploadBulk = async (payload, userId) => {
  const { kelas_id, items, keterangan, file_name } = payload;

  return sequelize.transaction(async (transaction) => {
    if (kelas_id) {
      await assertNilaiPeriodForKelas(kelas_id);
    } else {
      await assertNilaiPeriodForKrsDetil(items[0].krs_detil_id);
    }
    const savedNilai = [];

    for (const item of items) {
      let record = await NilaiMahasiswa.findOne({
        where: {
          krs_detil_id: item.krs_detil_id,
          sumber_penilaian_id: item.sumber_penilaian_id,
        },
        transaction,
      });

      if (record) {
        await record.update({ nilai: item.nilai, catatan: item.catatan }, { transaction });
      } else {
        record = await NilaiMahasiswa.create({
          krs_detil_id: item.krs_detil_id,
          sumber_penilaian_id: item.sumber_penilaian_id,
          nilai: item.nilai,
          catatan: item.catatan,
        }, { transaction });
      }

      savedNilai.push(record);
    }

    if (kelas_id) {
      await HistoryUploadNilai.create({
        kelas_id,
        user_id: userId || null,
        tipe: 'Bulk Excel / Form',
        file_name: file_name || 'manual_entry.xlsx',
        keterangan: keterangan || `Berhasil mengunggah ${items.length} data nilai`,
      }, { transaction });
    }

    logger.info({ userId, count: savedNilai.length, kelasId: kelas_id }, 'Bulk nilai uploaded');
    return savedNilai;
  });
};

module.exports = { list, getById, create, update, remove, uploadBulk };
