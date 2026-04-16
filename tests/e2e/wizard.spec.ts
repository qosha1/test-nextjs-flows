import { test, expect } from "@playwright/test";

test.describe("Wizard flow", () => {
  test.beforeEach(async ({ context }) => {
    // Clear localStorage by navigating first, then clearing.
    await context.clearCookies();
  });

  test("full happy path through three steps", async ({ page }) => {
    await page.goto("/flows/wizard");
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();

    await expect(page.getByTestId("wizard-step")).toContainText("Step 1 of 3");

    await page.getByTestId("wizard-name-input").fill("Ada Lovelace");
    await page.getByTestId("wizard-email-input").fill("ada@example.com");
    await page.getByTestId("wizard-next").click();

    await expect(page.getByTestId("wizard-step")).toContainText("Step 2 of 3");
    await page.getByTestId("wizard-channel-email").check();
    await page.getByTestId("wizard-channel-push").check();
    await page.getByTestId("wizard-next").click();

    await expect(page.getByTestId("wizard-step")).toContainText("Step 3 of 3");
    await expect(page.getByTestId("wizard-review-name")).toHaveText(
      "Ada Lovelace",
    );
    await expect(page.getByTestId("wizard-review-email")).toHaveText(
      "ada@example.com",
    );
    await expect(page.getByTestId("wizard-review-channels")).toContainText(
      "Email",
    );
    await expect(page.getByTestId("wizard-review-channels")).toContainText(
      "Push",
    );

    await page.getByTestId("wizard-submit").click();
    await expect(page).toHaveURL(/\/flows\/wizard\/done/);
    await expect(page.getByTestId("wizard-done-name")).toHaveText(
      "Ada Lovelace",
    );
  });

  test("step 1 validation blocks advance", async ({ page }) => {
    await page.goto("/flows/wizard");
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
    await page.getByTestId("wizard-next").click();
    await expect(page.getByTestId("wizard-name-error")).toBeVisible();
    await expect(page.getByTestId("wizard-email-error")).toBeVisible();
    await expect(page.getByTestId("wizard-step")).toContainText("Step 1 of 3");
  });

  test("step 2 requires at least one channel", async ({ page }) => {
    await page.goto("/flows/wizard");
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
    await page.getByTestId("wizard-name-input").fill("Alan Turing");
    await page.getByTestId("wizard-email-input").fill("alan@example.com");
    await page.getByTestId("wizard-next").click();
    await page.getByTestId("wizard-next").click();
    await expect(page.getByTestId("wizard-channels-error")).toBeVisible();
    await expect(page.getByTestId("wizard-step")).toContainText("Step 2 of 3");
  });

  test("back preserves entered values", async ({ page }) => {
    await page.goto("/flows/wizard");
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
    await page.getByTestId("wizard-name-input").fill("Grace Hopper");
    await page.getByTestId("wizard-email-input").fill("grace@example.com");
    await page.getByTestId("wizard-next").click();
    await page.getByTestId("wizard-back").click();
    await expect(page.getByTestId("wizard-name-input")).toHaveValue(
      "Grace Hopper",
    );
    await expect(page.getByTestId("wizard-email-input")).toHaveValue(
      "grace@example.com",
    );
  });

  test("URL ?step=3 is clamped when step 1 is invalid", async ({ page }) => {
    await page.goto("/flows/wizard");
    await page.evaluate(() => window.localStorage.clear());
    await page.goto("/flows/wizard?step=3");
    await expect(page.getByTestId("wizard-step")).toContainText("Step 1 of 3");
  });
});
