/**
 * notas.ts — RF-01 (listar_temas), RF-02 (leer_nota) y RF-03 (buscar).
 *
 * Todo lo de aca es SOLO LECTURA. La boveda se edita en Obsidian, no por MCP
 * (DA-04): un modelo con permiso de escribir sobre los apuntes puede arruinarlos
 * sin que uno se de cuenta.
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
  resolverArchivo,
  rutaRelativa,
} from "./boveda.js";

export interface ResumenNota {
  nombre: string;
  tema: string;
  fuente: string;
  fecha: string;
  ruta: string;
}

// ---------------------------------------------------------------------------
// RF-01 — listar_temas
// ---------------------------------------------------------------------------

/**
 * Lista todas las notas de 01-Notas/ con los datos de su frontmatter.
 *
 * Es la herramienta de ENTRADA del servidor: le da al modelo los nombres exactos
 * de las notas. Es la mitigacion del riesgo "el modelo inventa nombres de nota"
 * que quedo anotado en el diseno: si primero puede listar, no tiene que adivinar.
 */
export function listarTemas(): ResumenNota[] {
  const archivos = listarArchivos(CARPETAS.notas, [".md"]);

  return archivos.map((archivo) => {
    const ruta = rutaRelativa(CARPETAS.notas, archivo);
    const { datos } = parsearFrontmatter(leerTexto(ruta));
    return {
      // El nombre se normaliza porque es para MOSTRAR; la ruta queda cruda
      // porque se usa para abrir el archivo (ver listarArchivos en boveda.ts).
      nombre: paraMostrar(nombreDeNota(archivo)),
      tema: datos.tema ?? "(sin tema en el frontmatter)",
      fuente: datos.fuente ?? "(sin fuente)",
      fecha: datos.fecha ?? "(sin fecha)",
      ruta,
    };
  });
}

/** Agrupa las notas por su campo `tema`. Lo usa progreso() para saber que falta. */
export function notasPorTema(): Map<string, ResumenNota[]> {
  const mapa = new Map<string, ResumenNota[]>();
  for (const nota of listarTemas()) {
    const lista = mapa.get(nota.tema) ?? [];
    lista.push(nota);
    mapa.set(nota.tema, lista);
  }
  return mapa;
}

// ---------------------------------------------------------------------------
// RF-02 — leer_nota
// ---------------------------------------------------------------------------

export interface NotaCompleta {
  nombre: string;
  ruta: string;
  frontmatter: ReturnType<typeof parsearFrontmatter>["datos"];
  contenido: string;
}

/**
 * Devuelve el contenido COMPLETO de una nota, sin recortar.
 *
 * Devolvemos todo a proposito, incluidos los bloques mermaid y la seccion
 * "## Preguntas de repaso". El servidor no decide que parte es relevante: eso es
 * razonamiento y vive en el cliente (RNF-09). Si recortaramos, estariamos
 * tomando una decision que no nos corresponde.
 *
 * `resolverArchivo` hace el trabajo fino: tolera el nombre sin ".md", otras
 * mayusculas y la diferencia NFC/NFD de macOS (DA-05).
 */
export function leerNota(nombre: string): NotaCompleta {
  let ruta: string;
  try {
    ruta = resolverArchivo(CARPETAS.notas, nombre, [".md"]);
  } catch (error) {
    // M-03. Antes de rendirse: los `alias` del frontmatter. Varias notas
    // declaran por que nombres se las va a pedir de verdad ("drivers" para
    // "Drivers arquitectonicos"), y sin esto el cliente necesita DOS llamadas:
    // una que falla con sugerencias y otra con el nombre exacto.
    //
    // Es la misma mecanica que ya usa metodo_tarea en tareas.ts. Se aplica solo
    // como respaldo para no cambiar el comportamiento de lo que ya resolvia.
    const porAlias = resolverPorAlias(nombre);
    if (porAlias.length === 1) {
      ruta = porAlias[0]!;
    } else if (porAlias.length > 1) {
      const nombres = porAlias.map((r) => `  - ${paraMostrar(nombreDeNota(r))}`).join("\n");
      throw new ErrorHerramienta(
        `"${nombre}" es un alias ambiguo: lo declaran varias notas.\n\n` +
          `Pedi una de estas por su nombre exacto:\n${nombres}`,
      );
    } else {
      throw error; // El error original ya trae las sugerencias por parecido.
    }
  }

  const contenido = leerTexto(ruta);
  const { datos } = parsearFrontmatter(contenido);

  return {
    nombre: paraMostrar(nombreDeNota(ruta)),
    ruta: paraMostrar(ruta),
    frontmatter: datos,
    contenido,
  };
}

/**
 * Devuelve las rutas de las notas cuyo frontmatter declara `pedido` como alias.
 *
 * El campo `alias` es una lista separada por comas, igual que en las guias de
 * 08-Tareas. Se compara con `clave()` para que "drivers" matchee "Drivers" y
 * "diagrama de contexto" matchee "Diagrama de Contexto".
 */
function resolverPorAlias(pedido: string): string[] {
  const buscado = clave(pedido);
  if (buscado.length === 0) return [];

  const encontradas: string[] = [];
  for (const archivo of listarArchivos(CARPETAS.notas, [".md"])) {
    const ruta = rutaRelativa(CARPETAS.notas, archivo);
    let datos: ReturnType<typeof parsearFrontmatter>["datos"];
    try {
      datos = parsearFrontmatter(leerTexto(ruta)).datos;
    } catch {
      continue; // Una nota ilegible no puede tumbar la resolucion (RNF-03).
    }
    const alias = (datos.alias ?? "")
      .split(",")
      .map((a) => clave(a))
      .filter((a) => a.length > 0);
    if (alias.includes(buscado)) encontradas.push(ruta);
  }
  return encontradas;
}

// ---------------------------------------------------------------------------
// RF-03 — buscar
// ---------------------------------------------------------------------------

/**
 * Palabras que se descartan al tokenizar una consulta. Sin esto, "diferencia
 * entre include y extend" exigiria que la linea contuviera "entre" y "y", que
 * aparecen en cualquier parte y no aportan nada a la relevancia.
 */
const VACIAS = new Set([
  "de", "la", "el", "los", "las", "un", "una", "unos", "unas", "y", "o", "u",
  "que", "como", "entre", "debe", "deben", "tener", "cuantos", "cuantas", "cual",
  "cuales", "es", "son", "en", "del", "al", "por", "para", "se", "con", "sin",
  "sobre", "mas", "muy", "hay", "ser", "esta", "este", "esto", "lo", "le", "su",
]);

/**
 * Cuantas lineas se muestran como maximo por archivo. Existe para que un archivo
 * con muchas menciones no acapare la salida y tape la nota relevante: buscar
 * "paso 0" daba 19 coincidencias y la mayoria eran del mismo archivo.
 */
const POR_ARCHIVO = 3;

export interface Coincidencia {
  ruta: string;
  nombre: string;
  linea: number;
  fragmento: string;
  /**
   * Relevancia del match. Frase exacta = 100, todos los tokens en la linea = 60,
   * todos los tokens en el archivo = 30; +20 si cae en un encabezado y +40 si la
   * nota se llama (o se declara via alias) como lo que se busco.
   */
  puntaje: number;
  /** Cuantas coincidencias mas quedaron sin mostrar en este mismo archivo. */
  mas?: number;
}

/**
 * Busca texto en las notas y en el glosario.
 *
 * Decisiones de esta busqueda, para que sepas que esperar:
 *
 * - Es una busqueda de SUBCADENA, insensible a mayusculas y a la forma Unicode.
 *   No es semantica: si buscas "herencia" no va a encontrar "generalizacion".
 *   La busqueda semantica la hace el modelo leyendo notas, no nosotros.
 *
 * - Busca en el CUERPO, no en el frontmatter. Que "fecha: 2026-08-19" haga match
 *   con una consulta "2026" seria ruido.
 *
 * - Devuelve la LINEA y un fragmento con contexto. La linea sirve para que el
 *   modelo pueda citar la fuente, que es RNF-10.
 *
 * - No hay limite de resultados por archivo pero si un maximo global, para no
 *   inundar el contexto del cliente con una consulta demasiado generica.
 */
export function buscar(consulta: string, maximo = 40): Coincidencia[] {
  const termino = clave(consulta);

  if (termino.length < 2) {
    throw new ErrorHerramienta(
      `La consulta "${consulta}" es demasiado corta: usa al menos 2 caracteres.`,
    );
  }

  // M-01. Tokenizamos para poder responder consultas en lenguaje natural.
  // Antes esto era `clave(linea).includes(termino)` sobre la consulta COMPLETA, asi
  // que "diferencia entre include y extend" daba cero resultados aunque el tema
  // estuviera en tres notas: la frase literal no aparece en ningun archivo.
  const tokens = termino
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 2 && !VACIAS.has(t));

  // Armamos la lista de archivos a revisar: las notas, el glosario y las
  // referencias de herramientas. Incluimos 07-Referencias porque si buscas
  // "mermaid" o "casos de uso" querés encontrar tanto la teoría como la nota que
  // dice si eso se puede importar a StarUML.
  const objetivos: string[] = listarArchivos(CARPETAS.notas, [".md"]).map((a) =>
    rutaRelativa(CARPETAS.notas, a),
  );
  objetivos.push(CARPETAS.glosario);
  for (const a of listarArchivos(CARPETAS.referencias, [".md"])) {
    objetivos.push(rutaRelativa(CARPETAS.referencias, a));
  }
  // Y las notas de la RAIZ de la boveda. Aca viven el indice y el programa oficial
  // del curso, que son de las notas mas consultadas: sin esto, buscar "parcial" o
  // "estilos arquitectonicos" no encontraria el cronograma ni los huecos del programa.
  for (const a of listarArchivos(".", [".md"])) {
    objetivos.push(a);
  }
  // Y las guias de tareas: si buscas "checklist" o "actor" querés encontrar tanto la
  // teoría como el paso de la guía donde esa regla se verifica.
  for (const a of listarArchivos(CARPETAS.tareas, [".md"])) {
    objetivos.push(rutaRelativa(CARPETAS.tareas, a));
  }

  // M-02. El glosario entraba DOS veces: una por el push explicito de arriba y
  // otra por el listado de la raiz, que tambien lo incluye. Eso hacia que cada
  // coincidencia en el glosario se reportara duplicada.
  const unicos = [...new Set(objetivos.map((r) => paraMostrar(r)))].map(
    (mostrado, i) => objetivos.find((r) => paraMostrar(r) === mostrado) ?? objetivos[i]!,
  );

  const porArchivo: Coincidencia[][] = [];

  for (const ruta of unicos) {
    let contenido: string;
    try {
      contenido = leerTexto(ruta);
    } catch {
      continue; // Un archivo ilegible no puede tumbar la busqueda completa (RNF-03).
    }

    // Para las notas salteamos el frontmatter; el glosario no tiene cuerpo aparte
    // que valga la pena separar, asi que lo tratamos igual por consistencia.
    const { datos, cuerpo } = parsearFrontmatter(contenido);
    const lineas = cuerpo.split("\n");

    // Offset: cuantas lineas nos comio el frontmatter, para reportar el numero
    // de linea REAL del archivo y no el del cuerpo recortado.
    const offset = contenido.split("\n").length - lineas.length;

    const nombre = nombreDeNota(ruta);
    // Bonus por identidad: si el match cae en una nota cuyo TITULO o cuyos ALIAS
    // contienen los tokens, esa nota es mas relevante que una que solo los
    // menciona de paso. Sin esto, buscar "navegabilidad" podia devolver primero
    // una mencion lateral en otra nota antes que la nota de Convenios.
    const identidad = clave(
      `${nombre} ${datos.alias ?? ""} ${datos.tema ?? ""}`,
    );
    const bonusNota = tokens.length > 0 && tokens.every((t) => identidad.includes(t)) ? 40 : 0;

    const delArchivo: Coincidencia[] = [];

    for (let i = 0; i < lineas.length; i++) {
      const linea = lineas[i] ?? "";
      const llave = clave(linea);

      // Tres pasadas con puntaje decreciente, segun la especificacion del
      // backlog: frase exacta > todos los tokens en la linea > (fuera del bucle)
      // todos los tokens en el archivo.
      let puntaje = 0;
      let ancla = termino;

      if (llave.includes(termino)) {
        puntaje = 100;
      } else if (tokens.length > 0 && tokens.every((t) => llave.includes(t))) {
        puntaje = 60;
        ancla = tokens.find((t) => llave.includes(t)) ?? termino;
      } else {
        continue;
      }

      // Un match en un encabezado vale mas: es el tema de la seccion, no una
      // mencion al pasar.
      if (/^#{1,6}\s/.test(linea.trim())) puntaje += 20;

      delArchivo.push({
        ruta: paraMostrar(ruta),
        nombre: paraMostrar(nombre),
        linea: i + 1 + offset,
        fragmento: recortarAlrededor(linea, ancla),
        puntaje: puntaje + bonusNota,
      });
    }

    // Tercera pasada: si ninguna LINEA junta todos los tokens pero el ARCHIVO si,
    // reportamos la linea que mas tokens junta. Es lo que hace que
    // "cuantos actores debe tener un caso de uso" encuentre la nota de Convenios,
    // donde la regla esta redactada con otras palabras.
    if (delArchivo.length === 0 && tokens.length > 1) {
      const llaveArchivo = clave(cuerpo);
      if (tokens.every((t) => llaveArchivo.includes(t))) {
        let mejor = -1;
        let mejorCuenta = 0;
        for (let i = 0; i < lineas.length; i++) {
          const llave = clave(lineas[i] ?? "");
          const cuenta = tokens.filter((t) => llave.includes(t)).length;
          if (cuenta > mejorCuenta) {
            mejorCuenta = cuenta;
            mejor = i;
          }
        }
        if (mejor >= 0) {
          const linea = lineas[mejor] ?? "";
          const ancla = tokens.find((t) => clave(linea).includes(t)) ?? tokens[0]!;
          delArchivo.push({
            ruta: paraMostrar(ruta),
            nombre: paraMostrar(nombre),
            linea: mejor + 1 + offset,
            fragmento: recortarAlrededor(linea, ancla),
            puntaje: 30 + bonusNota,
          });
        }
      }
    }

    if (delArchivo.length > 0) porArchivo.push(delArchivo);
  }

  // M-04. Antes el tope global de 40 se llenaba por orden de recorrido, asi que
  // un archivo con 19 menciones podia acaparar la salida y tapar la nota
  // realmente relevante. Ahora: cada archivo aporta a lo sumo POR_ARCHIVO lineas
  // (las de mejor puntaje) y el conjunto se ordena por relevancia.
  const resultados: Coincidencia[] = [];
  for (const grupo of porArchivo) {
    grupo.sort((a, b) => b.puntaje - a.puntaje || a.linea - b.linea);
    const visibles = grupo.slice(0, POR_ARCHIVO);
    const resto = grupo.length - visibles.length;
    if (resto > 0) {
      const ultimo = visibles[visibles.length - 1]!;
      ultimo.mas = resto;
    }
    resultados.push(...visibles);
  }

  resultados.sort((a, b) => b.puntaje - a.puntaje || a.ruta.localeCompare(b.ruta) || a.linea - b.linea);
  return resultados.slice(0, maximo);
}

/**
 * Recorta una linea larga para mostrar el termino con contexto a los lados.
 * Sin esto, una fila de tabla de 300 caracteres se lleva todo el espacio.
 */
function recortarAlrededor(linea: string, termino: string, ancho = 160): string {
  const limpia = linea.trim();
  if (limpia.length <= ancho) return limpia;

  const posicion = clave(limpia).indexOf(termino);
  if (posicion === -1) return `${limpia.slice(0, ancho)}...`;

  const desde = Math.max(0, posicion - Math.floor(ancho / 3));
  const hasta = Math.min(limpia.length, desde + ancho);

  return `${desde > 0 ? "..." : ""}${limpia.slice(desde, hasta)}${hasta < limpia.length ? "..." : ""}`;
}
