import { test, expect } from "@playwright/test";
import { resetBackend } from "./_helpers";

test.describe("Optimistic UI flow", () => {
  test.beforeEach(async ({ request }) => {
    await resetBackend(request);
  });

  test("item 3 (always succeeds) increments permanently", async ({ page }) => {
    await page.goto("/flows/optimistic");
    const count = page.getByTestId("optimistic-count-3");
    const startValue = Number(await count.innerText());

    await page.getByTestId("optimistic-like-3").click();
    await expect(count).toHaveText(String(startValue + 1));

    // Wait for the request to settle (400ms server latency + buffer).
    await page.waitForTimeout(900);
    await expect(count).toHaveText(String(startValue + 1));
  });

  test("item 1 (always fails) rolls back with toast", async ({ page }) => {
    await page.goto("/flows/optimistic");
    const count = page.getByTestId("optimistic-count-1");
    const startValue = Number(await count.innerText());

    await page.getByTestId("optimistic-like-1").click();
    await expect(count).toHaveText(String(startValue + 1));

    // After rollback (~400ms server + react state update).
    await expect(count).toHaveText(String(startValue), { timeout: 2000 });
    await expect(page.getByTestId("toast-error")).toContainText(
      "Could not like — try again",
    );
  });
});
