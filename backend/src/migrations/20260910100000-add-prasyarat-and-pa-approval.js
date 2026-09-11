"use strict";

const { DataTypes } = require("sequelize");

/**
 * Cross enrollment versi final:
 * - `matakuliah.has_prasyarat` menandai MK yang punya prasyarat. MK berprasyarat
 *   tidak boleh dibuka pada penawaran lintas prodi.
 * - Persetujuan pengajuan lintas prodi dilakukan oleh Dosen PA (1 tahap),
 *   menggantikan alur prodi asal -> prodi penyelenggara.
 *
 * Catatan penting:
 * - Rename kolom audit `host_approved_*` TIDAK memakai `renameColumn` karena pada
 *   MySQL `CHANGE COLUMN` melepas atribut BINARY kolom UUID sehingga foreign key
 *   ke `users.id` menjadi tidak kompatibel. Kolom baru dibuat, data disalin,
 *   lalu kolom lama dibuang.
 * - Migrasi ini idempoten: bila sebelumnya gagal di tengah (DDL MySQL tidak
 *   rollback), menjalankan ulang tetap aman.
 */

const ENUM_NEW = ["pending_pa", "approved", "rejected", "cancelled"];
const ENUM_OLD = ["pending_host", "approved", "rejected_host", "cancelled"];
const ENUM_SUPERSET = [
  "pending_home",
  "pending_host",
  "pending_pa",
  "approved",
  "rejected_home",
  "rejected_host",
  "rejected",
  "cancelled",
];

const QUOTA_INDEX = "idx_krs_detil_cross_status_kelas";
const STATUS_COLUMN = "cross_enrollment_status";

const foreignKeysOn = async (queryInterface, table, column) => {
  const [rows] = await queryInterface.sequelize.query(
    `SELECT CONSTRAINT_NAME AS name
       FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?
        AND REFERENCED_TABLE_NAME IS NOT NULL`,
    { replacements: [table, column] },
  );
  return rows.map((row) => row.name);
};

const dropForeignKeysOn = async (queryInterface, table, column) => {
  for (const name of await foreignKeysOn(queryInterface, table, column)) {
    await queryInterface.sequelize.query(
      `ALTER TABLE \`${table}\` DROP FOREIGN KEY \`${name}\``,
    );
  }
};

/** Salin sepasang kolom audit (`*_by` dan `*_at`) bila keduanya tersedia. */
const copyAuditColumns = async (queryInterface, from, to) => {
  const columns = await queryInterface.describeTable("krs_detil");
  if (!columns[from.by] || !columns[to.by]) return;
  const auditAt =
    columns[from.at] && columns[to.at]
      ? `, \`${to.at}\` = COALESCE(\`${to.at}\`, \`${from.at}\`)`
      : "";
  await queryInterface.sequelize.query(
    `UPDATE krs_detil SET \`${to.by}\` = \`${from.by}\`${auditAt} WHERE \`${from.by}\` IS NOT NULL`,
  );
};

/**
 * MySQL strict mode menolak ALTER ENUM selama masih ada nilai di luar daftar
 * baru, jadi nilai dinormalisasi lebih dulu lalu enum dipersempit bertahap.
 */
const remapStatusColumn = async (
  queryInterface,
  { superset, final, mapping },
) => {
  const columns = await queryInterface.describeTable("krs_detil");
  if (!columns[STATUS_COLUMN]) return;

  await queryInterface.sequelize.query(
    `UPDATE krs_detil SET \`${STATUS_COLUMN}\` = NULL WHERE \`${STATUS_COLUMN}\` = ''`,
  );
  await queryInterface.changeColumn("krs_detil", STATUS_COLUMN, {
    type: DataTypes.ENUM(...superset),
    allowNull: true,
  });
  for (const [from, to] of mapping) {
    if (to === null) {
      await queryInterface.sequelize.query(
        `UPDATE krs_detil SET \`${STATUS_COLUMN}\` = NULL WHERE \`${STATUS_COLUMN}\` = ?`,
        { replacements: [from] },
      );
      continue;
    }
    await queryInterface.sequelize.query(
      `UPDATE krs_detil SET \`${STATUS_COLUMN}\` = ? WHERE \`${STATUS_COLUMN}\` = ?`,
      { replacements: [to, from] },
    );
  }
  await queryInterface.changeColumn("krs_detil", STATUS_COLUMN, {
    type: DataTypes.ENUM(...final),
    allowNull: true,
  });
};

const addAuditColumns = async (queryInterface, columns) => {
  if (!columns.pa_approved_by) {
    await queryInterface.addColumn("krs_detil", "pa_approved_by", {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "users", key: "id" },
      onDelete: "SET NULL",
    });
  }
  if (!columns.pa_approved_at) {
    await queryInterface.addColumn("krs_detil", "pa_approved_at", {
      type: DataTypes.DATE,
      allowNull: true,
    });
  }
};

module.exports = {
  async up(queryInterface) {
    const matakuliah = await queryInterface.describeTable("matakuliah");
    if (!matakuliah.has_prasyarat) {
      await queryInterface.addColumn("matakuliah", "has_prasyarat", {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }

    const krsDetil = await queryInterface.describeTable("krs_detil");
    await addAuditColumns(queryInterface, krsDetil);

    if (krsDetil.host_approved_by) {
      await copyAuditColumns(
        queryInterface,
        { by: "host_approved_by", at: "host_approved_at" },
        { by: "pa_approved_by", at: "pa_approved_at" },
      );
      await dropForeignKeysOn(queryInterface, "krs_detil", "host_approved_by");
      await queryInterface.removeColumn("krs_detil", "host_approved_by");
    }
    if (krsDetil.host_approved_at) {
      await queryInterface.removeColumn("krs_detil", "host_approved_at");
    }

    await remapStatusColumn(queryInterface, {
      superset: ENUM_SUPERSET,
      final: ENUM_NEW,
      mapping: [
        ["pending_home", "pending_pa"],
        ["pending_host", "pending_pa"],
        ["rejected_home", "rejected"],
        ["rejected_host", "rejected"],
      ],
    });

    const indexes = await queryInterface.showIndex("krs_detil");
    if (!indexes.some((index) => index.name === QUOTA_INDEX)) {
      await queryInterface.addIndex("krs_detil", [STATUS_COLUMN, "kelas_id"], {
        name: QUOTA_INDEX,
      });
    }
  },

  async down(queryInterface) {
    const indexes = await queryInterface.showIndex("krs_detil");
    if (indexes.some((index) => index.name === QUOTA_INDEX)) {
      await queryInterface.removeIndex("krs_detil", QUOTA_INDEX);
    }

    await remapStatusColumn(queryInterface, {
      superset: ENUM_SUPERSET,
      final: ENUM_OLD,
      mapping: [
        ["pending_pa", "pending_host"],
        ["rejected", "rejected_host"],
      ],
    });

    const krsDetil = await queryInterface.describeTable("krs_detil");
    if (!krsDetil.host_approved_by) {
      await queryInterface.addColumn("krs_detil", "host_approved_by", {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
        onDelete: "SET NULL",
      });
    }
    if (!krsDetil.host_approved_at) {
      await queryInterface.addColumn("krs_detil", "host_approved_at", {
        type: DataTypes.DATE,
        allowNull: true,
      });
    }
    if (krsDetil.pa_approved_by) {
      await copyAuditColumns(
        queryInterface,
        { by: "pa_approved_by", at: "pa_approved_at" },
        { by: "host_approved_by", at: "host_approved_at" },
      );
      await dropForeignKeysOn(queryInterface, "krs_detil", "pa_approved_by");
      await queryInterface.removeColumn("krs_detil", "pa_approved_by");
    }
    if (krsDetil.pa_approved_at) {
      await queryInterface.removeColumn("krs_detil", "pa_approved_at");
    }

    const matakuliah = await queryInterface.describeTable("matakuliah");
    if (matakuliah.has_prasyarat) {
      await queryInterface.removeColumn("matakuliah", "has_prasyarat");
    }
  },
};
