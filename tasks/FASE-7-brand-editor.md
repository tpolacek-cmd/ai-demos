# Fase 7 — Editor visual de marca en el index

## Objetivo

Agregar un panel de edicion visual en `index.html` que permita a personas no tecnicas modificar todas las variables de marca (nombre, colores, montos, contacto, logo, etc.) directamente desde el navegador, sin tocar codigo ni archivos de configuracion.

## Contexto

Hoy el rebranding requiere editar `config/brand-config.js` manualmente o pedirle a Claude que lo haga con `/rebrand-demo`. Queremos que tambien se pueda hacer desde la UI del builder, editando campos de un formulario que actualicen el objeto `BRAND` en tiempo real y persistan en `localStorage`.

## Problema a resolver

- Gente no tecnica no puede modificar la marca sin ayuda de un desarrollador o un agente LLM.
- No hay forma de hacer ajustes rapidos (cambiar un monto, un telefono, un color) sin abrir un editor de codigo.
- No hay forma de probar multiples marcas sin hacer git stash / editar / revertir.

## Arquitectura

### Sistema de override (capa de persistencia)

```
brand-config.js (defaults hardcodeados)
        |
        v
brand-override.js (lee localStorage, mergea sobre BRAND)
        |
        v
applyBrandColors() (sincroniza a CSS custom properties)
        |
        v
Paginas de demo renderizan con los valores finales
```

Todas las paginas cargan `brand-override.js` despues de `brand-config.js`. Si hay datos guardados en localStorage, se aplican sobre el objeto BRAND antes de que la pagina renderice.

### Editor UI (solo en index.html)

El editor es un panel colapsable/expandible dentro de `index.html` con:
- Formulario agrupado por seccion (Identidad, Contacto, Cuenta, Colores)
- Color pickers nativos para campos de color
- Inputs numericos para montos
- Preview en tiempo real (el header, footer y builder reflejan los cambios)
- Botones: Guardar, Resetear, Exportar JSON, Importar JSON

### Persistencia

- `localStorage` key: `brandOverrides` — objeto JSON con solo los campos modificados
- Al cargar cualquier pagina, `brand-override.js` hace deep merge sobre `BRAND`
- Exportar/Importar como archivo `.json` para compartir configs entre equipos

## Tareas

| Task | Titulo | Descripcion | Prioridad |
|------|--------|-------------|-----------|
| [TASK-007](TASK-007-brand-override-system.md) | Sistema de override de marca | JS para persistir y aplicar overrides desde localStorage | Alta | Done |
| [TASK-008](TASK-008-brand-editor-ui.md) | UI del editor de marca | Panel con formulario en index.html | Alta | Done |
| [TASK-009](TASK-009-brand-editor-styles.md) | Estilos del editor | CSS para el panel editor | Alta | Done |
| [TASK-010](TASK-010-connect-override-all-pages.md) | Conectar override a todas las paginas | Agregar brand-override.js a todos los HTML | Media | Done |
| [TASK-011](TASK-011-brand-presets.md) | Presets y export/import | Guardar/cargar configs nombradas + JSON | Media | Done |

## Orden de ejecucion

```
TASK-007 (override system)
    |
    +---> TASK-008 (editor UI) + TASK-009 (estilos) [en paralelo]
              |
              v
         TASK-010 (conectar a todas las paginas)
              |
              v
         TASK-011 (presets y export/import)
```

## Restricciones

- **No modificar brand-config.js** — el editor no escribe archivos, solo persiste en localStorage
- **No modificar los helpers** (formattedTotal, applyBrandColors, etc.)
- **No agregar dependencias** — color picker nativo del browser, sin npm
- **No romper el flujo existente** — si no hay overrides guardados, todo funciona igual que antes
- **Responsive** — el editor debe funcionar en pantallas chicas (colapsado por default)

## Criterio de exito

1. Un usuario no tecnico puede abrir `index.html`, expandir el editor, cambiar nombre/color/monto, y ver los cambios reflejados al iniciar la demo.
2. Los cambios persisten al recargar la pagina.
3. Se puede exportar una config como JSON y compartirla con otro colega que la importa.
4. Resetear vuelve a los valores de `brand-config.js` originales.
5. Si no se toca el editor, todo funciona exactamente igual que antes.
