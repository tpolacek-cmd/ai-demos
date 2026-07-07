# TASK-007: Sistema de override de marca (brand-override.js)

## Metadata

- **id**: TASK-007
- **title**: Sistema de persistencia y override de marca via localStorage
- **status**: done
- **created**: 2026-03-31
- **linked_story**: FASE-7-brand-editor.md
- **type**: feature
- **estimated_hours**: 2

## Objetivo

Crear `js/brand-override.js` — un script ligero que todas las paginas cargan despues de `brand-config.js`. Lee overrides de `localStorage`, los mergea sobre el objeto `BRAND`, y deja todo listo para que `applyBrandColors()` y el resto de la pagina usen los valores personalizados.

## Especificacion Tecnica

### Archivos a Crear

| Archivo | Accion | Descripcion |
|---------|--------|-------------|
| `js/brand-override.js` | crear | Sistema de override con persistencia en localStorage |

### Implementacion

#### 1. Estructura del modulo

```javascript
// brand-override.js
// Carga overrides de marca desde localStorage y los aplica sobre el objeto BRAND.
// Debe cargarse DESPUES de brand-config.js y ANTES de que la pagina use BRAND.*.
// No modifica brand-config.js — solo sobreescribe valores en memoria.

(function() {
    var STORAGE_KEY = 'brandOverrides';

    // Deep merge: sobreescribe propiedades de target con source (1 nivel de nesting)
    function deepMerge(target, source) { ... }

    // Leer overrides guardados
    function loadBrandOverrides() { ... }

    // Guardar overrides actuales (solo los campos que difieren del default)
    function saveBrandOverrides(overrides) { ... }

    // Limpiar overrides (volver a defaults)
    function clearBrandOverrides() { ... }

    // Detectar si hay overrides activos
    function hasBrandOverrides() { ... }

    // Obtener los overrides raw (para el editor)
    function getBrandOverrides() { ... }

    // Exportar config completa como JSON string
    function exportBrandConfig() { ... }

    // Importar config desde JSON string
    function importBrandConfig(jsonString) { ... }

    // Aplicar overrides al objeto BRAND existente
    function applyOverrides() { ... }

    // Exponer API publica
    window.BrandOverride = {
        save: saveBrandOverrides,
        load: loadBrandOverrides,
        clear: clearBrandOverrides,
        has: hasBrandOverrides,
        get: getBrandOverrides,
        export: exportBrandConfig,
        import: importBrandConfig,
        apply: applyOverrides,
        STORAGE_KEY: STORAGE_KEY,
    };

    // Auto-aplicar al cargar el script
    applyOverrides();
})();
```

#### 2. Funcion `deepMerge(target, source)`

Merge de 1 nivel de profundidad (suficiente para BRAND que tiene `account` y `colors` como sub-objetos):

```javascript
function deepMerge(target, source) {
    for (var key in source) {
        if (!source.hasOwnProperty(key)) continue;
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])
            && target[key] && typeof target[key] === 'object') {
            deepMerge(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }
    return target;
}
```

#### 3. Funcion `applyOverrides()`

```javascript
function applyOverrides() {
    var overrides = loadBrandOverrides();
    if (!overrides) return;
    deepMerge(BRAND, overrides);
}
```

Se ejecuta automaticamente al final del IIFE. Esto garantiza que cuando `DOMContentLoaded` dispare `applyBrandColors()`, el BRAND ya esta parcheado.

#### 4. Funcion `saveBrandOverrides(overrides)`

Recibe un objeto parcial (solo los campos editados) y lo guarda en `localStorage`:

```javascript
function saveBrandOverrides(overrides) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
    } catch (e) {
        console.warn('brand-override: no se pudo guardar en localStorage', e);
    }
}
```

#### 5. Funcion `loadBrandOverrides()`

```javascript
function loadBrandOverrides() {
    try {
        var stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch (e) {
        console.warn('brand-override: error leyendo localStorage', e);
        return null;
    }
}
```

#### 6. Funcion `exportBrandConfig()`

Exporta el estado ACTUAL completo de BRAND (defaults + overrides aplicados), excluyendo funciones:

```javascript
function exportBrandConfig() {
    var exportable = {};
    for (var key in BRAND) {
        if (typeof BRAND[key] !== 'function' && BRAND.hasOwnProperty(key)) {
            exportable[key] = BRAND[key];
        }
    }
    return JSON.stringify(exportable, null, 2);
}
```

#### 7. Funcion `importBrandConfig(jsonString)`

Parsea un JSON, lo guarda como override, y lo aplica:

```javascript
function importBrandConfig(jsonString) {
    var parsed = JSON.parse(jsonString); // puede tirar error — el caller lo captura
    saveBrandOverrides(parsed);
    deepMerge(BRAND, parsed);
    // Re-aplicar colores al CSS
    if (typeof applyBrandColors === 'function') {
        applyBrandColors();
    }
}
```

### Consideraciones

- **No tocar funciones de BRAND**: `formattedTotal`, `formattedPlanAmount`, etc. son funciones arrow definidas despues del objeto. El override solo toca propiedades de datos.
- **Orden de carga**: `brand-config.js` primero (define BRAND + helpers), luego `brand-override.js` (mergea overrides sobre BRAND).
- **Timing**: El script se auto-ejecuta al ser parseado (IIFE), antes de `DOMContentLoaded`. Esto es necesario porque algunas paginas usan `BRAND.*` en scripts inline que corren antes de DOMContentLoaded.
- **Robustez**: Todos los accesos a `localStorage` estan en try/catch (modo privado del browser puede tirar excepciones).

### Dependencias

- `config/brand-config.js` — debe estar cargado antes
- Ninguna libreria externa

## Definition of Done

- [ ] Archivo `js/brand-override.js` creado
- [ ] `BrandOverride.save()` persiste overrides en localStorage
- [ ] `BrandOverride.load()` lee overrides de localStorage
- [ ] `BrandOverride.clear()` limpia overrides y deja BRAND en defaults
- [ ] `BrandOverride.has()` retorna true/false segun haya overrides guardados
- [ ] `BrandOverride.get()` retorna el objeto raw de overrides
- [ ] `BrandOverride.export()` retorna JSON string con config completa
- [ ] `BrandOverride.import(json)` aplica config desde JSON
- [ ] Auto-apply al cargar el script
- [ ] No rompe ninguna pagina si no hay overrides guardados

## Como Probar

### Test manual basico

1. Abrir la consola del navegador en cualquier pagina de la demo
2. Verificar que `window.BrandOverride` existe y tiene las funciones esperadas
3. Ejecutar:
   ```javascript
   BrandOverride.has()  // → false (no hay overrides)
   ```
4. Guardar un override:
   ```javascript
   BrandOverride.save({ name: 'TEST Corp', colors: { primary: '#FF0000' } })
   ```
5. Recargar la pagina
6. Verificar:
   ```javascript
   BRAND.name           // → 'TEST Corp'
   BRAND.colors.primary // → '#FF0000'
   BRAND.serviceType    // → 'Agua y saneamiento' (no se toco, viene del default)
   ```
7. Limpiar:
   ```javascript
   BrandOverride.clear()
   ```
8. Recargar — todo debe volver a los defaults de `brand-config.js`

### Test de export/import

1. Modificar marca desde consola:
   ```javascript
   BrandOverride.save({ name: 'Export Test', colors: { primary: '#00FF00' } })
   ```
2. Recargar, luego exportar:
   ```javascript
   var json = BrandOverride.export()
   console.log(json) // debe mostrar JSON completo con name: 'Export Test'
   ```
3. Limpiar overrides:
   ```javascript
   BrandOverride.clear()
   ```
4. Reimportar:
   ```javascript
   BrandOverride.import(json)
   BRAND.name // → 'Export Test'
   ```

### Test de robustez

1. Ejecutar con localStorage deshabilitado (modo privado en Safari):
   - La pagina no debe tirar errores
   - `BrandOverride.has()` debe retornar `false`
   - `BrandOverride.save()` debe fallar silenciosamente
2. Ejecutar con JSON corrupto en localStorage:
   ```javascript
   localStorage.setItem('brandOverrides', 'not-valid-json')
   ```
   - Recargar — la pagina no debe romperse, debe usar defaults

### Test de integracion con paginas

1. Guardar override con nombre diferente
2. Navegar a `checkout.html` directamente (no desde el builder)
3. Verificar que el nombre de marca en el checkout refleja el override
4. Verificar que los colores del header/botones reflejan el override de color
