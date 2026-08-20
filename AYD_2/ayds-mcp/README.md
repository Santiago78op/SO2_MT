# tutor-ayds — servidor MCP de la bóveda de Análisis y Diseño de Sistemas

Servidor MCP local que expone una bóveda de Obsidian como herramientas para clientes MCP
(Claude Desktop, Claude Code).

**Qué hace:** sirve el contenido de la bóveda (notas, glosario, diagramas, flashcards), el
manual de las herramientas de dibujo del ecosistema, y registra el progreso de los quizzes.

**Qué NO hace, a propósito:** no razona, no dibuja, no convierte formatos y no llama a otros
servidores MCP. Armar un quiz o decidir a qué diagrama UML corresponde un `flowchart` es
trabajo del modelo cliente. Dibujar es de StarUML y de Excalidraw, cada uno por su propio MCP.
El cliente es el único integrador.

El diseño completo (actores, requerimientos, diagramas, decisiones de arquitectura) está en
`../Ayd/06-Proyecto-MCP/diseño.md`.

---

## Puesta en marcha en el Mac (M5) — la versión corta

```bash
# 1. Traer el proyecto al Mac SIN node_modules ni dist (ver la advertencia de abajo)
cd ~/donde/lo/pusiste/ayds-mcp

# 2. Instalar y compilar EN EL MAC
npm install
npm run build

# 3. Chequear que no falte nada; imprime los comandos con tus rutas reales
npm run comprobar -- /Users/TU-USUARIO/ruta/a/Ayd

# 4. Probar sin conectar nada
npm run verificar
VAULT_PATH="/Users/TU-USUARIO/ruta/a/Ayd" npm run demo
```

El paso 3 verifica versión y arquitectura de Node, dependencias, compilación, estructura de la
bóveda y permisos de macOS. Si algo falta te dice el comando exacto para arreglarlo, y si todo
está bien te imprime el `claude mcp add` y el JSON de Claude Desktop **ya completados con tus
rutas**, para copiar y pegar.

> [!warning] No copies `node_modules` desde otra máquina
> TypeScript 7 instala un **binario del compilador por plataforma**. Si traés el `node_modules`
> de una máquina Windows, en el Mac vas a tener `@typescript/typescript-win32-x64` y ningún
> binario de macOS, así que `npm run build` falla. La solución:
>
> ```bash
> rm -rf node_modules dist && npm install && npm run build
> ```
>
> Esto afecta **solo a compilar**. El servidor ya compilado corre en cualquier plataforma: sus
> dependencias de runtime (`@modelcontextprotocol/server` y `zod`) son JavaScript puro, sin un
> solo binario nativo.

---

## Requisitos

| Pieza | Versión | Nota |
|---|---|---|
| Node.js | **≥ 20**, arm64 | Lo exige `@modelcontextprotocol/server@2.0.0` |
| SDK MCP | `@modelcontextprotocol/server` 2.0.0 | Es el SDK **v2**. El paquete viejo `@modelcontextprotocol/sdk` (1.30.0) es la vía anterior |
| Revisión del protocolo | 2026-07-28 | La vigente en la especificación |

En un Mac con Apple Silicon, verificá que Node sea arm64 nativo:

```bash
node -v                 # >= 20
node -p process.arch    # tiene que decir "arm64"
which node              # esta ruta la necesitás para Claude Desktop
```

Si no tenés Node o es viejo:

```bash
brew install node        # o: brew upgrade node
# con nvm:
nvm install 22 && nvm use 22
```

### Dónde poner la bóveda

Evitá **iCloud Drive** (`~/Library/Mobile Documents/...`). iCloud descarga archivos por demanda,
y un archivo "en la nube" puede hacer fallar una lectura del servidor. Una carpeta local
cualquiera funciona mejor.

Si la bóveda está en `~/Documents`, `~/Desktop` o `~/Downloads`, macOS puede pedirte autorización
la primera vez que Claude intente leerla. Aceptala; si algo falla en silencio, revisá
**Ajustes → Privacidad y seguridad → Archivos y carpetas**.

---

## Instalación

```bash
cd ayds-mcp
npm install
npm run build
```

Se compila a `dist/`. El ejecutable del servidor queda en **`dist/src/index.js`**
(no en `dist/index.js`: el `rootDir` abarca `src/` y `pruebas/`, así que TypeScript conserva
esa estructura).

### Probar que funciona antes de conectarlo a nada

```bash
# Pruebas de seguridad, Unicode y escritura: usa una bóveda temporal, no toca la tuya
npm run verificar

# Demo end-to-end: levanta el servidor por stdio y llama varias herramientas
VAULT_PATH="/ruta/a/tu/bóveda" npm run demo
```

`npm run verificar` no necesita `VAULT_PATH`: se crea una bóveda temporal, corre las pruebas y
la borra.

`npm run demo` es **solo lectura**: omite `registrar_resultado` para no dejarte un resultado de
quiz inventado en tu historial real. Para probar también la escritura, apuntá `VAULT_PATH` a una
bóveda de prueba y activá el flag:

```bash
PERMITIR_ESCRITURA=1 VAULT_PATH="/tmp/boveda-prueba" npm run demo
```

Con el flag, la demo registra un resultado, lo muestra reflejado en `progreso()` y prueba que un
puntaje fuera de rango se rechaza. El puntaje se valida **dos veces**: el SDK lo rechaza contra
el esquema Zod antes de llegar al handler, y el handler lo revalida por su cuenta. Redundante a
propósito: el esquema puede cambiar, la regla de negocio no debería depender de eso.

---

## Configuración

La ruta de la bóveda se pasa por la variable de entorno **`VAULT_PATH`**. Es la única
configuración que tiene el servidor.

### Claude Code

```bash
claude mcp add tutor-ayds \
  --env VAULT_PATH=/Users/TU-USUARIO/ruta/a/Ayd \
  -- node /Users/TU-USUARIO/ruta/a/ayds-mcp/dist/src/index.js
```

Todo lo que va después de `--` es el comando que arranca el servidor. Las dos rutas tienen que
ser **absolutas**.

Para verificar y quitar:

```bash
claude mcp list
claude mcp get tutor-ayds
claude mcp remove tutor-ayds
```

### Claude Desktop

Editá `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "tutor-ayds": {
      "command": "/opt/homebrew/bin/node",
      "args": ["/Users/TU-USUARIO/ruta/a/ayds-mcp/dist/src/index.js"],
      "env": {
        "VAULT_PATH": "/Users/TU-USUARIO/ruta/a/Ayd"
      }
    }
  }
}
```

> [!warning] Poné la ruta absoluta de `node`, no `"node"`
> Claude Desktop es una app de macOS y **no hereda el `PATH` de tu terminal**. Si escribís
> `"command": "node"`, la app no lo encuentra y el servidor no aparece — sin ningún mensaje
> claro que explique por qué. Es la causa número uno de "mi servidor MCP no carga".
>
> Averiguá tu ruta con:
> ```bash
> which node
> ```
> En Homebrew para Apple Silicon suele ser `/opt/homebrew/bin/node`. Si usás nvm, va a ser algo
> como `/Users/tu-usuario/.nvm/versions/node/v22.x.x/bin/node`.

Después de editar el JSON hay que **cerrar y reabrir Claude Desktop** (no alcanza cerrar la
ventana: salí de la app del todo).

---

## Las 12 herramientas

| Herramienta | Qué devuelve | Escribe |
|---|---|---|
| `listar_temas()` | Las notas de `01-Notas/` con tema, fuente y fecha | No |
| `leer_nota(nombre)` | El contenido completo de una nota | No |
| `buscar(consulta)` | Fragmentos con archivo y número de línea | No |
| `glosario(termino?)` | Definición de un término, o el glosario completo | No |
| `listar_diagramas()` | Archivos de `02-Diagramas/` **más** los bloques mermaid de las notas | No |
| `obtener_diagrama(nombre)` | La fuente cruda del diagrama, con su tipo | No |
| `obtener_flashcards(tema, cantidad?)` | Tarjetas de repaso, ya separadas en P / R | No |
| `registrar_resultado(tema, puntaje, comentarios?)` | Agrega una línea a `05-Quizzes/progreso.md` | **Sí** |
| `progreso()` | Temas evaluados, puntajes y temas pendientes | No |
| `referencia(herramienta?)` | El manual de StarUML/Excalidraw y el puente de la teoría al diagrama | No |
| `metodo_tarea(entregable?)` | El método para resolver una tarea, o la guía paso a paso de un entregable | No |
| `enunciado(nombre?)` | El enunciado de una tarea, para citarlo textual | No |

**Once de doce son de solo lectura.** La única escritura toca un único archivo.

### Cómo se identifican los diagramas

Un `.svg` tiene nombre de archivo, pero un bloque mermaid vive *dentro* de una nota y no tiene
nombre propio. Se direccionan así:

```
Modelo 4+1 vistas#mermaid-1     ← bloque mermaid: nota + ordinal
diagrama-clases.excalidraw      ← archivo de 02-Diagramas/
```

Llamá **`listar_diagramas()` primero** para obtener el id exacto. No hace falta construirlo a
mano, y por eso no importa que los ordinales se corran si insertás un diagrama nuevo al
principio de una nota.

`obtener_diagrama` también acepta el nombre de una nota a secas: si tiene un solo diagrama lo
devuelve, y si tiene varios falla listando los ids disponibles.

---

## 3 prompts de prueba

### 1. Consulta simple — que el modelo lea la bóveda

```
¿Qué notas tengo sobre arquitectura de software? Leé la del modelo 4+1
y explicame en qué se diferencian la vista de despliegue y la vista física.
```

Debería llamar `listar_temas` y después `leer_nota("Modelo 4+1 vistas")`. La respuesta correcta
tiene que salir de la nota, incluida la advertencia sobre el nombre de la vista de desarrollo.

### 2. Quiz con registro — la única escritura

```
Tomame un quiz de 5 preguntas de casos de uso del negocio. Cuando termine,
corregime y registrá el resultado.
```

El modelo llama `obtener_flashcards("Casos de uso del negocio", 5)`, arma el quiz **él mismo**
(el servidor solo entrega las tarjetas), corrige y al final llama `registrar_resultado`.
Conviene que te pregunte antes de registrar.

### 3. Flujo cruzado — tres sistemas, un integrador

```
Tomá el diagrama de secuencia de la nota "diseño" del proyecto MCP
y creálo en StarUML. Antes de generarlo, revisá la referencia de StarUML.
```

Este es el prompt interesante, porque cruza tres sistemas:

1. El cliente llama `referencia("staruml")` en **tutor-ayds** y confirma que un `sequenceDiagram`
   sí se puede importar.
2. El cliente llama `listar_diagramas()` en **tutor-ayds** para conseguir el id.
3. El cliente llama `obtener_diagrama(id)` en **tutor-ayds** y recibe el texto mermaid.
4. El cliente le pasa ese texto al **MCP de StarUML**: `generate_diagram({ code: "sequenceDiagram..." })`.

**tutor-ayds y el MCP de StarUML nunca se hablan entre sí.** El texto mermaid viaja
`tutor-ayds → cliente → StarUML`. Los servidores MCP no se comunican entre ellos: la topología
es una estrella con el cliente al centro. Que funcione sin ninguna conversión es porque el
formato que ya vive en las notas (mermaid) es el que StarUML y Excalidraw aceptan — verificado en
el esquema de entrada de `generate_diagram`, que recibe un `code` de tipo string con Mermaid crudo.

> [!warning] Pedí un diagrama de secuencia, no de casos de uso
> StarUML importa **solo 7 tipos** de Mermaid: `classDiagram`, `sequenceDiagram`, `stateDiagram`,
> `flowchart`, `erDiagram`, `requirementDiagram` y `mindmap`. **Casos de uso, componentes,
> despliegue y actividad no se pueden importar por Mermaid.**
>
> Los diagramas de casos de uso de la bóveda están escritos como `flowchart`, así que entran —
> pero entran como **diagrama de Flowchart**, no como Use Case Diagram UML. El diagrama se crea;
> lo que no se traduce es la semántica UML.
>
> Está todo documentado en `07-Referencias/StarUML.md`, y `referencia("staruml")` se lo sirve al
> cliente. Por eso el prompt le pide revisar la referencia primero.

**Requisitos del lado de StarUML** (no de este servidor): StarUML v7+, Node 22+, y el API Server
activado en su `settings.json` con `"apiServer": true` y `"apiServerPort": 58321`. En Mac ese
archivo está en `~/Library/Application Support/StarUML/`. Viene apagado de fábrica y es la causa
típica de que el MCP de StarUML no responda.

---

## Seguridad

Dos garantías, y las dos están **probadas** en `npm run verificar`, no solo declaradas:

**1. Ninguna ruta se escapa de `VAULT_PATH`.** Toda ruta se resuelve a absoluta, se le aplica
`realpath` (que sigue los symlinks) y después se compara el prefijo contra la raíz de la
bóveda. Se rechazan `../`, las rutas absolutas, los symlinks que apuntan afuera y las carpetas
hermanas con prefijo parecido (`Ayd-privado` no pasa por ser `Ayd` + sufijo).

El orden importa: resolver el symlink **antes** de comparar. Un chequeo que solo busca `..` en
el string deja pasar un symlink que apunta a `/etc/passwd`, porque ese nombre no tiene ningún
`..`.

**2. Solo se escribe `05-Quizzes/progreso.md`.** La ruta de escritura sale de una función sin
parámetros, así que no hay por dónde pasarle otro archivo. Se usa *append*, nunca sobrescritura:
lo peor que puede pasar si el proceso muere a mitad de una escritura es una fila incompleta,
no la pérdida del historial. Los comentarios se escapan para que un `|` no rompa la tabla
markdown.

> La prueba del symlink se **omite en Windows** (crear symlinks requiere privilegios). En tu Mac
> sí corre: si ves `OMITIDA symlink`, es que la estás corriendo en Windows.

Si `05-Quizzes/progreso.md` no existe, `registrar_resultado` lo crea con encabezado en la
primera llamada.

---

## Problemas comunes

| Síntoma | Causa | Solución |
|---|---|---|
| El servidor no aparece en Claude Desktop | La app no hereda el `PATH` | Ruta absoluta de `node` en `"command"` (ver arriba) |
| `Falta la variable de entorno VAULT_PATH` | No se pasó la variable | Agregá `"env": {"VAULT_PATH": "..."}` o `--env VAULT_PATH=...` |
| `Cannot find name 'node:fs'` al compilar (~25 errores) | TypeScript 7 **no** toma `@types/node` automáticamente como TS 5 | Ya está resuelto con `"types": ["node"]` en `tsconfig.json`. Si clonás el proyecto y ves esto, es esa línea |
| "No existe la nota" con una nota que sí existe y tiene acentos | Unicode NFC vs NFD | Ya está resuelto: las comparaciones se normalizan. Si vuelve a pasar, mirá el comentario de `listarArchivos` en `src/boveda.ts` |
| El cliente desconecta con un error de parseo | Algún `console.log` en el servidor | En stdio, `stdout` es del protocolo. Todo log va a `stderr` con `console.error` |

### El detalle de Unicode, porque en un Mac va a aparecer

macOS guarda los nombres de archivo en **NFD**: `Descripción textual.md` se guarda con la `o` y
su tilde como dos code points separados. Cuando el modelo pide la nota, el nombre viene en
**NFC**, con un solo code point. Se ven idénticos y `===` da `false`.

La regla que sale de eso y que está aplicada en todo el código:

> Normalizar sirve para **comparar** y para **mostrar**.
> **Nunca** se normaliza un valor que después se va a usar como ruta de disco.

La primera versión de `listarArchivos` normalizaba los nombres que devolvía, y eso rompía la
lectura de las notas con acento — las pruebas lo agarraron. Está documentado en el comentario de
esa función.

---

## Estructura del proyecto

```
ayds-mcp/                    (fuera de la bóveda: node_modules son decenas de
├── package.json              miles de archivos y ensucian el grafo de Obsidian)
├── tsconfig.json
├── comprobar-entorno.sh     Chequeo previo del entorno  (npm run comprobar)
├── README.md
├── src/
│   ├── index.ts             Registro de las 9 herramientas + transporte stdio
│   ├── boveda.ts            Seguridad de rutas, Unicode, frontmatter  ← leer primero
│   ├── notas.ts             RF-01, RF-02, RF-03
│   ├── glosario.ts          RF-04
│   ├── diagramas.ts         RF-05, RF-06  ← el flujo cruzado
│   ├── flashcards.ts        RF-07
│   ├── progreso.ts          RF-08, RF-09  ← la única escritura
│   ├── referencias.ts       RF-10  ← el segundo cerebro de herramientas
│   └── tareas.ts            RF-11, RF-12  ← método y guías de tareas
└── pruebas/
    ├── demo.ts              Cliente MCP real: handshake + llamadas
    ├── verificaciones.ts    33 pruebas de seguridad, Unicode y escritura
    ├── auditoria.ts         Auditoría: las 12 herramientas por el protocolo MCP real
    ├── auditar-boveda.mjs   Auditoría: contenido de la bóveda y coherencia de la documentación
    └── cobertura.mjs        Sonda: 34 consultas reales contra el MCP, ¿encuentran su nota?
```

Para entender el código, el orden que conviene: **`boveda.ts` → `index.ts` → el resto**.
`boveda.ts` tiene las decisiones difíciles; `index.ts` muestra cómo se conecta con MCP; los
demás módulos son lectura de archivos y parseo.
