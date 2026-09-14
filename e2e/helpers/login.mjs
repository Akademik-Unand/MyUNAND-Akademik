import { expect } from "@playwright/test";
import { URLS } from "./data.mjs";

/**
 * Login lewat UI. Setelah berhasil, alihkan keluar /login. Mengembalikan
 * payload user yang disimpan aplikasi di localStorage (null bila gagal
 * dibaca) untuk asersi lanjutan.
 */
export async function login(page, { email, password }) {
  await page.goto(URLS.login);
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  await expect(page).not.toHaveURL(/\/login/, {
    message: `Login ${email} harus berhasil (halaman keluar dari /login).`,
  });
  return page.evaluate(() => {
    const raw = localStorage.getItem("myunand_auth");
    if (!raw) return null;
    const session = JSON.parse(raw);
    return session.user ?? null;
  });
}