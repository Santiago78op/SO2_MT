/**
 * herramientas/atlas.mjs — genera el Atlas de Diagramas de la boveda.
 *
 * Lee todos los bloques ```mermaid de la boveda y produce UNA pagina HTML con
 * todos renderizados, agrupados por tema, con filtro por texto y por
 * procedencia (de clase / complemento / propio).
 *
 * Para que sirve: los diagramas viven repartidos en decenas de notas y nunca se
 * ven juntos. Esta pagina es para repasar antes de un parcial y para detectar de
 * un vistazo un diagrama que quedo mal.
 *
 * Sobre el render: los bloques se emiten como <pre class="mermaid"> SIN cargar
 * ninguna libreria. El visor de artifacts de Claude renderiza mermaid de forma
 * nativa; y si abris el archivo con file:// no se va a dibujar nada, porque
 * cargar mermaid de un CDN esta bloqueado desde el sistema de archivos. Para
 * verlo en local hay que servirlo por HTTP y agregar el script a mano.
 *
 * Sin dependencias: solo Node. Es un .mjs como las auditorias, asi que no pasa
 * por tsc.
 *
 * Uso:
 *   VAULT_PATH="/ruta/a/la/boveda" node herramientas/atlas.mjs [salida.html]
 *   npm run atlas
 */

import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { join, relative, basename, resolve } from "node:path";

// ---------------------------------------------------------------------------
// Entrada
// ---------------------------------------------------------------------------

const BOVEDA = process.env["VAULT_PATH"];
if (!BOVEDA || !existsSync(BOVEDA)) {
  console.error('Falta VAULT_PATH. Ej: VAULT_PATH="/ruta/a/la/boveda" node herramientas/atlas.mjs');
  process.exit(1);
}
const SALIDA = resolve(process.argv[2] ?? "atlas-de-diagramas.html");

/** Carpetas que no se recorren. 00-Fuentes son los PDF originales, no notas. */
const IGNORAR = new Set([".obsidian", ".git", ".claude", "00-Fuentes", "node_modules"]);

/** Devuelve todos los .md de la boveda, recursivo. */
function markdowns(dir) {
  const salida = [];
  for (const entrada of readdirSync(dir)) {
    if (IGNORAR.has(entrada)) continue;
    const p = join(dir, entrada);
    if (statSync(p).isDirectory()) salida.push(...markdowns(p));
    else if (entrada.endsWith(".md")) salida.push(p);
  }
  return salida;
}

/** Lee un campo del frontmatter YAML. Sin dependencias: son campos de una linea. */
function campo(frontmatter, clave) {
  const m = new RegExp(`^${clave}:\\s*(.+)$`, "m").exec(frontmatter);
  return m ? m[1].trim().replace(/^"|"$/g, "") : "";
}

/**
 * Clasifica la procedencia de la teoria de una nota a partir de su `fuente`.
 *
 * El orden importa: muchas notas son "clase + complemento" y su fuente empieza
 * nombrando la presentacion. Solo las que ARRANCAN con "COMPLEMENTO" son
 * complemento puro.
 */
function clasificar(fuente) {
  const f = fuente.toUpperCase();
  if (f.startsWith("COMPLEMENTO")) return "complemento";
  if (f.includes("PROPIO") || f.startsWith("NOTAS DE")) return "propio";
  return "nucleo";
}

const notas = [];
for (const archivo of markdowns(BOVEDA).sort()) {
  const texto = readFileSync(archivo, "utf8");
  const bloques = [...texto.matchAll(/```mermaid\n([\s\S]*?)```/g)].map((m) => m[1].trimEnd());
  if (bloques.length === 0) continue;

  const fm = texto.startsWith("---\n") ? texto.split("---")[1] ?? "" : "";
  const fuente = campo(fm, "fuente");

  // El encabezado que precede a cada bloque, para poder ubicarlo dentro de la nota.
  const secciones = [];
  for (const m of texto.matchAll(/```mermaid\n[\s\S]*?```/g)) {
    const antes = texto.slice(0, m.index);
    const encabezados = [...antes.matchAll(/^#{2,4} (.+)$/gm)];
    secciones.push(encabezados.length > 0 ? encabezados[encabezados.length - 1][1].trim() : "");
  }

  const carpeta = relative(BOVEDA, archivo).replace(/\\/g, "/").split("/").slice(0, -1).join("/") || "raíz";

  notas.push({
    nota: basename(archivo, ".md"),
    carpeta,
    tema: campo(fm, "tema") || "(sin tema)",
    fuente,
    clase: clasificar(fuente),
    bloques,
    secciones,
  });
}

if (notas.length === 0) {
  console.error(`No encontre bloques mermaid en ${BOVEDA}.`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Orden y agregados
// ---------------------------------------------------------------------------

const totalD = notas.reduce((n, x) => n + x.bloques.length, 0);
const porClase = { nucleo: 0, complemento: 0, propio: 0 };
for (const n of notas) porClase[n.clase] += n.bloques.length;

const peso = new Map();
for (const n of notas) peso.set(n.tema, (peso.get(n.tema) ?? 0) + 1);
// Los temas con mas notas primero; dentro de cada tema, alfabetico.
notas.sort(
  (a, b) =>
    (peso.get(b.tema) ?? 0) - (peso.get(a.tema) ?? 0) ||
    a.tema.localeCompare(b.tema, "es") ||
    a.nota.localeCompare(b.nota, "es"),
);
const temas = [...new Set(notas.map((n) => n.tema))];

// ---------------------------------------------------------------------------
// HTML
// ---------------------------------------------------------------------------

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const slug = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const ETIQUETA = {
  nucleo: ["Núcleo", "Sale de una presentación, captura o nota técnica de clase"],
  complemento: ["Complemento", "Sale de libros o normas; la clase manda si difiere"],
  propio: ["Propio", "Construido para la bóveda sobre la teoría de clase"],
};

const hoy = new Date(statSync(BOVEDA).mtime).toLocaleDateString("es-GT", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const partes = [];

partes.push(`<!-- Atlas de diagramas de la boveda AYDS. Generado por herramientas/atlas.mjs -->
<title>Atlas de Diagramas AYDS</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700&family=Source+Sans+3:ital,wght@0,400;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap">
<style>
/* La paleta sale de su plantilla de diapositivas: el teal de la banda del pie
   y el granate de la regla bajo los titulos. */
:root {
  --papel:        #f6f8f7;
  --superficie:   #ffffff;
  --hoja:         #ffffff;
  --tinta:        #172526;
  --tinta-media:  #4a5c5d;
  --tinta-suave:  #748686;
  --linea:        #d9e2e0;
  --teal:         #1f7a72;
  --teal-suave:   #e4f0ee;
  --granate:      #9b3a30;
  --granate-suave:#f7e7e4;
  --ambar:        #8a6410;
  --ambar-suave:  #f7efdc;
  --sombra:       0 1px 2px rgba(23,37,38,.06), 0 8px 24px -12px rgba(23,37,38,.14);
  --ancho:        1180px;
  --r:            10px;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --papel:        #0f1a1b;
    --superficie:   #162324;
    --tinta:        #e8efee;
    --tinta-media:  #a2b4b3;
    --tinta-suave:  #7b8d8c;
    --linea:        #27383a;
    --teal:         #63c7bb;
    --teal-suave:   #14312e;
    --granate:      #e0897d;
    --granate-suave:#33201d;
    --ambar:        #d9b262;
    --ambar-suave:  #2e2618;
    --sombra:       0 1px 2px rgba(0,0,0,.4), 0 10px 30px -14px rgba(0,0,0,.6);
  }
}
:root[data-theme="dark"] {
  --papel:        #0f1a1b;
  --superficie:   #162324;
  --tinta:        #e8efee;
  --tinta-media:  #a2b4b3;
  --tinta-suave:  #7b8d8c;
  --linea:        #27383a;
  --teal:         #63c7bb;
  --teal-suave:   #14312e;
  --granate:      #e0897d;
  --granate-suave:#33201d;
  --ambar:        #d9b262;
  --ambar-suave:  #2e2618;
  --sombra:       0 1px 2px rgba(0,0,0,.4), 0 10px 30px -14px rgba(0,0,0,.6);
}

*, *::before, *::after { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--papel);
  color: var(--tinta);
  font-family: "Source Sans 3", ui-sans-serif, system-ui, -apple-system, sans-serif;
  font-size: 16.5px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
/* El padding inferior es solo del cuerpo: si lo pusiera en .envoltura, la barra
   sticky lo heredaria y mediria 165px en vez de 69, tapando los diagramas. */
.envoltura { max-width: var(--ancho); margin: 0 auto; padding: 0 24px; }
.envoltura.cuerpo { padding-bottom: 96px; }

header.principal {
  border-bottom: 1px solid var(--linea);
  background: var(--superficie);
  margin-bottom: 40px;
}
header.principal .envoltura { padding-top: 40px; padding-bottom: 32px; }
.eyebrow {
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: 11.5px; letter-spacing: .14em; text-transform: uppercase;
  color: var(--teal); margin: 0 0 12px;
}
h1 {
  font-family: Archivo, system-ui, sans-serif;
  font-weight: 700; font-size: clamp(30px, 4.4vw, 46px);
  line-height: 1.06; letter-spacing: -.022em; margin: 0 0 6px;
  text-wrap: balance;
}
.regla { width: 96px; height: 4px; background: var(--granate); margin: 14px 0 18px; border-radius: 2px; }
.bajada { max-width: 62ch; color: var(--tinta-media); margin: 0; }
.bajada strong { color: var(--tinta); font-weight: 600; }

.cifras { display: flex; flex-wrap: wrap; gap: 10px 28px; margin-top: 26px; }
.cifra { display: flex; flex-direction: column; gap: 1px; }
.cifra b {
  font-family: Archivo, system-ui, sans-serif; font-weight: 600; font-size: 25px;
  line-height: 1.1; font-variant-numeric: tabular-nums;
}
.cifra span {
  font-family: "JetBrains Mono", monospace; font-size: 10.5px;
  letter-spacing: .1em; text-transform: uppercase; color: var(--tinta-suave);
}

.controles {
  position: sticky; top: 0; z-index: 20;
  background: color-mix(in srgb, var(--papel) 92%, transparent);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--linea);
  padding: 12px 0; margin-bottom: 36px;
}
.controles .envoltura { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
input[type="search"] {
  flex: 1 1 260px; min-width: 200px;
  font: inherit; font-size: 15px;
  padding: 9px 13px; color: var(--tinta);
  background: var(--superficie);
  border: 1px solid var(--linea); border-radius: var(--r);
}
input[type="search"]:focus-visible { outline: 2px solid var(--teal); outline-offset: 1px; border-color: var(--teal); }
.filtros { display: flex; flex-wrap: wrap; gap: 6px; }
button.f {
  font-family: "JetBrains Mono", monospace; font-size: 11.5px; letter-spacing: .04em;
  padding: 7px 12px; cursor: pointer; color: var(--tinta-media);
  background: var(--superficie); border: 1px solid var(--linea);
  border-radius: 999px; transition: background .13s, color .13s, border-color .13s;
}
button.f:hover { border-color: var(--teal); color: var(--teal); }
button.f[aria-pressed="true"] { background: var(--teal); border-color: var(--teal); color: #fff; }
:root[data-theme="dark"] button.f[aria-pressed="true"] { color: #0f1a1b; }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) button.f[aria-pressed="true"] { color: #0f1a1b; }
}
button.f:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
#vacio { display: none; color: var(--tinta-media); padding: 40px 0; }

.tema { margin: 0 0 8px; }
.tema > h2 {
  font-family: Archivo, system-ui, sans-serif; font-weight: 600;
  font-size: 13px; letter-spacing: .1em; text-transform: uppercase;
  color: var(--tinta-suave); margin: 44px 0 4px;
  padding-bottom: 8px; border-bottom: 1px solid var(--linea);
  display: flex; justify-content: space-between; align-items: baseline; gap: 12px;
}
.tema > h2 em { font-style: normal; font-family: "JetBrains Mono", monospace; font-size: 11px; color: var(--tinta-suave); }

article.nota {
  background: var(--superficie);
  border: 1px solid var(--linea);
  border-left: 3px solid var(--teal);
  border-radius: var(--r);
  padding: 20px 22px 22px;
  margin: 20px 0 0;
  box-shadow: var(--sombra);
}
article.nota[data-clase="complemento"] { border-left-color: var(--granate); }
article.nota[data-clase="propio"] { border-left-color: var(--ambar); }
.cab { display: flex; flex-wrap: wrap; align-items: baseline; gap: 8px 12px; margin-bottom: 4px; }
.cab h3 {
  font-family: Archivo, system-ui, sans-serif; font-weight: 600;
  font-size: 20px; line-height: 1.25; letter-spacing: -.012em; margin: 0;
  text-wrap: balance;
}
.chip {
  font-family: "JetBrains Mono", monospace; font-size: 10.5px; letter-spacing: .07em;
  text-transform: uppercase; padding: 3px 8px; border-radius: 4px; white-space: nowrap;
  background: var(--teal-suave); color: var(--teal); cursor: help;
}
.chip.complemento { background: var(--granate-suave); color: var(--granate); }
.chip.propio { background: var(--ambar-suave); color: var(--ambar); }
.ruta { font-family: "JetBrains Mono", monospace; font-size: 11.5px; color: var(--tinta-suave); }
.fuente { font-size: 13.5px; color: var(--tinta-media); margin: 6px 0 0; max-width: 78ch; }

/* Las hojas se quedan BLANCAS en los dos temas, como un juego de planos: los
   diagramas traen sus propios colores claros y sobre fondo oscuro serian
   ilegibles. Por eso estos colores son literales y no tokens. */
.hojas { display: grid; gap: 16px; margin-top: 18px; }
figure.hoja {
  margin: 0; border: 1px solid var(--linea); border-radius: 8px;
  background: var(--hoja); overflow: hidden;
}
figure.hoja > figcaption {
  display: flex; justify-content: space-between; align-items: center; gap: 12px;
  padding: 7px 12px; border-bottom: 1px solid #e8eceb;
  background: #fbfcfc;
  font-family: "JetBrains Mono", monospace; font-size: 11px;
  color: #6b7d7c;
}
figure.hoja > figcaption b { font-weight: 500; color: #40514f; }
.lienzo { padding: 18px 14px; overflow-x: auto; text-align: center; }
.lienzo pre.mermaid { margin: 0; background: none; }
.lienzo svg { max-width: 100%; height: auto; }

footer.pie {
  border-top: 1px solid var(--linea); margin-top: 64px; padding-top: 22px;
  color: var(--tinta-suave); font-size: 13.5px;
}
footer.pie code { font-family: "JetBrains Mono", monospace; font-size: 12.5px; color: var(--tinta-media); }
@media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
@media (max-width: 640px) {
  .envoltura { padding-left: 16px; padding-right: 16px; }
  article.nota { padding: 16px 15px 18px; }
}
</style>

<header class="principal">
  <div class="envoltura">
    <p class="eyebrow">Análisis y Diseño de Sistemas II &nbsp;·&nbsp; curso 785 &nbsp;·&nbsp; ECYS-USAC</p>
    <h1>Atlas de Diagramas</h1>
    <div class="regla"></div>
    <p class="bajada">Los <strong>${totalD} diagramas</strong> de la bóveda, renderizados y agrupados por tema.
    Cada hoja indica la nota de la que sale y su posición dentro de ella, así que lo que
    encontrás acá se puede abrir en Obsidian sin buscar. El borde izquierdo de cada tarjeta
    dice de dónde viene la teoría: <strong>teal</strong> si es de clase, <strong>granate</strong>
    si es complemento.</p>
    <div class="cifras">
      <div class="cifra"><b>${totalD}</b><span>diagramas</span></div>
      <div class="cifra"><b>${notas.length}</b><span>notas</span></div>
      <div class="cifra"><b>${temas.length}</b><span>temas</span></div>
      <div class="cifra"><b>${porClase.nucleo}</b><span>de clase</span></div>
      <div class="cifra"><b>${porClase.complemento}</b><span>complemento</span></div>
    </div>
  </div>
</header>

<div class="controles">
  <div class="envoltura">
    <input type="search" id="q" placeholder="Filtrar por nota, tema o contenido del diagrama…" aria-label="Filtrar diagramas">
    <div class="filtros" role="group" aria-label="Filtrar por procedencia">
      <button class="f" data-clase="todo" aria-pressed="true">Todo</button>
      <button class="f" data-clase="nucleo" aria-pressed="false">Solo de clase</button>
      <button class="f" data-clase="complemento" aria-pressed="false">Solo complemento</button>
    </div>
  </div>
</div>

<div class="envoltura cuerpo">
<p id="vacio">Nada coincide con ese filtro. Probá con otra palabra, o volvé a <b>Todo</b>.</p>
`);

for (const tema of temas) {
  const delTema = notas.filter((n) => n.tema === tema);
  const dTema = delTema.reduce((n, x) => n + x.bloques.length, 0);
  partes.push(
    `<section class="tema" data-tema="${esc(tema)}">\n` +
      `  <h2 id="${slug(tema)}">${esc(tema)}<em>${delTema.length} ` +
      `${delTema.length === 1 ? "nota" : "notas"} · ${dTema} ` +
      `${dTema === 1 ? "diagrama" : "diagramas"}</em></h2>\n`,
  );

  for (const n of delTema) {
    const [etiqueta, ayuda] = ETIQUETA[n.clase];
    const buscable = esc(
      [n.nota, n.tema, n.fuente, ...n.bloques, ...n.secciones].join(" ").toLowerCase(),
    );
    partes.push(
      `  <article class="nota" data-clase="${n.clase}" data-buscable="${buscable}">\n` +
        `    <div class="cab">\n` +
        `      <h3>${esc(n.nota)}</h3>\n` +
        `      <span class="chip ${n.clase}" title="${esc(ayuda)}">${etiqueta}</span>\n` +
        `      <span class="ruta">${esc(n.carpeta)}/</span>\n` +
        `    </div>\n`,
    );
    if (n.fuente) {
      partes.push(`    <p class="fuente">${esc(n.fuente.replace(/\*\*(.+?)\*\*/g, "$1"))}</p>\n`);
    }
    partes.push('    <div class="hojas">\n');
    n.bloques.forEach((codigo, i) => {
      const ident = `${n.nota}#mermaid-${i + 1}`;
      const donde = n.secciones[i] ? esc(n.secciones[i]) : "—";
      partes.push(
        `      <figure class="hoja">\n` +
          `        <figcaption><span><b>${esc(ident)}</b></span><span>${donde}</span></figcaption>\n` +
          `        <div class="lienzo"><pre class="mermaid">${esc(codigo)}</pre></div>\n` +
          `      </figure>\n`,
      );
    });
    partes.push("    </div>\n  </article>\n");
  }
  partes.push("</section>\n");
}

partes.push(`
<footer class="pie">
  <p>Generado desde la bóveda con <code>herramientas/atlas.mjs</code> el ${hoy}. Los identificadores
  (<code>Nota#mermaid-N</code>) son los mismos que devuelve la herramienta
  <code>obtener_diagrama</code> del servidor MCP <code>tutor-ayds</code>, así que sirven para pedir
  el código fuente de cualquiera de estas hojas.</p>
  <p>Las hojas se mantienen en blanco en los dos temas, como un juego de planos: los diagramas
  traen sus propios colores y sobre fondo oscuro se volverían ilegibles.</p>
</footer>
</div>

<script>
(function () {
  var q = document.getElementById("q");
  var vacio = document.getElementById("vacio");
  var botones = Array.prototype.slice.call(document.querySelectorAll("button.f"));
  var notas = Array.prototype.slice.call(document.querySelectorAll("article.nota"));
  var secciones = Array.prototype.slice.call(document.querySelectorAll("section.tema"));
  var clase = "todo";

  // Insensible a acentos: buscar "descomposicion" tiene que encontrar
  // "descomposición".
  function normalizar(s) {
    return s.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "");
  }

  function aplicar() {
    var texto = normalizar(q.value.trim());
    var visibles = 0;
    notas.forEach(function (n) {
      var okClase = clase === "todo" || n.dataset.clase === clase;
      var okTexto = texto === "" || normalizar(n.dataset.buscable).indexOf(texto) !== -1;
      var ver = okClase && okTexto;
      n.hidden = !ver;
      if (ver) visibles++;
    });
    // Un tema sin notas visibles se esconde entero, encabezado incluido.
    secciones.forEach(function (s) {
      s.hidden = !s.querySelector("article.nota:not([hidden])");
    });
    vacio.style.display = visibles === 0 ? "block" : "none";
  }

  q.addEventListener("input", aplicar);
  botones.forEach(function (b) {
    b.addEventListener("click", function () {
      clase = b.dataset.clase;
      botones.forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
      aplicar();
    });
  });
})();
</script>
`);

writeFileSync(SALIDA, partes.join(""), "utf8");

console.log(`Atlas generado: ${SALIDA}`);
console.log(`  ${totalD} diagramas · ${notas.length} notas · ${temas.length} temas`);
console.log(`  de clase: ${porClase.nucleo} · complemento: ${porClase.complemento} · propio: ${porClase.propio}`);
console.log("");
console.log("Para verlo: publicalo como artifact, o servilo por HTTP agregando mermaid a mano.");
console.log("Abrirlo con file:// no dibuja los diagramas (el CDN queda bloqueado).");
