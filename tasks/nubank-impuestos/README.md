# Demo Nubank Impuestos — Task Tracker

Demo independiente que simula el flujo de pago de impuestos estatales en la app Nubank Mexico.
9 pantallas secuenciales, 3 selectores vinculados en el builder, solo mobile.

Plan completo: `~/.claude/plans/kind-kindling-feigenbaum.md`
Screenshots de referencia: `reference/nubank-impuestos/`

## Status General

| Task | Titulo | Status | Depende de |
|------|--------|--------|------------|
| 1 | [Builder config + group locking](task-1-builder.md) | [x] Complete | - |
| 2 | [Stylesheet Nubank](task-2-css.md) | [x] Complete | - |
| 3 | [HTML 9 screens](task-3-html.md) | [x] Complete | Task 2 |
| 4 | [JavaScript logic](task-4-js.md) | [x] Complete | Task 3 |
| 5 | [Testing e integracion](task-5-testing.md) | [x] Complete | Task 1, 2, 3, 4 |

## Grafo de Dependencias

```
Task 1 (builder) ───────────────────────────┐
                                             ├── Task 5 (testing)
Task 2 (CSS) ─┐                             │
               ├── Task 3 (HTML) ── Task 4 (JS) ─┘
```

- Task 1 y Task 2 son independientes → pueden ejecutarse en paralelo
- Task 3 necesita que Task 2 este completa (usa las clases CSS)
- Task 4 necesita que Task 3 este completa (usa los IDs del HTML)
- Task 5 necesita que TODAS las anteriores esten completas

## Archivos del proyecto

### Nuevos (3)
- `nubank-impuestos.html` — pagina principal con 9 steps
- `css/nubank-impuestos-styles.css` — estilos completos
- `js/nubank-impuestos-script.js` — logica e interacciones

### Modificados (2)
- `config/demo-builder-config.js` — 3 opciones nuevas con `group`
- `index.html` — logica de group locking + mobileOnly
