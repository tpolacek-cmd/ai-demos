// @ts-check
const { test, expect } = require('/home/manuel/.nvm/versions/node/v24.13.0/lib/node_modules/playwright/test.js');

const BASE = 'http://localhost:8000';

// Clean localStorage before each test
test.beforeEach(async ({ page }) => {
    await page.goto(BASE);
    await page.evaluate(() => {
        localStorage.removeItem('brandOverrides');
        localStorage.removeItem('brandPresets');
        localStorage.removeItem('brandActivePreset');
    });
    await page.reload();
});

// =============================================
// TASK-007: brand-override.js core system
// =============================================

test.describe('TASK-007: Brand Override System', () => {

    test('BrandOverride API exists with all methods', async ({ page }) => {
        const keys = await page.evaluate(() => Object.keys(window.BrandOverride).sort());
        expect(keys).toEqual(expect.arrayContaining([
            'STORAGE_KEY', 'apply', 'clear', 'export', 'get',
            'has', 'import', 'load', 'presets', 'save'
        ]));
    });

    test('has() returns false when no overrides', async ({ page }) => {
        const has = await page.evaluate(() => BrandOverride.has());
        expect(has).toBe(false);
    });

    test('save + load round-trips correctly', async ({ page }) => {
        await page.evaluate(() => {
            BrandOverride.save({ name: 'Test Corp', colors: { primary: '#FF0000' } });
        });
        const loaded = await page.evaluate(() => BrandOverride.load());
        expect(loaded.name).toBe('Test Corp');
        expect(loaded.colors.primary).toBe('#FF0000');
    });

    test('save + has returns true', async ({ page }) => {
        await page.evaluate(() => BrandOverride.save({ name: 'X' }));
        const has = await page.evaluate(() => BrandOverride.has());
        expect(has).toBe(true);
    });

    test('clear removes overrides', async ({ page }) => {
        await page.evaluate(() => {
            BrandOverride.save({ name: 'X' });
            BrandOverride.clear();
        });
        const has = await page.evaluate(() => BrandOverride.has());
        expect(has).toBe(false);
        const loaded = await page.evaluate(() => BrandOverride.load());
        expect(loaded).toBeNull();
    });

    test('apply merges overrides onto BRAND', async ({ page }) => {
        await page.evaluate(() => {
            BrandOverride.save({ name: 'Applied Corp' });
        });
        await page.reload();
        const name = await page.evaluate(() => BRAND.name);
        expect(name).toBe('Applied Corp');
    });

    test('apply does deep merge preserving untouched fields', async ({ page }) => {
        await page.evaluate(() => {
            BrandOverride.save({ colors: { primary: '#123456' } });
        });
        await page.reload();
        const result = await page.evaluate(() => ({
            primary: BRAND.colors.primary,
            accent: BRAND.colors.accent,
            serviceType: BRAND.serviceType,
        }));
        expect(result.primary).toBe('#123456');
        expect(result.accent).toBeTruthy(); // preserved from default
        expect(result.serviceType).toBeTruthy(); // preserved from default
    });

    test('export returns valid JSON without functions', async ({ page }) => {
        const json = await page.evaluate(() => BrandOverride.export());
        const parsed = JSON.parse(json);
        expect(parsed.name).toBeTruthy();
        expect(parsed.colors).toBeTruthy();
        expect(parsed.account).toBeTruthy();
        // Functions should not be exported
        expect(parsed.formattedTotal).toBeUndefined();
        expect(parsed.formattedPlanAmount).toBeUndefined();
    });

    test('import applies config and persists', async ({ page }) => {
        const importJson = JSON.stringify({
            name: 'Imported Co',
            colors: { primary: '#AABBCC' }
        });
        await page.evaluate((json) => BrandOverride.import(json), importJson);

        const name = await page.evaluate(() => BRAND.name);
        expect(name).toBe('Imported Co');

        // Persists after reload
        await page.reload();
        const nameAfter = await page.evaluate(() => BRAND.name);
        expect(nameAfter).toBe('Imported Co');
    });

    test('handles corrupted localStorage gracefully', async ({ page }) => {
        await page.evaluate(() => {
            localStorage.setItem('brandOverrides', 'not-valid-json');
        });
        await page.reload();
        // Page should not crash, BRAND should have defaults
        const name = await page.evaluate(() => BRAND.name);
        expect(name).toBeTruthy();
        const errors = [];
        page.on('pageerror', err => errors.push(err.message));
        await page.reload();
        // No uncaught errors
        expect(errors.filter(e => e.includes('brand-override'))).toHaveLength(0);
    });
});

// =============================================
// TASK-008: Brand Editor UI
// =============================================

test.describe('TASK-008: Brand Editor UI', () => {

    test('editor panel exists and starts collapsed', async ({ page }) => {
        const editor = page.locator('#brandEditor');
        await expect(editor).toBeVisible();
        // Body should not be visible (collapsed)
        const body = page.locator('#brandEditorBody');
        const maxHeight = await body.evaluate(el => getComputedStyle(el).maxHeight);
        expect(maxHeight).toBe('0px');
    });

    test('toggle button opens and closes editor', async ({ page }) => {
        const toggle = page.locator('#brandEditorToggle');
        const editor = page.locator('#brandEditor');

        await toggle.click();
        await expect(editor).toHaveClass(/open/);

        await toggle.click();
        await expect(editor).not.toHaveClass(/open/);
    });

    test('tabs switch content', async ({ page }) => {
        // Open editor
        await page.click('#brandEditorToggle');

        // Identity tab active by default
        const identityContent = page.locator('.brand-tab-content[data-tab="identity"]');
        await expect(identityContent).toHaveClass(/active/);

        // Click Contact tab
        await page.click('.brand-tab[data-tab="contact"]');
        const contactContent = page.locator('.brand-tab-content[data-tab="contact"]');
        await expect(contactContent).toHaveClass(/active/);
        await expect(identityContent).not.toHaveClass(/active/);

        // Click Colors tab
        await page.click('.brand-tab[data-tab="colors"]');
        const colorsContent = page.locator('.brand-tab-content[data-tab="colors"]');
        await expect(colorsContent).toHaveClass(/active/);
    });

    test('fields are populated with current BRAND values', async ({ page }) => {
        await page.click('#brandEditorToggle');

        const nameInput = page.locator('input[data-brand="name"]');
        const nameVal = await nameInput.inputValue();
        expect(nameVal).toBeTruthy();

        const brandName = await page.evaluate(() => BRAND.name);
        expect(nameVal).toBe(brandName);
    });

    test('account tab fields populated with numbers', async ({ page }) => {
        await page.click('#brandEditorToggle');
        await page.click('.brand-tab[data-tab="account"]');

        const totalInput = page.locator('input[data-brand="account.totalAmount"]');
        const val = await totalInput.inputValue();
        expect(parseFloat(val)).toBeGreaterThan(0);
    });

    test('color tab has synced color picker + hex input', async ({ page }) => {
        await page.click('#brandEditorToggle');
        await page.click('.brand-tab[data-tab="colors"]');

        const colorPicker = page.locator('input[type="color"][data-brand="colors.primary"]');
        const hexInput = page.locator('#colors-primary-hex');

        const pickerVal = await colorPicker.inputValue();
        const hexVal = await hexInput.inputValue();

        // Both should have the same color value
        expect(pickerVal.toLowerCase()).toBe(hexVal.toLowerCase());
    });

    test('live preview: editing name updates page title and footer', async ({ page }) => {
        await page.click('#brandEditorToggle');

        const nameInput = page.locator('input[data-brand="name"]');
        await nameInput.fill('TestCorp');

        // Title should update
        const title = await page.title();
        expect(title).toContain('TestCorp');

        // Footer span should update
        const footerName = await page.locator('footer [data-brand="name"]').textContent();
        expect(footerName).toBe('TestCorp');
    });

    test('live preview: editing color updates CSS variable', async ({ page }) => {
        await page.click('#brandEditorToggle');
        await page.click('.brand-tab[data-tab="colors"]');

        const hexInput = page.locator('#colors-primary-hex');
        await hexInput.fill('#FF0000');
        await hexInput.dispatchEvent('input');

        const cssVar = await page.evaluate(() =>
            getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim()
        );
        expect(cssVar.toLowerCase()).toContain('ff0000');
    });

    test('save button persists to localStorage', async ({ page }) => {
        await page.click('#brandEditorToggle');

        const nameInput = page.locator('input[data-brand="name"]');
        await nameInput.fill('Saved Corp');

        await page.click('#brandSave');

        // Check localStorage
        const stored = await page.evaluate(() => localStorage.getItem('brandOverrides'));
        expect(stored).toBeTruthy();
        const parsed = JSON.parse(stored);
        expect(parsed.name).toBe('Saved Corp');
    });

    test('save shows toast notification', async ({ page }) => {
        await page.click('#brandEditorToggle');
        await page.click('#brandSave');

        const toast = page.locator('.brand-toast');
        await expect(toast).toBeVisible({ timeout: 2000 });
    });

    test('save shows "Modificada" badge', async ({ page }) => {
        await page.click('#brandEditorToggle');

        const nameInput = page.locator('input[data-brand="name"]');
        await nameInput.fill('Badge Test');
        await page.click('#brandSave');

        const badge = page.locator('#brandEditorBadge');
        await expect(badge).toBeVisible();
    });

    test('saved changes persist after reload', async ({ page }) => {
        await page.click('#brandEditorToggle');

        const nameInput = page.locator('input[data-brand="name"]');
        await nameInput.fill('Persist Test');
        await page.click('#brandSave');

        await page.reload();

        const name = await page.evaluate(() => BRAND.name);
        expect(name).toBe('Persist Test');

        // Editor should show persisted value
        await page.click('#brandEditorToggle');
        const val = await page.locator('input[data-brand="name"]').inputValue();
        expect(val).toBe('Persist Test');
    });

    test('reset clears overrides', async ({ page }) => {
        // Save an override first
        await page.evaluate(() => BrandOverride.save({ name: 'WillBeReset' }));
        await page.reload();

        await page.click('#brandEditorToggle');

        // Dismiss confirm dialog with accept
        page.on('dialog', dialog => dialog.accept());
        await page.click('#brandReset');

        // After reload (triggered by reset), overrides should be gone
        await page.waitForLoadState('load');
        const has = await page.evaluate(() => BrandOverride.has());
        expect(has).toBe(false);
    });

    test('export downloads a JSON file', async ({ page }) => {
        await page.click('#brandEditorToggle');

        const [download] = await Promise.all([
            page.waitForEvent('download'),
            page.click('#brandExport'),
        ]);

        expect(download.suggestedFilename()).toMatch(/\.json$/);
    });

    test('builder still works with editor open', async ({ page }) => {
        await page.click('#brandEditorToggle');

        // Builder grid should still exist and have options
        const options = page.locator('.option-card');
        const count = await options.count();
        expect(count).toBeGreaterThan(3);

        // Can select an option
        const firstOption = options.first();
        await firstOption.click();
        await expect(firstOption).toHaveClass(/selected/);

        // Start button should be visible
        await expect(page.locator('#startDemo')).toBeVisible();
    });
});

// =============================================
// TASK-009: Brand Editor Styles
// =============================================

test.describe('TASK-009: Brand Editor Styles', () => {

    test('collapsed toggle has correct visual styling', async ({ page }) => {
        const toggle = page.locator('#brandEditorToggle');
        const box = await toggle.boundingBox();
        expect(box.width).toBeGreaterThan(200);
        expect(box.height).toBeGreaterThan(30);
    });

    test('editor container has border-radius matching builder', async ({ page }) => {
        const radius = await page.locator('#brandEditor').evaluate(el =>
            getComputedStyle(el).borderRadius
        );
        expect(radius).toBe('14px');
    });

    test('tabs are visible when panel is open', async ({ page }) => {
        await page.click('#brandEditorToggle');
        const tabs = page.locator('.brand-tab');
        await expect(tabs.first()).toBeVisible();
        const count = await tabs.count();
        expect(count).toBe(4);
    });

    test('action buttons are visible when panel is open', async ({ page }) => {
        await page.click('#brandEditorToggle');
        await expect(page.locator('#brandSave')).toBeVisible();
        await expect(page.locator('#brandReset')).toBeVisible();
        await expect(page.locator('#brandExport')).toBeVisible();
        await expect(page.locator('#brandImport')).toBeVisible();
    });

    test('color picker is 40px square', async ({ page }) => {
        await page.click('#brandEditorToggle');
        await page.click('.brand-tab[data-tab="colors"]');

        const picker = page.locator('input[type="color"]').first();
        const box = await picker.boundingBox();
        expect(box.width).toBe(40);
        expect(box.height).toBe(40);
    });
});

// =============================================
// TASK-010: Override connected to all pages
// =============================================

test.describe('TASK-010: Override on all demo pages', () => {

    test.beforeEach(async ({ page }) => {
        // Set a recognizable override
        await page.goto(BASE);
        await page.evaluate(() => {
            BrandOverride.save({
                name: 'E2E Test Corp',
                fullName: 'E2E Test Corporation',
                serviceType: 'Testing',
                colors: { primary: '#E74C3C' },
                account: { totalAmount: 999.99 }
            });
        });
    });

    test('checkout.html applies overrides', async ({ page }) => {
        await page.goto(BASE + '/checkout.html?flow=curp-deeplink');
        const name = await page.evaluate(() => BRAND.name);
        expect(name).toBe('E2E Test Corp');
        const color = await page.evaluate(() => BRAND.colors.primary);
        expect(color).toBe('#E74C3C');
    });

    test('whatsapp.html applies overrides', async ({ page }) => {
        await page.goto(BASE + '/whatsapp.html');
        const name = await page.evaluate(() => BRAND.name);
        expect(name).toBe('E2E Test Corp');
    });

    test('auth-mobile.html applies overrides', async ({ page }) => {
        await page.goto(BASE + '/auth-mobile.html?bank=hey-banco&action=pay-domiciliar');
        const name = await page.evaluate(() => BRAND.name);
        expect(name).toBe('E2E Test Corp');
    });

    test('qr.html applies overrides', async ({ page }) => {
        await page.goto(BASE + '/qr.html');
        const name = await page.evaluate(() => BRAND.name);
        expect(name).toBe('E2E Test Corp');
    });

    test('mobile-viewer.html applies overrides', async ({ page }) => {
        await page.goto(BASE + '/mobile-viewer.html?demo=whatsapp');
        const name = await page.evaluate(() => BRAND.name);
        expect(name).toBe('E2E Test Corp');
    });

    test('video-player.html applies overrides', async ({ page }) => {
        await page.goto(BASE + '/video-player.html');
        const name = await page.evaluate(() => BRAND.name);
        expect(name).toBe('E2E Test Corp');
    });

    test('custom brand indicator appears on demo pages', async ({ page }) => {
        await page.goto(BASE + '/checkout.html?flow=curp-deeplink');
        const attr = await page.evaluate(() =>
            document.documentElement.getAttribute('data-brand-custom')
        );
        expect(attr).toBe('true');
    });

    test('no custom indicator when no overrides', async ({ page }) => {
        await page.evaluate(() => BrandOverride.clear());
        await page.goto(BASE + '/checkout.html?flow=curp-deeplink');
        const attr = await page.evaluate(() =>
            document.documentElement.getAttribute('data-brand-custom')
        );
        expect(attr).toBeNull();
    });
});

// =============================================
// TASK-011: Presets
// =============================================

test.describe('TASK-011: Brand Presets', () => {

    test('presets API exists', async ({ page }) => {
        const keys = await page.evaluate(() => Object.keys(BrandOverride.presets).sort());
        expect(keys).toEqual(['activate', 'delete', 'getActive', 'list', 'save']);
    });

    test('initially no presets', async ({ page }) => {
        const list = await page.evaluate(() => BrandOverride.presets.list());
        expect(list).toHaveLength(0);
    });

    test('save and list a preset', async ({ page }) => {
        await page.evaluate(() => {
            BrandOverride.presets.save('Test Preset', { name: 'Preset Corp' });
        });
        const list = await page.evaluate(() => BrandOverride.presets.list());
        expect(list).toHaveLength(1);
        expect(list[0].name).toBe('Test Preset');
        expect(list[0].overrides.name).toBe('Preset Corp');
    });

    test('activate a preset applies its overrides', async ({ page }) => {
        await page.evaluate(() => {
            BrandOverride.presets.save('Red Brand', {
                name: 'Red Corp',
                colors: { primary: '#FF0000' }
            });
            BrandOverride.presets.activate('Red Brand');
        });
        await page.reload();

        const name = await page.evaluate(() => BRAND.name);
        expect(name).toBe('Red Corp');
        const color = await page.evaluate(() => BRAND.colors.primary);
        expect(color).toBe('#FF0000');
    });

    test('getActive returns active preset name', async ({ page }) => {
        await page.evaluate(() => {
            BrandOverride.presets.save('My Preset', { name: 'X' });
            BrandOverride.presets.activate('My Preset');
        });
        const active = await page.evaluate(() => BrandOverride.presets.getActive());
        expect(active).toBe('My Preset');
    });

    test('delete removes preset', async ({ page }) => {
        await page.evaluate(() => {
            BrandOverride.presets.save('ToDelete', { name: 'Del' });
            BrandOverride.presets.save('ToKeep', { name: 'Keep' });
            BrandOverride.presets.delete('ToDelete');
        });
        const list = await page.evaluate(() => BrandOverride.presets.list());
        expect(list).toHaveLength(1);
        expect(list[0].name).toBe('ToKeep');
    });

    test('delete active preset clears active', async ({ page }) => {
        await page.evaluate(() => {
            BrandOverride.presets.save('Active', { name: 'A' });
            BrandOverride.presets.activate('Active');
            BrandOverride.presets.delete('Active');
        });
        const active = await page.evaluate(() => BrandOverride.presets.getActive());
        expect(active).toBeNull();
    });

    test('preset select dropdown exists in editor', async ({ page }) => {
        await page.click('#brandEditorToggle');
        const select = page.locator('#brandPresetSelect');
        await expect(select).toBeVisible();

        // Default option should exist
        const defaultOpt = select.locator('option[value=""]');
        await expect(defaultOpt).toHaveText(/Default/);
    });

    test('saved presets appear in dropdown after reload', async ({ page }) => {
        await page.evaluate(() => {
            BrandOverride.presets.save('Dropdown Test', { name: 'DT' });
        });
        await page.reload();
        await page.click('#brandEditorToggle');

        const options = page.locator('#brandPresetSelect option');
        const count = await options.count();
        expect(count).toBeGreaterThanOrEqual(2); // Default + at least 1 preset

        const texts = await options.allTextContents();
        expect(texts.some(t => t.includes('Dropdown Test'))).toBe(true);
    });

    test('delete button only visible when preset is active', async ({ page }) => {
        await page.click('#brandEditorToggle');

        // No preset active → delete hidden
        const deleteBtn = page.locator('#brandPresetDelete');
        await expect(deleteBtn).toBeHidden();

        // Activate a preset and reload
        await page.evaluate(() => {
            BrandOverride.presets.save('ForDelete', { name: 'FD' });
            BrandOverride.presets.activate('ForDelete');
        });
        await page.reload();
        await page.click('#brandEditorToggle');

        await expect(page.locator('#brandPresetDelete')).toBeVisible();
    });
});

// =============================================
// Integration: Full flow
// =============================================

test.describe('Integration: End-to-end flow', () => {

    test('edit brand in editor → save → start demo → verify on checkout', async ({ page }) => {
        // 1. Open editor and change brand
        await page.click('#brandEditorToggle');
        await page.locator('input[data-brand="name"]').fill('E2E Brand');

        await page.click('.brand-tab[data-tab="account"]');
        await page.locator('input[data-brand="account.totalAmount"]').fill('1234.56');

        // 2. Save
        await page.click('#brandSave');
        await expect(page.locator('.brand-toast')).toBeVisible({ timeout: 2000 });

        // 3. Navigate to checkout
        await page.goto(BASE + '/checkout.html?flow=curp-deeplink');

        // 4. Verify brand applied
        const name = await page.evaluate(() => BRAND.name);
        expect(name).toBe('E2E Brand');
        const total = await page.evaluate(() => BRAND.account.totalAmount);
        expect(total).toBe(1234.56);
    });

    test('import JSON → verify all fields updated', async ({ page }) => {
        const config = {
            name: 'Imported Brand',
            fullName: 'Imported Brand SA',
            serviceType: 'Imported Service',
            colors: { primary: '#ABCDEF', accent: '#123456' },
            account: { totalAmount: 777.77 }
        };

        await page.evaluate((json) => BrandOverride.import(json), JSON.stringify(config));
        await page.reload();

        await page.click('#brandEditorToggle');
        expect(await page.locator('input[data-brand="name"]').inputValue()).toBe('Imported Brand');
        expect(await page.locator('input[data-brand="fullName"]').inputValue()).toBe('Imported Brand SA');

        await page.click('.brand-tab[data-tab="account"]');
        expect(await page.locator('input[data-brand="account.totalAmount"]').inputValue()).toBe('777.77');
    });

    test('preset workflow: save as → switch → delete', async ({ page }) => {
        // Create preset via API
        await page.evaluate(() => {
            BrandOverride.presets.save('Workflow A', { name: 'Brand A', colors: { primary: '#AA0000' } });
            BrandOverride.presets.save('Workflow B', { name: 'Brand B', colors: { primary: '#00BB00' } });
        });
        await page.reload();

        // Activate preset A
        await page.evaluate(() => BrandOverride.presets.activate('Workflow A'));
        await page.reload();
        expect(await page.evaluate(() => BRAND.name)).toBe('Brand A');

        // Switch to B
        await page.evaluate(() => BrandOverride.presets.activate('Workflow B'));
        await page.reload();
        expect(await page.evaluate(() => BRAND.name)).toBe('Brand B');

        // Delete B, should clear
        await page.evaluate(() => {
            BrandOverride.presets.delete('Workflow B');
            BrandOverride.clear();
        });
        await page.reload();
        const active = await page.evaluate(() => BrandOverride.presets.getActive());
        expect(active).toBeNull();
    });
});
