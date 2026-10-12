"use strict";
const path = require("path");
const seconds = Number(process.env.PENJADWALAN_MAX_SECONDS);
const poll = Number(process.env.PENJADWALAN_POLL_MS);
module.exports = {
  python: process.env.PENJADWALAN_PYTHON || "python",
  solverPath: path.resolve(__dirname, "../../solver/solve.py"),
  pollMs: Number.isFinite(poll) && poll >= 250 ? poll : 2000,
  maxSeconds:
    Number.isFinite(seconds) && seconds >= 1 ? Math.min(1800, seconds) : 300,
};
