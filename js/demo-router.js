// demo-router.js
// Modulo centralizado de routing entre bloques del demo builder.
// Cada pagina de demo importa este modulo y usa getNextPageUrl()
// en vez de hardcodear la URL del siguiente bloque.
//
// Requiere: config/demo-builder-config.js cargado previamente
// (provee getOptionById, getDefaultDemoConfig)

// ============================================
// SESSION STORAGE
// ============================================

// Lee la config guardada por el builder en sessionStorage
function getDemoConfig() {
    try {
        var stored = sessionStorage.getItem('demoConfig');
        return stored ? JSON.parse(stored) : getDefaultDemoConfig();
    } catch (e) {
        return getDefaultDemoConfig();
    }
}

// Guarda la config (usado por el builder en index.html)
function saveDemoConfig(config) {
    sessionStorage.setItem('demoConfig', JSON.stringify(config));
}

// ============================================
// ROUTING
// ============================================

// Dado el bloque actual, retorna la URL del siguiente bloque.
// currentStage: 'arrival' | 'checkout' | 'payment'
// Retorna: URL string o null (si es el ultimo bloque)
function getNextPageUrl(currentStage) {
    var config = getDemoConfig();
    var isEmbedded = new URLSearchParams(window.location.search).get('embedded') === '1';
    var embeddedParam = isEmbedded ? '&embedded=1' : '';

    if (currentStage === 'arrival') {
        // Siguiente: checkout
        var checkoutOption = getOptionById('checkout', config.checkout);
        if (!checkoutOption) return 'checkout.html?flow=curp-deeplink' + embeddedParam;

        var flow = checkoutOption.flow || 'curp-deeplink';
        var source = config.arrival === 'qr' ? '&source=qr' : '';
        return checkoutOption.page + '?flow=' + flow + source + embeddedParam;
    }

    if (currentStage === 'checkout') {
        // Siguiente: payment (auth page)
        var checkoutOption = getOptionById('checkout', config.checkout);
        // If checkout forces a specific payment, use that instead of user's selection
        var paymentId = (checkoutOption && checkoutOption.forcedPayment) ? checkoutOption.forcedPayment : config.payment;
        var paymentOption = getOptionById('payment', paymentId);
        if (!paymentOption) return 'auth-mobile.html?bank=hey-banco&action=pay-domiciliar' + embeddedParam + '&session=' + Date.now();

        var authPage = paymentOption.authPage || 'auth-mobile.html';
        return authPage + '?bank=' + paymentOption.bank
            + '&action=' + paymentOption.action
            + embeddedParam
            + '&session=' + Date.now();
    }

    // payment es el ultimo bloque, no hay siguiente
    return null;
}

// ============================================
// HELPERS PARA PAGINAS ESPECIFICAS
// ============================================

// Retorna la URL de inicio de la demo (primera pagina del flujo).
// Usado por index.html para el boton "Iniciar Demo".
// viewMode: 'desktop' | 'mobile'
function getDemoStartUrl(viewMode) {
    var config = getDemoConfig();
    var arrivalOption = getOptionById('arrival', config.arrival);
    if (!arrivalOption) return 'whatsapp.html';

    if (viewMode === 'mobile') {
        if (!arrivalOption.mobileSupported) return null;
        return 'mobile-viewer.html?demo=' + arrivalOption.id;
    }

    return arrivalOption.page;
}
