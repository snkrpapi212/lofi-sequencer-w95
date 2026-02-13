const { test, expect } = require('@playwright/test');

test.describe('Lo-Fi Sequencer 95 E2E Tests', () => {
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
    const firstThree = stepButtons.nth(0).or(stepButtons.nth(1)).or(stepButtons.nth(2));

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

  test('Preset dropdown should load a preset', async ({ page }) => {
    const presetSelect = page.locator('#presetSelect');
    const loadPresetBtn = page.locator('#loadPresetBtn');
    const grid = page.locator('#sequencerGrid');
    const tempoSlider = page.locator('#tempoSlider');
    const tempoValue = page.locator('#tempoValue');

    // Wait for grid to be generated
    await grid.waitFor({ state: 'attached' });

    // Verify preset options are available
    const options = presetSelect.locator('option');
    await expect(options).toHaveCount(9); // 8 presets + "Select preset..."

    // Select "Classic Lo-Fi" preset
    await presetSelect.selectOption('Classic Lo-Fi');

    // Click Load button
    await loadPresetBtn.click();

    // Verify BPM is updated to 85
    await expect(tempoSlider).toHaveValue('85');
    await expect(tempoValue).toHaveText('85');

    // Verify some steps are activated (Classic Lo-Fi should have kick on beat 1)
    const stepButtons = grid.locator('.step-button');
    await expect(stepButtons.nth(0)).toHaveClass(/active/); // First kick

    // Load a different preset with different BPM
    await presetSelect.selectOption('Trap');
    await loadPresetBtn.click();

    // Verify BPM is updated to 140
    await expect(tempoSlider).toHaveValue('140');
    await expect(tempoValue).toHaveText('140');
  });
});
