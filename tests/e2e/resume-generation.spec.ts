import { availableTemplates } from "~/config/schemas";
import { TEST_IDS } from "~/config/testIds";
import text from "../../app/text";
import { expect, test } from "./fixtures/job-fixtures";

test.describe("Resume Generation E2E Flow", () => {
	const jobTitle = `E2E Test Job ${Date.now()}`;

	test.beforeEach(async ({ page }) => {
		await page.goto("/dashboard");
	});

	test("should create a job, generate content, verify persistence, create resume, and download PDF", async ({
		page,
		createJob,
		deleteJob,
	}) => {
		const jobDescription = "This is a test job description for the E2E flow.";
		await createJob(jobTitle, jobDescription);

		await test.step("Generates all resumes and redirects to default template page", async () => {
			const buttonCount = await page
				.getByRole("button", { name: text.content.generateButton })
				.count();
			for (let i = 0; i < buttonCount; i++) {
				await page
					.getByRole("button", { name: text.content.generateButton })
					.first()
					.click();
			}

			await page
				.getByText(`Check mark${text.ui.complete}`, { exact: true })
				.first()
				.waitFor({ state: "visible" });

			await page.getByText(availableTemplates.default.name).first().click();
		});

		await test.step("Generate and Verify Structured Resume Content", async () => {
			await page.hover(`[data-testid="${TEST_IDS.feedbackBarButton}"]`);
			await page
				.getByRole("button", { name: text.resume.generateButton, exact: true })
				.click();
			await page
				.getByPlaceholder(text.resume.feedbackPlaceholder)
				.fill("This is a test feedback");
			const isMac = process.platform === "darwin";
			await page
				.getByPlaceholder(text.resume.feedbackPlaceholder)
				.press(isMac ? "Meta+Enter" : "Control+Enter");
			await expect(
				page.getByText(text.ui.generating).first(),
			).not.toBeVisible();
		});

		await test.step("Edit Resume Content", async () => {
			const contentEdit = "Change to this text";
			const editElementInResume = await page
				.getByTestId(TEST_IDS.editElementInResume)
				.first();
			await editElementInResume.click();
			await page
				.getByTestId(TEST_IDS.editableElementInResume)
				.first()
				.pressSequentially(contentEdit);
			await expect(page.getByText(contentEdit)).toBeVisible();

			await page.getByRole("button", { name: text.resume.saveChanges }).click();
			await page.waitForTimeout(1000);

			await page.reload();

			await page.getByText(contentEdit).waitFor({ state: "visible" });
		});

		// TODO: will only work once mocking of structured output is fixed
		await test.step.skip("Download PDF Resume", async () => {
			const downloadPromise = page.waitForEvent("download");
			await page
				.getByRole("button", { name: text.resume.downloadButton })
				.click();

			const download = await downloadPromise;

			const suggestedFilename = download.suggestedFilename();
			expect(suggestedFilename).toContain(".pdf");
			console.log(`Downloaded file: ${suggestedFilename}`);
		});

		await test.step("Changing template", async () => {
			await expect(page.url()).toContain(availableTemplates.default.id);
			await page.getByText(availableTemplates.consultantOnePager.name).click();
			await expect(page.url()).toContain(
				availableTemplates.consultantOnePager.id,
			);
		});

		await deleteJob(jobTitle);
	});
});
