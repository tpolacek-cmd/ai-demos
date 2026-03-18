# TASK-004: Actualizar css/index-styles.css para el builder

## Metadata

- **id**: TASK-004
- **title**: Estilos CSS para el layout de builder de 3 columnas
- **status**: done
- **created**: 2026-03-18
- **linked_story**: FASE-6-demo-builder.md
- **type**: frontend
- **estimated_hours**: 3

## Objetivo

Actualizar `css/index-styles.css` para soportar el nuevo layout de builder de 3 columnas, reemplazando los estilos del grid de cards actual.

## Especificacion Tecnica

### Archivos a Modificar

| Archivo | Accion | Descripcion |
|---------|--------|-------------|
| `css/index-styles.css` | modificar | Reemplazar estilos de grid de cards por builder de 3 columnas |

### Componentes CSS nuevos

#### 1. `.builder-grid` — Grid de 3 columnas

```css
.builder-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    padding: 0 2rem;
}

/* Responsive: stack vertical en pantallas chicas */
@media (max-width: 900px) {
    .builder-grid {
        grid-template-columns: 1fr;
    }
}
```

#### 2. `.builder-column` — Columna de una etapa

```css
.builder-column {
    background: #fff;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
```

#### 3. `.stage-header` — Header de cada etapa

```css
.stage-header {
    /* Numero de paso, titulo, descripcion */
}

.stage-number {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--brand-primary);
    font-weight: 600;
}
```

#### 4. `.option-card` — Card de opcion seleccionable

```css
.option-card {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 10px;
    cursor: pointer;
    transition: border-color 0.2s, background-color 0.2s;
}

.option-card:hover {
    border-color: var(--brand-primary);
    background: color-mix(in srgb, var(--brand-primary) 5%, white);
}

.option-card.selected {
    border-color: var(--brand-primary);
    background: color-mix(in srgb, var(--brand-primary) 8%, white);
}

.option-card input[type="radio"] {
    display: none; /* oculto, la card entera es clickeable */
}

.option-check {
    margin-left: auto;
    opacity: 0;
    color: var(--brand-primary);
    font-weight: bold;
    transition: opacity 0.2s;
}

.option-card.selected .option-check {
    opacity: 1;
}

/* Estado disabled (mobile no soportado) */
.option-card.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    border-color: #e5e7eb;
}

.option-card.disabled:hover {
    border-color: #e5e7eb;
    background: transparent;
}
```

#### 5. `.builder-summary` — Barra de resumen + boton

```css
.builder-summary {
    margin: 2rem;
    padding: 1.5rem 2rem;
    background: #f8f9fa;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
}

.summary-flow {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.95rem;
    color: #374151;
}

.summary-arrow {
    color: var(--brand-primary);
    font-weight: bold;
}

.btn-start {
    background: var(--brand-primary);
    color: var(--brand-btn-text, #1a1a2e);
    border: none;
    padding: 0.875rem 2rem;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
    white-space: nowrap;
}

.btn-start:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.btn-start:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}
```

### Estilos a eliminar

Los siguientes estilos del grid de cards actual se eliminan o reemplazan:

- `.demos-grid` — reemplazado por `.builder-grid`
- `.demo-card` — reemplazado por `.option-card`
- `.card-banner`, `.card-banner-bg`, `.card-banner-icon` — eliminados (ya no hay banners grandes)
- `.card-body`, `.card-footer`, `.card-tag`, `.card-arrow` — eliminados
- `.card-disabled` — reemplazado por `.option-card.disabled`
- `.banner-whatsapp`, `.banner-qr` — eliminados

### Estilos que se mantienen

- `.header` — sin cambios
- `.view-mode-bar`, `.view-mode-toggle`, `.view-mode-btn` — sin cambios
- `.footer` — sin cambios
- Variables CSS — sin cambios (siguen viniendo de `variables.css`)

### Dependencias

- TASK-003 (`index.html` define las clases CSS que se estilan aqui)

## Definition of Done

- [ ] Layout de 3 columnas funciona en pantallas >= 900px
- [ ] Stack vertical en pantallas < 900px
- [ ] Option cards tienen estados: default, hover, selected, disabled
- [ ] Check visual aparece solo en la opcion seleccionada
- [ ] Barra de resumen muestra el flujo con flechas entre opciones
- [ ] Boton "Iniciar Demo" tiene estilos con colores de marca
- [ ] No quedan estilos huerfanos del grid de cards anterior
- [ ] Se usan CSS custom properties para colores de marca (no hardcoded)

## Notas

- Usar `color-mix()` para backgrounds sutiles (ya se usa en el proyecto).
- El boton usa `--brand-btn-text` para el color del texto, que ya esta definido en `variables.css`.
- Mantener la misma estetica general del proyecto (border-radius: 12px, sombras sutiles, tipografia limpia).
