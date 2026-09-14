import { expect, test } from "@playwright/test";
import { login } from "../helpers/login.mjs";
import { ADMIN_PRODI_PETNAK, PROBE_MK_KODE, URLS } from "../helpers/data.mjs";

test.describe("Penawaran MK Semester", () => {
  test("admin prodi membuka mata kuliah baru lalu mempublikasikan penawaran", async ({
    page,
  }) => {
    await login(page, ADMIN_PRODI_PETNAK);
    await page.goto(URLS.penawaran);

    const pickCard = page
      .locator(".card")
      .filter({ has: page.getByRole("heading", { name: /^Pilih Mata Kuliah/ }) });
    const openedCard = page
      .locator(".card")
      .filter({
        has: page.getByRole("heading", { name: "Mata Kuliah yang Sudah Dibuka" }),
      });

    const pickerSearch = pickCard.getByPlaceholder(
      "Cari mata kuliah program studi...",
    );
    await pickerSearch.fill(PROBE_MK_KODE);

    const saveButton = page.getByRole("button", {
      name: /Perbarui \d+ Mata Kuliah/,
    });
    await expect(saveButton).toBeEnabled();
    const before = Number((await saveButton.textContent()).match(/\d+/)[0]);

    await page.getByLabel("Pilih Statistik Dasar").check();
    await expect(saveButton).toHaveText(
      new RegExp(`Perbarui ${before + 1} Mata Kuliah`),
    );
    await saveButton.click();

    await expect(
      page.getByText("Daftar mata kuliah penawaran berhasil diperbarui."),
    ).toBeVisible();

    const openedSearch = openedCard.getByPlaceholder(
      "Cari mata kuliah yang dibuka...",
    );
    await openedSearch.fill(PROBE_MK_KODE);
    const probeRow = openedCard
      .locator("tbody tr")
      .filter({ hasText: PROBE_MK_KODE });

    await expect(probeRow.getByText("draft")).toBeVisible();
    await probeRow.getByRole("button", { name: "Publikasikan" }).click();

    await expect(
      page.getByText("Status penawaran diperbarui."),
    ).toBeVisible();
    await expect(probeRow.getByText("published")).toBeVisible();

    await page.reload();
    const persistedRow = openedCard
      .locator("tbody tr")
      .filter({ hasText: PROBE_MK_KODE });
    await expect(persistedRow.getByText("published")).toBeVisible();
  });
});