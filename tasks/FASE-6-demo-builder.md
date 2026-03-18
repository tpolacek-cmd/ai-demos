# Fase 6 - Demo Builder por Bloques

## Objetivo

Transformar el `index.html` de un listado simple de demos a un **constructor de demos por bloques**, donde el usuario selecciona una opcion para cada etapa del flujo y lanza la demo armada.

Las 3 etapas del flujo:

| Etapa | Nombre | Opciones actuales | Futuras opciones |
|-------|--------|-------------------|------------------|
| 1 | Canal de llegada | WhatsApp, QR en Factura | SMS, Email, Push, etc. |
| 2 | Portal de pago | Portal Estandar | Variantes futuras |
| 3 | Flujo de pago | Hey Banco | Otros bancos, Transferencia, OXXO |

## Arquitectura

```
index.html (Builder 3 columnas)
    |
    |  usuario selecciona 1 opcion por etapa
    |  click "Iniciar Demo"
    |  guarda config en sessionStorage como "demoConfig"
    |
    v
[Bloque 1: Llegada]  --sessionStorage-->  [Bloque 2: Checkout]  --sessionStorage-->  [Bloque 3: Pago]
  whatsapp.html                             checkout.html                              auth-mobile.html
  qr.html                                  (flow=curp-deeplink fijo)                  (bank=X, action=Y)
```

### Mecanismo de conexion entre bloques

- El builder guarda en `sessionStorage` un objeto `demoConfig`:
  ```js
  { arrival: 'whatsapp', checkout: 'portal-standard', payment: 'hey-banco' }
  ```
  Los valores son IDs de opciones (strings). Para obtener la data completa (bank, action, page, etc.) se usa `getOptionById(stageId, optionId)` de `demo-builder-config.js`.
- Un nuevo modulo `js/demo-router.js` centraliza la logica de "dado el bloque actual, cual es la URL del siguiente".
- Cada pagina existente, en su punto de redireccion, importa `demo-router.js` y usa `getNextPageUrl()` en vez de hardcodear la URL destino.

### Decisiones de diseno

- **Layout**: 3 columnas lado a lado (pipeline horizontal)
- **Etapas con una sola opcion**: se muestran pre-seleccionadas con check visual
- **Flow del checkout**: fijo en `curp-deeplink` (no configurable por el usuario)
- **Toggle Desktop/Mobile**: se mantiene, afecta solo al bloque 1 (arrival)

## Tasks

| # | Task | Tipo | Horas | Depende de |
|---|------|------|-------|------------|
| 1 | TASK-001: Crear `config/demo-builder-config.js` | config | 1 | - |
| 2 | TASK-002: Crear `js/demo-router.js` | frontend | 2 | TASK-001 |
| 3 | TASK-003: Reescribir `index.html` como builder | frontend | 4 | TASK-001 |
| 4 | TASK-004: Actualizar `css/index-styles.css` | frontend | 3 | TASK-003 |
| 5 | TASK-005: Conectar paginas existentes al router | frontend | 2 | TASK-002 |

**Estimacion total**: 12 horas

**Orden sugerido**: TASK-001 → (TASK-002 + TASK-003 en paralelo) → TASK-004 → TASK-005

## Lo que NO cambia

- `auth-mobile.html` — ya lee `bank` y `action` de URL params, no necesita modificacion
- `mobile-viewer.html` — sigue funcionando igual
- `config/brand-config.js` — sin cambios
- `config/banks-config.js` — sin cambios
- Sistema de rebranding — sin impacto

## Como agregar opciones futuras

**Nuevo banco en flujo de pago** (ej: Santander):
1. Agregar entrada en `DEMO_STAGES[2].options` de `demo-builder-config.js`
2. Listo. `auth-mobile.html` ya soporta multiples bancos via URL params.

**Nuevo canal de llegada** (ej: SMS):
1. Crear `sms.html` con el flujo visual
2. Agregar `{ id: 'sms', name: 'SMS', page: 'sms.html', ... }` en `DEMO_STAGES[0].options`
3. En `sms.html`, importar `demo-router.js` y usar `getNextPageUrl('arrival')` para el redirect

**Nuevo portal de pago** (ej: checkout simplificado):
1. Crear `checkout-simple.html`
2. Agregar entrada en `DEMO_STAGES[1].options`
3. En la nueva pagina, importar `demo-router.js` y usar `getNextPageUrl('checkout')`

## Criterio de exito

- El `index.html` muestra un builder de 3 columnas funcional
- Seleccionar opciones y clickear "Iniciar Demo" lanza el flujo correcto
- La navegacion entre bloques es dinamica (lee de sessionStorage, no hardcodeada)
- Las demos existentes siguen funcionando identicamente
- Agregar una nueva opcion a cualquier etapa requiere solo editar `demo-builder-config.js` (+ crear la pagina si es nueva)
