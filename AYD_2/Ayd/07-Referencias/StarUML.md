---
tema: Herramientas — StarUML
fuente: https://docs.staruml.io/ + repo staruml/staruml-mcp-server
fecha: 2026-08-19
version_documentada: StarUML v7
---

# StarUML — referencia de trabajo

Nota de referencia para cuando haya que **crear un diagrama formal en StarUML**. No es material
de la materia: es el manual de la herramienta, condensado a lo que se necesita para operarla
desde un cliente MCP.

> [!important] Consultá esto ANTES de generar Mermaid para StarUML
> El dato que más ahorra tiempo está en la sección "Qué acepta". StarUML importa **solo 7 tipos**
> de Mermaid. Si generás un `graph LR` o un diagrama de casos de uso esperando que entre como
> UML, no va a funcionar como esperás.

Fuente: <https://docs.staruml.io/> · MCP: <https://github.com/staruml/staruml-mcp-server>

---

## Qué acepta: los 7 tipos de Mermaid importables

Verificado en el esquema de entrada de la herramienta `generate_diagram` del MCP y en la página
*Mermaid Support* de la documentación:

| Mermaid | Entra a StarUML | Diagrama resultante |
|---|---|---|
| `classDiagram` | Sí | Class Diagram (UML) |
| `sequenceDiagram` | Sí | Sequence Diagram (UML) |
| `stateDiagram` | Sí | Statechart Diagram (UML) |
| `flowchart` | Sí | **Flowchart** (no UML) |
| `erDiagram` | Sí | Entity-Relationship Diagram |
| `requirementDiagram` | Sí | Requirement Diagram (SysML) |
| `mindmap` | Sí | Mindmap Diagram |

**Todo lo demás no se puede importar por Mermaid**, aunque StarUML sí lo soporte como diagrama
nativo. En particular, y esto importa para esta materia:

| Diagrama de la materia | ¿Existe en StarUML? | ¿Se puede importar por Mermaid? |
|---|---|---|
| Casos de uso | Sí, nativo | **No** |
| Componentes | Sí, nativo | **No** |
| Despliegue (deployment) | Sí, nativo | **No** |
| Actividad | Sí, nativo | **No** |
| Objetos, comunicación, timing | Sí, nativos | **No** |
| DFD (flujo de datos) | Sí, nativo | **No** |
| Paquetes | Sí, nativo | **No** |

> [!warning] La trampa del `flowchart`
> Un `flowchart` de Mermaid **siempre** entra como diagrama de **Flowchart**, nunca como UML.
> Si tenés un `flowchart` que *representa* casos de uso —como los de [[Caso de uso]] o los del
> [[diseño]] del proyecto MCP—, al importarlo obtenés cajas y flechas de flowchart, no actores
> y elipses de casos de uso. El diagrama se crea; lo que no se traduce es la **semántica UML**.
>
> Si necesitás un diagrama de casos de uso formal, hay dos caminos honestos:
> 1. Importar el `flowchart` y después convertir los elementos a mano en StarUML.
> 2. Dibujarlo directo en StarUML desde el diagrama nativo de casos de uso, usando el Mermaid
>    solo como guion de qué actores y qué casos de uso poner.

---

## El MCP de StarUML: las 4 herramientas

Del repositorio `staruml/staruml-mcp-server`:

| Herramienta | Parámetros | Qué hace |
|---|---|---|
| `generate_diagram` | `code` (string, **requerido**) — código Mermaid | Genera el diagrama en StarUML |
| `get_all_diagrams_info` | ninguno | Información de todos los diagramas del proyecto |
| `get_current_diagram_info` | ninguno | Información del diagrama abierto |
| `get_diagram_image_by_id` | `diagramId` (string, requerido) | Devuelve la imagen de un diagrama |

El `diagramId` sale de `get_all_diagrams_info`. Es el mismo patrón que
[[diseño|nuestro DA-06]]: primero listás para conseguir el id, después pedís por id.

**`generate_diagram` acepta Mermaid crudo en el parámetro `code`.** Por eso el flujo cruzado
funciona sin que nadie convierta nada: el texto que devuelve `obtener_diagrama` de nuestro
servidor entra directo acá.

---

## Requisitos para que funcione

| Requisito | Valor |
|---|---|
| StarUML | **v7.0.0 o superior** |
| Node.js | **v22 o superior** |
| API Server de StarUML | **activado** (ver abajo) |
| Puerto por defecto | 58321 |

### Activar el API Server (se olvida y es la causa típica de fallo)

El MCP no habla con StarUML por magia: usa el **API Server** interno de StarUML, que viene
apagado. Hay que editar `settings.json`:

| SO | Ruta |
|---|---|
| **macOS** | `/Users/<usuario>/Library/Application Support/StarUML/settings.json` |
| Windows | `C:\Users\<usuario>\AppData\Roaming\StarUML\settings.json` |
| Linux | `~/.config/StarUML/settings.json` |

```json
{
  "apiServer": true,
  "apiServerPort": 58321
}
```

### Conectar el MCP

```json
{
  "mcpServers": {
    "staruml-mcp-server": {
      "command": "npx",
      "args": ["-y", "staruml-mcp-server"]
    }
  }
}
```

Si el puerto del API Server no es el 58321, se pasa `--api-port=<puerto>` en los `args`.

---

## Sin MCP: importar Mermaid a mano

También se puede, y conviene saberlo para cuando el MCP no esté conectado:

**Tools → Generate Diagram by Mermaid** → pegar el código → *Generate* → elegir el paquete que
va a contener el diagrama y sus elementos.

---

## Limitaciones de la importación, por tipo

Cosas de Mermaid que StarUML **ignora** al importar. Útil para no perder tiempo escribiendo algo
que no va a sobrevivir el viaje:

| Tipo | Lo que se pierde |
|---|---|
| Class Diagram | Namespaces, estilos y clases CSS, formato Markdown, links, interacciones |
| Sequence Diagram | Group/Box, color de fondo, estilos, menú de actor; mensajes sin punta de flecha, líneas con extremos cruzados, flechas bidireccionales. La activación se muestra en todo el diagrama |
| State Diagram | Estados compuestos, concurrencia, estilos y clases, formato Markdown |
| Flowchart | Algunas formas de nodo, formas expandidas, tipos de flecha no sólidos, animación, **subgraphs** |
| ER Diagram | Formato Markdown, estilos y clases |
| Requirement Diagram | Formato Markdown, estilos y clases |
| Mindmap | Formas de nodo, iconos y clases, formato Markdown |

> [!note] Los `subgraph` no sobreviven
> Varios diagramas de la bóveda usan `subgraph` para marcar el límite del sistema — por ejemplo
> el de [[Caso de uso]] y el de contexto en [[diseño]]. Al importarlos a StarUML **los subgraph
> se pierden**: los nodos entran, la caja que los agrupaba no.

---

## Los diagramas de la materia en StarUML

Mapa de qué diagrama nativo usar para cada tema del curso. Los nativos existen todos; la columna
de la derecha es la que dice si se puede llegar ahí por Mermaid o hay que dibujar.

| Tema | Diagrama en StarUML | Vía |
|---|---|---|
| [[Caso de uso]], [[Modelo de casos de uso del negocio]] | Use Case Diagram | dibujar |
| [[Modelo 4+1 vistas]] — vista lógica | Class Diagram, Package Diagram | Mermaid (clases) / dibujar (paquetes) |
| [[Modelo 4+1 vistas]] — vista de procesos | Activity Diagram | dibujar |
| [[Modelo 4+1 vistas]] — vista de desarrollo | Component Diagram, Package Diagram | dibujar |
| [[Modelo 4+1 vistas]] — vista física | Deployment Diagram | dibujar |
| Modelo entidad-relación | Entity-Relationship Diagram | Mermaid |
| DFD | Data Flow Diagram | dibujar |
| Estados | Statechart Diagram | Mermaid |
| Secuencia | Sequence Diagram | Mermaid |

StarUML v7 además trae C4, BPMN, wireframes y arquitectura AWS/GCP como diagramas adicionales, y
SysML (requisitos, bloques, paramétrico).

---

## Notas relacionadas

- [[Excalidraw]] — la otra herramienta de dibujo del ecosistema
- [[diseño]] — el diseño del servidor MCP y el flujo cruzado
- [[Modelo 4+1 vistas]] — qué diagrama UML pide cada vista
- [[Caso de uso]]

## Preguntas de repaso

1. ¿Cuáles son los 7 tipos de Mermaid que StarUML puede importar?
2. Tenés un `flowchart` que modela casos de uso. ¿Qué obtenés al importarlo y qué NO?
3. ¿Qué parámetro recibe `generate_diagram` y de qué tipo?
4. ¿Qué hay que activar en StarUML para que el MCP pueda hablarle, y dónde?
5. ¿Qué le pasa a un `subgraph` de Mermaid al importarlo?
