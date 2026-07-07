// ============================================
// QR CHECKOUT FLOW
// Flujo QR de TAPI dentro del checkout (generacion QR, countdown, simulacion scan)
// NO confundir con qr-script.js que es el viewer de la factura PDF.
// Depende de: checkout-core.js (selectedMethod, selectedBank)
// Depende de: identity-validation.js (closeCurpModal)
// Depende de: config/banks-config.js (BANKS)
// Depende de: config/brand-config.js (BRAND)
// ============================================

const tapiQRModal = document.getElementById('tapiQRModal');
const tapiQRCode = document.getElementById('tapiQRCode');
const qrLoading = document.getElementById('qrLoading');

// Generic function to show QR flow for any bank (desktop)
function showBankQRFlow(bank, identityValue) {
    // Close CURP modal
    closeCurpModal();

    // Store bank for simulateQRScan and openBankApp to use
    window.currentBank = bank;

    // Show QR modal after a brief delay
    setTimeout(() => {
        tapiQRModal.classList.add('show');
        generateBankQR(bank, identityValue);
    }, 300);
}

// Generic function to redirect to bank app (mobile) - Simulates deep link behavior
function redirectToBankApp(bank, identityValue) {
    const isPagaDomicilia = selectedMethod === 'paga-domicilia';
    
    // Bank config from centralized banks-config.js
    const bankData = BANKS[bank] || BANKS['hey-banco'];
    const config = {
        name: bankData.name,
        logo: bankData.logoHtmlRedirect || bankData.logoHtml,
        bgColor: bankData.color,
        paramName: bankData.identityType
    };

    // Close the CURP modal first
    closeCurpModal();
    
    // Create browser exit animation overlay
    const exitOverlay = document.createElement('div');
    exitOverlay.className = 'browser-exit-animation';
    exitOverlay.innerHTML = `
        <div class="browser-minimize-effect">
            <div class="exit-content">
                <div class="bank-logo-exit" style="background: ${config.bgColor}; border-radius: 20px; padding: 24px; margin-bottom: 16px;">
                    ${config.logo}
                </div>
                <div class="app-name-exit">${config.name}</div>
                <div class="exit-hint">Abriendo aplicación...</div>
            </div>
        </div>
    `;
    document.body.appendChild(exitOverlay);
    
    // Trigger animation after a brief moment
    setTimeout(() => {
        exitOverlay.classList.add('active');
    }, 50);
    
    // Redirect after animation completes
    setTimeout(() => {
        const actionType = isPagaDomicilia ? 'pay-domiciliar' : 'domiciliar';
        const baseUrl = window.location.origin + window.location.pathname.replace(/[^\/]*$/, '');
        const embeddedParam = isCheckoutEmbedded ? '&embedded=1' : '';
        var authPage = 'auth-mobile.html';
        if (typeof getOptionById === 'function') {
            var payOpt = getOptionById('payment', bank);
            if (payOpt && payOpt.authPage) authPage = payOpt.authPage;
        }
        const authUrl = `${baseUrl}${authPage}?bank=${bank}&action=${actionType}&${config.paramName}=${encodeURIComponent(identityValue)}${embeddedParam}&session=${Date.now()}`;
        
        // BRAND: deep link service parameter
        // In production: const deepLink = `${bank}://auth?service=${BRAND.deepLinkServiceParam}&action=${actionType}&${config.paramName}=${encodeURIComponent(identityValue)}`;
        window.location.href = authUrl;
    }, 1200);
}

// Generate QR code for any bank
function generateBankQR(bank, identityValue) {
    // Bank config from centralized banks-config.js
    const bankData = BANKS[bank] || BANKS['hey-banco'];
    const config = {
        name: bankData.name,
        paramName: bankData.identityType,
        color: bankData.color,
        logo: bankData.logoHtmlQR || bankData.logoHtml
    };

    // Update modal logo dynamically
    const logoContainer = document.getElementById('qrBankLogo');
    if (logoContainer) {
        logoContainer.innerHTML = config.logo;
    }
    
    // Update modal title and subtitle dynamically
    const modalTitle = document.getElementById('qrModalTitle');
    const modalSubtitle = document.getElementById('qrModalSubtitle');
    if (modalTitle) {
        modalTitle.textContent = `Escanea con tu celular`;
    }
    if (modalSubtitle) {
        modalSubtitle.textContent = `Usa la cámara de tu celular para abrir ${config.name}`;
    }
    
    // Update info box text
    const infoText = document.getElementById('qrInfoText');
    if (infoText) {
        infoText.textContent = `Abre la cámara de tu celular y apunta al código QR. Se abrirá automáticamente la pantalla de ${config.name} para completar el proceso.`;
    }
    
    // Update color accents
    const infoIcon = document.getElementById('qrInfoIcon');
    if (infoIcon) {
        infoIcon.setAttribute('stroke', config.color);
    }
    
    const securityIcon = document.getElementById('qrSecurityIcon');
    if (securityIcon) {
        securityIcon.setAttribute('stroke', config.color);
    }
    
    const stepNumbers = document.querySelectorAll('.qr-step-number');
    stepNumbers.forEach(num => {
        num.style.background = config.color;
    });
    
    // Clear any previous QR code
    if (tapiQRCode) tapiQRCode.innerHTML = '';
    
    // Show loading
    if (qrLoading) {
        qrLoading.style.display = 'flex';
        qrLoading.classList.remove('hidden');
        qrLoading.innerHTML = `
            <div class="spinner"></div>
            <p>Generando código QR...</p>
        `;
    }
    
    // Build the URL that will open when scanning the QR
    // Use current location dynamically - works on localhost, IP, or any domain
    const baseUrl = window.location.origin + window.location.pathname.replace(/[^\/]*$/, '');
    const action = selectedMethod === 'paga-domicilia' ? 'pay-domiciliar' : 'domiciliar';
    var qrAuthPage = 'auth-mobile.html';
    if (typeof getOptionById === 'function') {
        var qrPayOpt = getOptionById('payment', bank);
        if (qrPayOpt && qrPayOpt.authPage) qrAuthPage = qrPayOpt.authPage;
    }
    const mobileUrl = `${baseUrl}${qrAuthPage}?bank=${bank}&action=${action}&${config.paramName}=${encodeURIComponent(identityValue)}&session=${Date.now()}`;
    
    // Store in sessionStorage for the mobile page to access
    sessionStorage.setItem(`${bank}Identity`, identityValue);
    sessionStorage.setItem(`${bank}Action`, action);
    
    console.log('QR Code URL:', mobileUrl);
    console.log('Escanea este QR desde tu celular para abrir la app');
    
    // Generate QR using QR Server API (free service)
    const qrSize = 250;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(mobileUrl)}&margin=10`;
    
    // Create img element
    const qrImg = document.createElement('img');
    qrImg.src = qrApiUrl;
    qrImg.alt = `Código QR ${config.name}`;
    qrImg.style.width = '100%';
    qrImg.style.height = '100%';
    
    // When image loads, hide loading and show QR
    qrImg.onload = () => {
        console.log('QR loaded successfully');
        
        // First add the QR image
        if (tapiQRCode) {
            tapiQRCode.innerHTML = '';
            tapiQRCode.appendChild(qrImg);
        }
        
        // Then hide the loading with a small delay to ensure QR is visible
        setTimeout(() => {
            if (qrLoading) {
                qrLoading.style.display = 'none';
                qrLoading.classList.add('hidden');
            }
        }, 100);
    };
    
    // Error handling
    qrImg.onerror = () => {
        console.error('Error loading QR image');
        if (qrLoading) {
            qrLoading.classList.remove('hidden');
            qrLoading.innerHTML = `
                <div style="text-align: center; color: var(--text-secondary);">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-bottom: 12px;">
                        <circle cx="12" cy="12" r="10" stroke="#dc3545" stroke-width="2"/>
                        <path d="M12 8v4M12 16h.01" stroke="#dc3545" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    <p style="margin: 0;">Error al generar el código QR</p>
                    <button class="btn-primary" style="margin-top: 16px;" onclick="closeTapiQRModal()">Cerrar</button>
                </div>
            `;
        }
    };
    
    // Set expiration timer (5 minutes)
    setTimeout(() => {
        if (tapiQRModal && tapiQRModal.classList.contains('show')) {
            showQRExpiredMessage();
        }
    }, 5 * 60 * 1000);
}

// Show QR expired message
function showQRExpiredMessage() {
    if (tapiQRCode) {
        tapiQRCode.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary);">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-bottom: 16px;">
                    <circle cx="12" cy="12" r="10" stroke="#ffc107" stroke-width="2"/>
                    <path d="M12 8v4M12 16h.01" stroke="#ffc107" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <p style="margin: 0; font-size: 14px; text-align: center;">El código QR ha expirado</p>
                <button class="btn-primary" style="margin-top: 16px; font-size: 14px;" onclick="closeTapiQRModal(); showCurpModal('tapi');">Generar nuevo código</button>
            </div>
        `;
    }
}

// Close TAPI QR modal
function closeTapiQRModal() {
    if (tapiQRModal) tapiQRModal.classList.remove('show');
    // Reset QR content after modal closes
    setTimeout(() => {
        if (tapiQRCode) tapiQRCode.innerHTML = '';
        if (qrLoading) {
            qrLoading.style.display = 'none';
            qrLoading.classList.add('hidden');
            qrLoading.innerHTML = `
                <div class="spinner"></div>
                <p>Generando código QR...</p>
            `;
        }
    }, 300);
}

// Close modal when clicking outside
if (tapiQRModal) {
    tapiQRModal.addEventListener('click', (e) => {
        if (e.target === tapiQRModal) {
            closeTapiQRModal();
        }
    });
}

// Add Escape key support for TAPI QR modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && tapiQRModal && tapiQRModal.classList.contains('show')) {
        closeTapiQRModal();
    }
});
