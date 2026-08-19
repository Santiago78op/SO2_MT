/**
 * glosario.ts — RF-04 (glosario).
 *
 * Parsea 03-Glosario.md, que tiene un formato fijo por convencion de la boveda:
 *
 *   ## A
 *   - **Actor del negocio** — Rol que alguien o algo juega... → [[Actor del negocio]]
 *
 * O sea: encabezados de letra, y entradas de lista con el termino en negrita,
 * un guion largo, la definicion, y una flecha con el wikilink a la nota.
 */

import { CARPETAS, ErrorHerramienta, clave, leerTexto, sugerir } from "./boveda.js";

export interface EntradaGlosario {
  termino: string;
  definicion: string;
  /** Nombre de la nota enlazada, si la entrada tiene un [[wikilink]]. */
  nota: string | null;
  /** La letra del encabezado bajo el que aparece. */
  letra: string;
}

/**
 * Lee el glosario completo y devuelve sus entradas.
 *
 * El parseo es por expresion regular sobre lineas, no por AST de markdown. Es
 * suficiente porque el formato lo controlamos nosotros: si un dia una entrada no
 * aparece, es porque no sigue la convencion, y eso es un dato util (te avisa que
 * el glosario se desvio del formato).
 */
export function leerGlosario(): EntradaGlosario[] {
  const contenido = leerTexto(CARPETAS.glosario);
  const entradas: EntradaGlosario[] = [];
  let letraActual = "?";

  for (const lineaCruda of contenido.split(/\r?\n/)) {
    const linea = lineaCruda.trim();

    // Encabezado de letra: "## A"
    const encabezado = /^##\s+(.+)$/.exec(linea);
    if (encabezado?.[1]) {
      letraActual = encabezado[1].trim();
      continue;
    }

    // Entrada: "- **Termino** — definicion → [[Nota]]"
    // El guion largo puede ser "—" (em dash) o "-", y la flecha "→" es opcional.
    const entrada = /^-\s+\*\*(.+?)\*\*\s*[—–-]\s*(.+)$/.exec(linea);
    if (!entrada) continue;

    const termino = (entrada[1] ?? "").trim();
    let resto = (entrada[2] ?? "").trim();
    let nota: string | null = null;

    // Extraemos el wikilink final, si lo hay, y lo sacamos de la definicion.
    const enlace = /→?\s*\[\[([^\]|]+?)(?:\|[^\]]*)?\]\]\s*$/.exec(resto);
    if (enlace?.[1]) {
      nota = enlace[1].trim();
      resto = resto.slice(0, enlace.index).trim();
    }

    // Limpiamos una flecha suelta que haya quedado al final.
    resto = resto.replace(/→\s*$/, "").trim();

    if (termino) {
      entradas.push({ termino, definicion: resto, nota, letra: letraActual });
    }
  }

  return entradas;
}

/**
 * RF-04. Sin argumento devuelve el glosario completo; con un termino, busca.
 *
 * La busqueda de un termino va en tres pasadas, de la mas estricta a la mas
 * laxa, y devuelve en cuanto una da resultado:
 *
 *   1. Coincidencia exacta (normalizada): "actor del negocio".
 *   2. El termino del glosario CONTIENE lo pedido: "actor" → "Actor del negocio".
 *   3. La DEFINICION contiene lo pedido: "Jacobson" → todas las entradas que lo citen.
 *
 * La tercera pasada es la que lo hace util de verdad: permite preguntarle al
 * glosario por un concepto sin saber como se llama la entrada.
 */
export function consultarGlosario(termino?: string): EntradaGlosario[] {
  const todas = leerGlosario();

  if (!termino || termino.trim() === "") {
    return todas;
  }

  const buscado = clave(termino);

  const exactas = todas.filter((e) => clave(e.termino) === buscado);
  if (exactas.length > 0) return exactas;

  const porTermino = todas.filter((e) => clave(e.termino).includes(buscado));
  if (porTermino.length > 0) return porTermino;

  const porDefinicion = todas.filter((e) => clave(e.definicion).includes(buscado));
  if (porDefinicion.length > 0) return porDefinicion;

  throw new ErrorHerramienta(
    `El termino "${termino}" no esta en el glosario.`,
    sugerir(
      termino,
      todas.map((e) => e.termino),
    ),
  );
}
