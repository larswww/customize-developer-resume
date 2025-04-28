import { test as base, expect } from "@playwright/test";
import text from "../../../app/text";

type JobFixtures = {
	createJob: (
		title: string,
		description: string,
		link?: string,
	) => Promise<string>;
	deleteJob: (title: string) => Promise<void>;
};

export const test = base.extend<JobFixtures>({
	createJob: async ({ page }, use) => {
		const createJobFn = async (
			title: string,
			description: string,
			link?: string,
		): Promise<string> => {
			await page.goto("/dashboard");

			await page
				.getByRole("button", {
					name: text.dashboard.createJob.ctaButton,
				})
				.click({ force: true });
			await page.waitForTimeout(1000);

			await page.locator('input[name="title"]').waitFor({ state: "visible" });
			await page.locator('input[name="title"]').fill(title);
			if (link) {
				await page.locator('input[name="link"]').fill(link);
			}
			await page.locator('textarea[name="jobDescription"]').fill(description);

			await Promise.all([
				page.waitForURL(/\/job\/(\d+)/),
				page.waitForLoadState("networkidle"),
				page
					.getByRole("button", { name: text.dashboard.createJob.confirmButton })
					.click(),
			]);

			const url = page.url();
			const match = url.match(/\/job\/(\d+)/);
			const jobId = match?.[1] || "";
			await expect(
				page.getByRole("heading", { name: new RegExp(title) }),
			).toBeVisible();

			return jobId;
		};

		await use(createJobFn);
	},

	deleteJob: async ({ page }, use) => {
		const deleteJobFn = async (title: string): Promise<void> => {
			await page.goto("/dashboard");

			const jobCard = page.locator("div.border.rounded-lg").filter({
				has: page.getByRole("heading", { name: title, level: 3 }),
			});

			await expect(jobCard).toBeVisible();

			// Handle the confirmation dialog
			page.on("dialog", (dialog) => dialog.accept());

			await jobCard.getByRole("button", { name: text.ui.delete }).click();

			// Verify the job card is removed
			await expect(
				page.getByRole("heading", { name: title, level: 3 }),
			).not.toBeVisible();
		};

		await use(deleteJobFn);
	},
});

export { expect } from "@playwright/test";
