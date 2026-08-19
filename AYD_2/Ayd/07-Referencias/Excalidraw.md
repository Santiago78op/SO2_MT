---
tema: Herramientas — Excalidraw
fuente: https://docs.excalidraw.com/docs + repo excalidraw/mermaid-to-excalidraw
fecha: 2026-08-19
---

# Excalidraw — referencia de trabajo

Nota de referencia para cuando haya que **bocetar un diagrama en Excalidraw**. Es el manual de la
herramienta, no material de la materia.

> [!important] Consultá esto ANTES de generar Mermaid para Excalidraw
> El dato clave está en "Qué acepta": Excalidraw convierte **5 tipos** de Mermaid en formas
> editables. El resto igual "funciona", pero entra como una **imagen SVG pegada**, no como
> objetos que puedas mover. Es un fracaso silencioso: parece que salió bien hasta que intentás
> editar.

Fuente: <https://docs.excalidraw.com/docs> · Conversor: <https://github.com/excalidraw/mermaid-to-excalidraw>

---

## Qué acepta: 5 tipos nativos, el resto como imagen

Verificado en el `switch` de `src/parseMermaid.ts` del repositorio `mermaid-to-excalidraw`:

| Mermaid | Resultado en Excalidraw |
|---|---|
| `flowchart` / `graph` | **Formas editables** (parser nativo `flowchart-v2`) |
| `sequenceDiagram` | **Formas editables** |
| `classDiagram` | **Formas editables** |
| `erDiagram` | **Formas editables** |
| `stateDiagram` | **Formas editables** |
| **cualquier otro** | **Imagen SVG** embebida en base64 — no editable |

El fallback está en el `default` del switch: llama a `convertSvgToGraphImage()`, que devuelve un
objeto `GraphImage` con MIME type, data URL, ancho y alto.

> [!warning] El fallback también se dispara por error
> Si el parseo nativo lanza una excepción —Mermaid inválido, una sintaxis que el parser no
> maneja—, el `catch` **también** cae al SVG. O sea: un diagrama de tipo soportado pero con un
> error de sintaxis te va a entrar como imagen igual, sin decirte por qué.
>
> Si esperabas formas editables y te salió una imagen, lo primero a revisar es si el Mermaid es
> válido, no si el tipo está soportado.

### Comparado con StarUML

| Mermaid | StarUML | Excalidraw |
|---|---|---|
| `classDiagram` | Sí | nativo |
| `sequenceDiagram` | Sí | nativo |
| `stateDiagram` | Sí | nativo |
| `flowchart` / `graph` | Sí (como Flowchart) | nativo |
| `erDiagram` | Sí | nativo |
| `mindmap` | **Sí** | imagen SVG |
| `requirementDiagram` | **Sí** | imagen SVG |
| `gantt`, `journey`, `timeline`, `C4` | No | imagen SVG |

Los **5 tipos del medio son el terreno común**: entran bien en las dos herramientas. Si un
diagrama tiene que servir para ambas, conviene escribirlo como uno de esos cinco.

---

## Límites del conversor

Configurables, pero con estos valores por defecto:

| Límite | Valor por defecto |
|---|---|
| Máximo de aristas (`maxEdges`) | **500** |
| Máximo de caracteres (`maxTextSize`) | **50000** |

El conversor solo respeta **algunos** parámetros de configuración de Mermaid: los estilos de
curva de flowchart, las variables de tema, y los dos máximos de arriba. El resto de la config de
Mermaid se ignora.

Los 34 diagramas de esta bóveda están muy lejos de esos límites: el más grande tiene 16 pasos.

---

## La API, si algún día hace falta programarlo

```js
import { parseMermaidToExcalidraw } from '@excalidraw/mermaid-to-excalidraw'
import { convertToExcalidrawElements } from '@excalidraw/excalidraw'
```

`parseMermaidToExcalidraw(diagramDefinition, config?)` devuelve `{ elements, files }`.

Detalle importante: los `elements` que salen del parser están en formato **"skeleton"** y hay que
pasarlos por `convertToExcalidrawElements()` para obtener elementos Excalidraw completos. Si se
saltea ese paso, el resultado no se renderiza.

Hay un playground para probar sin escribir código: <https://mermaid-to-excalidraw.vercel.app>

---

## El formato `.excalidraw`

Es **JSON**. La documentación del esquema está en `/docs/codebase/json-schema`.

Para nuestro servidor MCP esto importa por una razón concreta: `obtener_diagrama` devuelve el
**JSON completo tal cual** cuando el diagrama es un archivo `.excalidraw`, sin interpretarlo. Es
la misma regla que con Mermaid — [[diseño|el servidor no convierte nada]].

Estado actual de la bóveda: `02-Diagramas/` **está vacía**. Todavía no hay ningún `.excalidraw`
ni `.svg` guardado, así que los 34 diagramas que hay son todos bloques Mermaid dentro de las
notas.

---

## Cuándo usar Excalidraw y cuándo StarUML

| Situación | Herramienta |
|---|---|
| Necesito el diagrama **formal**, con semántica UML correcta, para entregar | StarUML |
| Quiero **pensar** el diagrama, moverlo, probar variantes | Excalidraw |
| Es un diagrama que no es UML (un esquema, una explicación, una pizarra) | Excalidraw |
| Necesito casos de uso, componentes, despliegue o actividad como UML | StarUML, **dibujando a mano** (no se importan por Mermaid) |
| Quiero exportar una imagen rápida para un documento | Excalidraw |

---

## Notas relacionadas

- [[StarUML]] — la otra herramienta del ecosistema, y la comparación de soporte Mermaid
- [[diseño]] — el diseño del servidor MCP y por qué no convierte formatos
- [[Modelo 4+1 vistas]]

## Preguntas de repaso

1. ¿Qué 5 tipos de Mermaid entran a Excalidraw como formas editables?
2. ¿Qué pasa con un `mindmap`? ¿Y por qué eso es un fracaso silencioso?
3. Generaste un `classDiagram` y entró como imagen en vez de formas. ¿Cuál es la primera causa a revisar?
4. ¿Cuáles son los 5 tipos que funcionan bien en StarUML **y** en Excalidraw?
5. ¿Por qué hace falta `convertToExcalidrawElements()` después de parsear?
