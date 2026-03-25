# Task 3: HTML 9 screens

**Status:** [x] Complete
**Depende de:** Task 2 (CSS debe estar creado)
**Archivo nuevo:** `nubank-impuestos.html`

## Checklist

- [ ] Crear archivo `nubank-impuestos.html` con estructura base
- [ ] Step 0: Face ID login screen
- [ ] Step 1: Home screen con saldo y quick actions
- [ ] Step 2: Pagar screen con 3 opciones
- [ ] Step 3: Pagar servicio (lista de servicios, MODIFICADO)
- [ ] Step 4: Metodo de pago (CURP/RFC, MODIFICADO)
- [ ] Step 5: Input CURP (MODIFICADO)
- [ ] Step 6: Lista de impuestos (NUEVA)
- [ ] Step 7: Confirmacion de pago (NUEVA)
- [ ] Step 8: Pago exitoso (NUEVA)
- [ ] Verificar que todos los onclick apuntan a funciones correctas
- [ ] Verificar que IDs son unicos y consistentes con el JS

## Especificacion

### Estructura base del archivo

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Nubank - Pago de Impuestos</title>
    <link rel="stylesheet" href="css/nubank-impuestos-styles.css">
</head>
<body>
    <div class="nu-container">
        <!-- 9 steps aqui -->
    </div>
    <script src="js/nubank-impuestos-script.js"></script>
</body>
</html>
```

**IMPORTANTE:** Este archivo NO carga `brand-config.js`, `demo-builder-config.js` ni `demo-router.js`. Es completamente autocontenido. Todos los datos son mock hardcodeados.

### Step 0 — Face ID (replicar `reference/nubank-impuestos/1-faceID.png` exacto)

```html
<div class="nu-step nu-faceid" id="nu-step-0">
    <!-- Logo Nu (SVG inline blanco) + icono escudo -->
    <!-- Texto: "Hola, Daniel, por tu seguridad cerramos la sesion cuando hay 5 minutos de inactividad." -->
    <!-- Boton: icono FaceID SVG + "Ingresar con Face ID" onclick="showStep(1)" -->
    <!-- Link: "Ingresar con contrasena" (solo visual) -->
    <!-- Footer: "Nu Mexico Financiera, S.A. de C.V., S.F.P." -->
</div>
```

Logo Nu SVG (simplificado):
```html
<svg viewBox="0 0 80 32" fill="white" width="80" height="32">
    <path d="M7.5 25.5V13.5C7.5 10.5 9.5 8 13 8C16.5 8 18 10.5 18 13.5V25.5H24.5V13C24.5 6.5 20.5 2 14 2C10 2 7.5 4 6 6.5V2.5H0V25.5H7.5Z"/>
    <path d="M38 2.5V14.5C38 17.5 36 20 32.5 20C29 20 27.5 17.5 27.5 14.5V2.5H21V15C21 21.5 25 26 31.5 26C35.5 26 38 24 39.5 21.5V25.5H45.5V2.5H38Z"/>
</svg>
```

Icono Face ID SVG:
```html
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
    <path d="M7 3H5a2 2 0 00-2 2v2M17 3h2a2 2 0 012 2v2M7 21H5a2 2 0 01-2-2v-2M17 21h2a2 2 0 002-2v-2"/>
    <circle cx="9" cy="10" r="0.5" fill="currentColor"/>
    <circle cx="15" cy="10" r="0.5" fill="currentColor"/>
    <path d="M12 10v3.5c0 .5-.5 1-1 1"/>
    <path d="M8.5 16c1 1.5 5.5 1.5 7 0"/>
</svg>
```

### Step 1 — Home (replicar `reference/nubank-impuestos/2-home.png` exacto)

```html
<div class="nu-step nu-home" id="nu-step-1">
    <!-- Scrollable content wrapper -->
    <div class="nu-home__scroll">
        <!-- Header: "Hola, Daniel" + icono persona + icono ojo -->
        <!-- Seccion cuenta -->
        <div class="nu-home__section">
            <span class="nu-home__label">Cuenta No</span>
            <span class="nu-home__balance">$29,645.96</span>
        </div>
        <!-- Quick actions (horizontal scrollable) -->
        <div class="nu-home__actions">
            <div class="nu-home__action">icono + "Movimientos"</div>
            <div class="nu-home__action">icono + "Transferir"</div>
            <div class="nu-home__action">icono + "Depositar"</div>
            <div class="nu-home__action">icono + "Tarjetas"</div>
            <div class="nu-home__action" onclick="showStep(2)">icono + "Pagar Servicios"</div>
        </div>
        <!-- Divider grueso -->
        <!-- Tarjeta de credito -->
        <div class="nu-home__section">
            <span class="nu-home__section-title">Tarjeta de credito</span>
            <span class="nu-home__label">Saldo</span>
            <span class="nu-home__cc-balance">$23,363.36</span>
            <span class="nu-home__cc-detail">Cierre de Junio 28, 2025</span>
        </div>
        <!-- Otras compras -->
        <!-- Footer con nombre y fecha socio -->
    </div>
</div>
```

Los quick actions deben tener iconos SVG inline. "Pagar Servicios" es el unico clickeable (lleva a step 2).

### Step 2 — Pagar (replicar `reference/nubank-impuestos/3-pagar.png` exacto)

```html
<div class="nu-step nu-pagar" id="nu-step-2">
    <button class="nu-close-btn" onclick="showStep(1)">&times;</button>
    <h1 class="nu-pagar__title">Pagar</h1>
    <div class="nu-pagar__options">
        <div class="nu-pagar__option" onclick="showStep(3)">
            <!-- Icono documento con lineas (SVG) -->
            <span>Nuevo servicio</span>
        </div>
        <div class="nu-pagar__option">
            <!-- Icono celular (SVG) -->
            <span>Recarga de celular</span>
        </div>
        <div class="nu-pagar__option">
            <!-- Icono regalo (SVG) + badge "Nuevo" -->
            <span>Tarjeta de regalo</span>
        </div>
    </div>
    <p class="nu-pagar__desc">Paga y guarda tus servicios sin costo. Asi puedes revisar cuando tienes pagos pendientes.</p>
    <div class="nu-pagar__search">
        <span>Buscar mas servicios</span>
        <!-- Icono lupa -->
    </div>
</div>
```

### Step 3 — Pagar Servicio (basado en `reference/nubank-impuestos/4-servicios.png`, MODIFICADO)

```html
<div class="nu-step nu-servicios" id="nu-step-3">
    <div class="nu-header">
        <button class="nu-back-btn" onclick="showStep(2)"><!-- flecha SVG --></button>
        <span class="nu-header__title">Pagar servicio</span>
    </div>
    <div class="nu-servicios__scroll">
        <!-- Search bar -->
        <div class="nu-search-bar">
            <!-- icono lupa --> <span>Buscar</span>
        </div>
        <!-- Mas populares -->
        <div class="nu-servicios__section-label">Mas populares</div>
        <div class="nu-servicios__item">
            <!-- Totalplay: icono + texto + flecha -->
        </div>
        <div class="nu-servicios__item">
            <!-- izzi: icono + texto + flecha -->
        </div>
        <div class="nu-servicios__item">
            <!-- CFE: icono + texto + flecha -->
        </div>
        <div class="nu-servicios__item">
            <!-- Telmex: icono + texto + flecha -->
        </div>
        <div class="nu-servicios__item nu-servicios__item--clickable" onclick="showStep(4)">
            <!-- Estado [Nombre de Estado]: icono gobierno SVG + texto + flecha -->
        </div>
        <!-- Por categoria -->
        <div class="nu-servicios__section-label">Por categoria</div>
        <div class="nu-servicios__category"><!-- Luz --></div>
        <div class="nu-servicios__category"><!-- Internet --></div>
        <div class="nu-servicios__category"><!-- Agua --></div>
        <div class="nu-servicios__category"><!-- Telefonia --></div>
    </div>
</div>
```

Iconos para servicios: usar texto estilizado en circulo o SVG simple para Totalplay/izzi/CFE/Telmex (no tenemos los logos reales, simular con iniciales o iconos genericos).

El item "Estado [Nombre de Estado]" usa un icono SVG de edificio con columnas (gobierno):
```html
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
    <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M9 9h.01M15 9h.01M9 13h.01M15 13h.01"/>
</svg>
```

### Step 4 — Metodo (basado en `reference/nubank-impuestos/5-metodo.png`, MODIFICADO)

```html
<div class="nu-step nu-metodo" id="nu-step-4">
    <div class="nu-header">
        <button class="nu-back-btn" onclick="showStep(3)"><!-- flecha --></button>
        <span class="nu-header__title">Como quieres enviar tu pago?</span>
    </div>
    <div class="nu-metodo__list">
        <div class="nu-metodo__item" onclick="showStep(5)">
            <div>
                <strong>CURP</strong>
                <span>Pago por ingreso manual</span>
            </div>
            <!-- flecha chevron -->
        </div>
        <div class="nu-metodo__item">
            <div>
                <strong>RFC</strong>
                <span>Pago por RFC</span>
            </div>
            <!-- flecha chevron -->
        </div>
    </div>
</div>
```

### Step 5 — CURP Input (basado en `reference/nubank-impuestos/6-curp.png`, MODIFICADO)

```html
<div class="nu-step nu-curp-input" id="nu-step-5">
    <button class="nu-close-btn" onclick="showStep(4)">&times;</button>
    <!-- Progress bar: 2 segmentos -->
    <div class="nu-progress">
        <div class="nu-progress__bar nu-progress__bar--active"></div>
        <div class="nu-progress__bar"></div>
    </div>
    <h2 class="nu-curp-input__title">Estado [Nombre de Estado]</h2>
    <label class="nu-curp-input__label">CURP</label>
    <input type="text" id="nu-curp-field" class="nu-curp-input__field" placeholder="" autocomplete="off" maxlength="18">
    <!-- Boton circular submit abajo derecha -->
    <button class="nu-submit-circle" id="nu-submit-btn" onclick="submitCurp()">
        <!-- SVG flecha derecha -->
    </button>
</div>
```

### Step 6 — Lista de Impuestos (NUEVA)

```html
<div class="nu-step nu-impuestos-lista" id="nu-step-6">
    <div class="nu-header">
        <button class="nu-back-btn" onclick="showStep(5)"><!-- flecha --></button>
        <span class="nu-header__title">Obligaciones fiscales</span>
    </div>
    <div class="nu-impuestos-lista__scroll">
        <div class="nu-impuestos-lista__curp" id="nu-tax-curp">CURP: BEMD850101HDFRNN09</div>
        <!-- Tax card 0 -->
        <div class="nu-tax-card" id="nu-tax-0" onclick="toggleTax(0)">
            <div class="nu-tax-card__check" id="nu-tax-check-0"></div>
            <div class="nu-tax-card__info">
                <span class="nu-tax-card__name">Impuesto sobre tenencia vehicular (revalidacion de placas)</span>
            </div>
            <span class="nu-tax-card__amount">$1,000.00</span>
        </div>
        <!-- Tax card 1 -->
        <div class="nu-tax-card" id="nu-tax-1" onclick="toggleTax(1)">
            <div class="nu-tax-card__check" id="nu-tax-check-1"></div>
            <div class="nu-tax-card__info">
                <span class="nu-tax-card__name">Impuesto sobre hospedaje</span>
            </div>
            <span class="nu-tax-card__amount">$1,800.00</span>
        </div>
        <!-- Tax card 2 -->
        <div class="nu-tax-card" id="nu-tax-2" onclick="toggleTax(2)">
            <div class="nu-tax-card__check" id="nu-tax-check-2"></div>
            <div class="nu-tax-card__info">
                <span class="nu-tax-card__name">Impuesto predial</span>
            </div>
            <span class="nu-tax-card__amount">$1,000.00</span>
        </div>
        <!-- Total -->
        <div class="nu-impuestos-lista__total">
            <span>Total</span>
            <span id="nu-tax-total">$3,800.00</span>
        </div>
    </div>
    <!-- Boton Pagar todos -->
    <div class="nu-impuestos-lista__footer">
        <button class="nu-btn-primary" onclick="payAll()">Pagar todos</button>
    </div>
</div>
```

### Step 7 — Confirmacion (NUEVA)

```html
<div class="nu-step nu-confirmacion" id="nu-step-7">
    <div class="nu-header">
        <button class="nu-back-btn" onclick="showStep(6)"><!-- flecha --></button>
        <span class="nu-header__title">Confirmar pago</span>
    </div>
    <div class="nu-confirmacion__scroll">
        <div class="nu-confirmacion__card">
            <div class="nu-confirmacion__row">
                <span class="nu-confirmacion__label">Servicio</span>
                <span class="nu-confirmacion__value">Estado [Nombre de Estado]</span>
            </div>
            <div class="nu-confirmacion__row">
                <span class="nu-confirmacion__label">CURP</span>
                <span class="nu-confirmacion__value" id="nu-confirm-curp">BEMD850101HDFRNN09</span>
            </div>
            <div class="nu-confirmacion__divider"></div>
            <!-- Items de impuestos (se actualizan por JS segun seleccion) -->
            <div class="nu-confirmacion__row" id="nu-confirm-tax-0">
                <span>Tenencia vehicular</span>
                <span>$1,000.00</span>
            </div>
            <div class="nu-confirmacion__row" id="nu-confirm-tax-1">
                <span>Hospedaje</span>
                <span>$1,800.00</span>
            </div>
            <div class="nu-confirmacion__row" id="nu-confirm-tax-2">
                <span>Predial</span>
                <span>$1,000.00</span>
            </div>
            <div class="nu-confirmacion__divider"></div>
            <div class="nu-confirmacion__row nu-confirmacion__row--total">
                <span>Total</span>
                <span id="nu-confirm-total">$3,800.00</span>
            </div>
        </div>
        <div class="nu-confirmacion__info">
            <div class="nu-confirmacion__row">
                <span>Vencimiento</span>
                <span>31 de marzo 2026</span>
            </div>
            <div class="nu-confirmacion__row">
                <span>Metodo de pago</span>
                <span>Cuenta Nu **** 4829</span>
            </div>
        </div>
    </div>
    <div class="nu-confirmacion__footer">
        <button class="nu-btn-primary" id="nu-confirm-btn" onclick="confirmPayment()">
            Pagar <span id="nu-confirm-btn-amount">$3,800.00</span>
        </button>
    </div>
</div>
```

### Step 8 — Exito (NUEVA)

```html
<div class="nu-step nu-exito" id="nu-step-8">
    <div class="nu-exito__content">
        <!-- Check circle -->
        <div class="nu-exito__check">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M5 12l5 5L19 7" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>
        <h2 class="nu-exito__title">Pago exitoso</h2>
        <span class="nu-exito__amount">$3,800.00</span>
        <!-- Card detalles -->
        <div class="nu-exito__details">
            <div class="nu-exito__row">
                <span>Fecha y hora</span>
                <span id="nu-exito-datetime">--</span>
            </div>
            <div class="nu-exito__row">
                <span>Folio de operacion</span>
                <span id="nu-exito-folio">--</span>
            </div>
            <div class="nu-exito__row">
                <span>Concepto</span>
                <span>Impuestos estatales</span>
            </div>
            <div class="nu-exito__row">
                <span>CURP</span>
                <span id="nu-exito-curp">BEMD850101HDFRNN09</span>
            </div>
            <div class="nu-exito__row">
                <span>Origen</span>
                <span>Cuenta Nu **** 4829</span>
            </div>
        </div>
        <!-- Botones -->
        <button class="nu-btn-outlined">Compartir comprobante</button>
        <button class="nu-link" onclick="showStep(0)">Volver al inicio</button>
    </div>
</div>
```

### Notas

- Todos los SVG icons deben ser inline (no archivos externos) para simplicidad.
- El logo Nubank (nu.jpeg) en `assets/banks/` NO se usa en el HTML — se usa SVG inline blanco para el logo dentro de la app.
- Los datos son 100% mock: montos, nombres, CURP, etc.
- Los elementos con IDs que empiezan con `nu-` son los que el JS manipula.
- El texto literal `[Nombre de Estado]` incluye los corchetes — es asi intencionalmente.
