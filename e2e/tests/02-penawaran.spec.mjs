import { expect, test } from "@playwright/test";
import { login } from "../helpers/login.mjs";
import { ADMIN_PRODI_PETNAK, PROBE_MK_KODE, URLS } from "../helpers/data.mjs";

test.describe("Penawaran MK Semester", () => {
  test("admin prodi membuka mata kuliah baru dan melihat prasyarat publish", async ({
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

    const crossEnrollment = page.getByLabel("Buka juga untuk mahasiswa prodi lain");
    await expect(crossEnrollment).toBeChecked();
    await crossEnrollment.uncheck();
    await expect(pickCard.getByText("Kuota Lintas Awal")).toHaveCount(0);
    await crossEnrollment.check();
    await expect(pickCard.getByText("Lintas Awal")).toBeVisible();

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

    const openedSearch = openedCard.getByPlaceholder(
      "Cari mata kuliah yang dibuka...",
    );
    await openedSearch.fill(PROBE_MK_KODE);
    const probeRow = openedCard
      .locator("tbody tr")
      .filter({ has: page.getByRole("cell", { name: PROBE_MK_KODE, exact: true }) });

    await expect(probeRow).toBeVisible();
    await expect(probeRow.getByText("draft")).toBeVisible();
    const publish = openedCard.getByRole("button", { name: "Publikasikan" });
    await expect(publish).toBeDisabled();
    await expect(openedCard.getByText(/kelas belum tersedia/i)).toBeVisible();

    await page.reload();
    const persistedRow = openedCard
      .locator("tbody tr")
      .filter({ has: page.getByRole("cell", { name: PROBE_MK_KODE, exact: true }) });
    await expect(persistedRow.getByText("draft")).toBeVisible();

    await persistedRow.getByRole("link", { name: /Detail/ }).click();
    await expect(page.getByRole("heading", { name: "Kesiapan Pembukaan KRS" })).toBeVisible();
    const addClass = page.getByRole("link", { name: /Tambah kelas/ }).first();
    await expect(addClass).toBeVisible();
    await addClass.click();

    const classDialog = page.getByRole("dialog");
    await expect(classDialog.getByRole("heading", { name: "Tambah Kelas" })).toBeVisible();
    await expect(
      classDialog.getByRole("group", { name: "Mata Kuliah (dari penawaran) *" }).getByRole("button"),
    ).not.toHaveText("Pilih mata kuliah");
    await classDialog.getByPlaceholder("mis. A, B, C").fill(`E${Date.now().toString().slice(-5)}`);
    await classDialog.getByRole("button", { name: "Simpan" }).click();

    await expect(page).toHaveURL(/\/perkuliahan\/kelas\/[^?]+\?hub=jadwal/);
    await expect(page.getByRole("heading", { name: "Kelola Kelas" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Dosen Pengampu" })).toBeVisible();
  });
});
