import { test, expect } from '@playwright/test';
test('discovery, court filtering, saving and map fallback', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/'); await expect(page.getByRole('heading', { name: /Find your people/ })).toBeVisible();
  await page.goto('/courts'); await page.getByRole('button', { name: 'Tennis', exact: true }).click();
  await expect(page.locator('.court-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Save Greenline Tennis Club', exact: true }).click();
  await page.goto('/profile'); await expect(page.locator('.court-card')).toHaveCount(1);
  await page.reload(); await expect(page.locator('.court-card')).toHaveCount(1);
  await page.goto('/courts'); await page.getByRole('button', { name: 'Map', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Open Google Maps', exact: true })).toBeVisible();
  await expect(page.locator('.court-card')).toHaveCount(6);
  await page.getByLabel('Search courts').fill('does not exist'); await expect(page.getByRole('heading', { name: 'No matches just yet.' })).toBeVisible();
  expect(errors).toEqual([]);
});
test('join, refresh, leave and host a game', async ({ page }) => {
  await page.goto('/games/after-work'); await page.getByRole('button', { name: 'Join this game' }).click();
  await expect(page.getByText('You’re on the team')).toBeVisible(); await page.reload(); await expect(page.getByText('You’re on the team')).toBeVisible();
  await page.goto('/my-games'); await expect(page.getByRole('heading', { name: 'After-work shuttle session', exact: true })).toBeVisible();
  await page.goto('/games/after-work'); await page.getByRole('button', { name: 'Leave game' }).click(); await expect(page.getByRole('button', { name: 'Join this game' })).toBeEnabled();
  await page.goto('/games/new'); await page.getByLabel('Give your game a name').fill('Browser test doubles');
  const next = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  await page.getByLabel('Start date & time').fill(`${next}T18:00`);
  await page.getByLabel('What should your players know?').fill('Friendly doubles. Bring your racket.');
  await page.getByRole('button', { name: 'Create game', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Browser test doubles' })).toBeVisible(); await expect(page.getByText('You’re hosting this game')).toBeVisible();
  await page.getByRole('link', { name: 'Edit game', exact: true }).click(); await page.getByLabel('Give your game a name').fill('Updated doubles'); await page.getByRole('button', { name: 'Save game', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Updated doubles' })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel game', exact: true }).click(); await page.getByRole('button', { name: 'Yes, cancel game' }).click(); await expect(page.getByText('This game has been cancelled by the host.')).toBeVisible();
});
test('connection requests and editable demo profiles', async ({ page }) => {
  await page.goto('/players/maya'); await page.getByRole('button', { name: 'Connect', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Requested · Cancel' })).toBeVisible();
  await page.goto('/profile'); await page.getByLabel('Demo player', { exact: true }).selectOption('maya');
  await page.goto('/players/you'); await page.getByRole('button', { name: 'Accept request' }).click(); await expect(page.getByRole('button', { name: 'Connected · Remove' })).toBeVisible();
  await page.goto('/profile'); await page.getByLabel('Display name').fill('Maya Sports'); await page.getByRole('button', { name: 'Save profile' }).click(); await page.reload(); await expect(page.getByLabel('Display name')).toHaveValue('Maya Sports');
});
test('API boundary rejects unsupported and invalid requests', async ({ request }) => {
  expect((await request.get('/api/sandbox/courts')).status()).toBe(404);
  expect((await request.get('/api/sandbox/zones?limit=500')).status()).toBe(400);
  expect((await request.get('/api/sandbox/zones')).status()).toBe(503);
  const config = await request.get('/api/connection'); expect((await config.json()).configured).toBe(false);
});
test('reference data pagination and rate-limit retry are visible', async ({ page }) => {
  await page.route('**/api/connection', route => route.fulfill({ json: { configured: true, mapsConfigured: false } }));
  let calls = 0;
  await page.route('**/api/sandbox/zones*', route => {
    calls++;
    if (calls === 1) return route.fulfill({ status: 429, json: { message: 'Please wait before retrying.', code: 'SANDBOX_RATE_LIMITED', retryAfterSeconds: 1 } });
    const offset = new URL(route.request().url()).searchParams.get('offset');
    return route.fulfill({ json: offset === '0' ? Array.from({ length: 200 }, (_, i) => ({ zoneCode: `Z${i}`, nameMs: 'Example reference' })) : [{ zoneCode: 'LAST', nameMs: 'Last reference' }] });
  });
  await page.goto('/connection'); await page.getByRole('button', { name: 'Load live reference data' }).click();
  await expect(page.getByRole('main').getByRole('alert')).toHaveText('Please wait before retrying.');
  await expect(page.getByRole('button', { name: /Retry in/ })).toBeDisabled();
  await page.getByRole('button', { name: 'Load live reference data' }).click();
  await expect(page.getByText('Rebana API · 201 records', { exact: true })).toBeVisible();
  await expect(page.locator('pre')).toContainText('LAST'); expect(calls).toBe(3);
});
test('location denial keeps manual search working', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(navigator, 'geolocation', { value: { getCurrentPosition: (_success: unknown, failure: (e: object) => void) => failure({ code: 1 }) } }); });
  await page.goto('/courts'); await page.getByRole('button', { name: 'Use my location' }).click();
  await expect(page.getByText('Couldn’t get your location. Please select an area.')).toBeVisible();
  await page.getByLabel('Search location').selectOption('Petaling Jaya'); await expect(page.locator('.court-card')).toHaveCount(6);
});
test('mobile layouts fit and main screens render', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ['/', '/courts', '/games', '/games/new', '/community', '/profile', '/games/after-work', '/courts/rally', '/connection']) {
    await page.goto(route); await expect(page.locator('main h1').first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), route).toBe(true);
  }
  await page.goto('/'); await page.screenshot({ path: 'artifacts/sportbuddy-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 }); await page.screenshot({ path: 'artifacts/sportbuddy-desktop.png', fullPage: true });
});
