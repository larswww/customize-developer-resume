import { TEST_IDS } from "~/config/testIds";
import text from "~/text";
import { expect, test } from "./fixtures/job-fixtures";
import { fillForm, submitForm, verifyInputValues } from "./utils";

test.describe("Global Setup", () => {
	test("add work experience", async ({ page }) => {
		await page.goto("/settings/experience");

		const workExperienceData = {
			"experience[0].company": "Test Company",
			"experience[0].location": "Test Location",
			"experience[0].dates": "2020-2024",
		};

		await fillForm(page, workExperienceData);

		await page.getByRole("textbox", { name: "Title" }).fill("Test role title");
		const workHistoryTextbox = page.getByRole("textbox", {
			name: "editable markdown",
		});
		await workHistoryTextbox.pressSequentially("Test Work History");
		await page.getByRole("button", { name: text.ui.save }).click();

		await page.waitForLoadState("networkidle");
		await page.reload();

		// Re-locate the element after page reload since DOM is recreated
		const reloadedWorkHistoryTextbox = page.getByRole("textbox", {
			name: "editable markdown",
		});
		await expect(reloadedWorkHistoryTextbox).toContainText("Test Work History");
	});

	test("should update contact info", async ({ page }) => {
		await page.goto("/settings");

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
		await submitForm(page, text.ui.save);

		await page.waitForLoadState("networkidle");
		await page.reload();

		await verifyInputValues(page, contactData);
	});

	test("should update education info", async ({ page }) => {
		await page.goto("/settings/education");

		const educationData = {
			"educations[0].degree": `Test Degree ${Date.now()}`,
			"educations[0].institution": `Test University ${Date.now()}`,
			"educations[0].dates": "2020-2024",
			"educations[0].location": "Test Campus, TS",
		};

		await fillForm(page, educationData);
		await submitForm(page, text.ui.save);

		await page.waitForLoadState("networkidle");
		await page.waitForTimeout(100);
		await expect(page.locator("#education-form fieldset")).toBeVisible();
		await page.reload();

		await verifyInputValues(page, educationData);
	});
});
