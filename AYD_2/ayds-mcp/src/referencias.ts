/**
 * referencias.ts — RF-10 (referencia).
 *
 * Sirve las notas de 07-Referencias/: el "segundo cerebro" sobre las HERRAMIENTAS
 * del ecosistema (StarUML, Excalidraw) y el puente entre la teoria de la materia y
 * el diagrama concreto.
 *
 * POR QUE ES UNA CARPETA APARTE Y NO 01-Notas/
 *
 * Dos razones, y las dos son de diseno, no de comodidad:
 *
 *   1. No es material de la materia. 01-Notas/ son conceptos de Analisis y Diseno;
 *      esto es el manual de una herramienta. Mezclarlos ensuciaria listar_temas.
 *
 *   2. progreso() calcula los "temas pendientes" cruzando el registro de quizzes
 *      con los `tema` de 01-Notas/. Si las referencias vivieran ahi, "StarUML"
 *      apareceria para siempre como un tema pendiente de evaluar, que es ruido:
 *      no me van a tomar examen del manual de StarUML.
 *
 * Sigue siendo SOLO LECTURA y sigue estando dentro de VAULT_PATH, asi que respeta
 * RNF-01 y RNF-02 igual que todo lo demas.
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

/** La carpeta del segundo cerebro de herramientas. */
export const CARPETA_REFERENCIAS = "07-Referencias";

export interface ResumenReferencia {
  nombre: string;
  tema: string;
  fuente: string;
  ruta: string;
  /** Primer parrafo, para que el modelo sepa si le sirve sin leer todo. */
  resumen: string;
}

export interface ReferenciaCompleta {
  nombre: string;
  ruta: string;
  fuente: string;
  contenido: string;
}

/**
 * Extrae el primer parrafo de texto del cuerpo, salteando titulos y avisos.
 * Sirve como resumen de una linea en el listado.
 */
function primerParrafo(cuerpo: string, maximo = 220): string {
  for (const bloque of cuerpo.split(/\n\s*\n/)) {
    const t = bloque.trim();
    if (t === "" || t.startsWith("#") || t.startsWith(">") || t.startsWith("|")) continue;
    const plano = t.replace(/\s+/g, " ").replace(/\*\*/g, "");
    return plano.length > maximo ? `${plano.slice(0, maximo)}...` : plano;
  }
  return "(sin resumen)";
}

/** Lista las referencias disponibles con su resumen. */
export function listarReferencias(): ResumenReferencia[] {
  return listarArchivos(CARPETA_REFERENCIAS, [".md"]).map((archivo) => {
    const ruta = rutaRelativa(CARPETA_REFERENCIAS, archivo);
    const { datos, cuerpo } = parsearFrontmatter(leerTexto(ruta));
    return {
      nombre: paraMostrar(nombreDeNota(archivo)),
      tema: datos.tema ?? "(sin tema)",
      fuente: datos.fuente ?? "(sin fuente)",
      ruta,
      resumen: primerParrafo(cuerpo),
    };
  });
}

/**
 * RF-10. Devuelve una referencia completa, o el listado si no se pide ninguna.
 *
 * La busqueda es tolerante porque el modelo va a pedirla de muchas formas:
 * "staruml", "StarUML", "star uml", "excalidraw", "teoria", "como dibujar".
 * Se resuelve en tres pasadas, de la mas estricta a la mas laxa.
 */
export function obtenerReferencia(herramienta: string): ReferenciaCompleta {
  const disponibles = listarReferencias();

  if (disponibles.length === 0) {
    throw new ErrorHerramienta(
      `No hay referencias en ${CARPETA_REFERENCIAS}/. Todavia no se escribieron.`,
    );
  }

  const pedido = clave(herramienta).replace(/\s+/g, "");

  // Pasada 1: el nombre del archivo, ignorando espacios.
  let elegida = disponibles.find((r) => clave(r.nombre).replace(/\s+/g, "") === pedido);

  // Pasada 2: el nombre CONTIENE lo pedido, o al reves.
  elegida ??= disponibles.find((r) => {
    const n = clave(r.nombre).replace(/\s+/g, "");
    return n.includes(pedido) || pedido.includes(n);
  });

  // Pasada 3: el tema o el resumen lo mencionan. Esto es lo que hace que
  // "como paso la teoria a un diagrama" encuentre la nota puente.
  elegida ??= disponibles.find(
    (r) => clave(r.tema).includes(clave(herramienta)) || clave(r.resumen).includes(clave(herramienta)),
  );

  if (!elegida) {
    throw new ErrorHerramienta(
      `No tengo una referencia para "${herramienta}".`,
      disponibles.map((r) => `${r.nombre}  (${r.tema})`),
    );
  }

  return {
    nombre: elegida.nombre,
    ruta: elegida.ruta,
    fuente: elegida.fuente,
    contenido: leerTexto(elegida.ruta),
  };
}
