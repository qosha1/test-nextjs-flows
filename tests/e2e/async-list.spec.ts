import { test, expect } from "@playwright/test";
import { resetBackend } from "./_helpers";

test.describe("Async list flow", () => {
  test.beforeEach(async ({ request }) => {
    await resetBackend(request);
  });

  test("loading skeleton appears then resolves to table", async ({ page }) => {
    await page.goto("/flows/async-list");
    await expect(page.getByTestId("async-list-loading")).toBeVisible();
    await expect(page.getByTestId("async-list-table")).toBeVisible({
      timeout: 5000,
    });
    const rows = page.locator('[data-testid^="async-list-row-"]');
    await expect(rows).toHaveCount(5);
  });

  test("toggling failure shows error; retry recovers", async ({ page }) => {
    await page.goto("/flows/async-list");
    await expect(page.getByTestId("async-list-table")).toBeVisible({
      timeout: 5000,
    });

    await page.getByTestId("async-list-fail-toggle").check();
    await expect(page.getByTestId("async-list-error")).toBeVisible({
      timeout: 5000,
    });

    await page.getByTestId("async-list-fail-toggle").uncheck();
    await expect(page.getByTestId("async-list-table")).toBeVisible({
      timeout: 5000,
    });
  });

  test("empty query shows placeholder", async ({ page }) => {
    await page.goto("/flows/async-list?empty=1");
    await expect(page.getByTestId("async-list-empty")).toBeVisible({
      timeout: 5000,
    });
  });
});
