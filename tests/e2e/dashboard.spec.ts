import { TEST_IDS } from "~/config/testIds";
import text from "../../app/text";
import { expect, test } from "./fixtures/job-fixtures";

test.describe("Dashboard Functionality", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/dashboard");
	});

	test("should create a job with title, link, and job description", async ({
		page,
		createJob,
		deleteJob,
	}) => {
		const jobTitle = `Test Job with Link ${Date.now()}`;
		const jobDescription = "This is a test job description.";
		const jobLink = "https://example.com/job-posting";

		const jobId = await createJob(jobTitle, jobDescription, jobLink);

		await test.step("Verify job creation and fields display correctly", async () => {
			await page.goto("/dashboard");

			const jobCard = page.locator("div.border.rounded-lg").filter({
				has: page.getByRole("heading", { name: jobTitle, level: 3 }),
			});
			await expect(jobCard).toBeVisible();

			const linkButton = jobCard.getByText(
				text.dashboard.viewJob.viewJobButton,
			);
			await expect(linkButton).toBeVisible();
			const linkHref = await linkButton.getAttribute("href");
			expect(linkHref).toBe(jobLink);

			const resumeButton = jobCard.getByRole("link", {
				name: text.dashboard.viewJob.resumeButton,
			});
			await expect(resumeButton).toBeVisible();

			const href = await resumeButton.getAttribute("href");
			expect(href).toContain(`/job/${jobId}`);

			await resumeButton.click();
			await expect(page).toHaveURL(new RegExp(`/job/${jobId}`));
		});

		// Clean up using the fixture
		await deleteJob(jobTitle);
	});

	test("should open job details sheet and update job information", async ({
		page,
		createJob,
		deleteJob,
	}) => {
		const originalTitle = `Original Job Title ${Date.now()}`;
		const updatedTitle = `Updated Job Title ${Date.now()}`;
		const updatedDescription = "This is an updated job description.";

		const jobId = await createJob(originalTitle, "Original description");

		await test.step("Navigate to job page and open job details sheet", async () => {
			await page.goto(`/job/${jobId}`);

			// Click the "Edit Job Details" button to open the sheet
			await page.getByRole("button", { name: "Edit Job Details" }).click();

			// Verify the sheet is open by checking for the form title
			await expect(
				page.getByRole("heading", { name: "Job Details", level: 3 }),
			).toBeVisible();
		});

		await test.step("Update job details in the sheet", async () => {
			const sheetContent = page.getByTestId(TEST_IDS.sheetContent);
			await expect(sheetContent).toBeVisible();

			// Update the job title
			const titleInput = sheetContent.locator('input[name="title"]');
			await titleInput.fill(updatedTitle);

			// Update the job description
			const descriptionEditor = sheetContent
				.getByRole("textbox", { name: "editable markdown" })
				.first();
			await descriptionEditor.fill(updatedDescription);

			// Submit the form
			await sheetContent.getByRole("button", { name: "Update Job" }).click();

			// TODO
			// await expect(page.getByText("Job updated successfully")).toBeVisible();
		});

		await test.step("Verify job was updated", async () => {
			// Navigate back to dashboard to verify the job title was updated
			await page.goto("/dashboard");

			// Check that the updated job title is visible
			await expect(
				page.getByRole("heading", { name: updatedTitle, level: 3 }),
			).toBeVisible();

			// Verify the original title is no longer visible
			await expect(
				page.getByRole("heading", { name: originalTitle, level: 3 }),
			).not.toBeVisible();
		});

		// Clean up using the updated title
		await deleteJob(updatedTitle);
	});
});
