import { test, expect } from "@playwright/test";

test.describe("Settings Page", () => {
  test("should allow updating contact info", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.locator('legend:has-text("Contact Information")')).toBeVisible();

    const name = `Test User ${Date.now()}`;
    const email = `test-${Date.now()}@example.com`;
    const phone = "123-456-7890";
    const location = "Test City, TS";

    await page.locator('input[name="name"]').fill(name);
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="phone"]').fill(phone);
    await page.locator('input[name="location"]').fill(location);

    await page.locator('button[type="submit"]:has-text("Save Contact Info")').click();

 
    await page.waitForLoadState('networkidle');

    await page.reload();

    await expect(page.locator('input[name="name"]')).toHaveValue(name);
    await expect(page.locator('input[name="email"]')).toHaveValue(email);
    await expect(page.locator('input[name="phone"]')).toHaveValue(phone);
    await expect(page.locator('input[name="location"]')).toHaveValue(location);
  });

  test("should allow updating education info", async ({ page }) => {
    // Navigate directly to the education settings page
    await page.goto("/settings/education");

    // Verify education form is visible initially
    await expect(page.locator('legend:has-text("Education")')).toBeVisible();

    // Fill the form
    const degree = `Test Degree ${Date.now()}`;
    const institution = `Test University ${Date.now()}`;
    const dates = "2020-2024";
    const location = "Test Campus, TS";

    await page.locator('input[name="degree"]').fill(degree);
    await page.locator('input[name="institution"]').fill(institution);
    await page.locator('input[name="dates"]').fill(dates);
    await page.locator('input[name="location"]').fill(location);

    // Submit the form
    await page.locator('button[type="submit"]:has-text("Save Education")').click();

    // Wait for potential background activity AND add a small delay
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(100); // Small explicit delay

    // Explicitly check if the form/fieldset is still visible
    await expect(page.locator('#education-form fieldset')).toBeVisible();

    await page.reload();

    await expect(page.locator('input[name="degree"]')).toHaveValue(degree);
    await expect(page.locator('input[name="institution"]')).toHaveValue(institution);
    await expect(page.locator('input[name="dates"]')).toHaveValue(dates);
    await expect(page.locator('input[name="location"]')).toHaveValue(location);
  });

   test("should navigate between tabs", async ({ page }) => {
    // Start at base settings page (contact form)
    await page.goto("/settings");

    // Check if Contact Info form is visible
    await expect(page.locator('legend:has-text("Contact Information")')).toBeVisible();

    // Click the Education tab
    await page.locator('a:has-text("Education")').click();

    // Check if URL changed to /settings/education
    await expect(page).toHaveURL(/\/settings\/education/);

    // Check if Education form is visible
    await expect(page.locator('legend:has-text("Education")')).toBeVisible();

     // Click the Contact Info tab
     // Link should point to /settings (or potentially /settings/contact if explicitly rendered that way)
     // Let's assume the link points to /settings for the index route behavior
    await page.locator('a:has-text("Contact Info")').click(); 

    // Check if URL changed back to /settings
    await expect(page).toHaveURL(/\/settings$/); // Use regex to match end of string

    // Check if Contact Info form is visible again
    await expect(page.locator('legend:has-text("Contact Information")')).toBeVisible();
  });
}); 