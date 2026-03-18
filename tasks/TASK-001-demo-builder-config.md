# TASK-001: Crear config/demo-builder-config.js

## Metadata

- **id**: TASK-001
- **title**: Crear archivo de configuracion de bloques del demo builder
- **status**: done
- **created**: 2026-03-18
- **linked_story**: FASE-6-demo-builder.md
- **type**: config
- **estimated_hours**: 1

## Objetivo

Crear el archivo de configuracion que define las 3 etapas del builder y las opciones disponibles para cada una. Este archivo es la unica fuente de verdad para que opciones existen y como se conectan.

## Especificacion Tecnica

### Archivos a Crear

| Archivo | Accion | Descripcion |
|---------|--------|-------------|
| `config/demo-builder-config.js` | crear | Definicion de etapas y opciones del builder |

### Implementacion

#### 1. Crear `config/demo-builder-config.js`

```javascript
// demo-builder-config.js
// Define las 3 etapas del demo builder y las opciones disponibles para cada una.
// Esta es la UNICA fuente de verdad para agregar/quitar opciones del builder.

const DEMO_STAGES = [
    {
        id: 'arrival',
        label: 'Canal de llegada',
        description: 'Como llega el cliente al pago',
        icon: '<svg>...</svg>', // icono representativo de la etapa
        options: [
            {
                id: 'whatsapp',
                name: 'WhatsApp',
                description: 'Chat interactivo con link de pago',
                page: 'whatsapp.html',
                mobileSupported: true,
                icon: '<svg>...</svg>', // icono de WhatsApp
            },
            {
                id: 'qr',
                name: 'QR en Factura',
                description: 'Factura PDF con codigo QR integrado',
                page: 'qr.html',
                mobileSupported: false,
                icon: '<svg>...</svg>', // icono de QR
            },
        ]
    },
    {
        id: 'checkout',
        label: 'Portal de pago',
        description: 'Experiencia de seleccion de pago',
        icon: '<svg>...</svg>',
        options: [
            {
                id: 'portal-standard',
                name: 'Portal Estandar',
                description: 'Checkout con multiples metodos de pago y domiciliacion',
                page: 'checkout.html',
                flow: 'curp-deeplink', // flow fijo
                icon: '<svg>...</svg>',
            },
        ]
    },
    {
        id: 'payment',
        label: 'Flujo de pago',
        description: 'Metodo de pago y app bancaria',
        icon: '<svg>...</svg>',
        options: [
            {
                id: 'hey-banco',
                name: 'Hey Banco',
                description: 'Pago y domiciliacion via Hey Banco',
                bank: 'hey-banco',       // mapea a BANKS['hey-banco'] de banks-config.js
                action: 'pay-domiciliar', // accion para auth-mobile.html
                icon: '<svg>...</svg>',   // o referencia al logo del banco
            },
        ]
    }
];

// Helper: obtener etapa por id
function getStageById(stageId) {
    return DEMO_STAGES.find(function(s) { return s.id === stageId; }) || null;
}

// Helper: obtener opcion dentro de una etapa
function getOptionById(stageId, optionId) {
    var stage = getStageById(stageId);
    if (!stage) return null;
    return stage.options.find(function(o) { return o.id === optionId; }) || null;
}

// Helper: obtener la config default (primera opcion de cada etapa)
function getDefaultDemoConfig() {
    var config = {};
    DEMO_STAGES.forEach(function(stage) {
        if (stage.options.length > 0) {
            config[stage.id] = stage.options[0].id;
        }
    });
    return config;
}
```

### Estructura del objeto `demoConfig` en sessionStorage

Este es el formato que el builder guarda y que `demo-router.js` lee:

```json
{
    "arrival": "whatsapp",
    "checkout": "portal-standard",
    "payment": "hey-banco"
}
```

Los valores son IDs de opciones. Para obtener la data completa se usa `getOptionById(stageId, optionId)`.

### Notas sobre los iconos SVG

Los SVGs de los iconos se pueden tomar de:
- WhatsApp: ya existe en `index.html` linea 50-52
- QR: ya existe en `index.html` linea 72-84
- Portal/Checkout: crear un icono generico de carrito/pago
- Hey Banco: usar el logo de `BANKS['hey-banco'].logoHtmlCheckout` de `banks-config.js`

### Dependencias

- `config/banks-config.js` — para referencias a bancos en la etapa payment
- Ninguna libreria externa

## Definition of Done

- [ ] Archivo `config/demo-builder-config.js` creado
- [ ] `DEMO_STAGES` tiene las 3 etapas con todas las opciones actuales
- [ ] Helpers `getStageById`, `getOptionById`, `getDefaultDemoConfig` funcionan
- [ ] Los iconos SVG estan inline en cada opcion
- [ ] El archivo se puede cargar con `<script>` sin errores

## Notas

- Este archivo reemplaza conceptualmente a `config/demos-config.js` como driver del index. Sin embargo, `demos-config.js` se mantiene por retrocompatibilidad (el `mobile-viewer.html` podria seguir usandolo).
- Los iconos SVG se ponen inline para evitar dependencias externas y mantener el proyecto zero-build.
