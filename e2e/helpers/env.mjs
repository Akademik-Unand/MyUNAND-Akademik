import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const E2E_DIR = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(E2E_DIR, "..");

const DEFAULT_DB = {
  DB_HOST: "127.0.0.1",
  DB_PORT: "3306",
  DB_NAME: "myunand_kurikulum_new",
  DB_USER: "root",
  DB_PASS: "",
};

/** Baca backend/.env lalu isi nilai yang belum ada di process.env. */
export function loadBackendEnv() {
  const envPath = path.join(ROOT, "backend", ".env");
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
      if (!match) continue;
      const key = match[1];
      const value = match[2].replace(/^["']|["']$/g, "");
      if (process.env[key] === undefined) process.env[key] = value;
    }
  }
  for (const key of Object.keys(DEFAULT_DB)) {
    if (!process.env[key]) process.env[key] = DEFAULT_DB[key];
  }
}

export function dbConfig() {
  return {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  };
}