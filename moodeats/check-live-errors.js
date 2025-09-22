const { chromium } = require('@playwright/test');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Listen for console messages
    page.on('console', msg => {
        console.log(`${msg.type()}: ${msg.text()}`);
    });

    // Listen for page errors
    page.on('pageerror', err => {
        console.error('Page error:', err.message);
    });

    console.log('Loading https://njrun1804.github.io/moodeats/...');
    await page.goto('https://njrun1804.github.io/moodeats/');
    await page.waitForTimeout(2000);

    // Check what's happening
    const result = await page.evaluate(() => {
        const info = {
            mealsLoaded: typeof window.meals,
            initializeApp: typeof window.initializeApp,
            scriptTags: Array.from(document.querySelectorAll('script')).map(s => s.src || 'inline'),
        };
        return info;
    });

    console.log('Result:', JSON.stringify(result, null, 2));

    await browser.close();
})();