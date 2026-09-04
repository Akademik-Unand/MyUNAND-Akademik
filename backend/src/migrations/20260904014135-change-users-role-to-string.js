'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      "ALTER TABLE users MODIFY role VARCHAR(64) NOT NULL DEFAULT 'admin'"
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      "ALTER TABLE users MODIFY role ENUM('superadmin', 'admin', 'dosen', 'mahasiswa') NOT NULL DEFAULT 'admin'"
    );
  },
};
