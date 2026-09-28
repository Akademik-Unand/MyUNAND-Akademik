// Data dan respons hanya untuk pengujian UI, tidak dipasang pada aplikasi.
export const prepareCalendar = async (page, { empty = false, approved = false } = {}) => {
  const prodi = { id: "prodi-own", nama_singkat: "S1 Teknik Pertanian dan Biosistem", kode_prodi: "TPB" };
  const semester = { id: "semester-active", tahun: 2026, jenisSemester: { nama: "Ganjil" } };
  const mahasiswa = { id: "student", program_studi_id: prodi.id, programStudi: prodi, angkatan: 2025 };
  const user = { id: "user", name: "Mahasiswa Kalender", email: "kalender@example.test",
    role: "mahasiswa", mahasiswa_id: mahasiswa.id, mahasiswa,
    permissions: ["krs.create", "krs.read", "krs-detil.create", "krs-detil.delete"],
  };
  const session = (id, hari, start, end) => ({
    id, hari, jam_mulai: start + ":00", jam_selesai: end + ":00",
    ruang: { kode: "R1", nama: "Ruang Kuliah 1" },
  });
  const makeClass = (id, nama, mk, jadwalKelas) => ({
    id, nama, matakuliah: mk, jadwalKelas, semester_id: semester.id,
    dosenKelas: [{ id: "lecturer", dosen: { nama: "Dosen Pengampu" } }],
  });
  const mk = (kode, nama) => ({ id: kode, kode_matakuliah: kode, nama_resmi: nama, jumlah_sks_kurikulum: 3 });
  const existing = makeClass("00000000-0000-4000-a000-000000000001", "A", mk("PTN1001", "Dasar Pertanian"),
    [session("s1", "Senin", "08:00", "09:40")]);
  const pending = makeClass("00000000-0000-4000-a000-000000000002", "A", mk("LNT1001", "Ekologi Lintas Prodi"),
    [session("s2", "Selasa", "08:00", "09:40")]);
  const candidateMk = mk("PTN1201", "Statistik Pertanian");
  const conflict = makeClass("00000000-0000-4000-a000-000000000003", "A", candidateMk,
    [session("s3", "Senin", "09:00", "10:40")]);
  const safe = makeClass("00000000-0000-4000-a000-000000000004", "B", candidateMk,
    [session("s4", "Senin", "09:40", "11:20"), session("s5", "Minggu", "10:00", "11:40")]);
  const incomplete = makeClass("00000000-0000-4000-a000-000000000005", "C", candidateMk, []);
  const pendingConflict = makeClass("00000000-0000-4000-a000-000000000006", "D", candidateMk,
    [session("s6", "Selasa", "09:00", "10:40")]);
  const rejected = makeClass("00000000-0000-4000-a000-000000000007", "Z", mk("OLD1001", "Riwayat Ditolak"),
    [session("s7", "Senin", "08:00", "09:40")]);
  const detil = (kelas, extra = {}) => ({
    id: "detail-" + kelas.id, kelas_id: kelas.id, kelas, approved: "0", ...extra,
  });
  const context = {
    mahasiswa, semester, periode: { tanggal_mulai: "2000-01-01", tanggal_selesai: "2100-12-31" },
    krs: {
      id: "krs", mahasiswa_id: mahasiswa.id, semester_id: semester.id, approval_ke: approved ? 1 : 0,
      krsDetil: empty ? [] : [
        detil(existing),
        detil(pending, { is_cross_enrollment: true, cross_enrollment_status: "pending_pa" }),
        detil(rejected, { is_cross_enrollment: true, cross_enrollment_status: "rejected" }),
      ],
    },
  };
  const catalog = [{
    id: "offering", program_studi_id: prodi.id, programStudi: prodi, semester_id: semester.id, semester,
    matakuliahDitawarkan: [{ id: "offering-detail", matakuliah: candidateMk, kelas: [conflict, safe, incomplete, pendingConflict] }],
  }];
  const state = { context, catalog, writes: [], rejectNext: false, contextError: false, reads: 0 };
  await page.addInitScript(({ user }) => {
    localStorage.setItem("myunand_auth", JSON.stringify({ user, token: "ui-test-only" }));
  }, { user });
  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace("/api/v1", "");
    const reply = (data, status = 200, message) => route.fulfill({
      status, contentType: "application/json",
      body: JSON.stringify({ status: status >= 400 ? "error" : "success", data, message }),
    });
    if (request.method() === "GET") {
      if (path === "/auth/me") return reply(user);
      if (path === "/auth/academic-advisor") return reply({ status: "unassigned", advisor: null });
      if (path === "/krs/context") {
        state.reads += 1;
        return state.contextError ? reply(null, 503, "Jadwal tidak tersedia") : reply(context);
      }
      if (path === "/penawaran-matakuliah/catalog") return reply(catalog);
      return reply([]);
    }
    state.writes.push({ path, method: request.method() });
    if (path === "/krs-detil" && request.method() === "POST") {
      if (state.rejectNext) {
        safe.jadwalKelas[0].jam_mulai = "09:00:00";
        state.rejectNext = false;
        return reply(null, 409, "Jadwal bentrok dengan PTN1001 setelah perubahan jadwal");
      }
      const kelas = catalog[0].matakuliahDitawarkan[0].kelas.find((item) => item.id === request.postDataJSON().kelas_id);
      const item = detil(kelas);
      context.krs.krsDetil.push(item);
      return reply(item, 201);
    }
    if (path.startsWith("/krs-detil/") && request.method() === "DELETE") {
      const id = path.split("/").at(-1);
      context.krs.krsDetil = context.krs.krsDetil.filter((item) => item.id !== id);
      return reply({ id });
    }
    return reply(null, 400, "Request tidak diharapkan pada UI test");
  });
  await page.goto("/krs/pengambilan");
  await page.getByRole("heading", { name: /^Pilih Mata Kuliah/ }).waitFor();
  return state;
};

export const pickRow = (page) => page.locator("tbody tr").filter({ hasText: "PTN1201" }).first();
export const chooseClass = async (page, name) => {
  await pickRow(page).getByRole("button", { name: /^(Pilih kelas|Kelas [A-D])/ }).click();
  await page.getByRole("listbox").getByRole("button", { name: new RegExp("^Kelas " + name + " ") }).click();
};
export const previewClass = async (page, name) => {
  await chooseClass(page, name);
  await pickRow(page).getByRole("button", { name: "Pratinjau jadwal" }).click();
};