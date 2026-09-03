'use strict';
const { NilaiMahasiswa, KrsDetil, SumberPenilaian, Cpmk, Kelas, Matakuliah, Mahasiswa, Krs, HistoryUploadNilai } = require('../models');
const { success, error, validationError } = require('../helpers/response');
const createCrudController = require('./crudFactory');

const baseNilaiController = createCrudController(NilaiMahasiswa, {
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
});

const uploadNilaiBulk = async (req, res, next) => {
  try {
    const { kelas_id, items, keterangan, file_name } = req.body;
    // items: array of { krs_detil_id, sumber_penilaian_id, nilai, catatan }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return validationError(res, { items: 'Data nilai items (array) wajib dikirimkan' });
    }

    const savedNilai = [];
    for (const item of items) {
      const { krs_detil_id, sumber_penilaian_id, nilai, catatan } = item;

      // Upsert: update if existing for same krs_detil_id and sumber_penilaian_id
      let record = await NilaiMahasiswa.findOne({
        where: { krs_detil_id, sumber_penilaian_id },
      });

      if (record) {
        await record.update({ nilai, catatan });
      } else {
        record = await NilaiMahasiswa.create({
          krs_detil_id,
          sumber_penilaian_id,
          nilai,
          catatan,
        });
      }
      savedNilai.push(record);
    }

    // Record upload history if kelas_id is provided
    if (kelas_id) {
      await HistoryUploadNilai.create({
        kelas_id,
        user_id: req.user ? req.user.id : null,
        tipe: 'Bulk Excel / Form',
        file_name: file_name || 'manual_entry.xlsx',
        keterangan: keterangan || `Berhasil mengunggah ${items.length} data nilai`,
      });
    }

    return success(res, {
      message: `Berhasil memproses ${savedNilai.length} data nilai mahasiswa`,
      data: savedNilai,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  ...baseNilaiController,
  uploadNilaiBulk,
};
