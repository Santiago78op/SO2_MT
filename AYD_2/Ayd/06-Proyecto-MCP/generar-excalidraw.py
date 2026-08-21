#!/usr/bin/env python3
"""
generar-excalidraw.py — construye archivos .excalidraw con coordenadas explícitas.

Existe porque es la ÚNICA vía programable para controlar el layout de un diagrama
(ver 06-Proyecto-MCP/estilo-diagramas.md §5, palanca 3): el MCP de StarUML no
tiene herramientas de posicionamiento.

Respeta las convenciones de estilo de esa guía: retícula de 20 px, roughness 0,
trazo #1e1e1e, Helvetica, y los tamaños estándar por elemento.

Uso:
    python generar-excalidraw.py <nombre-del-diagrama>

Diagramas disponibles: cdu-hospital
"""

import json
import sys

# --------------------------------------------------------------------------
# Convenciones de estilo (estilo-diagramas.md §5)
# --------------------------------------------------------------------------
TRAZO = "#1e1e1e"
FONDO_SISTEMA = "#f5f5f5"
FUENTE = 2          # Helvetica
GRID = 20

_contador = [0]


def _base(tipo, x, y, w, h, **kw):
    _contador[0] += 1
    n = _contador[0]
    el = {
        "id": f"el{n:03d}",
        "type": tipo,
        "x": x, "y": y, "width": w, "height": h,
        "angle": 0,
        "strokeColor": TRAZO,
        "backgroundColor": "transparent",
        "fillStyle": "solid",
        "strokeWidth": 1,
        "strokeStyle": "solid",
        "roughness": 0,
        "opacity": 100,
        "groupIds": [],
        "frameId": None,
        "roundness": None,
        "seed": 100000 + n * 7919,
        "version": 1,
        "versionNonce": 200000 + n * 6151,
        "isDeleted": False,
        "boundElements": None,
        "updated": 1,
        "link": None,
        "locked": False,
    }
    el.update(kw)
    return el


def texto(t, x, y, w, tam=16, align="center"):
    """Texto autónomo, centrado dentro de un ancho dado."""
    lineas = t.split("\n")
    alto = int(tam * 1.25 * len(lineas))
    return _base("text", x, y, w, alto,
                 text=t, originalText=t,
                 fontSize=tam, fontFamily=FUENTE,
                 textAlign=align, verticalAlign="top",
                 containerId=None, lineHeight=1.25, autoResize=False)


def elipse(x, y, w, h, etiqueta, tam=16):
    """Caso de uso: elipse + su nombre centrado."""
    e = _base("ellipse", x, y, w, h)
    lineas = etiqueta.split("\n")
    ty = y + h / 2 - (tam * 1.25 * len(lineas)) / 2
    return [e, texto(etiqueta, x, int(ty), w, tam)]


def caja(x, y, w, h, etiqueta, fondo="transparent", grosor=1, tam=16):
    """Rectángulo con su rótulo centrado arriba."""
    r = _base("rectangle", x, y, w, h,
              backgroundColor=fondo, strokeWidth=grosor,
              roundness={"type": 3})
    return [r, texto(etiqueta, x, y + 12, w, tam)]


def actor(x, y, nombre, tam=14):
    """Monigote UML: cabeza, tronco, brazos, piernas, nombre debajo.

    El bloque ocupa 100 x 120 (tamaño estándar de la guía §2.2).
    """
    cx = x + 50
    partes = [
        _base("ellipse", cx - 14, y, 28, 28),                                    # cabeza
        _base("line", cx, y + 28, 0, 36, points=[[0, 0], [0, 36]]),              # tronco
        _base("line", cx - 24, y + 40, 48, 0, points=[[0, 0], [48, 0]]),         # brazos
        _base("line", cx, y + 64, -20, 30, points=[[0, 0], [-20, 30]]),          # pierna izq
        _base("line", cx, y + 64, 20, 30, points=[[0, 0], [20, 30]]),            # pierna der
        texto(nombre, x - 20, y + 100, 140, tam),
    ]
    return partes


def linea(x1, y1, x2, y2, punta=None, punteada=False, etiqueta=None):
    """Asociación o relación. punta: None | 'arrow' | 'triangle_outline'."""
    els = [_base("arrow", x1, y1, x2 - x1, y2 - y1,
                 points=[[0, 0], [x2 - x1, y2 - y1]],
                 lastCommittedPoint=None,
                 startBinding=None, endBinding=None,
                 startArrowhead=None, endArrowhead=punta,
                 strokeStyle="dashed" if punteada else "solid",
                 elbowed=False)]
    if etiqueta:
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2
        els.append(texto(etiqueta, int(mx - 70), int(my - 22), 140, 12))
    return els


def envolver(elementos):
    return {
        "type": "excalidraw",
        "version": 2,
        "source": "generar-excalidraw.py",
        "elements": elementos,
        "appState": {
            "viewBackgroundColor": "#ffffff",
            "gridSize": GRID,
            "currentItemStrokeColor": TRAZO,
            "currentItemRoughness": 0,
            "currentItemFontFamily": FUENTE,
        },
        "files": {},
    }


# --------------------------------------------------------------------------
# Salida SVG — misma lista de elementos, vectorial y sin marca de agua
# (estilo-diagramas.md §6: se exporta SVG, no PNG)
# --------------------------------------------------------------------------
def emitir_svg(elementos, margen=40):
    xs, ys = [], []
    for e in elementos:
        xs += [e["x"], e["x"] + e["width"]]
        ys += [e["y"], e["y"] + e["height"]]
    minx, miny = min(xs) - margen, min(ys) - margen
    w = max(xs) - minx + margen
    h = max(ys) - miny + margen

    out = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{minx} {miny} {w} {h}" '
        f'width="{w}" height="{h}" font-family="Helvetica, Arial, sans-serif">',
        '<defs><marker id="gen" viewBox="0 0 12 12" refX="11" refY="6" '
        'markerWidth="12" markerHeight="12" orient="auto">'
        f'<polygon points="0,0 12,6 0,12" fill="#ffffff" stroke="{TRAZO}" '
        'stroke-width="1"/></marker></defs>',
        f'<rect x="{minx}" y="{miny}" width="{w}" height="{h}" fill="#ffffff"/>',
    ]

    for e in elementos:
        t, x, y, ew, eh = e["type"], e["x"], e["y"], e["width"], e["height"]
        gr = e.get("strokeWidth", 1)
        if t == "ellipse":
            out.append(
                f'<ellipse cx="{x + ew / 2}" cy="{y + eh / 2}" rx="{ew / 2}" ry="{eh / 2}" '
                f'fill="none" stroke="{TRAZO}" stroke-width="{gr}"/>')
        elif t == "rectangle":
            fill = e.get("backgroundColor", "transparent")
            fill = "none" if fill == "transparent" else fill
            out.append(
                f'<rect x="{x}" y="{y}" width="{ew}" height="{eh}" rx="12" '
                f'fill="{fill}" stroke="{TRAZO}" stroke-width="{gr}"/>')
        elif t in ("line", "arrow"):
            (dx1, dy1), (dx2, dy2) = e["points"][0], e["points"][-1]
            punta = ' marker-end="url(#gen)"' if e.get("endArrowhead") else ""
            dash = ' stroke-dasharray="8 6"' if e.get("strokeStyle") == "dashed" else ""
            out.append(
                f'<line x1="{x + dx1}" y1="{y + dy1}" x2="{x + dx2}" y2="{y + dy2}" '
                f'stroke="{TRAZO}" stroke-width="{gr}"{dash}{punta}/>')
        elif t == "text":
            tam = e["fontSize"]
            paso = tam * 1.25
            for i, linea_txt in enumerate(e["text"].split("\n")):
                esc = (linea_txt.replace("&", "&amp;")
                                .replace("<", "&lt;").replace(">", "&gt;"))
                out.append(
                    f'<text x="{x + ew / 2}" y="{y + paso * (i + 1) - tam * 0.28}" '
                    f'font-size="{tam}" fill="{TRAZO}" text-anchor="middle">{esc}</text>')

    out.append("</svg>")
    return "\n".join(out)


# --------------------------------------------------------------------------
# Diagrama: casos de uso del Sistema Hospitalario
#   (el caso resuelto en clase — Ejemplos resueltos de casos de negocio)
#
# Layout según estilo-diagramas.md §3.1:
#   · actores en la banda izquierda, en escalera
#   · el PADRE de la generalización arriba; cada hijo en su propia fila
#   · límite del sistema como recuadro que CONTIENE las elipses
#   · el caso heredado a la altura del padre; los especializados debajo,
#     cada uno a la altura de su actor  →  cero cruces y cero roces
# --------------------------------------------------------------------------
def cdu_hospital():
    els = []

    # --- actores en escalera: el PADRE arriba, los hijos en filas propias.
    #     La escalera es lo que le da a la asociación de cada hijo un carril
    #     libre: si los dos hijos comparten fila, la línea del lejano tiene
    #     que pasar por debajo del nombre del cercano.
    els += actor(160, 60, "Cliente")
    els += actor(280, 300, "Administrador\nHospitalización")
    els += actor(40, 460, "Administrador\nConsulta Externa")

    # --- límite del sistema
    els += caja(460, 40, 440, 600, "Sistema Hospitalario",
                fondo=FONDO_SISTEMA, grosor=2)

    # --- casos de uso: el heredado a la altura del padre, luego los especializados
    els += elipse(520, 100, 320, 90, "Despachar medicamentos\nen farmacia")
    els += elipse(520, 300, 320, 90, "Asignar camas")
    els += elipse(520, 500, 320, 90, "Asignar citas")

    # --- generalizaciones: hijo -> padre, triángulo hueco, padre ARRIBA
    els += linea(330, 300, 225, 196, punta="triangle_outline")
    els += linea(90, 460, 190, 196, punta="triangle_outline")

    # --- asociaciones actor-caso: SIN punta, y arrancan en la punta del brazo
    els += linea(244, 120, 537, 125)     # Cliente         -> Despachar medicamentos
    els += linea(364, 340, 524, 345)     # Adm. Hosp.      -> Asignar camas
    els += linea(124, 500, 537, 520)     # Adm. Cons. Ext. -> Asignar citas

    return els


DIAGRAMAS = {"cdu-hospital": cdu_hospital}


def main():
    if len(sys.argv) < 2 or sys.argv[1] not in DIAGRAMAS:
        print(__doc__)
        print("Disponibles:", ", ".join(DIAGRAMAS))
        return 1
    nombre = sys.argv[1]
    elementos = DIAGRAMAS[nombre]()

    ruta_ex = f"../02-Diagramas/{nombre}.excalidraw"
    with open(ruta_ex, "w", encoding="utf-8") as f:
        json.dump(envolver(elementos), f, ensure_ascii=False, indent=2)

    ruta_svg = f"../02-Diagramas/{nombre}.svg"
    with open(ruta_svg, "w", encoding="utf-8") as f:
        f.write(emitir_svg(elementos))

    print(f"{ruta_ex}   —  {len(elementos)} elementos (editable)")
    print(f"{ruta_svg}  —  vectorial, sin marca de agua")
    return 0


if __name__ == "__main__":
    sys.exit(main())
