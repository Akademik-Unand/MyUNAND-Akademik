"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex("krs_detil", ["kelas_id"], {
      name: "idx_krs_detil_kelas",
    });
    await queryInterface.addIndex("cpmk", ["matakuliah_id"], {
      name: "idx_cpmk_matakuliah",
    });
    await queryInterface.addIndex("sumber_penilaian", ["cpmk_id"], {
      name: "idx_sumber_penilaian_cpmk",
    });
    await queryInterface.addIndex("cpmk_scp", ["cpmk_id"], {
      name: "idx_cpmk_scp_cpmk",
    });
    await queryInterface.addIndex("scp", ["cp_id"], { name: "idx_scp_cp" });
    await queryInterface.addIndex(
      "matakuliah_kurikulum",
      ["kurikulum_id", "matakuliah_id"],
      { name: "idx_mk_kurikulum_lookup" },
    );
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "matakuliah_kurikulum",
      "idx_mk_kurikulum_lookup",
    );
    await queryInterface.removeIndex("scp", "idx_scp_cp");
    await queryInterface.removeIndex("cpmk_scp", "idx_cpmk_scp_cpmk");
    await queryInterface.removeIndex(
      "sumber_penilaian",
      "idx_sumber_penilaian_cpmk",
    );
    await queryInterface.removeIndex("cpmk", "idx_cpmk_matakuliah");
    await queryInterface.removeIndex("krs_detil", "idx_krs_detil_kelas");
  },
};
