// brand-config.js
// BRAND CONFIG: Este es el unico archivo que necesitas editar para cambiar de marca.
// Todos los demas archivos del proyecto leen de aqui.
// Al hacer rebranding, edita los valores de BRAND y reemplaza el logo en assets/brand/.

const BRAND = {
    // Identidad
    name: 'Telcel',
    fullName: 'Telcel',
    serviceType: 'Internet por tiempo',
    planName: '4 Horas',
    logo: 'assets/brand/telcel.svg',

    // Contacto y dominio
    domain: 'telcel.com',
    paymentDomain: 'pago.telcel.com',
    phone: '800 710 5000',
    phoneFriendly: '*111 desde tu Telcel',
    whatsapp: '55 7100 0000',

    // Datos de cuenta/servicio para la demo
    account: {
        number: '33 3667 9407',
        period: 'Julio 2026',
        dueDate: '20 de Julio 2026',
        dueDateShort: '20 Jul 2026',
        planAmount: 25.00,
        discount: 0.00,
        discountLabel: '',
        previousBalance: 0.00,
        totalAmount: 25.00,
        reference: '0900 0002 0845 2100 4',
    },

    // Colores de la marca
    colors: {
        primary: '#0B5FC0',
        primaryDark: '#094BA0',
        primaryLight: '#EAF3FD',
        accent: '#2E86E0',
        background: '#F5FAFF',
        headerBg: '#0A3E7A',
        btnText: '#ffffff',
    },

    // Factura PDF para la demo QR (no aplica al flujo Telcel)
    invoicePdf: 'assets/brand/factura-totalplay.pdf',

    // Deep link scheme (usado en simulacion de apps bancarias)
    deepLinkServiceParam: 'telcel',
};

// Helpers de formato
BRAND.formattedTotal = () =>
    '$' + BRAND.account.totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 });

BRAND.formattedPlanAmount = () =>
    '$' + BRAND.account.planAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 });

BRAND.formattedDiscount = () =>
    '-$' + Math.abs(BRAND.account.discount).toLocaleString('es-MX', { minimumFractionDigits: 2 });

BRAND.formattedPreviousBalance = () =>
    '$' + BRAND.account.previousBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 });

// Convertir hex a componentes RGB para usar en rgba()
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? parseInt(result[1], 16) + ', ' + parseInt(result[2], 16) + ', ' + parseInt(result[3], 16) : '0, 0, 0';
}

// Sincronizar colores de JS a CSS custom properties
function applyBrandColors() {
    var root = document.documentElement;
    var rgb = hexToRgb(BRAND.colors.primary);

    root.style.setProperty('--primary-color', BRAND.colors.primary);
    root.style.setProperty('--primary-dark', BRAND.colors.primaryDark);
    root.style.setProperty('--primary-light', BRAND.colors.primaryLight);
    root.style.setProperty('--secondary-color', BRAND.colors.primary);
    root.style.setProperty('--accent-color', BRAND.colors.accent);
    root.style.setProperty('--background', BRAND.colors.background);
    root.style.setProperty('--gradient-start', BRAND.colors.primary);
    root.style.setProperty('--gradient-end', BRAND.colors.accent);
    root.style.setProperty('--header-bg', BRAND.colors.headerBg);
    root.style.setProperty('--btn-text-color', BRAND.colors.btnText);

    // RGB components para uso en rgba() desde CSS
    root.style.setProperty('--primary-rgb', rgb);
    root.style.setProperty('--accent-rgb', hexToRgb(BRAND.colors.accent));

    // Sombras dinamicas basadas en el color primario
    root.style.setProperty('--shadow-sm', '0 2px 8px rgba(' + rgb + ', 0.10)');
    root.style.setProperty('--shadow-md', '0 4px 12px rgba(' + rgb + ', 0.15)');
    root.style.setProperty('--shadow-lg', '0 8px 24px rgba(' + rgb + ', 0.18)');
    root.style.setProperty('--shadow-xl', '0 12px 32px rgba(' + rgb + ', 0.22)');

    // Aliases --tp-* usados en index.html y qr-styles
    root.style.setProperty('--tp-primary', BRAND.colors.primary);
    root.style.setProperty('--tp-dark', BRAND.colors.headerBg);
    root.style.setProperty('--tp-text', BRAND.colors.btnText);
}

document.addEventListener('DOMContentLoaded', applyBrandColors);
