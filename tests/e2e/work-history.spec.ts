import { expect, test } from "@playwright/test";

test.describe("Work History Settings", () => {
	test("should load work history editor, make changes, and save successfully", async ({ page }) => {
		await test.step("Navigate to Work History Settings Page", async () => {
			await page.goto("/settings/work-history");
			await expect(page).toHaveTitle(/Edit Work History/);
			await expect(page.getByRole("heading", { name: "Edit Work History" })).toBeVisible();
			await expect(page.getByText("Edit your work history below")).toBeVisible();
		});

		await test.step("Verify Editor Loads with Existing Content", async () => {
			// Wait for editor to load completely
			await page.waitForSelector('[contenteditable="true"]');
			
			// Check if editor has content - this is the MDXEditor
			const editor = page.locator('[contenteditable="true"]');
			await expect(editor).toBeVisible();
			
			// Assert editor has some content already
			const editorContent = await editor.textContent();
			expect(editorContent?.length).toBeGreaterThan(0);
		});

		await test.step("Make Changes to Work History Content", async () => {
			// Create a test marker that we'll use to identify our test
			const testMarker = `Test Marker ${Date.now()}`;
			
			// First select a paragraph in the editor to insert our test marker
			const editor = page.locator('[contenteditable="true"]');
			await editor.click();
			
			// Add our test marker to the beginning of the content
			// Press Home to get to the beginning of the current line
			await page.keyboard.press('Home');
			// Then press Enter to create a new line and Home again to move to the start
			await page.keyboard.press('Enter');
			await page.keyboard.press('Home');
			// Now type our test marker
			await page.keyboard.type(testMarker);
			
			// Verify our test marker was added to the content
			const updatedContent = await editor.textContent();
			expect(updatedContent).toContain(testMarker);
			
			// Verify save button is now enabled (as changes were made)
			// Wait a bit for the change event to register
			await page.waitForTimeout(500);
			const saveButton = page.getByRole("button", { name: "Save Work History" });
			await expect(saveButton).toBeEnabled();
		});

		await test.step("Save Work History and Verify Success", async () => {
			// Click the save button
			const saveButton = page.getByRole("button", { name: "Save Work History" });
			await saveButton.click();
			
			// Wait for save operation to complete and success message to appear
			await expect(page.locator('.bg-green-50')).toBeVisible();
			
			// Verify the success message
			const successMessage = page.locator('.bg-green-50');
			await expect(successMessage).toContainText("Work history updated successfully");
			
			// Verify the save button is disabled again after successful save
			await expect(saveButton).toBeDisabled();
		});

		await test.step("Reload Page and Verify Content Persistence", async () => {
			// Get the test marker we used
			const firstTestMarker = await page.locator('[contenteditable="true"]').textContent();
			const testMarkerMatch = firstTestMarker.match(/Test Marker \d+/);
			expect(testMarkerMatch).not.toBeNull();
			const testMarker = testMarkerMatch ? testMarkerMatch[0] : '';
			
			// Reload the page
			await page.reload();
			
			// Wait for editor to load again
			await page.waitForSelector('[contenteditable="true"]');
			
			// Verify our added test marker is still present
			const editor = page.locator('[contenteditable="true"]');
			const editorContent = await editor.textContent();
			expect(editorContent).toContain(testMarker);
		});
	});

	test("should not enable save button without changes", async ({ page }) => {
		await test.step("Navigate to Work History Settings Page", async () => {
			await page.goto("/settings/work-history");
			await expect(page).toHaveTitle(/Edit Work History/);
		});

		await test.step("Wait for Editor to Load", async () => {
			await page.waitForSelector('[contenteditable="true"]');
			const editor = page.locator('[contenteditable="true"]');
			await expect(editor).toBeVisible();
		});

		await test.step("Verify Save Button is Disabled", async () => {
			// Check if the save button is disabled
			const saveButton = page.getByRole("button", { name: "Save Work History" });
			await expect(saveButton).toBeDisabled();
			
			// Just click in the editor without making changes
			const editor = page.locator('[contenteditable="true"]');
			await editor.click();
			
			// Save button should still be disabled
			await expect(saveButton).toBeDisabled();
		});
	});
	
	test("should navigate back to dashboard from the work history page", async ({ page }) => {
		await test.step("Navigate to Work History Settings Page", async () => {
			await page.goto("/settings/work-history");
			await expect(page).toHaveTitle(/Edit Work History/);
			await expect(page.getByRole("heading", { name: "Edit Work History" })).toBeVisible();
		});
		
		await test.step("Click on Back to Dashboard Link", async () => {
			// Find the Back to Dashboard link and click it
			const backToDashboardLink = page.getByRole("link", { name: "Back to Dashboard" });
			await expect(backToDashboardLink).toBeVisible();
			await backToDashboardLink.click();
			
			// Verify we are back on the dashboard page
			await expect(page).toHaveURL(/\/dashboard/);
			// Check for some dashboard element to confirm the navigation
			await expect(page.getByText(/Dashboard|Resume Generator Dashboard/)).toBeVisible();
		});
	});
}); 