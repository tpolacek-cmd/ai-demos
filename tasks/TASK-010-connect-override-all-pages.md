# TASK-010: Conectar brand-override.js a todas las paginas

## Metadata

- **id**: TASK-010
- **title**: Agregar brand-override.js a todos los HTML de la demo
- **status**: done
- **created**: 2026-03-31
- **linked_story**: FASE-7-brand-editor.md
- **type**: integration
- **estimated_hours**: 1.5
- **depends_on**: TASK-007, TASK-008

## Objetivo

Agregar `<script src="js/brand-override.js"></script>` a todas las paginas HTML que usan el sistema de branding (todas excepto `nubank-impuestos.html`). Esto garantiza que los overrides de marca guardados desde el editor en index.html se apliquen en todas las paginas de la demo.

## Especificacion Tecnica

### Archivos a Modificar

| Archivo | Accion | Descripcion |
|---------|--------|-------------|
| `checkout.html` | modificar | Agregar script brand-override.js |
| `checkout-bbva.html` | modificar | Agregar script brand-override.js |
| `auth-mobile.html` | modificar | Agregar script brand-override.js |
| `whatsapp.html` | modificar | Agregar script brand-override.js |
| `qr.html` | modificar | Agregar script brand-override.js |
| `mobile-viewer.html` | modificar | Agregar script brand-override.js |
| `video-player.html` | modificar | Agregar script brand-override.js |

### NO Modificar

| Archivo | Razon |
|---------|-------|
| `nubank-impuestos.html` | No usa el sistema de branding centralizado |
| `index.html` | Ya incluido en TASK-008 |

### Implementacion

#### Donde insertar el script

En cada archivo HTML, agregar la linea **inmediatamente despues** de `brand-config.js` y **antes** de cualquier otro script que use `BRAND.*`:

```html
<!-- Ejemplo: checkout.html -->
<script src="config/brand-config.js"></script>
<script src="js/brand-override.js"></script>   <!-- AGREGAR ESTA LINEA -->
<script src="config/banks-config.js"></script>
<!-- ... resto de scripts ... -->
```

#### Orden de carga critico

```
1. brand-config.js      → Define BRAND con valores default
2. brand-override.js    → Lee localStorage, mergea overrides sobre BRAND
3. [otros scripts]      → Usan BRAND.* ya parcheado
4. DOMContentLoaded     → applyBrandColors() sincroniza CSS vars
5. Inline scripts       → Usan BRAND.* para poblar contenido
```

El script `brand-override.js` se auto-ejecuta (IIFE), por lo que no requiere esperar a DOMContentLoaded. Esto es crucial porque algunos scripts inline en las paginas usan `BRAND.*` antes de DOMContentLoaded.

### Paginas y sus scripts actuales (referencia)

#### checkout.html
```html
<script src="config/brand-config.js"></script>
<!-- INSERT HERE -->
<script src="config/banks-config.js"></script>
<script src="js/checkout-core.js"></script>
...
```

#### checkout-bbva.html
```html
<script src="config/brand-config.js"></script>
<!-- INSERT HERE -->
<script src="config/banks-config.js"></script>
...
```

#### auth-mobile.html
```html
<script src="config/brand-config.js"></script>
<!-- INSERT HERE -->
<script src="config/banks-config.js"></script>
...
```

#### whatsapp.html
```html
<script src="config/brand-config.js"></script>
<!-- INSERT HERE -->
...
```

#### qr.html
```html
<script src="config/brand-config.js"></script>
<!-- INSERT HERE -->
...
```

#### mobile-viewer.html
```html
<script src="config/brand-config.js"></script>
<!-- INSERT HERE -->
<script src="config/demo-builder-config.js"></script>
...
```

#### video-player.html
```html
<script src="config/brand-config.js"></script>
<!-- INSERT HERE -->
...
```

### Indicador visual de marca personalizada (opcional pero recomendado)

Agregar un indicador sutil en las paginas de demo para que el presentador sepa que esta usando una marca personalizada (no la default):

En cada pagina, agregar despues de `brand-override.js`:

```html
<script>
    if (typeof BrandOverride !== 'undefined' && BrandOverride.has()) {
        document.documentElement.setAttribute('data-brand-custom', 'true');
    }
</script>
```

Y en `config/variables.css`, agregar una regla minima:

```css
/* Indicador sutil de marca personalizada */
[data-brand-custom="true"] body::after {
    content: 'Marca personalizada';
    position: fixed;
    bottom: 8px;
    right: 8px;
    font-size: 10px;
    padding: 2px 6px;
    background: rgba(0,0,0,0.5);
    color: white;
    border-radius: 4px;
    z-index: 9999;
    pointer-events: none;
    opacity: 0.6;
}
```

Esto da feedback visual sin interferir con la demo. El presentador puede verlo en la esquina inferior derecha.

## Definition of Done

- [ ] `brand-override.js` agregado a los 7 archivos HTML listados
- [ ] El script esta en la posicion correcta (despues de brand-config.js, antes de otros scripts)
- [ ] Las demos funcionan correctamente sin overrides (comportamiento identico al actual)
- [ ] Las demos reflejan overrides cuando hay datos en localStorage
- [ ] No se modifico nubank-impuestos.html
- [ ] Indicador visual "Marca personalizada" visible en paginas de demo cuando hay overrides

## Como Probar

### Test 1: Sin overrides (no-regresion)

1. Limpiar localStorage: `localStorage.removeItem('brandOverrides')`
2. Abrir cada una de las 7 paginas directamente por URL:
   - `http://localhost:8080/checkout.html?flow=curp-deeplink`
   - `http://localhost:8080/checkout-bbva.html`
   - `http://localhost:8080/auth-mobile.html?bank=hey-banco&action=pay-domiciliar`
   - `http://localhost:8080/whatsapp.html`
   - `http://localhost:8080/qr.html`
   - `http://localhost:8080/mobile-viewer.html?demo=whatsapp`
   - `http://localhost:8080/video-player.html`
3. Verificar que cada pagina se ve exactamente igual que antes
4. Verificar que no hay errores en la consola
5. Verificar que el indicador "Marca personalizada" NO aparece

### Test 2: Con overrides

1. Guardar overrides desde consola:
   ```javascript
   localStorage.setItem('brandOverrides', JSON.stringify({
       name: 'TEST Corp',
       fullName: 'TEST Corporation',
       serviceType: 'Electricidad',
       colors: { primary: '#E74C3C', headerBg: '#1A1A2E' },
       account: { totalAmount: 999.99 }
   }))
   ```
2. Abrir cada pagina y verificar:
   - **checkout.html**: nombre "TEST Corp" en header, color rojo, monto $999.99
   - **whatsapp.html**: nombre "TEST Corporation" en chat, color rojo en links
   - **auth-mobile.html**: nombre "TEST Corp" en la pantalla de confirmacion
   - **qr.html**: nombre "TEST Corp" en el visor de factura
3. Verificar que el indicador "Marca personalizada" aparece en la esquina

### Test 3: Flujo completo desde el editor

1. Abrir index.html
2. Expandir el editor, cambiar nombre a "Demo Corp" y color primario a verde (#27AE60)
3. Guardar cambios
4. Seleccionar WhatsApp > Portal Estandar > Hey Banco
5. Click "Iniciar Demo"
6. Verificar que WhatsApp muestra "Demo Corp" con verde
7. Navegar al checkout — verificar que sigue con "Demo Corp" y verde
8. Navegar al auth — verificar consistencia

### Test 4: Nubank no afectado

1. Con overrides activos, abrir `nubank-impuestos.html`
2. Verificar que NO tiene brand-override.js (no debe haber `BrandOverride` en window)
3. Verificar que la demo Nubank se ve igual que siempre (purple theme propio)

### Test de orden de scripts

1. En la consola de cualquier pagina, verificar:
   ```javascript
   typeof BrandOverride !== 'undefined'  // → true
   typeof BRAND !== 'undefined'          // → true
   typeof BANKS !== 'undefined'          // → true (en paginas que lo cargan)
   ```
2. Verificar que no hay errores de "BRAND is not defined" en consola (lo que indicaria que brand-override.js se cargo antes de brand-config.js)
