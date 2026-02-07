import { test, expect } from '@playwright/test';

test('sandbox login page loads', async ({ page }) => {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  const response = await page.goto('https://sandbox.cloudmantra.ai', { waitUntil: 'networkidle', timeout: 30000 });

  console.log('Status:', response.status());
  console.log('Page title:', await page.title());
  console.log('Console errors:', JSON.stringify(errors, null, 2));

  // Check if React rendered anything
  const rootContent = await page.locator('#root').innerHTML();
  console.log('Root content length:', rootContent.length);
  console.log('Root has children:', rootContent.length > 0);

  // Take screenshot
  await page.screenshot({ path: '/tmp/sandbox-screenshot.png', fullPage: true });
  console.log('Screenshot saved to /tmp/sandbox-screenshot.png');
});
