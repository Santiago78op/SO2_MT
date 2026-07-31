// Genera el PDF con numeracion de paginas usando el Chrome DevTools Protocol.
// Uso: node pdf.js <archivo.html> <salida.pdf>
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9333;
const htmlPath = path.resolve(process.argv[2]);
const outPath  = path.resolve(process.argv[3]);
const fileUrl  = 'file:///' + htmlPath.replace(/\\/g, '/');

const FOOTER = `
<div style="font-family:'Segoe UI',Arial,sans-serif;font-size:7.5pt;color:#6b6a66;
            width:100%;box-sizing:border-box;padding:2px 2.1cm 0 2.1cm;
            display:flex;justify-content:space-between;align-items:baseline;">
  <span style="font-style:italic">Arquitectura de Software &mdash; Gu&iacute;a de estudio integrada</span>
  <span style="font-variant-numeric:tabular-nums">
    <span style="color:#534AB7;font-weight:600"><span class="pageNumber"></span></span>
    <span style="color:#b9b7cf"> / </span><span class="totalPages"></span>
  </span>
</div>`;

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const chrome = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run',
    '--remote-debugging-port=' + PORT,
    '--user-data-dir=' + path.join(process.env.TEMP, 'claude', 'chromecdp'),
    'about:blank'
  ], { stdio: 'ignore' });

  // esperar el endpoint de depuracion
  let target = null;
  for (let i = 0; i < 60 && !target; i++) {
    await sleep(300);
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      target = list.find(t => t.type === 'page');
    } catch (e) { /* todavia no levanto */ }
  }
  if (!target) { console.error('No pude conectar con Chrome'); chrome.kill(); process.exit(1); }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  const events = new Map();
  ws.addEventListener('message', ev => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg.result || {}); pending.delete(msg.id); }
    if (msg.method && events.has(msg.method)) { events.get(msg.method)(); events.delete(msg.method); }
  });
  const send = (method, params = {}) => new Promise(res => {
    const mid = ++id; pending.set(mid, res);
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
  const waitFor = method => new Promise(res => events.set(method, res));

  await new Promise(res => ws.addEventListener('open', res));

  await send('Page.enable');
  const loaded = waitFor('Page.loadEventFired');
  await send('Page.navigate', { url: fileUrl });
  await loaded;
  await sleep(2500);                       // dar tiempo a fuentes y SVG
  await send('Emulation.setEmulatedMedia', { media: 'print' });
  await sleep(600);

  const res = await send('Page.printToPDF', {
    printBackground: true,
    preferCSSPageSize: true,               // usa @page del CSS (tamano y margenes)
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: FOOTER,
    transferMode: 'ReturnAsBase64'
  });

  if (!res.data) { console.error('printToPDF no devolvio datos'); chrome.kill(); process.exit(1); }
  fs.writeFileSync(outPath, Buffer.from(res.data, 'base64'));
  console.log('PDF escrito:', outPath, '(' + fs.statSync(outPath).size + ' bytes)');

  ws.close();
  chrome.kill();
  process.exit(0);
})();
