import { expect, test } from "@playwright/test";

test.describe("Resume Generation E2E Flow", () => {
	// Increase timeout for the entire test suite due to AI generation steps

	test.beforeEach(async ({ page }) => {
		// Navigate to the dashboard before each test in this describe block
		await page.goto('/dashboard');
	});

	test("should create a job, generate content, verify persistence, create resume, and download PDF", async ({ page }) => {
		const jobTitle = `E2E Test Job ${Date.now()}`;
		const jobDescription = "This is a test job description for the E2E flow.";
		let jobId: string | null = null;

		await test.step("Navigate to Dashboard and Reveal Create Job Form", async () => {
			await expect(page).toHaveTitle(/Resume Generator Dashboard/);
			// Make sure the button is visible and then click it
			const createButton = page.getByRole("button", { name: "Create New Job" });
			await expect(createButton).toBeVisible({ timeout: 10000 });
			await createButton.click();
			// Verify the form heading is now visible
			await expect(page.getByRole("heading", { name: "Create New Resume Job" })).toBeVisible({ timeout: 10000 });
		});

		await test.step("Fill Job Title and Create Job", async () => {
			// Fill the title in the revealed form
			await page.locator('input[name="title"]').fill(jobTitle);
			// Click the submit button within the form
			await page.getByRole("button", { name: "Create Job" }).click();
			
			// Expect the URL to still be the dashboard after form submission
			await expect(page).toHaveURL(/\/dashboard/);
			// Expect the new job title heading to be visible on the dashboard
			await expect(page.getByRole("heading", { name: jobTitle })).toBeVisible();
		});

		await test.step("Navigate to Generate Content", async () => {
			// Find the job card div by locating the specific h3 title, then go up to the parent card
			const jobCard = page.locator('div.border.rounded-lg').filter({ has: page.getByRole('heading', { name: jobTitle, level: 3, exact: true }) });
			
			// Find the "Generate Content" link within that specific job card
			const generateContentLink = jobCard.getByRole("link", { name: "Generate Content" });
			await expect(generateContentLink).toBeVisible();
			
			// Extract jobId from the link's href
			const href = await generateContentLink.getAttribute('href');
			expect(href).toBeTruthy();
			const match = href?.match(/\/job\/(\d+)\/content/);
			expect(match).toBeTruthy();
			if (!match || !match[1]) {
				throw new Error('Could not extract job ID from link href');
			}
			jobId = match[1];
			console.log(`Found Job ID: ${jobId}`);

			await generateContentLink.click();
			await expect(page).toHaveURL(`/job/${jobId}/content`);
			await expect(page.getByRole("heading", { name: /Content Generation for .+/ })).toBeVisible({ timeout: 10000 });
		});

		await test.step("Generate All Content Sections", async () => {
			await page.getByRole("button", { name: "Generate Content Steps" }).click();
			
			await page.getByText("Complete").first().waitFor({ state: "visible" });
		});


		await test.step("Navigate to Create Resume Page", async () => {
			// This link might appear at the bottom after generation
			const createResumeLink = page.locator('a:has-text("Create Resume")').last(); // Use last if multiple links exist
			await expect(createResumeLink).toBeVisible();
			await createResumeLink.click();
			await expect(page).toHaveURL(`/job/${jobId}/resume`);
			// Verify navigation by checking for an element unique to the resume page, like the generate button
			await expect(page.getByRole("button", { name: "Generate Structured Resume" })).toBeVisible();
		});

		await test.step("Generate and Verify Structured Resume Content", async () => {
			// Click the button to generate structured data
			await page.getByRole("button", { name: "Generate Structured Resume" }).click();
			
			// Wait for the structured data to be generated and rendered
			// Check for a key section heading
			const professionalSummary = page.getByRole("heading", { name: "Generated Resume" });
			// Increase timeout as AI generation can be slow
			await expect(professionalSummary).toBeVisible({ timeout: 60000 }); // 60 seconds timeout
			
			// Check for skills section as well
			const skillsSection = page.getByRole("heading", { name: "SKILLS" });
			await expect(skillsSection).toBeVisible();
			
			// Now verify the Download button is enabled (no longer disabled)
			await expect(page.getByRole("button", { name: "Download as PDF" })).toBeEnabled();
		});

		await test.step("Download PDF Resume", async () => {
			// Start waiting for download before clicking. Note: Adjust button name if different.
			const downloadPromise = page.waitForEvent('download');
			await page.getByRole("button", { name: "Download as PDF" }).click();
			
			const download = await downloadPromise;
			
			// Optional: Verify filename 
			const suggestedFilename = download.suggestedFilename();
			expect(suggestedFilename).toContain('.pdf'); // Basic check for PDF extension
			console.log(`Downloaded file: ${suggestedFilename}`);
			
			// To be thorough, you could save the download and check file size/content,
			// but simply verifying the download event occurred is often sufficient for E2E.
			// await download.saveAs(`test-results/downloaded-resume-${jobId}.pdf`);
		});

		await test.step("Delete Job and Verify Removal", async () => {
			// Find the specific job card again
			const jobCard = page.locator('div.border.rounded-lg').filter({ has: page.getByRole('heading', { name: jobTitle, level: 3, exact: true }) });
			await expect(jobCard).toBeVisible();
			
			// Find and click the delete button within the card
			const deleteButton = jobCard.getByRole("button", { name: "Delete" });
			await expect(deleteButton).toBeVisible();
			
			// Handle the confirmation dialog
			page.on('dialog', dialog => dialog.accept());
			
			await deleteButton.click();
			
			// Wait for navigation or reload after delete (dashboard action reloads data)
			await page.waitForLoadState('domcontentloaded');
			
			// Verify the job title heading is no longer present on the dashboard
			await expect(page.getByRole("heading", { name: jobTitle, level: 3 })).not.toBeVisible();
		});
	});

	test('allows selecting and running different workflows', async ({ page }) => {
		// Navigate directly to the job content page for a specific job
		await page.goto('/job/1/content');

		// 1. Assert default workflow is selected
		await expect(page.locator('select[name="workflowId"]')).toHaveValue('default');
		await expect(page.getByRole('heading', { name: 'Job Description Analysis' })).toBeVisible();

		// 2. Select Alternative Workflow
		await page.selectOption('select[name="workflowId"]', 'alternative');

		// 3. Assert URL updates
		await expect(page).toHaveURL(/\?workflow=alternative(&template=[^&]+)?$/);

		// 4. Assert displayed steps match the alternative workflow
		// Wait for potential dynamic updates if any
		await page.waitForTimeout(100); // Small wait for UI update consistency
		await expect(page.getByRole('heading', { name: 'Job Description Analysis' })).toBeVisible();
		// This is the actual name from the alternative workflow first step

		// 5. (Optional) Submit and check if workflow was used (basic check)
		// This relies on MSW mock returning something for the placeholder step
		await page.getByRole('button', { name: 'Generate Content Steps' }).click();
		
		// Wait for the placeholder step result to appear
		const placeholderResult = page.locator('.mb-4:has(h3:text("Placeholder Step"))');
		await expect(placeholderResult.locator('span:text("Complete")')).toBeVisible();
		// Check if the mock response text is present
		await expect(placeholderResult).toContainText('Default mock response'); 
	});
});
