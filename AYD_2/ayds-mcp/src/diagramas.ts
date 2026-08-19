/**
 * diagramas.ts — RF-05 (listar_diagramas) y RF-06 (obtener_diagrama).
 *
 * Este modulo es el corazon del FLUJO CRUZADO del diseno (seccion 4): entrega la
 * fuente de un diagrama para que el CLIENTE se la pase al MCP de StarUML o al de
 * Excalidraw.
 *
 * Regla que no se rompe (RNF-09): aca NO se dibuja, NO se convierte y NO se
 * traduce. Devolvemos el bloque mermaid TAL CUAL esta en la nota. Si lo
 * "mejoraramos" antes de entregarlo, este servidor pasaria a ser un traductor y
 * quedaria acoplado al formato del destino.
 *
 * Por que funciona igual sin convertir nada: el formato que ya vive en las notas
 * (mermaid) es el que los otros dos servidores aceptan. Mermaid es la moneda de
 * cambio del ecosistema.
 */

import { extname } from "node:path";

import {
  CARPETAS,
  ErrorHerramienta,
  clave,
  leerTexto,
  listarArchivos,
  nombreDeNota,
  normalizar,
  paraMostrar,
  parsearFrontmatter,
  rutaRelativa,
  sugerir,
} from "./boveda.js";

/** De donde salio el diagrama. */
export type OrigenDiagrama = "bloque-mermaid" | "archivo";

export interface Diagrama {
  /**
   * El identificador con el que se pide en RF-06.
   * DA-06: para un archivo es su nombre; para un bloque mermaid es "Nota#mermaid-N".
   */
  id: string;
  origen: OrigenDiagrama;
  /** El tipo de diagrama, ya interpretado ("secuencia", "clases", "flujo"...). */
  tipo: string;
  /** El formato del contenido: "mermaid", "excalidraw" o "svg". */
  formato: "mermaid" | "excalidraw" | "svg";
  /** Ruta dentro de la boveda del archivo que lo contiene. */
  ruta: string;
  /** Para bloques mermaid: la nota donde vive. */
  nota?: string;
  /** La primera linea del bloque mermaid, util para reconocerlo en un listado. */
  primeraLinea?: string;
  /** Cantidad de lineas de la fuente. */
  lineas: number;
}

export interface DiagramaConFuente extends Diagrama {
  /** La fuente cruda, lista para entregar a StarUML o Excalidraw. */
  fuente: string;
}

// ---------------------------------------------------------------------------
// Deteccion del tipo de diagrama
// ---------------------------------------------------------------------------

/**
 * Traduce la palabra clave inicial de un bloque mermaid a un nombre de tipo en
 * espanol.
 *
 * OJO con lo que este mapeo NO hace: no dice a que diagrama UML corresponde.
 * Un `flowchart` puede estar modelando casos de uso, componentes o un proceso —
 * decidirlo es razonamiento, y por eso ocurre en el cliente (es el paso 11 del
 * diagrama de secuencia del diseno). Nosotros solo reportamos el dato objetivo:
 * "esto arranca con la palabra flowchart".
 */
const TIPOS_MERMAID: Array<[RegExp, string]> = [
  [/^sequenceDiagram/, "secuencia"],
  [/^classDiagram/, "clases"],
  [/^erDiagram/, "entidad-relacion"],
  [/^stateDiagram(-v2)?/, "estados"],
  [/^flowchart/, "flujo"],
  [/^graph\s/, "flujo"],
  [/^journey/, "recorrido-usuario"],
  [/^gantt/, "gantt"],
  [/^mindmap/, "mapa-mental"],
  [/^timeline/, "linea-de-tiempo"],
  [/^C4Context|^C4Container|^C4Component/, "c4"],
];

function tipoDeMermaid(fuente: string): string {
  // La primera linea con contenido: puede haber comentarios "%%" antes.
  const primera =
    fuente
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l.length > 0 && !l.startsWith("%%")) ?? "";

  for (const [patron, nombre] of TIPOS_MERMAID) {
    if (patron.test(primera)) return nombre;
  }
  return "mermaid-desconocido";
}

// ---------------------------------------------------------------------------
// Extraccion de bloques mermaid
// ---------------------------------------------------------------------------

/**
 * Encuentra los bloques ```mermaid de un contenido markdown.
 *
 * Lo hacemos recorriendo lineas y no con una expresion regular global, por un
 * motivo concreto que aparecio armando la boveda: si un bloque mermaid contiene
 * a su vez un triple backtick en el texto de una etiqueta, una regex "no
 * codiciosa" corta el bloque en el lugar equivocado y entrega mermaid invalido.
 * Recorriendo lineas, el cierre es "una linea que es exactamente ```", que es la
 * regla real de markdown.
 */
export function extraerBloquesMermaid(contenido: string): Array<{ fuente: string; linea: number }> {
  const lineas = contenido.split(/\r?\n/);
  const bloques: Array<{ fuente: string; linea: number }> = [];

  let dentro = false;
  let acumulado: string[] = [];
  let lineaInicio = 0;

  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i] ?? "";
    const recortada = linea.trim();

    if (!dentro) {
      // Apertura: la linea empieza con ```mermaid (puede tener atributos despues).
      if (/^```+\s*mermaid\b/i.test(recortada)) {
        dentro = true;
        acumulado = [];
        lineaInicio = i + 1; // linea 1-based donde arranca la valla
      }
      continue;
    }

    // Cierre: una linea que es solo backticks.
    if (/^```+\s*$/.test(recortada)) {
      bloques.push({ fuente: acumulado.join("\n").trim(), linea: lineaInicio });
      dentro = false;
      continue;
    }

    acumulado.push(linea);
  }

  // Si el archivo termino sin cerrar el bloque, lo tomamos igual: es mejor
  // entregar algo que perder el diagrama en silencio.
  if (dentro && acumulado.length > 0) {
    bloques.push({ fuente: acumulado.join("\n").trim(), linea: lineaInicio });
  }

  return bloques.filter((b) => b.fuente.length > 0);
}

// ---------------------------------------------------------------------------
// RF-05 — listar_diagramas
// ---------------------------------------------------------------------------

/**
 * Inventario completo de diagramas: los archivos de 02-Diagramas/ MAS los bloques
 * mermaid embebidos en las notas.
 *
 * Esta herramienta es la que resuelve el problema de identidad de DA-06: el `id`
 * que devuelve es el que hay que pasarle a obtener_diagrama. El modelo nunca
 * tiene que construir un id a mano, y por eso no importa que los ordinales se
 * corran si insertas un diagrama nuevo al principio de una nota.
 */
export function listarDiagramas(): Diagrama[] {
  const encontrados: Diagrama[] = [];

  // --- 1. Archivos de 02-Diagramas/ ---
  for (const archivo of listarArchivos(CARPETAS.diagramas, [".excalidraw", ".svg"])) {
    const ext = extname(archivo).toLowerCase();
    const ruta = rutaRelativa(CARPETAS.diagramas, archivo);

    let lineas = 0;
    try {
      lineas = leerTexto(ruta).split("\n").length;
    } catch {
      // Un archivo ilegible no puede tumbar el inventario completo (RNF-03).
    }

    encontrados.push({
      id: paraMostrar(archivo),
      origen: "archivo",
      tipo: ext === ".excalidraw" ? "boceto-excalidraw" : "imagen-svg",
      formato: ext === ".excalidraw" ? "excalidraw" : "svg",
      ruta,
      lineas,
    });
  }

  // --- 2. Bloques mermaid dentro de las notas ---
  for (const archivo of listarArchivos(CARPETAS.notas, [".md"])) {
    const ruta = rutaRelativa(CARPETAS.notas, archivo);
    const nota = paraMostrar(nombreDeNota(archivo));

    let contenido: string;
    try {
      contenido = leerTexto(ruta);
    } catch {
      continue;
    }

    const bloques = extraerBloquesMermaid(contenido);
    bloques.forEach((bloque, indice) => {
      encontrados.push({
        // DA-06: "Nota#mermaid-N", con N empezando en 1.
        id: `${nota}#mermaid-${indice + 1}`,
        origen: "bloque-mermaid",
        tipo: tipoDeMermaid(bloque.fuente),
        formato: "mermaid",
        ruta,
        nota,
        primeraLinea: bloque.fuente.split("\n")[0] ?? "",
        lineas: bloque.fuente.split("\n").length,
      });
    });
  }

  return encontrados;
}

// ---------------------------------------------------------------------------
// RF-06 — obtener_diagrama
// ---------------------------------------------------------------------------

/**
 * Devuelve la fuente de un diagrama, lista para entregar a otro MCP.
 *
 * Acepta tres formas de pedirlo, de la mas precisa a la mas comoda:
 *
 *   1. "Modelo 4+1 vistas#mermaid-2"  → el id exacto de DA-06.
 *   2. "diagrama-clases.excalidraw"   → un archivo de 02-Diagramas/ (con o sin extension).
 *   3. "Modelo 4+1 vistas"            → el nombre de una nota. Si tiene UN solo
 *      bloque mermaid, lo devuelve. Si tiene varios, falla listando los ids
 *      disponibles, que es mas util que elegir uno por el modelo.
 *
 * La forma 3 existe porque es como el modelo va a pedirlo naturalmente cuando el
 * usuario dice "el diagrama de la nota X".
 */
export function obtenerDiagrama(nombre: string): DiagramaConFuente {
  const pedido = normalizar(nombre).trim();
  const inventario = listarDiagramas();

  // --- Forma 1: id exacto ---
  const exacto = inventario.find((d) => clave(d.id) === clave(pedido));
  if (exacto) return conFuente(exacto);

  // --- Forma 2: archivo, con o sin extension ---
  const archivo = inventario.find(
    (d) =>
      d.origen === "archivo" &&
      (clave(d.id) === clave(pedido) ||
        clave(nombreDeNota(d.id)) === clave(pedido)),
  );
  if (archivo) return conFuente(archivo);

  // --- Forma 3: nombre de nota ---
  const deLaNota = inventario.filter(
    (d) => d.origen === "bloque-mermaid" && clave(d.nota ?? "") === clave(pedido),
  );

  if (deLaNota.length === 1 && deLaNota[0]) {
    return conFuente(deLaNota[0]);
  }

  if (deLaNota.length > 1) {
    throw new ErrorHerramienta(
      `La nota "${pedido}" tiene ${deLaNota.length} diagramas. Pedi uno por su id exacto.`,
      deLaNota.map((d) => `${d.id}  (${d.tipo})`),
    );
  }

  // No se encontro de ninguna forma.
  throw new ErrorHerramienta(
    `No encontre el diagrama "${nombre}". Usa listar_diagramas para ver los ids disponibles.`,
    sugerir(
      nombre,
      inventario.map((d) => d.id),
    ),
  );
}

/**
 * Completa un Diagrama del inventario con su fuente cruda.
 *
 * Para un bloque mermaid hay que volver a leer la nota y recortar el bloque N.
 * Se podria haber guardado la fuente en el inventario de RF-05, pero entonces
 * listar_diagramas devolveria TODO el texto de los 34 diagramas de la boveda en
 * una sola respuesta e inundaria el contexto del cliente. Listar es un indice;
 * obtener es el contenido.
 */
function conFuente(diagrama: Diagrama): DiagramaConFuente {
  if (diagrama.origen === "archivo") {
    return { ...diagrama, fuente: leerTexto(diagrama.ruta) };
  }

  const contenido = leerTexto(diagrama.ruta);
  const bloques = extraerBloquesMermaid(contenido);

  // El id termina en "#mermaid-N": de ahi sacamos el indice.
  const coincidencia = /#mermaid-(\d+)$/.exec(diagrama.id);
  const indice = coincidencia?.[1] ? Number(coincidencia[1]) - 1 : 0;
  const bloque = bloques[indice];

  if (!bloque) {
    // Pasa si la nota se edito entre el listar y el obtener.
    throw new ErrorHerramienta(
      `El diagrama "${diagrama.id}" ya no esta en ${diagrama.ruta}. ` +
        `Puede que la nota cambio: volve a llamar listar_diagramas.`,
    );
  }

  return { ...diagrama, fuente: bloque.fuente };
}

/**
 * Nota de disenio sobre lo que este modulo NO exporta:
 *
 * No hay `convertir_a_uml()`, `exportar_svg()` ni `dibujar()`. Son los limites
 * explicitos del proyecto. Dibujar es de StarUML y de Excalidraw, cada uno por su
 * propio MCP, y el cliente es quien los orquesta. Si alguna vez sentis la
 * tentacion de agregar una funcion de dibujo aca, mira otra vez el diagrama de
 * contexto: este servidor es una hoja, no un integrador.
 */
