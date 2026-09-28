import { expect, test } from "@playwright/test";
import { prepareCalendar, pickRow, chooseClass, previewClass } from "./krs-calendar.fixture.mjs";

test("pratinjau UUID menandai dua sesi, menolak bentrok, dan tidak menulis KRS", async ({ page }, testInfo) => {
  const state = await prepareCalendar(page);
  await previewClass(page, "A");
  const calendar = page.getByRole("region", { name: "Kalender mingguan KRS", exact: true });
  await expect(calendar).toBeVisible();
  await expect(page.getByText("1 pasangan sesi bentrok")).toBeVisible();
  await expect(calendar.getByRole("button", { name: /Bentrok/ })).toHaveCount(2);
  await expect(page.getByRole("status").filter({ hasText: "pasangan sesi" })).toContainText("09:00–09:40");
  await expect(pickRow(page).getByRole("button", { name: "Ambil", exact: true })).toBeDisabled();
  await expect(pickRow(page)).toContainText("Bentrok dengan PTN1001");
  await expect(calendar).not.toContainText("OLD1001");

  const blocks = await calendar.getByRole("button", { name: /Bentrok/ }).evaluateAll((els) =>
    els.map((el) => { const r = el.getBoundingClientRect(); return { left: r.left, right: r.right }; }));
  expect(blocks[0].right).toBeLessThanOrEqual(blocks[1].left);

  await calendar.getByRole("button", { name: /PTN1201/ }).click();
  await expect(page.getByRole("dialog")).toContainText("Ruang Kuliah 1");
  await expect(page.getByRole("dialog")).toContainText("Pratinjau — belum masuk KRS");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("region", { name: "Jadwal KRS mahasiswa" }).screenshot({ path: testInfo.outputPath("kalender-desktop.png") });
  expect(state.writes).toEqual([]);
  await page.getByRole("button", { name: "Batalkan pratinjau" }).click();
  await expect(calendar.getByRole("button", { name: /PTN1201/ })).toHaveCount(0);
  await expect(page.getByText("Tidak ada bentrok pada jadwal yang ditampilkan.")).toBeVisible();
});

test("jadwal bersambung dan multi-sesi ditambah serta dihapus tanpa reload halaman", async ({ page }) => {
  const state = await prepareCalendar(page);
  await previewClass(page, "B");
  const calendar = page.getByRole("region", { name: "Kalender mingguan KRS", exact: true });
  await expect(calendar.getByRole("button", { name: /PTN1201/ })).toHaveCount(2);
  await expect(calendar.getByRole("button", { name: /PTN1201.*Minggu/ })).toBeVisible();
  await expect(pickRow(page).getByRole("button", { name: "Ambil", exact: true })).toBeEnabled();
  await pickRow(page).getByRole("button", { name: "Ambil", exact: true }).click();
  await expect(page.getByText("Mata kuliah ditambahkan ke KRS.")).toBeVisible();
  await expect(calendar.getByRole("button", { name: /Pratinjau/ })).toHaveCount(0);
  await expect(calendar.getByRole("button", { name: /PTN1201/ })).toHaveCount(2);

  await page.getByRole("button", { name: "Daftar KRS", exact: true }).click();
  const taken = page.locator(".card").filter({ has: page.getByRole("heading", { name: "Mata Kuliah di KRS Anda" }) });
  await taken.locator("tbody tr").filter({ hasText: "PTN1201" }).getByRole("button", { name: "Hapus" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Hapus", exact: true }).click();
  await expect(page.getByText("Mata kuliah dihapus dari KRS.")).toBeVisible();
  await page.getByRole("button", { name: "Kalender Mingguan", exact: true }).click();
  await expect(calendar.getByRole("button", { name: /PTN1201/ })).toHaveCount(0);
  expect(state.writes.map((item) => item.method)).toEqual(["POST", "DELETE"]);
});

test("pengajuan lintas pending ikut bentrok dan jadwal kosong tidak dianggap aman", async ({ page }) => {
  await prepareCalendar(page);
  await previewClass(page, "D");
  await expect(page.getByRole("status").filter({ hasText: "pasangan sesi" })).toContainText("LNT1001");
  await expect(pickRow(page).getByRole("button", { name: "Ambil", exact: true })).toBeDisabled();
  // Mengganti pilihan pada MK yang sama juga memperbarui pratinjau.
  await chooseClass(page, "C");
  await expect(page.getByText("Jadwal belum dapat diperiksa sepenuhnya")).toBeVisible();
  await expect(page.getByText("Tidak ada bentrok pada jadwal yang ditampilkan.")).toHaveCount(0);
  await expect(pickRow(page).getByRole("button", { name: "Ambil", exact: true })).toBeDisabled();
});

test("penolakan server menyegarkan pratinjau dan tidak memasukkan kelas yang berubah jadwal", async ({ page }) => {
  const state = await prepareCalendar(page);
  await previewClass(page, "B");
  state.rejectNext = true;
  await pickRow(page).getByRole("button", { name: "Ambil", exact: true }).click();
  await expect(page.getByText("Jadwal bentrok dengan PTN1001 setelah perubahan jadwal")).toBeVisible();
  await expect(page.getByText("1 pasangan sesi bentrok")).toBeVisible();
  await expect(pickRow(page).getByRole("button", { name: "Ambil", exact: true })).toBeDisabled();
  expect(state.context.krs.krsDetil).toHaveLength(3);
});

test("agenda ponsel, mode gelap dan ukuran teks besar tetap terbaca", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await prepareCalendar(page);
  await page.evaluate(() => {
    document.documentElement.style.setProperty("--app-font-size", "22px");
    document.documentElement.setAttribute("data-theme", "myunand-dark");
  });
  await previewClass(page, "A");
  const agenda = page.getByRole("region", { name: "Agenda mingguan KRS", exact: true });
  await expect(agenda).toBeVisible();
  await expect(page.getByRole("region", { name: "Kalender mingguan KRS", exact: true })).not.toBeVisible();
  await expect(agenda.getByRole("button", { name: /Bentrok/ })).toHaveCount(2);
  const panelBounds = await page.getByRole("region", { name: "Jadwal KRS mahasiswa" }).evaluate((el) => ({
    overflow: el.scrollWidth - el.clientWidth,
    right: el.getBoundingClientRect().right,
    viewport: window.innerWidth,
  }));
  expect(panelBounds.overflow).toBeLessThanOrEqual(1);
  expect(panelBounds.right).toBeLessThanOrEqual(panelBounds.viewport);
  await agenda.getByRole("button", { name: /PTN1201/ }).click();
  await expect(page.getByRole("dialog")).toContainText("09:00–09:40");
  await page.getByRole("dialog").getByRole("button", { name: "Tutup", exact: true }).click();
  await page.getByRole("region", { name: "Jadwal KRS mahasiswa" }).screenshot({ path: testInfo.outputPath("kalender-mobile.png") });
});

test("KRS kosong dan KRS disetujui tetap dapat dibaca tanpa membuka hak pengambilan", async ({ page }) => {
  await prepareCalendar(page, { empty: true, approved: true });
  await page.getByRole("button", { name: "Kalender Mingguan", exact: true }).click();
  await expect(page.getByText(/Belum ada jadwal yang dapat ditampilkan/)).toBeVisible();
  await previewClass(page, "B");
  await expect(page.getByRole("region", { name: "Kalender mingguan KRS", exact: true })).toBeVisible();
  await expect(pickRow(page).getByRole("button", { name: "Ambil", exact: true })).toBeDisabled();
});
test("gagal memperbarui jadwal menahan pengambilan sampai pemuatan ulang berhasil", async ({ page }) => {
  const state = await prepareCalendar(page);
  await previewClass(page, "B");
  state.contextError = true;
  await page.getByRole("button", { name: "Muat ulang jadwal" }).click();
  await expect(page.getByText(/Gagal memperbarui jadwal/)).toBeVisible();
  await expect(page.getByText("Tidak ada bentrok pada jadwal yang ditampilkan.")).toHaveCount(0);
  await expect(pickRow(page).getByRole("button", { name: "Ambil", exact: true })).toBeDisabled();
  state.contextError = false;
  await page.getByRole("button", { name: "Muat ulang jadwal" }).click();
  await expect(page.getByText(/Gagal memperbarui jadwal/)).toHaveCount(0);
  await expect(pickRow(page).getByRole("button", { name: "Ambil", exact: true })).toBeEnabled();
  expect(state.writes).toEqual([]);
});

test("tanpa semester aktif tidak terjebak loading katalog atau menampilkan jadwal semester lama", async ({ page }) => {
  const state = await prepareCalendar(page);
  state.context.semester = null;
  state.context.krs = null;
  state.context.periode = null;
  await page.getByRole("button", { name: "Muat ulang jadwal" }).click();
  await expect(page.getByText("Belum ada semester aktif", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Kalender Mingguan", exact: true }).click();
  await expect(page.getByText(/Belum ada jadwal yang dapat ditampilkan/)).toBeVisible();
});
