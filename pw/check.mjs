import { chromium } from 'playwright';

/**
 * Smoke path for the matcap editor. Drives the real UI — pointer events on the
 * editor canvas, keyboard undo/redo, Tweakpane buttons — so that a regression in
 * module evaluation order or in a dependency wiring shows up here rather than in
 * the reviewer's browser. `vue-tsc` and `vite build` do not see those.
 */

const url = process.argv[2] ?? 'http://localhost:5174/';
const headless = process.env.HEADED !== '1';

const browser = await chromium.launch({ headless });
const page = await browser.newPage();

const problems = [];
page.on('console', (msg) => {
    if (msg.type() === 'error') problems.push(`console.error: ${msg.text()}`);
});
page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));

const steps = [];
const check = (name, ok, detail = '') => {
    steps.push({ name, ok, detail });
    if (!ok) problems.push(`step failed: ${name}${detail ? ` (${detail})` : ''}`);
};

const lightCount = () => page.locator('#matcapLights .light').count();

// Exact text: Tweakpane has both an 'Export' and an 'Export project' button, and
// a substring match would silently pick the wrong one.
const paneButton = (title) => page.getByRole('button', { name: title, exact: true });

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

check('page renders both canvases', (await page.locator('canvas').count()) >= 2);

// --- add a light -------------------------------------------------------------
// A pointerdown/up at the centre of the editor canvas raycasts onto the sphere,
// which runs AddLightCommand through the editor and pushes onto the store.
const editorCanvas = page.locator('canvas.webgl2');
const before = await lightCount();
const box = await editorCanvas.boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down();
await page.mouse.up();
await page.waitForTimeout(500);
const afterAdd = await lightCount();
check('adding a light appends a light handle', afterAdd === before + 1, `${before} -> ${afterAdd}`);

// --- undo / redo -------------------------------------------------------------
// The keydown handler on document is debounced at 100ms, hence the waits.
// Guarded on the add having worked: without a light on the scene, both counts
// stay at zero and the assertions would pass while testing nothing.
const added = afterAdd === before + 1;

await page.keyboard.press('Control+z');
await page.waitForTimeout(500);
const afterUndo = await lightCount();
check('ctrl+z removes it again', added && afterUndo === before, added ? `${afterAdd} -> ${afterUndo}` : 'skipped, nothing was added');

await page.keyboard.press('Control+Shift+z');
await page.waitForTimeout(500);
const afterRedo = await lightCount();
check('ctrl+shift+z puts it back', added && afterRedo === afterAdd, added ? `${afterUndo} -> ${afterRedo}` : 'skipped, nothing was added');

// --- export project ----------------------------------------------------------
// Exercises Project's serialization, which reads through the pane controllers.
// The button lives in a folder that Tweakpane renders collapsed.
try {
    await page.locator('.tp-fldv_b', { hasText: 'Import/Export' }).first().click();
    await page.waitForTimeout(300);
    // That folder holds a tab bar; the project buttons live under 'Project'.
    await page.locator('.tp-tbiv_b', { hasText: 'Project' }).first().click();
    await page.waitForTimeout(300);

    const exportButton = paneButton('Export project');
    const download = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
    await exportButton.click({ timeout: 5000 });
    const file = await download;
    check('exporting the project downloads a file', file !== null, file ? file.suggestedFilename() : 'no download');
} catch (err) {
    check('exporting the project downloads a file', false, err.message.split('\n')[0]);
}

for (const { name, ok, detail } of steps) {
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${detail ? ` [${detail}]` : ''}`);
}
console.log(problems.length ? `\n${problems.join('\n')}` : '\nno console errors');

await browser.close();
process.exit(problems.length ? 1 : 0);
