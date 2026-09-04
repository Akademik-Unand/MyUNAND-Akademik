'use strict';

const { randomUUID } = require('crypto');

const pad = (n) => String(n).padStart(2, '0');
const isoDate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

module.exports = {
  async up(queryInterface) {
    const [semesters] = await queryInterface.sequelize.query(
      'SELECT id FROM semester WHERE is_aktif = 1 AND deletedAt IS NULL LIMIT 1'
    );
    const semesterId = semesters[0]?.id;
    if (!semesterId) return;

    const [existing] = await queryInterface.sequelize.query(
      'SELECT jenis FROM periode WHERE semester_id = ? AND deletedAt IS NULL',
      { replacements: [semesterId] }
    );
    const have = new Set(existing.map((row) => row.jenis));

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const tanggalMulai = isoDate(start);
    const tanggalSelesai = isoDate(end);
    const stamp = new Date();

    const rows = ['cpmk', 'nilai']
      .filter((jenis) => !have.has(jenis))
      .map((jenis) => ({
        id: randomUUID(),
        semester_id: semesterId,
        jenis,
        tanggal_mulai: tanggalMulai,
        tanggal_selesai: tanggalSelesai,
        createdAt: stamp,
        updatedAt: stamp,
      }));

    if (rows.length) {
      await queryInterface.bulkInsert('periode', rows);
    }
  },

  async down(queryInterface) {
    const [semesters] = await queryInterface.sequelize.query(
      'SELECT id FROM semester WHERE is_aktif = 1 AND deletedAt IS NULL LIMIT 1'
    );
    const semesterId = semesters[0]?.id;
    if (!semesterId) return;
    await queryInterface.bulkDelete('periode', { semester_id: semesterId, jenis: ['cpmk', 'nilai'] });
  },
};
