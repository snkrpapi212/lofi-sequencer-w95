const { test, expect } = require('@playwright/test');

test.describe('Lo-Fi Sequencer 95 E2E Tests (Expanded)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have correct page title', async ({ page }) => {
    await expect(page).toHaveTitle('Lo-Fi Sequencer 95');
  });

  test('Play/Stop button should toggle text', async ({ page }) => {
    const playStopBtn = page.locator('#playStopBtn');

    // Initial state - should show Play
    await expect(playStopBtn).toContainText('Play');
    await expect(playStopBtn.locator('#playIcon')).toHaveText('▶');

    // Click to play
    await playStopBtn.click();

    // After click - should show Stop
    await expect(playStopBtn).toContainText('Stop');
    await expect(playStopBtn.locator('#playIcon')).toHaveText('■');

    // Click again to stop
    await playStopBtn.click();

    // After second click - should show Play again
    await expect(playStopBtn).toContainText('Play');
    await expect(playStopBtn.locator('#playIcon')).toHaveText('▶');
  });

  test('clicking a grid button should add .active class', async ({ page }) => {
    const grid = page.locator('#sequencerGrid');

    // Wait for grid to be generated
    await grid.waitFor({ state: 'attached' });

    // Get first step button (track 0, step 0)
    const firstStepBtn = grid.locator('.step-button').first();

    // Should not have .active class initially
    await expect(firstStepBtn).not.toHaveClass(/active/);

    // Click the step button
    await firstStepBtn.click();

    // Should now have .active class
    await expect(firstStepBtn).toHaveClass(/active/);

    // Click again to remove .active class
    await firstStepBtn.click();

    // Should not have .active class anymore
    await expect(firstStepBtn).not.toHaveClass(/active/);
  });

  test('Clear button should remove all .active classes', async ({ page }) => {
    const grid = page.locator('#sequencerGrid');
    const clearBtn = page.locator('#clearBtn');

    // Wait for grid to be generated
    await grid.waitFor({ state: 'attached' });

    // Click multiple step buttons to activate them
    const stepButtons = grid.locator('.step-button');
    await stepButtons.nth(0).click();
    await stepButtons.nth(1).click();
    await stepButtons.nth(2).click();

    // Verify they have .active class
    await expect(stepButtons.nth(0)).toHaveClass(/active/);
    await expect(stepButtons.nth(1)).toHaveClass(/active/);
    await expect(stepButtons.nth(2)).toHaveClass(/active/);

    // Click Clear button
    await clearBtn.click();

    // All step buttons should not have .active class
    await expect(stepButtons.nth(0)).not.toHaveClass(/active/);
    await expect(stepButtons.nth(1)).not.toHaveClass(/active/);
    await expect(stepButtons.nth(2)).not.toHaveClass(/active/);
  });

  test('Preset dropdown should load artist presets', async ({ page }) => {
    const presetSelect = page.locator('#presetSelect');
    const loadPresetBtn = page.locator('#loadPresetBtn');
    const grid = page.locator('#sequencerGrid');
    const tempoSlider = page.locator('#tempoSlider');
    const tempoValue = page.locator('#tempoValue');

    // Wait for grid to be generated
    await grid.waitFor({ state: 'attached' });

    // Verify preset options are available
    const options = presetSelect.locator('option');
    await expect(options).toHaveCount(11); // 10 artist presets + "Select artist preset..."

    // Select "The Weeknd (Blinding Lights)" preset
    await presetSelect.selectOption('The Weeknd (Blinding Lights)');

    // Click Load button
    await loadPresetBtn.click();

    // Verify BPM is updated to 171
    await expect(tempoSlider).toHaveValue('171');
    await expect(tempoValue).toHaveText('171');

    // Verify some steps are activated (presets fill first 32 steps of 128-step grid)
    const stepButtons = grid.locator('.step-button');
    await expect(stepButtons.nth(0)).toHaveClass(/active/); // First kick

    // Verify multiple steps are activated (preset repeated across 128 steps)
    const activeButtons = grid.locator('.step-button.active');
    const count = await activeButtons.count();
    expect(count).toBeGreaterThan(5);
  });

  test('Grid should have 6 tracks and 128 steps by default', async ({ page }) => {
    const grid = page.locator('#sequencerGrid');
    const trackLabels = page.locator('#trackLabels');
    const stepNumbers = page.locator('#stepNumbers');

    // Wait for grid to be generated
    await grid.waitFor({ state: 'attached' });

    // Check number of track labels
    const labels = trackLabels.locator('.track-label');
    await expect(labels).toHaveCount(6);

    // Check track names
    await expect(labels.nth(0)).toHaveText('Kick');
    await expect(labels.nth(1)).toHaveText('Snare');
    await expect(labels.nth(2)).toHaveText('Hi-Hat');
    await expect(labels.nth(3)).toHaveText('Chord');
    await expect(labels.nth(4)).toHaveText('Bass');
    await expect(labels.nth(5)).toHaveText('FX');

    // Check number of step buttons (6 tracks × 128 steps = 768 buttons)
    const stepButtons = grid.locator('.step-button');
    await expect(stepButtons).toHaveCount(768);

    // Check number of step numbers
    const numbers = stepNumbers.locator('.step-number');
    await expect(numbers).toHaveCount(128);
  });

  test('Steps selector should change pattern length', async ({ page }) => {
    const stepsSelect = page.locator('#stepsSelect');
    const grid = page.locator('#sequencerGrid');

    // Wait for grid to be generated
    await grid.waitFor({ state: 'attached' });

    // Default is 128 steps
    let stepButtons = grid.locator('.step-button');
    await expect(stepButtons).toHaveCount(768); // 6 tracks × 128 steps

    // Change to 32 steps
    await stepsSelect.selectOption('32');
    await page.waitForTimeout(100); // Wait for re-render

    stepButtons = grid.locator('.step-button');
    await expect(stepButtons).toHaveCount(192); // 6 tracks × 32 steps

    // Change to 256 steps
    await stepsSelect.selectOption('256');
    await page.waitForTimeout(100); // Wait for re-render

    stepButtons = grid.locator('.step-button');
    await expect(stepButtons).toHaveCount(1536); // 6 tracks × 256 steps
  });

  test('Loop selector should control playback loops', async ({ page }) => {
    const loopSelect = page.locator('#loopSelect');
    const playStopBtn = page.locator('#playStopBtn');
    const statusText = page.locator('#statusText');

    // Wait for grid
    await page.locator('#sequencerGrid').waitFor({ state: 'attached' });

    // Default is infinite loops
    await expect(loopSelect).toHaveValue('infinite');

    // Change to play once
    await loopSelect.selectOption('1');

    // Click play
    await playStopBtn.click();

    // Verify status shows playing
    await expect(statusText).toContainText('Playing');

    // Click stop
    await playStopBtn.click();

    // Verify status shows stopped
    await expect(statusText).toContainText('Stopped');
  });

  test('Long pattern (512 steps) should work correctly', async ({ page }) => {
    const stepsSelect = page.locator('#stepsSelect');
    const grid = page.locator('#sequencerGrid');
    const stepNumbers = page.locator('#stepNumbers');

    // Wait for grid to be generated
    await grid.waitFor({ state: 'attached' });

    // Change to 512 steps (32 bars - full song!)
    await stepsSelect.selectOption('512');
    await page.waitForTimeout(100); // Wait for re-render

    // Check number of step buttons (6 tracks × 512 steps = 3072 buttons)
    const stepButtons = grid.locator('.step-button');
    await expect(stepButtons).toHaveCount(3072);

    // Check number of step numbers
    const numbers = stepNumbers.locator('.step-number');
    await expect(numbers).toHaveCount(512);

    // Verify first step button exists
    await expect(stepButtons.nth(0)).toBeVisible();

    // Click first step to activate
    await stepButtons.nth(0).click();
    await expect(stepButtons.nth(0)).toHaveClass(/active/);

    // Verify last step button exists
    await expect(stepButtons.nth(3071)).toBeVisible();
  });

  test('Multiple artist presets should work correctly', async ({ page }) => {
    const presetSelect = page.locator('#presetSelect');
    const loadPresetBtn = page.locator('#loadPresetBtn');
    const tempoSlider = page.locator('#tempoSlider');
    const tempoValue = page.locator('#tempoValue');
    const grid = page.locator('#sequencerGrid');

    // Wait for grid to be generated
    await grid.waitFor({ state: 'attached' });

    // Test different artists with different tempos
    const presets = [
      { name: 'Kendrick Lamar (HUMBLE.)', bpm: 150 },
      { name: 'Drake (Hotline Bling)', bpm: 135 },
      { name: 'Tupac (California Love)', bpm: 92 },
      { name: 'J. Cole (No Role Modelz)', bpm: 80 }
    ];

    for (const preset of presets) {
      await presetSelect.selectOption(preset.name);
      await loadPresetBtn.click();

      await expect(tempoSlider).toHaveValue(String(preset.bpm));
      await expect(tempoValue).toHaveText(String(preset.bpm));

      // Verify at least one step is activated
      const stepButtons = grid.locator('.step-button');
      const firstActive = stepButtons.filter({ hasClass: 'active' }).first();
      await expect(firstActive).toBeVisible();
    }
  });
});
