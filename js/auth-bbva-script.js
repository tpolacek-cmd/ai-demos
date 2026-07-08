// ==========================================================================
// BBVA Banking App Mock — Script
// Step-based state machine: 0..8
// ==========================================================================

// ---------------------------------------------------------------------------
// URL params
// ---------------------------------------------------------------------------
var urlParams = new URLSearchParams(window.location.search);
var bankParam = urlParams.get('bank') || 'bbva';
var actionParam = urlParams.get('action') || 'pay-domiciliar';
var isEmbedded = urlParams.get('embedded') === '1';
var isDirect = urlParams.get('direct') === '1';
var isDomiciliacion = urlParams.get('flow') === 'domiciliacion' || actionParam === 'domiciliacion';

// ---------------------------------------------------------------------------
// Random data (generated once)
// ---------------------------------------------------------------------------
function randomAlphanumeric(len) {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var result = '';
    for (var i = 0; i < len; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function randomDigits(len) {
    var result = '';
    for (var i = 0; i < len; i++) {
        result += Math.floor(Math.random() * 10).toString();
    }
    return result;
}

var referenceCode = randomAlphanumeric(20);
var folioNumber = randomDigits(10);
var guiaCie = randomDigits(12);

function formatCurrentDateTime() {
    var months = [
        'Ene','Feb','Mar','Abr','May','Jun',
        'Jul','Ago','Sep','Oct','Nov','Dic'
    ];
    var now = new Date();
    var dd = String(now.getDate()).padStart(2, '0');
    var mmm = months[now.getMonth()];
    var yyyy = now.getFullYear();
    var hh = String(now.getHours()).padStart(2, '0');
    var min = String(now.getMinutes()).padStart(2, '0');
    return dd + ' ' + mmm + ' ' + yyyy + ' ' + hh + ':' + min;
}

var currentDateTime = formatCurrentDateTime();

// ---------------------------------------------------------------------------
// Step management
// ---------------------------------------------------------------------------
var currentStep = 0;
var autoAdvanceTimer = null;
var editingServiceIndex = 0;

function showStep(n) {
    // Clear any pending timer
    if (autoAdvanceTimer) {
        clearTimeout(autoAdvanceTimer);
        autoAdvanceTimer = null;
    }

    var steps = document.querySelectorAll('.bbva-step');
    for (var i = 0; i < steps.length; i++) {
        steps[i].classList.remove('active');
    }

    var target = document.getElementById('bbva-step-' + n);
    if (target) {
        target.classList.add('active');
        currentStep = n;
    }

    // Auto-advance logic
    if (n === 1) {
        autoAdvanceTimer = setTimeout(function() { showStep(2); }, 3000);
    }
    // Step 3 (Face ID) is skipped — hotspot goes directly to step 4
    if (n === 4) {
        autoAdvanceTimer = setTimeout(function() { showStep(5); }, 5000);
    }
}

// ---------------------------------------------------------------------------
// Step 0: Push notification click
// ---------------------------------------------------------------------------
function onPushClick() {
    var push = document.getElementById('bbva-push-card');
    if (!push) return;
    push.style.transition = 'all 0.3s ease';
    push.style.transform = 'translateY(-100px)';
    push.style.opacity = '0';
    setTimeout(function() { showStep(1); }, 350);
}

// ---------------------------------------------------------------------------
// Domiciliacion flow: CLABE screen → Formato screen → app BBVA (step 1)
// ---------------------------------------------------------------------------
function onClabeContinuar() {
    showStep('formato');
}

function onFirmarDomiciliacion() {
    // Open the app BBVA and continue the existing flow (splash → ... → receipt)
    showStep(1);
}

// CLABE T&C checkbox toggle (visual)
(function initClabeCheckbox() {
    var checkbox = document.getElementById('bbva-clabe-tyc');
    var box = document.getElementById('bbva-clabe-checkbox');
    var svg = document.getElementById('bbva-clabe-check-svg');
    if (!checkbox || !box) return;

    function updateVisual() {
        if (checkbox.checked) {
            box.classList.add('checked');
            if (svg) svg.style.display = '';
        } else {
            box.classList.remove('checked');
            if (svg) svg.style.display = 'none';
        }
    }

    checkbox.addEventListener('change', updateVisual);
    updateVisual(); // init
})();

// ---------------------------------------------------------------------------
// Step 2: Hotspot click → skip Face ID, go straight to loading
// ---------------------------------------------------------------------------
function onHotspotClick() {
    showStep(4);
}

// ---------------------------------------------------------------------------
// Step 3: Face ID sequence
// ---------------------------------------------------------------------------
function startFaceIdSequence() {
    var overlay = document.getElementById('bbva-faceid-overlay');
    if (!overlay) return;

    // Phase 1: fade in
    overlay.setAttribute('data-phase', 'in');

    // Phase 2: hold
    setTimeout(function() {
        overlay.setAttribute('data-phase', 'hold');
    }, 500);

    // Phase 3: fade out
    setTimeout(function() {
        overlay.setAttribute('data-phase', 'out');
    }, 3500);

    // Advance to step 4
    autoAdvanceTimer = setTimeout(function() {
        showStep(4);
    }, 4000);
}

// ---------------------------------------------------------------------------
// Help dialog (? button on recurring payment)
// ---------------------------------------------------------------------------
function openHelpDialog() {
    document.getElementById('bbvaHelpOverlay').classList.add('bbva-help-open');
    document.getElementById('bbvaHelpDialog').classList.add('bbva-help-open');
}

function closeHelpDialog() {
    document.getElementById('bbvaHelpOverlay').classList.remove('bbva-help-open');
    document.getElementById('bbvaHelpDialog').classList.remove('bbva-help-open');
}

// ---------------------------------------------------------------------------
// Step 5: Confirm → Step 6
// ---------------------------------------------------------------------------
function onConfirmPayment() {
    var btn = document.getElementById('bbva-confirm-btn');
    if (btn) {
        btn.textContent = 'Procesando...';
        btn.disabled = true;
    }
    setTimeout(function() {
        if (btn) {
            btn.textContent = 'Confirmar';
            btn.disabled = false;
        }
        showStep(6);
    }, 1800);
}

// Recurrente checkbox toggle
(function initRecurrenteCheckbox() {
    var checkbox = document.getElementById('bbva-recurring');
    var box = document.getElementById('bbvaCheckboxBox');
    var svg = document.getElementById('bbvaCheckboxSvg');
    if (!checkbox || !box) return;

    function updateVisual() {
        if (checkbox.checked) {
            box.classList.add('checked');
            if (svg) svg.style.display = '';
        } else {
            box.classList.remove('checked');
            if (svg) svg.style.display = 'none';
        }
    }

    checkbox.addEventListener('change', updateVisual);
    updateVisual(); // init
})();

// ---------------------------------------------------------------------------
// Step 6: Click anywhere → Step 7
// ---------------------------------------------------------------------------
function onReceiptClick() {
    showStep(7);
}

// ---------------------------------------------------------------------------
// Step 7: Edit pencil → Step 8
// ---------------------------------------------------------------------------
function onEditService(index) {
    editingServiceIndex = index;
    populateEditScreen(index);
    showStep(8);
}

// ---------------------------------------------------------------------------
// Step 8: Back → Step 7
// ---------------------------------------------------------------------------
function onEditBack() {
    showStep(7);
}

// ---------------------------------------------------------------------------
// Step 8: Populate edit screen
// ---------------------------------------------------------------------------
var services = []; // filled in DOMContentLoaded

function populateEditScreen(index) {
    var svc = services[index];
    if (!svc) return;

    var nameEl = document.getElementById('bbva-edit-svc-name');
    var typeEl = document.getElementById('bbva-edit-svc-type');
    var aliasEl = document.getElementById('bbva-edit-alias');
    var iconEl = document.getElementById('bbva-edit-svc-icon');
    var amountEl = document.getElementById('bbva-edit-max-amount');

    if (nameEl) nameEl.textContent = svc.name;
    if (typeEl) typeEl.textContent = svc.type;
    if (aliasEl) aliasEl.value = svc.alias;
    if (amountEl) amountEl.value = svc.amount;

    // Icon
    if (iconEl) {
        var icons = {
            0: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
            1: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
            2: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>'
        };
        // For service 0 use a lightbulb
        var lightbulb = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg>';
        iconEl.innerHTML = index === 0 ? lightbulb : (icons[index] || lightbulb);
    }
}

// ---------------------------------------------------------------------------
// Step 8: Charge option cards
// ---------------------------------------------------------------------------
function selectChargeOption(el) {
    var options = document.querySelectorAll('.bbva-charge-option');
    for (var i = 0; i < options.length; i++) {
        options[i].classList.remove('active');
    }
    el.classList.add('active');
}

// ---------------------------------------------------------------------------
// Step 8: Update domiciliation button (no-op visual only)
// ---------------------------------------------------------------------------
function onUpdateDomiciliation() {
    var btn = document.getElementById('bbva-update-dom-btn');
    if (btn) {
        btn.textContent = 'Actualizando...';
        btn.disabled = true;
    }
    setTimeout(function() {
        if (btn) {
            btn.textContent = 'Actualizar domiciliacion';
            btn.disabled = false;
        }
        showStep(7);
    }, 1500);
}

// ---------------------------------------------------------------------------
// DOMContentLoaded — populate dynamic content from BRAND
// ---------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function() {

    // Embedded mode
    if (isEmbedded) {
        document.body.classList.add('bbva-embedded');
    }

    // Build services array (uses BRAND global)
    services = [
        {
            name: BRAND.name,
            type: BRAND.serviceType,
            alias: BRAND.name + ' Casa',
            amount: BRAND.account.totalAmount.toFixed(2),
            dueText: 'Pagado hoy',
            amountFormatted: BRAND.formattedTotal()
        },
        {
            name: 'Telmex',
            type: 'Internet y Telefono',
            alias: 'Plan Infinitum',
            amount: '1899.00',
            dueText: 'Vence en 12 dias',
            amountFormatted: '$1,899.00'
        },
        {
            name: 'Naturgy',
            type: 'Gas Natural',
            alias: 'Naturgy Hogar',
            amount: '1199.00',
            dueText: 'Vence en 5 dias',
            amountFormatted: '$1,199.00'
        }
    ];

    // --- Step 5: Payment summary ---
    var elComercio = document.getElementById('bbva-pay-comercio');
    var elImporte = document.getElementById('bbva-pay-importe');
    var elConvenio = document.getElementById('bbva-pay-convenio');
    var elReferencia = document.getElementById('bbva-pay-referencia');
    var elBottomAmount = document.getElementById('bbva-pay-bottom-amount');
    var elBtnPay = document.getElementById('bbva-pay-btn-amount');

    if (elComercio) elComercio.textContent = BRAND.name;
    if (elImporte) elImporte.textContent = BRAND.formattedTotal();
    if (elConvenio) elConvenio.textContent = BRAND.account.reference;
    if (elReferencia) elReferencia.textContent = referenceCode;
    if (elBottomAmount) elBottomAmount.textContent = BRAND.formattedTotal();
    if (elBtnPay) elBtnPay.textContent = BRAND.formattedTotal();

    // --- Step 6: Receipt ---
    var elRecAmount = document.getElementById('bbva-rec-amount');
    var elRecDatetime = document.getElementById('bbva-rec-datetime');
    var elRecFolio = document.getElementById('bbva-rec-folio');
    var elRecComercio = document.getElementById('bbva-rec-comercio');
    var elRecConvenio = document.getElementById('bbva-rec-convenio');
    var elRecRef = document.getElementById('bbva-rec-referencia');
    var elRecGuia = document.getElementById('bbva-rec-guia');

    if (elRecAmount) elRecAmount.textContent = BRAND.formattedTotal();
    if (elRecDatetime) elRecDatetime.textContent = currentDateTime;
    if (elRecFolio) elRecFolio.textContent = folioNumber;
    if (elRecComercio) elRecComercio.textContent = BRAND.name;
    if (elRecConvenio) elRecConvenio.textContent = BRAND.account.reference;
    if (elRecRef) elRecRef.textContent = referenceCode;
    if (elRecGuia) elRecGuia.textContent = guiaCie;

    // --- Step 7: Dashboard ---
    // Service card #0 (BRAND)
    var svc0Name = document.getElementById('bbva-svc0-name');
    var svc0Type = document.getElementById('bbva-svc0-type');
    var svc0Alias = document.getElementById('bbva-svc0-alias');
    var svc0Amount = document.getElementById('bbva-svc0-amount');

    if (svc0Name) svc0Name.textContent = BRAND.name;
    if (svc0Type) svc0Type.textContent = BRAND.serviceType;
    if (svc0Alias) svc0Alias.textContent = BRAND.name + ' Casa';
    if (svc0Amount) svc0Amount.textContent = BRAND.formattedTotal();

    // Stat total
    var statTotal = document.getElementById('bbva-stat-total');
    if (statTotal) {
        var total = BRAND.account.totalAmount + 1899 + 1199;
        statTotal.textContent = '$' + total.toLocaleString('es-MX', { minimumFractionDigits: 2 });
    }

    // Domiciliacion flow: always start at the CLABE screen (even if direct=1),
    // then Formato, then the app BBVA. Otherwise keep the existing behavior.
    if (isDomiciliacion) {
        showStep('clabe');
    } else {
        // Direct mode (mobile): skip phone home/push notification, go straight to app splash
        showStep(isDirect ? 1 : 0);
    }
});
