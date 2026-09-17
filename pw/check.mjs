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
check(
    'ctrl+z removes it again',
    added && afterUndo === before,
    added ? `${afterAdd} -> ${afterUndo}` : 'skipped, nothing was added',
);

await page.keyboard.press('Control+Shift+z');
await page.waitForTimeout(500);
const afterRedo = await lightCount();
check(
    'ctrl+shift+z puts it back',
    added && afterRedo === afterAdd,
    added ? `${afterUndo} -> ${afterRedo}` : 'skipped, nothing was added',
);

// --- the selected light's bindings ---------------------------------------------
// Selecting a light builds its Tweakpane bindings, each of which bails out early
// when no light is current. A guard firing wrongly would leave the folder empty
// without raising anything, so assert the labels are actually there.
const currentLightFolder = page
    .locator('.tp-fldv', { has: page.locator('.tp-fldv_t', { hasText: 'Current Light' }) })
    .first();
const labels = await currentLightFolder.locator('.tp-lblv_l').allTextContents();
const expected = ['front', 'intensity', 'color', 'distance'];
const missing = expected.filter((label) => !labels.some((l) => l.trim() === label));
check(
    'the selected light exposes its bindings',
    missing.length === 0,
    missing.length ? `missing ${missing.join(', ')}` : labels.length + ' labels',
);

// --- drag a light, then undo it ----------------------------------------------
// The handle follows the pointer on its own during the drag, so moving it proves
// nothing about the command. Undoing does: SetLightPositionCommand.undo is the
// only thing that can put the handle back, and it goes through the scene
// service's updateLightPositions.
try {
    const handle = page.locator('#matcapLights .light').first();
    const styleBefore = await handle.getAttribute('style');
    const from = await handle.boundingBox();

    await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.35, box.y + box.height * 0.65, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(700);

    const styleDragged = await page.locator('#matcapLights .light').first().getAttribute('style');
    const moved = styleDragged !== null && styleDragged !== styleBefore;
    check('dragging a light moves its handle', moved, `${styleBefore} -> ${styleDragged}`);

    await page.keyboard.press('Control+z');
    await page.waitForTimeout(700);
    const styleUndone = await page.locator('#matcapLights .light').first().getAttribute('style');
    check(
        'undoing the drag restores the position',
        moved && styleUndone === styleBefore,
        moved ? `${styleDragged} -> ${styleUndone}` : 'skipped, the drag did not move anything',
    );
} catch (err) {
    check('dragging a light and undoing it', false, err.message.split('\n')[0]);
}

// --- export project ----------------------------------------------------------
// Exercises Project's serialization, which now reads the store.
const readFile = async (download) => {
    const path = await download.path();
    return JSON.parse(await (await import('node:fs/promises')).readFile(path, 'utf8'));
};

const exportProject = async () => {
    const pending = page.waitForEvent('download', { timeout: 5000 });
    await paneButton('Export project').click({ timeout: 5000 });
    return readFile(await pending);
};

try {
    // The button lives in a folder Tweakpane renders collapsed, under a tab.
    await page.locator('.tp-fldv_b', { hasText: 'Import/Export' }).first().click();
    await page.waitForTimeout(300);
    await page.locator('.tp-tbiv_b', { hasText: 'Project' }).first().click();
    await page.waitForTimeout(300);

    const project = await exportProject();
    check(
        'exporting the project downloads a file',
        typeof project?.sphereRenderMaterial?.roughness === 'number',
        JSON.stringify(project?.sphereRenderMaterial),
    );

    // --- sphere material: store -> command -> undo ---------------------------
    // Asserted on the value the field shows, not on the exported file: the field
    // is what the user reads, and it needs no round trip through a download.
    const editorPane = page.locator('.matcap-editor-pane');
    const roughnessRow = editorPane
        .locator('.tp-lblv', { has: page.locator('.tp-lblv_l', { hasText: 'roughness' }) })
        .first();
    const input = roughnessRow.locator('input').first();
    // Oracle: the rendered material, read through the dev-only console handle.
    // Not the field — Ctrl+Z also triggers the browser's own text undo on a
    // Tweakpane input, which rewrites it whatever the application does. Not the
    // exported file either — clicking Export makes the widget write its stale
    // value back into the store, which hides the very regression this checks.
    const roughnessApplied = () =>
        page.evaluate(() => globalThis.matcapEditor.editorWorld.content.sphereRenderMaterial.roughness);
    const roughnessShown = () => input.inputValue();

    const roughnessBefore = await roughnessApplied();
    await input.fill('0.75');
    await input.press('Enter');
    // Blur first: with focus still in the field, ctrl+z is the browser's own text
    // undo, which rewrites the binding without ever reaching the application.
    await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
    await page.waitForTimeout(400);
    check('the roughness field takes the new value', (await roughnessShown()) === '0.75', await roughnessShown());
    check(
        'the new roughness reaches the material',
        (await roughnessApplied()) === 0.75,
        String(await roughnessApplied()),
    );

    const afterEdit = await exportProject();
    check(
        'changing roughness reaches the exported project',
        afterEdit.sphereRenderMaterial.roughness === 0.75,
        String(afterEdit.sphereRenderMaterial.roughness),
    );

    await page.keyboard.press('Control+z');
    await page.waitForTimeout(600);
    check(
        'undoing the roughness change restores it',
        (await roughnessApplied()) === roughnessBefore,
        `0.75 -> ${await roughnessApplied()}`,
    );

    // A refresh that re-fired the change handler would stack a second command,
    // so a second undo must leave the material alone.
    await page.keyboard.press('Control+z');
    await page.waitForTimeout(600);
    check(
        'a second undo does not re-apply the material',
        (await roughnessApplied()) === roughnessBefore,
        String(await roughnessApplied()),
    );
} catch (err) {
    check('sphere material round trip', false, err.message.split('\n')[0]);
}

for (const { name, ok, detail } of steps) {
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${detail ? ` [${detail}]` : ''}`);
}
console.log(problems.length ? `\n${problems.join('\n')}` : '\nno console errors');

await browser.close();
process.exit(problems.length ? 1 : 0);
