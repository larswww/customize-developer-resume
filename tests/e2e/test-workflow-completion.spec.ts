import { test, expect } from '@playwright/test';
import { createNewJob } from '../mocks'; // Assuming mocks.ts exports this helper

test.describe('Test Parallel Workflow Completion', () => {
  test('should display all steps as complete after generation', async ({ page }) => {
    // 1. Create a new job and get its ID (using a mock helper)
    // Ensure the object passed matches the expected structure (using 'title')
    const jobId = await createNewJob({ title: 'Test Job', company: 'Test Co' }); 
    
    // 2. Navigate to the job content page (using the correct route path from routes.ts)
    await page.goto(`/job/${jobId}`);

    // 3. Select the 'Test Parallel Workflow'
    const workflowSelectLabel = page.getByLabel('Select Content Generation Workflow');
    // Explicitly wait for the label (and associated element) to be visible
    await expect(workflowSelectLabel).toBeVisible({ timeout: 10000 }); // Add a reasonable wait
    // Use getByLabel for better accessibility-based selection
    await workflowSelectLabel.selectOption({ label: 'Test Parallel Workflow' });
    
    // Wait for any potential state update after selection
    await page.waitForTimeout(100); 

    // 4. Enter job description
    // Target the MDXEditor by a stable attribute or role
    await page.locator('.mdxeditor').click(); // Focus the editor
    await page.keyboard.type('Simple test job description.');

    // 5. Click Generate button
    await page.locator('button:has-text("Generate Resume Text")').click();

    // 6. Wait for results and verify completion status for all steps
    // First, wait for the title of the generated content section to appear
    const sectionTitle = page.getByText("Generated Content Steps").first();
    await expect(sectionTitle).toBeVisible({ timeout: 60000 }); // Increased timeout

    // Click the title to expand the collapsible section
    await sectionTitle.click();

    // Wait for the steps container to appear
    const stepsContainer = page.locator('.flex.flex-col.md\\:flex-row.gap-6').first();
    await expect(stepsContainer).toBeVisible({ timeout: 10000 });

    // Define the expected steps from workflow-test.ts
    const expectedSteps = [
      'Step A',
      'Step B',
      'Step C',
      'Step D',
      'Final Step', // Name from workflow-test.ts
    ];

    // Wait for all steps to be visible and check if they are marked as complete
    for (const stepName of expectedSteps) {
      // Find the step heading
      const stepHeading = page.getByRole('heading', { name: stepName }).first();
      await expect(stepHeading).toBeVisible({ timeout: 10000 });
      
      // Find the closest div containing both the heading and the status badge
      const stepCardSelector = `.flex.items-center.justify-between:has(h3:text("${stepName}"))`;
      const stepCard = page.locator(stepCardSelector).first();
      
      // Look for the "Complete" badge within this card
      const completeText = stepCard.locator('span.bg-green-100:has-text("Complete")').first();
      await expect(completeText).toBeVisible({ timeout: 20000 });
    }
  });
});