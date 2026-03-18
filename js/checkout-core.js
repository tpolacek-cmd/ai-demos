// ============================================
// CHECKOUT CORE
// Seleccion de metodo de pago, seleccion de banco, flujo sin-dato, deep links
// Globals definidos: selectedMethod, selectedBank, currentFlow
// Depende de: config/brand-config.js, config/banks-config.js
// ============================================

// DOM Elements
const paymentOptions = document.querySelectorAll('.payment-option');
const modal = document.getElementById('successModal');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const banksSelection = document.getElementById('banksSelection');
const banksSelectionPagaDomicilia = document.getElementById('banksSelectionPagaDomicilia');
const bankCards = document.querySelectorAll('.bank-card');
const qrModal = document.getElementById('qrModal');

let selectedMethod = null;
let selectedBank = null;
let currentFlow = null;

// Get current flow from URL or sessionStorage
const urlParams = new URLSearchParams(window.location.search);
currentFlow = urlParams.get('flow') || sessionStorage.getItem('selectedFlow') || 'sin-dato';

// Embedded mode detection (inside mobile viewer iframe)
var isCheckoutEmbedded = new URLSearchParams(window.location.search).get('embedded') === '1';

// Device detection
function isMobileDevice() {
    // If embedded in mobile viewer, always behave as mobile
    if (isCheckoutEmbedded) return true;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
}

// Messages for each payment method
const messages = {
    'paga-domicilia': {
        title: '¡La mejor decisión!',
        message: 'Domiciliarás tus pagos futuros con {bank} y opcionalmente pagarás tu deuda actual. Todo resuelto en un solo paso.'
    },
    domiciliar: {
        title: '¡Excelente elección!',
        message: 'Has elegido domiciliar tu cuenta con {bank}. Nunca más te preocupes por olvidar un pago. Tu servicio se pagará automáticamente cada mes.'
    },
    tarjeta: {
        title: 'Pago con Tarjeta',
        message: 'Procesaremos tu pago de forma segura con tu tarjeta de débito o crédito.'
    },
    transferencia: {
        title: 'Transferencia Bancaria',
        message: 'Te proporcionaremos los datos para realizar tu transferencia bancaria de forma segura.'
    },
    tiendas: {
        title: 'Pago en Tiendas',
        message: 'Generaremos un código de barras que podrás pagar en OXXO, 7-Eleven y otras tiendas.'
    }
};

// Bank names, logos, colors, and identity requirements now come from config/banks-config.js
// (bankNames, bankLogos, bankColors, bankIdentityRequirements are defined there)

// Handle payment option selection
paymentOptions.forEach(option => {
    option.addEventListener('click', () => {
        console.log('=== PAYMENT OPTION CLICKED ===');
        console.log('Option method:', option.dataset.method);
        
        // Remove selected class from all options
        paymentOptions.forEach(opt => opt.classList.remove('selected'));
        
        // Add selected class to clicked option
        option.classList.add('selected');
        
        // Store selected method
        selectedMethod = option.dataset.method;
        
        console.log('Selected method set to:', selectedMethod);
        
        // Hide both bank selections first
        if (banksSelection) banksSelection.style.display = 'none';
        if (banksSelectionPagaDomicilia) banksSelectionPagaDomicilia.style.display = 'none';
        
        // Show appropriate banks selection based on method
        if (selectedMethod === 'paga-domicilia') {
            console.log('Showing banks for Pago Automático');
            if (banksSelectionPagaDomicilia) {
                banksSelectionPagaDomicilia.style.display = 'block';
                console.log('Banks displayed successfully');
            } else {
                console.error('banksSelectionPagaDomicilia element not found!');
            }
            selectedBank = null;
        } else {
            selectedBank = null;
        }
        
        // Add a small animation feedback
        option.style.transform = 'scale(0.98)';
        setTimeout(() => {
            option.style.transform = '';
        }, 100);
    });
});

// Handle bank card selection
// Handle mobile bank selector
const bankSelectMobile = document.getElementById('bankSelectMobile');
if (bankSelectMobile) {
    bankSelectMobile.addEventListener('change', (e) => {
        const selectedValue = e.target.value;
        if (!selectedValue) return; // Skip if "Elige tu banco..." is selected
        
        selectedBank = selectedValue;
        const method = bankSelectMobile.dataset.method;
        selectedMethod = method;
        
        console.log('=== MOBILE BANK SELECT CHANGED ===');
        console.log('Bank:', selectedBank);
        console.log('Current Flow:', currentFlow);
        console.log('Selected Method:', selectedMethod);
        
        // Handle the same flows as bank cards
        if (currentFlow === 'account-to-account' && selectedMethod === 'paga-domicilia') {
            console.log('Opening CLABE modal for account-to-account flow');
            showClabeModal(selectedBank);
            return;
        }
        
        if (currentFlow === 'sin-dato' && selectedMethod === 'paga-domicilia') {
            handleSinDatoFlow(selectedBank);
            return;
        }
        
        if (currentFlow === 'curp-deeplink' && selectedMethod === 'paga-domicilia') {
            showIdentityValidationInline(selectedBank);
            return;
        }
        
        if (currentFlow === 'dato-push' && selectedMethod === 'paga-domicilia') {
            showCurpModalForPush(selectedBank);
            return;
        }
        
        // Normal flow for other cases
        showSuccessModal();
    });
}

bankCards.forEach(card => {
    card.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Store selected bank
        selectedBank = card.dataset.bank;
        
        console.log('=== BANK CARD CLICKED ===');
        console.log('Bank:', selectedBank);
        console.log('Current Flow:', currentFlow);
        console.log('Selected Method:', selectedMethod);
        
        // Remove selected class from all bank cards first
        bankCards.forEach(c => c.classList.remove('selected'));
        
        // Add selected class to clicked card
        card.classList.add('selected');
        
        // Check if flow is "account-to-account" and show CLABE modal
        if (currentFlow === 'account-to-account' && selectedMethod === 'paga-domicilia') {
            console.log('Opening CLABE modal for account-to-account flow');
            showClabeModal(selectedBank);
            return;
        }
        
        // Check if flow is "sin-dato" and handle immediately
        if (currentFlow === 'sin-dato' && selectedMethod === 'paga-domicilia') {
            handleSinDatoFlow(selectedBank);
            return;
        }
        
        // Check if flow is "curp-deeplink" and show identity validation inline
        if (currentFlow === 'curp-deeplink' && selectedMethod === 'paga-domicilia') {
            showIdentityValidationInline(selectedBank);
            return;
        }
        
        // Check if flow is "dato-push" and show CURP modal for push notification
        if (currentFlow === 'dato-push' && selectedMethod === 'paga-domicilia') {
            showCurpModalForPush(selectedBank);
            return;
        }
        
        // Normal flow for other cases
        // Add animation feedback
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
            card.style.transform = '';
        }, 100);
    });
});

// Handle "sin-dato" flow
function handleSinDatoFlow(bank) {
    const isMobile = isMobileDevice();
    
    if (isMobile) {
        // Mobile: redirect directly to bank authentication
        redirectToBankAuth(bank);
    } else {
        // Desktop: show QR modal
        showQRModal(bank);
    }
}

// Redirect to bank authentication (mobile)
function redirectToBankAuth(bank) {
    const isPagaDomicilia = selectedMethod === 'paga-domicilia';
    const actionLabel = isPagaDomicilia ? 'Procesando domiciliacion y pago' : 'Redirigiendo';

    // If embedded in mobile viewer, navigate directly to auth-mobile
    if (isCheckoutEmbedded) {
        const baseUrl = window.location.origin + window.location.pathname.replace('checkout.html', '');
        const actionType = isPagaDomicilia ? 'pay-domiciliar' : 'domiciliar';
        const authUrl = `${baseUrl}auth-mobile.html?bank=${bank}&action=${actionType}&embedded=1&session=${Date.now()}`;
        window.location.href = authUrl;
        return;
    }
    
    // Show loading indicator
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'redirect-loading';
    loadingOverlay.innerHTML = `
        <div class="redirect-content">
            <div class="spinner"></div>
            <h3>${actionLabel} con ${bankNames[bank]}...</h3>
            <p>Por favor espera un momento</p>
        </div>
    `;
    document.body.appendChild(loadingOverlay);
    
    // Simulate redirect after 1.5 seconds
    setTimeout(() => {
        const isPagaDomicilia = selectedMethod === 'paga-domicilia';
        const action = isPagaDomicilia ? 'pay-domiciliar' : 'domiciliar';
        
        // In production, this would be the actual deep link to the bank app
        // BRAND: deep link service parameter
        const deepLinks = {
            santander: `santander://auth?service=${BRAND.deepLinkServiceParam}&action=${action}`,
            'hey-banco': `hey://auth?service=${BRAND.deepLinkServiceParam}&action=${action}`,
            stori: `stori://auth?service=${BRAND.deepLinkServiceParam}&action=${action}`,
            bbva: `bbva://auth?service=${BRAND.deepLinkServiceParam}&action=${action}`,
            banamex: `banamex://auth?service=${BRAND.deepLinkServiceParam}&action=${action}`,
            hsbc: `hsbc://auth?service=${BRAND.deepLinkServiceParam}&action=${action}`,
            banorte: `banorte://auth?service=${BRAND.deepLinkServiceParam}&action=${action}`,
            scotiabank: `scotiabank://auth?service=${BRAND.deepLinkServiceParam}&action=${action}`,
            tapi: `tapi://auth?service=${BRAND.deepLinkServiceParam}&action=${action}`
        };
        
        const successTitle = isPagaDomicilia ? '¡Todo listo!' : '¡Redirigiendo!';
        const successMessage = isPagaDomicilia 
            ? `En producción, domiciliarías y pagarías con ${bankNames[bank]}` 
            : `En producción, esto abriría la app de ${bankNames[bank]}`;
        
        // For demo purposes, just show a message
        loadingOverlay.innerHTML = `
            <div class="redirect-content">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="${BRAND.colors.primary}" stroke-width="2"/>
                    <path d="M8 12L11 15L16 9" stroke="${BRAND.colors.primary}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <h3>${successTitle}</h3>
                <p>${successMessage}</p>
                <button class="btn-primary" onclick="closeRedirectLoading()">Entendido</button>
            </div>
        `;
        
        // In production: window.location.href = deepLinks[bank];
    }, 1500);
}

// Show bank link modal (desktop)
function showQRModal(bank) {
    const bankLinkTitle = document.getElementById('bankLinkTitle');
    const bankLinkSubtitle = document.getElementById('bankLinkSubtitle');
    const bankLinkLogo = document.getElementById('bankLinkLogo');
    const bankBtnText = document.getElementById('bankBtnText');
    const paymentStepItem = document.getElementById('paymentStepItem');
    
    const isPagaDomicilia = selectedMethod === 'paga-domicilia';
    
    // Update modal content
    bankLinkTitle.textContent = isPagaDomicilia 
        ? `Domiciliar y Pagar con ${bankNames[bank]}` 
        : `Domiciliar con ${bankNames[bank]}`;
    bankLinkSubtitle.textContent = isPagaDomicilia 
        ? 'Configura tus pagos automáticos futuros y opcionalmente paga tu deuda actual de ' + BRAND.formattedTotal() 
        : 'Configura tus pagos automáticos sin pagar ahora';
    
    // Update button text
    bankBtnText.textContent = `Abrir app de ${bankNames[bank]}`;
    
    // Show/hide payment step based on action
    if (isPagaDomicilia) {
        paymentStepItem.style.display = 'flex';
    } else {
        paymentStepItem.style.display = 'none';
    }
    
    // BRAND: fallback color for bank logo (colors from banks-config.js)
    bankLinkLogo.style.background = bankColors[bank] || BRAND.colors.primary;
    bankLinkLogo.innerHTML = `<span style="color: white; font-size: 24px; font-weight: 600;">${bankNames[bank].substring(0, 2)}</span>`;
    
    // Store bank and action for openBankApp function
    window.currentBank = bank;
    window.currentAction = isPagaDomicilia ? 'pay-domiciliar' : 'domiciliar';
    
    // Show modal
    qrModal.classList.add('show');
}

// Open bank app function
function openBankApp() {
    const bank = window.currentBank;
    const action = window.currentAction;
    
    // Build URL to auth-mobile page
    const baseUrl = window.location.origin + window.location.pathname.replace('checkout.html', '');

    if (isCheckoutEmbedded) {
        // In mobile viewer: navigate directly to auth-mobile (we're already in a phone frame)
        const authUrl = `${baseUrl}auth-mobile.html?bank=${bank}&action=${action}&embedded=1&session=${Date.now()}`;
        window.location.href = authUrl;
        return;
    }

    const authUrl = `${baseUrl}auth-mobile.html?bank=${bank}&action=${action}&session=${Date.now()}`;
    
    // Open in new window with mobile dimensions
    window.open(authUrl, '_blank', 'width=420,height=900,resizable=yes,scrollbars=yes');
    
    // Optional: Close the modal after opening
    setTimeout(() => {
        closeQRModal();
    }, 500);
}

// Close QR modal
function closeQRModal() {
    qrModal.classList.remove('show');
}

// Close redirect loading
function closeRedirectLoading() {
    const overlay = document.querySelector('.redirect-loading');
    if (overlay) {
        overlay.remove();
    }
}

// Close modal function
function closeModal() {
    modal.classList.remove('show');
}

// Close modals when clicking outside
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

if (qrModal) {
    qrModal.addEventListener('click', (e) => {
        if (e.target === qrModal) {
            closeQRModal();
        }
    });
}

// Keyboard accessibility
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (modal.classList.contains('show')) {
            closeModal();
        }
        if (qrModal && qrModal.classList.contains('show')) {
            closeQRModal();
        }
        const redirectOverlay = document.querySelector('.redirect-loading');
        if (redirectOverlay) {
            closeRedirectLoading();
        }
    }
});

// Add hover effect sounds (optional - can be enabled if desired)
paymentOptions.forEach(option => {
    option.addEventListener('mouseenter', () => {
        option.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    });
});

// Auto-select featured option after a delay (for demo purposes)
setTimeout(() => {
    const featuredOption = document.querySelector('.payment-option.featured');
    if (featuredOption && !selectedMethod) {
        // Add a subtle glow animation to draw attention
        featuredOption.style.animation = 'pulse 2s infinite';
    }
}, 1000);


