# Demo Portal de Pagos

Repositorio de demos interactivas (100% visual mock) de portal de pagos con domiciliacion bancaria.
Actualmente brandeado para **Totalplay Mexico**.

## Como funciona

Las demos se construyen por **bloques** seleccionando una opcion para cada etapa del flujo:

| Etapa | Nombre | Opciones actuales |
|-------|--------|-------------------|
| 1 | Canal de llegada | WhatsApp, QR en Factura |
| 2 | Portal de pago | Portal Estandar |
| 3 | Flujo de pago | Hey Banco |

El `index.html` es un **builder visual de 3 columnas** donde se selecciona una opcion por etapa y se lanza la demo combinada con el boton "Iniciar Demo".

```
index.html (builder) -> canal de llegada -> checkout -> app bancaria
                         whatsapp.html      checkout.html   auth-mobile.html
                         qr.html
```

La navegacion entre bloques es dinamica: cada pagina lee la configuracion del builder desde `sessionStorage` y usa `js/demo-router.js` para saber a donde redirigir.

## Como usar

1. Iniciar servidor local:
   ```bash
   python3 -m http.server 8000
   ```

2. Abrir http://localhost:8000

3. Seleccionar una opcion por cada etapa en el builder y clickear "Iniciar Demo"

Para testing movil en la misma red WiFi:
```bash
python3 -m http.server 8000 --bind 0.0.0.0
# Abrir http://TU_IP:8000 desde el celular
```

## Como agregar opciones al builder

### Nuevo canal de llegada (ej: SMS)

1. Crear `sms.html` con el flujo visual
2. Agregar scripts en el `<head>`: `brand-config.js`, `demo-builder-config.js`, `demo-router.js`
3. Al final del flujo, redirigir con `window.location.href = getNextPageUrl('arrival')`
4. Agregar entrada en `DEMO_STAGES[0].options` de `config/demo-builder-config.js`
5. Listo — el builder lo muestra automaticamente

### Nuevo portal de pago (ej: checkout simplificado)

1. Crear `checkout-simple.html`
2. Agregar los mismos scripts + `banks-config.js`
3. Al final, redirigir con `getNextPageUrl('checkout')`
4. Agregar entrada en `DEMO_STAGES[1].options` de `config/demo-builder-config.js`

### Nuevo banco en flujo de pago (ej: Santander)

1. Agregar entrada en `DEMO_STAGES[2].options` de `config/demo-builder-config.js`:
   ```js
   { id: 'santander', name: 'Santander', description: '...', bank: 'santander', action: 'pay-domiciliar', icon: '...' }
   ```
2. El campo `bank` debe coincidir con una key de `BANKS` en `config/banks-config.js`
3. `auth-mobile.html` ya soporta multiples bancos via URL params — no requiere cambios

## Como cambiar de marca

Para rebrandear la demo (ej: de Totalplay a Telmex):

1. **Editar `config/brand-config.js`:**
   - Cambiar `name`, `fullName`, `serviceType`, `planName`
   - Actualizar `account` (numero, periodo, montos)
   - Actualizar `colors` (primary, primaryDark, primaryLight, accent, background, btnText)
   - Actualizar `domain`, `paymentDomain`, `phone`, `phoneFriendly`

2. **Actualizar `config/variables.css`:**
   - Sincronizar los colores CSS con los definidos en `brand-config.js`
   - Actualizar las sombras `rgba()` con el nuevo color primario

3. **Reemplazar el logo:**
   - Guardar el nuevo logo en `assets/brand/` con el nombre definido en `BRAND.logo`
   - Tamanio recomendado: 200x60px, fondo transparente (PNG)

4. **(Opcional) Reemplazar la factura PDF:**
   - Guardar como `assets/brand/factura-[marca].pdf`
   - Actualizar referencia en `js/qr-script.js` linea 4 (`const PDF_URL`)

5. **Verificar que no queden restos de la marca anterior:**
   ```bash
   grep -r "NombreMarcaAnterior" --include="*.{html,js,css}" . | grep -v tasks/ | grep -v config/brand-config.js
   ```

## Estructura del proyecto

```
tapi-demos-hub/
├── index.html                      # Demo builder (3 columnas: arrival, checkout, payment)
├── whatsapp.html                   # Demo WhatsApp (canal de llegada)
├── qr.html                        # Demo QR Factura (canal de llegada)
├── checkout.html                   # Checkout compartido (portal de pago)
├── auth-mobile.html                # Simulacion app movil (flujo de pago)
├── mobile-viewer.html              # Wrapper iPhone frame para vista mobile
│
├── config/                         # Configuraciones centrales
│   ├── brand-config.js             # UNICA fuente de verdad para datos de marca
│   ├── banks-config.js             # Config unificada de bancos (9 bancos)
│   ├── demo-builder-config.js      # Etapas y opciones del demo builder
│   └── variables.css               # CSS custom properties (sync con brand-config.js)
│
├── js/                             # Scripts
│   ├── demo-router.js              # Routing centralizado entre bloques del builder
│   ├── checkout-core.js            # Seleccion de metodo de pago y banco
│   ├── identity-validation.js      # Validacion CURP/RFC/CLABE
│   ├── qr-checkout-flow.js         # Flujo QR dentro del checkout
│   ├── push-flow.js                # Flujo push notification
│   ├── account-to-account.js       # Flujo A2A (account to account)
│   ├── phone-mockup.js             # Simulacion phone en desktop
│   ├── qr-script.js                # QR factura viewer
│   ├── auth-mobile-script.js       # Mobile auth logic
│   └── mobile-viewer.js            # iPhone frame controller
│
├── css/                            # Estilos
│   ├── styles.css                  # Checkout principal
│   ├── index-styles.css            # Estilos del builder
│   ├── whatsapp-styles.css         # Estilos WhatsApp demo
│   ├── auth-mobile-styles.css      # Estilos simulacion app bancaria
│   ├── qr-styles.css               # Estilos QR viewer
│   └── mobile-viewer-styles.css    # Estilos iPhone frame
│
├── assets/
│   ├── brand/                      # Logo y factura de la marca actual
│   └── banks/                      # Logos de bancos
│
├── tasks/                          # Documentacion de fases de reestructuracion
├── .claude/                        # Config Claude Code + skills
└── README.md
```

## Arquitectura

### Archivos de configuracion (`config/`)

| Archivo | Proposito |
|---------|-----------|
| `brand-config.js` | Toda la data de marca: nombre, colores, montos, telefono, dominio |
| `banks-config.js` | Bancos disponibles: nombre, logo, color, tipo de validacion |
| `demo-builder-config.js` | Etapas del builder y opciones disponibles por etapa |
| `variables.css` | CSS custom properties sincronizadas con brand-config.js |

### Routing entre bloques (`js/demo-router.js`)

| Funcion | Proposito |
|---------|-----------|
| `getDemoConfig()` | Lee la config del builder desde sessionStorage |
| `saveDemoConfig(config)` | Guarda la config (usado por index.html) |
| `getNextPageUrl(stage)` | Retorna la URL del siguiente bloque segun la etapa actual |
| `getDemoStartUrl(viewMode)` | Retorna la URL de inicio para desktop o mobile |

### Flujo de datos

```
sessionStorage('demoConfig')
       |
index.html (builder)
       |  saveDemoConfig({ arrival, checkout, payment })
       v
[Canal de llegada]  --getNextPageUrl('arrival')-->  [Portal de pago]  --checkout interno-->  [App bancaria]
  whatsapp.html                                       checkout.html                           auth-mobile.html
  qr.html
```

### Modulos del checkout (`js/`)

| Modulo | Responsabilidad |
|--------|----------------|
| `checkout-core.js` | Seleccion de metodo de pago y banco |
| `identity-validation.js` | Validacion CURP/RFC/CLABE segun banco |
| `qr-checkout-flow.js` | Flujo QR dentro del checkout |
| `push-flow.js` | Flujo de push notification |
| `account-to-account.js` | Flujo A2A (transferencia entre cuentas) |
| `phone-mockup.js` | Simulacion de phone en desktop |

## Tecnologias

- HTML5, CSS3 (custom properties, color-mix, grid/flexbox), JavaScript vanilla (ES6)
- Zero-build: no requiere npm, bundler ni framework
- PDF.js (CDN) para el viewer de factura QR

---

**Nota**: Este es un mock 100% visual para presentaciones. No procesa pagos reales.
