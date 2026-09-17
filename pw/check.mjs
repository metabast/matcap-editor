import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://localhost:5174/';
const browser = await chromium.launch();
const page = await browser.newPage();
const problems = [];

page.on('console', (msg) => {
    if (msg.type() === 'error') problems.push(`console.error: ${msg.text()}`);
});
page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

const canvases = await page.locator('canvas').count();
console.log(`canvas elements: ${canvases}`);
console.log(problems.length ? problems.join('\n') : 'no console errors');
await browser.close();
process.exit(problems.length ? 1 : 0);
