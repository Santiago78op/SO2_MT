/**
 * flashcards.ts — RF-07 (obtener_flashcards).
 *
 * Lee 04-Flashcards/, donde cada archivo es un tema y cada tarjeta es una linea
 * con el formato `pregunta::respuesta` (el del plugin Spaced Repetition de
 * Obsidian).
 *
 * IMPORTANTE sobre el limite del sistema: esta herramienta entrega tarjetas, no
 * arma quizzes. Armar el quiz, elegir el orden, mezclar opcion multiple con
 * pregunta abierta y corregir las respuestas es razonamiento y ocurre en el
 * cliente. Es el paso 6 del segundo diagrama de secuencia del diseno.
 */

import {
  CARPETAS,
  ErrorHerramienta,
  clave,
  leerTexto,
  listarArchivos,
  nombreDeNota,
  paraMostrar,
  parsearFrontmatter,
  rutaRelativa,
  sugerir,
} from "./boveda.js";

export interface Flashcard {
  pregunta: string;
  respuesta: string;
}

export interface MazoFlashcards {
  tema: string;
  archivo: string;
  ruta: string;
  /** Cuantas tarjetas tiene el archivo en total. */
  totalDisponibles: number;
  tarjetas: Flashcard[];
}

/** Lista los mazos que existen, con su tema del frontmatter. */
export function listarMazos(): Array<{ archivo: string; tema: string; ruta: string }> {
  return listarArchivos(CARPETAS.flashcards, [".md"]).map((archivo) => {
    const ruta = rutaRelativa(CARPETAS.flashcards, archivo);
    const { datos } = parsearFrontmatter(leerTexto(ruta));
    return {
      // archivo y tema son para mostrar/comparar; ruta es para abrir el archivo.
      archivo: paraMostrar(nombreDeNota(archivo)),
      tema: datos.tema ?? paraMostrar(nombreDeNota(archivo)),
      ruta,
    };
  });
}

/**
 * Extrae las tarjetas de un contenido markdown.
 *
 * El formato es `pregunta::respuesta`. Cuidados que hay que tener y que no son
 * obvios:
 *
 * - Se corta en el PRIMER "::". Nuestras respuestas contienen cosas como
 *   "Lógica → clases y paquetes. Procesos → actividad", y si algun dia una
 *   respuesta contuviera "::", partir por todos los separadores romperia la
 *   tarjeta. `indexOf` corta una sola vez.
 *
 * - Se ignoran las lineas de encabezado, el frontmatter y el tag "#flashcards".
 *   El frontmatter se saca con parsearFrontmatter; el resto no tiene "::" asi que
 *   se cae solo.
 *
 * - Se ignoran los ":::" o mas (no es nuestro formato, pero mejor no inventar
 *   tarjetas con preguntas vacias).
 */
export function extraerFlashcards(contenido: string): Flashcard[] {
  const { cuerpo } = parsearFrontmatter(contenido);
  const tarjetas: Flashcard[] = [];

  for (const lineaCruda of cuerpo.split(/\r?\n/)) {
    const linea = lineaCruda.trim();
    if (linea === "" || linea.startsWith("#") || linea.startsWith(">")) continue;

    const corte = linea.indexOf("::");
    if (corte <= 0) continue;

    const pregunta = linea.slice(0, corte).trim();
    const respuesta = linea.slice(corte + 2).trim();

    // Las dos partes tienen que tener contenido para que la tarjeta sirva.
    if (pregunta.length === 0 || respuesta.length === 0) continue;

    tarjetas.push({ pregunta, respuesta });
  }

  return tarjetas;
}

/**
 * RF-07. Devuelve las flashcards de un tema.
 *
 * La busqueda del mazo es tolerante, en tres pasadas:
 *   1. El nombre del archivo coincide (con o sin el prefijo "Flashcards - ").
 *   2. El campo `tema` del frontmatter coincide.
 *   3. El nombre del archivo o el tema CONTIENE lo pedido.
 *
 * `cantidad` recorta desde el principio, sin mezclar. No barajamos a proposito:
 * si el servidor devolviera un orden distinto en cada llamada, dos ejecuciones
 * del mismo prompt darian resultados distintos y seria imposible de depurar.
 * Barajar, si hace falta, lo hace el cliente.
 */
export function obtenerFlashcards(tema: string, cantidad?: number): MazoFlashcards {
  const mazos = listarMazos();
  if (mazos.length === 0) {
    throw new ErrorHerramienta(`No hay archivos de flashcards en ${CARPETAS.flashcards}/.`);
  }

  const pedido = clave(tema);

  // Pasada 1: nombre de archivo exacto, tolerando el prefijo "Flashcards - ".
  let elegido = mazos.find((m) => {
    const sinPrefijo = clave(m.archivo).replace(/^flashcards\s*-\s*/, "");
    return clave(m.archivo) === pedido || sinPrefijo === pedido;
  });

  // Pasada 2: el campo tema del frontmatter.
  elegido ??= mazos.find((m) => clave(m.tema) === pedido);

  // Pasada 3: contiene.
  elegido ??= mazos.find(
    (m) => clave(m.archivo).includes(pedido) || clave(m.tema).includes(pedido),
  );

  if (!elegido) {
    throw new ErrorHerramienta(
      `No hay flashcards para el tema "${tema}".`,
      mazos.map((m) => `${m.archivo}  (tema: ${m.tema})`),
    );
  }

  const todas = extraerFlashcards(leerTexto(elegido.ruta));

  if (todas.length === 0) {
    throw new ErrorHerramienta(
      `El archivo ${elegido.ruta} existe pero no tiene tarjetas con formato "pregunta::respuesta".`,
      sugerir(
        tema,
        mazos.map((m) => m.archivo),
      ),
    );
  }

  // Validamos `cantidad` con cuidado: viene de un modelo, asi que puede llegar
  // como 0, como negativo o como 500.
  let seleccion = todas;
  if (typeof cantidad === "number" && Number.isFinite(cantidad) && cantidad > 0) {
    seleccion = todas.slice(0, Math.floor(cantidad));
  }

  return {
    tema: elegido.tema,
    archivo: elegido.archivo,
    ruta: elegido.ruta,
    totalDisponibles: todas.length,
    tarjetas: seleccion,
  };
}
