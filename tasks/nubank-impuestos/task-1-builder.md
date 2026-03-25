# Task 1: Builder config + group locking

**Status:** [x] Complete
**Depende de:** ninguna
**Archivos a modificar:** `config/demo-builder-config.js`, `index.html`

## Checklist

- [ ] Agregar opcion `nubank-impuestos` en `DEMO_STAGES[0].options` (arrival)
- [ ] Agregar opcion `nubank-impuestos-checkout` en `DEMO_STAGES[1].options` (checkout)
- [ ] Agregar opcion `nubank-impuestos-payment` en `DEMO_STAGES[2].options` (payment)
- [ ] Implementar funcion `updateGroupLocking()` en `index.html`
- [ ] Integrar `updateGroupLocking()` en el event listener de `change` del builder
- [ ] Integrar `updateGroupLocking()` en la inicializacion del builder
- [ ] Implementar soporte `mobileOnly` en el handler de "Start Demo"
- [ ] Verificar que el locking de `forcedPayment` (BBVA) sigue funcionando

## Especificacion

### 1. Agregar opciones en `config/demo-builder-config.js`

Abrir `config/demo-builder-config.js`. Agregar una opcion al final del array `options` de cada uno de los 3 stages. Las 3 opciones comparten el campo `group: 'nubank-impuestos'` que las vincula.

**En arrival (DEMO_STAGES[0].options):**
```javascript
{
    id: 'nubank-impuestos',
    name: 'Nubank Impuestos',
    description: 'App Nubank - Pago de impuestos estatales',
    page: 'nubank-impuestos.html',
    mobileSupported: true,
    mobileOnly: true,
    group: 'nubank-impuestos',
    icon: '<img src="assets/banks/nu.jpeg" alt="Nubank" style="width: 28px; height: 28px; object-fit: contain; border-radius: 6px;">'
}
```

**En checkout (DEMO_STAGES[1].options):**
```javascript
{
    id: 'nubank-impuestos-checkout',
    name: 'Nubank Impuestos',
    description: 'Flujo in-app de pago de impuestos',
    page: 'nubank-impuestos.html',
    flow: 'nubank-impuestos',
    group: 'nubank-impuestos',
    icon: '<img src="assets/banks/nu.jpeg" alt="Nubank" style="width: 28px; height: 28px; object-fit: contain; border-radius: 6px;">'
}
```

**En payment (DEMO_STAGES[2].options):**
```javascript
{
    id: 'nubank-impuestos-payment',
    name: 'Nubank',
    description: 'Confirmacion de pago en app Nubank',
    bank: 'nubank',
    action: 'pay-impuestos',
    authPage: 'nubank-impuestos.html',
    group: 'nubank-impuestos',
    icon: '<img src="assets/banks/nu.jpeg" alt="Nubank" style="width: 28px; height: 28px; object-fit: contain; border-radius: 6px;">'
}
```

### 2. Implementar `updateGroupLocking()` en `index.html`

Dentro del IIFE `initBuilder()` en `index.html`, agregar la funcion `updateGroupLocking()`. Ubicarla DESPUES de `updateForcedPayment()` (~linea 293).

**Logica de la funcion:**

1. Obtener todas las opciones seleccionadas en cada stage.
2. Recolectar los `group` values de las opciones seleccionadas (buscando en DEMO_STAGES via `getOptionById`).
3. Si alguna opcion seleccionada tiene un `group`:
   - Para cada OTRO stage, buscar si hay una opcion con el mismo `group`.
   - Si la hay, forzar su seleccion (marcar radio, actualizar clase `.selected`).
   - Aplicar clase `.locked` a TODAS las opciones del stage forzado (como hace `forcedPayment`).
   - Agregar badge "Demo vinculada" al header del stage forzado (si no existe ya).
4. Si ninguna opcion seleccionada tiene `group` (o si se cambio a una opcion sin group):
   - Remover clase `.locked` de las opciones que fueron forzadas por group.
   - Remover badges "Demo vinculada".

**Referencia:** La funcion `updateForcedPayment()` (lineas ~253-293 de `index.html`) es el modelo a seguir. Usa el mismo patron de `.locked` class y badge insertion.

**Importante:** Si `updateGroupLocking()` fuerza opciones, debe llamar a `updateSummary()` al final para refrescar la barra de resumen.

### 3. Integrar en event listeners

En el event listener `builderGrid.addEventListener('change', ...)` (~linea 151), agregar la llamada a `updateGroupLocking()` DESPUES de las llamadas existentes:
```javascript
updateSummary();
updateMobileRestrictions();
updateForcedPayment();
updateGroupLocking();  // AGREGAR
```

En la seccion INIT al final del IIFE (~linea 326-328):
```javascript
applyMode(currentMode);
updateSummary();
updateForcedPayment();
updateGroupLocking();  // AGREGAR
```

### 4. Soporte `mobileOnly` en Start Demo

En el handler `startBtn.addEventListener('click', ...)` (~linea 301), ANTES de la navegacion normal, agregar:

```javascript
// Verificar mobileOnly — demos que siempre abren en mobile-viewer
var arrivalOption = getOptionById('arrival', config.arrival);
if (arrivalOption && arrivalOption.mobileOnly) {
    window.location.href = 'mobile-viewer.html?demo=' + arrivalOption.id;
    return;
}
```

Esto debe ir DESPUES de `saveDemoConfig(config)` y ANTES de `var startUrl = getDemoStartUrl(currentMode)`.

### Notas de implementacion

- El campo `group` es un string arbitrario. Todas las opciones con el mismo `group` se vinculan.
- El `group` locking y el `forcedPayment` locking son mecanismos separados. No deberian conflictuar porque `forcedPayment` solo aplica checkout→payment, mientras que `group` aplica cross-stage.
- Si en el futuro se agregan mas demos vinculadas, solo necesitan compartir el mismo `group` string.
- No modificar `js/demo-router.js` — la demo Nubank es autocontenida y no usa el router.
