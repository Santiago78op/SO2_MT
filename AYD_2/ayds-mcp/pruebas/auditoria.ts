/**
 * pruebas/auditoria.ts — auditoria de integridad del servidor.
 *
 * A diferencia de `verificaciones.ts` (que prueba la logica en proceso contra una
 * boveda temporal), esta auditoria levanta el servidor por STDIO y ejerce TODAS
 * las herramientas a traves del protocolo MCP real, contra la boveda de verdad.
 *
 * Comprueba tres cosas:
 *   1. Que las herramientas declaradas y las registradas coincidan.
 *   2. Que cada herramienta responda sin isError con una entrada valida.
 *   3. Que cada herramienta falle LIMPIAMENTE (isError, sin matar el proceso) con
 *      una entrada invalida.
 *
 * Uso:  VAULT_PATH="/ruta/a/la/boveda" node dist/pruebas/auditoria.js
 */

import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

/** Las 12 herramientas que el servidor debe exponer, con su expectativa. */
const ESPERADAS: Array<{
  nombre: string;
  soloLectura: boolean;
  /** Argumentos validos: la llamada debe funcionar. */
  ok: Record<string, unknown>;
  /** Argumentos invalidos: debe devolver isError sin caerse. Null = no aplica. */
  mal: Record<string, unknown> | null;
}> = [
  { nombre: "listar_temas", soloLectura: true, ok: {}, mal: null },
  { nombre: "leer_nota", soloLectura: true, ok: { nombre: "Arquitectura de software" }, mal: { nombre: "zzz-no-existe" } },
  { nombre: "buscar", soloLectura: true, ok: { consulta: "arquitectura" }, mal: { consulta: "a" } },
  { nombre: "glosario", soloLectura: true, ok: {}, mal: { termino: "zzz-no-existe" } },
  { nombre: "listar_diagramas", soloLectura: true, ok: {}, mal: null },
  { nombre: "obtener_diagrama", soloLectura: true, ok: { nombre: "Actor del negocio#mermaid-1" }, mal: { nombre: "zzz-no-existe" } },
  { nombre: "obtener_flashcards", soloLectura: true, ok: { tema: "Casos de uso del negocio" }, mal: { tema: "zzz-no-existe" } },
  { nombre: "registrar_resultado", soloLectura: false, ok: {}, mal: { tema: "X", puntaje: 999 } },
  { nombre: "progreso", soloLectura: true, ok: {}, mal: null },
  { nombre: "referencia", soloLectura: true, ok: { herramienta: "staruml" }, mal: { herramienta: "zzz-no-existe" } },
  { nombre: "metodo_tarea", soloLectura: true, ok: {}, mal: { entregable: "zzz-no-existe" } },
  { nombre: "enunciado", soloLectura: true, ok: {}, mal: { nombre: "zzz-no-existe" } },
];

let fallas = 0;
const ok = (m: string) => console.log(`  OK    ${m}`);
const falla = (m: string) => {
  console.log(`  FALLA ${m}`);
  fallas++;
};

function texto(r: { content?: unknown }): string {
  const bloques = Array.isArray(r.content) ? r.content : [];
  return bloques
    .map((b) => (b && typeof b === "object" && "text" in b ? String((b as { text: unknown }).text) : ""))
    .join("\n");
}

async function main(): Promise<void> {
  const vault = process.env["VAULT_PATH"];
  if (!vault) {
    console.error("Falta VAULT_PATH");
    process.exit(1);
  }

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ["dist/src/index.js"],
    env: { ...process.env, VAULT_PATH: vault } as Record<string, string>,
    stderr: "ignore",
  });
  const client = new Client({ name: "auditoria", version: "1.0.0" });
  await client.connect(transport);

  // --- 1. Inventario de herramientas ---
  console.log("\n--- 1. Inventario de herramientas ---");
  const { tools } = await client.listTools();
  const registradas = new Set(tools.map((t) => t.name));
  const esperadas = new Set(ESPERADAS.map((e) => e.nombre));

  if (tools.length === ESPERADAS.length) ok(`${tools.length} herramientas registradas`);
  else falla(`se esperaban ${ESPERADAS.length} herramientas y hay ${tools.length}`);

  for (const e of ESPERADAS) {
    if (!registradas.has(e.nombre)) falla(`falta la herramienta ${e.nombre}`);
  }
  for (const t of tools) {
    if (!esperadas.has(t.name)) falla(`herramienta no declarada en la auditoria: ${t.name}`);
  }

  // --- 2. Metadatos: descripcion y annotations ---
  console.log("\n--- 2. Metadatos de cada herramienta ---");
  for (const t of tools) {
    const esp = ESPERADAS.find((e) => e.nombre === t.name);
    if (!esp) continue;
    const problemas: string[] = [];
    if (!t.description || t.description.length < 80) problemas.push("descripcion corta o ausente");
    if (t.annotations?.readOnlyHint !== esp.soloLectura) {
      problemas.push(`readOnlyHint=${String(t.annotations?.readOnlyHint)} y se esperaba ${String(esp.soloLectura)}`);
    }
    if (!t.inputSchema) problemas.push("sin inputSchema");
    if (problemas.length === 0) ok(`${t.name} (${esp.soloLectura ? "lectura" : "ESCRIBE"})`);
    else falla(`${t.name}: ${problemas.join("; ")}`);
  }

  // --- 3. Camino feliz de cada herramienta de LECTURA ---
  console.log("\n--- 3. Camino feliz (solo herramientas de lectura) ---");
  for (const e of ESPERADAS) {
    if (!e.soloLectura) {
      console.log(`  OMITE ${e.nombre} (escribe: se prueba en verificaciones.ts)`);
      continue;
    }
    try {
      const r = await client.callTool({ name: e.nombre, arguments: e.ok });
      const t = texto(r);
      if (r.isError) falla(`${e.nombre} devolvio isError con argumentos validos: ${t.slice(0, 90)}`);
      else if (t.trim().length === 0) falla(`${e.nombre} devolvio texto vacio`);
      else ok(`${e.nombre} -> ${t.length} caracteres`);
    } catch (error) {
      falla(`${e.nombre} lanzo excepcion: ${String(error).slice(0, 90)}`);
    }
  }

  // --- 4. Camino de error: isError sin matar el proceso ---
  console.log("\n--- 4. Manejo de error (DA-09: isError, servidor vivo) ---");
  for (const e of ESPERADAS) {
    if (!e.mal) {
      console.log(`  OMITE ${e.nombre} (sin entrada invalida aplicable)`);
      continue;
    }
    try {
      const r = await client.callTool({ name: e.nombre, arguments: e.mal });
      if (r.isError) ok(`${e.nombre} rechaza entrada invalida con isError`);
      else falla(`${e.nombre} ACEPTO una entrada invalida: ${texto(r).slice(0, 90)}`);
    } catch (error) {
      falla(`${e.nombre} lanzo excepcion en vez de isError: ${String(error).slice(0, 90)}`);
    }
  }

  // --- 5. El servidor sigue vivo despues de todos los errores ---
  console.log("\n--- 5. Supervivencia ---");
  try {
    const r = await client.callTool({ name: "listar_temas", arguments: {} });
    if (r.isError) falla("el servidor responde con error tras la tanda de fallos");
    else ok("el servidor sigue respondiendo despues de 9 errores provocados");
  } catch (error) {
    falla(`el servidor murio: ${String(error).slice(0, 90)}`);
  }

  // --- 6. Seguridad: rutas fuera de la boveda, por el protocolo ---
  console.log("\n--- 6. Seguridad por el protocolo (RNF-01) ---");
  const escapes = ["../../../etc/passwd", "/etc/passwd", "..\\..\\windows\\system32", "C:/Windows/System32"];
  for (const ruta of escapes) {
    const r = await client.callTool({ name: "leer_nota", arguments: { nombre: ruta } });
    const t = texto(r);
    // Debe fallar, y NO debe devolver contenido de fuera de la boveda.
    if (!r.isError) falla(`leer_nota ACEPTO "${ruta}"`);
    else if (/root:|\[boot loader\]/i.test(t)) falla(`leer_nota filtro contenido externo con "${ruta}"`);
    else ok(`rechaza "${ruta}"`);
  }

  await client.close();

  console.log(`\n${"=".repeat(60)}`);
  console.log(fallas === 0 ? "MCP: integridad OK, 0 fallas" : `MCP: ${fallas} fallas`);
  console.log("=".repeat(60));
  if (fallas > 0) process.exit(1);
}

main().catch((error) => {
  console.error("La auditoria fallo:", error);
  process.exit(1);
});
