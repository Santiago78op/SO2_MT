/**
 * boveda.ts — acceso seguro al sistema de archivos.
 *
 * Este es el modulo mas importante del servidor y el que conviene leer primero.
 * Todo lo demas pasa por aca. Implementa tres cosas:
 *
 *   1. RNF-01 / DA-07 — confinamiento de rutas: nada fuera de VAULT_PATH.
 *   2. DA-05 — normalizacion Unicode: el problema de los acentos en macOS.
 *   3. Lectura de archivos y parseo del frontmatter YAML de las notas.
 *
 * Nada de este modulo escribe. La unica escritura del servidor vive en progreso.ts
 * y usa `rutaDeEscrituraProgreso()`, definida aca abajo, para no poder equivocarse
 * de archivo (RNF-02).
 */

import { readFileSync, readdirSync, statSync, realpathSync, existsSync } from "node:fs";
import { resolve, sep, join, basename, extname } from "node:path";

// ---------------------------------------------------------------------------
// Error de herramienta
// ---------------------------------------------------------------------------

/**
 * Error "esperado": algo que el modelo pidio mal y que se le puede explicar
 * para que reintente (una nota que no existe, un tema sin flashcards).
 *
 * Se distingue de un error inesperado (un bug nuestro) porque el handler lo
 * convierte en un resultado con `isError: true` en vez de dejar que explote.
 * Es DA-09: los errores viajan como resultado, no como excepcion que mata el
 * proceso.
 *
 * El campo `sugerencias` existe porque el error mas comun va a ser que el modelo
 * invente un nombre de nota. Devolverle los nombres parecidos es mucho mas util
 * que un "no existe" seco.
 */
export class ErrorHerramienta extends Error {
  constructor(
    message: string,
    public readonly sugerencias: string[] = [],
  ) {
    super(message);
    this.name = "ErrorHerramienta";
  }
}

// ---------------------------------------------------------------------------
// DA-05 — Normalizacion Unicode
// ---------------------------------------------------------------------------

/**
 * Normaliza un texto a NFC para poder compararlo.
 *
 * EL PROBLEMA (y por que esto no es paranoia):
 * En macOS, APFS guarda los nombres de archivo en NFD ("forma descompuesta").
 * El nombre "Descripción textual de casos de uso.md" se guarda con la "o" y su
 * tilde como DOS code points separados: U+006F + U+0301.
 *
 * Cuando el modelo pide `leer_nota("Descripción textual de casos de uso")`, ese
 * texto viene en NFC ("forma compuesta"): un solo code point U+00F3 para la "ó".
 *
 * Los dos textos se VEN identicos en pantalla, pero `===` da false. Sin esta
 * funcion, en el Mac todas las notas con acento serian imposibles de abrir — y
 * en esta boveda la mayoria tiene acentos.
 *
 * Normalizando ambos lados a NFC, la comparacion funciona sin importar como los
 * guardo el sistema de archivos.
 */
export function normalizar(texto: string): string {
  return texto.normalize("NFC");
}

/**
 * Normaliza para BUSCAR: NFC + minusculas + sin espacios en los extremos.
 *
 * Las minusculas van porque APFS es insensible a mayusculas (`nota.md` y
 * `Nota.md` son el mismo archivo). Si el sistema de archivos no distingue,
 * nuestra busqueda tampoco deberia: seria incoherente encontrar el archivo
 * a veces si y a veces no segun como lo escriba el modelo.
 */
export function clave(texto: string): string {
  return (
    normalizar(texto)
      .toLowerCase()
      .trim()
      // Y ademas SIN ACENTOS. La boveda esta en espanol y esta llena de acentos
      // ("Descripcion textual", "reutilizacion", "Generalizacion"), pero el modelo
      // — y una persona apurada — los escribe indistintamente. Sin esto,
      // buscar("reutilizacion") devuelve 0 resultados aunque la palabra este en
      // tres notas, y eso se lee como "no hay material" cuando si lo hay.
      //
      // Se descompone a NFD para separar la letra de su tilde, se borran los
      // diacriticos (categoria Unicode Mn) y queda la letra base.
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
  );
}

// ---------------------------------------------------------------------------
// Configuracion: VAULT_PATH
// ---------------------------------------------------------------------------

/** Subcarpetas conocidas de la boveda. Se usan como constantes, nunca como parametro. */
export const CARPETAS = {
  notas: "01-Notas",
  diagramas: "02-Diagramas",
  glosario: "03-Glosario.md",
  flashcards: "04-Flashcards",
  quizzes: "05-Quizzes",
  // Segundo cerebro de HERRAMIENTAS (StarUML, Excalidraw) y el puente entre la
  // teoria y el diagrama. Va aparte de 01-Notas a proposito: ver referencias.ts.
  referencias: "07-Referencias",
  // Metodo de trabajo, guias paso a paso por entregable y enunciados del curso.
  tareas: "08-Tareas",
} as const;

/** RF-08: la UNICA ruta que este servidor puede escribir (RNF-02). */
export const ARCHIVO_PROGRESO = `${CARPETAS.quizzes}/progreso.md`;

let raizBoveda: string | null = null;

/**
 * Lee y valida VAULT_PATH una sola vez, al arrancar (RNF-05).
 *
 * Preferimos fallar aca, en el arranque, con un mensaje claro en stderr, antes
 * que fallar en cada llamada a una herramienta. Si la boveda no existe el
 * servidor no tiene nada que servir.
 *
 * Guardamos la ruta REAL (realpathSync): si VAULT_PATH fuera un symlink, todas
 * las comparaciones posteriores tienen que hacerse contra el destino real, o el
 * chequeo de prefijo de `rutaSegura` daria false para archivos que si estan
 * dentro.
 */
export function inicializarBoveda(): string {
  const crudo = process.env["VAULT_PATH"];

  if (!crudo || crudo.trim() === "") {
    throw new Error(
      "Falta la variable de entorno VAULT_PATH.\n" +
        "Debe apuntar a la carpeta raiz de la boveda de Obsidian.\n" +
        'Ejemplo en macOS: VAULT_PATH="/Users/tu-usuario/Documents/Ayd"',
    );
  }

  const absoluta = resolve(crudo);

  if (!existsSync(absoluta)) {
    throw new Error(`VAULT_PATH apunta a una carpeta que no existe: ${absoluta}`);
  }
  if (!statSync(absoluta).isDirectory()) {
    throw new Error(`VAULT_PATH tiene que ser una carpeta, no un archivo: ${absoluta}`);
  }

  raizBoveda = realpathSync(absoluta);
  return raizBoveda;
}

/** La raiz de la boveda ya validada. Falla si alguien la usa antes de inicializar. */
export function raiz(): string {
  if (raizBoveda === null) {
    throw new Error("La boveda no fue inicializada: llama a inicializarBoveda() primero.");
  }
  return raizBoveda;
}

// ---------------------------------------------------------------------------
// RNF-01 / DA-07 — Confinamiento de rutas
// ---------------------------------------------------------------------------

/**
 * Convierte una ruta relativa a la boveda en una ruta absoluta VERIFICADA.
 *
 * Este es el `<<include>>` que el diagrama de casos de uso del diseno pone en
 * todos los casos de uso: siempre se ejecuta, nunca es opcional.
 *
 * COMO SE ROMPE UNA VALIDACION DE RUTAS (y como lo evitamos):
 *
 * Intento 1 — "chequeo que no tenga '..'":
 *   Insuficiente. `resolve()` ya resuelve los `..`, pero un SYMLINK dentro de la
 *   boveda que apunte a /etc/passwd no tiene ningun `..` en el nombre y se
 *   escaparia igual.
 *
 * Intento 2 — "comparo el string resuelto con la raiz":
 *   Sigue siendo insuficiente por lo mismo: el string se ve adentro, el archivo
 *   real esta afuera.
 *
 * Lo que hacemos (DA-07): resolvemos el symlink con `realpathSync` y DESPUES
 * comparamos el prefijo. Asi lo que validamos es el destino real, no el nombre.
 *
 * Detalle del prefijo: comparamos contra `raiz + separador`, no contra `raiz`
 * pelada. Si no, una carpeta hermana llamada "Ayd-privado" pasaria el chequeo
 * de `startsWith("/ruta/Ayd")`.
 */
export function rutaSegura(relativa: string): string {
  const base = raiz();

  // Rechazamos rutas absolutas de entrada: el parametro es siempre relativo a
  // la boveda. Si aceptaramos "/etc/passwd", resolve() lo tomaria tal cual.
  if (relativa.startsWith("/") || /^[a-zA-Z]:/.test(relativa)) {
    throw new ErrorHerramienta(
      `Ruta rechazada: se esperaba una ruta relativa a la boveda, no una absoluta ("${relativa}").`,
    );
  }

  const candidata = resolve(base, relativa);

  // Primer filtro: sobre la ruta resuelta, antes de tocar el disco.
  if (candidata !== base && !candidata.startsWith(base + sep)) {
    throw new ErrorHerramienta(
      `Ruta rechazada: "${relativa}" queda fuera de la boveda. ` +
        `Este servidor solo puede leer dentro de VAULT_PATH.`,
    );
  }

  // Segundo filtro: si el archivo existe, resolvemos symlinks y revalidamos.
  // Si no existe, devolvemos la candidata y que el llamador decida (para poder
  // CREAR progreso.md, que todavia no existe).
  if (existsSync(candidata)) {
    const real = realpathSync(candidata);
    if (real !== base && !real.startsWith(base + sep)) {
      throw new ErrorHerramienta(
        `Ruta rechazada: "${relativa}" es un enlace que apunta fuera de la boveda.`,
      );
    }
    return real;
  }

  return candidata;
}

/**
 * La ruta de progreso.md, resuelta y validada.
 *
 * Existe como funcion propia y sin parametros a proposito (RNF-02): la ruta sale
 * de una constante, no de nada que venga del modelo. Aunque un dia alguien
 * introduzca un bug en otra herramienta, esta escritura no puede apuntar a otro
 * archivo porque no hay por donde pasarle uno.
 */
export function rutaDeEscrituraProgreso(): string {
  return rutaSegura(ARCHIVO_PROGRESO);
}

// ---------------------------------------------------------------------------
// Lectura
// ---------------------------------------------------------------------------

/** Lee un archivo de texto de la boveda. `relativa` es relativa a VAULT_PATH. */
export function leerTexto(relativa: string): string {
  const ruta = rutaSegura(relativa);
  if (!existsSync(ruta)) {
    throw new ErrorHerramienta(`No existe el archivo "${relativa}" en la boveda.`);
  }
  return normalizar(readFileSync(ruta, "utf8"));
}

/**
 * Lista los archivos de una subcarpeta de la boveda, filtrando por extension.
 * Devuelve solo nombres de archivo (no rutas), ordenados alfabeticamente.
 *
 * ATENCION — NO normalizar los nombres que devuelve esta funcion.
 *
 * Es tentador hacer `.map(normalizar)` aca para "dejar todo prolijo en NFC", y
 * esta primera version lo hacia. Es un bug, y las pruebas lo agarraron:
 *
 *   1. En disco el archivo se llama "Descripción textual.md" en NFD.
 *   2. Normalizamos el nombre a NFC al listarlo.
 *   3. Construimos la ruta "01-Notas/Descripción textual.md" (en NFC).
 *   4. `existsSync` de esa ruta da FALSE, porque en disco el nombre es NFD.
 *      -> "No existe el archivo", con el archivo ahi delante.
 *
 * La regla que sale de eso, y que vale para todo el proyecto:
 *
 *   Normalizar sirve para COMPARAR y para MOSTRAR.
 *   NUNCA se normaliza un valor que despues se va a usar como ruta de disco.
 *
 * Por eso lo que se devuelve aca es el nombre crudo del sistema de archivos, y
 * la normalizacion ocurre en `clave()` (comparacion) o justo antes de mostrar.
 */
export function listarArchivos(subcarpeta: string, extensiones: string[]): string[] {
  const ruta = rutaSegura(subcarpeta);
  if (!existsSync(ruta)) return [];

  return readdirSync(ruta)
    .filter((nombre) => {
      if (nombre.startsWith(".")) return false; // .gitkeep, .DS_Store del Mac
      return extensiones.includes(extname(nombre).toLowerCase());
    })
    .sort((a, b) => normalizar(a).localeCompare(normalizar(b), "es"));
}

/**
 * Busca un archivo por nombre dentro de una subcarpeta, de forma tolerante.
 *
 * Tolera tres cosas que el modelo hace todo el tiempo:
 *   - mandar el nombre sin la extension (.md)
 *   - mandarlo con otras mayusculas
 *   - mandarlo en NFC cuando el disco lo tiene en NFD (DA-05)
 *
 * Si no lo encuentra, lanza un ErrorHerramienta CON SUGERENCIAS. Eso es lo que
 * hace la diferencia entre un modelo que reintenta bien y uno que se queda
 * trabado repitiendo el mismo nombre inventado.
 */
export function resolverArchivo(
  subcarpeta: string,
  nombrePedido: string,
  extensiones: string[] = [".md"],
): string {
  const disponibles = listarArchivos(subcarpeta, extensiones);
  const pedido = clave(nombrePedido);

  // Comparamos con y sin extension, en ambos sentidos.
  for (const archivo of disponibles) {
    const sinExt = clave(basename(archivo, extname(archivo)));
    if (clave(archivo) === pedido || sinExt === pedido) {
      return `${subcarpeta}/${archivo}`;
    }
  }

  throw new ErrorHerramienta(
    `No encontre "${nombrePedido}" en ${subcarpeta}/.`,
    sugerir(nombrePedido, disponibles),
  );
}

/**
 * Devuelve los nombres mas parecidos a lo que se pidio, para acompanar el error.
 *
 * No usamos distancia de edicion: para nombres de notas alcanza con coincidencia
 * de palabras. Si el modelo pidio "casos de uso" queremos que aparezcan todas
 * las notas que contengan esas palabras, que es mas util que la nota que difiere
 * en menos letras.
 */
export function sugerir(pedido: string, disponibles: string[], maximo = 5): string[] {
  const palabras = clave(pedido)
    .split(/\s+/)
    .filter((p) => p.length > 2);

  const puntuadas = disponibles
    .map((archivo) => {
      const k = clave(archivo);
      const aciertos = palabras.filter((p) => k.includes(p)).length;
      return { archivo, aciertos };
    })
    .filter((x) => x.aciertos > 0)
    .sort((a, b) => b.aciertos - a.aciertos);

  // Si ninguna palabra coincidio, devolvemos igual las primeras opciones: es
  // mejor mostrarle al modelo que existe que dejarlo sin nada.
  const lista = puntuadas.length > 0 ? puntuadas.map((x) => x.archivo) : disponibles;
  return lista.slice(0, maximo).map((a) => basename(a, extname(a)));
}

// ---------------------------------------------------------------------------
// Frontmatter YAML
// ---------------------------------------------------------------------------

export interface Frontmatter {
  tema?: string;
  fuente?: string;
  fecha?: string;
  [clave: string]: string | undefined;
}

/**
 * Extrae el frontmatter YAML del principio de una nota.
 *
 * Es un parser deliberadamente minimo: solo pares `clave: valor` de una linea.
 * No metemos una libreria de YAML porque nuestras notas usan exactamente ese
 * formato y una dependencia mas es superficie de ataque y peso sin beneficio.
 * Si algun dia hicieran falta listas o valores anidados, aca es donde se cambia.
 *
 * Devuelve tambien el `cuerpo` (la nota sin el frontmatter) porque las busquedas
 * no deberian encontrar coincidencias en los metadatos.
 */
export function parsearFrontmatter(contenido: string): { datos: Frontmatter; cuerpo: string } {
  const lineas = contenido.split(/\r?\n/);

  // El frontmatter tiene que empezar en la primerisima linea con "---".
  if (lineas[0]?.trim() !== "---") {
    return { datos: {}, cuerpo: contenido };
  }

  const cierre = lineas.findIndex((linea, i) => i > 0 && linea.trim() === "---");
  if (cierre === -1) {
    return { datos: {}, cuerpo: contenido };
  }

  const datos: Frontmatter = {};
  for (const linea of lineas.slice(1, cierre)) {
    const corte = linea.indexOf(":");
    if (corte <= 0) continue;

    const nombre = linea.slice(0, corte).trim();
    let valor = linea.slice(corte + 1).trim();

    // Sacamos las comillas si el valor venia entrecomillado (nuestras notas
    // entrecomillan "fuente" porque contiene barras y parentesis).
    if (
      (valor.startsWith('"') && valor.endsWith('"')) ||
      (valor.startsWith("'") && valor.endsWith("'"))
    ) {
      valor = valor.slice(1, -1);
    }

    if (nombre) datos[nombre] = valor;
  }

  return { datos, cuerpo: lineas.slice(cierre + 1).join("\n") };
}

/** Nombre de una nota tal como se usa en los wikilinks: el archivo sin ".md". */
export function nombreDeNota(archivo: string): string {
  return basename(archivo, extname(archivo));
}

/**
 * Prepara un nombre para MOSTRARLO al modelo o al usuario.
 *
 * Es la contracara de la advertencia de `listarArchivos`: acá sí normalizamos,
 * porque este valor no vuelve a tocar el disco. Devolvemos NFC porque es la forma
 * canonica y la que el modelo va a usar cuando nos lo pase de vuelta — y si nos
 * lo pasa en NFD tambien funciona, porque `clave()` normaliza los dos lados.
 *
 * Existe como funcion con nombre propio (en vez de llamar a `normalizar`
 * directamente) para que en el codigo se lea la INTENCION: "esto es para
 * mostrar, no para abrir un archivo".
 */
export function paraMostrar(texto: string): string {
  return normalizar(texto);
}

/** Une partes de ruta con "/" (el separador que usamos hacia el modelo, en todos los SO). */
export function rutaRelativa(...partes: string[]): string {
  return partes.join("/");
}

/** Ruta absoluta en disco, para mensajes de diagnostico. */
export function rutaAbsoluta(relativa: string): string {
  return join(raiz(), relativa);
}
