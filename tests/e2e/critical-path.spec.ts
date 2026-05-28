import { test, expect } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';
import {
  E2E_ADMIN_EMAIL,
  E2E_ADMIN_PASSWORD,
  E2E_CATEGORY_NAME,
  E2E_CUSTOMER_EMAIL,
} from '../support/e2e-constants';

test('admin uploads product, customer checks out, email is sent, and order tracking works', async ({ page, request }) => {
  const productName = `E2E Zibara Critical Path ${Date.now()}`;
  const uploadedImageUrl = 'https://res.cloudinary.com/zibara-e2e/image/upload/v1/e2e-product.png';
  const imagePath = path.join(process.cwd(), 'public', 'zibara.png');

  await page.route('**/api/upload', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        url: uploadedImageUrl,
        publicId: 'zibara-e2e/e2e-product',
        format: 'png',
      }),
    });
  });
  await page.route('**/api/popup', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, popup: { enabled: false } }),
    });
  });

  const providersResponse = await request.get('/api/auth/providers');
  expect(providersResponse.ok()).toBeTruthy();

  await page.goto('/admin/login');
  await page.getByLabel('Email Address').fill(E2E_ADMIN_EMAIL);
  await page.getByLabel('Password').fill(E2E_ADMIN_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 30_000 });

  await page.goto('/admin/products/new');
  await expect(page.getByRole('heading', { name: /add product/i })).toBeVisible();
  await page.getByPlaceholder('e.g., CROCHET LACE ROMPER').fill(productName);
  await page.locator('input[type="number"]').first().fill('125');
  await page.locator('select').selectOption({ label: E2E_CATEGORY_NAME });
  await page.getByPlaceholder('Describe your product...').fill('End-to-end test garment for the Zibara checkout path.');
  await page.getByPlaceholder('e.g., 100% Premium Cotton Yarn').fill('Test silk crochet');

  const uploadResponse = page.waitForResponse((response) =>
    response.url().includes('/api/upload') && response.status() === 200,
  );
  await page.locator('input[type="file"]').setInputFiles(imagePath);
  await uploadResponse;
  await expect(page.getByAltText('Product image 1')).toBeVisible();

  await page.getByRole('button', { name: 'M', exact: true }).click();
  await page.getByPlaceholder('e.g., Hand wash cold').fill('Spot clean only.');
  await page.getByRole('button', { name: /create product/i }).click();
  await expect(page).toHaveURL(/\/admin\/products$/);
  await expect(page.locator('h3').filter({ hasText: productName })).toBeVisible();

  const productsResponse = await request.get('/api/admin/products');
  expect(productsResponse.ok()).toBeTruthy();
  const productsPayload = await productsResponse.json();
  const product = productsPayload.data.find((item: { name: string }) => item.name === productName);
  expect(product).toBeTruthy();
  expect(product.images[0]).toBe(uploadedImageUrl);

  await page.goto(`/product/${product._id}`);
  await expect(page.getByRole('heading', { name: productName })).toBeVisible();
  await page.getByRole('button', { name: 'M', exact: true }).click();
  await page.getByRole('button', { name: /add to bag/i }).click();
  await expect(page.getByRole('button', { name: /added to bag/i })).toBeVisible();

  await page.goto('/cart');
  await expect(page.getByText(productName).first()).toBeVisible();
  await page.getByRole('link', { name: /proceed to checkout/i }).click();
  await expect(page).toHaveURL(/\/checkout/);

  await page.locator('input[name="firstName"]').fill('Ada');
  await page.locator('input[name="lastName"]').fill('E2E');
  await page.locator('input[name="email"]').fill(E2E_CUSTOMER_EMAIL);
  await page.locator('input[name="phone"]').fill('+2348000000000');
  await page.locator('input[name="address"]').fill('1 Test Studio Lane');
  await page.locator('input[name="city"]').fill('Lagos');
  await page.locator('input[name="state"]').fill('Lagos');
  await page.locator('input[name="country"]').fill('Nigeria');
  await page.getByLabel(/e2e test checkout/i).check();

  await page.getByRole('button', { name: /place order/i }).click();
  await expect(page).toHaveURL(/\/order-confirmation/);
  await expect(page.getByRole('heading', { name: /order confirmed/i })).toBeVisible();
  await expect(page.getByText(productName).first()).toBeVisible();

  const orderLine = await page.getByText(/Order: CRL-/).textContent();
  const orderNumber = orderLine?.match(/CRL-[A-Z0-9-]+/)?.[0];
  expect(orderNumber).toBeTruthy();

  await page.locator('main').getByRole('link', { name: /track order/i }).click();
  await expect(page).toHaveURL(/\/order-tracking/);
  await page.getByRole('button', { name: /track order/i }).click();
  await expect(page.getByText(/Status:/)).toContainText('processing');
  await expect(page.getByText(/Payment:/)).toContainText('paid');
  await expect(page.getByText(productName).first()).toBeVisible();

  const emailArtifact = path.join(process.cwd(), '.test-artifacts', 'emails.jsonl');
  await expect.poll(async () => {
    const contents = await fs.readFile(emailArtifact, 'utf8').catch(() => '');
    return contents.includes(orderNumber as string) && contents.includes(E2E_CUSTOMER_EMAIL);
  }).toBeTruthy();
});
