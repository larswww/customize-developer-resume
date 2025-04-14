import { test, expect } from "./fixtures/job-fixtures";
import text from "../../app/text";

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
    const jobId = await createJob(jobTitle, jobDescription);

    await test.step("Navigate to Generate Content", async () => {
      await expect(
        page.getByRole("heading", { name: new RegExp(jobTitle) })
      ).toBeVisible();
    });

    await test.step("Generates all content and redirects to resume page", async () => {
      await page
        .getByRole("button", { name: text.content.generateButton, exact: true })
        .click();

      await page
        .getByText(text.ui.complete)
        .first()
        .waitFor({ state: "visible" });

      await expect(page.url()).toContain("/resume");
    });

    await test.step("Generate and Verify Structured Resume Content", async () => {
      await page.getByText(text.resume.emptyState);
      await page
        .getByRole("button", { name: text.content.generateButton })
        .click();
      await expect(page.getByText(text.resume.emptyState)).not.toBeVisible();
      await expect(page.getByText(text.ui.generating)).toBeVisible();
    });

    await test.step("Edit Resume Content", async () => {
      await page.getByRole("button", { name: text.resume.editButton }).click();

      const editResumeHeading = page.getByRole("button", {
        name: text.resume.headings.edit,
      });
      await expect(editResumeHeading).toBeVisible();
      await editResumeHeading.click();
      const textarea = page.getByRole("textbox").nth(1);
      await expect(textarea).toBeVisible();

      const updatedContent = "Updated resume content for testing";
      await textarea.click();
      await textarea.pressSequentially(updatedContent);

      await expect(textarea.getByText(updatedContent)).toBeVisible();
      await page.getByRole("button", { name: text.resume.regenerateButton });
      await expect(textarea.getByText(updatedContent)).toBeVisible();
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

    await test.step("Changing workflow", async () => {
      await expect(page.locator('select[name="workflow"]')).toHaveValue(
        "default",
        { timeout: 10000 }
      );
      await page.selectOption('select[name="workflow"]', "alternative");
      await expect(page).toHaveURL(/\?workflow=alternative(&template=[^&]+)?$/);
      await expect(page.getByText(text.content.generateButton)).toBeVisible();
      await expect(page.getByText(text.ui.complete)).not.toBeVisible();
    });

    await deleteJob(jobTitle);
  });
});
