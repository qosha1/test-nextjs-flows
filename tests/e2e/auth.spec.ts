import { test, expect } from "@playwright/test";
import { resetBackend } from "./_helpers";

test.describe("Auth flow", () => {
  test.beforeEach(async ({ request, context }) => {
    await resetBackend(request);
    await context.clearCookies();
  });

  test("valid credentials redirect to dashboard", async ({ page }) => {
    await page.goto("/flows/auth");
    await page.getByTestId("email-input").fill("demo@test.com");
    await page.getByTestId("password-input").fill("password123");
    await page.getByTestId("login-submit").click();
    await expect(page).toHaveURL(/\/flows\/auth\/dashboard/);
    await expect(page.getByTestId("dashboard-heading")).toContainText(
      "demo@test.com",
    );
  });

  test("invalid credentials show error", async ({ page }) => {
    await page.goto("/flows/auth");
    await page.getByTestId("email-input").fill("demo@test.com");
    await page.getByTestId("password-input").fill("wrong");
    await page.getByTestId("login-submit").click();
    await expect(page).toHaveURL(/\/flows\/auth/);
    await expect(page.getByTestId("login-error")).toContainText(
      "Invalid email or password",
    );
  });

  test("protected dashboard redirects anonymous users", async ({ page }) => {
    await page.goto("/flows/auth/dashboard");
    await expect(page).toHaveURL(/\/flows\/auth$/);
    await expect(page.getByTestId("login-form")).toBeVisible();
  });

  test("logout clears session", async ({ page }) => {
    await page.goto("/flows/auth");
    await page.getByTestId("email-input").fill("demo@test.com");
    await page.getByTestId("password-input").fill("password123");
    await page.getByTestId("login-submit").click();
    await page.waitForURL("**/flows/auth/dashboard");
    await page.getByTestId("logout-submit").click();
    await expect(page).toHaveURL(/\/flows\/auth$/);
    await page.goto("/flows/auth/dashboard");
    await expect(page).toHaveURL(/\/flows\/auth$/);
  });
});
