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

Diagramas disponibles: cdu-hospital, contexto-centro-salud,
                      cdu-negocio-centro-salud
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


def entidad(x, y, w, h, nombre, tam=14):
    """Entidad o agente externo: rectangulo con el nombre centrado."""
    r = _base("rectangle", x, y, w, h, roundness={"type": 3})
    lineas = nombre.split("\n")
    ty = y + h / 2 - (tam * 1.25 * len(lineas)) / 2
    return [r, texto(nombre, x, int(ty), w, tam)]


def actor_negocio(x, y, nombre, tam=14):
    """Actor de NEGOCIO: monigote + barra diagonal + estereotipo textual.

    La barra diagonal sobre el hombro es el icono UML de actor de negocio;
    el estereotipo textual va arriba porque es el que siempre es valido.
    """
    cx = x + 50
    partes = [texto("\u00abactor de negocio\u00bb", x - 30, y - 24, 160, 11)]
    partes += actor(x, y, nombre, tam)
    # barra diagonal del icono de actor de negocio: al costado del torso,
    # NO sobre la cabeza (ahi se encimaria, y el paso 1 del checklist lo prohibe)
    partes.append(_base("line", cx - 38, y + 66, 26, -22,
                        points=[[0, 0], [26, -22]]))
    return partes


def elipse_negocio(x, y, w, h, etiqueta, tam=16):
    """Caso de uso de NEGOCIO: elipse + diagonal + estereotipo sobre el nombre."""
    e = _base("ellipse", x, y, w, h)
    lineas = etiqueta.split("\n")
    alto_total = 13 * 1.25 + tam * 1.25 * len(lineas)
    ty = y + h / 2 - alto_total / 2
    els = [e,
           texto("\u00abcaso de uso de negocio\u00bb", x, int(ty), w, 12),
           texto(etiqueta, x, int(ty + 17), w, tam)]
    # diagonal del icono de negocio, en la esquina inferior izquierda
    els.append(_base("line", x + w * 0.10, y + h * 0.80, 26, -20,
                     points=[[0, 0], [26, -20]]))
    return els


def linea(x1, y1, x2, y2, punta=None, punteada=False, etiqueta=None, off=(0, 0)):
    """Asociación o relación. punta: None | 'arrow' | 'triangle_outline'.

    off desplaza la etiqueta respecto del punto medio, para separar las
    etiquetas de dos flujos que corren casi paralelos.
    """
    els = [_base("arrow", x1, y1, x2 - x1, y2 - y1,
                 points=[[0, 0], [x2 - x1, y2 - y1]],
                 lastCommittedPoint=None,
                 startBinding=None, endBinding=None,
                 startArrowhead=None, endArrowhead=punta,
                 strokeStyle="dashed" if punteada else "solid",
                 elbowed=False)]
    if etiqueta:
        mx, my = (x1 + x2) / 2 + off[0], (y1 + y2) / 2 + off[1]
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
        # dos marcadores distintos: la generalizacion UML es un TRIANGULO HUECO,
        # un flujo o dependencia es una flecha comun. Usar el mismo para ambos
        # cambia la semantica del diagrama.
        '<defs>'
        '<marker id="gen" viewBox="0 0 12 12" refX="11" refY="6" '
        'markerWidth="12" markerHeight="12" orient="auto">'
        f'<polygon points="0,0 12,6 0,12" fill="#ffffff" stroke="{TRAZO}" '
        'stroke-width="1"/></marker>'
        '<marker id="flecha" viewBox="0 0 10 10" refX="9" refY="5" '
        'markerWidth="9" markerHeight="9" orient="auto">'
        f'<polygon points="0,0 10,5 0,10" fill="{TRAZO}"/></marker>'
        '</defs>',
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
            ah = e.get("endArrowhead")
            marca = {"triangle_outline": "gen", "arrow": "flecha"}.get(ah)
            punta = f' marker-end="url(#{marca})"' if marca else ""
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
                    f'font-size="{tam}" fill="{TRAZO}" text-anchor="middle" '
                    f'paint-order="stroke" stroke="#ffffff" stroke-width="4" '
                    f'stroke-linejoin="round">{esc}</text>')

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


# --------------------------------------------------------------------------
# BLOQUE 1.1 — Diagrama de contexto del NEGOCIO
#   Caso: Centro de Salud Publico (Guatemala)
#   Reglas (estilo-diagramas.md 8, BLOQUE 1.1):
#     · el negocio como CAJA NEGRA unica al centro, sin interior
#     · entidades de negocio a izquierda y derecha
#     · sistemas externos arriba y abajo  ->  sus flechas no cruzan las de las
#       personas
#     · toda flecha con nombre, en sustantivo; ida y vuelta = dos flechas
# --------------------------------------------------------------------------
def contexto_centro_salud():
    F = "arrow"          # todo streamline es direccional
    els = []

    # --- la caja negra: el negocio
    els += elipse(430, 340, 380, 200, "Centro de Salud\nP\u00fablico")

    # --- entidades de negocio: izquierda
    els += entidad(40, 180, 220, 70, "Paciente")
    els += entidad(40, 620, 220, 70, "Promotor de salud\ncomunitario")

    # --- entidades de negocio: derecha
    els += entidad(980, 160, 240, 70, "Direcci\u00f3n de \u00c1rea\nde Salud (MSPAS)")
    els += entidad(980, 400, 240, 70, "Hospital nacional\nde referencia")
    els += entidad(980, 640, 240, 70, "Almac\u00e9n de insumos\ny medicamentos")

    # --- sistemas externos: arriba y abajo
    els += entidad(510, 40, 220, 70, "RENAP")
    els += entidad(510, 780, 220, 70, "SIGSA")

    # --- streamlines desde y hacia el paciente
    els += linea(262, 200, 452, 372, punta=F, etiqueta="Solicitud de cita",
                 off=(-30, -28))
    els += linea(444, 400, 262, 232, punta=F, etiqueta="Cita confirmada",
                 off=(30, 50))

    # --- promotor comunitario
    els += linea(262, 668, 452, 508, punta=F, etiqueta="Censo comunitario",
                 off=(-30, 46))
    els += linea(446, 478, 262, 638, punta=F, etiqueta="Calendario de jornadas",
                 off=(30, -26))

    # --- Direccion de Area de Salud
    els += linea(978, 180, 792, 368, punta=F, etiqueta="Norma de atenci\u00f3n")
    els += linea(800, 396, 978, 212, punta=F, etiqueta="Reporte de morbilidad",
                 off=(-30, 50))

    # --- Hospital nacional de referencia
    els += linea(808, 424, 978, 424, punta=F, etiqueta="Referencia de paciente", off=(0, -6))
    els += linea(978, 452, 808, 452, punta=F, etiqueta="Contrarreferencia", off=(0, 30))

    # --- Almacen de insumos
    els += linea(796, 508, 978, 660, punta=F, etiqueta="Requisici\u00f3n de insumos")
    els += linea(978, 692, 790, 528, punta=F, etiqueta="Despacho de insumos",
                 off=(-30, 48))

    # --- sistemas externos (arriba y abajo): las etiquetas se separan en X
    #     porque las dos lineas corren casi verticales y a 80 px una de otra
    els += linea(596, 112, 566, 348, punta=F, etiqueta="Validaci\u00f3n de CUI",
                 off=(-118, 0))
    els += linea(650, 344, 674, 112, punta=F, etiqueta="Consulta de identidad",
                 off=(126, 0))
    els += linea(620, 540, 620, 776, punta=F, etiqueta="Registro diario\nde consultas")

    return els


# --------------------------------------------------------------------------
# BLOQUE 1.2 — CDU de alto nivel: el CORE del negocio
#   Reglas (estilo-diagramas.md 8, BLOQUE 1.2):
#     · estereotipos DE NEGOCIO en todos los elementos
#     · solo casos primarios: los servicios esenciales que recibe el cliente
#     · actor principal del lado de lectura (izquierda); secundarios del opuesto
#     · casos ordenados por IMPORTANCIA, de arriba abajo
#     · el recuadro del negocio contiene los casos; los actores quedan fuera
# --------------------------------------------------------------------------
def cdu_negocio_centro_salud():
    els = []

    # --- frontera del negocio
    els += caja(420, 40, 460, 640, "Centro de Salud P\u00fablico",
                fondo=FONDO_SISTEMA, grosor=2)

    # --- casos de uso de negocio, ordenados por importancia
    els += elipse_negocio(460, 120, 380, 100, "Atender consulta m\u00e9dica")
    els += elipse_negocio(460, 300, 380, 100, "Aplicar esquema\nde vacunaci\u00f3n")
    els += elipse_negocio(460, 500, 380, 100, "Referir paciente a\nhospital nacional")

    # --- actor principal (izquierda) y secundario (derecha)
    els += actor_negocio(60, 300, "Paciente")
    els += actor_negocio(1000, 480, "Hospital nacional\nde referencia")

    # --- asociaciones: SIN punta de flecha
    els += linea(146, 320, 470, 182)
    els += linea(146, 360, 462, 350)
    els += linea(146, 396, 472, 528)
    els += linea(996, 520, 838, 548)

    return els


# --------------------------------------------------------------------------
# PASO 3 del Caso 1 — CDU de alto nivel: el CORE del negocio de FarmaHosp
#
# Molde de la catedra, verificado en sus 4 casos (estilo-diagramas.md 8, 1.2):
#   · UNA sola elipse, que nombra el negocio COMPLETO (la frontera del paso 0)
#   · todos los actores alrededor, en circulo
#   · lineas SIN punta (comunicacion en los dos sentidos)
#   · estereotipos de negocio: las barras diagonales
#
# Quien es actor sale de la frontera declarada en la Entrega (seccion 0):
# el personal clinico es TRABAJADOR (no se dibuja); los actores son quienes
# interactuan desde afuera del ciclo de vida del MAC.
# --------------------------------------------------------------------------
def cdu_core_farmahosp():
    els = []

    # --- el negocio completo, sin abrir: UNA elipse
    els += elipse_negocio(380, 250, 380, 170,
                          "Gestión del Ciclo de Vida del\nMedicamento de Alto Costo (MAC)")

    # --- los actores, en circulo
    els += actor_negocio(60, 300, "Paciente")
    els += actor_negocio(180, 60, "Proveedor de MAC")
    els += actor_negocio(880, 60, "MSPAS")
    els += actor_negocio(1000, 300, "Contraloría General\nde Cuentas")
    els += actor_negocio(510, 580, "Sistema legacy\nde admisiones")

    # --- asociaciones SIN punta (los 4 cores de la catedra van asi)
    els += linea(168, 340, 384, 336)      # Paciente
    els += linea(268, 172, 452, 280)      # Proveedor de MAC
    els += linea(908, 172, 692, 280)      # MSPAS
    els += linea(996, 340, 756, 336)      # Contraloria
    els += linea(562, 576, 568, 422)      # Legacy de admisiones

    return els


# --------------------------------------------------------------------------
# PASO 4 del Caso 1 — Primera descomposicion: los procesos del negocio
#
# Molde de la catedra (Tienda Electronica / Fabrica): UN solo diagrama,
# los CUN en COLUMNA al centro, los MISMOS actores del core a los lados.
# Nombres como sustantivo derivado de verbo ("Prescripcion del tratamiento").
# Los 6 primeros procesos son las 6 etapas del ciclo de vida del enunciado;
# el 7o es la categoria GERENCIAL de la nota tecnica (control y auditoria).
# Almacenamiento va sin actor: es la excepcion de CU de apoyo de los convenios.
# --------------------------------------------------------------------------
def cdu_descomposicion_farmahosp():
    els = []
    EX, EW, EH, PASO = 430, 340, 90, 130

    nombres = [
        "Adquisición de MAC",
        "Almacenamiento y\nconservaci\u00f3n de MAC",
        "Prescripción del tratamiento",
        "Dispensación del MAC",
        "Administraci\u00f3n del MAC\nal paciente",
        "Seguimiento y\nfarmacovigilancia",
        "Control y auditor\u00eda de\nla gesti\u00f3n de MAC",
    ]
    ys = [60 + i * PASO for i in range(7)]
    for n, y in zip(nombres, ys):
        els += elipse_negocio(EX, y, EW, EH, n, tam=14)

    # categorias de la NT, como rotulos de zona a la izquierda de la columna
    els.append(texto("SOPORTE", 330, ys[0] + 100, 80, 12))
    els.append(texto("NÚCLEO", 330, ys[3] + 40, 80, 12))
    els.append(texto("GERENCIAL", 320, ys[6] + 35, 100, 12))

    # actores: el mismo juego del core, a los lados
    els += actor_negocio(120, 60, "Proveedor de MAC")
    els += actor_negocio(120, 470, "Paciente")
    els += actor_negocio(950, 300, "Sistema legacy\nde admisiones")
    els += actor_negocio(950, 690, "MSPAS")
    els += actor_negocio(950, 850, "Contralor\u00eda General\nde Cuentas")

    # asociaciones SIN punta
    els += linea(226, 105, 432, 105)          # Proveedor  - Adquisicion
    els += linea(226, 500, 436, 380)          # Paciente   - Prescripcion
    els += linea(226, 515, 434, 495)          # Paciente   - Dispensacion
    els += linea(226, 530, 434, 630)          # Paciente   - Administracion
    els += linea(226, 545, 438, 755)          # Paciente   - Seguimiento
    els += linea(946, 345, 768, 372)          # Legacy     - Prescripcion
    els += linea(946, 735, 772, 758)          # MSPAS      - Seguimiento
    els += linea(946, 895, 772, 895)          # Contraloria- Control y auditoria

    return els


# --------------------------------------------------------------------------
# PASO 5 del Caso 1 — CDU expandido del proceso Prescripcion (plano del SISTEMA)
#
# Cambia el plano: actores y elipses SIN estereotipo de negocio, y el recuadro
# es el sistema. Molde de la catedra ("Procesamiento de Pedido" expandido):
#   · include con flecha punteada BASE -> INCLUIDO
#   · extend con flecha punteada EXTENSION -> BASE, con su condicion
#   · generalizacion de actores: el padre con el CU compartido, cada hijo
#     con el suyo (el patron del Hospital de la catedra)
# --------------------------------------------------------------------------
def cdu_expandido_prescripcion():
    els = []

    els += caja(400, 40, 880, 820, "FarmaHosp — Prescripción",
                fondo=FONDO_SISTEMA, grosor=2)

    # CU base
    els += elipse(440, 180, 280, 90, "Prescribir MAC", tam=15)

    # incluidos (columna derecha): los 4 que el enunciado exige al prescribir
    els += elipse(920, 70, 330, 80, "Validar protocolo clínico", tam=13)
    els += elipse(920, 180, 330, 80, "Verificar interacciones\nmedicamentosas", tam=13)
    els += elipse(920, 290, 330, 80, "Verificar contraindicaciones\ny alergias", tam=13)
    els += elipse(920, 400, 330, 80, "Consultar inventario\nen tiempo real", tam=13)

    # extension: solo ocurre si no hay stock
    els += elipse(440, 440, 310, 90, "Solicitar compra urgente\no reemplazo terapéutico", tam=13)

    # CU propio del medico de urgencias (ABAC del acuerdo de calidad 4)
    els += elipse(440, 650, 330, 90, "Acceder a diagnóstico sensible\ncon justificación auditada", tam=13)

    # --- actores del SISTEMA (sin estereotipo de negocio), en escalera
    els += actor(140, 110, "Médico")
    els += actor(250, 340, "Médico tratante")
    els += actor(70, 540, "Médico de\nurgencias")

    # generalizacion: hijo -> padre, triangulo hueco, padre ARRIBA
    els += linea(296, 344, 208, 240, punta="triangle_outline")
    els += linea(124, 540, 176, 244, punta="triangle_outline")

    # asociaciones (sin punta): padre con el CU compartido; cada hijo el suyo
    els += linea(244, 152, 442, 222)
    els += linea(336, 382, 442, 478)
    els += linea(156, 582, 442, 692)

    # include: BASE -> incluido, punteada
    els += linea(716, 200, 918, 110, punta="arrow", punteada=True,
                 etiqueta="«include»", off=(30, -18))
    els += linea(720, 220, 918, 220, punta="arrow", punteada=True,
                 etiqueta="«include»", off=(20, -14))
    els += linea(716, 244, 918, 330, punta="arrow", punteada=True,
                 etiqueta="«include»", off=(46, 8))
    els += linea(704, 260, 918, 438, punta="arrow", punteada=True,
                 etiqueta="«include»", off=(66, 36))

    # extend: EXTENSION -> BASE, punteada, con la condicion
    els += linea(590, 438, 578, 274, punta="arrow", punteada=True,
                 etiqueta="«extend»\n[sin stock]", off=(74, 10))

    return els


DIAGRAMAS = {
    "cdu-hospital": cdu_hospital,
    "contexto-centro-salud": contexto_centro_salud,
    "cdu-negocio-centro-salud": cdu_negocio_centro_salud,
    "cdu-core-farmahosp": cdu_core_farmahosp,
    "cdu-descomposicion-farmahosp": cdu_descomposicion_farmahosp,
    "cdu-expandido-prescripcion": cdu_expandido_prescripcion,
}


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
