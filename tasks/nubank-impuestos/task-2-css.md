# Task 2: Stylesheet Nubank

**Status:** [x] Complete
**Depende de:** ninguna
**Archivo nuevo:** `css/nubank-impuestos-styles.css`

## Checklist

- [ ] Crear archivo `css/nubank-impuestos-styles.css`
- [ ] CSS variables con paleta Nubank
- [ ] Reset y base (container, font, overflow)
- [ ] Step visibility system (`.nu-step` + `.nu-step.active`)
- [ ] Screen 1: Face ID (`.nu-faceid`) — bg purple, logo, boton blanco
- [ ] Screen 2: Home (`.nu-home`) — header, saldo, quick actions, tarjeta
- [ ] Screen 3: Pagar (`.nu-pagar`) — X button, titulo, 3 botones circulares
- [ ] Screen 4: Servicios (`.nu-servicios`) — search bar, lista items, categorias
- [ ] Screen 5: Metodo (`.nu-metodo`) — header, 2 opciones lista
- [ ] Screen 6: CURP Input (`.nu-curp-input`) — progress bar, input, boton circular
- [ ] Screen 7: Lista Impuestos (`.nu-impuestos-lista`) — cards seleccionables, total, boton
- [ ] Screen 8: Confirmacion (`.nu-confirmacion`) — card resumen, boton confirmar
- [ ] Screen 9: Exito (`.nu-exito`) — check icon, monto, detalles, botones
- [ ] Verificar padding-top para dynamic island (min 52px)
- [ ] Verificar scroll en screens con contenido largo

## Especificacion

### Paleta de colores

Extraida de los screenshots de Nubank (`reference/nubank-impuestos/1-faceID.png` a `6-curp.png`):

```css
:root {
    --nu-purple: #820AD1;
    --nu-purple-dark: #6B07B0;
    --nu-purple-light: #F5E6FF;
    --nu-white: #FFFFFF;
    --nu-bg: #FFFFFF;
    --nu-text-primary: #111111;
    --nu-text-secondary: #6C757D;
    --nu-divider: #E8E8E8;
    --nu-card-bg: #F5F5F5;
    --nu-success: #00A650;
}
```

### Base y reset

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif; -webkit-font-smoothing: antialiased; }
body { background: var(--nu-bg); }
```

### Step visibility

```css
.nu-container { width: 100%; height: 100%; position: relative; overflow: hidden; }
.nu-step { display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; flex-direction: column; }
.nu-step.active { display: flex; }
```

### Consideracion critica: Dynamic Island

Este CSS se renderiza dentro de un iframe en `mobile-viewer.html`. El dynamic island (`.mv-phone-notch`) del frame del iPhone tiene 36px de alto + esta a 12px del top del iframe. El contenido que este en los primeros ~48px del iframe queda visualmente tapado.

**Solucion:** Cada screen debe tener `padding-top: 52px` como minimo para empujar el contenido debajo del notch. Excepcion: Screen 1 (Face ID) tiene bg purple full-screen, asi que el padding se aplica al contenido interno, no al fondo.

### Screens detallados

Leer los screenshots de referencia para replicar el look:

**Screen 1 — `.nu-faceid`** (ver `reference/nubank-impuestos/1-faceID.png`):
- `background: var(--nu-purple)` cubriendo todo el step
- Logo + texto centrado verticalmente (~40% desde arriba)
- Logo Nu: SVG blanco (se define en el HTML)
- Texto: color blanco, font-size 16px, line-height 1.5, max-width 85%, centrado
- Boton "Ingresar con Face ID": bg blanco, color var(--nu-purple), border-radius 30px, height 48px, font-weight 600, width ~85%, centrado horizontalmente. Icono Face ID a la izquierda del texto.
- Link "Ingresar con contrasena": color blanco, text-decoration underline, margin-top 16px
- Footer: color rgba(255,255,255,0.5), font-size 12px, position absolute bottom 32px, centrado

**Screen 2 — `.nu-home`** (ver `reference/nubank-impuestos/2-home.png`):
- Scroll vertical (`overflow-y: auto`)
- padding-top: 52px (dynamic island clearance)
- Header area: padding 16px 20px, "Hola, Daniel" font-size 18px font-weight 600
- Icono persona: circulo 32px con borde
- "Cuenta No" label: font-size 14px, color gris, margin-top 24px, padding-left 20px
- Saldo "$29,645.96": font-size 28px, font-weight 700, padding-left 20px
- Quick actions row: `display: flex; gap: 16px; overflow-x: auto; padding: 20px; -webkit-overflow-scrolling: touch;`
  - Cada accion: icono en circulo 56px bg #F0F0F0, label debajo 11px
  - "Pagar Servicios" tiene icono de lista/servicio
- Divider: 8px alto, bg #F0F0F0
- Tarjeta de credito: padding 20px, titulo 16px bold, saldo 22px bold
- Footer: padding 20px, font-size 12px, color gris

**Screen 3 — `.nu-pagar`** (ver `reference/nubank-impuestos/3-pagar.png`):
- padding-top: 52px
- X button: position absolute, top 52px, left 16px, 32px, cursor pointer, bg transparent
- "Pagar" titulo: font-size 28px, font-weight 700, margin-top 48px, padding-left 20px
- 3 botones: flex row, gap 24px, padding 24px 20px, justify-content flex-start
  - Cada boton: circulo 64px bg #F0F0F0, icono 28px centrado. Label abajo 12px
  - Tercer boton: badge "Nuevo" bg purple, color white, font-size 10px, border-radius 4px, position absolute top-right del circulo
- Texto descriptivo: font-size 16px, color var(--nu-text-primary), padding 32px 20px, line-height 1.5
- "Buscar mas servicios": flex row, justify-content space-between, padding 16px 20px, border-top 1px solid var(--nu-divider)

**Screen 4 — `.nu-servicios`** (ver `reference/nubank-impuestos/4-servicios.png`):
- padding-top: 52px
- Header: flex row, align-items center. Flecha back 24px left-padding 16px. Titulo "Pagar servicio" centrado, font-size 16px font-weight 600
- Search bar: margin 12px 16px, bg #F0F0F0, border-radius 24px, height 40px, padding-left 40px (icono lupa dentro), font-size 14px
- "Mas populares" label: font-size 13px, color gris, padding 16px 16px 8px
- Service list items: flex row, align-items center, padding 14px 16px, border-bottom 1px solid var(--nu-divider)
  - Icono: 40px circulo (o cuadrado rounded). Para las marcas (Totalplay, izzi, CFE, Telmex) usar texto estilizado o SVG simple
  - Nombre: font-size 15px, font-weight 500, flex 1, margin-left 12px
  - Flecha: chevron right, 16px, color gris
  - El item "Estado [Nombre de Estado]" usa un icono de gobierno (edificio con columnas SVG)
- "Por categoria" label: font-size 13px, color gris, padding 20px 16px 8px
- Category items: similar a service items pero icono es circulo con bg coloreado (amarillo para Luz, azul para Internet, celeste para Agua, verde para Telefonia) + flecha tipo redirect (→)
- Scroll vertical para la lista

**Screen 5 — `.nu-metodo`** (ver `reference/nubank-impuestos/5-metodo.png`):
- padding-top: 52px
- Header: igual que screen 4 pero titulo "Como quieres enviar tu pago?"
- 2 opciones lista: padding 20px 16px, border-bottom 1px solid var(--nu-divider)
  - Titulo: font-size 16px, font-weight 600
  - Subtitulo: font-size 14px, color gris, margin-top 4px
  - Flecha: chevron right, position absolute right 16px, centrado vertical

**Screen 6 — `.nu-curp-input`** (ver `reference/nubank-impuestos/6-curp.png`):
- padding-top: 52px
- X button: top-left, mismo estilo que screen 3
- Progress bar: flex row, 2 segmentos. Primer segmento bg var(--nu-purple), segundo bg #E0E0E0. Height 3px, margin 16px 16px 0, gap 4px. Cada segmento flex 1 border-radius 2px.
- Titulo "Estado [Nombre de Estado]": font-size 22px, font-weight 700, padding 24px 16px 0
- Label "CURP": font-size 14px, color var(--nu-text-secondary), padding 24px 16px 0
- Input: width calc(100% - 32px), margin 8px 16px, border none, border-bottom 2px solid var(--nu-purple), font-size 18px, padding 8px 0, outline none, caret-color var(--nu-purple)
- Boton circular submit: position fixed, bottom 32px, right 24px, width 56px, height 56px, border-radius 50%, bg #E0E0E0, transition bg 0.2s. Icono flecha derecha centrada. Cuando activo (clase `.active`): bg var(--nu-purple), color white

**Screen 7 — `.nu-impuestos-lista`** (NUEVA, inventar con estilo Nubank):
- padding-top: 52px
- Header: flecha back + "Obligaciones fiscales" centrado
- Subtitulo CURP: font-size 13px, color gris, padding 8px 16px
- Tax cards: margin 8px 16px, border 1px solid var(--nu-divider), border-radius 12px, padding 16px
  - Layout: flex row. Checkbox circular izquierda (24px, border 2px). Texto centro (nombre 14px, flex 1). Monto derecha 15px bold.
  - Seleccionada: border-color var(--nu-purple), checkbox filled con check blanco
  - No seleccionada: border-color var(--nu-divider), checkbox vacio
  - Gap entre cards: 12px
- Total section: padding 16px, flex row space-between, font-size 16px font-weight 700
- Boton "Pagar todos": margin 16px, bg var(--nu-purple), color white, border-radius 30px, height 48px, font-size 16px font-weight 600, width calc(100% - 32px)

**Screen 8 — `.nu-confirmacion`** (NUEVA):
- padding-top: 52px
- Header: flecha back + "Confirmar pago"
- Scroll vertical
- Card resumen: margin 16px, bg var(--nu-card-bg), border-radius 12px, padding 20px
  - Filas label+value: flex column, gap 12px
  - Dividers: 1px solid var(--nu-divider), margin 12px 0
  - Items impuesto: flex row space-between, font-size 14px
  - Total: flex row space-between, font-size 18px, font-weight 700
- Info adicional: padding 16px, font-size 14px, color gris
- Boton "Pagar $3,800.00": mismo estilo que screen 7 boton, position sticky bottom 16px

**Screen 9 — `.nu-exito`** (NUEVA):
- padding-top: 52px
- Centrado vertical y horizontal
- Check circle: 64px, bg var(--nu-success) o var(--nu-purple), border-radius 50%, icono check blanco SVG
- "Pago exitoso": font-size 22px, font-weight 700, margin-top 20px
- "$3,800.00": font-size 32px, font-weight 700, margin-top 8px
- Card detalles: margin 24px 16px, bg var(--nu-card-bg), border-radius 12px, padding 16px
  - Filas: flex row space-between, padding 12px 0, border-bottom 1px solid var(--nu-divider)
  - Label: font-size 13px, color gris
  - Value: font-size 13px, font-weight 500, text-align right
- Boton "Compartir comprobante": border 1px solid var(--nu-purple), bg transparent, color var(--nu-purple), border-radius 30px, height 44px, width calc(100% - 32px), margin 16px
- Link "Volver al inicio": color var(--nu-purple), font-size 14px, text-decoration underline, margin-top 12px, centrado

### Referencia visual

Leer las imagenes en `reference/nubank-impuestos/` con la tool Read para ver los screenshots exactos y ajustar colores, spacing y layout.

Leer `css/auth-bbva-styles.css` como referencia de estructura de un stylesheet step-based similar.
