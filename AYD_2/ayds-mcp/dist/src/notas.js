/**
 * notas.ts — RF-01 (listar_temas), RF-02 (leer_nota) y RF-03 (buscar).
 *
 * Todo lo de aca es SOLO LECTURA. La boveda se edita en Obsidian, no por MCP
 * (DA-04): un modelo con permiso de escribir sobre los apuntes puede arruinarlos
 * sin que uno se de cuenta.
 */
import { CARPETAS, ErrorHerramienta, clave, leerTexto, listarArchivos, nombreDeNota, paraMostrar, parsearFrontmatter, resolverArchivo, rutaRelativa, } from "./boveda.js";
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
export function listarTemas() {
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
export function notasPorTema() {
    const mapa = new Map();
    for (const nota of listarTemas()) {
        const lista = mapa.get(nota.tema) ?? [];
        lista.push(nota);
        mapa.set(nota.tema, lista);
    }
    return mapa;
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
export function leerNota(nombre) {
    const ruta = resolverArchivo(CARPETAS.notas, nombre, [".md"]);
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
export function buscar(consulta, maximo = 40) {
    const termino = clave(consulta);
    if (termino.length < 2) {
        throw new ErrorHerramienta(`La consulta "${consulta}" es demasiado corta: usa al menos 2 caracteres.`);
    }
    const resultados = [];
    // Armamos la lista de archivos a revisar: las notas, el glosario y las
    // referencias de herramientas. Incluimos 07-Referencias porque si buscas
    // "mermaid" o "casos de uso" querés encontrar tanto la teoría como la nota que
    // dice si eso se puede importar a StarUML.
    const objetivos = listarArchivos(CARPETAS.notas, [".md"]).map((a) => rutaRelativa(CARPETAS.notas, a));
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
    for (const ruta of objetivos) {
        let contenido;
        try {
            contenido = leerTexto(ruta);
        }
        catch {
            continue; // Un archivo ilegible no puede tumbar la busqueda completa (RNF-03).
        }
        // Para las notas salteamos el frontmatter; el glosario no tiene cuerpo aparte
        // que valga la pena separar, asi que lo tratamos igual por consistencia.
        const { cuerpo } = parsearFrontmatter(contenido);
        const lineas = cuerpo.split("\n");
        // Offset: cuantas lineas nos comio el frontmatter, para reportar el numero
        // de linea REAL del archivo y no el del cuerpo recortado.
        const offset = contenido.split("\n").length - lineas.length;
        for (let i = 0; i < lineas.length; i++) {
            const linea = lineas[i] ?? "";
            if (!clave(linea).includes(termino))
                continue;
            resultados.push({
                ruta: paraMostrar(ruta),
                nombre: paraMostrar(nombreDeNota(ruta)),
                linea: i + 1 + offset,
                fragmento: recortarAlrededor(linea, termino),
            });
            if (resultados.length >= maximo)
                return resultados;
        }
    }
    return resultados;
}
/**
 * Recorta una linea larga para mostrar el termino con contexto a los lados.
 * Sin esto, una fila de tabla de 300 caracteres se lleva todo el espacio.
 */
function recortarAlrededor(linea, termino, ancho = 160) {
    const limpia = linea.trim();
    if (limpia.length <= ancho)
        return limpia;
    const posicion = clave(limpia).indexOf(termino);
    if (posicion === -1)
        return `${limpia.slice(0, ancho)}...`;
    const desde = Math.max(0, posicion - Math.floor(ancho / 3));
    const hasta = Math.min(limpia.length, desde + ancho);
    return `${desde > 0 ? "..." : ""}${limpia.slice(desde, hasta)}${hasta < limpia.length ? "..." : ""}`;
}
//# sourceMappingURL=notas.js.map