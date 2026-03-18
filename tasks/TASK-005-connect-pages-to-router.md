# TASK-005: Conectar paginas existentes al demo-router

## Metadata

- **id**: TASK-005
- **title**: Reemplazar redirects hardcodeados por demo-router en todas las paginas
- **status**: done
- **created**: 2026-03-18
- **linked_story**: FASE-6-demo-builder.md
- **type**: frontend
- **estimated_hours**: 2

## Objetivo

Modificar las paginas de demo existentes para que usen `demo-router.js` al redirigir al siguiente bloque, en vez de tener URLs hardcodeadas. Esto permite que la navegacion entre bloques sea dinamica segun la configuracion del builder.

## Especificacion Tecnica

### Archivos a Modificar

| Archivo | Accion | Descripcion |
|---------|--------|-------------|
| `whatsapp.html` | modificar | Redirect usa `getNextPageUrl('arrival')` |
| `js/qr-script.js` | modificar | Redirect y URL del QR usan `getNextPageUrl('arrival')` |
| `js/checkout-core.js` | modificar | Pre-seleccionar banco de `getSelectedPaymentBank()` |

### Implementacion

#### 1. whatsapp.html — Redirect al checkout

**Archivo**: `whatsapp.html`
**Lineas afectadas**: ~9-10 (scripts), ~370-371 (redirect)

**Agregar imports** (antes del cierre de `</body>` o en `<head>`):

```html
<script src="config/demo-builder-config.js"></script>
<script src="js/demo-router.js"></script>
```

**Reemplazar** (linea 370-371):

```javascript
// ANTES:
var embeddedParam = isEmbedded ? '&embedded=1' : '';
window.location.href = 'checkout.html?flow=' + flow + embeddedParam;

// DESPUES:
window.location.href = getNextPageUrl('arrival');
```

La funcion `getNextPageUrl('arrival')` ya maneja:
- El flow (`curp-deeplink`)
- El parametro `embedded=1`
- El `source=qr` (si el arrival es QR)

**Variable `flow` existente**: Actualmente `whatsapp.html` tiene `var flow = sessionStorage.getItem('selectedFlow') || 'curp-deeplink'` (linea ~9 del script). Con el router esto ya no se necesita para el redirect, pero se puede mantener sin conflicto.

---

#### 2. js/qr-script.js — Redirect post-scan del QR

**Archivo**: `js/qr-script.js`
**Lineas afectadas**: 189-190

**Nota**: `qr.html` debe cargar los scripts de config y router. Verificar que `qr.html` incluya:

```html
<script src="config/demo-builder-config.js"></script>
<script src="js/demo-router.js"></script>
```

**Reemplazar** (linea 189-190):

```javascript
// ANTES:
const baseUrl = window.location.origin + window.location.pathname.replace('qr.html', '');
window.location.href = `${baseUrl}checkout.html?flow=curp-deeplink&source=qr`;

// DESPUES:
window.location.href = getNextPageUrl('arrival');
```

**URL del QR generado**: Actualmente el QR apunta a `checkout.html?flow=curp-deeplink&source=qr`. Esto no necesita cambiar porque el QR es visual/decorativo (el usuario no lo escanea realmente, clickea el boton "Escanear" que triggerea el redirect via JS).

---

#### 3. js/checkout-core.js — Pre-seleccion de banco

**Archivo**: `js/checkout-core.js`
**Comportamiento actual**: Cuando el usuario clickea "Pago Automatico", se muestra un grid de 8 bancos y el usuario elige uno manualmente.
**Comportamiento nuevo**: El banco viene pre-seleccionado del builder. Al clickear "Pago Automatico", se salta la seleccion manual y procede con el banco configurado.

**Nota**: `checkout.html` debe cargar los scripts de config y router:

```html
<script src="config/demo-builder-config.js"></script>
<script src="js/demo-router.js"></script>
```

**Modificacion** — despues de mostrar el panel de bancos, auto-seleccionar el banco del builder:

```javascript
// Obtener banco pre-seleccionado del builder
var preSelected = getSelectedPaymentBank();
if (preSelected) {
    // Simular click en el banco pre-seleccionado
    var bankCard = document.querySelector('.bank-card[data-bank="' + preSelected.bank + '"]');
    if (bankCard) {
        bankCard.click(); // triggers la logica existente de seleccion
    }
}
```

**Alternativa mas conservadora**: En vez de auto-seleccionar, simplemente resaltar visualmente el banco pre-seleccionado y dejar que el usuario confirme. Esto da mas libertad pero agrega un click extra.

**Recomendacion**: Ir con la auto-seleccion. El objetivo de la demo es mostrar el flujo completo rapidamente. Si el usuario quiere cambiar de banco, puede clickear otro antes de continuar.

---

#### 4. Puntos de redirect en checkout-core.js hacia auth-mobile

**Lineas afectadas**: 232-233, 340-341, 345

Estos redirects dentro de checkout ya usan variables `bank` y `action` que se setean cuando el usuario elige un banco en el grid. Con la auto-seleccion del punto anterior, estas variables ya tendran el valor correcto del builder. **No requieren cambios adicionales**.

Sin embargo, si se quiere ser mas explicito, se podria agregar un fallback:

```javascript
// Si por alguna razon no hay banco seleccionado, usar el del builder
if (!bank) {
    var fallback = getSelectedPaymentBank();
    if (fallback) {
        bank = fallback.bank;
        action = fallback.action;
    }
}
```

---

### Dependencias

- TASK-001 (`config/demo-builder-config.js`)
- TASK-002 (`js/demo-router.js`)

### Scripts a cargar en cada pagina

| Pagina | Scripts a agregar |
|--------|-------------------|
| `whatsapp.html` | `config/demo-builder-config.js`, `js/demo-router.js` |
| `qr.html` | `config/demo-builder-config.js`, `js/demo-router.js` |
| `checkout.html` | `config/demo-builder-config.js`, `js/demo-router.js` (antes de `checkout-core.js`) |

**`auth-mobile.html` NO necesita cambios** — sigue leyendo `bank` y `action` de URL params.

## Definition of Done

- [ ] `whatsapp.html` redirige al checkout usando `getNextPageUrl('arrival')`
- [ ] `qr.html` redirige al checkout usando `getNextPageUrl('arrival')`
- [ ] `checkout-core.js` pre-selecciona el banco del builder al mostrar la grilla
- [ ] La demo completa funciona end-to-end: builder → arrival → checkout → auth-mobile
- [ ] Las demos siguen funcionando si se accede directamente sin pasar por el builder (fallback a defaults)
- [ ] El modo embedded/mobile sigue funcionando correctamente
- [ ] No se rompe ningun flujo existente

## Notas

- Es critico que el fallback a defaults funcione. Si alguien accede directamente a `whatsapp.html` sin haber pasado por el builder, `getNextPageUrl('arrival')` debe retornar una URL valida usando `getDefaultDemoConfig()`.
- Los archivos `js/push-flow.js`, `js/qr-checkout-flow.js` y `js/phone-mockup.js` tambien tienen redirects a `auth-mobile.html` (lineas 157, 69, 25 respectivamente). Estos estan **dentro del flujo de checkout** y usan variables locales (`bank`, `action`) que ya vienen del banco seleccionado en la UI. No necesitan cambios siempre que el banco se pre-seleccione correctamente en checkout-core.js.
