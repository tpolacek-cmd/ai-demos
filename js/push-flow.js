// ============================================
// PUSH NOTIFICATION FLOW
// Flujo de notificacion push: CURP modal para push, envio, apertura app
// Depende de: checkout-core.js (selectedMethod, selectedBank)
// Depende de: identity-validation.js (currentCurpBank, currentIdentityType, curpBankLogo, curpBankName, curpInput, curpError, continueCurpBtn, curpTycCheckbox, tycError, closeCurpModal, configureIdentityModal, validateIdentity, bankIdentityRequirements)
// Depende de: config/banks-config.js (bankNames, bankLogos, BANKS)
// Depende de: config/brand-config.js (BRAND)
// ============================================

let currentPushBank = null;

// Show CURP modal for push flow
function showCurpModalForPush(bank) {
    currentPushBank = bank;
    currentCurpBank = bank;
    
    // Determine identity type based on bank
    currentIdentityType = bankIdentityRequirements[bank] || bankIdentityRequirements.default;
    
    // Update bank logo with real image
    curpBankLogo.style.background = 'transparent';
    // BRAND: fallback color for bank logo
    curpBankLogo.innerHTML = bankLogos[bank] || `<span style="color: ${BRAND.colors.primary}; font-size: 20px; font-weight: 700;">${bankNames[bank].substring(0, 2)}</span>`;
    curpBankName.textContent = bankNames[bank];
    
    // Configure modal based on identity type
    configureIdentityModal(currentIdentityType);
    
    // Reset form
    curpInput.value = '';
    curpInput.classList.remove('error', 'success');
    curpError.style.display = 'none';
    if (curpTycCheckbox) curpTycCheckbox.checked = false;
    if (tycError) tycError.style.display = 'none';
    continueCurpBtn.disabled = true;
    
    // Update button text for push flow
    continueCurpBtn.innerHTML = `
        Enviar push a ${bankNames[bank]}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;
    
    // Override the onclick
    continueCurpBtn.setAttribute('onclick', 'validateAndSendPush()');
    
    // Show modal
    curpModal.classList.add('show');
    
    // Focus input after animation
    setTimeout(() => {
        curpInput.focus();
    }, 300);
}

// Validate and send push notification
function validateAndSendPush() {
    const value = curpInput.value.trim();
    
    if (!validateIdentity(value)) {
        curpInput.classList.add('error');
        const errorMessages = {
            'rfc': 'El formato del RFC no es válido',
            'clabe': 'La CLABE debe tener 18 dígitos',
            'curp': 'El formato del CURP no es válido'
        };
        curpError.textContent = errorMessages[currentIdentityType];
        curpError.style.display = 'block';
        return;
    }
    
    // Validate TyC checkbox
    if (curpTycCheckbox && !curpTycCheckbox.checked) {
        if (tycError) {
            tycError.textContent = 'Debes aceptar los términos y condiciones para continuar';
            tycError.style.display = 'block';
        }
        return;
    }
    
    // Store identity value in session
    const storageKey = currentIdentityType === 'rfc' ? 'userRFC' : 
                       currentIdentityType === 'clabe' ? 'userCLABE' : 'userCurp';
    sessionStorage.setItem(storageKey, value);
    sessionStorage.setItem('identityType', currentIdentityType);
    
    // Save bank before closing modal
    const bankToOpen = currentPushBank;
    
    // Show loading state
    continueCurpBtn.disabled = true;
    continueCurpBtn.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <div class="spinner-small"></div>
            <span>Enviando push a ${bankNames[bankToOpen]}...</span>
        </div>
    `;
    
    // Simulate API call (2 seconds)
    setTimeout(() => {
        // Close CURP modal
        closeCurpModal();
        
        // Show push sent message
        showPushSentMessage(bankToOpen);
        
        // After a brief moment, open the bank app with push notification
        setTimeout(() => {
            selectedBank = bankToOpen;
            openBankAppWithPush(bankToOpen);
        }, 2000);
    }, 2000);
}

// Show push sent confirmation
function showPushSentMessage(bank) {
    const pushMessage = document.createElement('div');
    pushMessage.className = 'verification-success';
    pushMessage.innerHTML = `
        <div class="success-content">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="${BRAND.colors.primary}" stroke-width="2" fill="${BRAND.colors.primary}" fill-opacity="0.2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" stroke="${BRAND.colors.primary}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h3>¡Push enviado!</h3>
            <p>Revisa tu app de ${bankNames[bank]}</p>
        </div>
    `;
    
    document.body.appendChild(pushMessage);
    
    // Animate in
    setTimeout(() => {
        pushMessage.classList.add('show');
    }, 10);
    
    // Remove after showing
    setTimeout(() => {
        pushMessage.classList.remove('show');
        setTimeout(() => {
            pushMessage.remove();
        }, 300);
    }, 1800);
}

// Open bank app with push notification
function openBankAppWithPush(bank) {
    const isPagaDomicilia = selectedMethod === 'paga-domicilia';
    const action = isPagaDomicilia ? 'pay-domiciliar' : 'domiciliar';

    var authPage = 'auth-mobile.html';
    if (typeof getOptionById === 'function') {
        var payOpt = getOptionById('payment', bank);
        if (payOpt && payOpt.authPage) authPage = payOpt.authPage;
    }

    const baseUrl = window.location.origin + window.location.pathname.replace(/[^\/]*$/, '');

    if (isCheckoutEmbedded) {
        const authUrl = `${baseUrl}${authPage}?bank=${bank}&action=${action}&flow=push&embedded=1&session=${Date.now()}`;
        window.location.href = authUrl;
        return;
    }

    const authUrl = `${baseUrl}${authPage}?bank=${bank}&action=${action}&flow=push&session=${Date.now()}`;

    // Open in new window with mobile dimensions
    window.open(authUrl, '_blank', 'width=420,height=900,resizable=yes,scrollbars=yes');
}
