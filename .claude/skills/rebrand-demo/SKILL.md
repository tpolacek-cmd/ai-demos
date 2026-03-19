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
**un unico archivo**: `config/brand-config.js`.

Al editar ese archivo + reemplazar el logo, toda la demo se actualiza
automaticamente: nombre, colores, montos, telefono, dominio, factura, etc.

No hay que tocar ningun HTML, CSS ni otro JS.

## Arquitectura de branding

```
config/brand-config.js    <-- UNICA fuente de verdad (editar este)
        |
        |-- applyBrandColors() sincroniza colores a CSS custom properties
        |-- Cada pagina lee BRAND.* via JS al cargar
        |
config/variables.css      <-- Valores iniciales CSS (opcional, JS los overridea)
```

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
| Color oscuro (hex) | #D18E1E |
| Color claro (hex) | #FFF8EC |
| Color acento (hex) | #F7BD54 |
| Color de fondo (hex) | #FFFCF5 |
| Color header (hex) | #2A3444 |
| Color texto boton (hex) | #1a1a2e |
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

Si el usuario proporciona solo nombre y color, inventar el resto con
datos coherentes para ese tipo de empresa.

### Paso 2: Editar `config/brand-config.js`

Reemplazar TODOS los campos del objeto `BRAND`. Aqui esta el template
completo — copiar y adaptar:

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

IMPORTANTE: No tocar nada debajo de `};` — los helpers (`formattedTotal`,
`applyBrandColors`, etc.) son genericos y no necesitan cambios.

### Paso 3: Actualizar `config/variables.css`

Actualizar los valores iniciales de las CSS custom properties para que
coincidan con los nuevos colores. Esto es para evitar un flash del color
anterior antes de que JS cargue.

Campos a actualizar en el bloque `:root`:

```css
:root {
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

    --tp-primary: #F4A623;
    --tp-dark: #2A3444;
    --tp-text: #1a1a2e;

    /* Sombras: reemplazar rgb con el del nuevo color primario */
    --shadow-sm: 0 2px 8px rgba(244, 166, 35, 0.10);
    --shadow-md: 0 4px 12px rgba(244, 166, 35, 0.15);
    --shadow-lg: 0 8px 24px rgba(244, 166, 35, 0.18);
    --shadow-xl: 0 12px 32px rgba(244, 166, 35, 0.22);
}
```

No tocar los colores generales (--text-primary, --border-color, etc.)
ni los aliases tp-text-secondary, tp-border, tp-bg.

NOTA: `applyBrandColors()` en brand-config.js sobreescribe todos estos
valores al cargar, incluyendo las sombras. Variables.css solo define
los defaults para el primer render.

### Paso 4: Copiar logo

1. Guardar el logo en `assets/brand/` con el nombre definido en `BRAND.logo`
2. Formato: PNG con fondo transparente, ~200x60px recomendado
3. Si el usuario no proporciona logo, crear un placeholder o dejar el anterior

### Paso 5: (Opcional) Factura PDF

Si hay una factura PDF para la demo QR:
1. Copiarla a `assets/brand/` con el nombre definido en `BRAND.invoicePdf`
2. El QR se superpone automaticamente en la pagina 2 del PDF

Si no hay PDF:
- La demo QR mostrara un error de carga, pero el resto de las demos funciona

### Paso 6: Verificar

```bash
# Buscar restos del nombre de marca anterior
grep -r "NombreMarcaAnterior" --include="*.{html,js,css}" . | grep -v tasks/ | grep -v config/brand-config.js

# Buscar color hex anterior (sin var() wrapper)
grep -rn "ColorHexAnterior" --include="*.{html,js,css}" css/ js/ | grep -v 'var('

# Ambos comandos deben retornar 0 resultados
```

### Paso 7: Probar

Abrir http://localhost:8000 y verificar:

1. **Builder** (index.html): muestra nuevo nombre y logo en el header
2. **WhatsApp**: mensajes muestran nuevo nombre, monto, dominio, telefono
3. **QR Factura**: header muestra logo, periodo correcto, colores del QR block
4. **Checkout**: monto, nombre de plan, colores de botones y checkboxes
5. **App bancaria**: monto a pagar, nombre del servicio, colores correctos

## Que archivos NO hay que tocar

| Archivo | Por que |
|---------|---------|
| `config/demo-builder-config.js` | Solo estructura de etapas, no datos de marca |
| `config/banks-config.js` | Bancos son independientes de la marca |
| `index.html` | Lee todo de BRAND.* dinamicamente |
| `whatsapp.html` | Lee todo de BRAND.* dinamicamente |
| `qr.html` | Lee todo de BRAND.* dinamicamente |
| `checkout.html` | Lee todo de BRAND.* via data-brand attributes |
| `auth-mobile.html` | Lee todo de BRAND.* dinamicamente |
| Todos los `.css` | Usan CSS custom properties que se sincronizan desde JS |
| Todos los `.js` en `js/` | Leen de BRAND.* o usan CSS variables |

## Guia de colores

Para elegir colores coherentes a partir de un color principal:

| Campo | Como derivarlo |
|-------|---------------|
| `primary` | El color principal de la marca |
| `primaryDark` | primary oscurecido ~15% |
| `primaryLight` | primary muy claro, casi blanco con tinte del color |
| `accent` | primary aclarado ~20%, para gradientes |
| `background` | Blanco con muy leve tinte del color primario |
| `headerBg` | Gris oscuro / azul oscuro (generalmente #2A3444 funciona para cualquier marca) |
| `btnText` | Color del texto sobre botones primarios (oscuro si el primary es claro, blanco si es oscuro) |
