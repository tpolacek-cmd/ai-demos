# TASK-003: Reescribir index.html como builder de 3 columnas

## Metadata

- **id**: TASK-003
- **title**: Reescribir index.html como demo builder visual
- **status**: done
- **created**: 2026-03-18
- **linked_story**: FASE-6-demo-builder.md
- **type**: frontend
- **estimated_hours**: 4

## Objetivo

Reescribir `index.html` para que en lugar de mostrar un grid de cards de demos, muestre un builder visual de 3 columnas donde el usuario selecciona una opcion por etapa y lanza la demo combinada.

## Especificacion Tecnica

### Archivos a Modificar

| Archivo | Accion | Descripcion |
|---------|--------|-------------|
| `index.html` | reescribir | De listado de demos a builder de 3 columnas |

### Layout objetivo

```
+---------------------------------------------------------------------+
|  [Logo] Demo Portal de Pagos                     [Desktop | Mobile] |
+---------------------------------------------------------------------+
|                                                                     |
|  PASO 1                  PASO 2                 PASO 3              |
|  Canal de llegada        Portal de pago         Flujo de pago       |
|  "Como llega el..."      "Experiencia de..."    "Metodo de pago..." |
|                                                                     |
|  +------------------+   +------------------+   +------------------+ |
|  | (*) WhatsApp     |   | (*) Portal       |   | (*) Hey Banco    | |
|  |  Chat interac... |   |     Estandar     |   |  Pago y domic... | |
|  |                  |   |  Checkout con... |   |                  | |
|  | ( ) QR Factura   |   |                  |   |                  | |
|  |  Factura PDF...  |   |                  |   |                  | |
|  +------------------+   +------------------+   +------------------+ |
|                                                                     |
|  +---------------------------------------------------------------+  |
|  |  WhatsApp  -->  Portal Estandar  -->  Hey Banco               |  |
|  |                                                               |  |
|  |                  [ > Iniciar Demo ]                           |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
+---------------------------------------------------------------------+
|  Demo de portal de pagos Totalplay - Solo para fines de presentacion|
+---------------------------------------------------------------------+
```

### Implementacion

#### 1. Estructura HTML

```html
<main class="main">
    <!-- Toggle Desktop/Mobile (se mantiene) -->
    <div class="view-mode-bar">...</div>
    
    <!-- Builder de 3 columnas -->
    <div class="builder-grid">
        <!-- Se genera dinamicamente desde DEMO_STAGES -->
    </div>
    
    <!-- Barra de resumen + boton iniciar -->
    <div class="builder-summary">
        <div class="summary-flow">
            <!-- Ej: WhatsApp --> Portal Estandar --> Hey Banco -->
        </div>
        <button id="startDemo" class="btn-start">Iniciar Demo</button>
    </div>
</main>
```

#### 2. Generacion dinamica de columnas

El JS itera `DEMO_STAGES` y genera una columna por etapa:

```javascript
DEMO_STAGES.forEach(function(stage, index) {
    // Crear columna
    var column = document.createElement('div');
    column.className = 'builder-column';
    
    // Header de la etapa
    column.innerHTML = `
        <div class="stage-header">
            <span class="stage-number">Paso ${index + 1}</span>
            <h3>${stage.label}</h3>
            <p>${stage.description}</p>
        </div>
    `;
    
    // Opciones como radio cards
    stage.options.forEach(function(option, optIndex) {
        var isDefault = optIndex === 0;
        var card = document.createElement('label');
        card.className = 'option-card' + (isDefault ? ' selected' : '');
        card.innerHTML = `
            <input type="radio" name="stage-${stage.id}" value="${option.id}" ${isDefault ? 'checked' : ''}>
            <div class="option-icon">${option.icon}</div>
            <div class="option-info">
                <strong>${option.name}</strong>
                <span>${option.description}</span>
            </div>
            <span class="option-check">✓</span>
        `;
        column.appendChild(card);
    });
    
    builderGrid.appendChild(column);
});
```

#### 3. Logica de seleccion

- Cada opcion es un `<label>` con un `<input type="radio">` agrupado por etapa
- Al cambiar seleccion: actualizar clase `.selected`, actualizar resumen, guardar config
- Primera opcion de cada etapa: pre-seleccionada por default

#### 4. Barra de resumen

Muestra el flujo armado: `"WhatsApp → Portal Estandar → Hey Banco"`

Se actualiza dinamicamente cuando cambia cualquier seleccion.

#### 5. Boton "Iniciar Demo"

```javascript
document.getElementById('startDemo').addEventListener('click', function() {
    // Leer selecciones
    var config = {};
    DEMO_STAGES.forEach(function(stage) {
        var selected = document.querySelector('input[name="stage-' + stage.id + '"]:checked');
        config[stage.id] = selected ? selected.value : stage.options[0].id;
    });
    
    // Guardar config
    saveDemoConfig(config);
    
    // Navegar a la primera pagina
    var viewMode = sessionStorage.getItem('viewMode') || 'desktop';
    var startUrl = getDemoStartUrl(viewMode);
    
    if (!startUrl) {
        alert('Esta combinacion no esta disponible en modo mobile');
        return;
    }
    
    window.location.href = startUrl;
});
```

#### 6. Interaccion con toggle Desktop/Mobile

- Se mantiene el toggle existente
- Cuando esta en modo Mobile y el canal de llegada seleccionado no soporta mobile (`mobileSupported: false`), mostrar un aviso visual en la opcion y deshabilitar el boton o forzar cambio a una opcion compatible.

### Scripts a cargar

```html
<script src="config/brand-config.js"></script>
<script src="config/demo-builder-config.js"></script>
<script src="js/demo-router.js"></script>
```

Ya NO necesita cargar `config/demos-config.js` (reemplazado por `demo-builder-config.js`).

### Dependencias

- TASK-001 (`config/demo-builder-config.js` debe existir)
- TASK-002 (`js/demo-router.js` debe existir — para `saveDemoConfig` y `getDemoStartUrl`)

## Definition of Done

- [ ] `index.html` muestra builder de 3 columnas
- [ ] Cada etapa muestra sus opciones como radio cards seleccionables
- [ ] Primera opcion de cada etapa viene pre-seleccionada
- [ ] Etapas con una sola opcion se muestran con check visual (no grayed out)
- [ ] Barra de resumen muestra el flujo seleccionado con flechas
- [ ] Boton "Iniciar Demo" guarda config en sessionStorage y navega correctamente
- [ ] Toggle Desktop/Mobile funciona y afecta opciones no disponibles en mobile
- [ ] Brand data se aplica correctamente (logo, nombre, colores)
- [ ] Footer se mantiene

## Notas

- Los SVG de los iconos de WhatsApp y QR se pueden reutilizar del `index.html` actual (lineas 50-52 y 72-84).
- La estructura debe ser responsive: en pantallas chicas las 3 columnas pasan a stack vertical.
- Mantener `data-brand` bindings para nombre de marca.
