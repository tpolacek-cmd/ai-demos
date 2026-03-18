# TASK-002: Crear js/demo-router.js

## Metadata

- **id**: TASK-002
- **title**: Crear modulo centralizado de routing entre bloques
- **status**: done
- **created**: 2026-03-18
- **linked_story**: FASE-6-demo-builder.md
- **type**: frontend
- **estimated_hours**: 2

## Objetivo

Crear un modulo JS que centralice toda la logica de "dado el bloque actual en el que estoy, a donde redirijo al siguiente". Todas las paginas de demo importaran este modulo en lugar de hardcodear las URLs de redireccion.

## Especificacion Tecnica

### Archivos a Crear

| Archivo | Accion | Descripcion |
|---------|--------|-------------|
| `js/demo-router.js` | crear | Modulo de routing entre bloques de la demo |

### Implementacion

#### 1. Crear `js/demo-router.js`

```javascript
// demo-router.js
// Modulo centralizado de routing entre bloques del demo builder.
// Cada pagina de demo importa este modulo y usa getNextPageUrl()
// en vez de hardcodear la URL del siguiente bloque.
//
// Requiere: config/demo-builder-config.js cargado previamente

// Lee la config guardada por el builder en sessionStorage
function getDemoConfig() {
    try {
        var stored = sessionStorage.getItem('demoConfig');
        return stored ? JSON.parse(stored) : getDefaultDemoConfig();
    } catch(e) {
        return getDefaultDemoConfig();
    }
}

// Guarda la config (usado por el builder en index.html)
function saveDemoConfig(config) {
    sessionStorage.setItem('demoConfig', JSON.stringify(config));
}

// Dado el bloque actual, retorna la URL completa del siguiente bloque
// currentStage: 'arrival' | 'checkout' | 'payment'
function getNextPageUrl(currentStage) {
    var config = getDemoConfig();
    var isEmbedded = new URLSearchParams(window.location.search).get('embedded') === '1';
    var embeddedParam = isEmbedded ? '&embedded=1' : '';
    var baseUrl = window.location.origin + window.location.pathname.replace(/[^/]*$/, '');

    if (currentStage === 'arrival') {
        // Siguiente: checkout
        var checkoutOption = getOptionById('checkout', config.checkout);
        if (!checkoutOption) return 'checkout.html?flow=curp-deeplink' + embeddedParam;
        var flow = checkoutOption.flow || 'curp-deeplink';
        var source = config.arrival === 'qr' ? '&source=qr' : '';
        return checkoutOption.page + '?flow=' + flow + source + embeddedParam;
    }

    if (currentStage === 'checkout') {
        // Siguiente: payment (auth-mobile)
        var paymentOption = getOptionById('payment', config.payment);
        if (!paymentOption) return 'auth-mobile.html?bank=hey-banco&action=pay-domiciliar';
        return 'auth-mobile.html?bank=' + paymentOption.bank 
            + '&action=' + paymentOption.action 
            + embeddedParam
            + '&session=' + Date.now();
    }

    // payment es el ultimo bloque, no hay siguiente
    return null;
}

// Retorna la info del banco seleccionado en el builder para la etapa de pago
// Usado por checkout-core.js para pre-seleccionar el banco
function getSelectedPaymentBank() {
    var config = getDemoConfig();
    var paymentOption = getOptionById('payment', config.payment);
    if (!paymentOption) return null;
    return {
        bank: paymentOption.bank,
        action: paymentOption.action,
    };
}

// Retorna la URL de inicio de la demo (primera pagina del flujo)
// Usado por index.html para el boton "Iniciar Demo"
function getDemoStartUrl(viewMode) {
    var config = getDemoConfig();
    var arrivalOption = getOptionById('arrival', config.arrival);
    if (!arrivalOption) return 'whatsapp.html';

    if (viewMode === 'mobile') {
        if (!arrivalOption.mobileSupported) return null; // no soportado en mobile
        return 'mobile-viewer.html?demo=' + arrivalOption.id;
    }
    return arrivalOption.page;
}
```

### API publica del modulo

| Funcion | Parametros | Retorna | Usado por |
|---------|-----------|---------|-----------|
| `getDemoConfig()` | - | `{ arrival, checkout, payment }` | Cualquier pagina |
| `saveDemoConfig(config)` | objeto config | void | `index.html` builder |
| `getNextPageUrl(currentStage)` | `'arrival'` / `'checkout'` / `'payment'` | URL string o null | Paginas de demo al redirigir |
| `getSelectedPaymentBank()` | - | `{ bank, action }` o null | `checkout-core.js` |
| `getDemoStartUrl(viewMode)` | `'desktop'` / `'mobile'` | URL string o null | `index.html` boton iniciar |

### Dependencias

- `config/demo-builder-config.js` debe estar cargado antes (funciones `getOptionById`, `getDefaultDemoConfig`)

### Como se importa en cada pagina

Agregar en el `<head>` o antes del cierre de `</body>`, **despues** de `demo-builder-config.js`:

```html
<script src="config/demo-builder-config.js"></script>
<script src="js/demo-router.js"></script>
```

## Definition of Done

- [ ] Archivo `js/demo-router.js` creado
- [ ] `getDemoConfig()` lee correctamente de sessionStorage
- [ ] `getNextPageUrl('arrival')` retorna la URL del checkout con flow y source correctos
- [ ] `getNextPageUrl('checkout')` retorna la URL de auth-mobile con bank y action correctos
- [ ] `getSelectedPaymentBank()` retorna el banco configurado
- [ ] `getDemoStartUrl()` retorna la URL correcta para desktop y mobile
- [ ] El modulo funciona si no hay config guardada (usa defaults)
- [ ] Maneja correctamente el parametro `embedded=1`

## Notas

- Este modulo NO cambia el comportamiento de `auth-mobile.html`. Esa pagina sigue leyendo sus params de la URL normalmente.
- El modulo preserva la logica de `embedded=1` que ya existe para el modo mobile.
- Si en el futuro se agregan sub-opciones al checkout (ej: elegir flow), solo hay que modificar `getNextPageUrl('arrival')` para leer el flow de la opcion seleccionada.
