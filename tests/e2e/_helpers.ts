import type { Page, APIRequestContext } from "@playwright/test";

export async function resetBackend(request: APIRequestContext): Promise<void> {
  const res = await request.post("/api/reset");
  if (!res.ok()) throw new Error(`Reset failed: ${res.status()}`);
}

export async function login(page: Page): Promise<void> {
  await page.goto("/flows/auth");
  await page.getByTestId("email-input").fill("demo@test.com");
  await page.getByTestId("password-input").fill("password123");
  await page.getByTestId("login-submit").click();
  await page.waitForURL("**/flows/auth/dashboard");
}
