'use strict';

const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.addColumn('krs_detil', 'is_cross_enrollment', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('krs_detil', 'cross_enrollment_status', {
      type: DataTypes.ENUM('pending_host', 'approved', 'rejected_host', 'cancelled'),
      allowNull: true,
    });
    await queryInterface.addColumn('krs_detil', 'host_approved_by', {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onDelete: 'SET NULL',
    });
    await queryInterface.addColumn('krs_detil', 'host_approved_at', {
      type: DataTypes.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('krs_detil', 'rejected_by', {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onDelete: 'SET NULL',
    });
    await queryInterface.addColumn('krs_detil', 'rejected_at', {
      type: DataTypes.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('krs_detil', 'rejection_reason', {
      type: DataTypes.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('krs_detil', 'cancelled_at', {
      type: DataTypes.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    const columns = [
      'cancelled_at', 'rejection_reason', 'rejected_at', 'rejected_by',
      'host_approved_at', 'host_approved_by', 'cross_enrollment_status',
      'is_cross_enrollment',
    ];
    for (const column of columns) await queryInterface.removeColumn('krs_detil', column);
  },
};
