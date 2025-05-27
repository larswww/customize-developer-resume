import { test as base, expect } from "@playwright/test";
import { TEST_IDS } from "../../../app/config/testIds";
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
			await page.goto("/dashboard?createJob=yes");

			await page
				.getByRole("textbox", { name: text.dashboard.createJob.jobTitle })
				.waitFor({ state: "visible" });
			await page
				.getByRole("textbox", { name: text.dashboard.createJob.jobTitle })
				.fill(title);

			// Open the Job Details collapsible section if we need to fill link or description
			if (link || description) {
				await page.getByRole("button", { name: /Job Details/ }).click();

				if (link) {
					await page
						.locator('input[name="link"]')
						.waitFor({ state: "visible" });
					await page.locator('input[name="link"]').fill(link);
				}

				if (description) {
					// Job description is now a markdown editor, use the container test ID
					const markdownEditorContainer = page.getByRole("textbox", {
						name: "editable markdown",
					});
					await markdownEditorContainer.fill(description);
				}
			}

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
				page.getByRole("heading", { name: text.template.title }).first(),
			).toBeVisible();

			return jobId;
		};

		await use(createJobFn);
	},

	deleteJob: async ({ page }, use) => {
		const deleteJobFn = async (title: string): Promise<void> => {
			await page.goto("/dashboard");

			const jobRow = page.getByRole("row").filter({
				has: page.getByText(title),
			});

			await expect(jobRow).toBeVisible();

			await jobRow
				.getByRole("button", { name: text.dashboard.jobsTable.delete })
				.click();

			await expect(jobRow).not.toBeVisible();
		};

		await use(deleteJobFn);
	},
});

export { expect } from "@playwright/test";
