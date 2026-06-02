/**
 * auth/login.spec.ts – TC-AUTH-01 to TC-AUTH-07, TC-A11Y-01
 * Tests for authentication flows: login, validation, social buttons,
 * unauthenticated redirects, OTP verification, and keyboard navigation.
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'https://speakoo.duckdns.org';

// ─── TC-AUTH-05 ───────────────────────────────────────────────────────────────
test('TC-AUTH-05: welcome page loads and shows login entry point', async ({ page }) => {
  await page.goto(BASE_URL);
  await expect(page).toHaveTitle(/Speakoo/i);
  // At least one link/button that leads to login
  const loginLink = page.getByRole('link', { name: /login|sign in|get started/i }).first();
  await expect(loginLink).toBeVisible();
  await loginLink.click();
  await expect(page).toHaveURL(/\/login/);
});

// ─── TC-AUTH-01 ───────────────────────────────────────────────────────────────
test('TC-AUTH-01: login page loads with required fields', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);
  await expect(page.getByLabel(/email/i)).toBeVisible();
  await expect(page.getByLabel(/password/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /login|sign in/i })).toBeVisible();
});

// ─── TC-AUTH-04 ───────────────────────────────────────────────────────────────
test('TC-AUTH-04: Google social login button is visible', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);
  const googleBtn = page.getByRole('button', { name: /google/i }).or(
    page.locator('[aria-label*="Google"]'),
  );
  await expect(googleBtn.first()).toBeVisible();
});

// ─── TC-AUTH-03 ───────────────────────────────────────────────────────────────
test('TC-AUTH-03: login with empty fields shows validation errors', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);
  await page.getByRole('button', { name: /login|sign in/i }).click();
  // Should remain on login page
  await expect(page).toHaveURL(/\/login/);
  // At least one validation message or the fields should be invalid
  const emailField = page.getByLabel(/email/i);
  const isEmailInvalid = await emailField.evaluate(
    (el: HTMLInputElement) => !el.validity.valid,
  );
  expect(isEmailInvalid).toBeTruthy();
});

// ─── TC-AUTH-02 ───────────────────────────────────────────────────────────────
test('TC-AUTH-02: login with invalid credentials shows error', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);
  await page.getByLabel(/email/i).fill('wronguser@example.com');
  await page.getByLabel(/password/i).fill('WrongPass123!');
  await page.getByRole('button', { name: /login|sign in/i }).click();

  // Remain on login page
  await expect(page).toHaveURL(/\/login/);

  // Error message should appear
  const errorMsg = page
    .getByText(/invalid|incorrect|not found|wrong/i)
    .or(page.locator('[role="alert"]'));
  await expect(errorMsg.first()).toBeVisible({ timeout: 8_000 });
});

// ─── TC-AUTH-06 ───────────────────────────────────────────────────────────────
test('TC-AUTH-06: unauthenticated access to /dashboard redirects to /login', async ({ page }) => {
  await page.goto(`${BASE_URL}/dashboard`);
  await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
});

test('TC-AUTH-06b: unauthenticated access to /allTutors redirects to /login', async ({ page }) => {
  await page.goto(`${BASE_URL}/allTutors`);
  await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
});

// ─── TC-AUTH-07 ───────────────────────────────────────────────────────────────
test('TC-AUTH-07: email OTP verification page loads', async ({ page }) => {
  await page.goto(`${BASE_URL}/verify-email`);
  // OTP input should be visible
  const otpInput = page
    .getByLabel(/otp|code|verification/i)
    .or(page.locator('input[type="text"], input[type="number"]').first());
  await expect(otpInput.first()).toBeVisible();
});

test('TC-AUTH-07b: invalid OTP shows error message', async ({ page }) => {
  await page.goto(`${BASE_URL}/verify-email`);
  const otpInput = page
    .getByLabel(/otp|code/i)
    .or(page.locator('input[type="text"], input[type="number"]').first());
  await otpInput.first().fill('000000');
  await page.getByRole('button', { name: /verify|submit|confirm/i }).click();
  const errorMsg = page
    .getByText(/invalid|expired|wrong|incorrect/i)
    .or(page.locator('[role="alert"]'));
  await expect(errorMsg.first()).toBeVisible({ timeout: 8_000 });
});

// ─── TC-A11Y-01 ───────────────────────────────────────────────────────────────
test('TC-A11Y-01: login page keyboard navigation follows logical tab order', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);

  const emailField = page.getByLabel(/email/i);
  await emailField.focus();
  // Tab → password field
  await page.keyboard.press('Tab');
  const passwordField = page.getByLabel(/password/i);
  await expect(passwordField).toBeFocused();
  // Tab → login button
  await page.keyboard.press('Tab');
  const loginBtn = page.getByRole('button', { name: /login|sign in/i });
  await expect(loginBtn).toBeFocused();
});
