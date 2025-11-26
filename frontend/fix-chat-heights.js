const { chromium } = require('playwright');

async function fixChatHeights() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('\n=== Fixing Ask MARGEN page chat heights ===');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);

    // Navigate to Ask MARGEN - try different approaches
    const margenLinks = [
      'text=MARGEN.AI',
      'text=Ask MARGEN',
      '[href*="margen"]',
      'button:has-text("MARGEN")'
    ];

    let navigated = false;
    for (const selector of margenLinks) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          await element.click();
          await page.waitForTimeout(1500);
          navigated = true;
          console.log(`Navigated using: ${selector}`);
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }

    if (!navigated) {
      console.log('Could not navigate to MARGEN page, checking current page...');
    }

    // Get viewport height
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    console.log(`Viewport height: ${viewportHeight}px`);

    // Find and measure all key components
    const measurements = await page.evaluate(() => {
      const results = {};

      // Find header/top elements
      const header = document.querySelector('header') || document.querySelector('[role="banner"]');
      if (header) {
        const rect = header.getBoundingClientRect();
        results.headerHeight = rect.height;
      }

      // Find messages container
      const messagesContainer = document.querySelector('[data-messages-container="true"]');
      if (messagesContainer) {
        const rect = messagesContainer.getBoundingClientRect();
        const computed = window.getComputedStyle(messagesContainer);
        results.messagesContainer = {
          top: rect.top,
          height: rect.height,
          bottom: rect.bottom,
          computedMaxHeight: computed.maxHeight,
          computedPadding: computed.padding,
          computedPaddingBottom: computed.paddingBottom,
        };
      }

      // Find input area
      const input = document.querySelector('input[placeholder*="Ask"]') ||
                    document.querySelector('input[placeholder*="question"]') ||
                    document.querySelector('textarea[placeholder*="Ask"]');
      if (input) {
        const inputParent = input.closest('form') || input.closest('[elevation]') || input.parentElement?.parentElement;
        const rect = input.getBoundingClientRect();
        const parentRect = inputParent?.getBoundingClientRect();
        results.input = {
          top: rect.top,
          bottom: rect.bottom,
          visible: rect.bottom <= window.innerHeight && rect.top >= 0,
          parentHeight: parentRect?.height || 0,
          parentBottom: parentRect?.bottom || 0,
        };
      }

      // Find sample queries section if exists
      const sampleQueries = document.querySelector('[class*="sample"]');
      if (sampleQueries) {
        const rect = sampleQueries.getBoundingClientRect();
        results.sampleQueriesHeight = rect.height;
      }

      return results;
    });

    console.log('\nCurrent measurements:', JSON.stringify(measurements, null, 2));

    // Calculate optimal maxHeight for messages container
    const headerHeight = measurements.headerHeight || 64;
    const sampleQueriesHeight = measurements.sampleQueriesHeight || 0;
    const inputAreaHeight = measurements.input?.parentHeight || 80;
    const safetyMargin = 20;

    const optimalMaxHeight = viewportHeight - headerHeight - sampleQueriesHeight - inputAreaHeight - safetyMargin;

    console.log(`\nCalculated optimal maxHeight: ${optimalMaxHeight}px`);
    console.log(`  Viewport: ${viewportHeight}px`);
    console.log(`  - Header: ${headerHeight}px`);
    console.log(`  - Sample queries: ${sampleQueriesHeight}px`);
    console.log(`  - Input area: ${inputAreaHeight}px`);
    console.log(`  - Safety margin: ${safetyMargin}px`);

    // Apply the fix
    const success = await page.evaluate((maxHeight) => {
      const messagesContainer = document.querySelector('[data-messages-container="true"]');
      if (messagesContainer) {
        messagesContainer.style.maxHeight = `${maxHeight}px`;
        messagesContainer.style.paddingBottom = '8px';
        return true;
      }
      return false;
    }, optimalMaxHeight);

    if (success) {
      console.log('\n✓ Applied height fix successfully');

      // Verify the fix
      await page.waitForTimeout(500);
      const isNowVisible = await page.evaluate(() => {
        const input = document.querySelector('input[placeholder*="Ask"]') ||
                     document.querySelector('input[placeholder*="question"]');
        if (!input) return false;
        const rect = input.getBoundingClientRect();
        return rect.bottom <= window.innerHeight && rect.top >= 0;
      });

      console.log(`Input now visible: ${isNowVisible ? '✓ YES' : '✗ NO'}`);

      if (isNowVisible) {
        console.log(`\n✓ SUCCESS! Update AskMargen.jsx with: maxHeight: 'calc(100vh - ${viewportHeight - optimalMaxHeight}px)'`);
      }
    } else {
      console.log('\n✗ Could not find messages container to apply fix');
    }

    // Keep browser open
    console.log('\nBrowser staying open for 20 seconds for verification...');
    await page.waitForTimeout(20000);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

fixChatHeights();
