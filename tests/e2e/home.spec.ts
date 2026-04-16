import { test, expect } from "@playwright/test";

test("home page lists all flows", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "test-nextjs-flows" }),
  ).toBeVisible();

  const expectedFlows = [
    "auth",
    "wizard",
    "async-list",
    "optimistic",
    "search",
    "modals",
    "items",
  ];

  for (const slug of expectedFlows) {
    await expect(page.getByTestId(`flow-link-${slug}`)).toBeVisible();
  }
});

test("health endpoint returns ok", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.status()).toBe(200);
  expect(await res.json()).toEqual({ status: "ok" });
});
