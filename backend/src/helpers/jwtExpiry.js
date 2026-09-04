'use strict';

const UNIT_MS = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

const durationToMs = (value, fallbackMs) => {
  const match = String(value || '').trim().match(/^(\d+)\s*([smhd])$/i);
  if (!match) return fallbackMs;
  return Number(match[1]) * UNIT_MS[match[2].toLowerCase()];
};

const expiresAtFrom = (value, fallbackMs) =>
  new Date(Date.now() + durationToMs(value, fallbackMs));

module.exports = { durationToMs, expiresAtFrom };
