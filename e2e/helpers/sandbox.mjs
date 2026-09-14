import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { query, queryOne } from "./db.mjs";
import {
  PRODI,
  PROBE_MK_KODE,
  E2E_MAHASISWA,
  DOSEN_PTN_NIP,
} from "./data.mjs";

const localToday = () => new Date().toLocaleDateString("sv-SE");
const plusDays = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("sv-SE");
};
const now = () => new Date();

/** Konteks sandbox: semester aktif, prodi Peternakan, jenis Genap. */
export async function getSandboxContext(conn) {
  const semester = await queryOne(
    conn,
    `SELECT s.id, s.tahun, s.tanggal_mulai, s.tanggal_selesai, js.nama AS jenis
     FROM semester s
     JOIN jenis_semester js ON js.id = s.jenis_semester_id
     WHERE s.is_aktif = 1 AND s.deletedAt IS NULL
     ORDER BY s.tahun DESC LIMIT 1`,
  );
  if (!semester)
    throw new Error(
      "Tidak ada semester aktif di database. Jalankan migrasi + seeder backend dulu (npm run db:migrate && npm run db:seed).",
    );

  const prodi = await queryOne(
    conn,
    "SELECT id FROM program_studi WHERE kode_prodi = ? AND deletedAt IS NULL",
    [PRODI.kode],
  );
  if (!prodi)
    throw new Error(
      `Program studi ${PRODI.kode} tidak ditemukan. Jalankan seeder backend (obeDummyCatalog).`,
    );

  const genap = await queryOne(
    conn,
    "SELECT id FROM jenis_semester WHERE LOWER(nama) = 'genap'",
  );
  if (!genap)
    throw new Error("Jenis semester Genap tidak ditemukan di database.");

  const dosen = await queryOne(
    conn,
    "SELECT id FROM dosen WHERE nip = ? AND deletedAt IS NULL",
    [DOSEN_PTN_NIP],
  );

  const tahunAkademik = /genap/i.test(semester.jenis)
    ? `${semester.tahun - 1}/${semester.tahun}`
    : `${semester.tahun}/${semester.tahun + 1}`;

  return {
    semester,
    semesterId: semester.id,
    prodi,
    prodiId: prodi.id,
    genapId: genap.id,
    dosen,
    tahunAkademik,
  };
}

/** MK genap prodi Peternakan (kandidat yang boleh dibuka di penawaran). */
export async function genapMataKuliahIds(conn, { prodiId, genapId }) {
  return query(
    conn,
    `SELECT id, kode_matakuliah FROM matakuliah
     WHERE program_studi_id = ? AND jenis_semester_id = ? AND deletedAt IS NULL`,
    [prodiId, genapId],
  );
}

/** Hapus semua penawaran (termasuk yang soft-deleted) untuk (prodi, semester). */
async function destroyOfferings(conn, { prodiId, semesterId }) {
  const pms = await query(
    conn,
    "SELECT id FROM penawaran_matakuliah WHERE program_studi_id = ? AND semester_id = ?",
    [prodiId, semesterId],
  );
  const pmIds = pms.map((row) => row.id);
  if (!pmIds.length) return;

  await query(
    conn,
    `UPDATE kelas SET penawaran_matakuliah_id = NULL
     WHERE penawaran_matakuliah_id IN (
       SELECT id FROM penawaran_matakuliah_detil
       WHERE penawaran_matakuliah_id IN (
         SELECT id FROM penawaran_matakuliah WHERE program_studi_id = ? AND semester_id = ?
       )
     )`,
    [prodiId, semesterId],
  );
  await query(
    conn,
    "DELETE FROM penawaran_matakuliah_prodi WHERE penawaran_matakuliah_id IN (?)",
    [pmIds],
  );
  await query(
    conn,
    "DELETE FROM penawaran_matakuliah_detil WHERE penawaran_matakuliah_id IN (?)",
    [pmIds],
  );
  await query(conn, "DELETE FROM penawaran_matakuliah WHERE id IN (?)", [
    pmIds,
  ]);
}

async function createOfferingRow(
  conn,
  { prodiId, semesterId, semester, status = "draft" },
) {
  const id = randomUUID();
  await query(
    conn,
    `INSERT INTO penawaran_matakuliah
       (id, semester_id, program_studi_id, status, akses, tanggal_mulai,
        tanggal_selesai, kuota_lintas_prodi_default, minimal_semester_default,
        maksimal_semester_default, published_at, closed_at, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, 'semua', ?, ?, 0, NULL, NULL, NULL, NULL, ?, ?)`,
    [
      id,
      semesterId,
      prodiId,
      status,
      semester.tanggal_mulai || null,
      semester.tanggal_selesai || null,
      now(),
      now(),
    ],
  );
  return id;
}

function detilRow(penawaranId, mkId) {
  return [
    randomUUID(),
    penawaranId,
    mkId,
    0,
    null,
    null,
    now(),
    now(),
  ];
}

function batchInsertDetil(conn, rows) {
  return query(
    conn,
    `INSERT INTO penawaran_matakuliah_detil
       (id, penawaran_matakuliah_id, matakuliah_id, kuota_lintas_prodi,
        minimal_semester, maksimal_semester, createdAt, updatedAt)
     VALUES ?`,
    [rows],
  );
}

/** Cari/buat kelas "A" untuk MK probe di semester aktif. */
export async function ensureProbeKelas(conn, { semesterId, prodiId }, mkId) {
  let kelas = await queryOne(
    conn,
    "SELECT id FROM kelas WHERE semester_id = ? AND program_studi_id = ? AND matakuliah_id = ? AND nama = 'A' AND deletedAt IS NULL",
    [semesterId, prodiId, mkId],
  );
  if (!kelas) {
    const id = randomUUID();
    await query(
      conn,
      `INSERT INTO kelas
         (id, semester_id, program_studi_id, matakuliah_id,
          penawaran_matakuliah_id, nama, jumlah_peserta_min, jumlah_peserta_max,
          createdAt, updatedAt, deletedAt)
       VALUES (?, ?, ?, ?, NULL, 'A', 10, 40, ?, ?, NULL)`,
      [id, semesterId, prodiId, mkId, now(), now()],
    );
    kelas = { id };
  }
  return kelas;
}

async function upsertKrsPeriod(conn, { semesterId }) {
  const existing = await queryOne(
    conn,
    "SELECT id FROM periode WHERE semester_id = ? AND jenis = 'krs'",
    [semesterId],
  );
  if (existing) {
    await query(
      conn,
      "UPDATE periode SET tanggal_mulai = ?, tanggal_selesai = ?, updatedAt = ? WHERE id = ?",
      [localToday(), plusDays(30), now(), existing.id],
    );
    return existing.id;
  }
  const id = randomUUID();
  await query(
    conn,
    `INSERT INTO periode
       (id, semester_id, jenis, tanggal_mulai, tanggal_selesai, createdAt, updatedAt)
     VALUES (?, ?, 'krs', ?, ?, ?, ?)`,
    [id, semesterId, localToday(), plusDays(30), now(), now()],
  );
  return id;
}

async function roleIdByName(conn, name) {
  const role = await queryOne(conn, "SELECT id FROM roles WHERE name = ? LIMIT 1", [
    name,
  ]);
  if (!role) throw new Error(`Role '${name}' tidak ditemukan di database.`);
  return role.id;
}

async function upsertMahasiswa(conn, { prodiId }) {
  const { niu, name, angkatan } = E2E_MAHASISWA;
  const row = await queryOne(
    conn,
    "SELECT id FROM mahasiswa WHERE niu = ? LIMIT 1",
    [niu],
  );
  if (row) {
    await query(
      conn,
      `UPDATE mahasiswa SET nama = ?, angkatan = ?, program_studi_id = ?,
        updatedAt = ?, deletedAt = NULL WHERE id = ?`,
      [name, angkatan, prodiId, now(), row.id],
    );
    return row.id;
  }
  const id = randomUUID();
  await query(
    conn,
    `INSERT INTO mahasiswa
       (id, niu, nama, angkatan, program_studi_id, jenis_kelamin, createdAt, updatedAt, deletedAt)
     VALUES (?, ?, ?, ?, ?, 'L', ?, ?, NULL)`,
    [id, niu, name, angkatan, prodiId, now(), now()],
  );
  return id;
}

async function upsertUser(conn, mahasiswaId) {
  const { email, password, name } = E2E_MAHASISWA;
  const passHash = await bcrypt.hash(password, 10);
  const row = await queryOne(
    conn,
    "SELECT id FROM users WHERE email = ? LIMIT 1",
    [email],
  );
  if (row) {
    await query(
      conn,
      `UPDATE users SET name = ?, password = ?, role = 'mahasiswa',
        mahasiswa_id = ?, email_verified_at = ?, updatedAt = ?, deletedAt = NULL
       WHERE id = ?`,
      [name, passHash, mahasiswaId, now(), now(), row.id],
    );
    return row.id;
  }
  const id = randomUUID();
  await query(
    conn,
    `INSERT INTO users (id, name, email, email_verified_at, password, role,
       dosen_id, mahasiswa_id, remember_token, createdAt, updatedAt, deletedAt)
     VALUES (?, ?, ?, ?, ?, 'mahasiswa', NULL, ?, NULL, ?, ?, NULL)`,
    [id, name, email, now(), passHash, mahasiswaId, now(), now()],
  );
  return id;
}

export async function purgeStudentData(conn, mahasiswaId) {
  await query(
    conn,
    "DELETE kd FROM krs_detil kd INNER JOIN krs k ON k.id = kd.krs_id WHERE k.mahasiswa_id = ?",
    [mahasiswaId],
  );
  await query(conn, "DELETE FROM krs WHERE mahasiswa_id = ?", [mahasiswaId]);
  await query(conn, "DELETE FROM bimbingan_akademik WHERE mahasiswa_id = ?", [
    mahasiswaId,
  ]);
}

async function ensurePa(conn, mahasiswaId, { ctx }) {
  if (!ctx.dosen)
    throw new Error(
      `Dosen PA sandbox (nip ${DOSEN_PTN_NIP}) tidak ditemukan. Jalankan seeder peternakan dulu.`,
    );
  await query(
    conn,
    `INSERT INTO bimbingan_akademik
       (id, dosen_id, mahasiswa_id, tahun_akademik, status, catatan, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, 'aktif', 'E2E', ?, ?)`,
    [randomUUID(), ctx.dosen.id, mahasiswaId, ctx.tahunAkademik, now(), now()],
  );
}

/**
 * Reset penuh scope sandbox agar alur UI penawaran selalu mulai dari keadaan
 * yang sama: penawaran draft berisi semua MK genap KECUALI MK probe, kelas
 * probe siap di semester aktif, periode KRS terbuka, dan akun mahasiswa uji
 * bersih dari KRS lama.
 */
export async function resetSandbox(conn) {
  const ctx = await getSandboxContext(conn);
  await destroyOfferings(conn, {
    prodiId: ctx.prodiId,
    semesterId: ctx.semesterId,
  });

  const penawaranId = await createOfferingRow(conn, ctx);
  const mks = await genapMataKuliahIds(conn, ctx);
  const probeMk = await queryOne(
    conn,
    "SELECT id FROM matakuliah WHERE kode_matakuliah = ? AND deletedAt IS NULL",
    [PROBE_MK_KODE],
  );
  if (!probeMk)
    throw new Error(`MK probe ${PROBE_MK_KODE} tidak ditemukan di database.`);

  const detilRows = mks
    .filter((mk) => mk.id !== probeMk.id)
    .map((mk) => detilRow(penawaranId, mk.id));
  if (detilRows.length) await batchInsertDetil(conn, detilRows);

  await ensureProbeKelas(conn, ctx, probeMk.id);
  await upsertKrsPeriod(conn, ctx);

  const mahasiswaId = await upsertMahasiswa(conn, ctx);
  const userId = await upsertUser(conn, mahasiswaId);
  await purgeStudentData(conn, mahasiswaId);
  await query(conn, "DELETE FROM user_roles WHERE user_id = ?", [userId]);
  await query(
    conn,
    "INSERT INTO user_roles (id, user_id, role_id, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)",
    [randomUUID(), userId, await roleIdByName(conn, "mahasiswa"), now(), now()],
  );
  await ensurePa(conn, mahasiswaId, { ctx });

  return { ctx, penawaranId, userId, mahasiswaId, probeMkId: probeMk.id };
}

/**
 * Jaminan idempotent untuk konsumen KRS: penawaran (semester aktif, prodi
 * sandbox) berstatus published dan memuat MK probe, kelas probe ter-link ke
 * detilnya. Dipakai krs.spec supaya bisa jalan mandiri tanpa menunggu
 * penawaran.spec.
 */
export async function ensurePublishedProbeOffering(conn) {
  const ctx = await getSandboxContext(conn);
  const probeMk = await queryOne(
    conn,
    "SELECT id FROM matakuliah WHERE kode_matakuliah = ? AND deletedAt IS NULL",
    [PROBE_MK_KODE],
  );
  if (!probeMk)
    throw new Error(`MK probe ${PROBE_MK_KODE} tidak ditemukan di database.`);

  let penawaran = await queryOne(
    conn,
    `SELECT id, status FROM penawaran_matakuliah
     WHERE semester_id = ? AND program_studi_id = ?
     ORDER BY (status = 'published') DESC, createdAt DESC LIMIT 1`,
    [ctx.semesterId, ctx.prodiId],
  );

  if (!penawaran) {
    const id = await createOfferingRow(conn, ctx);
    await batchInsertDetil(conn, [detilRow(id, probeMk.id)]);
    await query(
      conn,
      "UPDATE penawaran_matakuliah SET status = 'published', published_at = ? WHERE id = ?",
      [now(), id],
    );
    penawaran = { id, status: "published" };
  } else if (penawaran.status !== "published") {
    const [detil] = await query(
      conn,
      "SELECT id FROM penawaran_matakuliah_detil WHERE penawaran_matakuliah_id = ? AND matakuliah_id = ?",
      [penawaran.id, probeMk.id],
    );
    if (!detil) {
      await query(
        conn,
        `INSERT INTO penawaran_matakuliah_detil
           (id, penawaran_matakuliah_id, matakuliah_id, kuota_lintas_prodi,
            minimal_semester, maksimal_semester, createdAt, updatedAt)
         VALUES (?, ?, ?, 0, NULL, NULL, ?, ?)`,
        [randomUUID(), penawaran.id, probeMk.id, now(), now()],
      );
    }
    await query(
      conn,
      "UPDATE penawaran_matakuliah SET status = 'published', published_at = ? WHERE id = ?",
      [now(), penawaran.id],
    );
  }

  const [detil] = await query(
    conn,
    "SELECT id FROM penawaran_matakuliah_detil WHERE penawaran_matakuliah_id = ? AND matakuliah_id = ?",
    [penawaran.id, probeMk.id],
  );
  if (!detil)
    throw new Error(
      "MK probe belum ada di penawaran sandbox meskipun sudah dipastikan published.",
    );

  const kelas = await ensureProbeKelas(conn, ctx, probeMk.id);
  await query(
    conn,
    "UPDATE kelas SET penawaran_matakuliah_id = ? WHERE id = ?",
    [detil.id, kelas.id],
  );

  return { ctx, penawaran, detil, kelas };
}