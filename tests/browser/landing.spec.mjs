import { test, expect } from '@playwright/test';
// The page for teams, and the employer view it links to.
test('landing page: clear offer, real screenshots, honest prototype notes, and it links into the app', async ({ page }) => {
  const missing = []; page.on('response', r => { if (r.status() >= 400) missing.push(r.url()); });
  await page.goto('/teams');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Three minutes between meetings. No app to learn.');
  for (const img of await page.locator('img').all()) { await img.scrollIntoViewIfNeeded(); await expect.poll(() => img.evaluate(i => i.complete && i.naturalWidth > 0)).toBe(true); }
  expect(missing).toEqual([]);
  await expect(page.locator('footer')).toContainText('made-up sample data');
  await expect(page.locator('#pilot .l-note')).toContainText('doesn’t send anything');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('link', { name: 'Try a session now' }).click();
  await expect(page.locator('#mode')).toHaveText('MOCK · NO MODEL CALLS');
});

test('pilot form: checks the fields, then says plainly that nothing was sent', async ({ page }) => {
  await page.goto('/teams');
  // Only data leaving the page matters here, not images loading as the page scrolls.
  const requests = []; page.on('request', r => { if (r.method() !== 'GET' || r.url().includes('/api/')) requests.push(r.method() + ' ' + r.url()); });
  await page.getByRole('button', { name: 'Request a pilot' }).click();
  await expect(page.locator('#p-error')).toHaveText('Please add your name.');
  await page.getByLabel('Your name').fill('Asha Rao');
  await page.getByLabel('Work email').fill('not-an-email');
  await page.getByRole('button', { name: 'Request a pilot' }).click();
  await expect(page.locator('#p-error')).toContainText('work email');
  await expect(page.getByLabel('Work email')).toHaveAttribute('aria-invalid', 'true');
  await page.getByLabel('Work email').fill('asha@example.com');
  await page.getByLabel('Company').fill('Example Labs');
  await page.getByRole('button', { name: 'Request a pilot' }).click();
  await expect(page.locator('#p-done')).toContainText('Thanks, Asha.');
  await expect(page.locator('#p-done')).toContainText('didn’t send or save anything');
  expect(requests).toEqual([]);
});

test('team view: opened from the landing page, totals only, small teams hidden', async ({ page }) => {
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

test('safety and limits page: reachable from the landing page and the app, and honest about what is pending', async ({ page }) => {
  await page.goto('/teams');
  await page.getByRole('link', { name: /Read the full safety and limits page/ }).click();
  await expect(page).toHaveURL(/\/safety$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('What Lull does, and what it doesn’t.');
  await expect(page.locator('.s-pending')).toHaveCount(7);
  await expect(page.locator('#access')).toContainText('Not done yet');
  await expect(page.locator('.l-note')).toContainText('can miss unusual wording');
  await page.goto('/');
  await page.locator('#menu').click(); await page.getByRole('tab', { name: 'Settings' }).click();
  await expect(page.getByRole('link', { name: 'Safety and limits' })).toHaveAttribute('href', '/safety');
});

test('reminder concept is labelled as not built, and the pilot plan downloads as a PDF', async ({ page }) => {
  await page.goto('/teams');
  await expect(page.locator('#reminders')).toContainText('It isn’t built yet.');
  await expect(page.locator('#reminders img')).toHaveAttribute('alt', /^Concept:/);
  const download = page.getByRole('link', { name: 'Download the one-page pilot plan (PDF)' });
  const response = await page.request.get(await download.getAttribute('href'));
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toBe('application/pdf');
  expect((await response.body()).subarray(0, 5).toString()).toBe('%PDF-');
});
