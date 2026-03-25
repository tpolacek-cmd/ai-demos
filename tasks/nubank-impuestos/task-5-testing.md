# Task 5: Testing e integracion

**Status:** [x] Complete
**Depende de:** Task 1, Task 2, Task 3, Task 4 (todas deben estar completas)
**Archivos:** Todos los creados/modificados en tasks anteriores

## Checklist

### Builder UI
- [ ] Las 3 opciones Nubank aparecen en el builder (una por columna)
- [ ] Click en Nubank arrival → bloquea checkout y payment en Nubank
- [ ] Click en Nubank checkout → bloquea arrival y payment en Nubank
- [ ] Click en Nubank payment → bloquea arrival y checkout en Nubank
- [ ] Click en otra opcion (ej. WhatsApp) → desbloquea las 3 columnas
- [ ] Badge "Demo vinculada" aparece en columnas bloqueadas
- [ ] En modo desktop, "Iniciar Demo" abre mobile-viewer (mobileOnly)
- [ ] En modo mobile, "Iniciar Demo" abre mobile-viewer normalmente

### Demos existentes no rotas
- [ ] WhatsApp + Portal Estandar + Hey Banco funciona
- [ ] WhatsApp + Pago Directo BBVA + BBVA funciona
- [ ] QR + Portal Estandar + Hey Banco funciona
- [ ] forcedPayment de BBVA sigue funcionando (checkout BBVA fuerza payment BBVA)

### Flujo Nubank completo
- [ ] Step 0 (Face ID): Se muestra correctamente, boton navega a step 1
- [ ] Step 1 (Home): Scroll funciona, "Pagar Servicios" navega a step 2
- [ ] Step 2 (Pagar): "Nuevo servicio" navega a step 3, X cierra a step 1
- [ ] Step 3 (Servicios): Lista completa, "Estado [Nombre de Estado]" navega a step 4, back a step 2
- [ ] Step 4 (Metodo): "CURP" navega a step 5, back a step 3
- [ ] Step 5 (CURP Input): Input funciona, boton se activa con texto, submit con CURP o default navega a step 6
- [ ] Step 6 (Impuestos): 3 cards visibles, checkboxes togglean, total se actualiza, "Pagar todos" navega a step 7
- [ ] Step 7 (Confirmacion): Datos correctos, "Pagar" muestra "Procesando..." 2s y navega a step 8
- [ ] Step 8 (Exito): Fecha/hora correcta, folio generado, CURP correcto, "Volver al inicio" reinicia

### Visual / Mobile
- [ ] Contenido NO tapado por dynamic island en ninguna screen
- [ ] Screens 1-6 son visualmente consistentes con screenshots de referencia
- [ ] Screens 7-9 mantienen estilo Nubank (purple, fonts, spacing)
- [ ] Purple #820AD1 es consistente en todos los screens
- [ ] Scroll funciona correctamente en screens con contenido largo (step 1, step 3, step 7)
- [ ] Todo el contenido cabe dentro del frame del iPhone sin overflow visible
- [ ] No hay elementos cortados por los bordes redondeados del frame

### Edge cases
- [ ] CURP vacio en step 5 → usa default BEMD850101HDFRNN09
- [ ] Deseleccionar todos los taxes → total muestra $0.00
- [ ] Replay completo (Volver al inicio + recorrer todo de nuevo) funciona sin bugs

## Proceso de testing

1. Servir los archivos localmente:
   ```bash
   cd /home/manuel/Documents/tapi-demos-hub
   python3 -m http.server 8080
   ```

2. Abrir `http://localhost:8080` en el browser.

3. Verificar builder UI: seleccionar/deseleccionar opciones Nubank, verificar locking.

4. Iniciar demo Nubank (modo desktop o mobile → ambos deben abrir mobile-viewer).

5. Recorrer los 9 steps verificando cada checkpoint del checklist.

6. Volver al builder e iniciar una demo existente (WhatsApp + Portal + Hey Banco) para verificar que no se rompio.

7. Si hay problemas visuales, comparar contra screenshots en `reference/nubank-impuestos/`.
