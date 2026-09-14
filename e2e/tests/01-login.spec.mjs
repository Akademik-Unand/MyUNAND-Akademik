import { expect, test } from "@playwright/test";
import { login } from "../helpers/login.mjs";
import { SUPERADMIN } from "../helpers/data.mjs";

test.describe("Login", () => {
  test("pengunjung tanpa sesi dialihkan ke halaman login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
    await expect(
      page.getByRole("button", { name: "Masuk", exact: true }),
    ).toBeVisible();
  });

  test("superadmin dapat masuk lalu keluar", async ({ page }) => {
    const me = await login(page, SUPERADMIN);
    expect(me?.email).toBe(SUPERADMIN.email);

    await expect(page).toHaveURL("/");
    const session = await page.evaluate(() => {
      const raw = localStorage.getItem("myunand_auth");
      return raw ? JSON.parse(raw) : null;
    });
    expect(session?.token).toBeTruthy();

    const trigger = page
      .locator(".dropdown label", { hasText: SUPERADMIN.name })
      .first();
    await trigger.click();
    await page.getByRole("button", { name: "Keluar" }).click();

    await expect(page).toHaveURL(/\/login/);
    const after = await page.evaluate(() =>
      localStorage.getItem("myunand_auth"),
    );
    expect(after).toBeNull();
  });
});