'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('activity_logs', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      user_id: { type: Sequelize.UUID, allowNull: true },
      user_email: { type: Sequelize.STRING(255), allowNull: true },
      user_name: { type: Sequelize.STRING(255), allowNull: true },
      action: { type: Sequelize.STRING(50), allowNull: false },
      subject: { type: Sequelize.STRING(80), allowNull: true },
      resource_id: { type: Sequelize.STRING(64), allowNull: true },
      method: { type: Sequelize.STRING(10), allowNull: false },
      path: { type: Sequelize.STRING(255), allowNull: false },
      status_code: { type: Sequelize.INTEGER, allowNull: false },
      ip: { type: Sequelize.STRING(64), allowNull: true },
      user_agent: { type: Sequelize.STRING(512), allowNull: true },
      summary: { type: Sequelize.STRING(255), allowNull: true },
      payload: { type: Sequelize.JSON, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('activity_logs', ['createdAt'], { name: 'idx_activity_logs_created_at' });
    await queryInterface.addIndex('activity_logs', ['user_email'], { name: 'idx_activity_logs_user_email' });
    await queryInterface.addIndex('activity_logs', ['action'], { name: 'idx_activity_logs_action' });
    await queryInterface.addIndex('activity_logs', ['subject'], { name: 'idx_activity_logs_subject' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('activity_logs');
  },
};
