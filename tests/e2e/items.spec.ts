import { test, expect } from "@playwright/test";
import { resetBackend } from "./_helpers";

test.describe("Items dynamic route flow", () => {
  test.beforeEach(async ({ request }) => {
    await resetBackend(request);
  });

  test("list renders and edit link navigates to correct id", async ({
    page,
  }) => {
    await page.goto("/flows/items");
    await expect(page.getByTestId("items-row-1")).toBeVisible();

    await page.getByTestId("items-edit-1").click();
    await expect(page).toHaveURL(/\/flows\/items\/1\/edit/);
    await expect(page.getByTestId("edit-item-id")).toHaveText("1");
    await expect(page.getByTestId("edit-name-input")).toHaveValue(
      "Onboarding checklist",
    );
  });

  test("edit then save returns to list with updated name", async ({ page }) => {
    await page.goto("/flows/items/1/edit");
    await page.getByTestId("edit-name-input").fill("Renamed onboarding");
    await page.getByTestId("edit-save").click();
    await expect(page).toHaveURL(/\/flows\/items$/);
    await expect(page.getByTestId("items-name-1")).toHaveText(
      "Renamed onboarding",
    );
  });

  test("invalid id renders 404", async ({ page }) => {
    const res = await page.goto("/flows/items/999/edit");
    expect(res?.status()).toBe(404);
  });

  test("dirty state + cancel triggers confirm dialog", async ({ page }) => {
    await page.goto("/flows/items/1/edit");
    await page.getByTestId("edit-name-input").fill("Dirty");
    await expect(page.getByTestId("edit-dirty-indicator")).toBeVisible();

    page.once("dialog", (dialog) => dialog.accept());
    await page.getByTestId("edit-cancel").click();
    await expect(page).toHaveURL(/\/flows\/items$/);
  });
});
