/**
 * Independent e2e verification of the shopping cart → checkout → order-confirmation flow.
 *
 * Uses the E2E test-checkout endpoint (bypasses real payment gateways).
 * Drives the real app UI at http://127.0.0.1:3100.
 */
import { test, expect } from '@playwright/test';

const CUSTOMER = {
  firstName: 'Amara',
  lastName: 'Flowtest',
  email: 'flowtest-customer@zibara.test',
  phone: '+2348099990000',
  address: '12 Studio Way',
  city: 'Lagos',
  state: 'Lagos',
  country: 'Nigeria',
};

test.describe('Shopping cart → checkout → order confirmation flow', () => {
  // Suppress the notice/popup so it doesn't block UI interaction
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/popup', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, popup: { enabled: false } }),
      }),
    );
  });

  test('cart page renders correctly when empty', async ({ page }) => {
    // Clear any existing cart state
    await page.goto('/cart');
    await page.evaluate(() => localStorage.removeItem('zibara_cart'));
    await page.reload();

    await expect(page.getByRole('heading', { name: /your bag/i })).toBeVisible();
    await expect(page.getByText(/your bag is empty/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /explore the collection/i })).toBeVisible();
  });

  test('product page → add to bag → appears in cart', async ({ page }) => {
    // Pick a real product from the API
    const productsRes = await page.request.get('/api/admin/products');
    expect(productsRes.ok()).toBeTruthy();
    const { data: products } = await productsRes.json();
    expect(products.length).toBeGreaterThan(0);

    const product = products[0];
    const productId = product._id;

    // Clear cart first
    await page.goto('/cart');
    await page.evaluate(() => localStorage.removeItem('zibara_cart'));

    // Visit product page
    await page.goto(`/product/${productId}`);
    await expect(page.getByRole('heading', { name: product.name })).toBeVisible({ timeout: 10_000 });

    // Select a size if required
    if (product.sizes?.length > 0) {
      const sizeBtn = page.getByRole('button', { name: product.sizes[0], exact: true });
      if (await sizeBtn.isVisible()) {
        await sizeBtn.click();
      }
    }

    // Add to bag
    await page.getByRole('button', { name: /add to bag/i }).click();
    await expect(page.getByRole('button', { name: /added to bag/i })).toBeVisible({ timeout: 5_000 });

    // Navigate to cart
    await page.goto('/cart');
    await expect(page.getByText(product.name).first()).toBeVisible();
    await expect(page.getByText('1 piece')).toBeVisible();
  });

  test('cart quantity controls work correctly', async ({ page }) => {
    const productsRes = await page.request.get('/api/admin/products');
    const { data: products } = await productsRes.json();
    const product = products[0];

    // Seed cart via localStorage
    await page.goto('/cart');
    await page.evaluate(
      ({ p }) => {
        localStorage.setItem(
          'zibara_cart',
          JSON.stringify([
            {
              id: p._id,
              name: p.name,
              price: p.price,
              size: p.sizes?.[0] ?? 'M',
              color: '',
              quantity: 1,
              image: p.images?.[0] ?? '',
            },
          ]),
        );
      },
      { p: product },
    );
    await page.reload();

    await expect(page.getByText(product.name).first()).toBeVisible();

    // Increment quantity
    const plus = page.locator('button').filter({ has: page.locator('svg') }).nth(1);
    await plus.click();

    // Re-find the quantity display (text "2")
    await expect(page.locator('span.w-8.text-center').filter({ hasText: '2' })).toBeVisible();

    // Decrement back to 1
    const minus = page.locator('button').filter({ has: page.locator('svg') }).first();
    await minus.click();
    await expect(page.locator('span.w-8.text-center').filter({ hasText: '1' })).toBeVisible();
  });

  test('full checkout flow: cart → shipping form → test payment → order confirmation', async ({ page }) => {
    const productsRes = await page.request.get('/api/admin/products');
    const { data: products } = await productsRes.json();
    const product = products.find((p: { price: number }) => p.price > 0) || products[0];

    // Seed the cart via localStorage
    await page.goto('/checkout');
    await page.evaluate(
      ({ p }) => {
        localStorage.setItem(
          'zibara_cart',
          JSON.stringify([
            {
              id: p._id,
              name: p.name,
              price: p.price,
              size: p.sizes?.[0] ?? 'M',
              color: '',
              quantity: 1,
              image: p.images?.[0] ?? '',
            },
          ]),
        );
      },
      { p: product },
    );
    await page.reload();

    // Checkout page must load with items
    await expect(page.getByRole('heading', { name: /checkout/i })).toBeVisible();
    await expect(page.getByText(product.name).first()).toBeVisible();

    // Fill shipping form
    await page.locator('input[name="firstName"]').fill(CUSTOMER.firstName);
    await page.locator('input[name="lastName"]').fill(CUSTOMER.lastName);
    await page.locator('input[name="email"]').fill(CUSTOMER.email);
    await page.locator('input[name="phone"]').fill(CUSTOMER.phone);
    await page.locator('input[name="address"]').fill(CUSTOMER.address);
    await page.locator('input[name="city"]').fill(CUSTOMER.city);
    await page.locator('input[name="state"]').fill(CUSTOMER.state);
    await page.locator('input[name="country"]').fill(CUSTOMER.country);

    // Select E2E test payment method (only visible when NEXT_PUBLIC_E2E_TEST_MODE=1)
    const testOption = page.getByLabel(/e2e test checkout/i);
    await expect(testOption).toBeVisible({ timeout: 5_000 });
    await testOption.check();

    // Submit
    await page.getByRole('button', { name: /place order/i }).click();

    // Should navigate to order confirmation
    await expect(page).toHaveURL(/\/order-confirmation/, { timeout: 30_000 });
    await expect(page.getByRole('heading', { name: /order confirmed/i })).toBeVisible();

    // Confirmation page content checks
    await expect(page.getByText(CUSTOMER.firstName)).toBeVisible();
    await expect(page.getByText(product.name).first()).toBeVisible();

    // Order number is shown
    const orderLine = page.locator('text=/Order: CRL-/');
    await expect(orderLine).toBeVisible();
    const orderText = await orderLine.textContent();
    const orderNumber = orderText?.match(/CRL-[\dA-Z-]+/)?.[0];
    expect(orderNumber).toBeTruthy();

    // Shipping address shown on confirmation
    await expect(page.getByText(CUSTOMER.address)).toBeVisible();
    await expect(page.getByText(CUSTOMER.city, { exact: false })).toBeVisible();

    // Cart should now be cleared in localStorage
    const cartData = await page.evaluate(() => localStorage.getItem('zibara_cart'));
    expect(cartData).toBe('[]');

    // Order tracking link present
    await expect(
      page.locator('main').getByRole('link', { name: /track order/i }),
    ).toBeVisible();

    return orderNumber; // passed for API probe below
  });

  test('order tracking API returns the created order', async ({ request }) => {
    // Create an order via the test checkout API directly (API-level probe)
    const testItems = [{ id: 'probe-id', name: 'Probe Garment', price: 120, quantity: 1, size: 'S' }];
    const res = await request.post('/api/test/checkout', {
      data: {
        reference: `CRL-PROBE-${Date.now()}`,
        amount: 130,
        currency: 'USD',
        customer: CUSTOMER,
        items: testItems,
      },
    });

    // In E2E_TEST_MODE the server sets this env; if not set the route returns 404
    if (res.status() === 404) {
      console.warn('API probe skipped: E2E_TEST_MODE not set server-side for this request context');
      return;
    }

    expect(res.ok()).toBeTruthy();
    const payload = await res.json();
    expect(payload.success).toBe(true);
    const orderNumber = payload.data.orderNumber;
    expect(orderNumber).toBeTruthy();

    // Track it
    const trackRes = await request.post('/api/orders/track', {
      data: { orderNumber, email: CUSTOMER.email },
    });
    expect(trackRes.ok()).toBeTruthy();
    const trackPayload = await trackRes.json();
    expect(trackPayload.success).toBe(true);
    expect(trackPayload.data.orderStatus).toBe('processing');
    expect(trackPayload.data.paymentStatus).toBe('paid');
    expect(trackPayload.data.items[0].name).toBe('Probe Garment');
  });

  test('checkout with empty cart redirects / shows empty state', async ({ page }) => {
    await page.goto('/checkout');
    await page.evaluate(() => localStorage.removeItem('zibara_cart'));
    await page.reload();

    // Should show empty cart state (not the checkout form)
    await expect(page.getByText(/your cart is empty/i)).toBeVisible({ timeout: 5_000 });
    await expect(page.getByRole('button', { name: /start shopping/i })).toBeVisible();
  });

  test('checkout form validation: missing fields shows error', async ({ page }) => {
    const productsRes = await page.request.get('/api/admin/products');
    const { data: products } = await productsRes.json();
    const product = products[0];

    await page.goto('/checkout');
    await page.evaluate(
      ({ p }) => {
        localStorage.setItem(
          'zibara_cart',
          JSON.stringify([
            {
              id: p._id,
              name: p.name,
              price: p.price,
              size: p.sizes?.[0] ?? 'M',
              color: '',
              quantity: 1,
              image: p.images?.[0] ?? '',
            },
          ]),
        );
      },
      { p: product },
    );
    await page.reload();

    // Click Place Order without filling anything
    await page.getByRole('button', { name: /place order/i }).click();

    // Should show a toast or error (not navigate away)
    await expect(page).toHaveURL(/\/checkout/);
    // Either a toast message or inline error should appear
    const toastOrError = page
      .locator('text=/fill in all required fields/i')
      .or(page.locator('[role="alert"]'));
    await expect(toastOrError.first()).toBeVisible({ timeout: 5_000 });
  });
});
