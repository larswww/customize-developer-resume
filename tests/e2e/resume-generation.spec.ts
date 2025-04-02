import { expect, test } from "@playwright/test";

test.describe("Resume Generation E2E Flow", () => {
	// Increase timeout for the entire test suite due to AI generation steps
	test.setTimeout(120000); // 2 minutes

	test("should create a job, generate content, verify persistence, create resume, and download PDF", async ({ page }) => {
		const jobTitle = `E2E Test Job ${Date.now()}`;
		const jobDescription = "This is a test job description for the E2E flow.";
		let jobId: string | null = null;

		await test.step("Navigate to Dashboard and Reveal Create Job Form", async () => {
			await page.goto("/dashboard");
			await expect(page).toHaveTitle(/Resume Generator Dashboard/);
			// Click the button to show the form
			await page.getByRole("button", { name: "Create New Job" }).click();
			// Verify the form heading is now visible
			await expect(page.getByRole("heading", { name: "Create New Resume Job" })).toBeVisible();
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
			await expect(page.getByRole("heading", { name: `Generate Content for ${jobTitle}` })).toBeVisible();
		});

		await test.step("Generate All Content Sections", async () => {
			await page.getByRole("button", { name: "Generate All Sections" }).click();
			
			const coverLetterHeading = page.getByRole("heading", { name: "Write Cover Letter" });
			await expect(coverLetterHeading).toBeVisible({ timeout: 90000 }); 
			
			// Locate the parent container of the heading (less strict)
			const coverLetterSection = page.locator('div:has(h3:has-text("Write Cover Letter"))'); // Removed direct child '>'
			const firstParagraphInCoverLetter = coverLetterSection.locator('p').first();
			
			await expect(firstParagraphInCoverLetter).toBeVisible();
			await expect(firstParagraphInCoverLetter).toHaveText(/.+/); 
		});

		await test.step("Reload Page and Verify Content Persistence", async () => {
			await page.reload();
			await page.waitForLoadState('domcontentloaded'); 
			
			const coverLetterHeading = page.getByRole("heading", { name: "Write Cover Letter" });
			await expect(coverLetterHeading).toBeVisible();
			
			// Verify cover letter section content (less strict locator)
			const coverLetterSection = page.locator('div:has(h3:has-text("Write Cover Letter"))'); // Removed direct child '>'
			const firstParagraphInCoverLetter = coverLetterSection.locator('p').first();
			await expect(firstParagraphInCoverLetter).toBeVisible();
			await expect(firstParagraphInCoverLetter).toHaveText(/.+/); 

			const analysisHeading = page.getByRole("heading", { name: "Analyze Description" });
			await expect(analysisHeading).toBeVisible(); 
			
			// Verify analysis section content (less strict locator)
			const analysisSection = page.locator('div:has(h3:has-text("Analyze Description"))'); // Removed direct child '>'
			await expect(analysisSection.locator('p').first()).toBeVisible();
			await expect(analysisSection.locator('p').first()).toHaveText(/.+/);
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
			// Navigate back to dashboard first
			await page.goto("/dashboard");
			await expect(page).toHaveTitle(/Resume Generator Dashboard/);
			
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
});
