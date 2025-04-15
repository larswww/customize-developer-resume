
import text from "~/text";
import { expect, test } from "./fixtures/job-fixtures";


test.describe("Global Setup", () => {
	test("add work history", async ({ page }) => {
		await page.goto("/dashboard");
        await page.getByRole("link", { name: text.nav.settings, exact: true }).click();

        const workHistoryTextbox = await page.getByRole("textbox")
        await workHistoryTextbox.pressSequentially("Test Work History");
        await page.getByRole("button", { name: text.settings.workHistory.buttonText }).click();
		await expect(workHistoryTextbox).toContainText("Test Work History");
	});
});
