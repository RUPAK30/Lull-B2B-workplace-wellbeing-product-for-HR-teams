import { test, expect } from '@playwright/test';
// Insights, the private activity log, the closing question and experiment overrides.
const ready = async page => { await expect(page.locator('#mode')).toHaveText('MOCK · NO MODEL CALLS'); };
const send = async (page, text) => { await page.locator('#message').fill(text); await page.locator('#send').click(); await expect(page.locator('#pending')).toBeHidden(); };
async function fresh(page, extra = {}) {
  await page.addInitScript(x => { if (!sessionStorage.getItem('sw.seeded')) { localStorage.clear(); localStorage.setItem('sw.prefs', JSON.stringify({ ready: false, readySet: true })); localStorage.setItem('sw.exp.home-quick', 'A'); for (const [k, v] of Object.entries(x)) localStorage.setItem(k, v); sessionStorage.setItem('sw.seeded', '1'); } }, extra);
  await page.goto('/'); await ready(page);
}
async function quickSession(page) {
  await send(page, 'my wrists ache from typing');
  await send(page, 'I have been sitting all day');
  await page.getByRole('button', { name: /^Gentle mobility/ }).click();
  for (let i = 0; i < 4; i++) {
    await page.getByRole('button', { name: 'Start simulation', exact: true }).click(); await page.getByRole('button', { name: 'Simulate finish', exact: true }).click();
    await page.getByRole('button', { name: /Next movement|Wind down/ }).click();
  }
}
const openInsights = async page => { await page.locator('#menu').click(); await page.getByRole('tab', { name: 'Developer' }).click(); await page.locator('#open-insights').click(); await expect(page.locator('#insights')).toBeVisible(); };

test('a real session shows up in Insights: funnel, need, route, feeling and the unmatched request', async ({ page }) => {
  await fresh(page); await quickSession(page);
  await expect(page.locator('.feeling-q')).toHaveText('How did that feel?');
  await page.getByRole('button', { name: 'Lighter' }).click(); await expect(page.locator('.feeling-thanks')).toBeVisible();
  await page.locator('#next').click(); await expect(page.locator('#next')).toHaveText('Done for today');
  await openInsights(page);
  await expect(page.locator('.ins-source')).toContainText('this device only');
  await expect(page.locator('.ins-tile').first()).toContainText('1');
  await expect(page.locator('.ins-card').first().locator('.bar-value')).toHaveText([/^1/, /^1/, /^1/, /^1/]);
  await expect(page.locator('.ins-gaps')).toContainText('my wrists ache from typing');
  await expect(page.locator('.ins-card', { hasText: 'What people asked for' })).toContainText('a lot of sitting');
  await expect(page.locator('.ins-card', { hasText: 'How it felt afterwards' })).toContainText('Lighter');
  await page.keyboard.press('Escape'); await expect(page.locator('#insights')).toBeHidden();
});

test('sample data is labelled synthetic and the experiment readout states its uncertainty', async ({ page }) => {
  await fresh(page); await openInsights(page);
  await page.getByText('Sample data').click();
  await expect(page.locator('.ins-source')).toContainText('Synthetic sample');
  const quick = page.locator('.ins-card', { hasText: 'Experiment: Quick picks on the home screen' });
  await expect(quick.locator('.ins-legend')).toContainText('A · Quick picks shown');
  await expect(quick.locator('.ins-verdict')).toContainText('95% range');
  await quick.locator('summary').click(); await expect(quick.locator('table')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Clear log' })).toHaveCount(0);
});

test('turning the activity log off removes the closing question and records nothing', async ({ page }) => {
  await fresh(page, { 'sw.analytics': 'off' }); await quickSession(page);
  await expect(page.locator('.feeling')).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('sw.events'))).toBeNull();
});

test('experiment override: variant B of the home test shows the guided start only', async ({ page }) => {
  await fresh(page); await expect(page.locator('.quick')).toHaveCount(3);
  await page.locator('#menu').click(); await page.getByRole('tab', { name: 'Developer' }).click();
  await page.locator('#exp-home-quick').selectOption('B'); await page.locator('#close-drawer').click();
  await expect(page.locator('.quick')).toHaveCount(0); await expect(page.locator('#workout')).toBeVisible();
});
