import { test, expect } from '@playwright/test';
// The page for teams inside the local app, and the employer view it links to.
test('page for teams: the same promise as the HR site, honest notes, and it leads into a reset', async ({ page }) => {
  const missing = []; page.on('response', r => { if (r.status() >= 400) missing.push(r.url()); });
  await page.goto('/teams');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('A 3-minute movement reset for teams stuck in back-to-back calls.');
  expect(missing).toEqual([]);
  await expect(page.locator('main')).not.toContainText(/workout|cardio|mobility|gentle|steady/i);
  await expect(page.locator('footer')).toContainText('made-up sample data');
  await expect(page.locator('footer')).toContainText('not a medical or mental-health service');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('link', { name: 'Try a reset now' }).click();
  await expect(page.locator('#mode')).toHaveText('MOCK · NO MODEL CALLS');
  await expect(page.locator('.home-title')).toHaveText('Between calls? Take three minutes.');
});

test('team view: opened from the page for teams, totals only, small teams hidden', async ({ page }) => {
  await page.goto('/teams');
  await page.getByRole('link', { name: 'Open the team view (sample data)' }).click();
  await expect(page.locator('#insights')).toBeVisible();
  await expect(page.locator('.ins-title h2')).toHaveText('Team view');
  await expect(page.locator('.ins-source')).toContainText('made-up 64-person company');
  await expect(page.locator('.ins-rule')).toContainText('never shows');
  await expect(page.locator('.team-row.hidden-row')).toHaveCount(2);
  await expect(page.locator('.team-row', { hasText: 'Customer support' })).toContainText('Fewer than 10 people');
  await expect(page.locator('#insights')).not.toContainText(/team-[a-z]{3}-\d/);
  await expect(page).toHaveURL(/\/$/);
});

test('safety and limits page: reachable from the page for teams and the app, and honest about what is pending', async ({ page }) => {
  await page.goto('/teams');
  await page.getByRole('link', { name: /Read the safety and limits page/ }).click();
  await expect(page).toHaveURL(/\/safety$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('What Lull does, and what it doesn’t.');
  await expect(page.locator('.s-pending')).toHaveCount(11);
  await expect(page.locator('#access')).toContainText('Not done yet');
  await expect(page.locator('.l-note')).toContainText('can miss unusual wording');
  await page.goto('/');
  await page.locator('#menu').click(); await page.getByRole('tab', { name: 'Settings' }).click();
  await expect(page.getByRole('link', { name: 'Safety and limits' })).toHaveAttribute('href', '/safety');
});

test('the pilot proposal downloads as a PDF', async ({ page }) => {
  await page.goto('/teams');
  const download = page.getByRole('link', { name: 'Download the pilot proposal (PDF)' });
  const response = await page.request.get(await download.getAttribute('href'));
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toBe('application/pdf');
  expect((await response.body()).subarray(0, 5).toString()).toBe('%PDF-');
});
