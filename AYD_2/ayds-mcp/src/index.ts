#!/usr/bin/env node
/**
 * index.ts — punto de entrada del servidor MCP "tutor-ayds".
 *
 * Aca se hacen tres cosas y nada mas:
 *   1. Arrancar y validar la boveda (VAULT_PATH).
 *   2. Registrar las 12 herramientas con su descripcion para el modelo.
 *   3. Conectar el transporte stdio y quedarse escuchando.
 *
 * La logica de cada herramienta vive en su modulo (notas.ts, glosario.ts,
 * diagramas.ts, flashcards.ts, progreso.ts, referencias.ts, tareas.ts). Este archivo es la CAPA DE
 * PRESENTACION: traduce entre el protocolo MCP y esos modulos.
 *
 * ------------------------------------------------------------------------
 * REGLA DE ORO DE STDIO (RNF-04 / DA-10)
 * ------------------------------------------------------------------------
 * En el transporte stdio, `stdout` transporta los mensajes JSON-RPC del
 * protocolo. Un solo `console.log` mezcla texto suelto en esa trama, el cliente
 * no puede parsearla y desconecta con un error confuso que parece un bug del
 * cliente.
 *
 * Por eso TODO log de este servidor va a `stderr` con `console.error`. No es una
 * preferencia de estilo: es un requisito del transporte.
 */

import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { z } from "zod";

import { ErrorHerramienta, inicializarBoveda, raiz } from "./boveda.js";
import { buscar, leerNota, listarTemas } from "./notas.js";
import { consultarGlosario } from "./glosario.js";
import { listarDiagramas, obtenerDiagrama } from "./diagramas.js";
import { obtenerFlashcards } from "./flashcards.js";
import { obtenerProgreso, registrarResultado } from "./progreso.js";
import { listarReferencias, obtenerReferencia } from "./referencias.js";
import { listarEnunciados, listarGuias, obtenerEnunciado, obtenerMetodo } from "./tareas.js";

// ---------------------------------------------------------------------------
// Utilidades de respuesta
// ---------------------------------------------------------------------------

/** Forma que espera MCP para el resultado de una herramienta. */
type Resultado = {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
};

function texto(cuerpo: string): Resultado {
  return { content: [{ type: "text", text: cuerpo }] };
}

/**
 * Envuelve la ejecucion de una herramienta (DA-09 / RNF-03).
 *
 * Esta funcion es la razon por la que el servidor "nunca se cae". Todos los
 * handlers pasan por aca, y aca se atrapan las dos clases de error:
 *
 *   - ErrorHerramienta: algo que el modelo pidio mal. Se le devuelve explicado,
 *     con sugerencias, y con `isError: true`. El modelo puede leerlo y reintentar
 *     con otro argumento. La sesion sigue viva.
 *
 *   - Cualquier otro error: un bug nuestro o un problema del sistema de archivos.
 *     Se registra completo en stderr (para poder depurarlo) pero al cliente se le
 *     manda un mensaje corto. Tampoco se cae.
 *
 * Si en vez de esto dejaramos que las excepciones suban, una nota mal escrita
 * mataria el proceso y habria que reiniciar Claude Desktop.
 */
async function ejecutar(nombre: string, fn: () => string | Promise<string>): Promise<Resultado> {
  try {
    return texto(await fn());
  } catch (error) {
    if (error instanceof ErrorHerramienta) {
      let mensaje = `Error en ${nombre}: ${error.message}`;
      if (error.sugerencias.length > 0) {
        mensaje += `\n\nQuizas quisiste decir alguno de estos:\n`;
        mensaje += error.sugerencias.map((s) => `  - ${s}`).join("\n");
      }
      return { content: [{ type: "text", text: mensaje }], isError: true };
    }

    // Error inesperado: traza completa a stderr, mensaje sobrio al cliente.
    console.error(`[tutor-ayds] Error inesperado en ${nombre}:`, error);
    const detalle = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text:
            `Error interno en ${nombre}: ${detalle}\n` +
            `El servidor sigue funcionando; podes reintentar o probar otra herramienta.`,
        },
      ],
      isError: true,
    };
  }
}

// ---------------------------------------------------------------------------
// Arranque
// ---------------------------------------------------------------------------

let rutaBoveda: string;
try {
  rutaBoveda = inicializarBoveda();
} catch (error) {
  // Aca SI terminamos el proceso: sin boveda no hay nada que servir, y es mejor
  // fallar en el arranque con un mensaje claro que aceptar conexiones y fallar en
  // cada llamada.
  console.error(`[tutor-ayds] No se pudo iniciar:\n${error instanceof Error ? error.message : error}`);
  process.exit(1);
}

const server = new McpServer({
  name: "tutor-ayds",
  version: "1.0.0",
});

// ---------------------------------------------------------------------------
// RF-01 — listar_temas
// ---------------------------------------------------------------------------

server.registerTool(
  "listar_temas",
  {
    title: "Listar temas y notas",
    description:
      "Lista todas las notas de la boveda de Analisis y Diseno de Sistemas con su tema, " +
      "fuente y fecha. USALA PRIMERO cuando no sepas que notas existen o cuando " +
      "necesites el nombre exacto de una nota para pasarselo a leer_nota. " +
      "Devuelve los nombres tal como estan en disco, asi que evita inventarlos.",
    inputSchema: z.object({}),
    annotations: { readOnlyHint: true },
  },
  async () =>
    ejecutar("listar_temas", () => {
      const notas = listarTemas();
      if (notas.length === 0) return "La carpeta 01-Notas/ esta vacia.";

      const lineas = [`${notas.length} notas en la boveda:`, ""];
      for (const nota of notas) {
        lineas.push(`- ${nota.nombre}`);
        lineas.push(`    tema: ${nota.tema}  |  fecha: ${nota.fecha}`);
        lineas.push(`    fuente: ${nota.fuente}`);
      }
      return lineas.join("\n");
    }),
);

// ---------------------------------------------------------------------------
// RF-02 — leer_nota
// ---------------------------------------------------------------------------

server.registerTool(
  "leer_nota",
  {
    title: "Leer una nota completa",
    description:
      "Devuelve el contenido COMPLETO de una nota de 01-Notas/, incluyendo su " +
      "frontmatter, los diagramas mermaid y la seccion de preguntas de repaso. " +
      "Usala cuando necesites el material de un concepto para explicarlo, resumirlo " +
      "o armar preguntas. El nombre puede ir con o sin '.md' y no distingue " +
      "mayusculas ni acentos mal normalizados. Si no existe, te devuelve nombres parecidos.",
    inputSchema: z.object({
      nombre: z
        .string()
        .describe(
          "Nombre de la nota, como lo devuelve listar_temas. Ejemplo: 'Modelo 4+1 vistas'.",
        ),
    }),
    annotations: { readOnlyHint: true },
  },
  async ({ nombre }) =>
    ejecutar("leer_nota", () => {
      const nota = leerNota(nombre);
      return [
        `# Nota: ${nota.nombre}`,
        `Ruta en la boveda: ${nota.ruta}`,
        "",
        "--- contenido ---",
        "",
        nota.contenido,
      ].join("\n");
    }),
);

// ---------------------------------------------------------------------------
// RF-03 — buscar
// ---------------------------------------------------------------------------

server.registerTool(
  "buscar",
  {
    title: "Buscar texto en la boveda",
    description:
      "Busca un texto en las notas de la materia, en el glosario y en las referencias de " +
      "herramientas (07-Referencias), y devuelve los fragmentos " +
      "encontrados con su archivo y numero de linea. Usala cuando no sepas en que nota " +
      "esta un concepto, o para verificar si un tema ya esta cubierto. " +
      "Acepta consultas en lenguaje natural: parte la frase en palabras y busca las " +
      "que importan, asi que 'diferencia entre include y extend' funciona. Los " +
      "resultados vienen ordenados por relevancia (frase exacta primero) y se " +
      "muestran hasta 3 lineas por archivo, avisando si hay mas. " +
      "OJO: no es semantica: buscar 'herencia' no encuentra 'generalizacion' si esa " +
      "palabra no esta escrita. Si un concepto no aparece, proba con sinonimos o usa " +
      "listar_temas.",
    inputSchema: z.object({
      consulta: z
        .string()
        .describe("Texto a buscar, minimo 2 caracteres. Ejemplo: 'include'."),
    }),
    annotations: { readOnlyHint: true },
  },
  async ({ consulta }) =>
    ejecutar("buscar", () => {
      const hallazgos = buscar(consulta);
      if (hallazgos.length === 0) {
        return `Sin resultados para "${consulta}". Proba con otra palabra o usa listar_temas para ver que hay.`;
      }

      const lineas = [`${hallazgos.length} coincidencias para "${consulta}":`, ""];
      for (const h of hallazgos) {
        lineas.push(`- ${h.nombre}  (${h.ruta}:${h.linea})`);
        lineas.push(`    ${h.fragmento}`);
        // M-04: avisamos cuando recortamos, para que el cliente sepa que hay mas
        // en esa nota y pueda pedirla completa con leer_nota.
        if (h.mas) {
          lineas.push(`    (+${h.mas} coincidencias mas en esta nota: usa leer_nota)`);
        }
      }
      return lineas.join("\n");
    }),
);

// ---------------------------------------------------------------------------
// RF-04 — glosario
// ---------------------------------------------------------------------------

server.registerTool(
  "glosario",
  {
    title: "Consultar el glosario",
    description:
      "Devuelve la definicion breve de un termino de la materia y la nota donde se " +
      "explica a fondo. Sin argumento devuelve el glosario completo. " +
      "Usala para una definicion rapida antes de decidir si hace falta leer la nota " +
      "entera con leer_nota. Si el termino exacto no esta, busca tambien dentro de " +
      "las definiciones, asi que sirve para preguntas como 'Jacobson'.",
    inputSchema: z.object({
      termino: z
        .string()
        .optional()
        .describe("Termino a buscar. Si se omite, devuelve todo el glosario."),
    }),
    annotations: { readOnlyHint: true },
  },
  async ({ termino }) =>
    ejecutar("glosario", () => {
      const entradas = consultarGlosario(termino);
      const encabezado = termino
        ? `${entradas.length} entrada(s) para "${termino}":`
        : `Glosario completo — ${entradas.length} terminos:`;

      const lineas = [encabezado, ""];
      for (const e of entradas) {
        lineas.push(`- **${e.termino}** (${e.letra}) — ${e.definicion}`);
        if (e.nota) lineas.push(`    nota: ${e.nota}`);
      }
      return lineas.join("\n");
    }),
);

// ---------------------------------------------------------------------------
// RF-05 — listar_diagramas
// ---------------------------------------------------------------------------

server.registerTool(
  "listar_diagramas",
  {
    title: "Listar diagramas disponibles",
    description:
      "Inventario de todos los diagramas de la boveda: los archivos .excalidraw y .svg " +
      "de 02-Diagramas/ MAS todos los bloques mermaid que estan dentro de las notas. " +
      "De cada uno devuelve su 'id', su tipo (secuencia, clases, flujo, entidad-relacion...) " +
      "y la nota de origen. " +
      "USALA ANTES de obtener_diagrama para conseguir el id exacto: los ids de los " +
      "bloques mermaid tienen la forma 'Nombre de la nota#mermaid-2' y no conviene " +
      "construirlos a mano.",
    inputSchema: z.object({}),
    annotations: { readOnlyHint: true },
  },
  async () =>
    ejecutar("listar_diagramas", () => {
      const diagramas = listarDiagramas();
      if (diagramas.length === 0) return "No hay diagramas en la boveda.";

      const archivos = diagramas.filter((d) => d.origen === "archivo");
      const bloques = diagramas.filter((d) => d.origen === "bloque-mermaid");

      const lineas = [
        `${diagramas.length} diagramas: ${bloques.length} bloques mermaid en notas y ${archivos.length} archivos.`,
        "",
      ];

      if (bloques.length > 0) {
        lineas.push("## Bloques mermaid dentro de notas");
        for (const d of bloques) {
          lineas.push(`- id: ${d.id}`);
          lineas.push(`    tipo: ${d.tipo}  |  lineas: ${d.lineas}  |  nota: ${d.nota}`);
          if (d.primeraLinea) lineas.push(`    empieza con: ${d.primeraLinea}`);
        }
        lineas.push("");
      }

      if (archivos.length > 0) {
        lineas.push("## Archivos en 02-Diagramas/");
        for (const d of archivos) {
          lineas.push(`- id: ${d.id}`);
          lineas.push(`    tipo: ${d.tipo}  |  formato: ${d.formato}  |  ruta: ${d.ruta}`);
        }
      }

      return lineas.join("\n");
    }),
);

// ---------------------------------------------------------------------------
// RF-06 — obtener_diagrama
// ---------------------------------------------------------------------------

server.registerTool(
  "obtener_diagrama",
  {
    title: "Obtener la fuente de un diagrama",
    description:
      "Devuelve la FUENTE CRUDA de un diagrama: el bloque mermaid tal cual esta escrito " +
      "en la nota, o el JSON del archivo .excalidraw. Indica tambien el tipo y la nota de origen. " +
      "Usala cuando haya que llevar un diagrama de la boveda a otra herramienta: el texto " +
      "que devuelve es lo que despues le pasas al servidor MCP de StarUML o al de Excalidraw " +
      "para que lo dibujen. " +
      "ESTE SERVIDOR NO DIBUJA NI CONVIERTE: solo entrega la fuente. " +
      "Acepta el id exacto ('Nota#mermaid-2'), el nombre de un archivo, o el nombre de una " +
      "nota si tiene un solo diagrama.",
    inputSchema: z.object({
      nombre: z
        .string()
        .describe(
          "Id del diagrama de listar_diagramas, nombre de archivo, o nombre de una nota. " +
            "Ejemplo: 'Modelo 4+1 vistas#mermaid-1'.",
        ),
    }),
    annotations: { readOnlyHint: true },
  },
  async ({ nombre }) =>
    ejecutar("obtener_diagrama", () => {
      const d = obtenerDiagrama(nombre);
      return [
        `id: ${d.id}`,
        `tipo: ${d.tipo}`,
        `formato: ${d.formato}`,
        `origen: ${d.ruta}${d.nota ? ` (nota: ${d.nota})` : ""}`,
        `lineas: ${d.lineas}`,
        "",
        "--- fuente ---",
        "",
        d.fuente,
      ].join("\n");
    }),
);

// ---------------------------------------------------------------------------
// RF-07 — obtener_flashcards
// ---------------------------------------------------------------------------

server.registerTool(
  "obtener_flashcards",
  {
    title: "Obtener flashcards de un tema",
    description:
      "Devuelve las tarjetas de repaso de un tema en pares pregunta/respuesta, desde " +
      "04-Flashcards/. Usala como MATERIA PRIMA para armar un quiz o una sesion de repaso: " +
      "el servidor entrega las tarjetas, pero armar el quiz, elegir el orden, mezclar " +
      "opcion multiple con preguntas abiertas y corregir las respuestas te toca a vos. " +
      "Si el tema no existe, devuelve la lista de temas que si tienen tarjetas.",
    inputSchema: z.object({
      tema: z
        .string()
        .describe("Tema de las tarjetas. Ejemplo: 'Casos de uso del negocio'."),
      cantidad: z
        .number()
        .int()
        .positive()
        .optional()
        .describe(
          "Cuantas tarjetas devolver, tomadas desde el principio. Si se omite, devuelve todas.",
        ),
    }),
    annotations: { readOnlyHint: true },
  },
  async ({ tema, cantidad }) =>
    ejecutar("obtener_flashcards", () => {
      const mazo = obtenerFlashcards(tema, cantidad);
      const lineas = [
        `Tema: ${mazo.tema}`,
        `Archivo: ${mazo.ruta}`,
        `Devueltas ${mazo.tarjetas.length} de ${mazo.totalDisponibles} tarjetas disponibles.`,
        "",
      ];
      mazo.tarjetas.forEach((t, i) => {
        lineas.push(`${i + 1}. P: ${t.pregunta}`);
        lineas.push(`   R: ${t.respuesta}`);
      });
      return lineas.join("\n");
    }),
);

// ---------------------------------------------------------------------------
// RF-08 — registrar_resultado  (LA UNICA HERRAMIENTA QUE ESCRIBE)
// ---------------------------------------------------------------------------

server.registerTool(
  "registrar_resultado",
  {
    title: "Registrar el resultado de un quiz",
    description:
      "Agrega una linea con la fecha de hoy al registro 05-Quizzes/progreso.md. " +
      "Es la UNICA herramienta de este servidor que escribe, y solo toca ese archivo. " +
      "Usala DESPUES de corregir un quiz, y conviene preguntarle al estudiante si quiere " +
      "que se registre antes de llamarla. " +
      "El puntaje va en escala 0 a 100 (7 aciertos de 10 preguntas son 70).",
    inputSchema: z.object({
      tema: z
        .string()
        .describe("Tema evaluado. Conviene usar el mismo texto que el campo 'tema' de las notas."),
      puntaje: z
        .number()
        .min(0)
        .max(100)
        .describe("Puntaje obtenido, de 0 a 100."),
      comentarios: z
        .string()
        .optional()
        .describe("Observaciones: en que se equivoco, que conviene repasar."),
    }),
    // readOnlyHint: false y destructiveHint: false — modifica, pero solo AGREGA:
    // nunca borra ni sobreescribe historial. Esa distincion le sirve al cliente
    // para decidir cuanta friccion ponerle antes de ejecutar.
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  },
  async ({ tema, puntaje, comentarios }) =>
    ejecutar("registrar_resultado", () => {
      const r = registrarResultado(tema, puntaje, comentarios);
      const aviso = r.creado ? `\n(Se creo ${r.archivo}, que todavia no existia.)` : "";
      return `Resultado registrado en ${r.archivo}:\n${r.linea}${aviso}`;
    }),
);

// ---------------------------------------------------------------------------
// RF-09 — progreso
// ---------------------------------------------------------------------------

server.registerTool(
  "progreso",
  {
    title: "Consultar el progreso de estudio",
    description:
      "Resume el historial de quizzes: temas ya evaluados con su ultimo puntaje, mejor " +
      "puntaje y promedio, mas los temas que tienen notas en la boveda pero NUNCA fueron " +
      "evaluados. Usala para decidir que conviene repasar o para responder '¿como voy?'. " +
      "Los temas pendientes salen de cruzar el registro con el frontmatter de las notas.",
    inputSchema: z.object({}),
    annotations: { readOnlyHint: true },
  },
  async () =>
    ejecutar("progreso", () => {
      const p = obtenerProgreso();
      const lineas: string[] = [];

      if (p.totalEvaluaciones === 0) {
        lineas.push("Todavia no hay ningun resultado registrado.");
      } else {
        lineas.push(
          `${p.totalEvaluaciones} evaluaciones registradas. Promedio general: ${p.promedioGeneral}/100.`,
          "",
          "## Temas evaluados",
        );
        for (const t of p.temasEvaluados) {
          lineas.push(
            `- ${t.tema}: ultimo ${t.ultimoPuntaje}/100 (${t.ultimaFecha}) | ` +
              `mejor ${t.mejorPuntaje} | promedio ${t.promedio} | ${t.evaluaciones} intento(s)`,
          );
        }
        lineas.push("");
      }

      lineas.push("## Temas pendientes (tienen notas, nunca evaluados)");
      if (p.temasPendientes.length === 0) {
        lineas.push("- Ninguno: todos los temas de la boveda fueron evaluados al menos una vez.");
      } else {
        for (const tema of p.temasPendientes) lineas.push(`- ${tema}`);
      }

      return lineas.join("\n");
    }),
);

// ---------------------------------------------------------------------------
// RF-10 — referencia
// ---------------------------------------------------------------------------

server.registerTool(
  "referencia",
  {
    title: "Consultar la referencia de una herramienta",
    description:
      "Devuelve el manual condensado de las herramientas de dibujo del ecosistema y el puente " +
      "entre la teoria de la materia y el diagrama concreto. Sin argumento lista las " +
      "referencias disponibles. " +
      "CONSULTALA SIEMPRE ANTES DE GENERAR UN DIAGRAMA para StarUML o para Excalidraw: dice " +
      "exactamente que tipos de mermaid acepta cada herramienta y que se pierde en el camino, " +
      "asi no generas un diagrama que despues no entra. " +
      "Datos que solo estan aca: StarUML importa solo 7 tipos de mermaid y NO importa casos de " +
      "uso, componentes, despliegue ni actividad; Excalidraw convierte 5 tipos a formas " +
      "editables y el resto lo pega como imagen SVG no editable. " +
      "Para las REGLAS DE MODELADO (que es actor, cuando va include o extend) usa leer_nota " +
      "sobre las notas de la materia: esta herramienta cubre la herramienta, no la teoria. " +
      "Valores utiles: 'staruml', 'excalidraw', 'de la teoria al diagrama'.",
    inputSchema: z.object({
      herramienta: z
        .string()
        .optional()
        .describe(
          "Nombre de la referencia: 'staruml', 'excalidraw' o 'de la teoria al diagrama'. " +
            "Si se omite, devuelve la lista de referencias disponibles con un resumen de cada una.",
        ),
    }),
    annotations: { readOnlyHint: true },
  },
  async ({ herramienta }) =>
    ejecutar("referencia", () => {
      // Sin argumento: el indice, para que el modelo sepa que hay.
      if (!herramienta || herramienta.trim() === "") {
        const disponibles = listarReferencias();
        if (disponibles.length === 0) {
          return `No hay referencias en 07-Referencias/ todavia.`;
        }
        const lineas = [`${disponibles.length} referencias disponibles:`, ""];
        for (const r of disponibles) {
          lineas.push(`- ${r.nombre}`);
          lineas.push(`    tema: ${r.tema}`);
          lineas.push(`    fuente: ${r.fuente}`);
          lineas.push(`    ${r.resumen}`);
        }
        lineas.push("");
        lineas.push(`Pedi una por nombre para leerla completa.`);
        return lineas.join("\n");
      }

      const r = obtenerReferencia(herramienta);
      return [
        `# Referencia: ${r.nombre}`,
        `Fuente original: ${r.fuente}`,
        `Ruta en la boveda: ${r.ruta}`,
        "",
        "--- contenido ---",
        "",
        r.contenido,
      ].join("\n");
    }),
);

// ---------------------------------------------------------------------------
// RF-11 — metodo_tarea
// ---------------------------------------------------------------------------

server.registerTool(
  "metodo_tarea",
  {
    title: "Metodo y guia paso a paso para una tarea",
    description:
      "Devuelve el METODO de trabajo para resolver una tarea del curso, o la guia paso a paso de " +
      "un entregable concreto. Sin argumento devuelve el metodo general, que arranca con el PUNTO " +
      "DE INICIO (el enunciado, no el diagrama) y los 6 pasos. " +
      "USALA EN CUANTO EL ESTUDIANTE MENCIONE UNA TAREA, un entregable o pregunte 'por donde " +
      "empiezo'. " +
      "Las guias traen: el punto de inicio, los pasos en orden, un EJEMPLO VISUAL de otro dominio " +
      "que crece etapa por etapa, una CHECKLIST DE RIGOR donde cada item cita la regla de teoria y " +
      "la nota de donde sale, y un anti-ejemplo con los errores que se descuentan. " +
      "IMPORTANTE — COMO USARLA: esto es para GUIAR, no para resolver. Acompaña al estudiante paso " +
      "a paso, hace que EL decida en cada 'tu turno', y NO produzcas el diagrama, la tabla ni el " +
      "documento por el. Si le entregas el trabajo hecho, aprueba la tarea y pierde el parcial. " +
      "Verifica siempre contra la teoria de las presentaciones (leer_nota), que es lo que se " +
      "evalua: el enunciado manda sobre todo, despues la clase, y el material complementario " +
      "nunca contradice a los dos primeros. " +
      "Valores utiles: sin argumento (metodo general), o 'diagrama de casos de uso del negocio'.",
    inputSchema: z.object({
      entregable: z
        .string()
        .optional()
        .describe(
          "Tipo de entregable del que se quiere la guia paso a paso. Si se omite, devuelve el " +
            "metodo general de trabajo con el punto de inicio y los 6 pasos.",
        ),
    }),
    annotations: { readOnlyHint: true },
  },
  async ({ entregable }) =>
    ejecutar("metodo_tarea", () => {
      const d = obtenerMetodo(entregable);
      const otras = listarGuias().filter((g) => g.nombre !== d.nombre);

      const lineas = [
        d.esMetodoGeneral ? `# Metodo general de trabajo` : `# Guia: ${d.nombre}`,
        `Ruta en la boveda: ${d.ruta}`,
      ];
      if (d.entregable) lineas.push(`Entregable: ${d.entregable}`);
      lineas.push(
        "",
        "RECORDATORIO: guiar paso a paso, no resolver. El estudiante hace el entregable.",
        "",
        "--- contenido ---",
        "",
        d.contenido,
      );
      if (otras.length > 0) {
        lineas.push("", "--- otras guias disponibles ---");
        for (const o of otras) {
          lineas.push(`- ${o.nombre}${o.entregable ? `  (entregable: ${o.entregable})` : ""}`);
        }
      }
      return lineas.join("\n");
    }),
);

// ---------------------------------------------------------------------------
// RF-12 — enunciado
// ---------------------------------------------------------------------------

server.registerTool(
  "enunciado",
  {
    title: "Consultar el enunciado de una tarea",
    description:
      "Devuelve el enunciado de una tarea guardado en 08-Tareas/enunciados/, o el listado de los " +
      "que hay. Sirve para poder CITAR TEXTUAL lo que pide la tarea, que es el paso 1 del metodo: " +
      "desarmar el enunciado en entregables, restricciones, formato y criterios de calificacion, " +
      "sin parafrasear. " +
      "Usala antes de empezar cualquier tarea, junto con metodo_tarea. " +
      "Si el enunciado esta en PDF se lista pero NO se puede leer su texto: en ese caso pedile al " +
      "estudiante que lo pegue en un .md o que te lo copie, y decilo en vez de adivinar el " +
      "contenido. Si algo del enunciado es ambiguo, marcalo como pregunta para el auxiliar en vez " +
      "de asumir una interpretacion.",
    inputSchema: z.object({
      nombre: z
        .string()
        .optional()
        .describe("Nombre del enunciado. Si se omite, devuelve la lista de los que hay guardados."),
    }),
    annotations: { readOnlyHint: true },
  },
  async ({ nombre }) =>
    ejecutar("enunciado", () => {
      if (!nombre || nombre.trim() === "") {
        const todos = listarEnunciados();
        if (todos.length === 0) {
          return (
            `No hay enunciados guardados todavia.
` +
            `Para usarlos, poner el archivo en 08-Tareas/enunciados/: en .md se puede leer y ` +
            `citar textual; en .pdf solo se lista el nombre.`
          );
        }
        const lineas = [`${todos.length} enunciado(s) guardados:`, ""];
        for (const e of todos) {
          lineas.push(`- ${e.nombre}  (${e.formato})${e.contenido === null ? "  [no legible desde aca]" : ""}`);
        }
        return lineas.join("\n");
      }

      const e = obtenerEnunciado(nombre);
      if (e.contenido === null) {
        return (
          `El enunciado "${e.nombre}" existe en ${e.ruta} pero esta en formato ${e.formato} y no ` +
          `puedo leer su texto. Pedile al estudiante que lo pegue como .md en ` +
          `08-Tareas/enunciados/, o que te copie el texto.`
        );
      }
      return [`# Enunciado: ${e.nombre}`, `Ruta: ${e.ruta}`, "", "--- contenido ---", "", e.contenido].join("\n");
    }),
);

// ---------------------------------------------------------------------------
// Red de seguridad global (RNF-03)
// ---------------------------------------------------------------------------

/**
 * Ultimo recurso. Si algo se escapo de `ejecutar` —por ejemplo un error asincrono
 * que ocurre fuera de un handler— lo registramos y SEGUIMOS. Un servidor MCP que
 * muere obliga a reiniciar el cliente entero, asi que preferimos seguir vivo y
 * degradado antes que caernos.
 */
process.on("uncaughtException", (error) => {
  console.error("[tutor-ayds] Excepcion no atrapada (el servidor sigue):", error);
});
process.on("unhandledRejection", (motivo) => {
  console.error("[tutor-ayds] Promesa rechazada sin manejar (el servidor sigue):", motivo);
});

// ---------------------------------------------------------------------------
// Conexion del transporte
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // console.error, NO console.log: stdout es del protocolo (RNF-04).
  console.error(`[tutor-ayds] Servidor MCP escuchando en stdio.`);
  console.error(`[tutor-ayds] Boveda: ${raiz()}`);
  console.error(`[tutor-ayds] 12 herramientas registradas (11 de lectura, 1 de escritura).`);
}

main().catch((error) => {
  console.error("[tutor-ayds] Error fatal al conectar el transporte:", error);
  process.exit(1);
});
