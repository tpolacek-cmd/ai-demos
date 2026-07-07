# TASK-008: UI del editor visual de marca

## Metadata

- **id**: TASK-008
- **title**: Panel de edicion visual de marca en index.html
- **status**: done
- **created**: 2026-03-31
- **linked_story**: FASE-7-brand-editor.md
- **type**: feature
- **estimated_hours**: 4
- **depends_on**: TASK-007

## Objetivo

Agregar un panel expandible/colapsable en `index.html` con un formulario que permita editar todas las variables del objeto `BRAND` visualmente. Los cambios se reflejan en tiempo real en la pagina y se persisten via `BrandOverride` (TASK-007).

## Especificacion Tecnica

### Archivos a Modificar

| Archivo | Accion | Descripcion |
|---------|--------|-------------|
| `index.html` | modificar | Agregar panel editor + script de logica |

### Archivos Nuevos

Ninguno. Todo el HTML y JS del editor va dentro de `index.html` (inline) para mantener la simplicidad del proyecto.

### Diseno del Panel

#### Ubicacion

El editor se ubica entre el `view-mode-bar` y el `builder-grid`, dentro de `<main>`. Es un panel colapsable que por default esta **cerrado** para no asustar a usuarios que solo quieren usar el builder.

#### Estructura HTML

```html
<!-- Brand Editor Panel -->
<div class="brand-editor" id="brandEditor">
    <button class="brand-editor-toggle" id="brandEditorToggle">
        <svg><!-- icono settings/gear --></svg>
        <span>Personalizar marca</span>
        <span class="brand-editor-badge" id="brandEditorBadge" style="display:none">Modificada</span>
        <svg class="brand-editor-chevron"><!-- chevron down --></svg>
    </button>

    <div class="brand-editor-body" id="brandEditorBody">
        <!-- Tabs de secciones -->
        <div class="brand-editor-tabs" id="brandEditorTabs">
            <button class="brand-tab active" data-tab="identity">Identidad</button>
            <button class="brand-tab" data-tab="contact">Contacto</button>
            <button class="brand-tab" data-tab="account">Cuenta</button>
            <button class="brand-tab" data-tab="colors">Colores</button>
        </div>

        <!-- Tab: Identidad -->
        <div class="brand-tab-content active" data-tab="identity">
            <div class="brand-field">
                <label>Nombre de la empresa</label>
                <input type="text" data-brand="name" placeholder="Ej: Totalplay">
            </div>
            <div class="brand-field">
                <label>Nombre completo</label>
                <input type="text" data-brand="fullName" placeholder="Ej: Totalplay Telecomunicaciones">
            </div>
            <div class="brand-field">
                <label>Tipo de servicio</label>
                <input type="text" data-brand="serviceType" placeholder="Ej: Telecomunicaciones">
            </div>
            <div class="brand-field">
                <label>Nombre del plan</label>
                <input type="text" data-brand="planName" placeholder="Ej: Plan Hogar 200 Mbps">
            </div>
            <div class="brand-field">
                <label>Logo (ruta relativa)</label>
                <input type="text" data-brand="logo" placeholder="assets/brand/logo.png">
            </div>
        </div>

        <!-- Tab: Contacto -->
        <div class="brand-tab-content" data-tab="contact">
            <div class="brand-field">
                <label>Dominio</label>
                <input type="text" data-brand="domain" placeholder="Ej: totalplay.com.mx">
            </div>
            <div class="brand-field">
                <label>Dominio de pago</label>
                <input type="text" data-brand="paymentDomain" placeholder="Ej: pago.totalplay.com.mx">
            </div>
            <div class="brand-field">
                <label>Telefono</label>
                <input type="text" data-brand="phone" placeholder="Ej: 800 123 4567">
            </div>
            <div class="brand-field">
                <label>Telefono amigable</label>
                <input type="text" data-brand="phoneFriendly" placeholder="Ej: 800 TOTALPLAY">
            </div>
            <div class="brand-field">
                <label>WhatsApp</label>
                <input type="text" data-brand="whatsapp" placeholder="Ej: 55 1234 5678">
            </div>
            <div class="brand-field">
                <label>Deep link param</label>
                <input type="text" data-brand="deepLinkServiceParam" placeholder="Ej: totalplay">
            </div>
        </div>

        <!-- Tab: Cuenta / Factura -->
        <div class="brand-tab-content" data-tab="account">
            <div class="brand-field">
                <label>Numero de cuenta</label>
                <input type="text" data-brand="account.number" placeholder="0073-4120-58">
            </div>
            <div class="brand-field">
                <label>Periodo</label>
                <input type="text" data-brand="account.period" placeholder="01 Mar - 31 Mar 2026">
            </div>
            <div class="brand-field">
                <label>Fecha de vencimiento</label>
                <input type="text" data-brand="account.dueDate" placeholder="20 de Marzo 2026">
            </div>
            <div class="brand-field">
                <label>Fecha vencimiento corta</label>
                <input type="text" data-brand="account.dueDateShort" placeholder="20 Mar 2026">
            </div>
            <div class="brand-field brand-field-row">
                <div class="brand-field">
                    <label>Monto del plan</label>
                    <input type="number" step="0.01" data-brand="account.planAmount" placeholder="405.00">
                </div>
                <div class="brand-field">
                    <label>Descuento</label>
                    <input type="number" step="0.01" data-brand="account.discount" placeholder="-30.00">
                </div>
            </div>
            <div class="brand-field">
                <label>Etiqueta del descuento</label>
                <input type="text" data-brand="account.discountLabel" placeholder="Descuento pronto pago">
            </div>
            <div class="brand-field brand-field-row">
                <div class="brand-field">
                    <label>Saldo anterior</label>
                    <input type="number" step="0.01" data-brand="account.previousBalance" placeholder="0.00">
                </div>
                <div class="brand-field">
                    <label>Total a pagar</label>
                    <input type="number" step="0.01" data-brand="account.totalAmount" placeholder="375.00">
                </div>
            </div>
            <div class="brand-field">
                <label>Referencia de pago</label>
                <input type="text" data-brand="account.reference" placeholder="0073 0001 4120 5800 7">
            </div>
        </div>

        <!-- Tab: Colores -->
        <div class="brand-tab-content" data-tab="colors">
            <div class="brand-field brand-field-color">
                <label>Color primario</label>
                <div class="color-input-group">
                    <input type="color" data-brand="colors.primary" data-color-for="colors-primary-hex">
                    <input type="text" id="colors-primary-hex" data-brand="colors.primary" placeholder="#0077B6">
                </div>
            </div>
            <div class="brand-field brand-field-color">
                <label>Color primario oscuro</label>
                <div class="color-input-group">
                    <input type="color" data-brand="colors.primaryDark" data-color-for="colors-primaryDark-hex">
                    <input type="text" id="colors-primaryDark-hex" data-brand="colors.primaryDark" placeholder="#005F8A">
                </div>
            </div>
            <div class="brand-field brand-field-color">
                <label>Color primario claro</label>
                <div class="color-input-group">
                    <input type="color" data-brand="colors.primaryLight" data-color-for="colors-primaryLight-hex">
                    <input type="text" id="colors-primaryLight-hex" data-brand="colors.primaryLight" placeholder="#E6F4FA">
                </div>
            </div>
            <div class="brand-field brand-field-color">
                <label>Color accent</label>
                <div class="color-input-group">
                    <input type="color" data-brand="colors.accent" data-color-for="colors-accent-hex">
                    <input type="text" id="colors-accent-hex" data-brand="colors.accent" placeholder="#00A5CF">
                </div>
            </div>
            <div class="brand-field brand-field-color">
                <label>Fondo</label>
                <div class="color-input-group">
                    <input type="color" data-brand="colors.background" data-color-for="colors-background-hex">
                    <input type="text" id="colors-background-hex" data-brand="colors.background" placeholder="#F0F8FF">
                </div>
            </div>
            <div class="brand-field brand-field-color">
                <label>Header</label>
                <div class="color-input-group">
                    <input type="color" data-brand="colors.headerBg" data-color-for="colors-headerBg-hex">
                    <input type="text" id="colors-headerBg-hex" data-brand="colors.headerBg" placeholder="#2A3444">
                </div>
            </div>
            <div class="brand-field brand-field-color">
                <label>Texto de botones</label>
                <div class="color-input-group">
                    <input type="color" data-brand="colors.btnText" data-color-for="colors-btnText-hex">
                    <input type="text" id="colors-btnText-hex" data-brand="colors.btnText" placeholder="#ffffff">
                </div>
            </div>
        </div>

        <!-- Barra de acciones -->
        <div class="brand-editor-actions">
            <button class="brand-btn brand-btn-secondary" id="brandReset">
                <svg><!-- reset icon --></svg>
                Resetear
            </button>
            <button class="brand-btn brand-btn-secondary" id="brandExport">
                <svg><!-- download icon --></svg>
                Exportar JSON
            </button>
            <button class="brand-btn brand-btn-secondary" id="brandImport">
                <svg><!-- upload icon --></svg>
                Importar JSON
            </button>
            <button class="brand-btn brand-btn-primary" id="brandSave">
                <svg><!-- save icon --></svg>
                Guardar cambios
            </button>
        </div>
    </div>
</div>

<!-- Input file oculto para importar JSON -->
<input type="file" id="brandImportFile" accept=".json" style="display:none">
```

### Logica JavaScript (inline en index.html)

#### Inicializacion del editor

```javascript
(function initBrandEditor() {
    var editor = document.getElementById('brandEditor');
    var toggle = document.getElementById('brandEditorToggle');
    var body = document.getElementById('brandEditorBody');
    var badge = document.getElementById('brandEditorBadge');

    // 1. Poblar inputs con valores actuales de BRAND
    populateEditorFields();

    // 2. Mostrar badge si hay overrides activos
    updateBadge();

    // 3. Toggle expand/collapse
    toggle.addEventListener('click', function() { ... });

    // 4. Tab switching
    setupTabs();

    // 5. Live preview en inputs
    setupLivePreview();

    // 6. Color picker sync (color <-> hex text)
    setupColorSync();

    // 7. Action buttons
    setupActions();
})();
```

#### Funcion `populateEditorFields()`

Recorre todos los `[data-brand]` inputs y les asigna el valor actual de BRAND:

```javascript
function populateEditorFields() {
    var inputs = document.querySelectorAll('#brandEditorBody [data-brand]');
    inputs.forEach(function(input) {
        var path = input.getAttribute('data-brand');
        var value = getNestedValue(BRAND, path);
        if (value !== undefined) {
            input.value = value;
        }
    });
}

// Helper: lee BRAND['colors']['primary'] desde path 'colors.primary'
function getNestedValue(obj, path) {
    return path.split('.').reduce(function(o, key) {
        return o && o[key] !== undefined ? o[key] : undefined;
    }, obj);
}

// Helper: escribe en BRAND['colors']['primary'] desde path 'colors.primary'
function setNestedValue(obj, path, value) {
    var keys = path.split('.');
    var target = obj;
    for (var i = 0; i < keys.length - 1; i++) {
        if (!target[keys[i]]) target[keys[i]] = {};
        target = target[keys[i]];
    }
    target[keys[keys.length - 1]] = value;
}
```

#### Funcion `setupLivePreview()`

Cada input con `data-brand` escucha `input` event y actualiza BRAND en tiempo real:

```javascript
function setupLivePreview() {
    var inputs = document.querySelectorAll('#brandEditorBody [data-brand]');
    inputs.forEach(function(input) {
        input.addEventListener('input', function() {
            var path = input.getAttribute('data-brand');
            var value = input.value;

            // Convertir a numero si es input type=number
            if (input.type === 'number') {
                value = parseFloat(value) || 0;
            }

            // Actualizar BRAND en memoria
            setNestedValue(BRAND, path, value);

            // Re-aplicar colores si se cambio un color
            if (path.startsWith('colors.')) {
                applyBrandColors();
            }

            // Re-aplicar textos de marca visibles en index.html
            refreshIndexBrand();
        });
    });
}
```

#### Funcion `refreshIndexBrand()`

Actualiza los elementos de index.html que usan BRAND:

```javascript
function refreshIndexBrand() {
    // Logo
    var logo = document.getElementById('indexLogo');
    if (logo) { logo.src = BRAND.logo; logo.alt = BRAND.name; }

    // Nombre en data-brand spans
    document.querySelectorAll('[data-brand="name"]').forEach(function(el) {
        el.textContent = BRAND.name;
    });

    // Titulo del documento
    document.title = BRAND.name + ' - Demo Portal de Pagos';
}
```

#### Funcion `setupColorSync()`

Sincroniza color picker nativo con input de texto hex:

```javascript
function setupColorSync() {
    var colorInputs = document.querySelectorAll('input[type="color"][data-color-for]');
    colorInputs.forEach(function(picker) {
        var hexInputId = picker.getAttribute('data-color-for');
        var hexInput = document.getElementById(hexInputId);
        if (!hexInput) return;

        // Color picker -> hex text
        picker.addEventListener('input', function() {
            hexInput.value = picker.value;
            hexInput.dispatchEvent(new Event('input', { bubbles: true }));
        });

        // Hex text -> color picker
        hexInput.addEventListener('input', function() {
            if (/^#[0-9A-Fa-f]{6}$/.test(hexInput.value)) {
                picker.value = hexInput.value;
            }
        });
    });
}
```

#### Acciones (guardar, resetear, exportar, importar)

```javascript
function setupActions() {
    // Guardar: construir objeto de overrides desde inputs y persistir
    document.getElementById('brandSave').addEventListener('click', function() {
        var overrides = buildOverridesFromInputs();
        BrandOverride.save(overrides);
        updateBadge();
        showToast('Marca guardada');
    });

    // Resetear: limpiar localStorage y repoblar inputs
    document.getElementById('brandReset').addEventListener('click', function() {
        if (!confirm('Esto eliminara todas las personalizaciones. Continuar?')) return;
        BrandOverride.clear();
        // Recargar la pagina para que brand-config.js defina BRAND limpio
        window.location.reload();
    });

    // Exportar: descargar JSON
    document.getElementById('brandExport').addEventListener('click', function() {
        var json = BrandOverride.export();
        var blob = new Blob([json], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'brand-config-' + BRAND.name.toLowerCase().replace(/\s+/g, '-') + '.json';
        a.click();
        URL.revokeObjectURL(url);
    });

    // Importar: abrir file picker
    document.getElementById('brandImport').addEventListener('click', function() {
        document.getElementById('brandImportFile').click();
    });

    document.getElementById('brandImportFile').addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
            try {
                BrandOverride.import(ev.target.result);
                populateEditorFields();
                refreshIndexBrand();
                updateBadge();
                showToast('Marca importada: ' + BRAND.name);
            } catch (err) {
                alert('Error al importar: ' + err.message);
            }
        };
        reader.readAsText(file);
        // Reset file input para permitir reimportar el mismo archivo
        e.target.value = '';
    });
}
```

#### Funcion `buildOverridesFromInputs()`

Construye un objeto solo con los valores que difieren de los defaults:

```javascript
function buildOverridesFromInputs() {
    var overrides = {};
    var inputs = document.querySelectorAll('#brandEditorBody [data-brand]');
    // Deduplicar por path (color pickers y hex inputs comparten data-brand)
    var seen = {};
    inputs.forEach(function(input) {
        var path = input.getAttribute('data-brand');
        if (seen[path]) return;
        seen[path] = true;

        var value = input.value;
        if (input.type === 'number') value = parseFloat(value) || 0;

        setNestedValue(overrides, path, value);
    });
    return overrides;
}
```

#### Funcion `showToast(message)`

Feedback visual breve de que la accion se completo:

```javascript
function showToast(message) {
    var toast = document.createElement('div');
    toast.className = 'brand-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    // Trigger reflow para animacion
    toast.offsetHeight;
    toast.classList.add('visible');
    setTimeout(function() {
        toast.classList.remove('visible');
        setTimeout(function() { toast.remove(); }, 300);
    }, 2000);
}
```

### Interaccion con TASK-007

- Usa `BrandOverride.save()` para persistir
- Usa `BrandOverride.clear()` para resetear
- Usa `BrandOverride.export()` y `BrandOverride.import()` para JSON
- Usa `BrandOverride.has()` para mostrar/ocultar badge "Modificada"

### Script tag adicional en index.html

Agregar `<script src="js/brand-override.js"></script>` despues de `brand-config.js` y antes del script inline del builder.

## Definition of Done

- [ ] Panel editor visible en index.html con boton toggle "Personalizar marca"
- [ ] 4 tabs funcionales: Identidad, Contacto, Cuenta, Colores
- [ ] Todos los campos de BRAND mapeados a inputs con `data-brand`
- [ ] Color pickers sincronizados con inputs de texto hex
- [ ] Live preview: cambiar un campo actualiza la pagina en tiempo real
- [ ] Boton "Guardar cambios" persiste en localStorage via BrandOverride
- [ ] Boton "Resetear" limpia overrides y recarga
- [ ] Boton "Exportar JSON" descarga archivo .json
- [ ] Boton "Importar JSON" carga archivo y aplica
- [ ] Badge "Modificada" visible cuando hay overrides activos
- [ ] Panel colapsado por default
- [ ] No rompe el builder existente (las 3 columnas siguen funcionando)

## Como Probar

### Test 1: Abrir/cerrar panel

1. Abrir `http://localhost:8080`
2. Verificar que el panel esta colapsado y se ve el boton "Personalizar marca"
3. Click en el boton — el panel se expande mostrando la tab "Identidad"
4. Click de nuevo — el panel se colapsa
5. El builder de 3 columnas debajo sigue visible y funcional

### Test 2: Editar nombre y ver preview

1. Expandir editor, tab "Identidad"
2. Cambiar "Nombre de la empresa" a "Mi Empresa Test"
3. Verificar que:
   - El titulo de la pagina cambia a "Mi Empresa Test - Demo Portal de Pagos"
   - El footer muestra "Demo de portal de pagos Mi Empresa Test"
4. **No recargar aun** — los cambios son solo en memoria

### Test 3: Editar color y ver preview

1. Tab "Colores"
2. Usar el color picker de "Color primario" y elegir rojo (#FF0000)
3. Verificar que el input hex se actualiza a "#FF0000"
4. Verificar que los elementos de la pagina cambian de color:
   - Stage icons toman tinte rojo
   - Bordes de opciones seleccionadas son rojos
   - Boton "Iniciar Demo" cambia a rojo
   - Sombras cambian a tinte rojo

### Test 4: Guardar y persistir

1. Hacer cambios de nombre y color (tests 2 y 3)
2. Click "Guardar cambios"
3. Verificar que aparece toast "Marca guardada"
4. Verificar que aparece badge "Modificada" en el toggle
5. Recargar la pagina (F5)
6. Verificar que los cambios persisten:
   - Nombre sigue siendo "Mi Empresa Test"
   - Color sigue siendo rojo
   - El badge "Modificada" sigue visible
   - Los inputs del editor muestran los valores guardados

### Test 5: Resetear

1. Con cambios guardados (test 4), click "Resetear"
2. Confirmar el dialog
3. La pagina se recarga
4. Verificar que todo vuelve a los defaults de brand-config.js
5. El badge "Modificada" desaparece
6. Los inputs muestran los valores originales

### Test 6: Exportar e Importar

1. Hacer cambios y guardar
2. Click "Exportar JSON" — se descarga archivo .json
3. Abrir el archivo y verificar que contiene los datos correctos
4. Click "Resetear" para volver a defaults
5. Click "Importar JSON" — seleccionar el archivo exportado
6. Verificar que los datos se restauran correctamente
7. Verificar que el badge "Modificada" aparece

### Test 7: Campos numericos

1. Tab "Cuenta", cambiar "Total a pagar" a 1500.50
2. Verificar que el valor se guarda como numero, no como string
3. Exportar y verificar en el JSON que `account.totalAmount` es `1500.5` (numero)

### Test 8: No interferencia con builder

1. Con el editor abierto, seleccionar diferentes opciones en el builder
2. Verificar que las 3 columnas siguen funcionando (selection, forced payment, group locking)
3. Click "Iniciar Demo" — la demo debe abrir correctamente con la marca personalizada
