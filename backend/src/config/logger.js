"use strict";

const env = process.env.NODE_ENV || "development";

// pino-pretty ada di devDependencies, jadi image produksi (`npm ci --omit=dev`)
// tidak punya paket ini. Kalau tetap diminta, pino melempar error saat require
// dan prosesnya mati sebelum boot. Jadi pastikan target-nya memang bisa dipakai.
let pretty = env !== "production";
if (pretty) {
  try {
    require.resolve("pino-pretty");
  } catch {
    pretty = false;
  }
}

module.exports = {
  env,
  level: process.env.LOG_LEVEL || (env === "production" ? "info" : "debug"),
  pretty,
};
