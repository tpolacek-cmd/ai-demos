# TASK-006: Agregar flujo Pago Directo BBVA (portal + app bancaria)

## Metadata

- **id**: TASK-006
- **title**: Portal de pago Pago Directo BBVA + mock app BBVA
- **status**: done
- **created**: 2026-03-18
- **linked_story**: FASE-6-demo-builder.md
- **type**: frontend
- **estimated_hours**: 16

## Objetivo

Agregar una segunda opcion de demo que combina un **portal de pago estilo Pago Directo**
(deuda + seleccion de metodo + boton "Continuar con BBVA") con un **mock de la app BBVA**
(push notification → Face ID → resumen de pago → comprobante → pagos recurrentes).

Esta combinacion se selecciona como un bloque en el builder (etapas 2+3 juntas).
El canal de llegada (etapa 1) sigue siendo intercambiable (WhatsApp o QR).

## Referencia

El codigo fuente de referencia esta en:
```
~/Documents/tapipayBBVA/tapipay-poc/tapi-cobranzas-ai-front/
```

Archivos clave del repo de referencia:
- Portal de deudas: `src/features/portal/debts/components/debt-card.tsx`
- Metodos de pago: `src/features/portal/payment-methods/components/payment-method-card.tsx`
- Footer de pago: `src/features/portal/payment-methods/components/payment-footer.tsx`
- BBVA fake app: `src/features/portal/payment-methods/components/bbva-fake-app/`
- Tema CSS BBVA: `src/features/portal/payment-methods/components/bbva-fake-app/bbva-fake-theme.css`
- Assets: `public/mockups/bbva/mobile/` (imagenes, faceid.webm, faceid.gif)
- Logos BBVA: `public/tenants/bbva/bbva-logo-white.svg`, `bbva-logo.svg`

## Arquitectura

### Como encaja en el builder

El builder tiene 3 etapas: arrival, checkout, payment. Hoy la unica combinacion es:
`arrival → Portal Estandar → Hey Banco`

La nueva combinacion sera:
`arrival → Pago Directo BBVA → App BBVA`

Donde "Pago Directo BBVA" es una opcion de la etapa `checkout` que **fuerza** el
flujo de pago a ser la app BBVA. No tiene sentido elegir "Pago Directo BBVA" como
checkout y "Hey Banco" como payment — van siempre juntos.

### Modelado en demo-builder-config.js

Opcion A (recomendada): **Opcion de checkout con payment implicito**

Agregar en `DEMO_STAGES[1].options`:
```javascript
{
    id: 'pago-directo-bbva',
    name: 'Pago Directo BBVA',
    description: 'Portal de deudas con Pago Directo BBVA',
    page: 'checkout-bbva.html',
    flow: 'bbva-direct',           // flow especial para este checkout
    icon: '<svg>...</svg>',
    // El payment esta implicito — este checkout siempre lleva a auth-bbva.html
    forcedPayment: 'bbva',         // campo nuevo: indica que el payment no es seleccionable
}
```

Agregar en `DEMO_STAGES[2].options`:
```javascript
{
    id: 'bbva',
    name: 'BBVA',
    description: 'Pago Directo via app BBVA',
    bank: 'bbva',
    action: 'pay-domiciliar',
    icon: '<svg>...</svg>',
}
```

El builder debe:
- Cuando se selecciona "Pago Directo BBVA" en checkout, auto-seleccionar "BBVA" en payment
  y deshabilitar la seleccion manual de payment (mostrar "vinculado al portal seleccionado")
- Cuando se selecciona "Portal Estandar" en checkout, restaurar la seleccion libre de payment

### Modificacion en demo-router.js

`getNextPageUrl('checkout')` necesita un caso especial: si el checkout es `pago-directo-bbva`,
redirigir a `auth-bbva.html` en vez de `auth-mobile.html`. Puede leer el campo `forcedPayment`
de la opcion de checkout para saber esto.

Alternativa: el checkout-bbva.html puede hacer el redirect directo a auth-bbva.html
sin pasar por demo-router, ya que el flujo siempre es el mismo.

## Paginas nuevas a crear

### 1. `checkout-bbva.html` — Portal de deudas + seleccion de metodo de pago

Mockea las 2 pantallas del portal de pago del repo de referencia como una sola pagina
con transiciones:

**Pantalla 1: Deuda pendiente**
- Header con logo de marca (BRAND) + "Portal de Pagos" sobre fondo azul BBVA (#004481)
- Tabs: "Pendientes" (activo) | "Pagos" | "Domiciliacion"
- Card de deuda expandible:
  - Monto: BRAND.formattedTotal()
  - Concepto: BRAND.serviceType + " - " + BRAND.planName
  - Vencimiento: BRAND.account.dueDateShort
  - Estado: "Pendiente"
- Footer sticky: "Proximo pago" + monto + boton "Pagar"

**Pantalla 2: Metodos de pago** (transiciona al clickear "Pagar")
- Header: flecha back + "Metodos de pago"
- Resumen de deuda (card gris con monto, concepto, fecha)
- "Como deseas pagar?" + "Selecciona el metodo que prefieras"
- Cards de metodos de pago:
  1. **Pago Directo BBVA** (icono celular, "Desde tu app BBVA") — pre-seleccionado
  2. Pago Automatico Bancario (icono banco, "Santander, Nu, Banamex y mas")
  3. Pago con tarjeta (icono tarjeta, "Debito o credito")
  4. Pago digital (icono wallet, "Nubank, Stori, y mas")
  5. Transferencia (icono banco, "SPEI interbancaria")
  6. Efectivo (icono billete, "7Eleven, Farmacias, y mas")
- Footer sticky: info banner + "Total a pagar" + monto + boton "Continuar con BBVA →"

Al clickear "Continuar con BBVA": redirige a auth-bbva.html

**Datos que lee de BRAND:**
- name, serviceType, planName, account.totalAmount, account.dueDateShort, account.period
- colors (para el header si queremos que sea brand-colored, o fijo BBVA blue)
- logo

**Datos hardcodeados (propios del mock BBVA):**
- Color header: #004481 (BBVA blue) — NO usa BRAND.colors
- Los demas metodos de pago (son decorativos, no clickeables)

**Modo embedded:** soportar `?embedded=1` para mobile-viewer

### 2. `auth-bbva.html` — Mock de la app BBVA

Mockea el flujo completo de la app BBVA del repo de referencia. Es una pagina
fullscreen que muestra diferentes pantallas secuencialmente:

**Step 0: iPhone Home con Push Notification**
- Wallpaper oscuro con gradientes
- Status bar iOS (9:41, signal, wifi, battery)
- Reloj grande "9:41" + "Martes, 10 de marzo"
- Push notification que se desliza desde arriba (animacion bounce 600ms):
  - Icono BBVA (rect azul #004A97 con "BBVA" blanco)
  - "BBVA Mexico" + "ahora"
  - "Continua tu pago en BBVA"
  - "Tienes un pago pendiente. Toca para completarlo desde la app."
  - Efecto glass-morphism (backdrop-filter blur)
- Grid de apps (12 emojis + icono BBVA)
- Dock inferior
- Click en notificacion → Step 1

**Step 1: Splash BBVA (3s autoplay)**
- Imagen: `assets/bbva/step-06-app-launch-screen.png`
- Fondo azul #001492
- Auto-avanza a Step 2

**Step 2: Home de la app BBVA**
- Imagen: `assets/bbva/step-07-app-home-screen.png`
- Hotspot invisible sobre "Iniciar sesion" (top: 48%, left: 9%, width: 82%, height: 4.5%)
- Click en hotspot → Step 3

**Step 3: Face ID**
- Imagen de fondo de Step 2
- Overlay con video `assets/bbva/faceid.webm` (fallback: `faceid.gif`)
- Fade in 500ms → hold 3s → fade out 500ms
- Auto-avanza a Step 4

**Step 4: Loading/Validando (5s)**
- Gradient azul: linear-gradient(180deg, #0829b8, #0f22a9)
- Spinner blanco girando (64px)
- Barra inferior glass: "Validando credenciales..."
- Auto-avanza a Step 5

**Step 5: Resumen de pago + Confirmar**
- Seccion superior azul oscuro (#012b63):
  - "Pagar con Pago Directo" + X
  - Informacion del pago:
    - Comercio: BRAND.name
    - Importe: BRAND.formattedTotal()
    - Numero de convenio: BRAND.account.reference
    - Referencia: (generar alfanumerico random de 20 chars)
  - Origen: "Cuenta debito" → "$3,500.00" → triangulo + "1234"
  - Concepto: "Pago Directo BBVA"
  - Checkbox: "Activar pago recurrente y domiciliado" (teal #108f90)
- Seccion inferior gris (#f2f2f2):
  - "Importe a pagar" + BRAND.formattedTotal() (38px)
  - "Comision: $0.00"
  - Boton "Confirmar" (teal #108f90)
- Click "Confirmar" → Step 6

**Step 6: Comprobante de pago**
- Fondo blanco
- "Pagar con Pago Directo" + X
- Circulo verde con checkmark (gradient #2ecc71 → #27ae60)
- "Pago exitoso"
- "Importe pagado" + BRAND.formattedTotal()
- Detalle:
  - Fecha y hora: (fecha actual formateada)
  - Folio: (numero random 10 digitos)
  - Comercio: BRAND.name
  - Numero de convenio: BRAND.account.reference
  - Referencia: (misma del step 5)
  - Origen: "Cuenta debito 1234"
  - Tipo de operacion: "Pago convenio CIE"
  - Guia CIE: (random 12 digitos)
  - Comision: "$0.00"
  - Concepto: "Pago Directo BBVA"
- Click anywhere → Step 7

**Step 7: Pagos recurrentes (dashboard)**
- Fondo gris claro #f2f5f9
- Header: back + "Pagos recurrentes" (azul #0829b8)
- "Administra tus servicios y pagos"
- Stats: Total $X | Automaticos 3 | Pendientes 0
- CTA: "Agregar Servicio"
- 3 tarjetas de servicios:
  1. BRAND.name - BRAND.serviceType - "Pagado hoy" - BRAND.formattedTotal() - tags: "Al dia" + "Debito auto"
  2. Telmex - Internet y Telefono - "Vence en 12 dias" - $1,899.00
  3. Totalplay - Internet y TV - "Vence en 5 dias" - $1,199.00
- Click en icono editar de cualquier servicio → Step 8

**Step 8: Editar domiciliacion**
- Header azul: back + "Editar domiciliacion"
- Toggle "Adhesion Activa" ON
- Info del servicio (segun cual se eligio)
- Alias editable
- "Cobro mensual automatico" chip
- "Cuando cobrar?" — 3 opciones: "Al recibir" | "Al vencer" | "Dia fijo"
- Toggles: Monto maximo, Fecha limite, Confirmar pago
- Boton "Actualizar domiciliacion"
- Click back → Step 7

**Modo embedded:** soportar `?embedded=1` para mobile-viewer
**Modo desktop:** abrir en mobile-viewer automaticamente (como auth-mobile.html)

### 3. Assets a copiar

Copiar desde `~/Documents/tapipayBBVA/tapipay-poc/tapi-cobranzas-ai-front/public/` a `assets/bbva/`:

```
assets/bbva/
├── step-06-app-launch-screen.png
├── step-07-app-home-screen.png
├── faceid.webm
├── faceid.gif
├── bbva-logo.svg
└── bbva-logo-white.svg
```

## Archivos a crear

| Archivo | Descripcion |
|---------|-------------|
| `checkout-bbva.html` | Portal de deudas + seleccion metodo de pago |
| `css/checkout-bbva-styles.css` | Estilos del portal BBVA |
| `auth-bbva.html` | Mock completo de la app BBVA (8 steps) |
| `css/auth-bbva-styles.css` | Estilos del mock BBVA (basado en bbva-fake-theme.css) |
| `js/auth-bbva-script.js` | Logica de navegacion entre steps del mock BBVA |
| `assets/bbva/` | Directorio con imagenes y videos del mock |

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `config/demo-builder-config.js` | Agregar opciones "Pago Directo BBVA" (checkout) y "BBVA" (payment) |
| `js/demo-router.js` | Manejar `forcedPayment` para que checkout BBVA lleve siempre a auth-bbva |
| `index.html` | Logica de vinculacion checkout↔payment cuando uno fuerza al otro |
| `css/index-styles.css` | Estilos para estado "vinculado" de opcion de payment |

## Diseño detallado de las modificaciones

### demo-builder-config.js

Agregar a `DEMO_STAGES[1].options` (checkout):
```javascript
{
    id: 'pago-directo-bbva',
    name: 'Pago Directo BBVA',
    description: 'Portal de deudas con Pago Directo BBVA',
    page: 'checkout-bbva.html',
    flow: 'bbva-direct',
    forcedPayment: 'bbva',
    icon: '<svg>...</svg>',  // icono de celular con escudo
}
```

Agregar a `DEMO_STAGES[2].options` (payment):
```javascript
{
    id: 'bbva',
    name: 'BBVA',
    description: 'Pago Directo via app BBVA',
    bank: 'bbva',
    action: 'pay-domiciliar',
    icon: '<svg>...</svg>',  // logo BBVA simplificado
}
```

### demo-router.js

Modificar `getNextPageUrl('checkout')` para que, si el checkout tiene `forcedPayment`,
use esa opcion de payment en vez de la que eligio el usuario:

```javascript
if (currentStage === 'checkout') {
    var checkoutOption = getOptionById('checkout', config.checkout);
    // Si el checkout fuerza un payment especifico, usarlo
    var paymentId = (checkoutOption && checkoutOption.forcedPayment) || config.payment;
    var paymentOption = getOptionById('payment', paymentId);
    // ... construir URL con paymentOption.bank, paymentOption.action
}
```

Tambien necesita distinguir auth-bbva.html de auth-mobile.html segun el banco.
Opcion: agregar campo `authPage` en la opcion de payment:
```javascript
{ id: 'bbva', ..., authPage: 'auth-bbva.html' }
{ id: 'hey-banco', ..., authPage: 'auth-mobile.html' }  // agregar campo a la opcion existente
```

Si no tiene `authPage`, fallback a `auth-mobile.html`.

### index.html — Logica de vinculacion

Cuando el usuario selecciona un checkout con `forcedPayment`:
1. Auto-seleccionar la opcion de payment correspondiente
2. Deshabilitar el radio de payment (no permite cambiar)
3. Mostrar un badge "Vinculado al portal" en la opcion de payment
4. Actualizar el summary

Cuando cambia a un checkout SIN `forcedPayment`:
1. Restaurar la seleccion libre de payment
2. Quitar el badge

## Orden de implementacion

1. **Copiar assets** — copiar imagenes y videos del mock BBVA
2. **auth-bbva.html + CSS + JS** — crear el mock de la app BBVA (independiente)
3. **checkout-bbva.html + CSS** — crear el portal de deudas
4. **demo-builder-config.js** — agregar las 2 opciones nuevas
5. **demo-router.js** — manejar forcedPayment y authPage
6. **index.html + CSS** — logica de vinculacion checkout↔payment

## Definition of Done

- [ ] Assets copiados en `assets/bbva/`
- [ ] `auth-bbva.html` funciona standalone: 8 steps con animaciones
- [ ] `checkout-bbva.html` funciona: deuda → metodos → "Continuar con BBVA" → redirect
- [ ] Builder muestra "Pago Directo BBVA" como opcion de checkout
- [ ] Builder muestra "BBVA" como opcion de payment
- [ ] Seleccionar "Pago Directo BBVA" auto-selecciona "BBVA" y lo bloquea
- [ ] Seleccionar "Portal Estandar" restaura seleccion libre de payment
- [ ] Flujo completo: arrival → checkout-bbva → auth-bbva funciona end-to-end
- [ ] Modo mobile (embedded=1) funciona correctamente
- [ ] Brand data se lee de BRAND.* en todas las pantallas del portal
- [ ] Los datos propios de BBVA (colores, textos de la app) estan hardcodeados en el mock
- [ ] Ambos flujos existentes (Portal Estandar + Hey Banco) siguen funcionando

## Notas

- Los colores del header del checkout-bbva y toda la app BBVA son fijos (#004481, etc.),
  NO usan BRAND.colors. Esto es intencional: representan la marca BBVA, no la del cliente.
- Los datos que SI son de marca (monto, servicio, nombre, referencia) se leen de BRAND.*.
- Los steps del mock BBVA usan imagenes PNG reales para los steps 1 y 2 (splash y home).
  Los demas steps (0, 3-8) son HTML/CSS recreados para poder inyectar datos de BRAND.
- El video de Face ID (faceid.webm) es generico y no tiene datos de marca.
- `checkout-bbva.html` carga `brand-config.js`, `demo-builder-config.js` y `demo-router.js`.
  Al final del flujo usa `getNextPageUrl('checkout')` para redirigir a auth-bbva.
- `auth-bbva.html` NO necesita el router — es el ultimo paso del flujo.
  Lee `bank` y `action` de URL params igual que `auth-mobile.html`.
