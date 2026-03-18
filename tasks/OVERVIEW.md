# Reestructuracion del Proyecto - Overview

## Objetivo

Convertir este repositorio de demos de portal de pagos en una base escalable y LLM-friendly, donde:
- Cambiar de marca (ej: de Totalplay a Telmex) requiera editar **1 archivo de config + 1 logo**.
- Agregar una nueva demo (canal de entrada) sea simple y modular.
- Un agente LLM (Claude Code) pueda hacer modificaciones con precision sin necesitar entender todo el codebase.

## Estado actual

- El proyecto es una demo de portal de pagos accesible desde WhatsApp o QR en factura, actualmente brandeado para **Totalplay Mexico**.
- El codigo tiene problemas de centralizacion: datos de marca dispersos en 72+ lugares a traves de 8 archivos, 4 bloques `:root` CSS duplicados, 5 definiciones separadas de bancos, archivos monoliticos de 1000+ lineas, y cero archivos de configuracion.
- Todo esta en el root: 35 archivos mezclados incluyendo basura (videos .mov viejos, screenshots, logos de marca anterior, un archivo CURP suelto).
- Puntaje de LLM-friendliness actual: **2.3/10**.

## Fases del plan

- [x] **Fase 0** - Reorganizar directorios (`FASE-0-reorganizar-directorios.md`) — Alta
- [x] **Fase 1** - Centralizacion de marca (`FASE-1-brand-config.md`) — Alta
- [x] **Fase 2** - Consolidacion de bancos (`FASE-2-banks-config.md`) — Alta
- [x] **Fase 3** - Extraccion de estilos inline (`FASE-3-extract-styles.md`) — Media
- [x] **Fase 4** - Split de script.js (`FASE-4-split-scripts.md`) — Media
- [x] **Fase 5** - Limpieza y documentacion (`FASE-5-cleanup-docs.md`) — Baja
- [x] **Fase 6** - Demo builder por bloques (`FASE-6-demo-builder.md`) — Alta

## Orden de ejecucion

Las fases deben ejecutarse en orden (0 -> 1 -> 2 -> 3 -> 4 -> 5) porque cada fase depende de las anteriores:
- Fase 0 reorganiza los archivos en subdirectorios. Todas las fases siguientes trabajan con la nueva estructura.
- Fase 1 crea `config/brand-config.js` y `config/variables.css`, referenciados desde la estructura nueva.
- Fase 2 crea `config/banks-config.js` usando la estructura de Fase 0.
- Fase 3 extrae inline styles a `css/whatsapp-styles.css` y `css/index-styles.css`.
- Fase 4 splitea `js/script.js` en modulos dentro de `js/`.
- Fase 5 documenta la estructura final y crea la skill /rebrand.
- Fase 6 transforma `index.html` en un builder de demos por bloques (3 etapas: llegada, checkout, pago). Depende de Fases 0-5 completadas.

## Estructura actual (post-Fase 6)

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
│   ├── demos-config.js             # Legacy - metadata de demos (retrocompatibilidad)
│   └── variables.css               # CSS custom properties (sync con brand-config.js)
│
├── js/                             # Scripts
│   ├── demo-router.js              # Routing centralizado entre bloques del builder
│   ├── checkout-core.js            # Seleccion de metodo de pago y banco
│   ├── identity-validation.js      # Validacion CURP/RFC/CLABE
│   ├── qr-checkout-flow.js         # Flujo QR dentro del checkout
│   ├── push-flow.js                # Flujo push notification
│   ├── account-to-account.js       # Flujo A2A
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
├── assets/                         # Recursos estaticos
│   ├── brand/                      # Logo y factura de la marca actual
│   └── banks/                      # Logos de bancos
│
├── tasks/                          # Documentacion de fases
├── .claude/                        # Config Claude Code + skills
└── README.md
```

## Criterio de exito

Despues de completar las 6 fases, un rebranding completo (ej: de Totalplay a Telmex) debe requerir:
1. Editar `config/brand-config.js` con los nuevos valores.
2. Reemplazar `assets/brand/totalplay.png` con el nuevo logo (y actualizar el nombre en brand-config.js).
3. (Opcional) Reemplazar `assets/brand/factura-totalplay.pdf` si se usa la demo QR.
4. Verificar con `grep -r "Totalplay" --include="*.{html,js,css}" . | grep -v tasks/ | grep -v config/brand-config.js` que no queden restos.
5. Tiempo estimado: < 5 minutos para un LLM, < 10 minutos para un humano.
