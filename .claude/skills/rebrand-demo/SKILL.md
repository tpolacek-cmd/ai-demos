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
en `config/brand-config.js` y `config/variables.css`.

El `index.html` es un builder de 3 columnas (canal de llegada,
portal de pago, flujo de pago) que arma la demo por bloques.
La configuracion de opciones esta en `config/demo-builder-config.js`.

## Procedimiento

### 1. Obtener datos de la nueva marca
Preguntar al usuario:
- Nombre de la empresa
- Tipo de servicio (ej: Internet, Gas, Electricidad)
- Color principal (hex)
- Logo (path al archivo)
- Datos de factura de ejemplo (montos, cuenta, periodo) o inventarlos

### 2. Editar `config/brand-config.js`
Actualizar TODOS los campos del objeto BRAND:
- name, fullName, serviceType, planName
- logo (nombre del archivo en assets/brand/)
- domain, paymentDomain, phone, phoneFriendly
- account.* (number, period, dueDate, amounts...)
- colors.* (primary, primaryDark, primaryLight, accent, background, btnText)
- deepLinkServiceParam

### 3. Actualizar `config/variables.css`
Actualizar los colores en las CSS variables para que coincidan
con BRAND.colors. Incluir las sombras con el nuevo color primario:
- --primary-color, --primary-dark, --primary-light
- --secondary-color, --accent-color, --background
- --gradient-start, --gradient-end, --header-bg, --btn-text-color
- --tp-primary, --tp-dark, --tp-text
- --shadow-sm/md/lg/xl (usar rgba del nuevo color primario)

### 4. Copiar logo
Copiar el logo proporcionado a `assets/brand/`
con el nombre definido en BRAND.logo.

### 5. (Opcional) Actualizar factura
Si hay una factura PDF nueva, copiarla a `assets/brand/` y actualizar la referencia
en `js/qr-script.js` linea 4 (const PDF_URL).

### 6. Verificar
Ejecutar:
```bash
grep -r "NombreMarcaAnterior" --include="*.{html,js,css}" . | grep -v tasks/ | grep -v config/brand-config.js | grep -v node_modules
```
Debe retornar 0 resultados.

Tambien buscar el color hex anterior por si quedo hardcodeado:
```bash
grep -r "#ColorHexAnterior" --include="*.{html,js,css}" . | grep -v tasks/ | grep -v config/
```

### 7. Probar
Abrir http://localhost:8000 y verificar:
- Builder de 3 columnas muestra nuevo nombre y logo
- Demo WhatsApp muestra nuevo branding
- Demo QR Factura muestra nuevo branding (SVGs usan CSS variables)
- Checkout muestra nuevos montos y datos
- Colores son correctos en toda la UI

## Notas
- Los `<title>` de cada HTML tienen el nombre de marca hardcodeado pero son
  sobreescritos por JS al cargar. Opcionalmente actualizar para evitar flash.
- Los SVGs en qr.html y checkout.html usan `var(--primary-color, #fallback)`.
  Al cambiar variables.css los colores se actualizan automaticamente.
- `config/demo-builder-config.js` no necesita cambios para un rebrand
  (solo contiene estructura de etapas, no datos de marca).
