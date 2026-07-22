const { test, expect } = require('/home/manuel/.nvm/versions/node/v24.13.0/lib/node_modules/playwright/test.js');

const BASE = 'http://localhost:8000';

test('BBVA in checkout standard → navigate to auth-bbva', async ({ page }) => {
    await page.goto(BASE + '/checkout.html?flow=curp-deeplink');
    await page.evaluate(() => {
        sessionStorage.setItem('demoConfig', JSON.stringify({
            arrival: 'whatsapp',
            checkout: 'portal-standard',
            payment: 'bbva'
        }));
    });
    await page.reload();

    // 1. Select Pago Automatico + BBVA
    await page.locator('[data-method="paga-domicilia"]').first().click();
    await page.waitForTimeout(300);
    await page.locator('[data-bank="bbva"]').first().click();
    await page.waitForTimeout(500);

    // 2. Fill CLABE (BBVA requires CLABE, 18 digits)
    await page.fill('#identityInputInline', '012180001234567890');
    await page.evaluate(() => {
        var cb = document.getElementById('tycCheckboxInline');
        cb.checked = true;
        cb.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForTimeout(300);

    // 3. Click continuar
    await page.click('#btnValidateInline');
    await page.waitForTimeout(800);

    // 4. tapiQRModal should be open, verify currentBank is bbva
    const currentBank = await page.evaluate(() => window.currentBank);
    console.log('window.currentBank:', currentBank);
    expect(currentBank).toBe('bbva');

    // 5. Click QR to simulate scan (opens phone mockup with iframe)
    await page.locator('.qr-clickable').click();
    await page.waitForTimeout(1000);

    // 6. Check the phone mockup iframe src
    const iframeSrc = await page.evaluate(() => {
        var iframe = document.getElementById('phoneIframe');
        return iframe ? iframe.src : 'no iframe';
    });
    console.log('Phone iframe src:', iframeSrc);
    expect(iframeSrc).toContain('auth-bbva.html');
});

test('Hey Banco in checkout standard → navigate to auth-mobile', async ({ page }) => {
    await page.goto(BASE + '/checkout.html?flow=curp-deeplink');
    await page.evaluate(() => {
        sessionStorage.setItem('demoConfig', JSON.stringify({
            arrival: 'whatsapp',
            checkout: 'portal-standard',
            payment: 'hey-banco'
        }));
    });
    await page.reload();

    // 1. Select Pago Automatico + Hey Banco
    await page.locator('[data-method="paga-domicilia"]').first().click();
    await page.waitForTimeout(300);
    await page.locator('[data-bank="hey-banco"]').first().click();
    await page.waitForTimeout(500);

    // 2. Fill CURP (Hey Banco requires CURP)
    await page.fill('#identityInputInline', 'BEMD850101HDFRNN09');
    await page.evaluate(() => {
        var cb = document.getElementById('tycCheckboxInline');
        cb.checked = true;
        cb.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForTimeout(300);

    // 3. Click continuar
    await page.click('#btnValidateInline');
    await page.waitForTimeout(800);

    // 4. Verify currentBank
    const currentBank = await page.evaluate(() => window.currentBank);
    console.log('window.currentBank:', currentBank);
    expect(currentBank).toBe('hey-banco');

    // 5. Click QR
    await page.locator('.qr-clickable').click();
    await page.waitForTimeout(1000);

    // 6. Check iframe goes to auth-mobile
    const iframeSrc = await page.evaluate(() => {
        var iframe = document.getElementById('phoneIframe');
        return iframe ? iframe.src : 'no iframe';
    });
    console.log('Phone iframe src:', iframeSrc);
    expect(iframeSrc).toContain('auth-mobile.html');
});
