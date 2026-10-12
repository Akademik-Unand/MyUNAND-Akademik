"use strict";
require("dotenv").config();
const { tick } = require("../src/services/penjadwalan/worker.service");
const { pollMs } = require("../src/config/penjadwalan");
const logger = require("../src/utils/logger");
const db = require("../src/models");
let stopping = false;
process.on("SIGINT", () => {
  stopping = true;
});
process.on("SIGTERM", () => {
  stopping = true;
});
(async () => {
  logger.info("Worker penjadwalan dimulai");
  while (!stopping) {
    try {
      await tick();
    } catch (err) {
      logger.error({ err }, "Antrean penjadwalan gagal");
    }
    if (!stopping) await new Promise((resolve) => setTimeout(resolve, pollMs));
  }
  await db.sequelize.close();
})().catch((err) => {
  logger.error({ err }, "Worker terhenti");
  process.exitCode = 1;
});
