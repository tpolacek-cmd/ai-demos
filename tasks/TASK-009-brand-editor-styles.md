# TASK-009: Estilos CSS del editor de marca

## Metadata

- **id**: TASK-009
- **title**: Estilos para el panel editor de marca
- **status**: done
- **created**: 2026-03-31
- **linked_story**: FASE-7-brand-editor.md
- **type**: styles
- **estimated_hours**: 2
- **depends_on**: TASK-007

## Objetivo

Crear los estilos CSS para el panel editor de marca. El editor debe verse coherente con el resto del builder (misma familia visual), ser responsive, y no afectar los estilos existentes.

## Especificacion Tecnica

### Archivos a Modificar

| Archivo | Accion | Descripcion |
|---------|--------|-------------|
| `css/index-styles.css` | modificar | Agregar seccion de estilos del brand editor al final |

### Diseno Visual

El editor sigue la estetica del builder: fondo blanco, bordes suaves, tipografia system. Es un panel que se abre/cierra con animacion suave.

#### Layout colapsado

```
┌─────────────────────────────────────────────────────────────┐
│ [gear icon]  Personalizar marca  [Modificada]    [chevron v]│
└─────────────────────────────────────────────────────────────┘
```

#### Layout expandido

```
┌─────────────────────────────────────────────────────────────┐
│ [gear icon]  Personalizar marca  [Modificada]    [chevron ^]│
├─────────────────────────────────────────────────────────────┤
│ [Identidad] [Contacto] [Cuenta] [Colores]                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Nombre de la empresa                                       │
│  ┌─────────────────────────────────────────────────┐        │
│  │ SEGIAGUA                                        │        │
│  └─────────────────────────────────────────────────┘        │
│                                                             │
│  Tipo de servicio                                           │
│  ┌─────────────────────────────────────────────────┐        │
│  │ Agua y saneamiento                              │        │
│  └─────────────────────────────────────────────────┘        │
│                                                             │
│  ... mas campos ...                                         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ [Resetear] [Exportar JSON] [Importar JSON]  [Guardar]       │
└─────────────────────────────────────────────────────────────┘
```

### Implementacion CSS

Agregar al final de `css/index-styles.css`, despues de los media queries existentes (o antes del primer `@media`, agrupado logicamente).

#### Seccion: Brand Editor Container

```css
/* ============================================
   Brand Editor
   ============================================ */
.brand-editor {
    margin-bottom: 24px;
    background: white;
    border-radius: 14px;
    border: 1px solid var(--border-color);
    overflow: hidden;
}
```

#### Seccion: Toggle Button

```css
.brand-editor-toggle {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 16px 20px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    text-align: left;
    transition: background-color 0.15s;
}

.brand-editor-toggle:hover {
    background: #f9fafb;
}

.brand-editor-toggle svg:first-child {
    /* Gear icon */
    color: var(--text-secondary);
    flex-shrink: 0;
}

.brand-editor-chevron {
    margin-left: auto;
    color: var(--text-secondary);
    transition: transform 0.2s;
    flex-shrink: 0;
}

.brand-editor.open .brand-editor-chevron {
    transform: rotate(180deg);
}

.brand-editor-badge {
    font-size: 11px;
    font-weight: 500;
    padding: 2px 8px;
    border-radius: 4px;
    background: color-mix(in srgb, var(--primary-color) 15%, white);
    color: var(--primary-color);
}
```

#### Seccion: Body (contenido expandible)

```css
.brand-editor-body {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
    border-top: 0 solid var(--border-color);
}

.brand-editor.open .brand-editor-body {
    max-height: 800px;       /* suficiente para el contenido */
    overflow-y: auto;
    border-top-width: 1px;
}
```

#### Seccion: Tabs

```css
.brand-editor-tabs {
    display: flex;
    gap: 0;
    padding: 0 20px;
    border-bottom: 1px solid var(--border-color);
    background: #fafbfc;
}

.brand-tab {
    padding: 10px 16px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-secondary);
    border-bottom: 2px solid transparent;
    transition: color 0.15s, border-color 0.15s;
    white-space: nowrap;
}

.brand-tab:hover {
    color: var(--text-primary);
}

.brand-tab.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
    font-weight: 600;
}
```

#### Seccion: Tab Content

```css
.brand-tab-content {
    display: none;
    padding: 20px;
}

.brand-tab-content.active {
    display: block;
}
```

#### Seccion: Form Fields

```css
.brand-field {
    margin-bottom: 16px;
}

.brand-field:last-child {
    margin-bottom: 0;
}

.brand-field label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
}

.brand-field input[type="text"],
.brand-field input[type="number"] {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-family: inherit;
    font-size: 14px;
    color: var(--text-primary);
    background: white;
    transition: border-color 0.15s, box-shadow 0.15s;
}

.brand-field input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color) 15%, transparent);
}

/* Row layout para campos lado a lado (montos) */
.brand-field-row {
    display: flex;
    gap: 16px;
}

.brand-field-row .brand-field {
    flex: 1;
}
```

#### Seccion: Color Input Group

```css
.color-input-group {
    display: flex;
    align-items: center;
    gap: 8px;
}

.color-input-group input[type="color"] {
    width: 40px;
    height: 40px;
    padding: 2px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    cursor: pointer;
    background: white;
    flex-shrink: 0;
}

.color-input-group input[type="color"]::-webkit-color-swatch-wrapper {
    padding: 2px;
}

.color-input-group input[type="color"]::-webkit-color-swatch {
    border: none;
    border-radius: 4px;
}

.color-input-group input[type="text"] {
    flex: 1;
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 13px;
}
```

#### Seccion: Action Bar

```css
.brand-editor-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 20px;
    border-top: 1px solid var(--border-color);
    background: #fafbfc;
}

.brand-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: 8px;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.15s, box-shadow 0.15s;
    white-space: nowrap;
    border: none;
}

.brand-btn svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
}

.brand-btn-secondary {
    background: white;
    color: var(--text-primary);
    border: 1px solid var(--border-color);
}

.brand-btn-secondary:hover {
    background: #f3f4f6;
}

.brand-btn-primary {
    background: var(--primary-color);
    color: var(--btn-text-color, white);
    margin-left: auto;
}

.brand-btn-primary:hover {
    box-shadow: 0 2px 8px color-mix(in srgb, var(--primary-color) 40%, transparent);
}
```

#### Seccion: Toast

```css
.brand-toast {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    padding: 10px 20px;
    background: var(--text-primary);
    color: white;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    opacity: 0;
    transition: opacity 0.3s, transform 0.3s;
    z-index: 1000;
    pointer-events: none;
}

.brand-toast.visible {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
}
```

#### Seccion: Responsive

```css
@media (max-width: 768px) {
    .brand-editor-tabs {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
    }

    .brand-editor-actions {
        flex-wrap: wrap;
    }

    .brand-btn-primary {
        margin-left: 0;
        width: 100%;
        justify-content: center;
        margin-top: 4px;
    }

    .brand-field-row {
        flex-direction: column;
        gap: 0;
    }
}

@media (max-width: 480px) {
    .brand-tab {
        padding: 8px 12px;
        font-size: 12px;
    }
}
```

### Notas de diseno

- El panel usa la misma `border-radius: 14px` que las columnas del builder.
- Los inputs usan `border-radius: 8px` consistente con los botones del builder.
- La paleta de grises (#fafbfc, #f3f4f6, #f9fafb) es la misma del builder.
- La transicion del collapse usa `max-height` porque `height: auto` no es animable en CSS puro.
- El badge usa `color-mix` para tomar el color primario con opacidad, igual que las option cards.

## Definition of Done

- [ ] Estilos agregados al final de `css/index-styles.css`
- [ ] Panel colapsado se ve como un boton/barra limpia
- [ ] Panel expandido muestra tabs + campos + acciones
- [ ] Animacion suave de expand/collapse
- [ ] Color pickers se ven bien en Chrome, Firefox y Safari
- [ ] Tabs scroll horizontal en mobile
- [ ] Action bar wrappea correctamente en pantallas chicas
- [ ] Toast de feedback posicionado correctamente
- [ ] No se rompen los estilos del builder existente

## Como Probar

### Test visual: Desktop (>900px)

1. Abrir index.html en Chrome a 1200px de ancho
2. Verificar que el panel colapsado se ve como una barra limpia entre el view-mode-bar y el builder grid
3. Expandir — verificar que los tabs se ven en linea, los campos tienen ancho completo, los botones de accion se alinean en fila
4. Verificar que los color pickers muestran el swatch de color correctamente

### Test visual: Tablet (768-900px)

1. Reducir a 800px
2. Verificar que el builder de columnas paso a vertical (ya existia este responsive)
3. Verificar que el editor sigue viendose bien, tabs legibles, campos de ancho completo

### Test visual: Mobile (<480px)

1. Reducir a 375px (iPhone SE)
2. Verificar que los tabs hacen scroll horizontal si no caben
3. Verificar que los campos monetarios en row se apilan verticalmente
4. Verificar que el boton "Guardar" ocupa el 100% del ancho
5. Verificar que el toast no se corta

### Test de animacion

1. Abrir y cerrar el panel varias veces rapidamente
2. No debe haber glitches de layout ni saltos bruscos
3. El chevron debe rotar suavemente al abrir/cerrar

### Test de no-regresion

1. Verificar que los estilos del builder (columnas, option cards, summary bar) no cambiaron
2. Verificar que los estilos del header y footer no cambiaron
3. Inspeccionar que no hay conflictos de CSS class names con los existentes
