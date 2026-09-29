import { expect, test } from "@playwright/test";
import { createPool } from "../helpers/db.mjs";
import { ensurePublishedProbeOffering, resetSandbox } from "../helpers/sandbox.mjs";
import { ADMIN_PRODI_PETNAK, DOSEN_PTN_NIP, E2E_MAHASISWA, PROBE_MK_KODE, URLS } from "../helpers/data.mjs";
import { login } from "../helpers/login.mjs";

const dosen = {
  email: `dosen.${DOSEN_PTN_NIP}@demo.myunand.local`,
  password: "12345678",
};

test.beforeEach(async () => {
  const conn = createPool();
  try {
    await resetSandbox(conn);
    await ensurePublishedProbeOffering(conn);
  } finally {
    await conn.end();
  }
});

async function submitProbeKrs(page) {
  await login(page, E2E_MAHASISWA);
  await page.goto(URLS.krs);
  const pickCard = page
    .locator(".card")
    .filter({ has: page.getByRole("heading", { name: /^Pilih Mata Kuliah/ }) });
  await pickCard.getByPlaceholder("Cari mata kuliah...").fill(PROBE_MK_KODE);
  const probeRow = pickCard.locator("tbody tr").filter({ hasText: PROBE_MK_KODE });

  await expect(page.getByText("KRS: Dibuka")).toBeVisible();
  await expect(probeRow).toBeVisible();
  await probeRow.getByRole("button", { name: /Pilih kelas/ }).click();
  await page.getByRole("listbox").getByRole("button", { name: /^Kelas A\b/ }).click();
  await probeRow.getByRole("button", { name: "Ambil" }).click();
  await expect(page.getByText("Mata kuliah ditambahkan ke KRS.")).toBeVisible();
}

async function openAdvisorQueue(page) {
  await login(page, dosen);
  await page.goto("/perkuliahan/persetujuan/krs");
  const row = page.locator("tbody tr").filter({ hasText: E2E_MAHASISWA.niu });
  await expect(row).toBeVisible();
  return row;
}

test.describe("Persetujuan KRS Dosen PA", () => {
  test("admin prodi menelusuri Dosen PA sampai daftar mahasiswa bimbingan", async ({ page }) => {
    await login(page, ADMIN_PRODI_PETNAK);
    await page.goto("/kemahasiswaan/dosen-pa");
    const dosenRow = page.locator("tbody tr").filter({ hasText: DOSEN_PTN_NIP });
    await expect(dosenRow).toBeVisible();
    await dosenRow.getByRole("link", { name: "Lihat Detail" }).click();
    const studentRow = page.locator("tbody tr").filter({ hasText: E2E_MAHASISWA.niu });
    await expect(studentRow).toBeVisible();
    await expect(studentRow).toContainText(E2E_MAHASISWA.name);
  });

  test("menampilkan KRS mahasiswa bimbingan dan menyetujuinya", async ({ page, browser }) => {
    await submitProbeKrs(page);
    const advisorContext = await browser.newContext();
    const advisorPage = await advisorContext.newPage();
    try {
      const row = await openAdvisorQueue(advisorPage);
      await row.getByRole("button", { name: "Setujui" }).click();
      await expect(advisorPage.getByText("KRS berhasil disetujui.")).toBeVisible();
      await expect(row).toContainText("Disetujui");
    } finally {
      await advisorContext.close();
    }
  });

  test("menolak KRS dengan alasan dan mempertahankan keputusan", async ({ page, browser }) => {
    await submitProbeKrs(page);
    const advisorContext = await browser.newContext();
    const advisorPage = await advisorContext.newPage();
    try {
      const row = await openAdvisorQueue(advisorPage);
      await row.getByRole("button", { name: "Tolak", exact: true }).click();
      const dialog = advisorPage.getByRole("dialog");
      await dialog.locator("textarea").fill("Mohon sesuaikan beban SKS.");
      await dialog.getByRole("button", { name: "Tolak KRS" }).click();
      await expect(advisorPage.getByText("KRS berhasil ditolak.")).toBeVisible();
      await expect(row).toContainText("Ditolak");
    } finally {
      await advisorContext.close();
    }
  });
});
