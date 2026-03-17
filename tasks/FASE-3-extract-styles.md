# Fase 3: Extraccion de Estilos Inline

**Prioridad:** Media
**Estado:** Completada
**Dependencias:** Fase 1 completada (variables.css debe existir)
**Impacto:** Mejora mantenibilidad, reduce tamanio de HTML, facilita busqueda de estilos

---

## Objetivo

Extraer los bloques `<style>` inline de `whatsapp.html` (~620 lineas) e `index.html` (~250 lineas) a archivos CSS separados. Esto deja los HTML limpios y facilita que un LLM encuentre y modifique estilos.

---

## Paso 1: Extraer estilos de `whatsapp.html` a `whatsapp-styles.css`

### Que extraer
El bloque `<style>` que empieza aproximadamente en la linea 5 y contiene ~620 lineas de CSS con estilos para:
- Layout del telefono WhatsApp (`.whatsapp-container`, `.phone-frame`)
- Sidebar de chats (`.chat-sidebar`, `.chat-list-item`)
- Panel de chat (`.chat-panel`, `.chat-messages`)
- Burbjas de mensajes (`.message`, `.message-sent`, `.message-received`)
- Link preview (`.link-preview`, `.link-preview-banner`)
- Redirect overlay (`.redirect-loading`)
- Responsive media queries

### Como hacerlo
1. Crear `css/whatsapp-styles.css`.
2. Copiar TODO el contenido del bloque `<style>...</style>` al nuevo archivo.
3. Al inicio del nuevo CSS, agregar: `@import url('../config/variables.css');`
4. Reemplazar en `whatsapp.html` el bloque `<style>...</style>` por:
   ```html
   <link rel="stylesheet" href="config/variables.css">
   <link rel="stylesheet" href="css/whatsapp-styles.css">
   ```
5. Verificar que los colores usen CSS variables donde corresponda en vez de valores hardcodeados.

### Colores hardcodeados a reemplazar en el CSS extraido
- `#075E54` (WhatsApp dark green) - dejar como esta, es color de WhatsApp no de la marca
- `#128C7E` (WhatsApp medium green) - dejar como esta
- `#25D366` (WhatsApp light green) - dejar como esta
- `#DBE442` y derivados - reemplazar por `var(--primary-color)` etc.
- `#2A3444` - reemplazar por `var(--header-bg)` si aplica
- `rgba(219, 228, 66, ...)` - reemplazar por variables con opacity

**NOTA:** Los colores de WhatsApp (#075E54, #128C7E, #25D366, #DCF8C6) NO son de la marca y deben quedar hardcodeados. Son colores de la app de WhatsApp que no cambian con el rebranding.

---

## Paso 2: Extraer estilos de `index.html` a `index-styles.css`

### Que extraer
El bloque `<style>` dentro de `index.html` (el launcher) que contiene ~250 lineas de CSS con estilos para:
- Header (`.header`)
- Grid de demos (`.demos-grid`)
- Cards de demos (`.demo-card`, `.card-banner`, `.card-body`)
- Banners especificos (`.banner-whatsapp`, `.banner-qr`)
- Footer
- Responsive media queries

### Como hacerlo
1. Crear `css/index-styles.css`.
2. Copiar TODO el contenido del bloque `<style>...</style>` al nuevo archivo.
3. Al inicio del nuevo CSS, agregar: `@import url('../config/variables.css');`
4. Reemplazar en `index.html` el bloque `<style>...</style>` por:
   ```html
   <link rel="stylesheet" href="config/variables.css">
   <link rel="stylesheet" href="css/index-styles.css">
   ```
5. Reemplazar variables `--tp-primary`, `--tp-dark`, etc. por los nombres unificados de `variables.css`.

### Variables a unificar
| Variable actual en index.html | Variable unificada en variables.css |
|---|---|
| `--tp-primary` | `--primary-color` |
| `--tp-dark` | `--header-bg` |
| `--tp-text` | `--text-primary` |
| `--tp-text-secondary` | `--text-secondary` |
| `--tp-border` | `--border-color` |

---

## Verificacion

```bash
# No deberia haber bloques <style> significativos en index.html o whatsapp.html
# (puede quedar algun style inline minimo para layout critico, pero no 250+ lineas)
grep -c "<style>" whatsapp.html   # deberia ser 0
grep -c "<style>" index.html      # deberia ser 0

# Los nuevos CSS deben existir y tener contenido
wc -l css/whatsapp-styles.css   # ~620 lineas
wc -l css/index-styles.css      # ~250 lineas

# Verificar que las paginas cargan correctamente (abrir en browser)
```
