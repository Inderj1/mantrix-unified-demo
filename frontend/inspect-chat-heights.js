const { chromium } = require('playwright');

async function inspectChatHeights() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('\n=== Inspecting Ask MARGEN page ===');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);

    // Navigate to Ask MARGEN
    // First, look for the MARGEN.AI link/button
    const margenButton = page.locator('text=MARGEN.AI').first();
    if (await margenButton.isVisible()) {
      await margenButton.click();
      await page.waitForTimeout(1000);
    }

    // Measure the viewport and components
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    console.log(`Viewport height: ${viewportHeight}px`);

    // Find the messages container
    const messagesContainer = page.locator('[data-messages-container="true"]').first();
    if (await messagesContainer.isVisible()) {
      const box = await messagesContainer.boundingBox();
      const styles = await messagesContainer.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          height: computed.height,
          maxHeight: computed.maxHeight,
          padding: computed.padding,
          paddingBottom: computed.paddingBottom,
          marginBottom: computed.marginBottom,
        };
      });
      console.log('\nMessages container:');
      console.log(`  Bounding box: ${box ? `${box.height}px` : 'not found'}`);
      console.log(`  Computed height: ${styles.height}`);
      console.log(`  Max height: ${styles.maxHeight}`);
      console.log(`  Padding: ${styles.padding}`);
      console.log(`  Padding bottom: ${styles.paddingBottom}`);
      console.log(`  Margin bottom: ${styles.marginBottom}`);
    }

    // Find the input area
    const inputArea = page.locator('input[placeholder*="Ask a question"]').first();
    if (await inputArea.isVisible()) {
      const box = await inputArea.boundingBox();
      const parent = await inputArea.evaluateHandle(el => el.closest('form') || el.parentElement);
      const parentBox = await parent.asElement().boundingBox();

      console.log('\nInput area:');
      console.log(`  Input box bottom: ${box ? `${box.y + box.height}px` : 'not found'}`);
      console.log(`  Parent box bottom: ${parentBox ? `${parentBox.y + parentBox.height}px` : 'not found'}`);
      console.log(`  Distance from viewport bottom: ${viewportHeight - (box ? box.y + box.height : 0)}px`);
    }

    // Check if input is visible in viewport
    const isInputVisible = await page.evaluate(() => {
      const input = document.querySelector('input[placeholder*="Ask a question"]');
      if (!input) return false;
      const rect = input.getBoundingClientRect();
      return rect.bottom <= window.innerHeight && rect.top >= 0;
    });
    console.log(`\nInput visible in viewport: ${isInputVisible}`);

    // Now check AIAnalyticsChat if accessible
    console.log('\n=== Checking if AI Analytics Chat is accessible ===');
    const analyticsButton = page.locator('text=AI Analytics Chat').first();
    if (await analyticsButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('AI Analytics Chat found, inspecting...');
      await analyticsButton.click();
      await page.waitForTimeout(1000);

      const messagesContainer2 = page.locator('[data-messages-container="true"]').first();
      if (await messagesContainer2.isVisible()) {
        const styles2 = await messagesContainer2.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            height: computed.height,
            maxHeight: computed.maxHeight,
            padding: computed.padding,
          };
        });
        console.log('\nAI Analytics messages container:');
        console.log(`  Computed height: ${styles2.height}`);
        console.log(`  Max height: ${styles2.maxHeight}`);
        console.log(`  Padding: ${styles2.padding}`);
      }
    } else {
      console.log('AI Analytics Chat not found on this page');
    }

    // Keep browser open for inspection
    console.log('\n\nBrowser will stay open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

inspectChatHeights();
