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
      
      // Click create and explicitly wait for the navigation/load event to the job page
      await Promise.all([
        page.waitForURL(/\/job\/(\d+)/, { timeout: 60000 }), // Keep waiting for URL pattern
        page.waitForLoadState('networkidle'), // Wait for network activity to cease
        page.getByRole("button", { name: text.dashboard.createJob.confirmButton }).click() // Trigger the action
      ]);

      const url = page.url();
      const match = url.match(/\/job\/(\d+)/);
      const jobId = match?.[1] || "";
      
      // Wait for the job page heading to be visible
      await expect(page.getByRole('heading', { name: new RegExp(title) })).toBeVisible({ timeout: 10000 });
      
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