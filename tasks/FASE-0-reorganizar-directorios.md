# Fase 0: Reorganizar Directorios

**Prioridad:** Alta
**Estado:** Pendiente
**Dependencias:** Ninguna (primera fase, se ejecuta antes que todas)
**Impacto:** Limpia el root, organiza archivos en subdirectorios logicos, elimina basura

---

## Objetivo

Reorganizar el proyecto desde un flat root con 35 items mezclados a una estructura con subdirectorios logicos (`config/`, `js/`, `css/`, `assets/`). Eliminar archivos obsoletos.

---

## Estructura objetivo

```
demo-portal-pagos/
├── index.html                    # Launcher
├── whatsapp.html                 # Demo WhatsApp
├── qr.html                      # Demo QR Factura
├── checkout.html                 # Checkout compartido
├── menu.html                    # Selector de flujos
├── auth-mobile.html             # Simulacion app movil
│
├── config/                      # Configuraciones centrales
│   ├── brand-config.js          # (se crea en Fase 1)
│   ├── banks-config.js          # (se crea en Fase 2)
│   └── variables.css            # (se crea en Fase 1)
│
├── js/                          # Scripts
│   ├── script.js                # Monolito checkout (se splitea en Fase 4)
│   ├── qr-script.js             # QR viewer logic
│   ├── auth-mobile-script.js    # Mobile auth logic
│   └── menu-script.js           # Menu navigation
│
├── css/                         # Estilos
│   ├── styles.css               # Estilos checkout
│   ├── menu-styles.css          # Estilos menu
│   ├── auth-mobile-styles.css   # Estilos mobile
│   └── qr-styles.css            # Estilos QR viewer
│
├── assets/                      # Recursos estaticos
│   ├── brand/                   # Logo y factura de la marca actual
│   │   ├── totalplay.png
│   │   └── factura-totalplay.pdf
│   └── banks/                   # Logos de bancos
│       ├── Hey_Banco.svg
│       ├── santa.png
│       ├── banamex.svg
│       ├── hsbc.jpg
│       ├── stori.png
│       ├── nu.jpeg
│       └── tapi-Isologotipo blanco.png
│
├── tasks/                       # Planificacion
├── README.md
└── .claude/                     # Config Claude Code
```

---

## Paso 1: Crear directorios

```bash
mkdir -p config js css assets/brand assets/banks
```

---

## Paso 2: Mover archivos CSS

```bash
mv styles.css css/
mv menu-styles.css css/
mv auth-mobile-styles.css css/
mv qr-styles.css css/
```

---

## Paso 3: Mover archivos JS

```bash
mv script.js js/
mv auth-mobile-script.js js/
mv menu-script.js js/
mv qr-script.js js/
```

---

## Paso 4: Mover assets de marca

```bash
mv totalplay.png assets/brand/
mv factura-totalplay.pdf assets/brand/
```

---

## Paso 5: Mover logos de bancos

```bash
mv Hey_Banco.svg assets/banks/
mv santa.png assets/banks/
mv banamex.svg assets/banks/
mv hsbc.jpg assets/banks/
mv stori.png assets/banks/
mv nu.jpeg assets/banks/
mv "tapi-Isologotipo blanco.png" assets/banks/
```

---

## Paso 6: Eliminar archivos obsoletos

Estos archivos son restos de la marca anterior (Naturgy) o archivos innecesarios:

```bash
# Logo viejo de Naturgy (ya no se usa, se reemplazo por totalplay.png)
rm -f Naturgy.png
rm -f nat.png

# CURP de prueba suelto en el root
rm -f AAMA850101HDFRRL09

# Screenshots/imagenes sueltas sin uso en el codigo
rm -f IMG_0558.png
rm -f IMG_3580.PNG

# Logos de bancos no usados en el codigo
rm -f openbank.png
rm -f plata.png

# Videos de demos anteriores con nombres de Naturgy
rm -f "demo pago automatico hey | naturgy.mov"
rm -f "pago automático Naturgy | Nu.mov"
```

**NOTA:** Antes de borrar, verificar que ningun archivo HTML/JS referencia estos archivos:
```bash
grep -r "Naturgy.png\|nat.png\|IMG_0558\|IMG_3580\|openbank\|plata.png\|AAMA850101" --include="*.{html,js}" .
```
Si retorna 0 resultados, es seguro borrar.

---

## Paso 7: Actualizar paths en archivos HTML

Todos los archivos HTML necesitan actualizar las rutas de CSS, JS y assets.

### 7a. `index.html` (Launcher)
```
totalplay.png         -> assets/brand/totalplay.png
```
(Cuando se cree index-styles.css en Fase 3, ira en css/)

### 7b. `whatsapp.html`
```
totalplay.png         -> assets/brand/totalplay.png   (3 referencias)
```
(Cuando se cree whatsapp-styles.css en Fase 3, ira en css/)

### 7c. `checkout.html`
```
styles.css            -> css/styles.css
script.js             -> js/script.js
totalplay.png         -> assets/brand/totalplay.png   (2 referencias)
```

### 7d. `menu.html`
```
menu-styles.css       -> css/menu-styles.css
menu-script.js        -> js/menu-script.js
totalplay.png         -> assets/brand/totalplay.png
```

### 7e. `auth-mobile.html`
```
auth-mobile-styles.css    -> css/auth-mobile-styles.css
auth-mobile-script.js     -> js/auth-mobile-script.js
totalplay.png             -> assets/brand/totalplay.png   (4 referencias)
```

### 7f. `qr.html`
```
qr-styles.css         -> css/qr-styles.css
qr-script.js          -> js/qr-script.js
totalplay.png         -> assets/brand/totalplay.png
```

---

## Paso 8: Actualizar paths en archivos JS

### 8a. `js/script.js`
Buscar todas las referencias a archivos de imagen:
```
totalplay.png               -> assets/brand/totalplay.png
Hey_Banco.svg               -> assets/banks/Hey_Banco.svg
santa.png                   -> assets/banks/santa.png
stori.png                   -> assets/banks/stori.png
hsbc.jpg                    -> assets/banks/hsbc.jpg
banamex.svg                 -> assets/banks/banamex.svg
tapi-Isologotipo blanco.png -> assets/banks/tapi-Isologotipo blanco.png
nu.jpeg                     -> assets/banks/nu.jpeg
```

Tambien buscar referencias a `auth-mobile.html` y `checkout.html` que se usan para construir URLs de redireccion. Estas NO cambian porque los HTML siguen en el root.

### 8b. `js/auth-mobile-script.js`
Mismas referencias a logos de bancos:
```
Hey_Banco.svg               -> assets/banks/Hey_Banco.svg
santa.png                   -> assets/banks/santa.png
banamex.svg                 -> assets/banks/banamex.svg
hsbc.jpg                    -> assets/banks/hsbc.jpg
stori.png                   -> assets/banks/stori.png
tapi-Isologotipo blanco.png -> assets/banks/tapi-Isologotipo blanco.png
```

### 8c. `js/qr-script.js`
```
factura-totalplay.pdf       -> assets/brand/factura-totalplay.pdf
```
(Linea 3: `const PDF_URL = '...'`)

---

## Paso 9: Actualizar paths en archivos CSS

Revisar si algun CSS tiene `url()` apuntando a imagenes. Generalmente no en este proyecto, pero verificar:
```bash
grep -r "url(" --include="*.css" . | grep -v "data:image" | grep -v "fonts"
```

---

## Paso 10: Actualizar paths internos entre CSS (imports)

Cuando en Fase 1 se cree `config/variables.css`, los imports desde `css/*.css` seran:
```css
@import url('../config/variables.css');
```

---

## Verificacion

```bash
# Verificar que no queden archivos sueltos en root (excepto HTML, README, tasks, .claude)
ls -1 *.js *.css *.png *.jpg *.jpeg *.svg *.pdf *.mov *.PNG 2>/dev/null
# Deberia retornar vacio o error "No such file"

# Verificar que los subdirectorios tienen los archivos correctos
ls config/    # (vacio hasta Fase 1)
ls js/        # script.js, qr-script.js, auth-mobile-script.js, menu-script.js
ls css/       # styles.css, menu-styles.css, auth-mobile-styles.css, qr-styles.css
ls assets/brand/   # totalplay.png, factura-totalplay.pdf
ls assets/banks/   # Hey_Banco.svg, santa.png, banamex.svg, hsbc.jpg, stori.png, nu.jpeg, tapi-Isologotipo blanco.png

# Prueba funcional: abrir http://localhost:8000 y verificar que:
# 1. Launcher carga con logo
# 2. Demo WhatsApp carga con avatares
# 3. Demo QR carga el PDF
# 4. Checkout carga con logo y estilos
# 5. Auth mobile carga con logos de bancos
```
