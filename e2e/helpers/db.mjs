import mysql from "mysql2/promise";
import { loadBackendEnv, dbConfig } from "./env.mjs";

export function createPool() {
  loadBackendEnv();
  return mysql.createPool({
    ...dbConfig(),
    connectionLimit: 1,
    queueLimit: 0,
  });
}

export async function query(conn, sql, params = []) {
  const [rows] = await conn.query(sql, params);
  return rows;
}

export async function queryOne(conn, sql, params = []) {
  const rows = await query(conn, sql, params);
  return rows[0] || null;
}