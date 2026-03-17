# Fase 1: Centralizacion de Marca

**Prioridad:** Alta
**Estado:** Pendiente
**Dependencias:** Ninguna (primera fase)
**Impacto:** Resuelve el 70% del problema de rebranding

---

## Objetivo

Crear un archivo central `brand-config.js` con toda la data de marca y un archivo `variables.css` con todas las CSS variables. Refactorizar todos los archivos existentes para que lean de estas fuentes centrales en vez de tener valores hardcodeados.

---

## Paso 1: Crear `brand-config.js`

Crear el archivo en `config/brand-config.js` con esta estructura:

```js
// brand-config.js
// BRAND CONFIG: Este es el unico archivo que necesitas editar para cambiar de marca.
// Todos los demas archivos del proyecto leen de aqui.

const BRAND = {
    // Identidad
    name: 'Totalplay',
    fullName: 'Totalplay Mexico',
    serviceType: 'Internet y TV',
    planName: 'Plan Sonico - Simetrico',
    logo: 'totalplay.png',

    // Contacto y dominio
    domain: 'totalplay.com.mx',
    paymentDomain: 'pago.totalplay.com.mx',
    phone: '800 868 2527',
    phoneFriendly: '800 totalplay',
    whatsapp: '55 6611 0060',

    // Datos de cuenta/factura para la demo
    account: {
        number: '0102-8178-61',
        period: '10 Feb - 09 Mar 2026',
        dueDate: '28 de Febrero 2026',
        dueDateShort: '28 Feb 2026',
        planAmount: 880.00,
        discount: -40.00,
        discountLabel: 'Descuento por lealtad',
        previousBalance: 0.00,
        totalAmount: 840.00,
        reference: '0900 0001 0281 7861 3',
    },

    // Colores de la marca
    colors: {
        primary: '#DBE442',
        primaryDark: '#C5CD2E',
        primaryLight: '#F9FBEB',
        accent: '#E5EC6B',
        background: '#FDFDE8',
        headerBg: '#2A3444',
        btnText: '#1a1a2e',
    },

    // Deep link scheme (usado en simulacion de apps bancarias)
    deepLinkServiceParam: 'totalplay',
};

// Helpers de formato
BRAND.formattedTotal = () =>
    '$' + BRAND.account.totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 });

BRAND.formattedPlanAmount = () =>
    '$' + BRAND.account.planAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 });

BRAND.formattedDiscount = () =>
    '-$' + Math.abs(BRAND.account.discount).toLocaleString('es-MX', { minimumFractionDigits: 2 });
```

---

## Paso 2: Crear `variables.css`

Crear el archivo en `config/variables.css` con las variables CSS unificadas. Este archivo sera importado por TODOS los CSS del proyecto (que estaran en `css/`).

```css
/* variables.css
   CSS VARIABLES CENTRALIZADAS
   Los valores de color se sincronizan con brand-config.js.
   Al cambiar de marca, actualizar ambos archivos. */

:root {
    /* Colores de marca */
    --primary-color: #DBE442;
    --primary-dark: #C5CD2E;
    --primary-light: #F9FBEB;
    --secondary-color: #DBE442;
    --accent-color: #E5EC6B;
    --background: #FDFDE8;
    --gradient-start: #DBE442;
    --gradient-end: #E5EC6B;
    --header-bg: #2A3444;
    --btn-text-color: #1a1a2e;

    /* Colores generales (no cambian con la marca) */
    --text-primary: #1a1a2e;
    --text-secondary: #6c757d;
    --border-color: #e2e8f0;
    --white: #ffffff;
    --danger: #dc3545;
    --warning: #ffc107;
    --success: #28a745;

    /* Sombras (usan color de marca) */
    --shadow-sm: 0 2px 8px rgba(219, 228, 66, 0.10);
    --shadow-md: 0 4px 12px rgba(219, 228, 66, 0.15);
    --shadow-lg: 0 8px 24px rgba(219, 228, 66, 0.18);
    --shadow-xl: 0 12px 32px rgba(219, 228, 66, 0.22);
}
```

---

## Paso 3: Eliminar bloques `:root` duplicados

Reemplazar los bloques `:root` existentes en estos 4 archivos por un `@import` de `variables.css`:

### 3a. `css/styles.css` (lineas 1-22)
- Eliminar el bloque `:root { ... }` completo.
- Agregar al inicio: `@import url('../config/variables.css');`

### 3b. `css/menu-styles.css` (lineas 1-20)
- Eliminar el bloque `:root { ... }` completo.
- Agregar al inicio: `@import url('../config/variables.css');`

### 3c. `css/qr-styles.css` (lineas 7-14 las variables `--tp-*`)
- Eliminar las variables `--tp-primary`, `--tp-dark`, etc.
- Reemplazar todas las referencias a `--tp-primary` por `--primary-color`, `--tp-dark` por `--header-bg`, etc.
- Agregar al inicio: `@import url('../config/variables.css');`

### 3d. `index.html` (inline `<style>` - variables `--tp-*`)
- Eliminar las variables CSS del bloque `<style>`.
- Agregar `<link rel="stylesheet" href="config/variables.css">` en el `<head>`.
- Reemplazar referencias `--tp-primary` por `--primary-color`, etc.

---

## Paso 4: Refactorizar archivos para leer de `BRAND`

En cada archivo HTML, agregar `<script src="config/brand-config.js"></script>` como PRIMER script (antes de cualquier otro script).

Luego, reemplazar valores hardcodeados por lectura dinamica. Detalles por archivo:

### 4a. `checkout.html`
Valores a reemplazar dinamicamente via JS al cargar la pagina:

| Valor hardcodeado | Reemplazo |
|---|---|
| `<title>Totalplay - Checkout de Pago</title>` | `document.title = BRAND.name + ' - Checkout de Pago'` |
| `<img src="totalplay.png" alt="Totalplay">` en header | `src=BRAND.logo`, `alt=BRAND.name` |
| `<img src="totalplay.png" alt="Totalplay">` en modal CURP | idem |
| Numero de cuenta `0102-8178-61` (2 lugares) | `BRAND.account.number` |
| Periodo `10 Feb - 09 Mar 2026` | `BRAND.account.period` |
| Vencimiento `28 de Febrero 2026` (2 lugares) | `BRAND.account.dueDate` |
| `$840.00 MXN` (6 lugares) | `BRAND.formattedTotal() + ' MXN'` |
| `Plan Sonico - Simetrico: $880.00` | `BRAND.account.planName + ': ' + BRAND.formattedPlanAmount()` |
| `Descuento por lealtad: -$40.00` | `BRAND.account.discountLabel + ': ' + BRAND.formattedDiscount()` |
| `Totalplay - Internet y TV` | `BRAND.name + ' - ' + BRAND.serviceType` |
| `portal de Totalplay` | `'portal de ' + BRAND.name` |
| `recibo de Totalplay` | `'recibo de ' + BRAND.name` |

Implementar con un bloque `DOMContentLoaded` al final del body que setee todos los valores usando `data-brand` attributes o IDs especificos.

### 4b. `whatsapp.html`
Valores a reemplazar:

| Valor hardcodeado | Reemplazo |
|---|---|
| Titulo de la pagina | Via JS |
| Imagen avatar del chat `totalplay.png` (2 lugares) | `BRAND.logo` |
| `Totalplay Mexico` en chat name y header | `BRAND.fullName` |
| `de *Totalplay Mexico*` en mensajes | `BRAND.fullName` |
| `servicio de Internet y TV` | `BRAND.serviceType` |
| `$840.00` en preview y link (3 lugares) | `BRAND.formattedTotal()` |
| `Cuenta 0102-8178-61` | `BRAND.account.number` |
| `28 Feb 2026` | `BRAND.account.dueDateShort` |
| `pago.totalplay.com.mx` (2 lugares) | `BRAND.paymentDomain` |
| `800 totalplay` | `BRAND.phoneFriendly` |
| `portal de pagos de Totalplay` | `'portal de pagos de ' + BRAND.name` |

### 4c. `auth-mobile.html`
Valores a reemplazar:

| Valor hardcodeado | Reemplazo |
|---|---|
| `<title>Autenticacion Totalplay</title>` | Via JS |
| `Totalplay - Pago pendiente` (push banner) | `BRAND.name + ' - Pago pendiente'` |
| `$840.00` (4 lugares: banner, amount, boton, success) | `BRAND.formattedTotal()` |
| `totalplay.png` (4 imagenes) | `BRAND.logo` |
| `Totalplay Mexico - Internet y TV` (2 lugares) | `BRAND.fullName + ' - ' + BRAND.serviceType` |
| `Cuenta: 0102-8178-61` (3 lugares) | `BRAND.account.number` |
| `28 Febrero 2026` | `BRAND.account.dueDate` |
| `Totalplay Casa` (alias default, 2 lugares) | `BRAND.name + ' Casa'` |
| `pagos automaticos de Totalplay` (TyC) | `'pagos automaticos de ' + BRAND.name` |
| `servicio de Totalplay ha sido pagado` | `'servicio de ' + BRAND.name + ' ha sido pagado'` |
| `Totalplay - Gas Natural` en domiciliation old | `BRAND.name + ' - ' + BRAND.serviceType` (nota: "Gas Natural" ya fue cambiado a "Internet y TV" pero verificar) |

### 4d. `script.js`
Valores a reemplazar:

| Valor hardcodeado | Reemplazo |
|---|---|
| `service=totalplay` en deep links (multiples) | `'service=' + BRAND.deepLinkServiceParam` |
| `$840.00` (2 lugares) | `BRAND.formattedTotal()` |
| `Tu servicio de Totalplay se pagara` (2 lugares) | `'Tu servicio de ' + BRAND.name` |
| Colores `#DBE442` hardcodeados en SVG strings (6 lugares) | `BRAND.colors.primary` |

### 4e. `auth-mobile-script.js`
Valores a reemplazar:

| Valor hardcodeado | Reemplazo |
|---|---|
| `Totalplay Casa` (2 lugares en defaults) | `BRAND.name + ' Casa'` |
| `servicio de Totalplay ha sido pagado y domiciliado` (2 lugares) | Template string con `BRAND.name` |
| `Pagar $840.00` | `'Pagar ' + BRAND.formattedTotal()` |

### 4f. `qr.html` y `qr-script.js`
Valores a reemplazar:

| Valor hardcodeado | Reemplazo |
|---|---|
| `<title>Totalplay - Factura Digital</title>` | Via JS |
| `totalplay.png` en header | `BRAND.logo` |
| `Portal de Pago Totalplay` (qr-script.js) | `'Portal de Pago ' + BRAND.name` |
| `pago.totalplay.com.mx` en scan overlay | `BRAND.paymentDomain` |

### 4g. `menu.html`
Valores a reemplazar:

| Valor hardcodeado | Reemplazo |
|---|---|
| `<title>Totalplay - Flujos...</title>` | Via JS |
| `totalplay.png` en logo | `BRAND.logo` |
| `Totalplay` en h1 | `BRAND.name` |

### 4h. `index.html` (launcher)
Valores a reemplazar:

| Valor hardcodeado | Reemplazo |
|---|---|
| `<title>Totalplay - Demo Portal de Pagos</title>` | Via JS |
| `totalplay.png` en header | `BRAND.logo` |
| `Totalplay envia un link` en descripcion | `BRAND.name + ' envia un link'` |
| `factura digital de Totalplay` en descripcion | `'factura digital de ' + BRAND.name` |
| `portal de pagos Totalplay` en footer | `'portal de pagos ' + BRAND.name` |

---

## Paso 5: Agregar comentarios `BRAND:` markers

En cada punto donde quede un valor de marca que NO pueda ser centralizado (raro pero posible), agregar un comentario:

```html
<!-- BRAND: company logo -->
<!-- BRAND: service description -->
<!-- BRAND: payment amount display -->
```

```js
// BRAND: success message with company name
// BRAND: deep link service parameter
```

Tambien agregar markers al inicio de `brand-config.js` y `variables.css` explicando que son los archivos centrales de marca.

---

## Paso 6: Sincronizar colores entre JS y CSS

`brand-config.js` define los colores en JS, y `variables.css` los define en CSS. Para mantenerlos sincronizados, agregar en `brand-config.js` una funcion que actualice las CSS variables al cargar:

```js
// Sincronizar colores de JS a CSS custom properties
function applyBrandColors() {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', BRAND.colors.primary);
    root.style.setProperty('--primary-dark', BRAND.colors.primaryDark);
    root.style.setProperty('--primary-light', BRAND.colors.primaryLight);
    root.style.setProperty('--accent-color', BRAND.colors.accent);
    root.style.setProperty('--background', BRAND.colors.background);
    root.style.setProperty('--gradient-start', BRAND.colors.primary);
    root.style.setProperty('--gradient-end', BRAND.colors.accent);
    root.style.setProperty('--header-bg', BRAND.colors.headerBg);
    root.style.setProperty('--btn-text-color', BRAND.colors.btnText);
}

document.addEventListener('DOMContentLoaded', applyBrandColors);
```

Esto hace que `variables.css` sirva como fallback/valores por defecto, y `brand-config.js` siempre los sobreescriba, manteniendo una sola fuente de verdad en JS.

---

## Verificacion

Al terminar esta fase, ejecutar:

```bash
# No deberia quedar ningun "Totalplay" hardcodeado en JS (excepto config/brand-config.js)
grep -r "Totalplay" --include="*.js" . | grep -v config/brand-config.js | grep -v node_modules | grep -v tasks/

# No deberia quedar ningun monto hardcodeado (excepto config/brand-config.js)
grep -r "\$840" --include="*.js" . | grep -v config/brand-config.js
grep -r "\$840" --include="*.html" .

# No deberia quedar ningun :root en CSS individuales (solo en config/variables.css)
grep -r ":root" --include="*.css" . | grep -v config/variables.css

# Los colores hardcodeados en SVG inline deben usar BRAND.colors.primary
grep -r "#DBE442" --include="*.html" .
grep -r "#DBE442" --include="*.js" . | grep -v config/brand-config.js
```

Todos estos comandos deberian retornar 0 resultados (o minimos, bien marcados con `// BRAND:`).
