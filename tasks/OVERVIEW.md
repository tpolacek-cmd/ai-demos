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

## Orden de ejecucion

Las fases deben ejecutarse en orden (0 -> 1 -> 2 -> 3 -> 4 -> 5) porque cada fase depende de las anteriores:
- Fase 0 reorganiza los archivos en subdirectorios. Todas las fases siguientes trabajan con la nueva estructura.
- Fase 1 crea `config/brand-config.js` y `config/variables.css`, referenciados desde la estructura nueva.
- Fase 2 crea `config/banks-config.js` usando la estructura de Fase 0.
- Fase 3 extrae inline styles a `css/whatsapp-styles.css` y `css/index-styles.css`.
- Fase 4 splitea `js/script.js` en modulos dentro de `js/`.
- Fase 5 documenta la estructura final y crea la skill /rebrand.

## Estructura actual de archivos (pre-Fase 0)

```
demo_naturgy_nu/                    # 35 items en root, todo mezclado
├── index.html                      # Launcher de demos (250 lineas inline CSS)
├── whatsapp.html                   # Demo WhatsApp (620 lineas inline CSS, 894 total)
├── qr.html                        # Demo QR Factura (88 lineas)
├── checkout.html                   # Checkout compartido (840 lineas, 7 modales)
├── menu.html                       # Selector de flujos (146 lineas)
├── auth-mobile.html                # Simulacion app movil (1035 lineas, 9 pantallas)
├── script.js                       # Logica checkout MONOLITO (1945 lineas)
├── auth-mobile-script.js           # Logica mobile auth (715 lineas)
├── styles.css                      # Estilos checkout (3207 lineas)
├── menu-styles.css                 # Estilos menu (424 lineas)
├── auth-mobile-styles.css          # Estilos mobile (2425 lineas)
├── qr-styles.css                   # Estilos QR viewer (459 lineas)
├── qr-script.js                    # QR viewer logic (256 lineas)
├── menu-script.js                  # Menu navigation (44 lineas)
├── totalplay.png                   # Logo marca
├── factura-totalplay.pdf           # Factura PDF
├── Hey_Banco.svg, santa.png, ...   # Logos bancos sueltos
├── Naturgy.png, nat.png            # BASURA: logos marca anterior
├── IMG_0558.png, IMG_3580.PNG      # BASURA: screenshots
├── openbank.png, plata.png         # BASURA: logos no usados
├── AAMA850101HDFRRL09              # BASURA: CURP de prueba suelto
├── *.mov                           # BASURA: videos demos anteriores
├── tasks/
├── .claude/
└── README.md
```

## Estructura objetivo (post-Fase 5)

```
demo-portal-pagos/
├── index.html                      # Launcher (sin inline styles)
├── whatsapp.html                   # Demo WhatsApp (sin inline styles)
├── qr.html                        # Demo QR Factura
├── checkout.html                   # Checkout compartido
├── menu.html                       # Selector de flujos
├── auth-mobile.html                # Simulacion app movil
│
├── config/                         # Configuraciones centrales
│   ├── brand-config.js             # UNICA fuente de verdad para datos de marca
│   ├── banks-config.js             # Config unificada de bancos
│   └── variables.css               # CSS custom properties (sync con brand-config.js)
│
├── js/                             # Scripts
│   ├── checkout-core.js            # Seleccion de metodo de pago y banco
│   ├── identity-validation.js      # Validacion CURP/RFC/CLABE
│   ├── qr-checkout-flow.js         # Flujo QR dentro del checkout
│   ├── push-flow.js                # Flujo push notification
│   ├── account-to-account.js       # Flujo A2A
│   ├── phone-mockup.js             # Simulacion phone en desktop
│   ├── qr-script.js                # QR factura viewer
│   ├── auth-mobile-script.js       # Mobile auth logic
│   └── menu-script.js              # Menu navigation
│
├── css/                            # Estilos
│   ├── styles.css                  # Checkout (sin :root, importa variables.css)
│   ├── whatsapp-styles.css         # Extraido de whatsapp.html
│   ├── index-styles.css            # Extraido de index.html
│   ├── menu-styles.css             # Sin :root
│   ├── auth-mobile-styles.css      # Limpio de vars legacy
│   └── qr-styles.css               # Sin :root
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
├── tasks/                          # Planificacion (se puede borrar despues)
├── .claude/
└── README.md
```

## Criterio de exito

Despues de completar las 6 fases, un rebranding completo (ej: de Totalplay a Telmex) debe requerir:
1. Editar `config/brand-config.js` con los nuevos valores.
2. Reemplazar `assets/brand/totalplay.png` con el nuevo logo (y actualizar el nombre en brand-config.js).
3. (Opcional) Reemplazar `assets/brand/factura-totalplay.pdf` si se usa la demo QR.
4. Verificar con `grep -r "Totalplay" --include="*.{html,js,css}" . | grep -v tasks/ | grep -v config/brand-config.js` que no queden restos.
5. Tiempo estimado: < 5 minutos para un LLM, < 10 minutos para un humano.
