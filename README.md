# Demo Portal de Pagos

Repositorio base para demos interactivas de portal de pagos con domiciliacion bancaria.
Actualmente brandeado para **Totalplay Mexico**.

## Demos disponibles

- **WhatsApp** (`whatsapp.html`): Simulacion de chat de WhatsApp con link de pago
- **QR Factura** (`qr.html`): Visualizador de factura PDF con QR integrado

Ambas demos desembocan en el checkout compartido (`checkout.html`) y luego en la simulacion de app bancaria (`auth-mobile.html`).

## Como usar

1. Iniciar servidor local:
   ```bash
   python3 -m http.server 8000
   ```

2. Abrir http://localhost:8000

3. Seleccionar una demo desde el launcher

Para testing movil en la misma red WiFi:
```bash
python3 -m http.server 8000 --bind 0.0.0.0
# Abrir http://TU_IP:8000 desde el celular
```

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
   # No deberia retornar resultados
   ```

## Estructura del proyecto

```
demo-portal-pagos/
├── index.html                      # Launcher de demos
├── whatsapp.html                   # Demo WhatsApp
├── qr.html                         # Demo QR Factura
├── checkout.html                   # Checkout compartido (7 modales)
├── auth-mobile.html                # Simulacion app movil (9 pantallas)
│
├── config/                         # Configuraciones centrales
│   ├── brand-config.js             # UNICA fuente de verdad para datos de marca
│   ├── banks-config.js             # Config unificada de bancos (nombre, logo, color)
│   └── variables.css               # CSS custom properties (sincronizado con brand-config.js)
│
├── js/                             # Scripts modulares
│   ├── checkout-core.js            # Seleccion de metodo de pago y banco
│   ├── identity-validation.js      # Validacion CURP/RFC/CLABE
│   ├── qr-checkout-flow.js         # Flujo QR dentro del checkout
│   ├── push-flow.js                # Flujo push notification
│   ├── account-to-account.js       # Flujo A2A (account to account)
│   ├── phone-mockup.js             # Simulacion phone en desktop
│   ├── qr-script.js                # QR factura viewer
│   └── auth-mobile-script.js       # Mobile auth logic
│
├── css/                            # Estilos
│   ├── styles.css                  # Checkout principal
│   ├── whatsapp-styles.css         # Estilos WhatsApp demo
│   ├── index-styles.css            # Estilos launcher
│   ├── auth-mobile-styles.css      # Estilos simulacion app bancaria
│   └── qr-styles.css               # Estilos QR viewer
│
├── assets/                         # Recursos estaticos
│   ├── brand/                      # Logo y factura de la marca actual
│   │   ├── totalplay.png
│   │   └── factura-totalplay.pdf
│   └── banks/                      # Logos de bancos
│       ├── Hey_Banco.svg
│       ├── santa.png
│       ├── banamex.svg
│       ├── hsbc.jpg
│       ├── stori.png
│       ├── nu.jpeg
│       └── tapi-Isologotipo blanco.png
│
├── tasks/                          # Documentacion de fases de reestructuracion
├── .claude/                        # Config Claude Code
└── README.md
```

## Como agregar una nueva demo (canal de entrada)

1. Crear el HTML de la nueva demo (ej: `sms.html`) en el root
2. Agregar `<script src="config/brand-config.js"></script>` al inicio del `<body>`
3. Linkar estilos desde `css/` y `config/variables.css`
4. Usar `BRAND.*` para todos los valores de marca (nombre, colores, montos, etc.)
5. Al final del flujo, redirigir a `checkout.html` con los params necesarios
6. Agregar la tarjeta de la nueva demo en `index.html` (launcher)

## Arquitectura

### Archivos de configuracion (`config/`)

| Archivo | Proposito |
|---------|-----------|
| `config/brand-config.js` | Toda la data de marca: nombre, colores, montos, telefono, dominio, etc. |
| `config/banks-config.js` | Bancos disponibles: nombre, logo, color, tipo de validacion |
| `config/variables.css` | CSS custom properties sincronizadas con brand-config.js |

### Assets (`assets/`)

| Directorio | Contenido |
|------------|-----------|
| `assets/brand/` | Logo y factura de la marca actual |
| `assets/banks/` | Logos de todos los bancos disponibles |

### Flujo de datos

```
Launcher (index.html) -> Demo channel (whatsapp/qr/...) -> checkout.html -> auth-mobile.html
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

- HTML5, CSS3 (custom properties, color-mix, grid/flexbox), JavaScript vanilla
- Sin dependencias externas - funciona sin conexion a internet
- PDF.js para el viewer de factura QR

---

**Nota**: Este es un mock para presentaciones. No procesa pagos reales.
