import { test, expect } from "./fixtures/job-fixtures";
import text from "../../app/text";

test.describe("Dashboard Functionality", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test("should create a job with title, link, and job description", async ({ page, createJob, deleteJob }) => {
    const jobTitle = `Test Job with Link ${Date.now()}`;
    const jobDescription = "This is a test job description.";
    const jobLink = "https://example.com/job-posting";

    // Create a job using the fixture
    const jobId = await createJob(jobTitle, jobDescription, jobLink);

    await test.step("Verify job creation and fields display correctly", async () => {
      await page.goto('/dashboard');

      const jobCard = page.locator('div.border.rounded-lg').filter({ has: page.getByRole('heading', { name: jobTitle, level: 3 }) });
      await expect(jobCard).toBeVisible();

      const linkButton = jobCard.getByText(text.dashboard.viewJob.viewJobButton);
      await expect(linkButton).toBeVisible();
      const linkHref = await linkButton.getAttribute('href');
      expect(linkHref).toBe(jobLink);

      const resumeButton = jobCard.getByRole("link", { name: text.dashboard.viewJob.resumeButton });
      await expect(resumeButton).toBeVisible();

      const href = await resumeButton.getAttribute('href');
      expect(href).toContain(`/job/${jobId}`);
      
      await resumeButton.click();
      await expect(page).toHaveURL(new RegExp(`/job/${jobId}`));
    });

    // Clean up using the fixture
    await deleteJob(jobTitle);
  });
}); 