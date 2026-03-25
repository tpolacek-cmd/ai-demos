// ==========================================================================
// Nubank Impuestos — Script
// Step-based state machine: 0..8
// ==========================================================================

// ---------------------------------------------------------------------------
// URL params
// ---------------------------------------------------------------------------
var isEmbedded = new URLSearchParams(window.location.search).get('embedded') === '1';

// ---------------------------------------------------------------------------
// Random data helpers (mismas que auth-bbva-script.js)
// ---------------------------------------------------------------------------
function randomDigits(len) {
    var result = '';
    for (var i = 0; i < len; i++) {
        result += Math.floor(Math.random() * 10).toString();
    }
    return result;
}

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

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
var DEFAULT_CURP = 'BEMD850101HDFRNN09';
var enteredCurp = '';
var folioNumber = randomDigits(10);
var currentDateTime = formatCurrentDateTime();

var taxes = [
    { id: 'tenencia', name: 'Impuesto sobre tenencia vehicular (revalidacion de placas)', amount: 1000.00, selected: true },
    { id: 'hospedaje', name: 'Impuesto sobre hospedaje', amount: 1800.00, selected: true },
    { id: 'predial', name: 'Impuesto predial', amount: 1000.00, selected: true }
];

// ---------------------------------------------------------------------------
// Step management
// ---------------------------------------------------------------------------
var currentStep = 0;

function showStep(n) {
    var steps = document.querySelectorAll('.nu-step');
    for (var i = 0; i < steps.length; i++) {
        steps[i].classList.remove('active');
    }
    var target = document.getElementById('nu-step-' + n);
    if (target) {
        target.classList.add('active');
        currentStep = n;
    }

    // Scroll to top on any scrollable container within the step
    if (target) {
        var scrollable = target.querySelector('[class*="__scroll"]');
        if (scrollable) scrollable.scrollTop = 0;
        // Also reset __content containers (used as scrollable areas)
        var content = target.querySelector('[class*="__content"]');
        if (content) content.scrollTop = 0;
    }
}

// ---------------------------------------------------------------------------
// Step 5: CURP input
// ---------------------------------------------------------------------------
function initCurpInput() {
    var input = document.getElementById('nu-curp-field');
    var btn = document.getElementById('nu-submit-btn');
    var counter = document.getElementById('nu-curp-counter');
    if (!input || !btn) return;

    input.addEventListener('input', function() {
        // Toggle submit button active state
        if (input.value.trim().length > 0) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
        // Update character counter
        if (counter) {
            counter.textContent = input.value.length;
        }
    });
}

function submitCurp() {
    var input = document.getElementById('nu-curp-field');
    enteredCurp = (input && input.value.trim()) ? input.value.trim().toUpperCase() : DEFAULT_CURP;
    updateCurpDisplays();
    showStep(6);
}

function updateCurpDisplays() {
    var curp = enteredCurp || DEFAULT_CURP;
    // Step 6: subtitle
    var el6 = document.getElementById('nu-tax-curp');
    if (el6) el6.textContent = 'CURP: ' + curp;
    // Step 7: confirm card
    var el7 = document.getElementById('nu-confirm-curp');
    if (el7) el7.textContent = curp;
    // Step 8: receipt
    var el8 = document.getElementById('nu-exito-curp');
    if (el8) el8.textContent = curp;
}

// ---------------------------------------------------------------------------
// Step 6: Tax selection
// ---------------------------------------------------------------------------
function toggleTax(index) {
    taxes[index].selected = !taxes[index].selected;
    updateTaxUI();
}

function payAll() {
    for (var i = 0; i < taxes.length; i++) {
        taxes[i].selected = true;
    }
    updateTaxUI();
    // Populate confirmation step
    populateConfirmation();
    showStep(7);
}

function updateTaxUI() {
    var total = 0;
    for (var i = 0; i < taxes.length; i++) {
        var card = document.getElementById('nu-tax-' + i);
        var check = document.getElementById('nu-tax-check-' + i);
        if (card) {
            if (taxes[i].selected) {
                card.classList.add('selected');
                total += taxes[i].amount;
            } else {
                card.classList.remove('selected');
            }
        }
        // Checkbox visual state is handled by .nu-tax-card.selected CSS rule
    }
    var totalEl = document.getElementById('nu-tax-total');
    if (totalEl) {
        totalEl.textContent = '$' + total.toLocaleString('es-MX', { minimumFractionDigits: 2 });
    }
    // Update button text based on selection
    var selectedCount = 0;
    for (var j = 0; j < taxes.length; j++) {
        if (taxes[j].selected) selectedCount++;
    }
    var payBtn = document.getElementById('nu-pay-all-btn');
    if (payBtn) {
        payBtn.textContent = (selectedCount === taxes.length) ? 'Pagar todos' : 'Pagar seleccionados';
    }
}

// ---------------------------------------------------------------------------
// Step 7: Confirmation
// ---------------------------------------------------------------------------
function populateConfirmation() {
    var total = 0;
    for (var i = 0; i < taxes.length; i++) {
        var row = document.getElementById('nu-confirm-tax-' + i);
        if (row) {
            row.style.display = taxes[i].selected ? '' : 'none';
            if (taxes[i].selected) total += taxes[i].amount;
        }
    }
    var formatted = '$' + total.toLocaleString('es-MX', { minimumFractionDigits: 2 });
    var totalEl = document.getElementById('nu-confirm-total');
    if (totalEl) totalEl.textContent = formatted;
    var btnAmount = document.getElementById('nu-confirm-btn-amount');
    if (btnAmount) btnAmount.textContent = formatted;
}

function confirmPayment() {
    var btn = document.getElementById('nu-confirm-btn');
    if (btn) {
        btn.textContent = 'Procesando...';
        btn.disabled = true;
    }
    setTimeout(function() {
        // Populate success screen
        populateSuccess();
        showStep(8);
        // Reset button for potential replay
        if (btn) {
            btn.innerHTML = 'Pagar <span id="nu-confirm-btn-amount">$3,800.00</span>';
            btn.disabled = false;
        }
    }, 2000);
}

// ---------------------------------------------------------------------------
// Step 8: Success
// ---------------------------------------------------------------------------
function populateSuccess() {
    var elDatetime = document.getElementById('nu-exito-datetime');
    var elFolio = document.getElementById('nu-exito-folio');
    if (elDatetime) elDatetime.textContent = formatCurrentDateTime();
    if (elFolio) elFolio.textContent = folioNumber;
    // CURP already updated by updateCurpDisplays
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function() {
    if (isEmbedded) {
        document.body.classList.add('nu-embedded');
    }
    initCurpInput();
    updateTaxUI();
    showStep(0);
});
