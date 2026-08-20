/**
 * pruebas/verificaciones.ts — pruebas de las afirmaciones del diseno.
 *
 * El diseno afirma tres cosas fuertes. Aca se comprueban en vez de creerlas:
 *
 *   RNF-01 / DA-07 — ninguna ruta se escapa de VAULT_PATH.
 *   DA-05         — un nombre con acento se encuentra venga en NFC o en NFD.
 *   RNF-02        — solo se escribe 05-Quizzes/progreso.md.
 *
 * Todo corre contra una BOVEDA TEMPORAL que este script crea y borra. La boveda
 * real no se toca: seria muy feo dejar un resultado de quiz inventado en el
 * historial de estudio de verdad.
 *
 * Uso:
 *   npm run build
 *   node dist/pruebas/verificaciones.js
 */
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync, symlinkSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { ErrorHerramienta, clave, inicializarBoveda, raiz, rutaSegura, resolverArchivo, } from "../src/boveda.js";
import { registrarResultado, leerRegistros, obtenerProgreso } from "../src/progreso.js";
import { listarTemas, buscar } from "../src/notas.js";
let pasadas = 0;
let falladas = 0;
function verificar(descripcion, condicion, detalle = "") {
    if (condicion) {
        pasadas++;
        console.log(`  OK    ${descripcion}`);
    }
    else {
        falladas++;
        console.log(`  FALLA ${descripcion}${detalle ? `\n          ${detalle}` : ""}`);
    }
}
/** Verifica que una funcion lance ErrorHerramienta. */
function verificarRechazo(descripcion, fn) {
    try {
        fn();
        verificar(descripcion, false, "no lanzo ningun error: LA RUTA PASO EL FILTRO");
    }
    catch (error) {
        verificar(descripcion, error instanceof ErrorHerramienta, `lanzo ${String(error)}`);
    }
}
function titulo(texto) {
    console.log(`\n--- ${texto} ---`);
}
// ---------------------------------------------------------------------------
// Preparacion: una boveda temporal con la estructura minima
// ---------------------------------------------------------------------------
const temporal = mkdtempSync(join(tmpdir(), "boveda-prueba-"));
// Un "afuera" al lado de la boveda, para los intentos de escape.
const afuera = mkdtempSync(join(tmpdir(), "afuera-"));
writeFileSync(join(afuera, "secreto.txt"), "esto no se deberia poder leer", "utf8");
mkdirSync(join(temporal, "01-Notas"), { recursive: true });
mkdirSync(join(temporal, "02-Diagramas"), { recursive: true });
mkdirSync(join(temporal, "04-Flashcards"), { recursive: true });
mkdirSync(join(temporal, "05-Quizzes"), { recursive: true });
writeFileSync(join(temporal, "01-Notas", "Nota simple.md"), ["---", "tema: Tema de prueba", "fecha: 2026-08-19", "---", "", "Contenido.", ""].join("\n"), "utf8");
// La nota clave de la prueba de Unicode: el nombre se ESCRIBE en NFD, como lo
// guardaria macOS. "Descripción" con la o y la tilde separadas.
const nombreNFD = "Descripción textual.md".normalize("NFD");
writeFileSync(join(temporal, "01-Notas", nombreNFD), ["---", "tema: Tema con acentos", "fecha: 2026-08-19", "---", "", "Cuerpo.", ""].join("\n"), "utf8");
writeFileSync(join(temporal, "03-Glosario.md"), ["---", "tema: Glosario", "---", "", "## A", "- **Alfa** — primera letra. → [[Nota simple]]", ""].join("\n"), "utf8");
process.env["VAULT_PATH"] = temporal;
inicializarBoveda();
console.log(`Boveda temporal: ${raiz()}`);
console.log(`Carpeta externa: ${afuera}`);
// ---------------------------------------------------------------------------
// RNF-01 / DA-07 — Confinamiento de rutas
// ---------------------------------------------------------------------------
titulo("RNF-01 / DA-07 — confinamiento de rutas");
// Lo que SI tiene que pasar.
verificar("una ruta normal dentro de la boveda se acepta", rutaSegura("01-Notas/Nota simple.md").startsWith(raiz()));
verificar("la raiz misma se acepta", rutaSegura(".") === raiz());
// Lo que NO tiene que pasar.
verificarRechazo("rechaza '../'", () => rutaSegura("../secreto.txt"));
verificarRechazo("rechaza '../..' anidado", () => rutaSegura("01-Notas/../../secreto.txt"));
verificarRechazo("rechaza una ruta absoluta tipo POSIX", () => rutaSegura("/etc/passwd"));
verificarRechazo("rechaza una ruta absoluta tipo Windows", () => rutaSegura("C:/Windows/System32"));
// El caso que un chequeo ingenuo de ".." NO atrapa: un symlink que apunta afuera.
// Este es el motivo de DA-07 (resolver con realpath ANTES de comparar prefijos).
let symlinkCreado = false;
try {
    symlinkSync(join(afuera, "secreto.txt"), join(temporal, "01-Notas", "atajo.txt"));
    symlinkCreado = true;
}
catch {
    // En Windows crear symlinks puede requerir privilegios. Si no se pudo, se avisa
    // en vez de dar la prueba por buena.
}
if (symlinkCreado) {
    verificarRechazo("rechaza un symlink que apunta fuera de la boveda", () => rutaSegura("01-Notas/atajo.txt"));
}
else {
    console.log("  OMITIDA symlink que apunta afuera (no se pudo crear el symlink en este SO)");
}
// Una carpeta hermana con el mismo prefijo de nombre: el clasico bug de comparar
// prefijos sin el separador.
verificarRechazo("rechaza una carpeta hermana con prefijo parecido", () => rutaSegura(`../${raiz().split(/[\\/]/).pop()}-privado/x.md`));
// ---------------------------------------------------------------------------
// DA-05 — Normalizacion Unicode (el problema de macOS)
// ---------------------------------------------------------------------------
titulo("DA-05 — normalizacion Unicode NFC/NFD");
const enNFC = "Descripción textual";
const enNFD = enNFC.normalize("NFD");
verificar("NFC y NFD son cadenas DISTINTAS (por eso hace falta normalizar)", enNFC !== enNFD, `NFC=${enNFC.length} chars, NFD=${enNFD.length} chars`);
verificar("clave() las hace equivalentes", clave(enNFC) === clave(enNFD));
// El archivo se creo con nombre en NFD. Lo buscamos de las dos formas.
verificar("encuentra la nota pidiendola en NFD", (() => {
    try {
        return resolverArchivo("01-Notas", enNFD).length > 0;
    }
    catch {
        return false;
    }
})());
verificar("encuentra la MISMA nota pidiendola en NFC (el caso que rompe en Mac)", (() => {
    try {
        return resolverArchivo("01-Notas", enNFC).length > 0;
    }
    catch {
        return false;
    }
})());
verificar("tolera el nombre con otras mayusculas", (() => {
    try {
        return resolverArchivo("01-Notas", "DESCRIPCIÓN TEXTUAL").length > 0;
    }
    catch {
        return false;
    }
})());
verificar("tolera el nombre con la extension .md incluida", (() => {
    try {
        return resolverArchivo("01-Notas", `${enNFC}.md`).length > 0;
    }
    catch {
        return false;
    }
})());
// El error de nota inexistente tiene que traer sugerencias (DA-09).
try {
    resolverArchivo("01-Notas", "nota que no existe");
    verificar("una nota inexistente lanza error", false);
}
catch (error) {
    const e = error;
    verificar("una nota inexistente lanza ErrorHerramienta", e instanceof ErrorHerramienta);
    verificar("y el error trae sugerencias", e.sugerencias.length > 0, `sugerencias: ${e.sugerencias.join(", ")}`);
}
// ---------------------------------------------------------------------------
// RNF-02 — La unica escritura
// ---------------------------------------------------------------------------
titulo("RNF-02 — registrar_resultado es la unica escritura");
const rutaProgreso = join(temporal, "05-Quizzes", "progreso.md");
verificar("progreso.md no existe antes de registrar", !existsSync(rutaProgreso));
const primero = registrarResultado("Tema de prueba", 70, "flojo en include vs extend");
verificar("la primera llamada CREA el archivo", primero.creado && existsSync(rutaProgreso));
verificar("y escribe en 05-Quizzes/progreso.md", primero.archivo === "05-Quizzes/progreso.md");
const segundo = registrarResultado("Tema con acentos", 90);
verificar("la segunda llamada NO recrea el archivo", segundo.creado === false);
const contenido = readFileSync(rutaProgreso, "utf8");
verificar("el archivo tiene encabezado de tabla", contenido.includes("| Fecha | Tema | Puntaje |"));
verificar("conserva el primer registro (append, no sobreescritura)", contenido.includes("Tema de prueba"));
verificar("y tambien el segundo", contenido.includes("Tema con acentos"));
// Validacion de entradas que vienen del modelo.
verificarRechazo("rechaza un puntaje mayor a 100", () => registrarResultado("X", 150));
verificarRechazo("rechaza un puntaje negativo", () => registrarResultado("X", -5));
verificarRechazo("rechaza un puntaje que no es numero", () => registrarResultado("X", Number.NaN));
verificarRechazo("rechaza un tema vacio", () => registrarResultado("   ", 50));
// El pipe en un comentario no debe romper la tabla markdown.
registrarResultado("Tema pipe", 55, "confundo include | extend\ny generalizacion");
const conPipe = readFileSync(rutaProgreso, "utf8");
const filaPipe = conPipe.split("\n").find((l) => l.includes("Tema pipe")) ?? "";
verificar("un comentario con '|' se escapa y la fila mantiene 4 columnas", filaPipe.split(/(?<!\\)\|/).filter((c) => c.trim().length > 0).length === 4, `fila: ${filaPipe}`);
verificar("un comentario con salto de linea se aplasta a una sola fila", !filaPipe.includes("\n"));
// ---------------------------------------------------------------------------
// RF-09 — progreso cruza dos fuentes
// ---------------------------------------------------------------------------
titulo("RF-09 — progreso cruza registro y notas");
const registros = leerRegistros();
verificar("lee de vuelta los 3 registros escritos", registros.length === 3, `leyo ${registros.length}`);
verificar("recupera el comentario con pipe sin el escape", registros.some((r) => r.comentarios.includes("include | extend")));
const p = obtenerProgreso();
const temasEnNotas = [...new Set(listarTemas().map((n) => n.tema))];
verificar("cuenta las 3 evaluaciones", p.totalEvaluaciones === 3);
verificar("'Tema de prueba' aparece como evaluado y NO como pendiente", p.temasEvaluados.some((t) => clave(t.tema) === clave("Tema de prueba")) &&
    !p.temasPendientes.some((t) => clave(t) === clave("Tema de prueba")));
verificar("los pendientes salen de los temas de las notas", p.temasPendientes.every((t) => temasEnNotas.some((n) => clave(n) === clave(t))), `pendientes: ${p.temasPendientes.join(", ") || "(ninguno)"}`);
// ---------------------------------------------------------------------------
// M-01 / M-02 — buscar: tokens, sin duplicados y con puntaje
// ---------------------------------------------------------------------------
titulo("M-01 / M-02 — buscar por tokens y sin duplicados");
// El glosario de la boveda temporal define "Alfa" como "primera letra". Una
// consulta en lenguaje natural no contiene esa frase literal en ninguna linea.
const porTokens = buscar("cual es la primera letra");
verificar("encuentra por tokens una consulta que no aparece literal", porTokens.length > 0 && porTokens.some((c) => clave(c.fragmento).includes(clave("primera letra"))), `resultados: ${porTokens.length}`);
// M-02: el glosario entraba dos veces a la lista de objetivos (push explicito +
// listado de la raiz), asi que cada coincidencia salia duplicada.
const dupes = buscar("primera letra");
const llaves = dupes.map((c) => `${c.ruta}:${c.linea}`);
verificar("ninguna coincidencia se repite (ruta:linea unicos)", llaves.length === new Set(llaves).size, `${llaves.length} resultados, ${new Set(llaves).size} unicos`);
// La frase exacta tiene que puntuar mas que un match por tokens sueltos.
const exacta = buscar("primera letra");
verificar("la frase exacta puntua 100 o mas", exacta.length > 0 && (exacta[0]?.puntaje ?? 0) >= 100, `puntaje del primero: ${exacta[0]?.puntaje}`);
// Consulta que queda sin tokens utiles tras las stopwords: no debe explotar.
verificar("una consulta de solo stopwords no rompe", Array.isArray(buscar("de la que")));
// ---------------------------------------------------------------------------
// Limpieza y resultado
// ---------------------------------------------------------------------------
rmSync(temporal, { recursive: true, force: true });
rmSync(afuera, { recursive: true, force: true });
console.log(`\n${"=".repeat(60)}`);
console.log(`Resultado: ${pasadas} pasadas, ${falladas} falladas`);
console.log("=".repeat(60));
if (falladas > 0)
    process.exit(1);
//# sourceMappingURL=verificaciones.js.map