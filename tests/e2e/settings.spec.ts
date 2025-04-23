import { test, expect } from "@playwright/test";
import text from "~/text";


test.describe("Settings Page", () => {
  

   test("should navigate between tabs", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.locator(`legend:has-text("${text.settings.contactInfo.legend}")`)).toBeVisible();
    await page.locator(`a:has-text("${text.settings.nav.education}")`).click();
    await expect(page).toHaveURL(/\/settings\/education/);
    await expect(page.locator(`legend:has-text("${text.settings.education.legend}")`)).toBeVisible();

    await page.locator(`a:has-text("${text.settings.nav.contactInfo}")`).click(); 
    await expect(page).toHaveURL(/\/settings$/); 
    await expect(page.locator(`legend:has-text("${text.settings.contactInfo.legend}")`)).toBeVisible();
  });
}); 