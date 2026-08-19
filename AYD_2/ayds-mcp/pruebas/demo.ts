/**
 * pruebas/demo.ts — cliente MCP de prueba.
 *
 * Levanta el servidor `tutor-ayds` como proceso hijo por stdio, hace el handshake
 * MCP de verdad y llama a varias herramientas. Sirve para dos cosas:
 *
 *   1. Verificar que el servidor funciona SIN depender de Claude Desktop. Si algo
 *      falla, aca lo ves con la traza completa en vez de un "el servidor no
 *      responde" del cliente.
 *
 *   2. Entender que hace un cliente MCP. Es exactamente lo que hace Claude por
 *      abajo: conectar, pedir la lista de herramientas (tools/list) y llamarlas
 *      (tools/call).
 *
 * Uso:
 *   npm run build
 *   VAULT_PATH="/ruta/a/la/boveda" npm run demo
 */

import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

/** Imprime el texto que devolvio una herramienta, recortado si es muy largo. */
function mostrar(resultado: { content?: unknown; isError?: boolean }, limite = 900): void {
  const bloques = Array.isArray(resultado.content) ? resultado.content : [];
  const texto = bloques
    .map((b) => (typeof b === "object" && b !== null && "text" in b ? String(b.text) : ""))
    .join("\n");

  const recortado =
    texto.length > limite ? `${texto.slice(0, limite)}\n... [recortado, ${texto.length} caracteres en total]` : texto;

  if (resultado.isError) {
    console.log(`  [isError: true]`);
  }
  console.log(
    recortado
      .split("\n")
      .map((l) => `  ${l}`)
      .join("\n"),
  );
}

function titulo(texto: string): void {
  console.log(`\n${"=".repeat(74)}\n${texto}\n${"=".repeat(74)}`);
}

async function main(): Promise<void> {
  const vault = process.env["VAULT_PATH"];
  if (!vault) {
    console.error("Falta VAULT_PATH. Ejemplo: VAULT_PATH=/ruta/a/la/boveda npm run demo");
    process.exit(1);
  }

  // process.execPath es el binario de node que esta corriendo ESTE script.
  // Lo usamos en vez del string "node" para no depender del PATH: es el mismo
  // problema que en macOS obliga a poner la ruta absoluta de node en el JSON de
  // Claude Desktop.
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ["dist/src/index.js"],
    env: { ...process.env, VAULT_PATH: vault } as Record<string, string>,
    // "inherit" hace que los console.error del servidor aparezcan en esta
    // terminal. Util para ver sus mensajes de arranque.
    stderr: "inherit",
  });

  const client = new Client({ name: "demo-tutor-ayds", version: "1.0.0" });
  await client.connect(transport);

  // --- Handshake: que herramientas ofrece el servidor ---
  titulo("HANDSHAKE — tools/list");
  const { tools } = await client.listTools();
  console.log(`El servidor ofrece ${tools.length} herramientas:\n`);
  for (const t of tools) {
    const soloLectura = t.annotations?.readOnlyHint === true;
    console.log(`  ${soloLectura ? "[lectura ]" : "[ESCRIBE ]"} ${t.name}`);
  }

  // --- Demostracion 1: RF-01 listar_temas ---
  titulo("DEMOSTRACION 1 — listar_temas()");
  mostrar(await client.callTool({ name: "listar_temas", arguments: {} }), 700);

  // --- Demostracion 2: RF-05 + RF-06, el flujo cruzado ---
  //
  // Fijate en el orden, porque es exactamente el del diagrama de secuencia del
  // diseno: primero listar para conseguir el id, despues obtener con ese id.
  // No hardcodeamos el id a proposito: asi la demo sigue funcionando aunque
  // cambien las notas, que es justo el punto de DA-06.
  titulo("DEMOSTRACION 2 — listar_diagramas() + obtener_diagrama()  [flujo cruzado]");

  const listado = await client.callTool({ name: "listar_diagramas", arguments: {} });
  const textoListado = Array.isArray(listado.content)
    ? listado.content.map((b) => (b && typeof b === "object" && "text" in b ? String(b.text) : "")).join("\n")
    : "";

  // Tomamos el primer id de bloque mermaid que aparezca en el inventario.
  const idEncontrado = /^\s*- id: (.+#mermaid-\d+)\s*$/m.exec(textoListado)?.[1];
  console.log(`Del inventario, el cliente eligio el id: ${idEncontrado ?? "(ninguno)"}\n`);

  if (idEncontrado) {
    console.log("Lo que sigue es el texto que el cliente le pasaria al MCP de StarUML:\n");
    mostrar(
      await client.callTool({ name: "obtener_diagrama", arguments: { nombre: idEncontrado } }),
      900,
    );
  }

  // --- Demostracion 2b: RF-10 referencia, el paso que evita el error tipico ---
  //
  // Este es el chequeo que un cliente bien orientado hace ANTES de mandarle el
  // mermaid a StarUML: preguntar si ese tipo de diagrama se puede importar.
  titulo("DEMOSTRACION 2b — referencia('staruml')  [antes de dibujar, preguntar]");
  const ref = await client.callTool({ name: "referencia", arguments: { herramienta: "staruml" } });
  const textoRef = Array.isArray(ref.content)
    ? ref.content.map((b) => (b && typeof b === "object" && "text" in b ? String(b.text) : "")).join("\n")
    : "";
  // Mostramos solo la tabla de tipos importables, que es el dato decisivo.
  const desde = textoRef.indexOf("## Qué acepta");
  console.log(
    (desde >= 0 ? textoRef.slice(desde, desde + 800) : textoRef.slice(0, 800))
      .split("\n")
      .map((l) => `  ${l}`)
      .join("\n"),
  );

  // --- Demostracion 3: manejo de error (DA-09) ---
  titulo("DEMOSTRACION 3 — leer_nota() con un nombre inventado");
  console.log("El servidor no se cae: devuelve isError y sugiere nombres parecidos.\n");
  mostrar(
    await client.callTool({
      name: "leer_nota",
      arguments: { nombre: "casos de uso del sistema" },
    }),
    600,
  );

  // --- Demostracion 4: RF-09 progreso ---
  titulo("DEMOSTRACION 4 — progreso()");
  mostrar(await client.callTool({ name: "progreso", arguments: {} }), 900);

  // --- Demostracion 5: la unica escritura, a traves de la capa MCP ---
  //
  // Va detras de un flag explicito porque ESCRIBE en la boveda que le pasaste por
  // VAULT_PATH. No queremos que correr la demo te deje un resultado de quiz
  // inventado en tu historial de estudio real.
  //
  // Para probarla, apunta VAULT_PATH a una boveda de prueba:
  //   PERMITIR_ESCRITURA=1 VAULT_PATH=/tmp/boveda-prueba npm run demo
  if (process.env["PERMITIR_ESCRITURA"] === "1") {
    titulo("DEMOSTRACION 5 — registrar_resultado()  [la unica escritura]");
    mostrar(
      await client.callTool({
        name: "registrar_resultado",
        arguments: { tema: "Casos de uso del negocio", puntaje: 70, comentarios: "confundo include | extend" },
      }),
      500,
    );

    console.log("\nY el puntaje ya aparece en progreso():\n");
    mostrar(await client.callTool({ name: "progreso", arguments: {} }), 600);

    console.log("\nValidacion de entradas (puntaje fuera de rango):\n");
    mostrar(
      await client.callTool({
        name: "registrar_resultado",
        arguments: { tema: "X", puntaje: 150 },
      }),
      400,
    );
  } else {
    titulo("DEMOSTRACION 5 — registrar_resultado()  [OMITIDA]");
    console.log(
      "  Omitida porque ESCRIBE en la boveda. Para ejecutarla, apunta VAULT_PATH a una\n" +
        "  boveda de prueba y corre:  PERMITIR_ESCRITURA=1 VAULT_PATH=... npm run demo",
    );
  }

  // --- Cierre ---
  titulo("El servidor sigue vivo despues del error de la demostracion 3");
  mostrar(await client.callTool({ name: "glosario", arguments: { termino: "arquitecting" } }), 400);

  await client.close();
  console.log("\nDemo terminada.\n");
}

main().catch((error) => {
  console.error("La demo fallo:", error);
  process.exit(1);
});
