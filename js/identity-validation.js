// ============================================
// IDENTITY VALIDATION (CURP/RFC/CLABE)
// Modal de CURP, validacion inline, regex patterns
// Depende de: checkout-core.js (selectedMethod, selectedBank, bankCards, isMobileDevice)
// Depende de: config/banks-config.js (BANKS, bankNames, bankLogos, bankColors, bankIdentityRequirements)
// Depende de: config/brand-config.js (BRAND)
// ============================================

const curpModal = document.getElementById('curpModal');
const curpInput = document.getElementById('curpInput');
const curpError = document.getElementById('curpError');
const continueCurpBtn = document.getElementById('continueCurpBtn');
const curpBankLogo = document.getElementById('curpBankLogo');
const curpBankName = document.getElementById('curpBankName');
const curpTycCheckbox = document.getElementById('curpTycCheckbox');
const tycError = document.getElementById('tycError');
let currentCurpBank = null;
let currentIdentityType = 'curp'; // 'curp', 'rfc', or 'clabe'

// Validation regex patterns
const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/;
const rfcRegex = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/;
const clabeRegex = /^\d{18}$/;

// bankIdentityRequirements now comes from config/banks-config.js

// ============================================
// INLINE IDENTITY VALIDATION
// ============================================

let currentInlineBank = null;
let currentInlineFlow = null;

function showIdentityValidationInline(bank, flow = 'deeplink') {
    currentInlineBank = bank;
    currentInlineFlow = flow;
    
    // Get inline elements
    const inlineContainer = document.getElementById('identityValidationInline');
    const selectedBankLogo = document.getElementById('selectedBankLogo');
    const selectedBankName = document.getElementById('selectedBankName');
    const identityValidationTitle = document.getElementById('identityValidationTitle');
    const identityLabelInline = document.getElementById('identityLabelInline');
    const identityInputInline = document.getElementById('identityInputInline');
    const identityHintInline = document.getElementById('identityHintInline');
    const identityErrorInline = document.getElementById('identityErrorInline');
    const tycCheckboxInline = document.getElementById('tycCheckboxInline');
    const tycErrorInline = document.getElementById('tycErrorInline');
    const btnValidateInline = document.getElementById('btnValidateInline');
    
    // Hide banks grid
    const banksGrid = document.querySelector('.banks-grid-desktop');
    const bankSelector = document.querySelector('.bank-selector-mobile');
    if (banksGrid) banksGrid.style.display = 'none';
    if (bankSelector) bankSelector.style.display = 'none';
    
    // Determine identity type based on bank
    const identityType = bankIdentityRequirements[bank] || bankIdentityRequirements.default;
    
    // Update bank logo
    // BRAND: fallback color for bank logo
    selectedBankLogo.innerHTML = bankLogos[bank] || `<span style="color: ${BRAND.colors.primary}; font-size: 20px; font-weight: 700;">${bankNames[bank].substring(0, 2)}</span>`;
    selectedBankName.textContent = bankNames[bank];
    
    // Configure form based on identity type
    if (identityType === 'rfc') {
        identityValidationTitle.textContent = 'Ingresa tu RFC';
        identityLabelInline.textContent = 'RFC (Registro Federal de Contribuyentes)';
        identityInputInline.placeholder = 'Ej: XAXX010101000';
        identityInputInline.maxLength = 13;
        identityInputInline.style.textTransform = 'uppercase';
        identityHintInline.textContent = '12 o 13 caracteres alfanuméricos';
    } else if (identityType === 'clabe') {
        identityValidationTitle.textContent = 'Verifica tu cuenta';
        identityLabelInline.textContent = 'Cuenta CLABE Interbancaria';
        identityInputInline.placeholder = 'Ej: 012180001234567890';
        identityInputInline.maxLength = 18;
        identityInputInline.style.textTransform = 'none';
        identityHintInline.textContent = '18 dígitos numéricos';
    } else {
        identityValidationTitle.textContent = 'Ingresa tu CURP';
        identityLabelInline.textContent = 'CURP (Clave Única de Registro de Población)';
        identityInputInline.placeholder = 'Ej: AAAA850101HDFRRL09';
        identityInputInline.maxLength = 18;
        identityInputInline.style.textTransform = 'uppercase';
        identityHintInline.textContent = '18 caracteres alfanuméricos';
    }
    
    // Reset form
    identityInputInline.value = '';
    identityInputInline.classList.remove('error', 'success');
    identityErrorInline.style.display = 'none';
    tycCheckboxInline.checked = false;
    tycErrorInline.style.display = 'none';
    btnValidateInline.disabled = true;
    
    // Show inline container
    inlineContainer.style.display = 'block';
    
    // Scroll to form
    setTimeout(() => {
        inlineContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        identityInputInline.focus();
    }, 100);
    
    // Store identity type
    currentIdentityType = identityType;
}

function resetBankSelection() {
    const inlineContainer = document.getElementById('identityValidationInline');
    const banksGrid = document.querySelector('.banks-grid-desktop');
    const bankSelector = document.querySelector('.bank-selector-mobile');
    
    // Hide inline form
    inlineContainer.style.display = 'none';
    
    // Show banks grid again
    if (banksGrid) banksGrid.style.display = 'grid';
    if (bankSelector) bankSelector.style.display = 'block';
    
    // Remove selection from bank cards
    bankCards.forEach(c => c.classList.remove('selected'));
    
    // Reset variables
    currentInlineBank = null;
    currentInlineFlow = null;
    selectedBank = null;
}

// Validate inline identity input
document.addEventListener('DOMContentLoaded', () => {
    const identityInputInline = document.getElementById('identityInputInline');
    const tycCheckboxInline = document.getElementById('tycCheckboxInline');
    const btnValidateInline = document.getElementById('btnValidateInline');
    const identityErrorInline = document.getElementById('identityErrorInline');
    const tycErrorInline = document.getElementById('tycErrorInline');
    
    if (!identityInputInline || !tycCheckboxInline || !btnValidateInline) return;
    
    // Enable/disable button based on validation
    function checkInlineValidation() {
        const value = identityInputInline.value.trim();
        const isValid = validateIdentity(value);
        const tycAccepted = tycCheckboxInline.checked;
        
        btnValidateInline.disabled = !(isValid && tycAccepted);
    }
    
    identityInputInline.addEventListener('input', () => {
        const value = identityInputInline.value.trim();
        identityErrorInline.style.display = 'none';
        identityInputInline.classList.remove('error', 'success');
        
        if (value.length > 0 && validateIdentity(value)) {
            identityInputInline.classList.add('success');
        }
        
        checkInlineValidation();
    });
    
    tycCheckboxInline.addEventListener('change', () => {
        tycErrorInline.style.display = 'none';
        checkInlineValidation();
    });
    
    btnValidateInline.addEventListener('click', () => {
        const value = identityInputInline.value.trim();
        
        if (!validateIdentity(value)) {
            const errorMessages = {
                'rfc': 'El formato del RFC no es válido',
                'clabe': 'La CLABE debe tener 18 dígitos',
                'curp': 'El formato del CURP no es válido'
            };
            identityErrorInline.textContent = errorMessages[currentIdentityType] || 'Formato inválido';
            identityErrorInline.style.display = 'block';
            identityInputInline.classList.add('error');
            return;
        }
        
        if (!tycCheckboxInline.checked) {
            tycErrorInline.textContent = 'Debes aceptar los términos y condiciones';
            tycErrorInline.style.display = 'block';
            return;
        }
        
        // Store identity value
        const storageKey = currentIdentityType === 'rfc' ? 'userRFC' : 
                           currentIdentityType === 'clabe' ? 'userCLABE' : 'userCurp';
        sessionStorage.setItem(storageKey, value);
        sessionStorage.setItem('identityType', currentIdentityType);
        
        // Check if mobile or desktop
        if (isMobileDevice()) {
            redirectToBankApp(currentInlineBank, value);
        } else {
            showBankQRFlow(currentInlineBank, value);
        }
    });
});

// Show CURP modal (now dynamic based on bank)
function showCurpModal(bank) {
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
    
    // Show modal
    curpModal.classList.add('show');
    
    // Focus input after animation
    setTimeout(() => {
        curpInput.focus();
    }, 300);
}

// Configure modal dynamically based on identity type
function configureIdentityModal(type) {
    const modalTitle = document.getElementById('identityModalTitle');
    const modalSubtitle = document.getElementById('identityModalSubtitle');
    const inputLabel = document.getElementById('identityInputLabel');
    const inputHint = document.getElementById('identityInputHint');
    const infoTitle = document.getElementById('identityInfoTitle');
    const infoText = document.getElementById('identityInfoText');
    
    if (type === 'rfc') {
        // RFC configuration
        modalTitle.textContent = 'Verificación de identidad';
        modalSubtitle.textContent = 'Ingresa tu RFC para continuar';
        inputLabel.textContent = 'RFC (Registro Federal de Contribuyentes)';
        curpInput.placeholder = 'Ej: XAXX010101000';
        curpInput.maxLength = 13;
        curpInput.style.textTransform = 'uppercase';
        inputHint.textContent = '12 o 13 caracteres alfanuméricos';
        infoTitle.textContent = '¿Por qué necesitamos tu RFC?';
        infoText.textContent = 'Para validar tu identidad y cumplir con regulaciones fiscales.';
    } else if (type === 'clabe') {
        // CLABE configuration
        modalTitle.textContent = 'Verifica tu cuenta';
        modalSubtitle.textContent = 'Ingresa tu cuenta CLABE para continuar';
        inputLabel.textContent = 'Cuenta CLABE Interbancaria';
        curpInput.placeholder = 'Ej: 012180001234567890';
        curpInput.maxLength = 18;
        curpInput.style.textTransform = 'none';
        inputHint.textContent = '18 dígitos numéricos';
        infoTitle.textContent = '¿Por qué necesitamos tu CLABE?';
        infoText.textContent = 'Para verificar que eres el titular de la cuenta bancaria.';
    } else {
        // CURP configuration (default)
        modalTitle.textContent = 'Verificación de identidad';
        modalSubtitle.textContent = 'Para continuar, necesitamos verificar tu identidad';
        inputLabel.textContent = 'CURP (Clave Única de Registro de Población)';
        curpInput.placeholder = 'Ej: AAAA850101HDFRRL09';
        curpInput.maxLength = 18;
        curpInput.style.textTransform = 'uppercase';
        inputHint.textContent = '18 caracteres alfanuméricos';
        infoTitle.textContent = '¿Por qué necesitamos tu CURP?';
        infoText.textContent = 'Para cumplir con regulaciones bancarias y garantizar la seguridad de tus transacciones.';
    }
}

// Close CURP modal
function closeCurpModal() {
    curpModal.classList.remove('show');
    currentCurpBank = null;
    curpInput.value = '';
    if (curpTycCheckbox) curpTycCheckbox.checked = false;
    if (tycError) tycError.style.display = 'none';
}

// Validate identity based on current type
function validateIdentity(value) {
    if (currentIdentityType === 'rfc') {
        return rfcRegex.test(value);
    } else if (currentIdentityType === 'clabe') {
        return clabeRegex.test(value);
    } else {
        return curpRegex.test(value);
    }
}

// Get expected length based on identity type
function getExpectedLength() {
    if (currentIdentityType === 'rfc') {
        return [12, 13]; // RFC can be 12 or 13 characters
    } else if (currentIdentityType === 'clabe') {
        return [18];
    } else {
        return [18]; // CURP
    }
}

// Check if length is valid
function isValidLength(value) {
    const expectedLengths = getExpectedLength();
    return expectedLengths.includes(value.length);
}

// Validate CURP format (kept for backward compatibility)
function validateCurp(curp) {
    return curpRegex.test(curp);
}

// Validate form to enable/disable button
function validateCurpForm() {
    const value = curpInput.value;
    const isValueValid = isValidLength(value) && validateIdentity(value);
    const isTycChecked = curpTycCheckbox ? curpTycCheckbox.checked : true;
    
    continueCurpBtn.disabled = !(isValueValid && isTycChecked);
}

// Handle CURP input change
if (curpInput) {
    curpInput.addEventListener('input', (e) => {
        // Handle different input types
        if (currentIdentityType === 'clabe') {
            // CLABE: only allow numbers
            e.target.value = e.target.value.replace(/\D/g, '');
        } else if (currentIdentityType === 'rfc' || currentIdentityType === 'curp') {
            // RFC/CURP: convert to uppercase
        e.target.value = e.target.value.toUpperCase();
        }
        
        const value = e.target.value;
        
        // Reset error
        curpError.style.display = 'none';
        curpInput.classList.remove('error', 'success');
        
        // Check if complete
        if (isValidLength(value)) {
            if (validateIdentity(value)) {
                curpInput.classList.add('success');
            } else {
                curpInput.classList.add('error');
                const errorMessages = {
                    'rfc': 'El formato del RFC no es válido',
                    'clabe': 'La CLABE debe tener 18 dígitos',
                    'curp': 'El formato del CURP no es válido'
                };
                curpError.textContent = errorMessages[currentIdentityType];
                curpError.style.display = 'block';
            }
        }
        
        // Validate entire form
        validateCurpForm();
    });

    // Allow Enter key to submit
    curpInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !continueCurpBtn.disabled) {
            validateAndContinue();
        }
    });
}

// Handle TyC checkbox change
if (curpTycCheckbox) {
    curpTycCheckbox.addEventListener('change', () => {
        if (tycError) tycError.style.display = 'none';
        validateCurpForm();
    });
}

// Validate and continue with deeplink
function validateAndContinue() {
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
    
    // Store identity value in session (in real app, send to backend with identity type)
    const storageKey = currentIdentityType === 'rfc' ? 'userRFC' : 
                       currentIdentityType === 'clabe' ? 'userCLABE' : 'userCurp';
    sessionStorage.setItem(storageKey, value);
    sessionStorage.setItem('identityType', currentIdentityType);
    
    // For all banks: Check if mobile or desktop
    if (isMobileDevice()) {
        // Mobile: Direct deeplink with animation
        redirectToBankApp(currentCurpBank, value);
        return;
    } else {
        // Desktop: Show QR modal
        showBankQRFlow(currentCurpBank, value);
        return;
    }
    
    // Show loading state
    const originalText = continueCurpBtn.innerHTML;
    continueCurpBtn.disabled = true;
    continueCurpBtn.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <div class="spinner-small"></div>
            <span>Verificando con ${bankNames[currentCurpBank]}...</span>
        </div>
    `;
    
    // Simulate API call to bank (2-3 seconds)
    setTimeout(() => {
        // IMPORTANT: Save the bank BEFORE closing modal (closeCurpModal sets it to null)
        const bankToOpen = currentCurpBank;
        
        // Reset button
        continueCurpBtn.innerHTML = originalText;
        continueCurpBtn.disabled = false;
        
        // Close CURP modal
        closeCurpModal();
        
        // Wait a bit for the modal to fully close
        setTimeout(() => {
            // Show success message briefly
            showVerificationSuccess(bankToOpen);
            
            // Continue with the flow after success message
            setTimeout(() => {
                console.log('=== OPENING BANK MODAL ===');
                console.log('Bank:', bankToOpen);
                console.log('Selected method:', selectedMethod);
                console.log('Is mobile:', isMobileDevice());
                
                // Store the bank for the modal to use
                selectedBank = bankToOpen;
                
                // Force show the modal
                if (isMobileDevice()) {
                    console.log('Mobile device - redirecting to auth');
                    redirectToBankAuth(bankToOpen);
                } else {
                    console.log('Desktop device - showing QR modal');
                    
                    // Make absolutely sure the modal opens
                    if (qrModal) {
                        console.log('QR Modal found, calling showQRModal');
                        showQRModal(bankToOpen);
                        
                        // Verify modal opened
                        setTimeout(() => {
                            console.log('Final modal classList:', qrModal.classList.toString());
                            console.log('Modal display:', window.getComputedStyle(qrModal).display);
                        }, 100);
                    } else {
                        console.error('ERROR: qrModal element not found!');
                    }
                }
            }, 1800);
        }, 300);
    }, 2500);
}

// Show verification success message
function showVerificationSuccess(bank) {
    const successMessage = document.createElement('div');
    successMessage.className = 'verification-success';
    successMessage.innerHTML = `
        <div class="success-content">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#00c853"/>
                <path d="M8 12L11 15L16 9" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h3>¡Verificación exitosa!</h3>
            <p>Usuario encontrado en ${bankNames[bank]}</p>
        </div>
    `;
    
    document.body.appendChild(successMessage);
    
    // Animate in
    setTimeout(() => {
        successMessage.classList.add('show');
    }, 10);
    
    // Remove after showing
    setTimeout(() => {
        successMessage.classList.remove('show');
        setTimeout(() => {
            successMessage.remove();
        }, 300);
    }, 1500);
}
