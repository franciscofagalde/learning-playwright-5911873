import { test, expect } from "@playwright/test";

test("home page test", async ({ page }) => {
  await page.goto("https://practicesoftwaretesting.com//");

  // Ensure signin link is present
  await expect(page.getByTestId("nav-sign-in")).toHaveText("Sign in");

  //Check the title of the page
  await expect(page).toHaveTitle("Practice Software Testing - Toolshop - v5.0");

  //Check the count of items displayed
  const productGrid = page.locator(".col-md-9");
  await expect(productGrid.getByRole("link")).toHaveCount(9);
  expect(await productGrid.getByRole("link").count()).toBe(9);

  //Search for Thor Hammer and check the result

  await page.locator('[data-test="search-query"]').fill("Thor Hammer");
  await page.locator('[data-test="search-submit"]').click();
  await expect(page.getByTestId("product-01KMZGQ2G788E7QHZ4AZ2P7MH9")).toContainText("Thor Hammer");
});

