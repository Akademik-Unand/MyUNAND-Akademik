import { createPool } from "./helpers/db.mjs";
import { resetSandbox } from "./helpers/sandbox.mjs";
import { PRODI, PROBE_MK_KODE, E2E_MAHASISWA } from "./helpers/data.mjs";

export default async function globalSetup() {
  const conn = createPool();
  try {
    const { ctx } = await resetSandbox(conn);
    console.log(
      [
        "Global setup selesai:",
        `- semester aktif : ${ctx.semester.jenis} ${ctx.semester.tahun}`,
        `- prodi sandbox  : ${PRODI.kode}`,
        `- penawaran draft dengan semua MK genap minus ${PROBE_MK_KODE}`,
        `- akun mahasiswa : ${E2E_MAHASISWA.email}`,
        `- periode KRS terbuka, kelas probe siap di semester aktif`,
      ].join("\n"),
    );
  } catch (error) {
    console.error("[global-setup] Gagal menyiapkan sandbox:", error.message);
    process.exit(1);
  } finally {
    await conn.end();
  }
}