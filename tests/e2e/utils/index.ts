import type { Page } from "@playwright/test";

import { expect } from "@playwright/test";

export async function fillForm(page: Page, formData: { [key: string]: string }) {
    for (const [name, value] of Object.entries(formData)) {
      await page.locator(`input[name="${name}"]`).fill(value);
    }
  }
  
export async function submitForm(page: Page, buttonText: string) {
    await page.locator(`button[type="submit"]:has-text("${buttonText}")`).click();
  }
  
export async function verifyInputValues(page: Page, expectedData: { [key: string]: string }) {
    for (const [name, value] of Object.entries(expectedData)) {
      await expect(page.locator(`input[name="${name}"]`)).toHaveValue(value);
    }
  }