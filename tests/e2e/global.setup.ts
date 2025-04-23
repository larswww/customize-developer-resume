import text from "~/text";
import { expect, test } from "./fixtures/job-fixtures";
import { fillForm, submitForm, verifyInputValues } from "./utils";


test.describe("Global Setup", () => {
	test("add work history", async ({ page }) => {
		await page.goto("/dashboard");
        await page.getByRole("link", { name: text.nav.settings, exact: true }).click();

        const workHistoryTextbox = await page.getByRole("textbox")
        await workHistoryTextbox.pressSequentially("Test Work History");
        await page.getByRole("button", { name: text.settings.workHistory.buttonText }).click();
		await expect(workHistoryTextbox).toContainText("Test Work History");
	});

    test("should update contact info", async ({ page }) => {
        await page.goto("/settings");
        await expect(page.locator(`legend:has-text("${text.settings.contactInfo.legend}")`)).toBeVisible();
    
        const contactData = {
            firstName: `Test User ${Date.now()}`,
            lastName: "LastName",
            title: "Software Engineer",
            email: `test-${Date.now()}@example.com`,
            phone: "123-456-7890",
            location: "Test City, TS",
            linkedin: "https://www.linkedin.com/in/testuser",
            portfolio: "https://www.testuser.com",
            github: "https://github.com/testuser",
        };
    
        await fillForm(page, contactData);
        await submitForm(page, text.settings.contactInfo.buttonText);
    
        await page.waitForLoadState('networkidle');
        await page.reload();
    
        await verifyInputValues(page, contactData);
      });
    
      test("should update education info", async ({ page }) => {
        await page.goto("/settings/education");
        await expect(page.locator(`legend:has-text("${text.settings.education.legend}")`)).toBeVisible();
    
        const educationData = {
            degree: `Test Degree ${Date.now()}`,
            institution: `Test University ${Date.now()}`,
            dates: "2020-2024",
            location: "Test Campus, TS",
        };
    
        await fillForm(page, educationData);
        await submitForm(page, text.settings.education.buttonText);
    
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(100);
        await expect(page.locator('#education-form fieldset')).toBeVisible();
        await page.reload();
    
        await verifyInputValues(page, educationData);
      });
});
