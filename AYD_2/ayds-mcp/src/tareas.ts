/**
 * tareas.ts — RF-11 (metodo_tarea) y RF-12 (enunciado).
 *
 * Sirve el material de 08-Tareas/: el metodo general de trabajo, las guias paso a
 * paso por tipo de entregable, y los enunciados que el estudiante haya guardado.
 *
 * ---------------------------------------------------------------------------
 * POR QUE ESTE MODULO NO "RESUELVE" NADA
 * ---------------------------------------------------------------------------
 * El estudiante pidio ayuda para hacer sus tareas. La tentacion obvia seria una
 * herramienta que reciba el enunciado y devuelva el entregable. No lo hacemos, y
 * no es por limitacion tecnica:
 *
 *   1. Es lo que el estudiante pidio explicitamente: guia paso a paso, con un
 *      punto de inicio y ejemplos visuales, no la respuesta armada.
 *   2. Resolver la tarea le hace aprobar la tarea y perder el parcial.
 *   3. Y ademas seria razonar, que por diseno vive en el cliente y no aca (RNF-09).
 *
 * Asi que este modulo sirve METODO, no soluciones: los pasos, las reglas de la
 * teoria convertidas en checklist verificable, y ejemplos de OTRO dominio.
 *
 * Solo lectura, como todo el resto salvo progreso.ts.
 */

import {
  ErrorHerramienta,
  clave,
  leerTexto,
  listarArchivos,
  nombreDeNota,
  paraMostrar,
  parsearFrontmatter,
  rutaRelativa,
} from "./boveda.js";

/** La carpeta de tareas: metodo, guias y enunciados. */
export const CARPETA_TAREAS = "08-Tareas";
/** Subcarpeta con los enunciados originales del curso. */
export const CARPETA_ENUNCIADOS = `${CARPETA_TAREAS}/enunciados`;

/**
 * El metodo general se distingue de las guias por el prefijo "_" del archivo.
 * Es una convencion simple y visible en el explorador de Obsidian: el archivo que
 * empieza con "_" queda primero en la lista y se lee como "el general".
 */
const PREFIJO_METODO = "_";

export interface DocumentoTarea {
  nombre: string;
  ruta: string;
  /** El campo `entregable` del frontmatter, si lo tiene. */
  entregable: string | null;
  esMetodoGeneral: boolean;
  contenido: string;
}

export interface ResumenDocumento {
  nombre: string;
  entregable: string | null;
  /**
   * Otros nombres por los que se puede pedir esta guia, del campo `alias` del
   * frontmatter (separados por coma). Existe porque una guia cubre varios
   * entregables: la de "Caso de negocio" cubre los diagramas de contexto, core y
   * primera descomposicion, y el modelo va a pedirlos por su nombre suelto.
   */
  alias: string[];
  esMetodoGeneral: boolean;
  ruta: string;
}

/** Lista el metodo general y las guias paso a paso disponibles. */
export function listarGuias(): ResumenDocumento[] {
  return listarArchivos(CARPETA_TAREAS, [".md"]).map((archivo) => {
    const ruta = rutaRelativa(CARPETA_TAREAS, archivo);
    const { datos } = parsearFrontmatter(leerTexto(ruta));
    const nombre = paraMostrar(nombreDeNota(archivo));
    return {
      nombre,
      entregable: datos.entregable ?? null,
      alias: (datos.alias ?? "")
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a.length > 0),
      esMetodoGeneral: nombre.startsWith(PREFIJO_METODO),
      ruta,
    };
  });
}

/**
 * RF-11. Devuelve el metodo general o la guia de un entregable.
 *
 * Sin argumento devuelve el METODO GENERAL, no un listado. Es deliberado: la
 * pregunta "¿por donde empiezo?" tiene una respuesta concreta y es el metodo, no
 * un menu. Al final del metodo aparecen las guias especificas, asi que el cliente
 * igual las descubre.
 */
export function obtenerMetodo(entregable?: string): DocumentoTarea {
  const disponibles = listarGuias();

  if (disponibles.length === 0) {
    throw new ErrorHerramienta(
      `No hay guias en ${CARPETA_TAREAS}/. Falta escribir el metodo de trabajo.`,
    );
  }

  const general = disponibles.find((d) => d.esMetodoGeneral);

  // Sin argumento: el metodo general.
  if (!entregable || entregable.trim() === "") {
    if (!general) {
      throw new ErrorHerramienta(
        `No encuentro el metodo general (un archivo que empiece con "_") en ${CARPETA_TAREAS}/.`,
      );
    }
    return leerDocumento(general);
  }

  const pedido = clave(entregable);

  // Pasada 1: el campo `entregable` del frontmatter. Es el mas preciso porque lo
  // escribimos nosotros pensando en como lo va a pedir el modelo.
  let elegida = disponibles.find((d) => d.entregable && clave(d.entregable) === pedido);

  // Pasada 2: el nombre del archivo, tolerando el prefijo "Guía - ".
  elegida ??= disponibles.find((d) => {
    const sinPrefijo = clave(d.nombre).replace(/^gu[ií]a\s*-\s*/, "");
    return clave(d.nombre) === pedido || sinPrefijo === pedido;
  });

  // Pasada 2b: los alias declarados en el frontmatter.
  elegida ??= disponibles.find((d) => d.alias.some((a) => clave(a) === pedido));

  // Pasada 3: contiene, en cualquiera de los dos campos o en los alias.
  elegida ??= disponibles.find(
    (d) =>
      clave(d.nombre).includes(pedido) ||
      (d.entregable ? clave(d.entregable).includes(pedido) : false) ||
      d.alias.some((a) => clave(a).includes(pedido) || pedido.includes(clave(a))),
  );

  // Pasada 4: si lo que pidio suena a "¿por donde empiezo?", devolvemos el metodo
  // general en vez de fallar. Ojo con el español: el verbo "empezar" diptonga
  // (empiezo, empiece), asi que hace falta cubrir las tres raices — con solo
  // "empez" no matchea "empiezo", que es justo como se pregunta.
  const suenaAMetodo =
    /m[eé]todo|empez|empiez|empiec|comenz|comienz|inicio|arranc|por d[oó]nde|qu[eé] hago|c[oó]mo (lo )?hago|paso a paso/;
  if (!elegida && suenaAMetodo.test(pedido) && general) {
    elegida = general;
  }

  if (!elegida) {
    throw new ErrorHerramienta(
      `No tengo una guia para "${entregable}". Podes usar el metodo general y anclar el ` +
        `entregable a las notas de teoria con leer_nota.`,
      disponibles.map((d) =>
        d.esMetodoGeneral
          ? `${d.nombre}  (metodo general)`
          : `${d.nombre}${d.entregable ? `  (entregable: ${d.entregable})` : ""}`,
      ),
    );
  }

  return leerDocumento(elegida);
}

function leerDocumento(r: ResumenDocumento): DocumentoTarea {
  return {
    nombre: r.nombre,
    ruta: r.ruta,
    entregable: r.entregable,
    esMetodoGeneral: r.esMetodoGeneral,
    contenido: leerTexto(r.ruta),
  };
}

// ---------------------------------------------------------------------------
// RF-12 — enunciado
// ---------------------------------------------------------------------------

export interface Enunciado {
  nombre: string;
  ruta: string;
  formato: string;
  /** Solo para los .md: el texto. Para un PDF no lo podemos leer. */
  contenido: string | null;
}

/**
 * Lista los enunciados guardados en 08-Tareas/enunciados/.
 *
 * Aceptamos .md y .txt (legibles) y tambien .pdf (no legibles desde aca). Los PDF
 * se listan igual a proposito: es mejor decirle al modelo "existe este enunciado
 * pero esta en PDF y no lo puedo leer" que fingir que no hay nada.
 */
export function listarEnunciados(): Enunciado[] {
  const legibles = [".md", ".txt"];
  const archivos = listarArchivos(CARPETA_ENUNCIADOS, [...legibles, ".pdf"]);

  return archivos.map((archivo) => {
    const ruta = rutaRelativa(CARPETA_ENUNCIADOS, archivo);
    const ext = archivo.slice(archivo.lastIndexOf(".")).toLowerCase();
    let contenido: string | null = null;
    if (legibles.includes(ext)) {
      try {
        contenido = leerTexto(ruta);
      } catch {
        contenido = null;
      }
    }
    return {
      nombre: paraMostrar(nombreDeNota(archivo)),
      ruta: paraMostrar(ruta),
      formato: ext.replace(".", ""),
      contenido,
    };
  });
}

/** RF-12. Un enunciado por nombre, o el listado si no se especifica. */
export function obtenerEnunciado(nombre: string): Enunciado {
  const todos = listarEnunciados();

  if (todos.length === 0) {
    throw new ErrorHerramienta(
      `No hay enunciados guardados. Pone el archivo del enunciado en ` +
        `${CARPETA_ENUNCIADOS}/ (en .md se puede leer y citar textual; en .pdf solo se lista).`,
    );
  }

  const pedido = clave(nombre);
  let elegido = todos.find((e) => clave(e.nombre) === pedido);
  elegido ??= todos.find((e) => clave(e.nombre).includes(pedido));

  if (!elegido) {
    throw new ErrorHerramienta(
      `No encuentro el enunciado "${nombre}".`,
      todos.map((e) => `${e.nombre}  (${e.formato})`),
    );
  }

  return elegido;
}
