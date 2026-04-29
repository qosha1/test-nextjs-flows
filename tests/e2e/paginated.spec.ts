import { test, expect } from "@playwright/test";
import { resetBackend } from "./_helpers";

test.describe("Paginated table flow", () => {
  test.beforeEach(async ({ request }) => {
    await resetBackend(request);
  });

  test("page 1 loads 2 rows and Prev is disabled", async ({ page }) => {
    await page.goto("/flows/paginated");
    await expect(page.getByTestId("paginated-table")).toBeVisible({ timeout: 5000 });

    await expect(page.getByTestId("paginated-row-1")).toBeVisible();
    await expect(page.getByTestId("paginated-row-2")).toBeVisible();
    await expect(page.locator('[data-testid^="paginated-row-"]')).toHaveCount(2);

    await expect(page.getByTestId("paginated-prev")).toBeDisabled();
    await expect(page.getByTestId("paginated-next")).toBeEnabled();
    await expect(page.getByTestId("paginated-page-info")).toContainText("Page 1 of 3");
  });

  test("Next advances to page 2 and updates URL", async ({ page }) => {
    await page.goto("/flows/paginated");
    await expect(page.getByTestId("paginated-table")).toBeVisible({ timeout: 5000 });

    await page.getByTestId("paginated-next").click();
    await expect(page.getByTestId("paginated-table")).toBeVisible({ timeout: 5000 });

    await expect(page.getByTestId("paginated-row-3")).toBeVisible();
    await expect(page.getByTestId("paginated-row-4")).toBeVisible();
    await expect(page.locator('[data-testid^="paginated-row-"]')).toHaveCount(2);

    await expect(page.getByTestId("paginated-page-info")).toContainText("Page 2 of 3");
    await expect(page).toHaveURL(/page=2/);
  });

  test("last page shows 1 row and Next is disabled", async ({ page }) => {
    await page.goto("/flows/paginated?page=3");
    await expect(page.getByTestId("paginated-table")).toBeVisible({ timeout: 5000 });

    await expect(page.getByTestId("paginated-row-5")).toBeVisible();
    await expect(page.locator('[data-testid^="paginated-row-"]')).toHaveCount(1);

    await expect(page.getByTestId("paginated-next")).toBeDisabled();
    await expect(page.getByTestId("paginated-prev")).toBeEnabled();
  });

  test("Prev navigates back from page 2 to page 1", async ({ page }) => {
    await page.goto("/flows/paginated?page=2");
    await expect(page.getByTestId("paginated-table")).toBeVisible({ timeout: 5000 });

    await page.getByTestId("paginated-prev").click();
    await expect(page.getByTestId("paginated-table")).toBeVisible({ timeout: 5000 });

    await expect(page.getByTestId("paginated-page-info")).toContainText("Page 1 of 3");
    await expect(page).toHaveURL(/page=1/);
    await expect(page.getByTestId("paginated-prev")).toBeDisabled();
  });

  test("direct URL navigation to page 2 shows correct rows", async ({ page }) => {
    await page.goto("/flows/paginated?page=2");
    await expect(page.getByTestId("paginated-table")).toBeVisible({ timeout: 5000 });

    await expect(page.getByTestId("paginated-row-3")).toBeVisible();
    await expect(page.getByTestId("paginated-row-4")).toBeVisible();
    await expect(page.getByTestId("paginated-page-info")).toContainText("Page 2 of 3");
  });
});
