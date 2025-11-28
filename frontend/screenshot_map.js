const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  // Capture console logs
  page.on('console', msg => console.log('BROWSER:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  console.log('Navigating directly to Supply Chain Map...');

  // Try navigating directly to the Supply Chain Map route
  await page.goto('http://localhost:3003/stox');
  await page.waitForTimeout(5000);

  await page.screenshot({ path: '/tmp/screenshot_stox.png', fullPage: true });
  console.log('STOX page screenshot saved to /tmp/screenshot_stox.png');

  // Try the supply chain map route directly
  await page.goto('http://localhost:3003/stox/supply-chain-map');
  await page.waitForTimeout(5000);

  await page.screenshot({ path: '/tmp/screenshot_supply_chain.png', fullPage: true });
  console.log('Supply Chain Map screenshot saved to /tmp/screenshot_supply_chain.png');

  await browser.close();
  console.log('Done!');
})();
