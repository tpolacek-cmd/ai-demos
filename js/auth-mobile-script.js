// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const bank = urlParams.get('bank') || 'hey-banco';
const action = urlParams.get('action') || 'domiciliar';
const flow = urlParams.get('flow') || 'normal';
const isPagaDomicilia = action === 'pay-domiciliar';

// Bank-specific content now comes from config/banks-config.js (BANKS object)
// Note: Bank colors are applied in inline script in HTML head for immediate rendering

const currentBankContent = BANKS[bank] || BANKS['hey-banco'];

// Update bank-specific content in DOM after page loads
document.addEventListener('DOMContentLoaded', () => {
    // Update all bank name headers
    const bankNameHeaders = ['bankNameHeader1', 'bankNameHeader2', 'bankNameHeader3'];
    bankNameHeaders.forEach(headerId => {
        const header = document.getElementById(headerId);
        if (header) {
            header.textContent = currentBankContent.name;
        }
    });
    
    // Update payment method account (pantalla de pago)
    const paymentMethodAccount = document.getElementById('paymentMethodAccount');
    if (paymentMethodAccount) {
        const lastFourDigits = currentBankContent.cardNumber.slice(-4);
        paymentMethodAccount.textContent = `${currentBankContent.accountName} **** ${lastFourDigits}`;
    }
    
    // Update account card info (pantalla de domiciliación nueva)
    const accountCardInfo = document.getElementById('accountCardInfo');
    if (accountCardInfo) {
        const lastFourDigits = currentBankContent.cardNumber.slice(-4);
        accountCardInfo.textContent = `**** ${lastFourDigits} • ${currentBankContent.fullName}`;
    }
    
    // Update bank icon old (pantalla de domiciliación vieja)
    const bankIconOld = document.getElementById('bankIconOld');
    if (bankIconOld) {
        bankIconOld.textContent = currentBankContent.iconText;
    }
    
    // Update account name old (pantalla de domiciliación vieja)
    const accountNameOld = document.getElementById('accountNameOld');
    if (accountNameOld) {
        accountNameOld.textContent = currentBankContent.accountName;
    }
    
    // Update card number old (pantalla de domiciliación vieja)
    const cardNumberOld = document.getElementById('cardNumberOld');
    if (cardNumberOld) {
        cardNumberOld.textContent = currentBankContent.cardNumber;
    }
    
    // Update institution name old (pantalla de domiciliación vieja)
    const institutionNameOld = document.getElementById('institutionNameOld');
    if (institutionNameOld) {
        institutionNameOld.textContent = currentBankContent.fullName;
    }
    
    // Update all bank icons (general)
    document.querySelectorAll('.bank-icon:not(#bankIconOld)').forEach(icon => {
        icon.textContent = currentBankContent.iconText;
    });
    
    // Update app icon
    const appIcon = document.querySelector('.app-icon .icon-bg');
    if (appIcon) {
        appIcon.innerHTML = currentBankContent.logoHtml;
    }
    
    // Update account display (new domiciliation screen)
    const accountName = document.querySelector('.account-info strong');
    if (accountName && !document.getElementById('accountNameOld')) {
        accountName.textContent = currentBankContent.accountName;
    }
    
    const cardNumber = document.querySelector('.account-info p');
    if (cardNumber && !document.getElementById('accountCardInfo')) {
        cardNumber.textContent = currentBankContent.cardNumber;
    }
    
    // Update CLABE in details
    const clabeLabels = Array.from(document.querySelectorAll('.detail-label')).filter(el => el.textContent === 'CLABE');
    clabeLabels.forEach(label => {
        const clabeValue = label.nextElementSibling;
        if (clabeValue && clabeValue.classList.contains('detail-value')) {
            clabeValue.textContent = currentBankContent.clabe;
        }
    });
    
    // Update phone in details
    const phoneLabels = Array.from(document.querySelectorAll('.detail-label')).filter(el => el.textContent === 'Teléfono asociado' || el.textContent === 'Teléfono');
    phoneLabels.forEach(label => {
        const phoneValue = label.nextElementSibling;
        if (phoneValue && phoneValue.classList.contains('detail-value')) {
            phoneValue.textContent = currentBankContent.phone;
        }
    });
    
    // Update account holder note
    const accountHolderNote = document.querySelector('#accountHolder + small, #accountHolderOld + small');
    if (accountHolderNote) {
        accountHolderNote.textContent = `Información obtenida automáticamente de tu cuenta ${currentBankContent.name}`;
    }
    
    // Update bank avatar in new domiciliation screen
    const bankAvatarNew = document.getElementById('bankAvatarNew');
    if (bankAvatarNew) {
        if (currentBankContent.logoHtml) {
            bankAvatarNew.innerHTML = currentBankContent.logoHtml;
            bankAvatarNew.style.background = 'white';
            bankAvatarNew.style.padding = '6px';
        } else {
            bankAvatarNew.textContent = currentBankContent.iconText;
        }
    }
});

// Screen management
let currentScreen = flow === 'push' ? 'pushScreen' : 'faceIdScreen';
const screenHistory = [];

// Initialize first screen based on flow
if (flow === 'push') {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById('pushScreen').classList.add('active');
}

function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        screenHistory.push(currentScreen);
        currentScreen = screenId;
    }
}

// Handle push notification click
function handlePushClick() {
    // Add feedback
    const pushBanner = document.querySelector('.push-notification-banner');
    pushBanner.style.transform = 'scale(0.95)';
    pushBanner.style.opacity = '0.8';
    
    setTimeout(() => {
        // Fade out banner
        pushBanner.style.transition = 'all 0.3s ease';
        pushBanner.style.transform = 'translateY(-100px)';
        pushBanner.style.opacity = '0';
        
        setTimeout(() => {
            // Navigate to Face ID screen
            showScreen('faceIdScreen');
            
            // Auto-start Face ID authentication after a brief delay
            setTimeout(() => {
                authenticateWithFaceID();
            }, 1500);
        }, 300);
    }, 200);
}

function goBack() {
    if (screenHistory.length > 0) {
        const previousScreen = screenHistory.pop();
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        const targetScreen = document.getElementById(previousScreen);
        if (targetScreen) {
            targetScreen.classList.add('active');
            currentScreen = previousScreen;
        }
    }
}

// Simulate Face ID when button is clicked
function simulateFaceID() {
    const button = document.querySelector('.faceid-button');
    button.style.opacity = '0.5';
    button.disabled = true;
    button.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-dasharray="60" stroke-dashoffset="0">
                <animate attributeName="stroke-dashoffset" from="0" to="60" dur="1s" repeatCount="indefinite"/>
            </circle>
        </svg>
        <span>Autenticando...</span>
    `;
    
    setTimeout(() => {
        authenticateWithFaceID();
    }, 1500);
}

// Face ID Authentication (only if not push flow)
if (flow !== 'push') {
    setTimeout(() => {
        // Simulate Face ID authentication after 2 seconds
        authenticateWithFaceID();
    }, 2500);
}

function authenticateWithFaceID() {
    const screenContent = document.querySelector('#faceIdScreen .screen-content');
    if (!screenContent) return;
    
    screenContent.innerHTML = `
        <div class="auth-loading-container">
            <div class="faceid-scan-animation">
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <!-- Face outline -->
                    <circle cx="50" cy="50" r="35" stroke="var(--primary-color, #820AD1)" stroke-width="2" opacity="0.3"/>
                    <!-- Scanning ring -->
                    <circle cx="50" cy="50" r="35" stroke="var(--primary-color, #820AD1)" stroke-width="3" stroke-dasharray="220" stroke-dashoffset="220" stroke-linecap="round" class="scan-ring">
                        <animate attributeName="stroke-dashoffset" from="220" to="0" dur="1.5s" fill="freeze"/>
                    </circle>
                    <!-- Face features -->
                    <circle cx="38" cy="42" r="3" fill="var(--primary-color, #820AD1)" opacity="0" class="face-feature">
                        <animate attributeName="opacity" from="0" to="1" begin="0.3s" dur="0.3s" fill="freeze"/>
                    </circle>
                    <circle cx="62" cy="42" r="3" fill="var(--primary-color, #820AD1)" opacity="0" class="face-feature">
                        <animate attributeName="opacity" from="0" to="1" begin="0.5s" dur="0.3s" fill="freeze"/>
                    </circle>
                    <path d="M38 60 Q50 72 62 60" stroke="var(--primary-color, #820AD1)" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0">
                        <animate attributeName="opacity" from="0" to="1" begin="0.7s" dur="0.3s" fill="freeze"/>
                    </path>
                </svg>
            </div>
            <h2 class="auth-loading-text">Verificando identidad...</h2>
            <div class="auth-loading-dots">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    
    setTimeout(() => {
        screenContent.innerHTML = `
            <div class="auth-loading-container">
                <div class="auth-success-check">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" fill="#00D4AA"/>
                        <path d="M8 12L11 15L16 9" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <h2 class="auth-loading-text" style="color: #00D4AA;">¡Identidad verificada!</h2>
            </div>
        `;
        
        setTimeout(() => {
            if (isPagaDomicilia) {
                showScreen('paymentScreen');
            } else {
                showScreen('domiciliationScreen');
            }
        }, 1200);
    }, 2000);
}

// Payment processing
function processPayment() {
    const btn = event.target;
    btn.textContent = 'Procesando...';
    btn.disabled = true;
    
    // Simulate payment processing
    setTimeout(() => {
        showScreen('successScreen');
        btn.textContent = 'Pagar ' + BRAND.formattedTotal();
        btn.disabled = false;
    }, 2000);
}

// Show domiciliation screen
function showDomiciliationScreen() {
    console.log('showDomiciliationScreen called');
    console.log('Current screen:', currentScreen);
    console.log('Selected bank:', bank);
    
    const screenId = (bank === 'santander' || bank === 'hey-banco') ? 'domiciliationScreenNew' : 'domiciliationScreen';
    console.log('Target screen:', screenId);
    
    const targetScreen = document.getElementById(screenId);
    console.log('Target screen element:', targetScreen);
    
    if (targetScreen) {
        showScreen(screenId);
    } else {
        console.error(screenId + ' element not found!');
    }
}

// TyC checkbox handler for domiciliation
document.addEventListener('DOMContentLoaded', () => {
    const tycDomCheckbox = document.getElementById('tycDomCheckbox');
    const btnConfirmDom = document.getElementById('btnConfirmDom');
    
    if (tycDomCheckbox && btnConfirmDom) {
        tycDomCheckbox.addEventListener('change', () => {
            btnConfirmDom.disabled = !tycDomCheckbox.checked;
        });
    }
});

// Confirm domiciliation
function confirmDomiciliation() {
    const alias = document.getElementById('alias').value;
    const timing = document.querySelector('input[name="paymentTiming"]:checked').value;
    const specificDay = document.getElementById('specificDay').value;
    const enableMaxAmount = document.getElementById('enableMaxAmount').checked;
    const maxAmount = enableMaxAmount ? document.getElementById('maxAmount').value : null;
    const enableExpiration = document.getElementById('enableExpiration').checked;
    const expirationDate = enableExpiration ? document.getElementById('expirationDate').value : null;
    
    // BRAND: default alias
    document.getElementById('summaryAlias').textContent = alias || (BRAND.name + ' Casa');
    
    let timingText = '';
    if (timing === 'facturacion') {
        timingText = 'Al recibir factura';
    } else if (timing === 'vencimiento') {
        timingText = 'Fecha de vencimiento';
    } else if (timing === 'dia-especifico' && specificDay) {
        const dayLabels = {
            '1': 'Día 1', '5': 'Día 5', '10': 'Día 10',
            '15': 'Día 15', '20': 'Día 20', '25': 'Día 25',
            'ultimo': 'Último día del mes'
        };
        timingText = dayLabels[specificDay] || `Día ${specificDay}`;
    }
    
    document.getElementById('summaryTiming').textContent = `${timingText} (Mensual)`;
    
    if (enableMaxAmount && maxAmount) {
        document.getElementById('summaryAmount').textContent = 
            `Hasta $${parseFloat(maxAmount).toLocaleString('es-MX', {minimumFractionDigits: 2})} MXN`;
    } else {
        document.getElementById('summaryAmount').textContent = 'Sin límite de monto';
    }
    
    // BRAND: success message with company name
    const finalMessage = document.querySelector('.final-message');
    if (isPagaDomicilia) {
        finalMessage.textContent = 'Tu servicio de ' + BRAND.name + ' ha sido pagado y domiciliado exitosamente';
    } else {
        finalMessage.textContent = 'Tu servicio de ' + BRAND.name + ' ha sido domiciliado exitosamente';
    }
    
    const btn = event.target;
    btn.textContent = 'Configurando...';
    btn.disabled = true;
    
    setTimeout(() => {
        showScreen('finalScreen');
        btn.textContent = 'Confirmar domiciliación';
        btn.disabled = false;
    }, 1500);
}

// Confirm domiciliation - OLD DESIGN
function confirmDomiciliationOld() {
    // Capture all form values from OLD design
    const alias = document.getElementById('aliasOld').value;
    const frequency = 'mensual'; // Static value from the display
    const timing = document.querySelector('input[name="paymentTimingOld"]:checked').value;
    const specificDay = document.getElementById('specificDayOld').value;
    const enableMaxAmount = document.getElementById('enableMaxAmountOld').checked;
    const maxAmount = enableMaxAmount ? document.getElementById('maxAmountOld').value : null;
    const enableExpiration = document.getElementById('enableExpirationOld').checked;
    const expirationDate = enableExpiration ? document.getElementById('expirationDateOld').value : null;
    
    // BRAND: default alias
    document.getElementById('summaryAlias').textContent = alias || (BRAND.name + ' Casa');
    
    // Format timing text
    let timingText = '';
    if (timing === 'facturacion') {
        timingText = 'Al recibir factura';
    } else if (timing === 'vencimiento') {
        timingText = 'Fecha de vencimiento';
    } else if (timing === 'dia-especifico' && specificDay) {
        const dayLabels = {
            '1': 'Día 1',
            '5': 'Día 5',
            '10': 'Día 10',
            '15': 'Día 15',
            '20': 'Día 20',
            '25': 'Día 25',
            'ultimo': 'Último día del mes'
        };
        timingText = dayLabels[specificDay] || `Día ${specificDay}`;
    }
    
    // Add frequency to timing
    const frequencyText = 'Mensual';
    document.getElementById('summaryTiming').textContent = `${timingText} (${frequencyText})`;
    
    // Update amount summary
    if (enableMaxAmount && maxAmount) {
        document.getElementById('summaryAmount').textContent = 
            `Hasta $${parseFloat(maxAmount).toLocaleString('es-MX', {minimumFractionDigits: 2})} MXN`;
    } else {
        document.getElementById('summaryAmount').textContent = 'Sin límite de monto';
    }
    
    // BRAND: success message with company name
    const finalMessage = document.querySelector('.final-message');
    if (isPagaDomicilia) {
        finalMessage.textContent = 'Tu servicio de ' + BRAND.name + ' ha sido pagado y domiciliado exitosamente';
    } else {
        finalMessage.textContent = 'Tu servicio de ' + BRAND.name + ' ha sido domiciliado exitosamente';
    }
    
    // Add processing feedback
    const btn = event.target;
    btn.textContent = 'Configurando...';
    btn.disabled = true;
    
    // Simulate API call
    console.log('Domiciliation configuration (OLD):', {
        alias,
        frequency,
        timing,
        specificDay,
        enableMaxAmount,
        maxAmount: enableMaxAmount ? maxAmount : null,
        enableExpiration,
        expirationDate: enableExpiration ? expirationDate : null,
        accountHolder: document.getElementById('accountHolderOld').value,
        notifyBefore: document.getElementById('notifyBeforePaymentOld').checked,
        notifyAfter: document.getElementById('notifyAfterPaymentOld').checked
    });
    
    setTimeout(() => {
        showScreen('finalScreen');
        btn.textContent = 'Confirmar domiciliación';
        btn.disabled = false;
    }, 1500);
}

// Check if embedded in iframe
const isEmbedded = urlParams.get('embedded') === '1';

// Finish flow
function finish() {
    if (isEmbedded && window.parent !== window) {
        window.parent.postMessage({ type: 'phone-mockup-close' }, '*');
        return;
    }
    if (window.opener) {
        window.close();
    } else {
        alert('En una app real, esto te llevaría de vuelta a la pantalla principal de Hey Banco');
    }
}

function closeApp() {
    showScreen('nuHomeScreen');
}

// Toggle account details
function toggleAccountDetails() {
    const accountDetails = document.getElementById('accountDetails');
    const label = document.getElementById('accountDetailsLabel');
    const chevron = document.getElementById('accountChevron');
    const toggle = document.querySelector('.account-details-toggle');
    
    if (accountDetails.style.display === 'none' || !accountDetails.style.display) {
        accountDetails.style.display = 'block';
        label.textContent = 'Ocultar';
        if (toggle) toggle.classList.add('expanded');
        if (chevron) chevron.classList.add('rotate');
    } else {
        accountDetails.style.display = 'none';
        label.textContent = 'Ver CLABE';
        if (toggle) toggle.classList.remove('expanded');
        if (chevron) chevron.classList.remove('rotate');
    }
}


// Format currency input and handle dynamic fields
document.addEventListener('DOMContentLoaded', () => {
    const maxAmountInput = document.getElementById('maxAmount');
    
    if (maxAmountInput) {
        maxAmountInput.addEventListener('blur', (e) => {
            if (e.target.value) {
                const value = parseFloat(e.target.value);
                if (!isNaN(value)) {
                    e.target.value = value.toFixed(0);
                }
            }
        });
    }
    
    // Handle enable max amount checkbox
    const enableMaxAmountCheckbox = document.getElementById('enableMaxAmount');
    const maxAmountGroup = document.getElementById('maxAmountGroup');
    
    if (enableMaxAmountCheckbox) {
        enableMaxAmountCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                maxAmountGroup.style.display = 'block';
            } else {
                maxAmountGroup.style.display = 'none';
            }
        });
    }
    
    // Handle enable expiration date checkbox
    const enableExpirationCheckbox = document.getElementById('enableExpiration');
    const expirationDateGroup = document.getElementById('expirationDateGroup');
    
    if (enableExpirationCheckbox) {
        enableExpirationCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                expirationDateGroup.style.display = 'block';
            } else {
                expirationDateGroup.style.display = 'none';
            }
        });
    }
    
    // Handle payment timing radio buttons
    const paymentTimingRadios = document.querySelectorAll('input[name="paymentTiming"]');
    const specificDayGroup = document.getElementById('specificDayGroup');
    
    paymentTimingRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'dia-especifico') {
                specificDayGroup.style.display = 'block';
            } else {
                specificDayGroup.style.display = 'none';
            }
        });
    });
    
    // Handle OLD design form elements
    // Handle enable max amount checkbox OLD
    const enableMaxAmountCheckboxOld = document.getElementById('enableMaxAmountOld');
    const maxAmountGroupOld = document.getElementById('maxAmountGroupOld');
    
    if (enableMaxAmountCheckboxOld) {
        enableMaxAmountCheckboxOld.addEventListener('change', (e) => {
            if (e.target.checked) {
                maxAmountGroupOld.style.display = 'block';
            } else {
                maxAmountGroupOld.style.display = 'none';
            }
        });
    }
    
    // Handle enable expiration date checkbox OLD
    const enableExpirationCheckboxOld = document.getElementById('enableExpirationOld');
    const expirationDateGroupOld = document.getElementById('expirationDateGroupOld');
    
    if (enableExpirationCheckboxOld) {
        enableExpirationCheckboxOld.addEventListener('change', (e) => {
            if (e.target.checked) {
                expirationDateGroupOld.style.display = 'block';
            } else {
                expirationDateGroupOld.style.display = 'none';
            }
        });
    }
    
    // Handle payment timing radio buttons OLD
    const paymentTimingRadiosOld = document.querySelectorAll('input[name="paymentTimingOld"]');
    const specificDayGroupOld = document.getElementById('specificDayGroupOld');
    
    paymentTimingRadiosOld.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'dia-especifico') {
                specificDayGroupOld.style.display = 'block';
            } else {
                specificDayGroupOld.style.display = 'none';
            }
        });
    });
    
    // Set minimum date for expiration date OLD
    const expirationDateInputOld = document.getElementById('expirationDateOld');
    if (expirationDateInputOld) {
        const today = new Date().toISOString().split('T')[0];
        expirationDateInputOld.setAttribute('min', today);
    }
    
    // Set minimum date for expiration date (today)
    const expirationDateInput = document.getElementById('expirationDate');
    if (expirationDateInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        expirationDateInput.min = `${yyyy}-${mm}-${dd}`;
    }
});

// Update time every second
function updateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;
    
    document.querySelectorAll('.time').forEach(el => {
        el.textContent = timeStr;
    });
}

updateTime();
setInterval(updateTime, 60000); // Update every minute

