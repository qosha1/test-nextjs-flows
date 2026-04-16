import { test, expect } from "@playwright/test";
import { resetBackend } from "./_helpers";

test.describe("Modal stack flow", () => {
  test.beforeEach(async ({ request }) => {
    await resetBackend(request);
  });

  test("nested delete with type-to-confirm succeeds and shows undo toast", async ({
    page,
  }) => {
    await page.goto("/flows/modals");
    await expect(page.getByTestId("modals-project-1")).toBeVisible();

    await page.getByTestId("modals-delete-1").click();
    await expect(page.getByTestId("modals-first")).toBeVisible();

    await page.getByTestId("modals-first-continue").click();
    await expect(page.getByTestId("modals-second")).toBeVisible();

    // Confirm button disabled until typed name matches.
    await expect(
      page.getByTestId("modals-second-confirm"),
    ).toBeDisabled();

    await page.getByTestId("modals-confirm-input").fill("Phoenix");
    await expect(
      page.getByTestId("modals-second-confirm"),
    ).toBeEnabled();

    await page.getByTestId("modals-second-confirm").click();

    // Both modals closed, project removed, undo toast visible.
    await expect(page.getByTestId("modals-second")).toBeHidden();
    await expect(page.getByTestId("modals-first")).toBeHidden();
    await expect(page.getByTestId("modals-project-1")).toBeHidden();
    await expect(page.getByTestId("toast-action")).toContainText(
      "Deleted",
    );
  });

  test("undo restores deleted project", async ({ page }) => {
    await page.goto("/flows/modals");
    await page.getByTestId("modals-delete-2").click();
    await page.getByTestId("modals-first-continue").click();
    await page.getByTestId("modals-confirm-input").fill("Aurora");
    await page.getByTestId("modals-second-confirm").click();
    await expect(page.getByTestId("modals-project-2")).toBeHidden();

    await page.getByTestId("toast-action-action").click();
    await expect(page.getByTestId("modals-project-2")).toBeVisible({
      timeout: 3000,
    });
  });

  test("escape closes only the topmost modal", async ({ page }) => {
    await page.goto("/flows/modals");
    await page.getByTestId("modals-delete-3").click();
    await page.getByTestId("modals-first-continue").click();
    await expect(page.getByTestId("modals-second")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByTestId("modals-second")).toBeHidden();
    await expect(page.getByTestId("modals-first")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByTestId("modals-first")).toBeHidden();
  });

  test("cancel at first modal keeps project", async ({ page }) => {
    await page.goto("/flows/modals");
    await page.getByTestId("modals-delete-1").click();
    await page.getByTestId("modals-first-cancel").click();
    await expect(page.getByTestId("modals-first")).toBeHidden();
    await expect(page.getByTestId("modals-project-1")).toBeVisible();
  });
});
