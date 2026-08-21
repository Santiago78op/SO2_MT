#!/usr/bin/env python3
"""
generar-mdj.py — escribe proyectos StarUML (.mdj) con el layout ya resuelto.

POR QUE EXISTE
El MCP / API Server de StarUML tiene cuatro operaciones y NINGUNA posiciona
elementos. La unica entrada, `generate_diagram`, importa Mermaid y corre su
propio auto-layout: con un diagrama de contexto (un hub con 14 entidades y 27
flujos) el resultado es ilegible — etiquetas encimadas y 27 lineas convergiendo
en un punto. Medido: `flowchart LR` da 432x1504 px, `TD` da 1920x398, y las dos
fallan el checklist.

El formato nativo .mdj es JSON, y cada vista lleva `left/top/width/height` y
cada arista sus `points`. Escribirlo directo es la forma de aplicar las reglas
de estilo-diagramas.md DENTRO de StarUML.

USO
    python generar-mdj.py contexto-farmahosp
    -> ../02-Diagramas/contexto-farmahosp.mdj    (abrir con doble clic)

Esquema verificado contra un .mdj real generado por StarUML v7:
    Project
      FCFlowchart
        FCFlowchartDiagram   ownedViews: FCProcessView, FCConnectorView, FCFlowView
        FCProcess / FCConnector   (los elementos; cada FCFlow vive en su origen)
"""

import json
import sys

# --------------------------------------------------------------------------
# Convenciones de estilo (estilo-diagramas.md 2)
# --------------------------------------------------------------------------
FUENTE = "Arial;13;0"
ENT_W, ENT_H = 210, 64          # entidad externa
PROD = (420, 400, 400, 220)     # el producto: left, top, width, height

_n = [0]


def _id(pref="e"):
    _n[0] += 1
    return f"{pref}{_n[0]:04d}"


def _lbl(padre, texto, left, top, width, height, estilo_padre=True):
    return {
        "_type": "LabelView", "_id": _id("l"),
        "_parent": {"$ref": padre},
        "font": FUENTE, "parentStyle": estilo_padre,
        "left": left, "top": top, "width": width, "height": height,
        "text": texto, "wordWrap": True,
    }


def nodo(diag_id, fc_id, nombre, caja, connector=False):
    """Devuelve (elemento_modelo, vista) de una entidad o del producto."""
    x, y, w, h = caja
    el = {"_type": "FCConnector" if connector else "FCProcess",
          "_id": _id("m"), "_parent": {"$ref": fc_id},
          "name": nombre, "ownedElements": []}
    vid = _id("v")
    vista = {
        "_type": "FCConnectorView" if connector else "FCProcessView",
        "_id": vid, "_parent": {"$ref": diag_id},
        "model": {"$ref": el["_id"]},
        "font": FUENTE, "parentStyle": False,
        "left": x, "top": y, "width": w, "height": h,
    }
    lab = _lbl(vid, nombre, x + 10, int(y + h / 2 - 13), w - 20, 26)
    vista["subViews"] = [lab]
    vista["nameLabel"] = {"$ref": lab["_id"]}
    return el, vista


def flujo(diag_id, origen, destino, nombre, p1, p2, etiqueta_xy):
    """FCFlow + FCFlowView con puntos y etiqueta en posicion explicita.

    origen/destino son (elemento, vista). El FCFlow vive dentro del elemento
    origen, igual que lo hace StarUML.
    """
    el_o, v_o = origen
    el_d, v_d = destino
    fl = {"_type": "FCFlow", "_id": _id("f"), "_parent": {"$ref": el_o["_id"]},
          "name": nombre,
          "source": {"$ref": el_o["_id"]}, "target": {"$ref": el_d["_id"]}}
    el_o["ownedElements"].append(fl)

    vid = _id("v")
    lx, ly = etiqueta_xy
    lab = {"_type": "EdgeLabelView", "_id": _id("l"),
           "_parent": {"$ref": vid}, "model": {"$ref": fl["_id"]},
           "font": FUENTE, "parentStyle": False,
           "left": lx, "top": ly, "width": 190, "height": 26,
           "alpha": 1.5707963267948966, "distance": 22,
           "hostEdge": {"$ref": vid}, "edgePosition": 1,
           "text": nombre}
    vista = {"_type": "FCFlowView", "_id": vid, "_parent": {"$ref": diag_id},
             "model": {"$ref": fl["_id"]},
             "font": FUENTE, "parentStyle": False,
             "head": {"$ref": v_d["_id"]}, "tail": {"$ref": v_o["_id"]},
             "lineStyle": 3,
             "points": f"{p1[0]}:{p1[1]};{p2[0]}:{p2[1]}",
             "subViews": [lab], "nameLabel": {"$ref": lab["_id"]}}
    return vista


# --------------------------------------------------------------------------
# Diagrama de contexto de FarmaHosp
#
# Layout identico al que produce generar-excalidraw.py y que ya paso el
# checklist: producto al centro, entidades de negocio a izquierda y derecha,
# dispositivos y sistemas externos arriba y abajo, y la etiqueta de cada flujo
# pegada a SU entidad (no al centro) para que se sepa de cual es.
# --------------------------------------------------------------------------
#  nombre, caja, lado, flujo que ENTRA al sistema, flujo que SALE del sistema
ENTIDADES = [
    ("Medico tratante",                  (30, 200),  "izq",
     "Prescripcion medica", "Alertas de interaccion y disponibilidad"),
    ("Farmaceutico clinico",             (30, 330),  "izq",
     "Confirmacion de dispensacion", "Orden de dispensacion y etiqueta QR"),
    ("Enfermero de piso",                (30, 460),  "izq",
     "Registro de administracion", "Validacion paciente-medicamento"),
    ("Paciente",                         (30, 590),  "izq",
     "Consulta de trazabilidad QR", "Recordatorio de proxima dosis"),
    ("Director Administrativo",          (1010, 200), "der",
     "Autorizacion de orden de compra", "Tablero de costos y desperdicio"),
    ("Jefe de Farmacovigilancia",        (1010, 330), "der",
     "Dictamen de causalidad", "Alerta de patron de efectos adversos"),
    ("Proveedor de MAC",                 (1010, 460), "der",
     "Lote, vencimiento y factura", "Orden de compra"),
    ("Contraloria General de Cuentas",   (1010, 590), "der",
     "Solicitud de auditoria de lote", "Informe forense de trazabilidad"),
    ("Sensores IoT de camaras",          (300, 20),  "arr",
     "Lecturas de temperatura y humedad", None),
    ("Sistema legacy de admisiones",     (560, 20),  "arr",
     "Datos demograficos del paciente", "Consulta de identificacion"),
    ("Directorio activo LDAP",           (820, 20),  "arr",
     "Credenciales validadas", "Solicitud de autenticacion"),
    ("Sistema nacional de farmacovigilancia", (300, 880), "aba",
     "Alerta nacional de retiro de lote", "Reporte de efecto adverso XML/DTD"),
    ("Pasarela SMS / WhatsApp",          (560, 880), "aba",
     "Acuse de entrega del mensaje", "Mensaje de notificacion"),
    ("Operaciones de TI / data center",  (820, 880), "aba",
     "Parametros de operacion", "Metricas y alertas de operacion"),
]

PX, PY, PW, PH = PROD


def _anclas(lado, x, y):
    """Puntos de salida de la entidad y de llegada al producto, por banda.

    Se separan los dos sentidos 24 px para que las dos flechas del par no se
    superpongan, y la etiqueta de cada una queda del lado exterior de SU linea.
    """
    cx, cy = x + ENT_W / 2, y + ENT_H / 2
    if lado == "izq":
        return ((x + ENT_W, cy - 12), (PX, max(PY + 20, min(PY + PH - 20, cy - 12))),
                (PX, max(PY + 20, min(PY + PH - 20, cy + 12))), (x + ENT_W, cy + 12),
                (x + ENT_W + 14, cy - 54), (x + ENT_W + 14, cy + 30))
    if lado == "der":
        return ((x, cy - 12), (PX + PW, max(PY + 20, min(PY + PH - 20, cy - 12))),
                (PX + PW, max(PY + 20, min(PY + PH - 20, cy + 12))), (x, cy + 12),
                (x - 204, cy - 54), (x - 204, cy + 30))
    if lado == "arr":
        # las etiquetas van al tramo MEDIO de la linea vertical, apiladas.
        # Puestas junto a la caja caerian en el mismo carril horizontal que las
        # etiquetas de las bandas laterales, y se pisan.
        mid = (y + ENT_H + PY) / 2
        return ((cx - 12, y + ENT_H), (max(PX + 20, min(PX + PW - 20, cx - 12)), PY),
                (max(PX + 20, min(PX + PW - 20, cx + 12)), PY), (cx + 12, y + ENT_H),
                (cx - 95, mid), (cx - 95, mid + 34))
    mid = (PY + PH + y) / 2
    return ((cx - 12, y), (max(PX + 20, min(PX + PW - 20, cx - 12)), PY + PH),
            (max(PX + 20, min(PX + PW - 20, cx + 12)), PY + PH), (cx + 12, y),
            (cx - 95, mid - 34), (cx - 95, mid))


def contexto_farmahosp():
    fc_id, diag_id = _id("fc"), _id("d")

    prod = nodo(diag_id, fc_id,
                "Sistema Integral de Gestion de MAC - FarmaHosp",
                PROD, connector=True)

    elementos, vistas = [prod[0]], [prod[1]]

    for nombre, (x, y), lado, entra, sale in ENTIDADES:
        ent = nodo(diag_id, fc_id, nombre, (x, y, ENT_W, ENT_H))
        elementos.append(ent[0])
        vistas.append(ent[1])
        a1, a2, b1, b2, lab_e, lab_s = _anclas(lado, x, y)
        if entra:
            vistas.append(flujo(diag_id, ent, prod, entra, a1, a2, lab_e))
        if sale:
            vistas.append(flujo(diag_id, prod, ent, sale, b1, b2, lab_s))

    diagrama = {"_type": "FCFlowchartDiagram", "_id": diag_id,
                "_parent": {"$ref": fc_id},
                "name": "Diagrama de contexto - FarmaHosp",
                "ownedViews": vistas}

    flowchart = {"_type": "FCFlowchart", "_id": fc_id,
                 "_parent": {"$ref": "proj"},
                 "name": "Contexto FarmaHosp",
                 "ownedElements": [diagrama] + elementos}

    return {"_type": "Project", "_id": "proj",
            "name": "FarmaHosp - Caso de negocio",
            "ownedElements": [flowchart],
            "documentVersion": 2}


DIAGRAMAS = {"contexto-farmahosp": contexto_farmahosp}


def validar(doc):
    """Todo $ref tiene que resolver a un _id existente."""
    ids, refs = set(), []

    def rec(o):
        if isinstance(o, dict):
            if "_id" in o:
                ids.add(o["_id"])
            if set(o.keys()) == {"$ref"}:
                refs.append(o["$ref"])
            for v in o.values():
                rec(v)
        elif isinstance(o, list):
            for v in o:
                rec(v)

    rec(doc)
    huerfanos = sorted({r for r in refs if r not in ids})
    return len(ids), len(refs), huerfanos


def main():
    if len(sys.argv) < 2 or sys.argv[1] not in DIAGRAMAS:
        print(__doc__)
        print("Disponibles:", ", ".join(DIAGRAMAS))
        return 1
    nombre = sys.argv[1]
    doc = DIAGRAMAS[nombre]()
    n_ids, n_refs, huerfanos = validar(doc)
    if huerfanos:
        print("ERROR: referencias sin destino:", huerfanos)
        return 2
    salida = f"../02-Diagramas/{nombre}.mdj"
    with open(salida, "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, indent=2)
    print(f"{salida}")
    print(f"  {n_ids} elementos, {n_refs} referencias, 0 huerfanas")
    return 0


if __name__ == "__main__":
    sys.exit(main())
