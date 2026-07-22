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

## Arquitectura

### Sistema de demos (3 selectores)
El builder (`index.html`) permite armar demos combinando 3 etapas:
1. **Canal de llegada**: WhatsApp, QR en Factura
2. **Portal de pago**: Portal de Cobranzas (unico portal — replica vanilla del portal de `tapi-cobranzas-ai-front`)
3. **Metodos de pago**: multi-select (checkboxes) — Pago Directo BBVA, Pago Automatico Bancario, Tarjeta, Pago digital, Transferencia SPEI, Efectivo

El Paso 3 es **multi-select**: define que metodos ofrece el portal. Los metodos elegidos viajan
en el param `methods` de la URL (y del QR). El portal (`checkout.html`) los renderiza como
acordeones con su flujo inline (tarjeta→exito, SPEI→CLABE, efectivo→codigo de barras,
wallet→referencia, otros bancos→grid). El metodo BBVA reusa `auth-bbva.html`.

**Descargar factura (PDF):** desde el builder (con Paso 1 = Factura QR) hay un boton que abre
`qr.html?download=1` y descarga la factura con el QR real quemado (QR generado local + jsPDF).
El QR no expira (URL estatica a prod con la config en los params).

### Branding centralizado
Toda la marca esta en DOS archivos:
- `config/brand-config.js` — UNICA fuente de verdad (nombre, colores, montos, contacto)
- `config/variables.css` — CSS custom properties (sincronizar manualmente con brand-config.js)

**No hay que tocar ningun HTML** para cambiar de marca. Todo se popula dinamicamente via `BRAND.*`.

### Paginas de la demo

| Pagina | Archivo | Usa branding? |
|--------|---------|---------------|
| Builder (entrada) | `index.html` | Si |
| WhatsApp | `whatsapp.html` | Si |
| QR Factura (+ descarga PDF) | `qr.html` | Si |
| Portal de Cobranzas (6 metodos) | `checkout.html` | Si |
| App bancaria generica | `auth-mobile.html` | Si |
| App BBVA | `auth-bbva.html` | Si |
| Mobile viewer (iPhone frame) | `mobile-viewer.html` | Si |

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
