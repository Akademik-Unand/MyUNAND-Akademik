import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import { createPool, queryOne } from "../helpers/db.mjs";
import { login } from "../helpers/login.mjs";
import { SUPERADMIN } from "../helpers/data.mjs";

test("akun mahasiswa dibuat dari konteks profile, navigasi dua arah, dan edit tidak memutus tautan", async ({ page }) => {
  const niu = `E2E-MANUAL-${randomUUID().slice(0, 8)}`;
  const namaMahasiswa = `Uji Akun ${niu}`;
  await login(page, SUPERADMIN);
  const conn = createPool();
  let unit;
  let admin;
  try {
    unit = await queryOne(
      conn,
      "SELECT p.id AS prodi_id, p.departemen_id, d.fakultas_id FROM program_studi p JOIN departemen d ON d.id = p.departemen_id WHERE p.kode_prodi = ? LIMIT 1",
      ["54231"],
    );
    admin = await queryOne(conn, "SELECT id FROM users WHERE email = ? LIMIT 1", [SUPERADMIN.email]);
  } finally {
    await conn.end();
  }
  expect(unit).toBeTruthy();
  await page.evaluate(({ adminId, unitContext }) => {
    const key = String(adminId);
    const persisted = JSON.parse(localStorage.getItem("myunand_organization_context") || '{"state":{"contextsByUser":{}},"version":0}');
    persisted.state.contextsByUser[key] = unitContext;
    localStorage.setItem("myunand_organization_context", JSON.stringify(persisted));
  }, { adminId: admin.id, unitContext: { fakultasId: String(unit.fakultas_id), departemenId: String(unit.departemen_id), prodiId: String(unit.prodi_id) } });
  await page.reload();
  await page.goto("/master/mahasiswa");
  await page.getByRole("button", { name: "Tambahkan Data" }).click();
  const profileDialog = page.getByRole("dialog");
  await expect(profileDialog.getByRole("heading", { name: "Tambah Mahasiswa" })).toBeVisible();
  const profileInputs = profileDialog.locator("input");
  await profileInputs.nth(0).fill(niu);
  await profileInputs.nth(1).fill(namaMahasiswa);
  await profileInputs.nth(2).fill("2024");
  const programSelect = profileDialog.locator("fieldset").filter({ hasText: "Program Studi" }).getByRole("button");
  await programSelect.click();
  await profileDialog.getByRole("listbox").getByRole("button", { name: "S1 Peternakan", exact: true }).click();
  await profileDialog.getByRole("button", { name: "Simpan" }).click();
  await expect(page.getByText("Mahasiswa berhasil ditambahkan.")).toBeVisible();

  let profile;
  try {
    profile = await queryOne(
      conn,
      "SELECT id, niu, nama FROM mahasiswa WHERE niu = ? AND user_id IS NULL AND deletedAt IS NULL LIMIT 1",
      [niu],
    );
  } finally {
    await conn.end();
  }
  expect(profile, "Data mahasiswa baru tersedia sebelum pembuatan akun").toBeTruthy();

  const email = `e2e.profile.${randomUUID()}@seed.myunand.local`;
  await page.getByPlaceholder("Cari nama atau NIM/NIU...").fill(niu);
  const newStudentRow = page.locator("tbody tr").filter({ hasText: niu });
  await expect(newStudentRow).toBeVisible();
  await newStudentRow.getByRole("button", { name: "Lihat detail" }).click();
  await page.getByRole("link", { name: "Buat Akun" }).click();
  await expect(page).toHaveURL(new RegExp(`/pengaturan/pengguna\\?createMahasiswa=${profile.id}`));

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Tambah Pengguna" })).toBeVisible();
  await expect(dialog.getByRole("checkbox", { name: "Mahasiswa" })).toBeChecked();
  await dialog.locator('input[name="email"]').fill(email);
  await dialog.locator('input[name="password"]').fill("Password123");
  await dialog.getByRole("button", { name: "Simpan" }).click();
  await expect(page.getByText("Pengguna berhasil ditambahkan.")).toBeVisible();

  const verifyAccount = async () => {
    const verifyConn = createPool();
    try {
      return await queryOne(
        verifyConn,
        `SELECT u.id AS user_id, u.name, m.id AS mahasiswa_id, m.niu, r.name AS role
         FROM users u JOIN mahasiswa m ON m.user_id = u.id
         JOIN user_roles ur ON ur.user_id = u.id JOIN roles r ON r.id = ur.role_id
         WHERE u.email = ? LIMIT 1`,
        [email],
      );
    } finally {
      await verifyConn.end();
    }
  };

  const account = await verifyAccount();
  expect(account).toMatchObject({ mahasiswa_id: profile.id, role: "mahasiswa" });
  expect(account.user_id).toBeTruthy();

  await page.getByPlaceholder("Cari nama atau email...").fill(email);
  const row = page.locator("tbody tr").filter({ hasText: email });
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "Lihat detail" }).click();
  await page.getByRole("link", { name: "Lihat Data Mahasiswa" }).click();
  await expect(page).toHaveURL(new RegExp(`/master/mahasiswa\\?detailId=${profile.id}`));
  await expect(page.getByRole("heading", { name: "Detail Mahasiswa" })).toBeVisible();
  await expect(page.getByText(profile.niu, { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Lihat Akun" }).click();
  await expect(page).toHaveURL(new RegExp(`/pengaturan/pengguna\\?detailId=${account.user_id}`));

  await page.goto(`/pengaturan/pengguna?detailId=${account.user_id}`);
  await expect(page.getByRole("heading", { name: "Detail Pengguna" })).toBeVisible();
  await page.getByRole("link", { name: "Lihat Data Mahasiswa" }).click();
  await expect(page).toHaveURL(new RegExp(`/master/mahasiswa\\?detailId=${profile.id}`));

  await page.goto("/pengaturan/pengguna");
  await page.getByPlaceholder("Cari nama atau email...").fill(email);
  const accountRow = page.locator("tbody tr").filter({ hasText: email });
  await expect(accountRow).toBeVisible();
  await accountRow.getByRole("button", { name: "Ubah data" }).click();
  const editDialog = page.getByRole("dialog");
  const updatedName = `${profile.nama} (E2E)`;
  await editDialog.locator('input[name="name"]').fill(updatedName);
  await editDialog.getByRole("button", { name: "Perbarui" }).click();
  await expect(page.getByText("Pengguna berhasil diperbarui.")).toBeVisible();

  const edited = await verifyAccount();
  expect(edited).toMatchObject({ name: updatedName, mahasiswa_id: profile.id, role: "mahasiswa" });
});
