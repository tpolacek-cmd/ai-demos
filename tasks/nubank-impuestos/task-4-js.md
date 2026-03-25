# Task 4: JavaScript logic

**Status:** [x] Complete
**Depende de:** Task 3 (HTML debe estar creado, necesita IDs de elementos)
**Archivo nuevo:** `js/nubank-impuestos-script.js`

## Checklist

- [ ] Crear archivo `js/nubank-impuestos-script.js`
- [ ] Implementar step management (showStep)
- [ ] Implementar helpers (randomDigits, formatCurrentDateTime)
- [ ] Implementar logica Face ID (step 0 → step 1)
- [ ] Implementar CURP input + submit (step 5)
- [ ] Implementar activacion/desactivacion del boton submit segun input
- [ ] Implementar tax selection + toggle (step 6)
- [ ] Implementar "Pagar todos" (step 6 → step 7)
- [ ] Implementar actualizacion de total al togglear taxes
- [ ] Implementar confirmPayment con "Procesando..." (step 7 → step 8)
- [ ] Implementar updateCurpDisplays para propagar CURP a steps 6, 7, 8
- [ ] Implementar DOMContentLoaded init
- [ ] Verificar que "Volver al inicio" reinicia correctamente

## Especificacion

### Patron a seguir

Leer `js/auth-bbva-script.js` (363 lineas) como referencia directa. Este script sigue el mismo patron:
- Variables globales para URL params y mock data
- Funcion `showStep(n)` como state machine
- Funciones handler por step
- `DOMContentLoaded` para init

### Estructura completa

```javascript
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
    var months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
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
    }
}
```

### Step 5: CURP Input logic

```javascript
// ---------------------------------------------------------------------------
// Step 5: CURP input
// ---------------------------------------------------------------------------
function initCurpInput() {
    var input = document.getElementById('nu-curp-field');
    var btn = document.getElementById('nu-submit-btn');
    if (!input || !btn) return;

    input.addEventListener('input', function() {
        if (input.value.trim().length > 0) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
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
```

### Step 6: Tax selection logic

```javascript
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
        if (check) {
            // Toggle visual check state via CSS class
            check.classList.toggle('checked', taxes[i].selected);
        }
    }
    var totalEl = document.getElementById('nu-tax-total');
    if (totalEl) {
        totalEl.textContent = '$' + total.toLocaleString('es-MX', { minimumFractionDigits: 2 });
    }
}
```

### Step 7: Confirmation logic

```javascript
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
```

### Step 8: Success screen

```javascript
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
```

### DOMContentLoaded

```javascript
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
```

### Interacciones importantes

1. **CURP submit button activation**: El boton circular en step 5 empieza gris (desactivado visualmente pero clickeable). Cuando el usuario escribe en el input, el boton cambia a purple via clase `.active`. Si el input esta vacio al hacer click, se usa el CURP default.

2. **Tax toggles**: Cada card en step 6 tiene `onclick="toggleTax(N)"`. Al togglear, la card cambia de estilo (borde purple + check filled vs borde gris + check vacio) y el total se recalcula.

3. **"Pagar todos"**: Selecciona los 3 taxes, actualiza UI, y avanza a step 7 con la confirmacion populada.

4. **Confirm processing**: El boton muestra "Procesando..." por 2 segundos. Luego navega a step 8 y restaura el boton (para que si el usuario vuelve atras y reintenta, funcione).

5. **"Volver al inicio"**: En step 8, hace `showStep(0)` que reinicia la demo completa.

### Notas

- NO importar ni referenciar `brand-config.js`, `demo-builder-config.js` o `demo-router.js`.
- Toda la data es hardcodeada (montos, nombres, CURP default).
- Usar vanilla JS (ES5-compatible como el resto del proyecto). No usar arrow functions, let/const, template literals, etc.
- El script se carga al final del body con `<script src="js/nubank-impuestos-script.js"></script>`.
