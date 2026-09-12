"use strict";

const { BimbinganAkademik } = require("../models");
const AppError = require("./AppError");

const PA_REQUIRED_MESSAGE =
  "Anda belum memiliki dosen PA. Hubungi program studi terlebih dahulu.";

/**
 * Dosen pembimbing akademik (PA) aktif milik seorang mahasiswa. Dipakai bersama
 * oleh jalur KRS reguler maupun lintas prodi supaya keduanya mensyaratkan PA
 * yang sama sebelum mahasiswa mengambil mata kuliah.
 */
const getActivePa = (mahasiswaId, { transaction } = {}) =>
  BimbinganAkademik.findOne({
    where: { mahasiswa_id: mahasiswaId, status: "aktif" },
    order: [["updatedAt", "DESC"]],
    transaction,
  });

const assertActivePa = async (
  mahasiswaId,
  { transaction, message = PA_REQUIRED_MESSAGE } = {},
) => {
  const pa = await getActivePa(mahasiswaId, { transaction });
  if (!pa) throw new AppError(message, 422);
  return pa;
};

module.exports = { getActivePa, assertActivePa, PA_REQUIRED_MESSAGE };
