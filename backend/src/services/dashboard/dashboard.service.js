'use strict';

const { Mahasiswa, Dosen, Matakuliah, Kelas } = require('../../models');

const summary = async () => {
  const [mahasiswa, dosen, matakuliah, kelas] = await Promise.all([
    Mahasiswa.count(),
    Dosen.count(),
    Matakuliah.count(),
    Kelas.count(),
  ]);

  return { mahasiswa, dosen, matakuliah, kelas };
};

module.exports = { summary };
