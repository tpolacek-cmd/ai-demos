# Fase 5: Limpieza y Documentacion

**Prioridad:** Baja
**Estado:** Completada
**Dependencias:** Fases 1-4 completadas
**Impacto:** Cierra deuda tecnica restante, documenta la arquitectura final

---

## Objetivo

Limpiar variables CSS legacy, actualizar README con la nueva arquitectura, y crear una skill de Claude Code para automatizar rebrandings futuros.

---

## Paso 1: Limpiar `auth-mobile-styles.css` de variables legacy

### Problema
`auth-mobile-styles.css` aun contiene variables de Nu Bank que ya no son la marca principal:
- `--nu-purple: #820AD1`
- `--nu-purple-dark: #6600AA`
- `--nu-purple-light: #F3E8FF`

Estas variables se usan para los estilos de la simulacion de la app de banco (no de la marca Totalplay). Necesitan ser evaluadas:

### Accion
1. Buscar todas las referencias a `--nu-purple` en `css/auth-mobile-styles.css` y `auth-mobile.html`.
2. Si se usan para la UI del banco (ej: color del header cuando simulas la app de Nu), deben reemplazarse por la logica dinamica de `BANKS[bank].color` que ya existe en `auth-mobile.html`.
3. Si se usan como fallback general, reemplazar por `var(--primary-color)` del banco seleccionado.
4. Eliminar las declaraciones `--nu-purple*` del bloque `:root`.

### Variables a limpiar
```css
/* ELIMINAR estas del :root de css/auth-mobile-styles.css */
--nu-purple: #820AD1;
--nu-purple-dark: #6600AA;
--nu-purple-light: #F3E8FF;
--tapi-green: #00c853;
--tapi-green-dark: #00a844;
```

Reemplazar las ~30 referencias a `var(--nu-purple)` por `var(--primary-color)` (que sera sobreescrita dinamicamente por el color del banco seleccionado via JS).

---

## Paso 2: Actualizar `README.md`

Reescribir el README para reflejar la nueva arquitectura. Secciones:

### 2a. Descripcion general
```
# Demo Portal de Pagos

Repositorio base para demos interactivas de portal de pagos con domiciliacion bancaria.
Actualmente brandeado para Totalplay Mexico.

## Demos disponibles
- **WhatsApp**: Simulacion de chat de WhatsApp con link de pago
- **QR Factura**: Visualizador de factura PDF con QR integrado
```

### 2b. Quick Start
```
## Como usar

1. Iniciar servidor local:
   python3 -m http.server 8000

2. Abrir http://localhost:8000

3. Seleccionar una demo
```

### 2c. Cambiar de marca (CRITICO para LLMs)
```
## Como cambiar de marca

Para rebrandear la demo (ej: de Totalplay a Telmex):

1. Editar `config/brand-config.js`:
   - Cambiar name, fullName, serviceType, planName
   - Actualizar account (numero, periodo, montos)
   - Actualizar colores
   - Actualizar dominio y telefono

2. Reemplazar el logo:
   - Guardar el nuevo logo en `assets/brand/` con el nombre definido en BRAND.logo
   - Tamanio recomendado: 200x60px, fondo transparente (PNG)

3. (Opcional) Reemplazar la factura PDF:
   - Guardar como `assets/brand/factura-[marca].pdf`
   - Actualizar referencia en `js/qr-script.js` linea 3

4. Verificar:
   grep -r "NombreMarcaAnterior" --include="*.{html,js,css}" .
   # No deberia retornar resultados
```

### 2d. Estructura del proyecto
Copiar la estructura objetivo del OVERVIEW.md con descripcion de cada archivo.

### 2e. Como agregar una nueva demo
```
## Como agregar una nueva demo (canal de entrada)

1. Crear el HTML de la nueva demo (ej: `sms.html`) en el root
2. Agregar <script src="config/brand-config.js"> al inicio
3. Linkar estilos desde css/ y config/variables.css
4. Usar BRAND.* para todos los valores de marca
5. Al final del flujo, redirigir a checkout.html con los params necesarios
6. Agregar la tarjeta en index.html (launcher)
```

### 2f. Arquitectura
```
## Arquitectura

### Archivos de configuracion (config/)
- `config/brand-config.js` - Toda la data de marca (nombre, colores, montos, etc.)
- `config/banks-config.js` - Configuracion de bancos disponibles
- `config/variables.css` - CSS custom properties (sincronizado con brand-config.js)

### Assets (assets/)
- `assets/brand/` - Logo y factura de la marca actual
- `assets/banks/` - Logos de bancos

### Flujo de datos
Launcher (index.html) -> Demo channel (whatsapp/qr/...) -> checkout.html -> auth-mobile.html

### Modulos del checkout (js/)
- js/checkout-core.js: Seleccion de metodo de pago y banco
- js/identity-validation.js: Validacion CURP/RFC/CLABE
- js/qr-checkout-flow.js: Flujo QR dentro del checkout
- js/push-flow.js: Flujo de push notification
- js/account-to-account.js: Flujo A2A
- js/phone-mockup.js: Simulacion de phone en desktop
```

---

## Paso 3: Crear skill `/rebrand` para Claude Code

Crear el archivo `~/.claude/skills/rebrand-demo/SKILL.md` (o en la ubicacion correcta de skills de Claude Code):

```markdown
---
name: rebrand-demo
description: Cambiar la marca de la demo de portal de pagos.
  Usar cuando el usuario pida cambiar de marca, rebrandear,
  o adaptar la demo para otra empresa.
---

# Skill: Rebrand Demo

## Contexto
El proyecto en el directorio actual es una demo de portal de pagos
con domiciliacion bancaria. Los datos de marca estan centralizados
en `brand-config.js`.

## Procedimiento

### 1. Obtener datos de la nueva marca
Preguntar al usuario:
- Nombre de la empresa
- Tipo de servicio (ej: Internet, Gas, Electricidad)
- Color principal (hex)
- Logo (path al archivo)
- Datos de factura de ejemplo (montos, cuenta, periodo) o inventarlos

### 2. Editar `brand-config.js`
Actualizar TODOS los campos del objeto BRAND:
- name, fullName, serviceType, planName
- logo (nombre del archivo)
- domain, paymentDomain, phone, phoneFriendly
- account.* (number, period, dueDate, amounts...)
- colors.* (primary, primaryDark, primaryLight, accent, background, btnText)
- deepLinkServiceParam

### 3. Actualizar `variables.css`
Actualizar los colores en las CSS variables para que coincidan
con BRAND.colors. Incluir las sombras rgba().

### 4. Copiar logo
Copiar el logo proporcionado al directorio del proyecto
con el nombre definido en BRAND.logo.

### 5. (Opcional) Actualizar factura
Si hay una factura PDF nueva, copiarla y actualizar la referencia
en `qr-script.js` linea 3 (const PDF_URL).

### 6. Verificar
Ejecutar:
  grep -r "NombreMarcaAnterior" --include="*.{html,js,css}" . | grep -v tasks/
Debe retornar 0 resultados.

### 7. Probar
Abrir http://localhost:8000 y verificar:
- Launcher muestra nuevo nombre y logo
- Demo WhatsApp muestra nuevo branding
- Demo QR Factura muestra nuevo branding
- Checkout muestra nuevos montos y datos
- Colores son correctos en toda la UI
```

---

## Paso 4: Limpiar archivos obsoletos

Evaluar y potencialmente eliminar:
- `menu.html` y `menu-script.js` si ya no se usan (el launcher los reemplazo)
- Videos de demos antiguas (`.mov` files) si existen
- Verificar que no queden archivos huerfanos

---

## Paso 5: Renombrar directorio del proyecto (opcional)

El directorio se llama `demo_naturgy_nu` lo cual es un artifact de la marca anterior. Considerar renombrar a algo generico como `demo-portal-pagos` o `payment-demo`. Esto es opcional y depende del usuario.

---

## Verificacion final

```bash
# Estructura de archivos correcta
ls -la *.js *.css *.html *.png *.pdf

# No quedan variables legacy
grep -r "nu-purple" --include="*.css" css/    # 0 resultados
grep -r "nu-purple" --include="*.html" .      # 0 resultados

# No queda el monolito
test ! -f js/script.js && echo "OK"

# README actualizado
head -5 README.md   # deberia mostrar nuevo titulo

# config/brand-config.js es la unica fuente de verdad para datos de marca
grep -r "Totalplay" --include="*.{js,html,css}" . | grep -v config/brand-config.js | grep -v tasks/ | wc -l
# deberia ser 0 (o muy cercano a 0)
```
