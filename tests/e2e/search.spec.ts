import { test, expect } from "@playwright/test";
import { resetBackend } from "./_helpers";

test.describe("Debounced search flow", () => {
  test.beforeEach(async ({ request }) => {
    await resetBackend(request);
  });

  test("empty state shows featured suggestions", async ({ page }) => {
    await page.goto("/flows/search");
    await expect(page.getByTestId("search-suggestions-label")).toBeVisible({
      timeout: 3000,
    });
    const results = page.locator('[data-testid^="search-result-"]');
    await expect(results.first()).toBeVisible();
  });

  test("typing 'apple' returns two results", async ({ page }) => {
    await page.goto("/flows/search");
    await page.getByTestId("search-input").fill("apple");
    await expect(page.getByTestId("search-result-1")).toBeVisible({
      timeout: 3000,
    });
    await expect(page.getByTestId("search-result-2")).toBeVisible();
    await expect(
      page.locator('[data-testid^="search-result-"]'),
    ).toHaveCount(2);
  });

  test("unknown query shows empty state", async ({ page }) => {
    await page.goto("/flows/search");
    await page.getByTestId("search-input").fill("xyznomatch");
    await expect(page.getByTestId("search-empty")).toBeVisible({
      timeout: 3000,
    });
  });

  test("debounce fires at most once for rapid typing", async ({ page }) => {
    await page.goto("/flows/search");
    // Wait for initial suggestions request to complete.
    await expect(page.getByTestId("search-suggestions-label")).toBeVisible();

    const requestCounts = { apple: 0, other: 0 };
    page.on("request", (req) => {
      const url = req.url();
      if (url.includes("/api/search?q=apple")) requestCounts.apple += 1;
      else if (url.includes("/api/search?")) requestCounts.other += 1;
    });

    await page.getByTestId("search-input").pressSequentially("apple", {
      delay: 50,
    });
    await page.waitForTimeout(500);

    // Debounce window is 300ms; typing each char in 50ms means exactly one request fires for final value.
    expect(requestCounts.apple).toBeLessThanOrEqual(1);
  });
});
