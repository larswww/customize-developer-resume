import { expect, test } from "@playwright/test";
import text from "~/text";

test.describe("Settings Page", () => {
	test("should navigate between tabs", async ({ page }) => {
		await page.goto("/settings");
		await page.waitForLoadState("networkidle");
		await page.goto("/settings/experience");
		await page.waitForLoadState("networkidle");
		await page.goto("/settings/projects");
		await page.waitForLoadState("networkidle");
		await page.goto("/settings/other");
		await page.waitForLoadState("networkidle");
		await page.goto("/settings/education");
		await page.waitForLoadState("networkidle");
	});

	test("should add and save project with markdown content", async ({
		page,
	}) => {
		await page.goto("/settings/projects");

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

		await page.getByRole("button", { name: text.ui.save }).click();

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

		const markdownEditor = page.getByRole("textbox", {
			name: "editable markdown",
		});
		await markdownEditor.pressSequentially(
			"## Additional Information\n\n- Volunteer work\n- Certifications\n- Awards",
		);

		await page.getByRole("button", { name: text.ui.save }).click();

		await page.waitForLoadState("networkidle");
		await page.reload();

		await expect(markdownEditor).toContainText("Additional Information");
	});
});
