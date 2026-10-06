r"""Cuadernos PDF del cerebro monitor-z: teoría de cada lección + sus láminas, con margen para notas.

Uso:  python generar_cuaderno.py          (todos los cuadernos con teoría escrita)
      python generar_cuaderno.py L01      (sólo uno)
Salida: ..\Cuaderno <id> - <título>.pdf  y  ..\Cuaderno completo.pdf
Para una lección nueva: agregarla a CUADERNOS con su nota y el mapa sección -> láminas.
"""
import os, re, sys, html, subprocess

AQUI = os.path.dirname(os.path.abspath(__file__))
SALIDA = os.path.dirname(AQUI)
CEREBRO = os.path.dirname(SALIDA)
VISUAL = os.path.join(CEREBRO, '_visual')
CHROME = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
FECHA = '2026-10-05'

# id, título, notas (en orden), {prefijo del encabezado "## …": [láminas]}
CUADERNOS = [
    ('00', 'Ruta y glosario', ['Ruta de aprendizaje.md', 'Glosario.md'], {
        '#Ruta de aprendizaje': ['00_Ruta/R-01_ruta_de_aprendizaje'],
        '#Glosario': ['00_Ruta/G-01_glosario'],
    }),
    ('L00', 'Qué es un demonio en z/OS y qué vamos a construir',
     ['10 - Lecciones/L00 - Que es un demonio en z-OS y que vamos a construir.md'], {
        '1.': ['L00/L00-01_que_es_un_demonio', 'L00/L00-02_bucle_malo_vs_bueno'],
        '2.': ['L00/L00-03_unix_vs_zos', 'L00/L00-04_job_largo_vs_stc'],
        '3.': ['L00/L00-06_costo_de_preguntar', 'L00/L00-05_tres_niveles'],
        '4.': ['L00/L00-07_mapa_de_piezas'],
        '5.': ['L00/L00-08_donde_estamos'],
    }),
    ('L01', 'Anatomía de un programa Assembler: el prólogo de ZTKMONS',
     ['10 - Lecciones/L01 - Anatomia de un programa Assembler - el prologo de ZTKMONS.md'], {
        '1.': ['L01/L01-01_registros_al_entrar_y_salir'],
        '2.': ['L01/L01-02_save_area'],
        '3.': ['L01/L01-03_prologo_paso_a_paso', 'L01/L01-04_registros_base'],
        '4.': ['L01/L01-05_epilogo'],
        '5.': ['L01/L01-06_como_llega_el_parm'],
        '6.': ['L01/L01-07_amode_rmode'],
        '7.': ['L01/L01-08_decisiones_de_diseno'],
        '9.': ['L01/L01-09_practica_ztkhola'],
    }),
    ('L02', 'Dormir sin gastar CPU: STIMER, WAIT, POST y ECB',
     ['10 - Lecciones/L02 - Dormir sin gastar CPU - STIMER, WAIT, POST y ECB.md'], {
        '1.': ['L02/L02-01_el_bucle'], '2.': ['L02/L02-02_stimer'], '3.': ['L02/L02-03_ecb'],
        '4.': ['L02/L02-04_timer_y_eventos_juntos'], '7.': ['L02/L02-05_practica_medir_cpu'],
    }),
    ('L03', 'Hablarle a JES por SSI 80', ['10 - Lecciones/L03 - Hablarle a JES por SSI 80.md'], {
        '1.': ['L03/L03-01_ventanilla_ssi'], '2.': ['L03/L03-02_campos_clave'],
        '3.': ['L03/L03-03_fases_de_un_job'], '6.': ['L03/L03-04_vuelta_de_ztkmons'],
    }),
    ('L04', 'ZTKMONS v0 en DESA: ensamblar y la demo en modo spool',
     ['10 - Lecciones/L04 - ZTKMONS v0 en DESA - ensamblar y la demo en modo spool.md'], {
        '1.': ['L04/L04-01_de_fuente_a_programa'], '4.': ['L04/L04-02_la_demo'], '5.': ['L04/L04-03_que_valida'],
    }),
    ('L05', 'Diseño del protocolo ZTKMON v1', ['10 - Lecciones/L05 - Diseño del protocolo ZTKMON v1.md'], {
        '2.': ['L05/L05-01_mensajes_host_a_pc'], '3.': ['L05/L05-02_mensajes_pc_a_host'],
        '4.': ['L05/L05-03_conexion_y_reconexion'],
    }),
    ('L06', 'Sockets en z/OS', ['10 - Lecciones/L06 - Sockets en z-OS.md'], {
        '2.': ['L06/L06-01_servidor_tcp'], '3.': ['L06/L06-02_bloqueo_y_plazos'],
    }),
    ('L07', 'Ser un STC de verdad', ['10 - Lecciones/L07 - Ser un STC de verdad.md'], {
        '2.': ['L07/L07-01_como_arranca_un_stc'], '3.': ['L07/L07-02_comandos_del_operador'],
        '5.': ['L07/L07-03_recuperacion_estae'],
    }),
    ('L08', 'Eventos de verdad: ENF 70', ['10 - Lecciones/L08 - Eventos de verdad - ENF 70.md'], {
        '1.': ['L08/L08-01_flujo_enf70'], '6.': ['L08/L08-02_reglas_del_exit'],
    }),
    ('L09', '¿Quién tiene el archivo? ENQ y GQSCAN', ['10 - Lecciones/L09 - Quien tiene el archivo - ENQ y GQSCAN.md'], {
        '1.': ['L09/L09-01_enq_sysdsn'], '3.': ['L09/L09-02_gqscan'], '5.': ['L09/L09-03_alerta_contencion'],
    }),
    ('L10', 'El lado PC: puente, portal y ML en línea',
     ['10 - Lecciones/L10 - El lado PC - puente, portal y ML en linea.md'], {
        '1.': ['L10/L10-01_del_evento_a_la_alerta'], '4.': ['L10/L10-02_umbral_de_colgado'],
        '6.': ['L10/L10-03_limites_del_lado_pc'],
    }),
    ('L11', 'Operación y pase', ['10 - Lecciones/L11 - Operacion y pase.md'], {
        '1.': ['L11/L11-01_que_pedir_a_sistemas'], '3.': ['L11/L11-02_runbook'],
    }),
]

CSS = r"""
@page { size: Letter; margin: 16mm 14mm 16mm 16mm;
  @bottom-right { content: "Página " counter(page); font: 9pt 'Segoe UI', Calibri, sans-serif; color: #8a919c; }
  @bottom-left { content: "Monitor z · cuaderno de estudio"; font: 9pt 'Segoe UI', Calibri, sans-serif; color: #8a919c; } }
* { box-sizing: border-box }
html, body { margin: 0; background: #fff; color: #1f2329 }
body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; font-size: 11.5pt; line-height: 1.62 }
.texto { margin-right: 46mm; position: relative }
.portada { height: 240mm; display: flex; flex-direction: column; justify-content: center; page-break-after: always;
  border-left: 10px solid #1F3864; padding-left: 14mm }
.portada .id { font-size: 15pt; color: #2E74B5; font-weight: 700; letter-spacing: 1px }
.portada h1 { font-size: 30pt; color: #1F3864; margin: 6mm 0 4mm 0; line-height: 1.15 }
.portada .sub { font-size: 12.5pt; color: #4a5260 }
.portada .ayuda { margin-top: 18mm; font-size: 10.5pt; color: #4a5260; border: 1px dashed #9DB3D1; border-radius: 8px; padding: 4mm 5mm; max-width: 150mm }
h1 { font-size: 20pt; color: #1F3864; border-bottom: 3px solid #1F3864; padding-bottom: 2mm; margin: 0 0 4mm 0; page-break-before: always }
h1.primero { page-break-before: auto }
h2 { font-size: 15pt; color: #1F3864; margin: 8mm 0 2.5mm 0; page-break-after: avoid; border-left: 5px solid #2E74B5; padding-left: 3mm }
h3 { font-size: 12.5pt; color: #2E74B5; margin: 5mm 0 2mm 0; page-break-after: avoid }
p { margin: 0 0 3mm 0 }
ul, ol { margin: 0 0 3mm 0; padding-left: 7mm }
li { margin-bottom: 1.2mm }
li.sub { margin-left: 6mm; list-style: circle }
code { font-family: Consolas, 'Courier New', monospace; font-size: 10pt; background: #eef2f8; padding: 0 3px; border-radius: 3px }
pre { font-family: Consolas, 'Courier New', monospace; font-size: 9.6pt; line-height: 1.45; background: #f4f6fa; border: 1px solid #d5dce8;
  border-left: 4px solid #1F3864; border-radius: 4px; padding: 3mm 4mm; white-space: pre; overflow: hidden; page-break-inside: avoid; margin: 0 0 3.5mm 0 }
table { border-collapse: collapse; width: 100%; font-size: 10pt; line-height: 1.4; margin: 1mm 0 4mm 0 }
tr { page-break-inside: avoid }
th { background: #1F3864; color: #fff; text-align: left; padding: 2mm 2.5mm }
td { border: 1px solid #c9d2df; padding: 1.8mm 2.5mm; vertical-align: top }
tr:nth-child(even) td { background: #f5f8fc }
.fuente { font-size: 9.5pt; color: #5d6470; border-left: 3px solid #c9d2df; padding: 1mm 0 1mm 3mm; margin: 0 0 3.5mm 0 }
.lamina { margin: 4mm -46mm 5mm 0; page-break-inside: avoid; text-align: center }
.lamina img { width: 100%; border: 1px solid #d5dce8; border-radius: 4px }
.lamina .pie { font-size: 8.5pt; color: #8a919c; margin-top: 1mm }
.notas { position: absolute; right: -46mm; top: 0; bottom: 0; width: 40mm; border-left: 1px dotted #c3cad6 }
.renglones { margin: 2mm -46mm 4mm 0; page-break-inside: avoid }
.renglones .t { font-weight: 700; color: #1F3864; margin-bottom: 1mm }
.renglones .r { height: 9mm; border-bottom: 1px solid #d5dce8 }
a { color: inherit; text-decoration: none }
.wiki { font-style: italic; color: #2E74B5 }
"""


def inline(t):
    t = html.escape(t.replace('@@PIPE@@', '|'), quote=False)
    t = re.sub(r'\[\[([^\]|]+)\|([^\]]+)\]\]', r'<span class="wiki">\2</span>', t)
    t = re.sub(r'\[\[([^\]]+)\]\]', r'<span class="wiki">\1</span>', t)
    codigos = []

    def guarda(m):
        codigos.append(m.group(1))
        return f'@@COD{len(codigos) - 1}@@'
    t = re.sub(r'`([^`]+)`', guarda, t)
    t = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', t)
    t = re.sub(r'(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])', r'<i>\1</i>', t)
    return re.sub(r'@@COD(\d+)@@', lambda m: '<code>' + codigos[int(m.group(1))] + '</code>', t)


def laminas_html(lista):
    h = []
    for l in lista:
        ruta = os.path.join(VISUAL, *l.split('/')) + '.png'
        if os.path.exists(ruta):
            h.append(f'<div class="lamina"><img src="file:///{ruta.replace(os.sep, "/")}">'
                     f'<div class="pie">Lámina {os.path.basename(l)}</div></div>')
    return '\n'.join(h)


def renglones(titulo, n):
    return ('<div class="renglones"><div class="t">' + titulo + '</div>' + '<div class="r"></div>' * n + '</div>')


def md_a_html(md, mapa, primera):
    md = re.sub(r'^---\n.*?\n---\n', '', md, flags=re.S)
    lineas = md.split('\n')
    out, i = [], 0
    pend = []           # láminas a insertar al cerrar la sección actual
    en_preguntas = False
    def cerrar_seccion():
        nonlocal pend, en_preguntas
        if pend:
            out.append(laminas_html(pend)); pend = []
        if en_preguntas:
            out.append(renglones('Mis respuestas', 14)); en_preguntas = False
    while i < len(lineas):
        ln = lineas[i]
        if ln.startswith('```'):
            j = i + 1; buf = []
            while j < len(lineas) and not lineas[j].startswith('```'):
                buf.append(html.escape(lineas[j])); j += 1
            out.append('<pre>' + '\n'.join(buf) + '</pre>'); i = j + 1; continue
        if ln.startswith('# '):
            titulo = ln[2:].strip()
            cls = ' class="primero"' if primera else ''
            primera = False
            out.append(f'<h1{cls}>{inline(titulo)}</h1>')
            for k, v in mapa.items():
                if k.startswith('#') and titulo.startswith(k[1:]):
                    pend = list(v)
            i += 1; continue
        if ln.startswith('## '):
            cerrar_seccion()
            t = ln[3:].strip()
            out.append(f'<h2>{inline(t)}</h2>')
            for k, v in mapa.items():
                if not k.startswith('#') and t.startswith(k):
                    pend = list(v)
            if 'Preguntas de comprobación' in t:
                en_preguntas = True
            i += 1; continue
        if ln.startswith('### '):
            out.append(f'<h3>{inline(ln[4:].strip())}</h3>'); i += 1; continue
        if ln.startswith('|'):
            filas = []
            while i < len(lineas) and lineas[i].startswith('|'):
                filas.append(lineas[i]); i += 1
            celdas = [[c.strip() for c in f.replace('\\|', '@@PIPE@@').strip().strip('|').split('|')] for f in filas]
            cab, cuerpo = celdas[0], [c for c in celdas[2:]]
            h = '<table><tr>' + ''.join(f'<th>{inline(c)}</th>' for c in cab) + '</tr>'
            for f in cuerpo:
                h += '<tr>' + ''.join(f'<td>{inline(c)}</td>' for c in f) + '</tr>'
            out.append(h + '</table>'); continue
        if ln.startswith('>'):
            buf = []
            while i < len(lineas) and lineas[i].startswith('>'):
                buf.append(lineas[i].lstrip('>').strip()); i += 1
            out.append('<div class="fuente">' + inline(' '.join(buf)) + '</div>'); continue
        m_ul = re.match(r'^(\s*)- (.*)', ln)
        m_ol = re.match(r'^(\s*)\d+\. (.*)', ln)
        if m_ul or m_ol:
            tag = 'ul' if m_ul else 'ol'
            items = []
            while i < len(lineas):
                a = re.match(r'^(\s*)- (.*)', lineas[i]) if tag == 'ul' else re.match(r'^(\s*)\d+\. (.*)', lineas[i])
                b = re.match(r'^(\s+)- (.*)', lineas[i])
                if a:
                    sub = ' class="sub"' if len(a.group(1)) >= 2 else ''
                    items.append(f'<li{sub}>{inline(a.group(2))}</li>'); i += 1
                elif b:
                    items.append(f'<li class="sub">{inline(b.group(2))}</li>'); i += 1
                else:
                    break
            out.append(f'<{tag}>' + ''.join(items) + f'</{tag}>'); continue
        if not ln.strip():
            i += 1; continue
        if ln.startswith('Relacionado:'):
            cerrar_seccion()
        buf = [ln.strip()]; i += 1
        while i < len(lineas) and lineas[i].strip() and not re.match(r'^(#|\||>|```|\s*- |\s*\d+\. )', lineas[i]):
            buf.append(lineas[i].strip()); i += 1
        out.append('<p>' + inline(' '.join(buf)) + '</p>')
    cerrar_seccion()
    return '\n'.join(out), primera


def construir(cid, titulo, notas, mapa):
    cuerpo, primera = [], True
    for n in notas:
        md = open(os.path.join(CEREBRO, *n.split('/')), encoding='utf-8').read()
        h, primera = md_a_html(md, mapa, primera)
        cuerpo.append(h)
    cuerpo.append('<h2>Notas</h2>' + renglones('', 18))
    portada = (f'<div class="portada"><div class="id">MONITOR Z · {cid}</div><h1 class="primero" style="border:0;page-break-before:auto">{html.escape(titulo)}</h1>'
               f'<div class="sub">Cuaderno de estudio · versión del {FECHA}</div>'
               '<div class="ayuda">Margen derecho y renglones libres para tus notas. Las láminas son las mismas de la carpeta '
               '<b>_visual</b>. Si una lección se corrige, se regenera este cuaderno con la fecha nueva.</div></div>')
    return (f'<!doctype html><html><head><meta charset="utf-8"><title>{html.escape(cid + " " + titulo)}</title>'
            f'<style>{CSS}</style></head><body>{portada}<div class="texto">' + '\n'.join(cuerpo) + '</div></body></html>')


def a_pdf(html_txt, nombre):
    tmp = os.path.join(AQUI, 'html'); os.makedirs(tmp, exist_ok=True)
    h = os.path.join(tmp, re.sub(r'[^\w.-]+', '_', nombre) + '.html')
    open(h, 'w', encoding='utf-8').write(html_txt)
    pdf = os.path.join(SALIDA, nombre + '.pdf')
    subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--no-pdf-header-footer',
                    f'--print-to-pdf={pdf}', f'--user-data-dir={os.path.join(AQUI, "chrome_perfil")}',
                    '--allow-file-access-from-files', 'file:///' + h.replace('\\', '/')],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(pdf, os.path.getsize(pdf) // 1024, 'KB')


def main():
    filtro = sys.argv[1] if len(sys.argv) > 1 else ''
    todos = []
    for cid, titulo, notas, mapa in CUADERNOS:
        if filtro and cid != filtro:
            continue
        a_pdf(construir(cid, titulo, notas, mapa), f'Cuaderno {cid} - ' + re.sub(r'[\/:*?"<>|¿]', '', titulo.split(':')[0].replace('/', '-')).strip())
        todos.append((cid, titulo, notas, mapa))
    if not filtro:
        notas = [n for _, _, ns, _ in CUADERNOS for n in ns]
        mapa = {}
        for _, _, _, m in CUADERNOS:
            pass
        # completo: concatenar cuerpos de cada cuaderno
        cuerpos = []
        for cid, titulo, ns, m in CUADERNOS:
            primera = not cuerpos
            for n in ns:
                md = open(os.path.join(CEREBRO, *n.split('/')), encoding='utf-8').read()
                h, primera = md_a_html(md, m, primera)
                cuerpos.append(h)
        portada = ('<div class="portada"><div class="id">MONITOR Z · CUADERNO COMPLETO</div>'
                   '<h1 class="primero" style="border:0;page-break-before:auto">Teoría y láminas del monitor de jobs en z/OS</h1>'
                   f'<div class="sub">Lecciones escritas hasta el {FECHA}: ' + ', '.join(c[0] for c in CUADERNOS) + '</div></div>')
        txt = (f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>{portada}'
               '<div class="texto">' + '\n'.join(cuerpos) + '<h2>Notas</h2>' + renglones('', 18) + '</div></body></html>')
        a_pdf(txt, 'Cuaderno completo')


if __name__ == '__main__':
    main()
