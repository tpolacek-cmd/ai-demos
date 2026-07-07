# TASK-011: Presets de marca y gestion avanzada

## Metadata

- **id**: TASK-011
- **title**: Sistema de presets nombrados para guardar/cargar marcas
- **status**: done
- **created**: 2026-03-31
- **linked_story**: FASE-7-brand-editor.md
- **type**: feature
- **estimated_hours**: 3
- **depends_on**: TASK-008, TASK-010

## Objetivo

Agregar un sistema de presets que permita guardar multiples configuraciones de marca con nombre, cambiar entre ellas rapidamente, y compartirlas como archivos JSON. Esto es util para equipos que presentan demos a diferentes clientes y necesitan switchear de marca en segundos.

## Especificacion Tecnica

### Archivos a Modificar

| Archivo | Accion | Descripcion |
|---------|--------|-------------|
| `index.html` | modificar | Agregar UI de presets y logica JS |
| `css/index-styles.css` | modificar | Agregar estilos para el selector de presets |
| `js/brand-override.js` | modificar | Agregar funciones de gestion de presets |

### Modelo de datos

#### localStorage keys

```
brandOverrides          → Objeto JSON con los overrides activos actualmente
brandPresets            → Array JSON de presets guardados
brandActivePreset       → String con el nombre del preset activo (o null)
```

#### Estructura de un preset

```javascript
{
    name: 'Totalplay',              // nombre amigable
    createdAt: '2026-03-31',        // fecha de creacion
    overrides: {                    // objeto parcial de BRAND overrides
        name: 'Totalplay',
        fullName: 'Totalplay Telecomunicaciones',
        colors: { primary: '#00A651' },
        // ... solo campos modificados
    }
}
```

### Funciones a agregar en brand-override.js

```javascript
// Obtener lista de presets guardados
function getPresets() {
    try {
        var stored = localStorage.getItem('brandPresets');
        return stored ? JSON.parse(stored) : [];
    } catch (e) { return []; }
}

// Guardar preset nuevo (o actualizar si ya existe con ese nombre)
function savePreset(name, overrides) {
    var presets = getPresets();
    var existing = presets.findIndex(function(p) { return p.name === name; });
    var preset = {
        name: name,
        createdAt: new Date().toISOString().split('T')[0],
        overrides: overrides
    };
    if (existing >= 0) {
        presets[existing] = preset;
    } else {
        presets.push(preset);
    }
    localStorage.setItem('brandPresets', JSON.stringify(presets));
    return preset;
}

// Activar un preset por nombre
function activatePreset(name) {
    var presets = getPresets();
    var preset = presets.find(function(p) { return p.name === name; });
    if (!preset) return false;
    saveBrandOverrides(preset.overrides);
    localStorage.setItem('brandActivePreset', name);
    return true;
}

// Eliminar un preset por nombre
function deletePreset(name) {
    var presets = getPresets().filter(function(p) { return p.name !== name; });
    localStorage.setItem('brandPresets', JSON.stringify(presets));
    // Si el preset activo era este, limpiar
    if (localStorage.getItem('brandActivePreset') === name) {
        localStorage.removeItem('brandActivePreset');
    }
}

// Obtener nombre del preset activo
function getActivePresetName() {
    return localStorage.getItem('brandActivePreset') || null;
}
```

Exponer en `window.BrandOverride`:

```javascript
window.BrandOverride = {
    // ... funciones existentes de TASK-007 ...
    presets: {
        list: getPresets,
        save: savePreset,
        activate: activatePreset,
        delete: deletePreset,
        getActive: getActivePresetName,
    }
};
```

### UI en index.html

#### Ubicacion

El selector de presets se ubica dentro del panel editor, **arriba de los tabs**, como una barra horizontal:

```
┌─────────────────────────────────────────────────────────────┐
│ [gear]  Personalizar marca  [Modificada]         [chevron] │
├─────────────────────────────────────────────────────────────┤
│ Preset: [▼ Default        ]  [Guardar como...]  [Eliminar]  │
├─────────────────────────────────────────────────────────────┤
│ [Identidad] [Contacto] [Cuenta] [Colores]                  │
├─────────────────────────────────────────────────────────────┤
│ ...campos...                                                │
```

#### HTML del selector de presets

```html
<div class="brand-presets-bar" id="brandPresetsBar">
    <label class="brand-presets-label">Preset:</label>
    <select class="brand-presets-select" id="brandPresetSelect">
        <option value="">Default (brand-config.js)</option>
        <!-- Opciones se generan dinamicamente -->
    </select>
    <button class="brand-btn brand-btn-secondary brand-btn-sm" id="brandPresetSaveAs">
        Guardar como...
    </button>
    <button class="brand-btn brand-btn-secondary brand-btn-sm brand-btn-danger" id="brandPresetDelete" style="display:none">
        Eliminar
    </button>
</div>
```

### Logica JS del selector

#### Poblar el select con presets

```javascript
function refreshPresetSelect() {
    var select = document.getElementById('brandPresetSelect');
    var activePreset = BrandOverride.presets.getActive();
    var presets = BrandOverride.presets.list();
    var deleteBtn = document.getElementById('brandPresetDelete');

    // Limpiar opciones (excepto la default)
    while (select.options.length > 1) {
        select.remove(1);
    }

    presets.forEach(function(preset) {
        var option = document.createElement('option');
        option.value = preset.name;
        option.textContent = preset.name;
        if (preset.name === activePreset) option.selected = true;
        select.appendChild(option);
    });

    // Mostrar boton eliminar solo si hay un preset activo seleccionado
    deleteBtn.style.display = activePreset ? '' : 'none';
}
```

#### Cambiar de preset

```javascript
document.getElementById('brandPresetSelect').addEventListener('change', function() {
    var selectedName = this.value;

    if (!selectedName) {
        // Volver a default
        BrandOverride.clear();
        localStorage.removeItem('brandActivePreset');
        window.location.reload();
        return;
    }

    BrandOverride.presets.activate(selectedName);
    window.location.reload(); // Recargar para aplicar overrides limpios
});
```

#### Guardar como preset nuevo

```javascript
document.getElementById('brandPresetSaveAs').addEventListener('click', function() {
    var name = prompt('Nombre del preset:');
    if (!name || !name.trim()) return;
    name = name.trim();

    // Construir overrides desde los inputs actuales del editor
    var overrides = buildOverridesFromInputs();

    // Guardar el preset
    BrandOverride.presets.save(name, overrides);

    // Tambien activarlo y guardar como override actual
    BrandOverride.save(overrides);
    localStorage.setItem('brandActivePreset', name);

    refreshPresetSelect();
    updateBadge();
    showToast('Preset "' + name + '" guardado');
});
```

#### Eliminar preset

```javascript
document.getElementById('brandPresetDelete').addEventListener('click', function() {
    var activePreset = BrandOverride.presets.getActive();
    if (!activePreset) return;
    if (!confirm('Eliminar el preset "' + activePreset + '"?')) return;

    BrandOverride.presets.delete(activePreset);
    BrandOverride.clear();
    window.location.reload();
});
```

### Estilos CSS

```css
.brand-presets-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    border-bottom: 1px solid var(--border-color);
    background: #fafbfc;
}

.brand-presets-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
    white-space: nowrap;
}

.brand-presets-select {
    flex: 1;
    max-width: 240px;
    padding: 7px 10px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-family: inherit;
    font-size: 13px;
    color: var(--text-primary);
    background: white;
    cursor: pointer;
}

.brand-presets-select:focus {
    outline: none;
    border-color: var(--primary-color);
}

.brand-btn-sm {
    padding: 6px 10px;
    font-size: 12px;
}

.brand-btn-danger:hover {
    background: #fee2e2;
    color: #dc2626;
    border-color: #fca5a5;
}

@media (max-width: 480px) {
    .brand-presets-bar {
        flex-wrap: wrap;
    }

    .brand-presets-select {
        max-width: none;
        width: 100%;
        order: 2;
    }

    .brand-presets-label {
        width: 100%;
    }
}
```

### Presets pre-cargados (opcional)

Se puede incluir un par de presets de ejemplo para que el usuario vea como funciona el sistema. Estos serian presets "built-in" que se cargan la primera vez si no hay presets en localStorage:

```javascript
var BUILTIN_PRESETS = [
    {
        name: 'SEGIAGUA (default)',
        createdAt: '2026-03-31',
        overrides: {} // vacio = usa brand-config.js tal cual
    },
    {
        name: 'Totalplay',
        createdAt: '2026-03-31',
        overrides: {
            name: 'Totalplay',
            fullName: 'Totalplay Telecomunicaciones',
            serviceType: 'Telecomunicaciones',
            planName: 'Plan Hogar 200 Mbps',
            colors: { primary: '#00A651', primaryDark: '#007A3D', accent: '#4CAF50' }
        }
    }
];
```

Esto se evalua en TASK-011 como mejora — no es bloqueante para el MVP.

## Definition of Done

- [ ] Funciones de presets agregadas a `js/brand-override.js` en `BrandOverride.presets.*`
- [ ] Selector de presets visible en el panel editor (arriba de los tabs)
- [ ] Se puede guardar un preset con nombre
- [ ] Se puede cambiar entre presets desde el select
- [ ] Se puede eliminar un preset
- [ ] Volver a "Default" limpia overrides y recarga
- [ ] Los presets persisten en localStorage
- [ ] Estilos del selector coherentes con el resto del editor
- [ ] Responsive en mobile

## Como Probar

### Test 1: Guardar un preset

1. Abrir index.html, expandir editor
2. Cambiar nombre a "Mi Empresa" y color primario a rojo (#E74C3C)
3. Click "Guardar como..." → ingresar "Demo Roja"
4. Verificar que aparece toast "Preset Demo Roja guardado"
5. Verificar que el select muestra "Demo Roja" seleccionado
6. Verificar que aparece el boton "Eliminar"

### Test 2: Crear segundo preset

1. Cambiar nombre a "Otra Empresa" y color a verde (#27AE60)
2. Click "Guardar como..." → ingresar "Demo Verde"
3. Verificar que el select ahora tiene: Default, Demo Roja, Demo Verde
4. "Demo Verde" esta seleccionado

### Test 3: Cambiar entre presets

1. Cambiar el select a "Demo Roja"
2. La pagina recarga
3. Verificar que nombre es "Mi Empresa", color es rojo
4. Los inputs del editor muestran los valores de "Demo Roja"
5. Cambiar a "Default" → la pagina recarga con valores originales de brand-config.js

### Test 4: Eliminar un preset

1. Seleccionar "Demo Roja" en el select
2. Click "Eliminar" → confirmar
3. La pagina recarga con defaults
4. Verificar que "Demo Roja" ya no aparece en el select
5. "Demo Verde" sigue existiendo

### Test 5: Persistencia entre sesiones

1. Crear un preset, cerrar el tab del browser
2. Reabrir index.html
3. Verificar que el preset sigue en el select
4. Verificar que si estaba activo, sigue activo

### Test 6: Presets en paginas de demo

1. Activar preset "Demo Verde"
2. Iniciar una demo (WhatsApp > Portal Estandar > Hey Banco)
3. Verificar que todas las paginas muestran la marca del preset
4. Volver a index.html — el preset sigue activo

### Test 7: Exportar/Importar con presets

1. Activar un preset, modificar un campo adicional en el editor
2. Exportar JSON
3. El JSON exportado debe contener el estado completo actual (preset + modificacion adicional)
4. Resetear todo, importar el JSON
5. Verificar que los valores se restauran (pero no se crea un preset automaticamente — eso es separado)
