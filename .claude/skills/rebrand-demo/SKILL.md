---
name: rebrand-demo
description: Cambiar la marca de la demo de portal de pagos.
  Usar cuando el usuario pida cambiar de marca, rebrandear,
  o adaptar la demo para otra empresa.
---

# Skill: Rebrand Demo

## Contexto

El proyecto es una demo interactiva (100% visual mock) de portal de pagos
con domiciliacion bancaria. Toda la data de marca esta centralizada en
**dos archivos**:

1. `config/brand-config.js` — UNICA fuente de verdad (JS)
2. `config/variables.css` — CSS custom properties (sincronizado con el JS)

Al editar esos dos archivos + reemplazar el logo, toda la demo se actualiza
automaticamente: nombre, colores, montos, telefono, dominio, factura, etc.

**No hay que tocar ningun HTML ni otro JS.** Los HTML usan placeholders
genericos (`src=""`, `alt="Logo"`, `<title>` sin marca) y se populan
dinamicamente via `BRAND.*` al cargar.

## Arquitectura de branding

```
config/brand-config.js    <-- UNICA fuente de verdad (editar este)
        |
        |-- applyBrandColors()  → sincroniza colores a CSS custom properties
        |-- Cada pagina lee BRAND.* via JS al cargar (titulos, logos, textos, montos)
        |
config/variables.css      <-- CSS custom properties (sync manual con brand-config.js)
                               Define defaults para evitar flash antes de que JS cargue
```

### Paginas de la demo

| Pagina | Archivo | Descripcion |
|--------|---------|-------------|
| Builder | `index.html` | Selector de etapas para armar la demo |
| WhatsApp | `whatsapp.html` | Canal de llegada: chat de WhatsApp |
| QR Factura | `qr.html` | Canal de llegada: factura digital con QR |
| Checkout | `checkout.html` | Portal de pago estandar (multi-banco) |
| Checkout BBVA | `checkout-bbva.html` | Portal de pago directo BBVA |
| App bancaria | `auth-mobile.html` | Simulacion de app bancaria (Hey Banco, etc.) |
| Auth BBVA | `auth-bbva.html` | Simulacion de app BBVA |
| Mobile viewer | `mobile-viewer.html` | Wrapper con frame de iPhone |
| Nubank Impuestos | `nubank-impuestos.html` | Demo independiente (NO usa branding centralizado) |

## Procedimiento paso a paso

### Paso 1: Obtener datos de la nueva marca

Preguntar al usuario (o inventar datos coherentes si no los da):

| Dato | Ejemplo (Natura) |
|------|-----------------|
| Nombre corto | Natura |
| Nombre completo | Natura Mexico |
| Tipo de servicio | Cosmeticos y bienestar |
| Nombre de plan/producto | Suscripcion Mensual |
| Color principal (hex) | #F4A623 |
| Dominio | natura.com.mx |
| Dominio de pago | pago.natura.com.mx |
| Telefono | 800 123 4567 |
| Telefono amigable | 800 NATURA |
| WhatsApp | 55 1234 5678 |
| Numero de cuenta demo | 0045-9182-33 |
| Periodo de facturacion | 01 Mar - 31 Mar 2026 |
| Fecha de vencimiento | 15 de Marzo 2026 |
| Monto del plan | 650.00 |
| Descuento | -50.00 |
| Label del descuento | Descuento consultora |
| Saldo anterior | 0.00 |
| Total a pagar | 600.00 |
| Referencia de pago | 0045 0001 9182 3300 1 |

**Si el usuario solo da nombre y color**, inventar el resto con datos
coherentes para ese tipo de empresa. Derivar los colores secundarios
usando la guia de colores al final de este documento.

### Paso 2: Editar `config/brand-config.js`

Reemplazar TODOS los campos del objeto `BRAND` (lineas 6-51).
Aqui esta el template completo — copiar y adaptar:

```javascript
const BRAND = {
    // Identidad
    name: 'Natura',
    fullName: 'Natura Mexico',
    serviceType: 'Cosmeticos y bienestar',
    planName: 'Suscripcion Mensual',
    logo: 'assets/brand/natura.png',

    // Contacto y dominio
    domain: 'natura.com.mx',
    paymentDomain: 'pago.natura.com.mx',
    phone: '800 123 4567',
    phoneFriendly: '800 NATURA',
    whatsapp: '55 1234 5678',

    // Datos de cuenta/factura para la demo
    account: {
        number: '0045-9182-33',
        period: '01 Mar - 31 Mar 2026',
        dueDate: '15 de Marzo 2026',
        dueDateShort: '15 Mar 2026',
        planAmount: 650.00,
        discount: -50.00,
        discountLabel: 'Descuento consultora',
        previousBalance: 0.00,
        totalAmount: 600.00,
        reference: '0045 0001 9182 3300 1',
    },

    // Colores de la marca
    colors: {
        primary: '#F4A623',
        primaryDark: '#D18E1E',
        primaryLight: '#FFF8EC',
        accent: '#F7BD54',
        background: '#FFFCF5',
        headerBg: '#2A3444',
        btnText: '#1a1a2e',
    },

    // Factura PDF para la demo QR (path relativo al root)
    invoicePdf: 'assets/brand/factura-natura.pdf',

    // Deep link scheme (usado en simulacion de apps bancarias)
    deepLinkServiceParam: 'natura',
};
```

**IMPORTANTE:** No tocar nada debajo de `};` — los helpers (`formattedTotal`,
`applyBrandColors`, etc.) son genericos y no necesitan cambios.

### Paso 3: Actualizar `config/variables.css`

Actualizar SOLO el bloque de colores de marca y sombras en `:root`
para que coincidan con los nuevos colores. Esto evita un flash del
color anterior antes de que JS cargue.

**Campos a actualizar** (dejar intactos los colores generales y aliases
`tp-text-secondary`, `tp-border`, `tp-bg`):

```css
:root {
    /* Colores de marca */
    --primary-color: #F4A623;
    --primary-dark: #D18E1E;
    --primary-light: #FFF8EC;
    --secondary-color: #F4A623;
    --accent-color: #F7BD54;
    --background: #FFFCF5;
    --gradient-start: #F4A623;
    --gradient-end: #F7BD54;
    --header-bg: #2A3444;
    --btn-text-color: #1a1a2e;

    /* Aliases --tp-* */
    --tp-primary: #F4A623;
    --tp-dark: #2A3444;
    --tp-text: #1a1a2e;

    /* Sombras: convertir color primario a RGB para rgba() */
    --shadow-sm: 0 2px 8px rgba(244, 166, 35, 0.10);
    --shadow-md: 0 4px 12px rgba(244, 166, 35, 0.15);
    --shadow-lg: 0 8px 24px rgba(244, 166, 35, 0.18);
    --shadow-xl: 0 12px 32px rgba(244, 166, 35, 0.22);
}
```

**Tip para las sombras:** Convertir el color primario hex a componentes
RGB (ej: `#F4A623` → `244, 166, 35`) y usarlos en los rgba().

### Paso 4: Copiar logo

1. Guardar el logo en `assets/brand/` con el nombre definido en `BRAND.logo`
2. Formato: PNG con fondo transparente, ~200x60px recomendado
3. Si el usuario no proporciona logo, crear un placeholder o dejar el anterior

### Paso 5: (Opcional) Factura PDF

Si hay una factura PDF para la demo QR:
1. Copiarla a `assets/brand/` con el nombre definido en `BRAND.invoicePdf`
2. El QR se superpone automaticamente en la pagina 2 del PDF

Si no hay PDF:
- La demo QR mostrara un error de carga, pero el resto funciona

### Paso 6: Verificar

```bash
# Buscar restos del nombre de marca anterior en archivos de codigo
grep -rn "NombreAnterior" --include="*.html" --include="*.js" --include="*.css" . | grep -v '.git/' | grep -v 'tasks/' | grep -v '.claude/' | grep -v 'config/brand-config.js' | grep -v 'config/variables.css'

# Buscar color hex anterior fuera de los archivos de config
grep -rn "#ColorHexAnterior" --include="*.html" --include="*.js" --include="*.css" . | grep -v '.git/' | grep -v 'tasks/' | grep -v '.claude/' | grep -v 'config/brand-config.js' | grep -v 'config/variables.css'

# Ambos comandos deben retornar 0 resultados
```

### Paso 7: Probar

Abrir http://localhost:8000 y verificar:

1. **Builder** (`index.html`): logo y nombre en header
2. **WhatsApp** (`whatsapp.html`): nombre, monto, dominio, telefono en mensajes
3. **QR Factura** (`qr.html`): logo, periodo, colores del bloque QR
4. **Checkout** (`checkout.html`): monto, nombre de plan, colores de botones
5. **Checkout BBVA** (`checkout-bbva.html`): logo, monto, colores
6. **App bancaria** (`auth-mobile.html`): monto, nombre del servicio, alias, colores

## Que archivos se editan

| Archivo | Que cambiar |
|---------|-------------|
| `config/brand-config.js` | Todos los datos del objeto `BRAND` (nombre, colores, montos, contacto) |
| `config/variables.css` | CSS custom properties de colores y sombras en `:root` |
| `assets/brand/*.png` | Logo de la nueva marca |
| `assets/brand/*.pdf` | (Opcional) Factura PDF para demo QR |

## Que archivos NO hay que tocar

| Archivo | Por que |
|---------|---------|
| `config/demo-builder-config.js` | Solo estructura de etapas, no datos de marca |
| `config/banks-config.js` | Bancos son independientes de la marca |
| `index.html` | Lee todo de BRAND.* dinamicamente |
| `whatsapp.html` | Lee todo de BRAND.* dinamicamente |
| `qr.html` | Lee todo de BRAND.* dinamicamente |
| `checkout.html` | Lee todo de BRAND.* dinamicamente |
| `checkout-bbva.html` | Lee todo de BRAND.* dinamicamente |
| `auth-mobile.html` | Lee todo de BRAND.* dinamicamente |
| `auth-bbva.html` | Lee todo de BRAND.* dinamicamente |
| `mobile-viewer.html` | Wrapper iframe, sin datos de marca |
| `nubank-impuestos.html` | Demo independiente, no usa sistema de branding |
| `css/nubank-impuestos-styles.css` | Estilos propios de Nubank, no usa CSS variables de marca |
| `js/nubank-impuestos-script.js` | Logica propia de Nubank, no lee BRAND.* |
| Todos los demas `.css` | Usan CSS custom properties sincronizadas desde JS |
| Todos los demas `.js` en `js/` | Leen de BRAND.* o usan CSS variables |

## Guia de colores

Para elegir colores coherentes a partir de un solo color principal:

| Campo | Como derivarlo |
|-------|---------------|
| `primary` | El color principal de la marca |
| `primaryDark` | primary oscurecido ~15% |
| `primaryLight` | primary muy claro, casi blanco con tinte del color |
| `accent` | primary aclarado ~20%, para gradientes |
| `background` | Blanco con muy leve tinte del color primario |
| `headerBg` | Gris oscuro / azul oscuro (`#2A3444` funciona para cualquier marca) |
| `btnText` | Color del texto sobre botones — oscuro (`#1a1a2e`) si primary es claro, blanco (`#ffffff`) si primary es oscuro |

### Ejemplo: derivar desde un solo color

Si el usuario dice "el color es `#E91E63`" (rosa):

```javascript
colors: {
    primary: '#E91E63',      // el color dado
    primaryDark: '#C2185B',  // ~15% mas oscuro
    primaryLight: '#FDE8EF', // casi blanco con tinte rosa
    accent: '#F06292',       // ~20% mas claro
    background: '#FFF5F8',   // blanco con leve tinte rosa
    headerBg: '#2A3444',     // gris oscuro (universal)
    btnText: '#ffffff',      // blanco porque primary es oscuro
}
```

## Referencia rapida de campos BRAND

```
BRAND.name                    → Nombre corto (ej: "Natura")
BRAND.fullName                → Nombre completo (ej: "Natura Mexico")
BRAND.serviceType             → Tipo de servicio (ej: "Cosmeticos y bienestar")
BRAND.planName                → Plan o producto (ej: "Suscripcion Mensual")
BRAND.logo                    → Path al logo (ej: "assets/brand/natura.png")
BRAND.domain                  → Dominio web (ej: "natura.com.mx")
BRAND.paymentDomain           → Dominio de pago (ej: "pago.natura.com.mx")
BRAND.phone                   → Telefono (ej: "800 123 4567")
BRAND.phoneFriendly           → Telefono amigable (ej: "800 NATURA")
BRAND.whatsapp                → WhatsApp (ej: "55 1234 5678")
BRAND.account.number          → Numero de cuenta demo
BRAND.account.period          → Periodo de facturacion
BRAND.account.dueDate         → Fecha de vencimiento (formato largo)
BRAND.account.dueDateShort    → Fecha de vencimiento (formato corto)
BRAND.account.planAmount      → Monto del plan (numero)
BRAND.account.discount        → Descuento (numero negativo)
BRAND.account.discountLabel   → Etiqueta del descuento
BRAND.account.previousBalance → Saldo anterior
BRAND.account.totalAmount     → Total a pagar
BRAND.account.reference       → Referencia de pago
BRAND.colors.primary          → Color principal hex
BRAND.colors.primaryDark      → Color oscuro hex
BRAND.colors.primaryLight     → Color claro hex
BRAND.colors.accent           → Color acento hex
BRAND.colors.background       → Color de fondo hex
BRAND.colors.headerBg         → Color del header hex
BRAND.colors.btnText          → Color texto boton hex
BRAND.invoicePdf              → Path a factura PDF
BRAND.deepLinkServiceParam    → Parametro para deep links
BRAND.formattedTotal()        → "$1,500.00" (helper, no editar)
BRAND.formattedPlanAmount()   → "$1,550.00" (helper, no editar)
BRAND.formattedDiscount()     → "-$50.00" (helper, no editar)
BRAND.formattedPreviousBalance() → "$0.00" (helper, no editar)
```
