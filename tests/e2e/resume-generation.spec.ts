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

    // Create job using fixture
    const jobId = await createJob(jobTitle, jobDescription);

    await test.step("Navigate to Generate Content", async () => {
      await expect(
        page.getByRole("heading", { name: new RegExp(jobTitle) })
      ).toBeVisible();
    });

    await test.step("Generates all content and redirects to resume page", async () => {
      await page
        .getByRole("button", { name: text.content.generateButton })
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

    // Clean up - delete the job
    await deleteJob(jobTitle);
  });

  test("allows selecting and running different workflows", async ({
    page,
    createJob,
    deleteJob,
  }) => {
    // Create a test job first
    const jobTitle = `Workflow Test Job ${Date.now()}`;
    const jobId = await createJob(jobTitle, "Testing different workflows");

    // We should already be on the job page after creating
    // 1. Assert default workflow is selected
    await expect(page.locator('select[name="workflowId"]')).toHaveValue(
      "default",
      { timeout: 10000 }
    );
    await expect(
      page.getByRole("heading", { name: "Job Description Analysis" })
    ).toBeVisible({ timeout: 10000 });

    // 2. Select Alternative Workflow
    await page.selectOption('select[name="workflowId"]', "alternative");

    // 3. Assert URL updates
    await expect(page).toHaveURL(/\?workflow=alternative(&template=[^&]+)?$/);

    // 4. Assert displayed steps match the alternative workflow
    // Wait for potential dynamic updates if any
    await page.waitForTimeout(1000); // Increased wait for UI update consistency
    await expect(
      page.getByRole("heading", { name: "Placeholder Step" })
    ).toBeVisible({ timeout: 10000 });
    // Check if the default workflow first step is NOT visible
    await expect(
      page.getByRole("heading", { name: "Job Description Analysis" })
    ).not.toBeVisible();

    // 5. Submit and check if workflow was used (basic check)
    // This relies on MSW mock returning something for the placeholder step
    await page.getByRole("button", { name: "Generate Content Steps" }).click();

    // Wait for the placeholder step result to appear
    const placeholderResult = page.locator(
      '.mb-4:has(h3:text("Placeholder Step"))'
    );
    await expect(
      placeholderResult.locator('span:text("Complete")')
    ).toBeVisible({ timeout: 15000 });
    // Check if the mock response text is present
    await expect(placeholderResult).toContainText("Default mock response");

    // Clean up
  });

  test.afterAll(async ({ page, deleteJob }) => {
    await deleteJob(jobTitle);

    await page.close();
  });
});
