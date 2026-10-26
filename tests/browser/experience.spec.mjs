import { test, expect } from '@playwright/test';
// The product shell: home, drawer, settings, focus mode, keyboard, countdown, pacer, overview, memory.
const ready = async page => { await expect(page.locator('#mode')).toHaveText('MOCK · NO MODEL CALLS'); };
const send = async (page, text) => { await page.locator('#message').fill(text); await page.locator('#send').click(); await expect(page.locator('#pending')).toBeHidden(); };
async function fresh(page, prefs = { ready: false }) { await page.addInitScript(p => { if (!sessionStorage.getItem('sw.seeded')) { localStorage.clear(); localStorage.setItem('sw.prefs', JSON.stringify({ ...p, readySet: true })); localStorage.setItem('sw.exp.home-quick', 'A'); sessionStorage.setItem('sw.seeded', '1'); } }, prefs); await page.goto('/'); await ready(page); }

test('home offers one clear way in, quick picks with real durations, and accepts a typed need', async ({ page }) => {
  await fresh(page);
  await expect(page.locator('.home-title')).toHaveText('Between calls? Take three minutes.');
  await expect(page.locator('#workout')).toHaveText('Start with Lull');
  await expect(page.locator('.quick')).toHaveText([/After back-to-back calls.*Unknot neck & shoulders · 2:30/, /Stiff from sitting.*Undo the sitting · 2:40/, /Post-lunch slump.*Energy lift · 2:25/, /Stressed, can’t switch off.*Calm down · 2:30/, /Tired eyes and wrists.*Screen break · 2:30/]);
  await expect(page.locator('#pause')).toBeHidden();
  await send(page, 'I only have five minutes before my next call');
  await expect(page.locator('#screen')).toContainText('Try: Unknot neck & shoulders');
  await page.getByRole('button', { name: 'Start seated · 2:30' }).click();
  await expect(page.locator('.workout-count')).toHaveText('Step 1 of 4');
});

test('menu drawer: tabs, Escape to close, and evening mode that persists', async ({ page }) => {
  await fresh(page);
  await page.locator('#menu').click(); await expect(page.locator('#drawer')).toBeVisible();
  await expect(page.locator('#menu')).toHaveAttribute('aria-expanded', 'true');
  await page.getByRole('tab', { name: 'Settings' }).click(); await expect(page.locator('#panel-settings')).toBeVisible();
  await page.getByText('Evening', { exact: true }).click(); await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.keyboard.press('Escape'); await expect(page.locator('#drawer')).toBeHidden();
  await page.reload(); await ready(page); await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.locator('#theme').click(); await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'dark');
});

test('optional 3-2-1 get-ready: a countdown on the dial, cancellable, never auto-starting the next timer', async ({ page }) => {
  await page.clock.install(); await fresh(page, { ready: true });
  await send(page, '/reset unknot seated'); await page.locator('#next').click();
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await expect(page.locator('.dial-count')).toHaveText('3'); await expect(page.getByRole('button', { name: 'Cancel countdown' })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel countdown' }).click(); await expect(page.locator('.timer-status')).toHaveText('stopped'); await expect(page.locator('.dial-count')).toBeEmpty();
  await page.getByRole('button', { name: 'Start', exact: true }).click(); await page.clock.fastForward(3200);
  await expect(page.locator('.timer-status')).toHaveText('running');
  await page.clock.fastForward(41000); await expect(page.locator('.timer-status')).toHaveText('done');
  await page.getByRole('button', { name: 'Next step →' }).click(); await expect(page.locator('.timer-status')).toHaveText('stopped');
});

test('keyboard: Space starts and pauses the timer, arrows move; focus mode quiets everything else', async ({ page }) => {
  await fresh(page); await send(page, '/reset unknot seated'); await page.locator('#next').click();
  await expect(page.locator('.workout-count')).toHaveText('Step 1 of 4'); await page.locator('#screen').focus();
  await page.keyboard.press('Space'); await expect(page.locator('.timer-status')).toHaveText('running');
  await expect(page.locator('body')).toHaveAttribute('data-phase', 'focus');
  await expect(page.locator('#composer')).toBeHidden(); // the stage's own "Tell Lull" is the way to talk here
  await page.keyboard.press('Space'); await expect(page.locator('.timer-status')).toHaveText('paused');
  await page.keyboard.press('ArrowRight'); await expect(page.locator('.workout-count')).toHaveText('Step 2 of 4');
  await page.keyboard.press('ArrowLeft'); await expect(page.locator('.workout-count')).toHaveText('Step 1 of 4');
});

test('breathing steps pace the breath from the real timer; the overview lists and jumps between steps', async ({ page }) => {
  await page.clock.install(); await fresh(page); await send(page, '/reset unknot seated'); await page.locator('#next').click();
  await page.locator('.workout-progress').click(); await expect(page.locator('.workout-sheet')).toBeVisible();
  await expect(page.locator('.sheet-item')).toHaveCount(4); await expect(page.locator('.sheet-item').nth(3)).toContainText('Long exhale');
  await page.locator('.sheet-item').nth(3).click(); await expect(page.locator('.workout-count')).toHaveText('Step 4 of 4');
  await page.getByRole('button', { name: 'Start', exact: true }).click(); await page.clock.fastForward(1000);
  await expect(page.locator('.dial-breath')).toHaveText('Breathe in'); await page.clock.fastForward(4000);
  await expect(page.locator('.dial-breath')).toHaveText('Breathe out');
});

test('remember me is opt-in, offers the last reset on return, and forgets on request', async ({ page }) => {
  await fresh(page);
  await expect(page.locator('.quick.again')).toHaveCount(0);
  await page.locator('#menu').click(); await page.getByRole('tab', { name: 'Settings' }).click(); await page.locator('label.toggle', { hasText: 'Remember me here' }).click(); await page.locator('#close-drawer').click();
  await page.locator('.quick', { hasText: 'Post-lunch slump' }).click();
  await expect(page.locator('#screen')).toContainText('Energy lift · Standing');
  await page.reload(); await ready(page);
  await expect(page.locator('.quick.again')).toContainText('Energy lift · Standing');
  await page.locator('#menu').click(); await page.getByRole('tab', { name: 'Settings' }).click(); await page.locator('#forget').click(); await page.locator('#close-drawer').click();
  await expect(page.locator('.quick.again')).toHaveCount(0);
});

test('installable: manifest, icons and a service worker allowed to control the app', async ({ page, request }) => {
  await fresh(page);
  const manifest = await request.get('/web/manifest.webmanifest'); expect(manifest.headers()['content-type']).toContain('application/manifest+json');
  expect((await manifest.json()).short_name).toBe('Lull');
  for (const icon of ['/web/icon-192.png', '/web/icon-512.png']) expect((await request.get(icon)).headers()['content-type']).toBe('image/png');
  expect((await request.get('/web/sw.js')).headers()['service-worker-allowed']).toBe('/');
  await expect.poll(() => page.evaluate(async () => !!(await navigator.serviceWorker.getRegistration('/')))).toBe(true);
});
