/**
 * auth/logout.spec.ts – TC-AUTH-08
 * Tests that logout clears session and protects routes.
 */

import { test, expect } from '@playwright/test';
import path from 'path';

const BASE_URL = 'https://speakoo.duckdns.org';
const LEARNER_AUTH = path.join(__dirname, '..', 'storage', 'learner-auth.json');

test.use({ storageState: LEARNER_AUTH });

// ─── TC-AUTH-08 ───────────────────────────────────────────────────────────────
test('TC-AUTH-08: logout clears session and protects dashboard', async ({ page }) => {
  await page.goto(`${BASE_URL}/dashboard`);
  // Confirm authenticated
  await expect(page).toHaveURL(/\/dashboard/);

  // Find and click logout
  const logoutBtn = page
    .getByRole('button', { name: /logout|sign out/i })
    .or(page.getByText(/logout|sign out/i));
  await logoutBtn.first().click();

  // Should be redirected away from dashboard
  await expect(page).toHaveURL(/\/(login|$)/, { timeout: 10_000 });

  // Verify localStorage tokens are cleared
  const token = await page.evaluate(() => localStorage.getItem('speakoo_access_token'));
  const user = await page.evaluate(() => localStorage.getItem('speakoo_user'));
  expect(token).toBeNull();
  expect(user).toBeNull();

  // Accessing /dashboard now redirects to login
  await page.goto(`${BASE_URL}/dashboard`);
  await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
});
