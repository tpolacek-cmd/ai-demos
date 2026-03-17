// brand-config.js
// BRAND CONFIG: Este es el unico archivo que necesitas editar para cambiar de marca.
// Todos los demas archivos del proyecto leen de aqui.
// Al hacer rebranding, edita los valores de BRAND y reemplaza el logo en assets/brand/.

const BRAND = {
    // Identidad
    name: 'Totalplay',
    fullName: 'Totalplay México',
    serviceType: 'Internet y TV',
    planName: 'Plan Sónico - Simétrico',
    logo: 'assets/brand/totalplay.png',

    // Contacto y dominio
    domain: 'totalplay.com.mx',
    paymentDomain: 'pago.totalplay.com.mx',
    phone: '800 868 2527',
    phoneFriendly: '800 totalplay',
    whatsapp: '55 6611 0060',

    // Datos de cuenta/factura para la demo
    account: {
        number: '0102-8178-61',
        period: '10 Feb - 09 Mar 2026',
        dueDate: '28 de Febrero 2026',
        dueDateShort: '28 Feb 2026',
        planAmount: 880.00,
        discount: -40.00,
        discountLabel: 'Descuento por lealtad',
        previousBalance: 0.00,
        totalAmount: 840.00,
        reference: '0900 0001 0281 7861 3',
    },

    // Colores de la marca
    colors: {
        primary: '#DBE442',
        primaryDark: '#C5CD2E',
        primaryLight: '#F9FBEB',
        accent: '#E5EC6B',
        background: '#FDFDE8',
        headerBg: '#2A3444',
        btnText: '#1a1a2e',
    },

    // Deep link scheme (usado en simulacion de apps bancarias)
    deepLinkServiceParam: 'totalplay',
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

// Sincronizar colores de JS a CSS custom properties
function applyBrandColors() {
    const root = document.documentElement;
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

    // Also set --tp-* variants used in index.html and qr-styles
    root.style.setProperty('--tp-primary', BRAND.colors.primary);
    root.style.setProperty('--tp-dark', BRAND.colors.headerBg);
    root.style.setProperty('--tp-text', BRAND.colors.btnText);
}

document.addEventListener('DOMContentLoaded', applyBrandColors);
