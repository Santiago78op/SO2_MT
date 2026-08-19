/**
 * pruebas/auditar-boveda.mjs — auditoria de integridad de la boveda y de la
 * coherencia entre el codigo y su documentacion.
 *
 * Complementa a las otras dos pruebas:
 *   - verificaciones.ts  -> la LOGICA del servidor (boveda temporal, en proceso)
 *   - auditoria.ts       -> las HERRAMIENTAS por el protocolo MCP real
 *   - auditar-boveda.mjs -> el CONTENIDO de la boveda y la documentacion  <-- este
 *
 * Por que existe: la boveda y los documentos se desincronizan del codigo en
 * silencio. Se agrega una herramienta y el README sigue diciendo que hay diez; se
 * agrega una nota y el indice no la enlaza. Nada de eso rompe una prueba de
 * codigo, pero deja el proyecto inconsistente. Esto lo detecta.
 *
 * Es .mjs (JavaScript, no TypeScript) a proposito: audita ARCHIVOS, no tipos, y
 * asi corre sin compilar.
 *
 * Uso:  VAULT_PATH="/ruta/a/la/boveda" node pruebas/auditar-boveda.mjs
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, basename, extname, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const PROYECTO = join(dirname(fileURLToPath(import.meta.url)), "..");
const VAULT = process.env.VAULT_PATH;

if (!VAULT || !existsSync(VAULT)) {
  console.error("Falta VAULT_PATH o no existe. Ejemplo:");
  console.error('  VAULT_PATH="/ruta/a/la/boveda" node pruebas/auditar-boveda.mjs');
  process.exit(1);
}

const hallazgos = [];
const anotar = (sev, cat, msg) => hallazgos.push({ sev, cat, msg });

/** Recorre un arbol devolviendo rutas de archivo, salteando .git y node_modules. */
function archivos(raiz, filtro = () => true) {
  const salida = [];
  const recorrer = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.name === ".git" || e.name === "node_modules" || e.name === "dist") continue;
      const p = join(dir, e.name);
      if (e.isDirectory()) recorrer(p);
      else if (filtro(p)) salida.push(p);
    }
  };
  recorrer(raiz);
  return salida;
}

/**
 * Lee un archivo normalizando los finales de linea a LF.
 *
 * Sin esta normalizacion, todo archivo con CRLF daba un falso positivo "sin
 * frontmatter": el chequeo compara contra "---" + LF, y un archivo guardado en
 * Windows empieza con "---" + CR + LF. Python lo ocultaba porque su modo texto
 * traduce los finales de linea al leer; Node los entrega crudos.
 *
 * El servidor MCP no tiene este problema: sus parsers parten por /\r?\n/.
 */
const leer = (p) => readFileSync(p, "utf8").split("\r\n").join("\n");
/** Normaliza para comparar: NFC + minusculas + sin diacriticos (igual que clave() del servidor). */
const clave = (t) =>
  t.normalize("NFC").toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// ===========================================================================
// PARTE 1 — La boveda
// ===========================================================================

const notasMd = archivos(VAULT, (p) => p.endsWith(".md"));
const porNombre = new Map();
for (const p of notasMd) {
  const n = basename(p, ".md");
  porNombre.set(n, [...(porNombre.get(n) ?? []), p]);
}

// 1.1 basenames duplicados: Obsidian no sabe a cual apunta un [[wikilink]]
for (const [n, ps] of porNombre) {
  if (ps.length > 1) anotar("ALTA", "duplicado", `basename repetido "${n}": ${ps.length} archivos`);
}

// 1.2 frontmatter
for (const p of notasMd) {
  const t = leer(p);
  const rel = relative(VAULT, p);
  if (!t.startsWith("---\n")) {
    anotar("MEDIA", "frontmatter", `sin frontmatter: ${rel}`);
    continue;
  }
  const fin = t.indexOf("\n---", 4);
  if (fin === -1) {
    anotar("ALTA", "frontmatter", `frontmatter sin cerrar: ${rel}`);
    continue;
  }
  const fm = t.slice(4, fin);
  for (const campo of ["tema", "fuente", "fecha"]) {
    if (!new RegExp(`^${campo}:`, "m").test(fm)) {
      anotar("BAJA", "frontmatter", `falta "${campo}" en ${rel}`);
    }
  }
}

// 1.3 wikilinks que no resuelven
const RE_LINK = /(?<!!)\[\[([^\]|#]+?)(?:\\?\|[^\]]*)?\]\]/g;
const enlazadas = new Set();
for (const p of notasMd) {
  const t = leer(p);
  for (const m of t.matchAll(RE_LINK)) {
    const destino = basename(m[1].trim().replace(/\\/g, ""), ".md");
    enlazadas.add(destino);
    if (!porNombre.has(destino)) {
      anotar("ALTA", "wikilink", `${relative(VAULT, p)} -> [[${m[1].trim()}]]`);
    }
  }
}

// 1.4 embeds de imagen que no resuelven
const recursos = new Set(
  archivos(VAULT).map((p) => relative(VAULT, p).split("\\").join("/")),
);
for (const p of notasMd) {
  for (const m of leer(p).matchAll(/!\[\[([^\]|]+)\]\]/g)) {
    if (!recursos.has(m[1].trim())) {
      anotar("ALTA", "embed", `${relative(VAULT, p)} -> ![[${m[1].trim()}]]`);
    }
  }
}

// 1.5 convencion de la boveda: las notas atomicas cierran con preguntas de repaso
const dirNotas = join(VAULT, "01-Notas");
if (existsSync(dirNotas)) {
  for (const f of readdirSync(dirNotas).filter((f) => f.endsWith(".md"))) {
    if (!leer(join(dirNotas, f)).includes("## Preguntas de repaso")) {
      anotar("MEDIA", "convencion", `sin "## Preguntas de repaso": 01-Notas/${f}`);
    }
  }
}

// 1.6 flashcards parseables (formato pregunta::respuesta)
const dirFlash = join(VAULT, "04-Flashcards");
if (existsSync(dirFlash)) {
  for (const f of readdirSync(dirFlash).filter((f) => f.endsWith(".md"))) {
    const t = leer(join(dirFlash, f));
    const cuerpo = t.startsWith("---") ? t.split("---").slice(2).join("---") : t;
    const conSep = cuerpo.split("\n").filter((l) => l.includes("::") && !/^\s*[#>]/.test(l));
    const validas = conSep.filter((l) => {
      const i = l.indexOf("::");
      return l.slice(0, i).trim() && l.slice(i + 2).trim();
    });
    if (validas.length < 5) anotar("MEDIA", "flashcards", `${f}: solo ${validas.length} tarjetas`);
    if (validas.length !== conSep.length) {
      anotar("BAJA", "flashcards", `${f}: ${conSep.length - validas.length} lineas "::" invalidas`);
    }
  }
}

// 1.7 glosario: secciones y terminos en orden alfabetico
const glosario = join(VAULT, "03-Glosario.md");
if (existsSync(glosario)) {
  const g = leer(glosario);
  const letras = [...g.matchAll(/^## ([A-Z])$/gm)].map((m) => m[1]);
  if (letras.join("") !== [...letras].sort().join("")) {
    anotar("MEDIA", "glosario", `secciones desordenadas: ${letras.join("")}`);
  }
  let sec = null;
  const terminos = new Map();
  for (const linea of g.split("\n")) {
    const h = /^## ([A-Z])$/.exec(linea);
    if (h) {
      sec = h[1];
      continue;
    }
    const e = /^- \*\*(.+?)\*\*/.exec(linea);
    if (e && sec) terminos.set(sec, [...(terminos.get(sec) ?? []), e[1]]);
  }
  for (const [L, ts] of terminos) {
    const ks = ts.map(clave);
    if (ks.join("|") !== [...ks].sort().join("|")) {
      anotar("BAJA", "glosario", `seccion ${L} desordenada`);
    }
    for (const t of ts) {
      if (clave(t)[0] !== L.toLowerCase()) anotar("MEDIA", "glosario", `"${t}" esta en la seccion ${L}`);
    }
  }
}

// 1.8 el indice enlaza todo lo que deberia
const indice = join(VAULT, "Índice.md");
if (existsSync(indice)) {
  const ind = leer(indice);
  for (const carpeta of ["01-Notas", "04-Flashcards", "07-Referencias", "08-Tareas"]) {
    const d = join(VAULT, carpeta);
    if (!existsSync(d)) continue;
    for (const f of readdirSync(d).filter((f) => f.endsWith(".md"))) {
      const n = basename(f, ".md");
      if (!ind.includes(`[[${n}]]`)) {
        anotar(carpeta === "01-Notas" ? "MEDIA" : "BAJA", "Indice", `no enlaza "${n}" (${carpeta})`);
      }
    }
  }
}

// ===========================================================================
// PARTE 2 — Coherencia entre el codigo y su documentacion
// ===========================================================================

const indexTs = leer(join(PROYECTO, "src/index.ts"));
const registradas = [...indexTs.matchAll(/server\.registerTool\(\s*\n?\s*"([a-z_]+)"/g)].map((m) => m[1]);
const N = registradas.length;

// 2.1 el README nombra todas las herramientas y el conteo cuadra
const readme = leer(join(PROYECTO, "README.md"));
const mTitulo = /## Las (\d+) herramientas/.exec(readme);
if (mTitulo && Number(mTitulo[1]) !== N) {
  anotar("MEDIA", "README", `dice "Las ${mTitulo[1]} herramientas" y hay ${N}`);
}
for (const h of registradas) {
  if (!readme.includes(`\`${h}(`)) anotar("MEDIA", "README", `no documenta la herramienta ${h}`);
}

// 2.2 el diseño documenta un RF por herramienta, y las nombra
const disenio = join(VAULT, "06-Proyecto-MCP/diseño.md");
if (existsSync(disenio)) {
  const d = leer(disenio);
  const rfs = new Set([...d.matchAll(/RF-(\d+)/g)].map((m) => m[1]));
  if (rfs.size !== N) anotar("ALTA", "diseño", `documenta ${rfs.size} RF y el servidor expone ${N} herramientas`);
  for (const h of registradas) {
    if (!d.includes(h)) anotar("ALTA", "diseño", `no menciona la herramienta ${h}`);
  }
}

// 2.3 cada modulo y cada prueba figuran en el README
for (const carpeta of ["src", "pruebas"]) {
  for (const f of readdirSync(join(PROYECTO, carpeta))) {
    if (!/\.(ts|mjs)$/.test(f)) continue;
    if (!readme.includes(f)) anotar("BAJA", "README", `${carpeta}/${f} no figura en el arbol`);
  }
}

// 2.4 dist al dia
for (const carpeta of ["src", "pruebas"]) {
  for (const f of readdirSync(join(PROYECTO, carpeta)).filter((f) => f.endsWith(".ts"))) {
    const fuente = join(PROYECTO, carpeta, f);
    const compilado = join(PROYECTO, "dist", carpeta, f.replace(/\.ts$/, ".js"));
    if (!existsSync(compilado)) anotar("ALTA", "build", `falta el compilado de ${carpeta}/${f}`);
    else if (statSync(fuente).mtimeMs > statSync(compilado).mtimeMs) {
      anotar("ALTA", "build", `${carpeta}/${f} es mas nuevo que su .js — falta npm run build`);
    }
  }
}

// 2.5 finales de linea consistentes: la boveda va a un Mac y a git
{
  const crudos = notasMd.map((p) => ({ p, crlf: readFileSync(p, "utf8").includes("\r\n") }));
  const conCrlf = crudos.filter((c) => c.crlf);
  if (conCrlf.length > 0 && conCrlf.length < crudos.length) {
    anotar(
      "BAJA",
      "formato",
      `finales de linea mezclados: ${conCrlf.length} de ${crudos.length} archivos con CRLF (ensucia los diff de git)`,
    );
  }
}

// 2.6 toda carpeta de la boveda que el codigo declara, existe
for (const m of indexTs.matchAll(/(\d{2}-[A-Za-z-]+)\//g)) {
  const c = m[1];
  if (!existsSync(join(VAULT, c))) anotar("MEDIA", "boveda", `el codigo menciona ${c}/ y no existe`);
}

// ===========================================================================
// Reporte
// ===========================================================================

console.log(`boveda:      ${VAULT}`);
console.log(`notas .md:   ${notasMd.length}`);
console.log(`herramientas registradas: ${N}`);
console.log();

const orden = { ALTA: 0, MEDIA: 1, BAJA: 2 };
hallazgos.sort((a, b) => orden[a.sev] - orden[b.sev] || a.cat.localeCompare(b.cat));

console.log("=".repeat(72));
if (hallazgos.length === 0) {
  console.log("INTEGRIDAD OK — 0 hallazgos");
} else {
  const conteo = hallazgos.reduce((a, h) => ({ ...a, [h.sev]: (a[h.sev] ?? 0) + 1 }), {});
  console.log(
    `${hallazgos.length} hallazgos  (ALTA: ${conteo.ALTA ?? 0}, MEDIA: ${conteo.MEDIA ?? 0}, BAJA: ${conteo.BAJA ?? 0})`,
  );
  for (const h of hallazgos) console.log(`  [${h.sev.padEnd(5)}] ${h.cat.padEnd(12)} ${h.msg}`);
}
console.log("=".repeat(72));

// Solo las de severidad ALTA hacen fallar: las MEDIA y BAJA son deuda visible,
// no motivo para romper un pipeline.
process.exit(hallazgos.some((h) => h.sev === "ALTA") ? 1 : 0);
