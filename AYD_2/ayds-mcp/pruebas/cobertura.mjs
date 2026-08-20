/**
 * pruebas/cobertura.mjs — sonda de COBERTURA del contenido.
 *
 * Las otras tres pruebas verifican que el servidor funcione. Esta verifica que
 * el servidor ENCUENTRE lo que la boveda sabe: cada consulta que un estudiante
 * haria de verdad tiene que devolver la nota correcta.
 *
 * Es la prueba que atrapa la desincronizacion silenciosa: se agrega una nota
 * nueva y nadie le pone alias, entonces existe pero es inalcanzable.
 *
 * Uso:  VAULT_PATH="/ruta" node pruebas/cobertura.mjs
 */
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import { existsSync } from "node:fs";

const VAULT = process.env.VAULT_PATH;
if (!VAULT || !existsSync(VAULT)) {
  console.error('Falta VAULT_PATH. Ej: VAULT_PATH="/ruta/a/la/boveda" node pruebas/cobertura.mjs');
  process.exit(1);
}

/**
 * Cada caso: la herramienta, el argumento, y que subcadena TIENE que aparecer.
 * Si el esperado empieza con "!", el caso exige un ERROR que contenga el resto.
 */
const CASOS = [
  // --- notas nuevas de clase: se encuentran por su nombre?
  ["leer_nota", { nombre: "Drivers arquitectonicos" }, "puente entre los requerimientos"],
  ["leer_nota", { nombre: "Diagrama de contexto" }, "Streamlines"],
  ["leer_nota", { nombre: "Categorias de estructuras" }, "componentes y conectores"],
  ["leer_nota", { nombre: "Metodo de diseno centrado en la arquitectura" }, "Creacion del caso de negocio"],
  ["leer_nota", { nombre: "Convenios del diagrama de CUN" }, "navegabilidad"],
  ["leer_nota", { nombre: "Arquitectura y proceso de desarrollo" }, "moderacion cautelosa"],

  // --- busqueda: los conceptos clave aparecen?
  ["buscar", { consulta: "driver de restriccion" }, "Drivers arquitect"],
  ["buscar", { consulta: "streamline" }, "Diagrama de contexto"],
  ["buscar", { consulta: "navegabilidad" }, "Convenios"],
  ["buscar", { consulta: "primera descomposicion" }, "descomposici"],
  ["buscar", { consulta: "escalabilidad" }, "Drivers arquitect"],
  ["buscar", { consulta: "matriz de dependencias" }, "trazabilidad"],
  ["buscar", { consulta: "paso 0" }, "caso de negocio"],
  ["buscar", { consulta: "reutilizacion" }, "include"],

  // --- glosario: los terminos nuevos estan?
  ["glosario", { termino: "driver arquitectonico" }, "factores cr"],
  ["glosario", { termino: "navegabilidad" }, "inicia"],
  ["glosario", { termino: "streamline" }, "flujo de informaci"],
  ["glosario", { termino: "paso 0" }, "caso de negocio"],
  ["glosario", { termino: "FURPS" }, "facilidad de uso"],
  ["glosario", { termino: "categorias de estructuras" }, "asignaci"],

  // --- metodo_tarea: los alias de las guias resuelven?
  ["metodo_tarea", { entregable: "drivers de restriccion" }, "restricci"],
  ["metodo_tarea", { entregable: "matriz de dependencias" }, "dependencia"],
  ["metodo_tarea", { entregable: "por donde empiezo" }, "enunciado"],
  ["metodo_tarea", { entregable: "ejemplos resueltos" }, "Tienda Electr"],
  ["metodo_tarea", { entregable: "stakeholders" }, "necesidad oculta"],
  ["metodo_tarea", { entregable: "core" }, "core"],

  // --- diagramas y flashcards de las notas nuevas
  ["obtener_diagrama", { nombre: "Drivers arquitectónicos#mermaid-1" }, "flowchart"],
  ["obtener_diagrama", { nombre: "Método de diseño centrado en la arquitectura#mermaid-1" }, "flowchart"],
  // una nota con varios diagramas exige el id exacto y sugiere los disponibles:
  ["obtener_diagrama", { nombre: "Drivers arquitectonicos" }, "!por su id exacto"],
  ["obtener_flashcards", { tema: "Drivers arquitectonicos y contexto" }, "factores cr"],
  ["obtener_flashcards", { tema: "CUN, convenios y metodo" }, "paso 0"],

  // --- REGRESION: la linea que explica el formato NO debe salir como tarjeta
  ["obtener_flashcards", { tema: "Drivers arquitectonicos y contexto", cantidad: 1 }, "driver arquitect"],

  // --- referencias y enunciado
  ["referencia", { herramienta: "StarUML" }, "StarUML"],
  ["enunciado", { nombre: "Caso 1 - FarmaHosp" }, "FarmaHosp"],
];

const texto = (r) =>
  (Array.isArray(r.content) ? r.content : [])
    .map((b) => (b && typeof b === "object" && "text" in b ? String(b.text) : ""))
    .join("\n");

const norm = (s) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const cliente = new Client({ name: "sonda-cobertura", version: "1.0.0" });
await cliente.connect(
  new StdioClientTransport({
    command: process.execPath,
    args: ["dist/src/index.js"],
    env: { ...process.env, VAULT_PATH: VAULT },
    stderr: "ignore",
  })
);

let ok = 0;
const fallas = [];

for (const [tool, args, esperado] of CASOS) {
  const etiqueta = `${tool}(${JSON.stringify(args)})`;
  let r;
  try {
    r = await cliente.callTool({ name: tool, arguments: args });
  } catch (e) {
    fallas.push(`${etiqueta} -> EXCEPCION: ${e.message}`);
    continue;
  }
  const t = texto(r);
  const esperaError = esperado.startsWith("!");
  const buscado = esperaError ? esperado.slice(1) : esperado;

  if (esperaError && !r.isError) {
    fallas.push(`${etiqueta} -> se esperaba un error y devolvio contenido`);
  } else if (!esperaError && r.isError) {
    fallas.push(`${etiqueta} -> isError: ${t.slice(0, 120)}`);
  } else if (!norm(t).includes(norm(buscado))) {
    fallas.push(`${etiqueta} -> no contiene "${buscado}" (${t.length} chars)`);
  } else {
    ok++;
  }
}

await cliente.close();

console.log("");
console.log("=".repeat(72));
if (fallas.length === 0) {
  console.log(`COBERTURA OK — ${ok}/${CASOS.length} consultas encuentran su contenido`);
} else {
  console.log(`COBERTURA: ${ok}/${CASOS.length} ok, ${fallas.length} fallas`);
  for (const f of fallas) console.log(`  [FALLA] ${f}`);
}
console.log("=".repeat(72));
process.exit(fallas.length === 0 ? 0 : 1);
