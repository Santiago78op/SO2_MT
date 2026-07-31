/**
 * Html-To-Pdf.js — Convierte un HTML local en PDF con numeracion de paginas.
 *
 * Usa el Chrome DevTools Protocol contra el Chrome ya instalado (sin npm install,
 * sin puppeteer): Node 24 trae WebSocket y fetch globales.
 * A diferencia de `chrome --print-to-pdf`, esto SI permite pie de pagina propio,
 * que es la unica forma de tener "pag X / Y" en el documento.
 *
 * Uso:
 *   node Html-To-Pdf.js <entrada.html> <salida.pdf> ["Titulo del pie"]
 *
 * El HTML manda el tamano y los margenes con @page (preferCSSPageSize),
 * por ejemplo:  @page { size: letter; margin: 1.9cm 2.1cm 2.25cm 2.1cm; }
 * El margen inferior debe dejar ~2.2cm para que entre el pie.
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CHROME_CANDIDATOS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  path.join(os.homedir(), 'AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'),
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
];
const PORT = 9333;

if (process.argv.length < 4) {
  console.error('Uso: node Html-To-Pdf.js <entrada.html> <salida.pdf> ["Titulo del pie"]');
  process.exit(1);
}
const htmlPath = path.resolve(process.argv[2]);
const outPath = path.resolve(process.argv[3]);
const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');

// titulo del pie: 3er argumento, o el <title> del HTML, o el nombre del archivo
let titulo = process.argv[4];
if (!titulo) {
  const m = fs.readFileSync(htmlPath, 'utf8').match(/<title>([\s\S]*?)<\/title>/i);
  titulo = m ? m[1].trim() : path.basename(htmlPath, path.extname(htmlPath));
}
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const chromeExe = CHROME_CANDIDATOS.find(p => fs.existsSync(p));
if (!chromeExe) { console.error('No encontre Chrome ni Edge en las rutas conocidas.'); process.exit(1); }

const FOOTER = `
<div style="font-family:'Segoe UI',Arial,sans-serif;font-size:7.5pt;color:#6b6a66;
            width:100%;box-sizing:border-box;padding:2px 2.1cm 0 2.1cm;
            display:flex;justify-content:space-between;align-items:baseline;">
  <span style="font-style:italic">${esc(titulo)}</span>
  <span style="font-variant-numeric:tabular-nums">
    <span style="color:#534AB7;font-weight:600"><span class="pageNumber"></span></span>
    <span style="color:#b9b7cf"> / </span><span class="totalPages"></span>
  </span>
</div>`;

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const chrome = spawn(chromeExe, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run',
    '--remote-debugging-port=' + PORT,
    '--user-data-dir=' + path.join(os.tmpdir(), 'claude', 'chromecdp'),
    'about:blank'
  ], { stdio: 'ignore' });

  let target = null;
  for (let i = 0; i < 60 && !target; i++) {
    await sleep(300);
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      target = list.find(t => t.type === 'page');
    } catch (e) { /* Chrome todavia no levanto */ }
  }
  if (!target) { console.error('No pude conectar con Chrome por CDP.'); chrome.kill(); process.exit(1); }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map(), events = new Map();
  ws.addEventListener('message', ev => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg.result || {}); pending.delete(msg.id); }
    if (msg.method && events.has(msg.method)) { events.get(msg.method)(); events.delete(msg.method); }
  });
  const send = (method, params = {}) => new Promise(res => {
    const mid = ++id; pending.set(mid, res);
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
  const waitFor = m => new Promise(res => events.set(m, res));

  await new Promise(res => ws.addEventListener('open', res));
  await send('Page.enable');
  const loaded = waitFor('Page.loadEventFired');
  await send('Page.navigate', { url: fileUrl });
  await loaded;
  await sleep(2500);                                    // fuentes, SVG, imagenes
  await send('Emulation.setEmulatedMedia', { media: 'print' });
  await sleep(600);

  const res = await send('Page.printToPDF', {
    printBackground: true,
    preferCSSPageSize: true,                            // respeta @page del CSS
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: FOOTER,
    transferMode: 'ReturnAsBase64'
  });

  if (!res.data) { console.error('printToPDF no devolvio datos.'); chrome.kill(); process.exit(1); }
  fs.writeFileSync(outPath, Buffer.from(res.data, 'base64'));
  const kb = Math.round(fs.statSync(outPath).size / 1024);
  console.log(`PDF listo: ${outPath} (${kb} KB) — pie: "${titulo}"`);

  ws.close(); chrome.kill(); process.exit(0);
})();
