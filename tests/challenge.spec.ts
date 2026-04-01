import { test, expect } from "@playwright/test";

test.describe("Checkout Flow Challenge", () => {
  test.use({ storageState: ".auth/customer01.json" });

  test.beforeEach(async ({ page }) => {
    await page.goto("https://practicesoftwaretesting.com/");
  });

  // Test 1: Complete checkout flow
  test("should complete a checkout flow with a product", async ({ page }) => {
    // Search for a product
    await page.getByTestId("search-query").fill("Thor Hammer");
    await page.getByTestId("search-submit").click();

    // Click on the product
    await page.getByAltText("Thor Hammer").click();

    // Add to cart
    await page.getByTestId("add-to-cart").click();

    // Verify product is in cart
    await expect(page.getByTestId("product-quantity")).toContainText("1");

    // Go to cart
    await page.getByTestId("nav-cart").click();

    // Verify product is in cart page
    await expect(page.getByTestId("product-title")).toContainText("Thor Hammer");

    // Proceed to checkout
    await page.getByTestId("proceed-1").click();
    // Proceed second page
    await page.getByTestId("proceed-2").click();

    // Fill billing address
    await page.getByTestId("street").fill("123 Main Street");
    await page.getByTestId("city").fill("Springfield");
    await page.getByTestId("state").fill("IL");
    await page.getByTestId("country").fill("US");
    await page.getByTestId("postal_code").fill("62701");
    await page.getByTestId("proceed-3").click();

    // Select payment method: Buy now, pay later
    await page.getByTestId("payment-method").selectOption("buy-now-pay-later");
    
    // Select installment option
    await page.getByTestId("monthly_installments").selectOption("9");
    
    // Proceed to finish
    await page.getByTestId("finish").click();
     await expect(page.locator('[data-test="payment-success-message"]')).toContainText('Payment was successful');


  });

  // Test 2: Checkout flow with visual test
  test("should display correct checkout page layout with visual snapshot", async ({
    page,
  }) => {
    // Search and add product
    await page.getByTestId("search-query").fill("Pliers");
    await page.getByTestId("search-submit").click();

    // Click on first product
    await page.locator('[data-test="product-name"]').first().click();

    // Add to cart
    await page.getByTestId("add-to-cart").click();

    // Go to cart
    await page.getByTestId("nav-cart").click();

    // Proceed to checkout
    await page.getByTestId("proceed-1").click();

    // Wait for page to fully load
    await page.waitForLoadState("networkidle");

    // Wait for toast notification to disappear before taking screenshot
    await page.locator(".toast-body").waitFor({ state: "hidden", timeout: 10000 }).catch(() => {});

    // Take visual snapshot of checkout page
    await expect(page).toHaveScreenshot("checkout-page.png", {
      maxDiffPixelRatio: 0.03,
      timeout: 10000,
    });

    // Verify checkout page content is visible
    await expect(page.getByTestId("proceed-2")).toBeVisible();
  });

  // Test 3: API test for product endpoint
  test("should fetch product details via API", async ({ page }) => {
    // Using API context to test the product endpoint
    const apiContext = await page.context();

    // First get list of products to find a valid ID
    const listResponse = await apiContext.request.get(
      "https://api.practicesoftwaretesting.com/products?page=1"
    );
    expect(listResponse.status()).toBe(200);
    const listData = await listResponse.json();
    const productId = listData.data[0].id;

    // Get product by valid ID
    const response = await apiContext.request.get(
      `https://api.practicesoftwaretesting.com/products/${productId}`
    );

    expect(response.status()).toBe(200);

    const product = await response.json();

    // Verify product structure
    expect(product).toHaveProperty("id");
    expect(product).toHaveProperty("name");
    expect(product).toHaveProperty("price");
    expect(product).toHaveProperty("description");

    // Verify product data
    expect(product.id).toBe(productId);
    expect(product.name).toBeTruthy();
    expect(product.price).toBeGreaterThan(0);
  });
});
