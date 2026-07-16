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

// Flows validos (para deep-links por URL). Ver demo-builder-config.js.
var VALID_FLOWS = ['sin-dato', 'curp-deeplink', 'dato-push', 'account-to-account', 'bbva-direct', 'nubank-impuestos'];

// Lee la config del demo con precedencia: URL query params > sessionStorage > default.
// Esto permite deep-links cross-device (ej. QR escaneado en otro celular): la config
// viaja en la URL, se valida contra el catalogo (getOptionById) y se persiste para la
// navegacion same-device. Sin params, cae a sessionStorage/default (backward-compat).
function getDemoConfig() {
    var def = getDefaultDemoConfig();

    var stored = {};
    try {
        var raw = sessionStorage.getItem('demoConfig');
        if (raw) stored = JSON.parse(raw) || {};
    } catch (e) { stored = {}; }

    var params = null;
    try { params = new URLSearchParams(window.location.search); } catch (e) { params = null; }

    var config = {};
    ['arrival', 'checkout', 'payment'].forEach(function(stage) {
        var fromUrl = params ? params.get(stage) : null;
        // Solo aceptar ids validos del catalogo; si no, caer a stored/default
        if (fromUrl && typeof getOptionById === 'function' && getOptionById(stage, fromUrl)) {
            config[stage] = fromUrl;
        } else {
            config[stage] = stored[stage] || def[stage];
        }
    });

    // flow es string libre: validar contra whitelist
    var fromUrlFlow = params ? params.get('flow') : null;
    if (fromUrlFlow && VALID_FLOWS.indexOf(fromUrlFlow) !== -1) {
        config.flow = fromUrlFlow;
    } else if (stored.flow) {
        config.flow = stored.flow;
    }

    // Persistir el merge para continuidad de navegacion en el mismo dispositivo
    try { sessionStorage.setItem('demoConfig', JSON.stringify(config)); } catch (e) {}

    return config;
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
// Serializa los ids de config para propagarlos por la URL (deep-link cross-device).
// Ojo: NO incluye flow (ya se agrega explicito en la rama arrival) para evitar duplicarlo.
function configQuery(config) {
    return '&checkout=' + config.checkout + '&payment=' + config.payment;
}

function getNextPageUrl(currentStage) {
    var config = getDemoConfig();
    var isEmbedded = new URLSearchParams(window.location.search).get('embedded') === '1';
    var embeddedParam = isEmbedded ? '&embedded=1' : '';
    var cfgParam = configQuery(config);

    if (currentStage === 'arrival') {
        // Siguiente: checkout
        var checkoutOption = getOptionById('checkout', config.checkout);
        if (!checkoutOption) return 'checkout.html?flow=curp-deeplink' + cfgParam + embeddedParam;

        var flow = checkoutOption.flow || 'curp-deeplink';
        var source = config.arrival === 'qr' ? '&source=qr' : '';
        return checkoutOption.page + '?flow=' + flow + source + cfgParam + embeddedParam;
    }

    if (currentStage === 'checkout') {
        // Siguiente: payment (auth page)
        var checkoutOption = getOptionById('checkout', config.checkout);
        // If checkout forces a specific payment, use that instead of user's selection
        var paymentId = (checkoutOption && checkoutOption.forcedPayment) ? checkoutOption.forcedPayment : config.payment;
        var paymentOption = getOptionById('payment', paymentId);
        if (!paymentOption) return 'auth-mobile.html?bank=hey-banco&action=pay-domiciliar' + cfgParam + embeddedParam + '&session=' + Date.now();

        var authPage = paymentOption.authPage || 'auth-mobile.html';
        return authPage + '?bank=' + paymentOption.bank
            + '&action=' + paymentOption.action
            + cfgParam
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
