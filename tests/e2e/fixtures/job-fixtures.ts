import { test as base, Page, expect } from "@playwright/test";
import text from "../../../app/text";

type JobFixtures = {
  createJob: (title: string, description: string, link?: string) => Promise<string>;
  deleteJob: (title: string) => Promise<void>;
};

export const test = base.extend<JobFixtures>({
  createJob: async ({ page }, use) => {
    const createJobFn = async (title: string, description: string, link?: string): Promise<string> => {
      await page.goto('/dashboard');
      
      // Open create job form
      const createButton = page.getByRole("button", { name: text.dashboard.createJob.ctaButton });
      await expect(createButton).toBeVisible();
      await createButton.click();
      await page.waitForTimeout(500);
      await expect(page.getByRole("heading", { name: text.dashboard.createJob.ctaButton })).toBeVisible();
      
      // Fill out the form
      await page.locator('input[name="title"]').fill(title);
      if (link) {
        await page.locator('input[name="link"]').fill(link);
      }
      await page.locator('textarea[name="jobDescription"]').fill(description);
      await page.getByRole("button", { name: text.dashboard.createJob.confirmButton }).click();
      
      // Wait for navigation to job page and extract jobId with a longer timeout
      await page.waitForURL(/\/job\/(\d+)/, { timeout: 60000 });
      const url = page.url();
      const match = url.match(/\/job\/(\d+)/);
      const jobId = match?.[1] || "";
      
      return jobId;
    };
    
    await use(createJobFn);
  },
  
  deleteJob: async ({ page }, use) => {
    const deleteJobFn = async (title: string): Promise<void> => {
      await page.goto('/dashboard');
      
      const jobCard = page.locator('div.border.rounded-lg').filter({ 
        has: page.getByRole('heading', { name: title, level: 3 }) 
      });
      
      await expect(jobCard).toBeVisible();
      
      // Handle the confirmation dialog
      page.on('dialog', dialog => dialog.accept());
      
      await jobCard.getByRole("button", { name: text.ui.delete }).click();
      
      // Verify the job card is removed
      await expect(page.getByRole("heading", { name: title, level: 3 })).not.toBeVisible();
    };
    
    await use(deleteJobFn);
  },
});

export { expect } from "@playwright/test"; 