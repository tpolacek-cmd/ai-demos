// demo-builder-config.js
// Define las 3 etapas del demo builder y las opciones disponibles para cada una.
// Esta es la UNICA fuente de verdad para agregar/quitar opciones del builder.
//
// Para agregar una opcion: agregar una entrada al array options de la etapa correspondiente.
// Para agregar una etapa: agregar un objeto al array DEMO_STAGES (requiere cambios en demo-router.js).
//
// Requiere: config/banks-config.js cargado previamente (para referencias a bancos en etapa payment).

// Valores validos para 'flow' en opciones de checkout:
//   'sin-dato'            - Sin pedido de dato de identidad
//   'curp-deeplink'       - Pide CURP/RFC/CLABE + deeplink al banco
//   'dato-push'           - Pide dato personal + push notification
//   'account-to-account'  - Flujo de transferencia entre cuentas (A2A)
//
// Para exponer un banco en el builder, agregar una entrada en DEMO_STAGES[2].options.
// El campo 'bank' debe coincidir con una key de BANKS en banks-config.js.

const DEMO_STAGES = [
    {
        id: 'arrival',
        label: 'Canal de llegada',
        description: 'Como llega el cliente al pago',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>',
        options: [
            {
                id: 'whatsapp',
                name: 'WhatsApp',
                description: 'Chat interactivo con link de pago',
                page: 'whatsapp.html',
                mobileSupported: true,
                icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
            },
            {
                id: 'qr',
                name: 'QR en Factura',
                description: 'Factura PDF con codigo QR integrado',
                page: 'qr.html',
                mobileSupported: false,
                icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/><rect x="2" y="14" width="8" height="8" rx="1"/><rect x="5" y="5" width="2" height="2" fill="currentColor" stroke="none"/><rect x="17" y="5" width="2" height="2" fill="currentColor" stroke="none"/><rect x="5" y="17" width="2" height="2" fill="currentColor" stroke="none"/><line x1="14" y1="14" x2="14" y2="16"/><line x1="18" y1="14" x2="22" y2="14"/><line x1="14" y1="20" x2="14" y2="22"/><line x1="18" y1="18" x2="18" y2="22"/><line x1="22" y1="18" x2="22" y2="22"/></svg>',
            },
            {
                id: 'nubank-impuestos',
                name: 'Nubank Impuestos',
                description: 'App Nubank - Pago de impuestos estatales',
                page: 'nubank-impuestos.html',
                mobileSupported: true,
                mobileOnly: true,
                group: 'nubank-impuestos',
                icon: '<img src="assets/banks/nu.jpeg" alt="Nubank" style="width: 28px; height: 28px; object-fit: contain; border-radius: 6px;">',
            },
            {
                id: 'compartamos-whatsapp',
                name: 'Compartamos WhatsApp',
                description: 'Bot de cobranza — genera portal personalizado',
                page: 'compartamos-whatsapp.html',
                mobileSupported: true,
                icon: '<img src="assets/brand/compartamos.png" alt="Compartamos" style="width: 28px; height: 28px; object-fit: contain; border-radius: 6px; background: white; padding: 2px;">',
            },
            {
                id: 'telcel',
                name: 'Telcel',
                description: 'App Mi Telcel — compra de paquete Internet por tiempo',
                page: 'telcel.html',
                mobileSupported: true,
                icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="18" rx="4" fill="#0b5fc0"/><text x="12" y="15.5" font-family="Arial,sans-serif" font-size="8" font-weight="bold" fill="white" text-anchor="middle">tel</text></svg>',
            },
        ]
    },
    {
        id: 'checkout',
        label: 'Portal de pago',
        description: 'Experiencia de seleccion de pago',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
        options: [
            {
                id: 'portal-standard',
                name: 'Portal Estandar',
                description: 'Checkout con multiples metodos de pago y domiciliacion',
                page: 'checkout.html',
                flow: 'curp-deeplink',
                icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/><path d="M13 13h4"/><path d="M13 17h4"/></svg>',
            },
            {
                id: 'pago-directo-bbva',
                name: 'Pago Directo BBVA',
                description: 'Portal de deudas con Pago Directo BBVA',
                page: 'checkout-bbva.html',
                flow: 'bbva-direct',
                forcedPayment: 'bbva',
                icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/><path d="M9 6h6"/><path d="M9 10h6"/></svg>',
            },
            {
                id: 'nubank-impuestos-checkout',
                name: 'Nubank Impuestos',
                description: 'Flujo in-app de pago de impuestos',
                page: 'nubank-impuestos.html',
                flow: 'nubank-impuestos',
                group: 'nubank-impuestos',
                icon: '<img src="assets/banks/nu.jpeg" alt="Nubank" style="width: 28px; height: 28px; object-fit: contain; border-radius: 6px;">',
            },
        ]
    },
    {
        id: 'payment',
        label: 'Flujo de pago',
        description: 'Metodo de pago y app bancaria',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>',
        options: [
            {
                id: 'hey-banco',
                name: 'Hey Banco',
                description: 'Pago y domiciliacion via Hey Banco',
                bank: 'hey-banco',
                action: 'pay-domiciliar',
                authPage: 'auth-mobile.html',
                icon: '<img src="assets/banks/Hey_Banco.svg" alt="Hey Banco" style="width: 28px; height: 28px; object-fit: contain; border-radius: 6px; background: white; padding: 2px;">',
            },
            {
                id: 'bbva',
                name: 'BBVA',
                description: 'Pago Directo via app BBVA',
                bank: 'bbva',
                action: 'pay-domiciliar',
                authPage: 'auth-bbva.html',
                icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="3" fill="#004481"/><text x="12" y="14.5" font-family="Arial,sans-serif" font-size="7" font-weight="bold" fill="white" text-anchor="middle">BBVA</text></svg>',
            },
            {
                id: 'nubank-impuestos-payment',
                name: 'Nubank',
                description: 'Confirmacion de pago en app Nubank',
                bank: 'nubank',
                action: 'pay-impuestos',
                authPage: 'nubank-impuestos.html',
                group: 'nubank-impuestos',
                icon: '<img src="assets/banks/nu.jpeg" alt="Nubank" style="width: 28px; height: 28px; object-fit: contain; border-radius: 6px;">',
            },
            {
                id: 'video',
                name: 'Video Nubank',
                description: 'Autenticacion Nubank + video del flujo de pago',
                bank: 'video',
                action: 'play',
                authPage: 'video-player.html',
                videoSrc: 'assets/videos/segiagua_cut.mp4',
                icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>',
            },
        ]
    }
];

// ============================================
// HELPERS
// ============================================

// Obtener etapa por id
function getStageById(stageId) {
    return DEMO_STAGES.find(function(s) { return s.id === stageId; }) || null;
}

// Obtener opcion dentro de una etapa
function getOptionById(stageId, optionId) {
    var stage = getStageById(stageId);
    if (!stage) return null;
    return stage.options.find(function(o) { return o.id === optionId; }) || null;
}

// Obtener la config default (primera opcion de cada etapa)
function getDefaultDemoConfig() {
    var config = {};
    DEMO_STAGES.forEach(function(stage) {
        if (stage.options.length > 0) {
            config[stage.id] = stage.options[0].id;
        }
    });
    return config;
}
