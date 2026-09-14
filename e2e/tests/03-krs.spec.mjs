import { expect, test } from "@playwright/test";
import { createPool } from "../helpers/db.mjs";
import { ensurePublishedProbeOffering } from "../helpers/sandbox.mjs";
import { login } from "../helpers/login.mjs";
import { E2E_MAHASISWA, PROBE_MK_KODE, URLS } from "../helpers/data.mjs";

test.beforeAll(async () => {
  const conn = createPool();
  try {
    await ensurePublishedProbeOffering(conn);
  } finally {
    await conn.end();
  }
});

test.describe("Pengambilan KRS", () => {
  test("mahasiswa mengambil mata kuliah lalu menghapusnya dari KRS", async ({
    page,
  }) => {
    await login(page, E2E_MAHASISWA);
    await page.goto(URLS.krs);

    const pickCard = page
      .locator(".card")
      .filter({ has: page.getByRole("heading", { name: /^Pilih Mata Kuliah/ }) });
    const takenCard = page
      .locator(".card")
      .filter({
        has: page.getByRole("heading", { name: "Mata Kuliah di KRS Anda" }),
      });

    await expect(page.getByText("KRS: Dibuka")).toBeVisible();

    const probeRow = pickCard
      .locator("tbody tr")
      .filter({ hasText: PROBE_MK_KODE });
    await expect(probeRow).toContainText("Statistik Dasar");

    await probeRow.getByRole("button", { name: /Pilih kelas/ }).click();
    await page
      .getByRole("listbox")
      .getByRole("button", { name: /^Kelas A\b/ })
      .click();

    await probeRow.getByRole("button", { name: "Ambil" }).click();
    await expect(
      page.getByText("Mata kuliah ditambahkan ke KRS."),
    ).toBeVisible();

    await expect(probeRow.getByText("Diambil")).toBeVisible();
    await expect(probeRow.getByText("Kelas A")).toBeVisible();

    const takenRow = takenCard
      .locator("tbody tr")
      .filter({ hasText: PROBE_MK_KODE });
    await expect(takenRow).toContainText("Statistik Dasar");
    await expect(takenRow.getByText("Menunggu Dosen PA")).toBeVisible();

    await takenRow.getByRole("button", { name: "Hapus" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toContainText("Hapus Mata Kuliah dari KRS");
    await dialog.getByRole("button", { name: "Hapus" }).click();

    await expect(
      page.getByText("Mata kuliah dihapus dari KRS."),
    ).toBeVisible();
    await expect(
      takenCard.getByText("Belum ada mata kuliah di KRS Anda."),
    ).toBeVisible();
    await expect(probeRow.getByRole("button", { name: "Ambil" })).toBeVisible();
  });
});