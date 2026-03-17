# Fase 4: Split de script.js en Modulos

**Prioridad:** Media
**Estado:** Completada
**Dependencias:** Fase 1 y 2 completadas (brand-config.js y banks-config.js deben existir)
**Impacto:** Reduce complejidad por archivo, facilita modificacion de flujos individuales

---

## Objetivo

Dividir `js/script.js` (1,945 lineas) en modulos logicos por flujo de pago. Cada modulo es un archivo JS independiente dentro de `js/` que se carga en `checkout.html`.

---

## Analisis del archivo actual

`script.js` contiene las siguientes secciones (identificadas por comentarios `// ====`):

| Seccion | Lineas aprox | Responsabilidad |
|---|---|---|
| URL params + flow init | 1-30 | Lectura de query params, inicializacion |
| Bank names, logos, configs | 31-120 | **Movido a banks-config.js en Fase 2** |
| Payment method selection | 121-280 | Seleccion de metodo de pago, UI de opciones |
| Inline bank selection | 281-457 | Seleccion de banco inline, deep links, animaciones |
| Identity validation (CURP/RFC/CLABE) | 458-780 | Modal de CURP, validacion regex, envio |
| TAPI QR Flow | 781-1330 | Modal QR de TAPI, generacion QR, countdown, simulacion scan |
| Push Notification Flow | 1335-1486 | Modal push, envio push, apertura app |
| Account to Account Flow | 1488-1847 | Modal CLABE, verificacion, confirmacion final |
| Phone Mockup Simulation | 1893-1945 | Overlay de phone, iframe, postMessage |

---

## Paso 1: Crear `checkout-core.js`

Contenido: secciones de URL params, payment method selection, e inline bank selection.

```
Lineas originales: ~1-280 (sin las definiciones de bancos que ya estan en banks-config.js)
Responsabilidades:
- Lectura de URL params (flow, bank, action)
- selectedMethod tracking
- selectMethod(), deselectMethod()
- Inline bank selection UI
- Deep link handling
- closeModal(), selectPaymentOption()
- Event listeners de opciones de pago
```

Variables globales que expone: `selectedMethod`, `selectedBank`, `currentFlow`.

---

## Paso 2: Crear `identity-validation.js`

Contenido: toda la logica de validacion de identidad (CURP/RFC/CLABE).

```
Lineas originales: ~458-780
Responsabilidades:
- Regex patterns (curpRegex, rfcRegex, clabeRegex)
- bankIdentityRequirements (ahora viene de banks-config.js)
- INLINE identity validation (dentro del checkout)
- CURP modal (show, close, validate, submit)
- configureIdentityModal() para ajustar labels segun tipo
- TyC checkbox handling
```

Variables globales que consume: `selectedMethod`, `selectedBank` (de checkout-core.js), `BANKS` (de banks-config.js), `BRAND` (de brand-config.js).

---

## Paso 3: Crear `qr-checkout-flow.js`

Contenido: todo el flujo de QR de TAPI dentro del checkout.

```
Lineas originales: ~781-1330
Responsabilidades:
- TAPI QR modal (show, close)
- QR code generation
- Countdown timer (2 minutos)
- QR expiration handling
- simulateQRScan() desde el checkout
```

**NOTA:** No confundir con `qr-script.js` que es el viewer de la factura PDF. Este archivo es el flujo QR que aparece dentro del checkout cuando seleccionas un banco en el modo "sin pedido de dato".

Variables globales que consume: `selectedMethod`, `selectedBank`, `BRAND`.

---

## Paso 4: Crear `push-flow.js`

Contenido: flujo de notificacion push.

```
Lineas originales: ~1335-1486
Responsabilidades:
- showCurpModalForPush()
- validateAndSendPush()
- showPushSentMessage()
- openBankAppWithPush()
```

Variables globales que consume: `selectedMethod`, `BANKS`, `BRAND`.

---

## Paso 5: Crear `account-to-account.js`

Contenido: flujo Account to Account (CLABE + verificacion).

```
Lineas originales: ~1488-1847
Responsabilidades:
- CLABE modal (show, close, validate)
- Verification code modal (show, close, verify)
- Final confirmation modal (show, close, confirm)
- confirmDomiciliation() para A2A
```

Variables globales que consume: `selectedMethod`, `BANKS`, `BRAND`.

---

## Paso 6: Crear `phone-mockup.js`

Contenido: overlay de phone mockup para desktop.

```
Lineas originales: ~1893-1945
Responsabilidades:
- simulateQRScan() overlay version
- closePhoneMockup()
- Message listener para close desde iframe
- Escape key handler
```

Variables globales que consume: `selectedBank`, `selectedMethod`.

---

## Paso 7: Actualizar `checkout.html`

Reemplazar el unico `<script src="js/script.js">` por la carga ordenada:

```html
<!-- Configs (deben cargarse primero) -->
<script src="config/brand-config.js"></script>
<script src="config/banks-config.js"></script>

<!-- Modulos del checkout (orden importa para dependencias) -->
<script src="js/checkout-core.js"></script>
<script src="js/identity-validation.js"></script>
<script src="js/qr-checkout-flow.js"></script>
<script src="js/push-flow.js"></script>
<script src="js/account-to-account.js"></script>
<script src="js/phone-mockup.js"></script>
```

---

## Paso 8: Eliminar `script.js`

Una vez verificado que todo funciona, eliminar `js/script.js` (el monolito original).

---

## Consideraciones de dependencias entre modulos

Dado que no usamos ES modules (el proyecto es vanilla JS sin bundler), los modulos comparten el scope global. Las dependencias son:

```
config/brand-config.js    (define BRAND)
config/banks-config.js    (define BANKS, bankNames, bankLogos, etc.)
    |
    v
js/checkout-core.js       (define selectedMethod, selectedBank, currentFlow, selectMethod...)
    |
    v
js/identity-validation.js  (usa selectedMethod, selectedBank, BANKS)
js/qr-checkout-flow.js     (usa selectedMethod, selectedBank, BRAND)
js/push-flow.js             (usa selectedMethod, BANKS, BRAND)
js/account-to-account.js    (usa selectedMethod, BANKS, BRAND)
js/phone-mockup.js          (usa selectedBank, selectedMethod)
```

Todos los modulos deben cargarse en el orden especificado arriba.

---

## Verificacion

```bash
# js/script.js no deberia existir
test ! -f js/script.js && echo "OK: js/script.js eliminado"

# Todos los nuevos modulos deben existir en js/
for f in checkout-core.js identity-validation.js qr-checkout-flow.js push-flow.js account-to-account.js phone-mockup.js; do
    test -f "js/$f" && echo "OK: js/$f existe" || echo "FALTA: js/$f"
done

# checkout.html debe cargar todos los scripts con paths correctos
grep -c "script src=" checkout.html   # deberia ser 8 (2 config + 6 modulos)

# Prueba funcional: abrir checkout.html en browser y probar cada flujo:
# 1. Seleccionar "Domiciliar en Cuenta" -> elegir banco -> CURP modal -> QR o deep link
# 2. Seleccionar "Paga y Domicilia" -> elegir banco -> CURP modal
# 3. Flujo push (flow=push-data)
# 4. Flujo A2A (flow=a2a) -> CLABE -> verificacion -> confirmacion
```
