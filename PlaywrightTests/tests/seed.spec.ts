/**
 * seed.spec.ts
 *
 * Sets up shared authentication storage for all test suites.
 * Run this first (or as a global setup) to create storage state files
 * for learner, tutor, and admin roles.
 *
 * Usage: npx playwright test seed.spec.ts
 *
 * Credentials are read from environment variables:
 *   LEARNER_EMAIL / LEARNER_PASSWORD
 *   TUTOR_EMAIL   / TUTOR_PASSWORD
 *   ADMIN_EMAIL   / ADMIN_PASSWORD
 */

import { test as setup, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'https://speakoo.duckdns.org';

const STORAGE_DIR = path.join(__dirname, 'storage');

/**
 * Performs a localStorage-based login and saves the storage state.
 * Speakoo uses `speakoo_access_token` + `speakoo_user` in localStorage.
 */
async function loginAndSave(
  page: import('@playwright/test').Page,
  email: string,
  password: string,
  outputPath: string,
) {
  await page.goto(`${BASE_URL}/login`);
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /login|sign in/i }).click();

  // Wait until redirected away from /login
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15_000 });

  // Confirm storage keys are populated
  const token = await page.evaluate(() => localStorage.getItem('speakoo_access_token'));
  expect(token).toBeTruthy();

  await page.context().storageState({ path: outputPath });
}

setup.beforeAll(() => {
  if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR, { recursive: true });
});

setup('seed learner session', async ({ page }) => {
  const email = process.env.LEARNER_EMAIL ?? 'learner@speakoo.test';
  const password = process.env.LEARNER_PASSWORD ?? 'LearnerPass1!';
  await loginAndSave(page, email, password, path.join(STORAGE_DIR, 'learner-auth.json'));
});

setup('seed tutor session', async ({ page }) => {
  const email = process.env.TUTOR_EMAIL ?? 'tutor@speakoo.test';
  const password = process.env.TUTOR_PASSWORD ?? 'TutorPass1!';
  await loginAndSave(page, email, password, path.join(STORAGE_DIR, 'tutor-auth.json'));
});

setup('seed admin session', async ({ page }) => {
  const email = process.env.ADMIN_EMAIL ?? 'admin@speakoo.test';
  const password = process.env.ADMIN_PASSWORD ?? 'AdminPass1!';
  await loginAndSave(page, email, password, path.join(STORAGE_DIR, 'admin-auth.json'));
});
