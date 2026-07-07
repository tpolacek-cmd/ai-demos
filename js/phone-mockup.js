// ============================================
// PHONE MOCKUP SIMULATION
// Overlay de phone mockup para desktop: simula escaneo QR abriendo auth-mobile en iframe
// Depende de: checkout-core.js (selectedMethod)
// Depende de: identity-validation.js (currentInlineBank)
// Depende de: qr-checkout-flow.js (closeTapiQRModal)
// ============================================

function simulateQRScan() {
    const bank = window.currentBank || currentInlineBank || 'hey-banco';
    const actionType = selectedMethod === 'paga-domicilia' ? 'pay-domiciliar' : 'domiciliar';
    
    const identityValue = sessionStorage.getItem('userCurp') || 
                          sessionStorage.getItem('userRFC') || 
                          sessionStorage.getItem('userCLABE') || '';
    
    const identityType = sessionStorage.getItem('identityType') || 'curp';
    const paramName = identityType === 'rfc' ? 'rfc' : identityType === 'clabe' ? 'clabe' : 'curp';
    
    closeTapiQRModal();

    var authPage = 'auth-mobile.html';
    if (typeof getOptionById === 'function') {
        var payOpt = getOptionById('payment', bank);
        if (payOpt && payOpt.authPage) authPage = payOpt.authPage;
    }

    // If embedded in mobile viewer, navigate directly (already in a phone frame)
    if (isCheckoutEmbedded) {
        const baseUrl = window.location.origin + window.location.pathname.replace(/[^\/]*$/, '');
        const authUrl = `${baseUrl}${authPage}?bank=${bank}&action=${actionType}&${paramName}=${encodeURIComponent(identityValue)}&embedded=1&session=${Date.now()}`;
        setTimeout(() => { window.location.href = authUrl; }, 300);
        return;
    }

    setTimeout(() => {
        const baseUrl = window.location.origin + window.location.pathname.replace(/[^\/]*$/, '');
        const authUrl = `${baseUrl}${authPage}?bank=${bank}&action=${actionType}&${paramName}=${encodeURIComponent(identityValue)}&embedded=1&session=${Date.now()}`;
        
        const phoneOverlay = document.getElementById('phoneMockupOverlay');
        const phoneIframe = document.getElementById('phoneIframe');
        
        if (phoneOverlay && phoneIframe) {
            phoneIframe.src = authUrl;
            phoneOverlay.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }, 400);
}

function closePhoneMockup() {
    const phoneOverlay = document.getElementById('phoneMockupOverlay');
    const phoneIframe = document.getElementById('phoneIframe');
    
    if (phoneOverlay) {
        phoneOverlay.classList.remove('show');
        document.body.style.overflow = '';
        
        setTimeout(() => {
            if (phoneIframe) phoneIframe.src = '';
        }, 400);
    }
}

// Listen for messages from the embedded phone iframe
window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'phone-mockup-close') {
        closePhoneMockup();
    }
});
