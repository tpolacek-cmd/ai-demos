# Demo Hub — Portal de Pagos

Demo interactiva (100% visual mock, sin backend) de portales de pago con domiciliacion bancaria.
Vanilla HTML/CSS/JS, sin dependencias. Solo servir archivos por HTTP.

## Quick Start

```bash
python3 -m http.server 8080
# Abrir http://localhost:8080
```

## Que puedo pedirle a Claude

### Cambiar la marca (rebrand)
Decir: `/rebrand-demo` o "cambia la marca a [Empresa X]" con nombre y color.
Claude actualiza `config/brand-config.js` + `config/variables.css` + logo y toda la demo se adapta automaticamente.
Solo necesitas: nombre de la empresa, color principal (hex), y opcionalmente un logo PNG en `assets/brand/`.

Ejemplos:
- "Cambia la marca a Natura con color #F4A623"
- "Rebrandea a Telcel, color azul #0032A0, servicio de telefonia movil"
- "Quiero la demo con la marca de CFE"

### Modificar pantallas existentes
- "Cambia el monto a $2,500"
- "Agrega un campo de email en el checkout"
- "Cambia los textos del chat de WhatsApp"
- "Modifica el flujo de pago de BBVA"
- "Agrega un paso de confirmacion antes del pago"

### Ajustar estilos
- "Hace los botones mas grandes"
- "Cambia el color del header"
- "Ajusta el espaciado de la tarjeta de credito"
- "Quiero que el checkout se vea mas moderno"

### Demo Nubank Impuestos
Demo independiente que simula pago de impuestos estatales en la app Nubank.
9 pantallas autocontenidas. **No usa el sistema de branding centralizado** — tiene sus propios archivos:
- `nubank-impuestos.html` — estructura HTML (9 steps)
- `css/nubank-impuestos-styles.css` — estilos (tema purple Nubank)
- `js/nubank-impuestos-script.js` — logica e interacciones

Para modificar esta demo, editar esos 3 archivos directamente.
Screenshots de referencia visual en `reference/nubank-impuestos/`.

## Arquitectura

### Sistema de demos (3 selectores)
El builder (`index.html`) permite armar demos combinando 3 etapas:
1. **Canal de llegada**: WhatsApp, QR en Factura, Nubank Impuestos
2. **Portal de pago**: Portal Estandar, Pago Directo BBVA, Nubank Impuestos
3. **Flujo de pago**: Hey Banco, BBVA, Nubank

Algunas opciones se vinculan entre si (BBVA fuerza checkout+payment, Nubank fuerza las 3).
Esto se controla con `forcedPayment` y `group` en `config/demo-builder-config.js`.

### Branding centralizado (aplica a todas las demos EXCEPTO Nubank)
Toda la marca esta en DOS archivos:
- `config/brand-config.js` — UNICA fuente de verdad (nombre, colores, montos, contacto)
- `config/variables.css` — CSS custom properties (sincronizar manualmente con brand-config.js)

**No hay que tocar ningun HTML** para cambiar de marca. Todo se popula dinamicamente via `BRAND.*`.

### Paginas de la demo

| Pagina | Archivo | Usa branding? |
|--------|---------|---------------|
| Builder (entrada) | `index.html` | Si |
| WhatsApp | `whatsapp.html` | Si |
| QR Factura | `qr.html` | Si |
| Checkout estandar | `checkout.html` | Si |
| Checkout BBVA | `checkout-bbva.html` | Si |
| App bancaria generica | `auth-mobile.html` | Si |
| App BBVA | `auth-bbva.html` | Si |
| Mobile viewer (iPhone frame) | `mobile-viewer.html` | Si |
| **Nubank Impuestos** | `nubank-impuestos.html` | **No** (autocontenida) |

### Archivos clave

```
Configuracion:
  config/brand-config.js        → Datos de marca (EDITAR PARA REBRAND)
  config/variables.css          → CSS custom properties (SYNC CON BRAND)
  config/demo-builder-config.js → Opciones del builder (3 selectores)
  config/banks-config.js        → 9 bancos pre-configurados

Routing:
  js/demo-router.js             → Routing entre etapas del builder

Assets:
  assets/brand/                 → Logo y factura PDF de la marca actual
  assets/banks/                 → Logos de los 9 bancos (compartido)
  assets/bbva/                  → Assets del flujo BBVA (splash, faceid, home screen)

Nubank (independiente):
  nubank-impuestos.html         → HTML con 9 screens
  css/nubank-impuestos-styles.css → Estilos Nubank
  js/nubank-impuestos-script.js → Logica Nubank
  reference/nubank-impuestos/   → Screenshots de referencia visual
```

## Que NO hacer
- No agregar npm, webpack ni build tools — el proyecto es vanilla a proposito
- No modificar los helpers al final de `brand-config.js` (formattedTotal, applyBrandColors, etc.)
- No hardcodear nombres de marca en los HTML que usan BRAND.* — usar el sistema dinamico
- No mezclar el sistema de branding con la demo Nubank (son independientes)
- No tocar `config/banks-config.js` para cambio de marca (los bancos son independientes)
- Al editar `config/variables.css`, mantener los valores RGB de las sombras sincronizados con el color primary de `brand-config.js`
