/**
 * progreso.ts — RF-08 (registrar_resultado) y RF-09 (progreso).
 *
 * ESTE ES EL UNICO MODULO DEL SERVIDOR QUE ESCRIBE, y escribe en un solo archivo:
 * 05-Quizzes/progreso.md (RNF-02).
 *
 * Fijate en como se garantiza eso: la ruta sale de `rutaDeEscrituraProgreso()`,
 * que no recibe parametros. No hay forma de pasarle otro archivo ni por error ni
 * a proposito, porque no hay parametro por donde entrar. Ocho de las nueve
 * herramientas ni siquiera importan este modulo.
 */
import { appendFileSync, existsSync, writeFileSync } from "node:fs";
import { ARCHIVO_PROGRESO, ErrorHerramienta, clave, leerTexto, rutaDeEscrituraProgreso, } from "./boveda.js";
import { notasPorTema } from "./notas.js";
/**
 * Encabezado con el que se crea el archivo si no existe.
 *
 * Esto atiende un riesgo que quedo identificado en el diseno: 05-Quizzes/ existe
 * pero progreso.md todavia no, asi que la primera llamada a registrar_resultado
 * fallaria si no lo creamos. Lo creamos con frontmatter para que sea una nota
 * valida de Obsidian, no un archivo huerfano.
 */
function plantillaInicial() {
    return [
        "---",
        "tema: Progreso",
        "fuente: Registro automatico del servidor MCP tutor-ayds",
        `fecha: ${fechaDeHoy()}`,
        "---",
        "",
        "# Progreso de quizzes",
        "",
        "Registro de resultados. Cada linea la agrega la herramienta `registrar_resultado`",
        "del servidor MCP `tutor-ayds`. El puntaje esta en escala 0 a 100.",
        "",
        "| Fecha | Tema | Puntaje | Comentarios |",
        "|---|---|---|---|",
        "",
    ].join("\n");
}
/** Fecha de hoy en formato ISO corto (YYYY-MM-DD), que es el que usa la boveda. */
function fechaDeHoy() {
    return new Date().toISOString().slice(0, 10);
}
/**
 * Escapa un texto para que no rompa la tabla markdown.
 *
 * El caracter peligroso es el pipe: un comentario como "flojo en include | extend"
 * agregaria una columna a la fila y descuadraria la tabla en Obsidian. Tambien
 * aplastamos los saltos de linea, porque una fila de tabla es una sola linea.
 *
 * Este es el unico dato del servidor que viene del modelo y termina escrito en
 * disco, asi que es el unico lugar donde hace falta sanear.
 */
function escaparParaTabla(texto) {
    return texto
        .replace(/\r?\n/g, " ")
        .replace(/\|/g, "\\|")
        .trim();
}
// ---------------------------------------------------------------------------
// RF-08 — registrar_resultado (LA UNICA ESCRITURA)
// ---------------------------------------------------------------------------
export function registrarResultado(tema, puntaje, comentarios) {
    // --- Validacion de las entradas ---
    // Vienen de un modelo: hay que asumir que pueden llegar mal.
    const temaLimpio = escaparParaTabla(tema);
    if (temaLimpio.length === 0) {
        throw new ErrorHerramienta("El tema no puede estar vacio.");
    }
    if (!Number.isFinite(puntaje)) {
        throw new ErrorHerramienta(`El puntaje "${puntaje}" no es un numero. Se espera un valor de 0 a 100.`);
    }
    if (puntaje < 0 || puntaje > 100) {
        throw new ErrorHerramienta(`El puntaje ${puntaje} esta fuera de rango. Se espera un valor de 0 a 100 ` +
            `(por ejemplo, 7 aciertos sobre 10 preguntas son 70).`);
    }
    const redondeado = Math.round(puntaje);
    const ruta = rutaDeEscrituraProgreso();
    const creado = !existsSync(ruta);
    // Si el archivo no existe, lo creamos con encabezado antes de agregar la fila.
    if (creado) {
        writeFileSync(ruta, plantillaInicial(), "utf8");
    }
    const linea = `| ${fechaDeHoy()} | ${temaLimpio} | ${redondeado} | ${comentarios ? escaparParaTabla(comentarios) : "—"} |`;
    // appendFileSync y no readFileSync + writeFileSync: si escribieramos el archivo
    // completo y el proceso muriera a mitad de camino, perderiamos todo el historial.
    // Agregando al final, lo peor que puede pasar es una fila incompleta.
    appendFileSync(ruta, `${linea}\n`, "utf8");
    return { linea, archivo: ARCHIVO_PROGRESO, creado };
}
// ---------------------------------------------------------------------------
// RF-09 — progreso
// ---------------------------------------------------------------------------
/** Lee las filas de la tabla de progreso.md. Devuelve [] si el archivo no existe. */
export function leerRegistros() {
    let contenido;
    try {
        contenido = leerTexto(ARCHIVO_PROGRESO);
    }
    catch {
        return []; // Todavia no se registro nada: no es un error.
    }
    const registros = [];
    for (const lineaCruda of contenido.split(/\r?\n/)) {
        const linea = lineaCruda.trim();
        if (!linea.startsWith("|"))
            continue;
        // Separamos por pipes NO escapados, para no partir un comentario que
        // contenga "\|" (lo que escribe escaparParaTabla).
        const celdas = linea
            .split(/(?<!\\)\|/)
            .map((c) => c.trim().replace(/\\\|/g, "|"))
            .filter((c) => c.length > 0);
        if (celdas.length < 3)
            continue;
        const [fecha, tema, puntajeCrudo, ...resto] = celdas;
        // Salteamos el encabezado ("Fecha | Tema | ...") y la fila separadora ("---").
        if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha))
            continue;
        const puntaje = Number(puntajeCrudo);
        registros.push({
            fecha,
            tema: tema ?? "",
            puntaje: Number.isFinite(puntaje) ? puntaje : 0,
            comentarios: resto.join(" | ").trim(),
        });
    }
    return registros;
}
/**
 * RF-09. Resume el progreso cruzando DOS fuentes.
 *
 * Este es el requerimiento derivado que quedo anotado en el diseno: "pendiente" no
 * se puede saber leyendo solo progreso.md. Un tema pendiente es un `tema` que
 * aparece en el frontmatter de 01-Notas/ y NO aparece en progreso.md. O sea, hay
 * que cruzar el registro con las notas.
 *
 * La comparacion de temas se hace normalizada (clave()), asi "Casos de uso" y
 * "casos de uso" cuentan como el mismo tema. Sin eso, un cambio de mayuscula al
 * registrar dejaria el tema como pendiente para siempre.
 */
export function obtenerProgreso() {
    const registros = leerRegistros();
    // Agrupamos por tema normalizado, pero guardamos el nombre tal como se escribio
    // la primera vez para mostrarlo lindo.
    const porTema = new Map();
    for (const registro of registros) {
        const k = clave(registro.tema);
        const entrada = porTema.get(k) ?? { nombre: registro.tema, items: [] };
        entrada.items.push(registro);
        porTema.set(k, entrada);
    }
    const temasEvaluados = [...porTema.values()].map(({ nombre, items }) => {
        const puntajes = items.map((i) => i.puntaje);
        // Los ordenamos por fecha para que "ultimo" sea el mas reciente de verdad,
        // no simplemente el ultimo que aparece en el archivo.
        const ordenados = [...items].sort((a, b) => a.fecha.localeCompare(b.fecha));
        const ultimo = ordenados[ordenados.length - 1];
        return {
            tema: nombre,
            evaluaciones: items.length,
            ultimoPuntaje: ultimo?.puntaje ?? 0,
            mejorPuntaje: Math.max(...puntajes),
            promedio: Math.round(puntajes.reduce((a, b) => a + b, 0) / puntajes.length),
            ultimaFecha: ultimo?.fecha ?? "",
        };
    });
    // El cruce con las notas: temas que existen en la boveda y no fueron evaluados.
    const evaluados = new Set([...porTema.keys()]);
    const temasPendientes = [...notasPorTema().keys()]
        .filter((tema) => !evaluados.has(clave(tema)))
        .sort((a, b) => a.localeCompare(b, "es"));
    const promedioGeneral = registros.length > 0
        ? Math.round(registros.reduce((a, r) => a + r.puntaje, 0) / registros.length)
        : null;
    return {
        totalEvaluaciones: registros.length,
        temasEvaluados: temasEvaluados.sort((a, b) => b.ultimaFecha.localeCompare(a.ultimaFecha)),
        temasPendientes,
        promedioGeneral,
    };
}
//# sourceMappingURL=progreso.js.map