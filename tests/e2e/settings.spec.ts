import { expect, test } from "@playwright/test";
import text from "~/text";

test.describe("Settings Page", () => {
	test("should navigate between tabs", async ({ page }) => {
		await page.goto("/settings");
		await expect(
			page.locator(`legend:has-text("${text.settings.contactInfo.legend}")`),
		).toBeVisible();
		await page.locator(`a:has-text("${text.settings.nav.education}")`).click();
		await expect(page).toHaveURL(/\/settings\/education/);
		await expect(
			page.locator(`legend:has-text("${text.settings.education.legend}")`),
		).toBeVisible();

		await page
			.locator(`a:has-text("${text.settings.nav.contactInfo}")`)
			.click();
		await expect(page).toHaveURL(/\/settings$/);
		await expect(
			page.locator(`legend:has-text("${text.settings.contactInfo.legend}")`),
		).toBeVisible();
	});

	test("should add and save project with markdown content", async ({
		page,
	}) => {
		await page.goto("/settings/projects");
		await expect(
			page
				.locator("div.py-4")
				.getByRole("heading", { name: text.settings.projects.legend }),
		).toBeVisible();

		await page.locator('input[name="projects[0].title"]').fill("Test Project");
		await page.locator('input[name="projects[0].date"]').fill("2024");
		await page
			.locator('input[name="projects[0].link"]')
			.fill("https://example.com");

		const markdownEditor = page.getByRole("textbox", {
			name: "editable markdown",
		});
		await markdownEditor.pressSequentially(
			"## Project Description\n\nThis is a test project with **markdown** content.",
		);

		await page
			.getByRole("button", { name: text.settings.projects.buttonText })
			.click();

		await page.waitForLoadState("networkidle");
		await page.reload();

		await expect(page.locator('input[name="projects[0].title"]')).toHaveValue(
			"Test Project",
		);
		await expect(markdownEditor).toContainText("Project Description");
	});

	test("should add and save other section with markdown content", async ({
		page,
	}) => {
		await page.goto("/settings/other");
		await expect(
			page
				.locator("div.py-4")
				.getByRole("heading", { name: text.settings.other.legend }),
		).toBeVisible();

		const markdownEditor = page.getByRole("textbox", {
			name: "editable markdown",
		});
		await markdownEditor.pressSequentially(
			"## Additional Information\n\n- Volunteer work\n- Certifications\n- Awards",
		);

		await page
			.getByRole("button", { name: text.settings.other.buttonText })
			.click();

		await page.waitForLoadState("networkidle");
		await page.reload();

		await expect(markdownEditor).toContainText("Additional Information");
	});
});
