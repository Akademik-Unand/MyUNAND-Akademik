'use strict';

const { Op } = require('sequelize');
const { Cpmk, CpmkScp, SumberPenilaian } = require('../models');

const getNilaiAssessmentReadiness = async (matakuliahId, transaction) => {
  const cpmks = await Cpmk.findAll({
    where: { matakuliah_id: matakuliahId },
    attributes: ['id', 'nama_cpmk', 'parent_cpmk_id'],
    include: [{
      model: SumberPenilaian,
      as: 'sumberPenilaian',
      attributes: ['id', 'nama_sumber_penilaian', 'bobot'],
    }],
    transaction,
  });

  const errors = [];
  if (!cpmks.length) {
    return {
      ready: false,
      errors: ['CPMK mata kuliah ini belum tersedia. Lengkapi CPMK sebelum input nilai.'],
    };
  }

  const parentIds = new Set(cpmks.map((item) => item.parent_cpmk_id).filter(Boolean));
  const leaves = cpmks.filter((item) => !parentIds.has(item.id));
  const mappingIds = [...new Set(leaves.flatMap((item) => [item.id, item.parent_cpmk_id].filter(Boolean)))];
  const mappings = mappingIds.length
    ? await CpmkScp.findAll({
      where: { cpmk_id: { [Op.in]: mappingIds } },
      attributes: ['cpmk_id'],
      transaction,
    })
    : [];
  const mappedIds = new Set(mappings.map((item) => String(item.cpmk_id)));

  for (const cpmk of leaves) {
    const sources = cpmk.sumberPenilaian || [];
    if (!sources.length) {
      errors.push(`${cpmk.nama_cpmk} belum memiliki sumber penilaian dan bobot.`);
    }
    if (!mappedIds.has(String(cpmk.id)) && !(cpmk.parent_cpmk_id && mappedIds.has(String(cpmk.parent_cpmk_id)))) {
      errors.push(`${cpmk.nama_cpmk} belum dipetakan ke SCP/CPL.`);
    }
    for (const source of sources) {
      if (Number(source.bobot) <= 0) {
        errors.push(`Bobot sumber penilaian "${source.nama_sumber_penilaian}" pada ${cpmk.nama_cpmk} harus lebih dari 0%.`);
      }
    }
  }

  return { ready: errors.length === 0, errors };
};

module.exports = { getNilaiAssessmentReadiness };
