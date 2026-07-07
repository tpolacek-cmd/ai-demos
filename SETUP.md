# Demo Hub — Guia de Setup

## 1. Descargar el proyecto

[Descargar ZIP desde Bitbucket](https://bitbucket.org/tapila/tapi-demos-hub/get/main.zip)

Descomprimir el archivo. Va a crear una carpeta tipo `tapila-tapi-demos-hub-xxxxx`. Renombrala a `tapi-demos-hub` y movela donde quieras (ej. tu carpeta de Documentos).

## 2. Requisitos

- **Claude Code** instalado ([descargar desde claude.ai/code](https://claude.ai/code))
- **Python 3** (ya viene instalado en macOS)

## 3. Levantar la demo

Click derecho en la carpeta del proyecto en Finder → "Abrir en Terminal". Ejecuta:

```bash
python3 -m http.server 8080
```

Abri en el browser: [http://localhost:8080](http://localhost:8080)

Dejalo corriendo mientras trabajas.

## 4. Abrir Claude Code

En otra ventana de Terminal (mismo click derecho → "Abrir en Terminal" en la carpeta del proyecto):

```bash
claude
```

Claude ya conoce el proyecto y sabe que archivos editar y cuales no. Solo tenes que pedirle lo que necesitas.

## 5. Que podes pedirle a Claude

### Cambiar la marca
```
Cambia la marca a [nombre de tu empresa] con color [hex]
```
Solo necesitas nombre y color. Claude cambia logo, colores, montos, textos y toda la demo se adapta sola.

### Ajustar la demo
```
Cambia el monto a $2,500
Agrega un campo de email en el checkout
Hace los botones mas grandes
Cambia los textos del chat de WhatsApp
```

### Demo Nubank (impuestos)
La demo de Nubank es independiente. Para modificarla:
```
En la demo de Nubank, cambia el monto del impuesto predial a $1,500
Cambia el color violeta de Nubank a azul
Agrega un cuarto impuesto a la lista
```

## 6. Ver los cambios

Despues de que Claude edita archivos, simplemente recarga la pagina en el browser (Cmd+R). Los cambios se ven al instante.

## 7. Tips

- Si Claude pregunta por permisos, dale "Allow" — solo edita archivos dentro de la carpeta del proyecto
- Si queres volver al estado original, descarga el ZIP de nuevo
- No hace falta instalar nada mas (no hay npm, no hay build, nada)
