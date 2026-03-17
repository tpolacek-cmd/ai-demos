# Fase 2: Consolidacion de Configuracion de Bancos

**Prioridad:** Alta
**Estado:** Completada
**Dependencias:** Fase 1 completada (brand-config.js debe existir)
**Impacto:** Elimina 5 definiciones duplicadas de bancos, reduce a 1

---

## Objetivo

Unificar las 5 definiciones separadas de bancos en un unico archivo `banks-config.js`. Todos los archivos que necesiten datos de bancos importan de ahi.

---

## Problema actual

Los datos de bancos estan definidos en 5 objetos separados en 3 archivos:

1. **`script.js:50-62`** - `bankNames` (solo nombres)
2. **`script.js:63-120`** - `bankLogos` (solo logos HTML)
3. **`script.js:320-340`** - `bankColors` (solo colores)
4. **`script.js:458-471`** - `bankIdentityRequirements` (tipo de identidad por banco)
5. **`auth-mobile-script.js:11-102`** - `bankContent` (nombre, logo, card number, CLABE, telefono)

Ademas, `auth-mobile.html` lineas 13-107 tiene un bloque `<script>` inline que define `bankColorMap` para aplicar colores dinamicamente.

Agregar un banco nuevo requiere editar 5+ lugares en 3+ archivos.

---

## Paso 1: Crear `banks-config.js`

Crear el archivo `config/banks-config.js` con un unico objeto `BANKS` que contenga toda la info de cada banco.

**NOTA:** Los paths de logos en `logoHtml` ya deben usar `assets/banks/` (resultado de Fase 0).

Estructura:

```js
// banks-config.js
// CONFIGURACION CENTRALIZADA DE BANCOS
// Para agregar un banco: agregar una entrada a este objeto.
// Para remover un banco: eliminar la entrada.

const BANKS = {
    'hey-banco': {
        name: 'Hey Banco',
        fullName: 'Hey Banco Mexico',
        accountName: 'Cuenta Hey Banco',
        iconText: 'Hey',
        color: '#1A2D4F',
        identityType: 'curp',        // 'curp' | 'rfc' | 'clabe'
        cardNumber: '**** **** **** 4829',
        clabe: '058180157012345829',
        phone: '800 439 4373',
        logoHtml: '<img src="Hey_Banco.svg" alt="Hey Banco" style="width: 100%; height: 100%; object-fit: contain;">',
        logoHtmlSmall: '<img src="Hey_Banco.svg" alt="Hey Banco" style="width: 32px; height: 32px; object-fit: contain;">',
        featured: true,               // Si se muestra como "Recomendado"
        deepLinkScheme: 'heybanco',   // Para simular deep links
    },
    santander: {
        name: 'Santander',
        fullName: 'Banco Santander Mexico',
        accountName: 'Cuenta Santander',
        iconText: 'Santander',
        color: '#EC0000',
        identityType: 'curp',
        cardNumber: '**** **** **** 5678',
        clabe: '014180001234565678',
        phone: '55 5169 4300',
        logoHtml: '<img src="santa.png" alt="Santander" style="width: 32px; height: 32px; object-fit: contain;">',
        logoHtmlSmall: '<img src="santa.png" alt="Santander" style="width: 32px; height: 32px; object-fit: contain;">',
        featured: false,
        deepLinkScheme: 'santander',
    },
    banamex: {
        name: 'Banamex',
        fullName: 'Citibanamex',
        accountName: 'Cuenta Banamex',
        iconText: 'Banamex',
        color: '#003B71',
        identityType: 'curp',
        cardNumber: '**** **** **** 3456',
        clabe: '002180001234563456',
        phone: '55 1226 2639',
        logoHtml: '<img src="banamex.svg" alt="Banamex" style="width: 32px; height: 32px; object-fit: contain;">',
        logoHtmlSmall: '<img src="banamex.svg" alt="Banamex" style="width: 32px; height: 32px; object-fit: contain;">',
        featured: false,
        deepLinkScheme: 'banamex',
    },
    bbva: {
        name: 'BBVA',
        fullName: 'BBVA Mexico',
        accountName: 'Cuenta BBVA',
        iconText: 'BBVA',
        color: '#004481',
        identityType: 'clabe',
        cardNumber: '**** **** **** 7890',
        clabe: '012180001234567890',
        phone: '55 5226 2663',
        logoHtml: '<svg width="32" height="32" viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="8" fill="white"/><text x="20" y="26" font-family="Arial" font-size="14" font-weight="bold" fill="#004481" text-anchor="middle">BBVA</text></svg>',
        logoHtmlSmall: null,  // usa logoHtml
        featured: false,
        deepLinkScheme: 'bbva',
    },
    hsbc: {
        name: 'HSBC',
        fullName: 'HSBC Mexico',
        accountName: 'Cuenta HSBC',
        iconText: 'HSBC',
        color: '#DB0011',
        identityType: 'curp',
        cardNumber: '**** **** **** 2345',
        clabe: '021180001234562345',
        phone: '55 5721 2345',
        logoHtml: '<img src="hsbc.jpg" alt="HSBC" style="width: 32px; height: 32px; object-fit: contain;">',
        logoHtmlSmall: '<img src="hsbc.jpg" alt="HSBC" style="width: 32px; height: 32px; object-fit: contain;">',
        featured: false,
        deepLinkScheme: 'hsbc',
    },
    stori: {
        name: 'Stori',
        fullName: 'Stori Card',
        accountName: 'Cuenta Stori',
        iconText: 'Stori',
        color: '#00D4AA',
        identityType: 'rfc',
        cardNumber: '**** **** **** 6789',
        clabe: '646180157012346789',
        phone: '55 4161 4800',
        logoHtml: '<img src="stori.png" alt="Stori" style="width: 32px; height: 32px; object-fit: contain;">',
        logoHtmlSmall: '<img src="stori.png" alt="Stori" style="width: 32px; height: 32px; object-fit: contain;">',
        featured: false,
        deepLinkScheme: 'stori',
    },
    banorte: {
        name: 'Banorte',
        fullName: 'Banco del Norte',
        accountName: 'Cuenta Banorte',
        iconText: 'Banorte',
        color: '#ED1C27',
        identityType: 'curp',
        cardNumber: '**** **** **** 8901',
        clabe: '072180001234568901',
        phone: '55 5140 5600',
        logoHtml: '<svg width="32" height="32" viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="8" fill="white"/><text x="20" y="26" font-family="Arial" font-size="11" font-weight="bold" fill="#ED1C27" text-anchor="middle">Banorte</text></svg>',
        logoHtmlSmall: null,
        featured: false,
        deepLinkScheme: 'banorte',
    },
    scotiabank: {
        name: 'Scotiabank',
        fullName: 'Scotiabank Mexico',
        accountName: 'Cuenta Scotiabank',
        iconText: 'Scotia',
        color: '#EC1D24',
        identityType: 'curp',
        cardNumber: '**** **** **** 4567',
        clabe: '044180001234564567',
        phone: '55 5123 4567',
        logoHtml: '<svg width="32" height="32" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" fill="white"/><circle cx="20" cy="20" r="12" stroke="#EC1D24" stroke-width="2"/></svg>',
        logoHtmlSmall: null,
        featured: false,
        deepLinkScheme: 'scotiabank',
    },
    tapi: {
        name: 'TAPI',
        fullName: 'TAPI',
        accountName: 'Cuenta TAPI',
        iconText: 'TAPI',
        color: '#00c853',
        identityType: 'rfc',
        cardNumber: '**** **** **** 7821',
        clabe: '646180157098765821',
        phone: '55 8765 4321',
        logoHtml: '<img src="tapi-Isologotipo blanco.png" alt="TAPI" style="width: 32px; height: 32px; object-fit: contain;">',
        logoHtmlSmall: '<img src="tapi-Isologotipo blanco.png" alt="TAPI" style="width: 32px; height: 32px; object-fit: contain;">',
        featured: false,
        deepLinkScheme: 'tapi',
    },
};

// Helpers derivados (generados automaticamente del objeto BANKS)
const bankNames = {};
const bankLogos = {};
const bankColors = {};
const bankIdentityRequirements = { default: 'curp' };

Object.entries(BANKS).forEach(([key, bank]) => {
    bankNames[key] = bank.name;
    bankLogos[key] = bank.logoHtml;
    bankColors[key] = bank.color;
    if (bank.identityType) {
        bankIdentityRequirements[key] = bank.identityType;
    }
});
```

---

## Paso 2: Refactorizar `script.js`

1. Agregar `<script src="config/banks-config.js"></script>` en `checkout.html` ANTES de `js/script.js`.
2. Eliminar de `js/script.js`:
   - `bankNames` (lineas ~50-62)
   - `bankLogos` (lineas ~63-120)
   - `bankColors` (lineas ~320-340, en la seccion Account to Account)
   - `bankIdentityRequirements` (lineas ~464-471)
3. Estos objetos ahora vienen de `banks-config.js` (los helpers derivados).

---

## Paso 3: Refactorizar `auth-mobile-script.js`

1. Agregar `<script src="config/banks-config.js"></script>` en `auth-mobile.html` ANTES de `js/auth-mobile-script.js`.
2. Eliminar de `js/auth-mobile-script.js`:
   - `bankContent` (lineas 11-102)
3. Reemplazar las referencias a `bankContent[bank]` por `BANKS[bank]`.
4. Verificar que los campos coincidan (ej: `currentBankContent.name` -> `BANKS[bank].name`).

---

## Paso 4: Limpiar `auth-mobile.html` inline script

El bloque `<script>` inline en `auth-mobile.html` (lineas ~13-107) define `bankColorMap` y aplica colores con `document.write`. Refactorizar para:

1. Leer colores de `BANKS[bank].color` en vez del `bankColorMap` hardcodeado.
2. Mover la logica de aplicar CSS variables dinamicas a un listener DOMContentLoaded limpio.
3. Eliminar el `document.write` (anti-pattern) y reemplazar por `document.documentElement.style.setProperty()`.

---

## Verificacion

```bash
# No deberia haber objetos bankNames/bankLogos/bankColors definidos fuera de banks-config.js
grep -n "const bankNames" --include="*.js" .
grep -n "const bankLogos" --include="*.js" .
grep -n "const bankColors" --include="*.js" .
grep -n "const bankContent" --include="*.js" .
grep -n "bankColorMap" --include="*.html" .

# Cada uno deberia aparecer SOLO en banks-config.js (si se mantienen los helpers)
```
