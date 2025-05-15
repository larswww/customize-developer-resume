import { expect, test } from "@playwright/test";
import text from "../app/text";

test.describe("Resume generation with BullMQ", () => {
	test("should queue a resume generation job", async ({ page }) => {
		// Navigate to home page
		await page.goto("/");

		// Create a new job
		await page.getByText("New Job").click();

		// Fill in job details
		const jobTitle = `Test Job ${Date.now()}`;
		await page.getByLabel("Job Title").fill(jobTitle);
		await page.getByRole("button", { name: "Save" }).click();

		// Wait for redirect to job page
		await page.waitForURL(/\/job\/\d+/);

		// Enter job description
		await page
			.locator("article[contenteditable=true]")
			.first()
			.fill("This is a test job description for a software engineer position.");

		// Generate resume content
		await page
			.getByRole("button", { name: text.content.generateButton })
			.click();

		// Wait for generation to complete
		await page.waitForSelector("text=Resume generated successfully", {
			timeout: 60000,
		});

		// Navigate to templates page
		const jobId = page.url().match(/\/job\/(\d+)/)?.[1];
		await page.goto(`/resume/templates?jobId=${jobId}`);

		// Ensure templates are displayed
		await expect(
			page.locator("h1:has-text('Choose a template')"),
		).toBeVisible();

		// Click on first template "Generate" button
		await page.getByRole("button", { name: "Generate" }).first().click();

		// Verify that the generation starts (checking for spinning indicator)
		await expect(page.locator("text=Processing").first()).toBeVisible();

		// Wait for generation to complete and redirect (longer timeout since it's async)
		await page.waitForURL(/\/job\/\d+\/resume/, { timeout: 120000 });

		// Verify we're on the resume page
		await expect(page.locator("text=Resume")).toBeVisible();
	});
});
