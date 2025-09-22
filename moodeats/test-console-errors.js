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

    // Check if meals loaded
    const mealsLoaded = await page.evaluate(() => {
        console.log('Checking window.meals:', typeof window.meals, window.meals);
        console.log('Checking embeddedMeals:', typeof embeddedMeals);
        console.log('Checking initializeApp:', typeof initializeApp);
        return typeof window.meals !== 'undefined';
    });

    console.log('Meals loaded?', mealsLoaded);

    await browser.close();
})();