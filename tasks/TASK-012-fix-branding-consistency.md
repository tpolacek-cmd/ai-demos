# TASK-012: Arreglar inconsistencias de branding en componentes

## Metadata

- **id**: TASK-012
- **title**: Fix hardcoded brand colors and values across demo components
- **status**: done
- **created**: 2026-03-31
- **linked_story**: FASE-7-brand-editor.md
- **type**: bugfix
- **estimated_hours**: 3

## Contexto

Audit de los 6 componentes de demo revelo inconsistencias donde colores o valores de marca estan hardcodeados en vez de usar `BRAND.*` o CSS custom properties. Esto hace que al cambiar la marca desde el editor, algunas partes de la demo no reflejen los cambios.

**Nota**: NO son issues los colores propios de WhatsApp (tema dark), BBVA (marca del banco), ni colores semanticos genericos (success/error/warning).

## Arreglos a realizar

### A1: mobile-viewer-styles.css — Gradientes con color incorrecto [ALTA]

**Problema**: Las lineas 38-40 usan purple/indigo (`rgba(99,102,241)`) que no corresponde a ninguna marca. El `video-player.html` tiene los colores correctos usando el primary de brand.

**Archivo**: `css/mobile-viewer-styles.css`
**Lineas**: 38-40, 145

**Cambiar**:
```css
/* ANTES (incorrecto - purple/indigo) */
radial-gradient(ellipse at 20% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
radial-gradient(ellipse at 80% 50%, rgba(168, 85, 247, 0.06) 0%, transparent 50%),
radial-gradient(ellipse at 50% 0%, rgba(59, 130, 246, 0.05) 0%, transparent 40%);

/* DESPUES (correcto - usa brand primary y accent via applyBrandColors) */
```

**Solucion**: Estos gradientes deben usar las CSS vars que `applyBrandColors()` ya setea. Usar `--shadow-sm` pattern o definir nuevas vars con los RGB del primary. La funcion `applyBrandColors()` ya calcula `rgb` del primary — se puede exponer como `--primary-rgb` para usar en `rgba()`.

**Pasos**:
1. En `brand-config.js` funcion `applyBrandColors()`, agregar: `root.style.setProperty('--primary-rgb', rgb);` y `root.style.setProperty('--accent-rgb', hexToRgb(BRAND.colors.accent));`
2. En `mobile-viewer-styles.css` reemplazar los rgba hardcodeados con `rgba(var(--primary-rgb), 0.08)` etc.
3. En `video-player.html` hacer lo mismo para los inline styles del gradiente.

### A2: mobile-viewer-styles.css — Fallback del spinner [ALTA]

**Archivo**: `css/mobile-viewer-styles.css`
**Linea**: ~274

**Cambiar**:
```css
/* ANTES */
border-top-color: var(--primary-color, #6366f1);
/* DESPUES */
border-top-color: var(--primary-color, #0077B6);
```

### A3: push-flow.js — Icono push con color hardcodeado [ALTA]

**Archivo**: `js/push-flow.js`
**Lineas**: ~123-124

**Cambiar**: Reemplazar `#820AD1` hardcodeado por `BRAND.colors.primary`:
```javascript
// ANTES
stroke="#820AD1" fill="#820AD1"
// DESPUES
stroke="' + BRAND.colors.primary + '" fill="' + BRAND.colors.primary + '"
```

### A4: qr-styles.css — Box shadow con color amarillo incorrecto [ALTA]

**Archivo**: `css/qr-styles.css`
**Lineas**: ~198, ~207

**Cambiar**:
```css
/* ANTES (amarillo que no corresponde a nada) */
box-shadow: 0 4px 20px rgba(219, 228, 66, 0.2);
/* DESPUES (usar primary brand color) */
box-shadow: 0 4px 20px rgba(var(--primary-rgb), 0.2);
```

Depende de A1 (que expone `--primary-rgb`).

### A5: auth-mobile.html — Defaults de Hey Banco en HTML [MEDIA]

**Archivo**: `auth-mobile.html`
**Lineas**: 133, 324, 529, 532-533, 543, 547, 756, 766-767, 778, 782, 786

**Problema**: El HTML tiene valores default de Hey Banco que son visibles momentaneamente antes de que JS los reemplace. El JS ya actualiza estos campos correctamente desde `BANKS[bank]`, pero el HTML muestra un flash.

**Solucion**: Vaciar los defaults en HTML y dejar que JS los llene:
```html
<!-- ANTES -->
<strong>Hey Banco</strong>
<span id="paymentMethodAccount">Cuenta Hey Banco **** 4829</span>

<!-- DESPUES -->
<strong id="pushBankName"></strong>
<span id="paymentMethodAccount"></span>
```

**Nota**: Solo cambiar los elementos que JS ya actualiza. No agregar logica nueva, solo vaciar placeholders.

### A6: checkout-bbva.html — "Portal de Pagos" hardcodeado [MEDIA]

**Archivo**: `checkout-bbva.html`
**Lineas**: 6, 44, 150

**Cambiar**: Reemplazar las 3 instancias de "Portal de Pagos" para que usen BRAND.name:
- Linea 6: El title ya se setea dinamicamente en linea 622, OK
- Lineas 44, 150: Agregar `data-brand="name"` o setear via JS init

### A7: checkout/styles.css — Semantic colors hardcodeados [BAJA]

**Archivos**: `css/styles.css`, `checkout.html`, `js/qr-checkout-flow.js`, `js/identity-validation.js`, `js/account-to-account.js`

**Problema**: ~15 instancias de `#00c853`, `#dc3545`, `#ffc107` hardcodeados en vez de usar `var(--success)`, `var(--danger)`, `var(--warning)` que ya existen en `variables.css`.

**Solucion**: Reemplazar gradualmente los hex hardcodeados por las CSS vars existentes. En JS donde se genera HTML dinamico, usar `BRAND.colors.success || '#00c853'` (requiere agregar estos al objeto BRAND o usar las CSS vars con getComputedStyle).

**Nota**: Este es un cleanup incremental. No es bloqueante porque los colores semanticos no cambian con el rebranding.

### A8: video-player.html — Estilos inline [BAJA]

**Archivo**: `video-player.html`

**Problema**: Tiene ~150 lineas de CSS inline en `<style>` que duplican estilos de `mobile-viewer-styles.css`.

**Solucion**: Extraer a `css/video-player-styles.css` y compartir lo que sea comun con mobile-viewer via clases CSS.

## Orden de ejecucion

```
A1 (--primary-rgb en applyBrandColors)  ← primero, otros dependen
  |
  ├── A2 (fallback spinner) ─── en paralelo
  ├── A3 (push-flow.js)     ─── en paralelo
  ├── A4 (qr box shadow)    ─── en paralelo
  |
  v
A5 (auth-mobile defaults) ──── independiente
A6 (checkout-bbva text)   ──── independiente
A7 (semantic colors)      ──── incremental, baja prioridad
A8 (video-player styles)  ──── incremental, baja prioridad
```

## Definition of Done

- [ ] A1: Gradientes de mobile-viewer usan color de marca dinamico
- [ ] A2: Fallback del spinner matchea brand primary
- [ ] A3: Push notification icon usa BRAND.colors.primary
- [ ] A4: QR box shadow usa color de marca dinamico
- [ ] A5: Auth-mobile no muestra flash de "Hey Banco" antes de JS init
- [ ] A6: checkout-bbva muestra BRAND.name en vez de "Portal de Pagos" hardcodeado
- [ ] A7: Semantic colors usan CSS vars (incremental)
- [ ] A8: video-player usa CSS externo (incremental)

## Como Probar

### Test: Cambiar marca y verificar consistencia visual

1. Abrir index.html, expandir editor
2. Cambiar color primario a rojo (#E74C3C) y nombre a "Test Corp"
3. Guardar cambios
4. Navegar a cada componente y verificar:
   - **mobile-viewer.html**: Gradiente de fondo usa tinte rojo (no purple)
   - **mobile-viewer.html**: Spinner de carga es rojo (no indigo)
   - **WhatsApp > checkout**: Push notification (si se llega via el flujo push) usa icono rojo
   - **QR page**: Sombra del QR tiene tinte rojo (no amarillo)
   - **auth-mobile.html**: No se ve "Hey Banco" por un instante al cargar
   - **checkout-bbva.html**: Muestra "Test Corp" donde decia "Portal de Pagos"

### Test: Verificar que defaults siguen funcionando

1. Limpiar localStorage (`BrandOverride.clear()`)
2. Recargar y navegar a cada componente
3. Verificar que todo se ve exactamente igual que antes de los cambios
