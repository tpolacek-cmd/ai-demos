// ============================================
// ACCOUNT TO ACCOUNT FLOW
// Flujo A2A: CLABE modal, verificacion de transferencia, confirmacion final
// Depende de: checkout-core.js (selectedMethod, selectedBank)
// Depende de: config/banks-config.js (bankNames, bankColors)
// Depende de: config/brand-config.js (BRAND)
// ============================================

const clabeModal = document.getElementById('clabeModal');
const clabeInput = document.getElementById('clabeInput');
const clabeError = document.getElementById('clabeError');
const continueClabeBtn = document.getElementById('continueClabeBtn');
const clabeBankLogo = document.getElementById('clabeBankLogo');

const verificationModal = document.getElementById('verificationModal');
const verificationCode = document.getElementById('verificationCode');
const verificationError = document.getElementById('verificationError');
const verifyCodeBtn = document.getElementById('verifyCodeBtn');

const finalConfirmationModal = document.getElementById('finalConfirmationModal');

let currentClabeBank = null;
let userClabe = '';
let generatedCode = '';

// bankColors now comes from config/banks-config.js

// Show CLABE modal
function showClabeModal(bank) {
    currentClabeBank = bank;
    
    // Update bank logo
    clabeBankLogo.style.background = bankColors[bank];
    clabeBankLogo.textContent = bankNames[bank].substring(0, 2);
    
    // Reset form
    clabeInput.value = '';
    clabeInput.classList.remove('error', 'success');
    clabeError.style.display = 'none';
    continueClabeBtn.disabled = true;
    
    // Show modal
    clabeModal.classList.add('show');
    
    // Focus input after animation
    setTimeout(() => {
        clabeInput.focus();
    }, 300);
}

// Close CLABE modal
function closeClabeModal() {
    clabeModal.classList.remove('show');
    currentClabeBank = null;
    clabeInput.value = '';
}

// Validate CLABE format (18 digits)
function validateClabeFormat(clabe) {
    return /^\d{18}$/.test(clabe);
}

// Handle CLABE input change
if (clabeInput) {
    clabeInput.addEventListener('input', (e) => {
        // Only allow digits
        e.target.value = e.target.value.replace(/\D/g, '');
        
        const clabe = e.target.value;
        
        // Reset error
        clabeError.style.display = 'none';
        clabeInput.classList.remove('error', 'success');
        
        // Check if complete
        if (clabe.length === 18) {
            if (validateClabeFormat(clabe)) {
                clabeInput.classList.add('success');
                continueClabeBtn.disabled = false;
            } else {
                clabeInput.classList.add('error');
                clabeError.textContent = 'El formato de la CLABE no es válido';
                clabeError.style.display = 'block';
                continueClabeBtn.disabled = true;
            }
        } else {
            continueClabeBtn.disabled = true;
        }
    });

    // Allow Enter key to submit
    clabeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !continueClabeBtn.disabled) {
            validateClabe();
        }
    });
}

// Validate CLABE and send transfer
function validateClabe() {
    const clabe = clabeInput.value.trim();
    
    if (!validateClabeFormat(clabe)) {
        clabeInput.classList.add('error');
        clabeError.textContent = 'El formato de la CLABE no es válido';
        clabeError.style.display = 'block';
        return;
    }
    
    // Store CLABE
    userClabe = clabe;
    sessionStorage.setItem('userClabe', clabe);
    
    // Show loading state
    continueClabeBtn.disabled = true;
    continueClabeBtn.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <div class="spinner-small"></div>
            <span>Enviando transferencia de verificación...</span>
        </div>
    `;
    
    // Generate random 4-digit code for simulation
    generatedCode = Math.floor(1000 + Math.random() * 9000).toString();
    console.log('Generated verification code:', generatedCode); // For demo purposes
    
    // Simulate API call (2 seconds)
    setTimeout(() => {
        // Close CLABE modal
        closeClabeModal();
        
        // Show verification modal
        setTimeout(() => {
            showVerificationModal();
        }, 300);
    }, 2000);
}

// Show verification modal
function showVerificationModal() {
    verificationModal.classList.add('show');
    
    // Reset input
    verificationCode.value = '';
    verificationCode.classList.remove('error');
    verificationError.style.display = 'none';
    verifyCodeBtn.disabled = true;
    
    // Focus input after animation
    setTimeout(() => {
        verificationCode.focus();
    }, 300);
}

// Close verification modal
function closeVerificationModal() {
    verificationModal.classList.remove('show');
}

// Handle verification code input
if (verificationCode) {
    verificationCode.addEventListener('input', (e) => {
        // Only allow digits
        e.target.value = e.target.value.replace(/\D/g, '');
        
        const code = e.target.value;
        
        // Reset error
        verificationError.style.display = 'none';
        verificationCode.classList.remove('error');
        
        // Enable button when 4 digits entered
        if (code.length === 4) {
            verifyCodeBtn.disabled = false;
        } else {
            verifyCodeBtn.disabled = true;
        }
    });

    // Allow Enter key to submit
    verificationCode.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !verifyCodeBtn.disabled) {
            verifyTransferCode();
        }
    });
}

// Verify transfer code
function verifyTransferCode() {
    const code = verificationCode.value.trim();
    
    if (code.length !== 4) {
        verificationCode.classList.add('error');
        verificationError.textContent = 'Debes ingresar 4 dígitos';
        verificationError.style.display = 'block';
        return;
    }
    
    // Show loading state
    verifyCodeBtn.disabled = true;
    verifyCodeBtn.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <div class="spinner-small"></div>
            <span>Verificando...</span>
        </div>
    `;
    
    // Simulate API verification (1.5 seconds)
    setTimeout(() => {
        // For demo: accept the generated code OR any 4-digit code
        if (code === generatedCode || code.length === 4) {
            // Close verification modal
            closeVerificationModal();
            
            // Show final confirmation
            setTimeout(() => {
                showFinalConfirmation();
            }, 300);
        } else {
            // Reset button
            verifyCodeBtn.innerHTML = `
                Verificar
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
            verifyCodeBtn.disabled = false;
            
            // Show error
            verificationCode.classList.add('error');
            verificationError.textContent = 'Código incorrecto. Verifica los últimos 4 dígitos de la transferencia.';
            verificationError.style.display = 'block';
        }
    }, 1500);
}

// Show final confirmation modal
function showFinalConfirmation() {
    // Get last 4 digits of CLABE
    const lastDigits = userClabe.slice(-4);
    document.getElementById('lastClabeDigits').textContent = lastDigits;
    document.getElementById('lastClabeDigits2').textContent = lastDigits;
    
    // Check if it's "paga-domicilia" to show current payment section
    const isPagaDomicilia = selectedMethod === 'paga-domicilia';
    const currentPaymentBox = document.getElementById('currentPaymentBox');
    const flowSteps = document.getElementById('flowSteps');
    const domiciliationBadge = document.getElementById('domiciliationBadge');
    const warningTextPagaDomicilia = document.getElementById('warningTextPagaDomicilia');
    const warningTextDomiciliar = document.getElementById('warningTextDomiciliar');
    const confirmBtnText = document.getElementById('confirmBtnText');
    
    if (isPagaDomicilia) {
        // Show flow visualization
        flowSteps.style.display = 'flex';
        
        // Show domiciliation badge
        domiciliationBadge.style.display = 'block';
        
        // Show current payment section
        currentPaymentBox.style.display = 'block';
        document.getElementById('lastClabeDigits3').textContent = lastDigits;
        
        // Update warning text
        warningTextPagaDomicilia.style.display = 'block';
        warningTextDomiciliar.style.display = 'none';
        
        // Update button text
        confirmBtnText.textContent = 'Confirmar domiciliación y pago';
    } else {
        // Hide flow visualization
        flowSteps.style.display = 'none';
        
        // Hide current payment section
        currentPaymentBox.style.display = 'none';
        
        // Hide domiciliation badge
        domiciliationBadge.style.display = 'none';
        
        // Update warning text
        warningTextPagaDomicilia.style.display = 'none';
        warningTextDomiciliar.style.display = 'block';
        
        // Update button text
        confirmBtnText.textContent = 'Confirmar domiciliación';
    }
    
    finalConfirmationModal.classList.add('show');
}

// Close final confirmation modal
function closeFinalConfirmation() {
    finalConfirmationModal.classList.remove('show');
}

// Confirm domiciliation
function confirmDomiciliation() {
    // Show loading
    const confirmBtn = event.target;
    const originalHTML = confirmBtn.innerHTML;
    confirmBtn.disabled = true;
    
    const isPagaDomicilia = selectedMethod === 'paga-domicilia';
    const loadingText = isPagaDomicilia ? 'Procesando domiciliación y pago...' : 'Procesando...';
    
    confirmBtn.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <div class="spinner-small"></div>
            <span>${loadingText}</span>
        </div>
    `;
    
    // Simulate final processing
    setTimeout(() => {
        // Close final confirmation modal
        closeFinalConfirmation();
        
        // Show success message
        setTimeout(() => {
            const successOverlay = document.createElement('div');
            successOverlay.className = 'redirect-loading';
            
            let successMessage = '';
            let successTitle = '';
            
            if (isPagaDomicilia) {
                successTitle = '¡Domiciliación y pago exitosos!';
                successMessage = `
                    <p style="margin-bottom: 12px;"><strong>Domiciliación configurada:</strong> Tu servicio de ${BRAND.name} se pagará automáticamente cada mes desde esta cuenta.</p>
                    <p><strong>Pago realizado:</strong> ${BRAND.formattedTotal()} MXN ha sido debitado de tu cuenta CLABE terminada en ${userClabe.slice(-4)}</p>
                `;
            } else {
                successTitle = '¡Domiciliación confirmada!';
                successMessage = `<p>Tu servicio de ${BRAND.name} se pagará automáticamente cada mes desde tu cuenta CLABE terminada en ${userClabe.slice(-4)}</p>`;
            }
            
            successOverlay.innerHTML = `
                <div class="redirect-content">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="#00c853" stroke-width="2" fill="#00c853"/>
                        <path d="M8 12L11 15L16 9" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <h3>${successTitle}</h3>
                    ${successMessage}
                    <button class="btn-primary" onclick="closeRedirectLoading(); window.location.href='index.html'">
                        Finalizar
                    </button>
                </div>
            `;
            document.body.appendChild(successOverlay);
        }, 300);
    }, 2000);
}

// Close modals on clicking outside
if (clabeModal) {
    clabeModal.addEventListener('click', (e) => {
        if (e.target === clabeModal) {
            closeClabeModal();
        }
    });
}

if (verificationModal) {
    verificationModal.addEventListener('click', (e) => {
        if (e.target === verificationModal) {
            closeVerificationModal();
        }
    });
}

if (finalConfirmationModal) {
    finalConfirmationModal.addEventListener('click', (e) => {
        if (e.target === finalConfirmationModal) {
            closeFinalConfirmation();
        }
    });
}

// Add Escape key support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (clabeModal && clabeModal.classList.contains('show')) {
            closeClabeModal();
        }
        if (verificationModal && verificationModal.classList.contains('show')) {
            closeVerificationModal();
        }
        if (finalConfirmationModal && finalConfirmationModal.classList.contains('show')) {
            closeFinalConfirmation();
        }
        const phoneOverlay = document.getElementById('phoneMockupOverlay');
        if (phoneOverlay && phoneOverlay.classList.contains('show')) {
            closePhoneMockup();
        }
    }
});
