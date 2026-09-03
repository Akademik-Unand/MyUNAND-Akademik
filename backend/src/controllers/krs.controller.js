'use strict';
const { Krs, KrsDetil, Kelas, Matakuliah, Mahasiswa, SemesterProdi, DosenKelas, Dosen } = require('../models');
const { success, notFound, validationError } = require('../helpers/response');
const createCrudController = require('./crudFactory');

const baseKrsController = createCrudController(Krs, {
  defaultInclude: [
    { model: Mahasiswa, as: 'mahasiswa' },
    { model: SemesterProdi, as: 'semesterProdi' },
    {
      model: KrsDetil,
      as: 'krsDetil',
      include: [
        {
          model: Kelas,
          as: 'kelas',
          include: [{ model: Matakuliah, as: 'matakuliah' }],
        },
      ],
    },
  ],
});

const approveKrs = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { approval_ke } = req.body;

    const krs = await Krs.findByPk(id, {
      include: [{ model: KrsDetil, as: 'krsDetil' }],
    });

    if (!krs) {
      return notFound(res, 'KRS tidak ditemukan');
    }

    await krs.update({
      approval_ke: approval_ke !== undefined ? approval_ke : (krs.approval_ke + 1),
      jam_selesai: new Date(),
    });

    // Also approve all pending detil if approval_ke >= 1
    if (krs.krsDetil && krs.krsDetil.length > 0) {
      await KrsDetil.update(
        { approved: '1' },
        { where: { krs_id: krs.id, approved: '0' } }
      );
    }

    const updated = await Krs.findByPk(id, {
      include: [
        { model: Mahasiswa, as: 'mahasiswa' },
        {
          model: KrsDetil,
          as: 'krsDetil',
          include: [{ model: Kelas, as: 'kelas', include: ['matakuliah'] }],
        },
      ],
    });

    return success(res, {
      message: 'KRS berhasil disetujui',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

const updateDetilStatus = async (req, res, next) => {
  try {
    const { detilId } = req.params;
    const { approved } = req.body; // '0', '1', '2'

    if (!['0', '1', '2'].includes(String(approved))) {
      return validationError(res, { approved: 'Status approved harus 0 (pending), 1 (setuju), atau 2 (tolak)' });
    }

    const detil = await KrsDetil.findByPk(detilId);
    if (!detil) {
      return notFound(res, 'Item KRS Detil tidak ditemukan');
    }

    await detil.update({ approved: String(approved) });

    return success(res, {
      message: 'Status KRS Detil berhasil diperbarui',
      data: detil,
    });
  } catch (err) {
    next(err);
  }
};

const getKrsByMahasiswa = async (req, res, next) => {
  try {
    const { mahasiswaId } = req.params;
    const krsList = await Krs.findAll({
      where: { mahasiswa_id: mahasiswaId },
      include: [
        { model: SemesterProdi, as: 'semesterProdi' },
        {
          model: KrsDetil,
          as: 'krsDetil',
          include: [
            {
              model: Kelas,
              as: 'kelas',
              include: [{ model: Matakuliah, as: 'matakuliah' }],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return success(res, {
      message: 'Riwayat KRS mahasiswa berhasil diambil',
      data: krsList,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  ...baseKrsController,
  approveKrs,
  updateDetilStatus,
  getKrsByMahasiswa,
};
