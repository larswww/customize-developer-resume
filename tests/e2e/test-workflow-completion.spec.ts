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

    // Now, locate the container holding the actual step items (rendered when not loading)
    // This targets the div containing the two columns of steps
    const stepsContainer = page.locator('div > div > div > div.flex.flex-col.md\\:flex-row.gap-6'); 
    // Wait for this specific container to be visible, indicating loading is likely complete
    await expect(stepsContainer).toBeVisible({ timeout: 10000 });

    // Define the expected steps from workflow-test.ts
    const expectedSteps = [
      'Step A',
      'Step B',
      'Step C',
      'Step D',
      'Final Step', // Name from workflow-test.ts
    ];

    // Verify each step is present and marked as complete
    for (const stepName of expectedSteps) {
      // Locator strategy: Find the step container based on the visible step name text,
      // then find the "Complete" badge within that container. Search relative to the stepsContainer.
      const stepRowLocator = stepsContainer.locator(`div:has-text("${stepName}")`).nth(0); // More specific selector for step item container
      
      // Check step name visibility within its specific container
      await expect(stepRowLocator).toBeVisible();
      
      // Check for the "Complete" badge/status indicator within that step's container
      // Adjust the selector for the "Complete" badge based on its actual implementation
      await expect(stepRowLocator.locator('span:has-text("Complete")')).toBeVisible(); // Assuming 'Complete' is in a span within the located step row
    }
  });
});