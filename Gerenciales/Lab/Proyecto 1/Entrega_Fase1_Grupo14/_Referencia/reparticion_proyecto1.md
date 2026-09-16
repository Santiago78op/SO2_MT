# Repartición — Proyecto 1, Fase 1 (Grupo 14)

Alcance de este documento: **solo la Fase 1**, que se entrega el **19 de septiembre de 2026**. Las fases 2 y 3 se planifican cuando toque.

**Plantilla del informe:** `informe_proyecto1_PLANTILLA.docx`, en esta misma carpeta. 27 páginas, 17 secciones, las tablas con las columnas exactas de la rúbrica, la página de premisa del caso RutaMoto, y bajo cada título una franja gris que dice a qué rol le corresponde.

**La documentación es de los cuatro.** Cada rol redacta sus propias secciones. El rol 1 no escribe por los demás: responde por que el archivo quede armado, con formato y empaquetado, que es lo que la rúbrica mide aparte como *Cumplimiento de Entregables*.

**Mensajes para el grupo:** `mensajes_whatsapp.md`, listos para copiar y pegar.

---

## El criterio: un bloque de rúbrica por persona

Los 100 puntos de la Fase 1 se reparten así:

| Área | Criterio | Puntos |
|---|---|---|
| Habilidades (40) | Informe ejecutivo — redacción, análisis, justificación | 10 |
| | Presentación oral | 15 |
| | Cumplimiento de entregables — formato y empaquetado | 15 |
| Conocimientos (60) | Identificación y postulación del proyecto | 15 |
| | Infraestructura ERP | 15 |
| | Infraestructura CRM | 15 |
| | Medición de logros y KPIs | 15 |

Los 60 puntos de Conocimientos son **cuatro bloques de 15**. Siendo cuatro personas, cada quien es dueño de uno. Los 25 puntos de forma del documento (informe + entregables) quedan con el rol 1, que es quien arma y cierra el archivo.

La presentación oral, 15 puntos, es de los cuatro.

## Los cuatro roles

| # | Rol | Bloque de rúbrica que responde | Secciones del Word | Nº |
|---|---|---|---|---|
| 1 | Estrategia y consolidación del informe | Informe (10) + Entregables (15) | 1, 2, 3, 4, 5, 6.1–6.4, 7.3, 15, 16 | 12 |

**Rol 1 ya asignado: Santiago Julián Barrera Reyes (201905884).** Los otros tres salen del sorteo.
| 2 | Postulación, beneficiarios y medición | Postulación (15) + Medición y KPIs (15) | 6.5–6.8, 7.1, 7.2, 8, 11, 12, 13 | 10 |
| 3 | Infraestructura ERP | Infraestructura ERP (15) | 9.1, 9.2.1, 9.2.3, 10.1, 14.1 | 5 |
| 4 | Infraestructura CRM | Infraestructura CRM (15) | 9.2.2, 9.2.3, 9.3, 10.2, 14.2 | 5 |

La sección 9.2.3 (justificación de la selección) la escriben el 3 y el 4 juntos: la decisión es conjunta porque el ERP y el CRM tienen que poder hablarse.

### Por qué el reparto es tan disparejo a propósito

El rol 1 tiene doce secciones y el 3 tiene cinco. No es un error: es la respuesta a que **quedan tres días** y a que los roles 3 y 4 son la ruta crítica.

Ellos dos no solo escriben: tienen que **instalar Odoo de verdad, capturar cada paso y grabar el video**. Eso no se puede hacer a última hora ni delegarse. Todo lo que se les pueda quitar de escritura, se les quita.

Por eso:

- **Los ocho planes de la sección 6 se movieron enteros a los roles 1 y 2** — cuatro y cuatro. Antes el 3 y el 4 tenían uno cada uno; ya no tienen ninguno.
- **Las tablas que sí les tocan vienen precargadas** en la plantilla: presupuesto, módulos del ERP y del CRM, resumen del catálogo. Solo las ajustan.
- Lo que les queda es exactamente su bloque de 15 puntos: comparar, decidir, instalar y documentar.

Las secciones del rol 1, en cambio, son casi todas texto corto (introducción, objetivos, alcance, conclusiones). Doce secciones suyas pesan menos que cinco de las del rol 3.

## Lo que se entrega el 19

| # | Entregable | Formato | Responsable |
|---|---|---|---|
| 1 | El informe completo | **PDF**, no Word | Rol 1 |
| 2 | Mapa de flujo de procesos, como archivo aparte | PNG o JPG | Rol 2 |
| 3 | Video de instalación del ERP | Enlace de Google Drive | Rol 3 |
| 4 | Video de instalación del CRM | Enlace de Google Drive | Rol 4 |
| 5 | Todo lo anterior comprimido | ZIP | Rol 1 |
| 6 | Presentación oral ante el catedrático | Exposición | Los cuatro |

## Requisitos previos a la calificación

Estos no son rúbrica: son condiciones. Si alguna falla, la nota es cero sin importar el resto.

- El ERP y el CRM deben salir de las **listas permitidas**. ERP: Odoo, ERPNext o Dolibarr. CRM: Zoho CRM, Odoo CRM, SuiteCRM o HubSpot CRM.
- Los **manuales de instalación con capturas** tienen que estar completos.
- El equipo debe **presentarse** a la evaluación técnica.
- La entrega debe incluir todos los archivos de la fase, comprimidos.

## Decisiones ya tomadas

Están desarrolladas en `concepto_empresa.md`.

1. **La empresa:** RutaMoto — tienda en línea de repuestos y accesorios para motocicleta, área metropolitana de Guatemala. Catálogo de 36 productos en 6 categorías, ya definido.
2. **El stack:** Odoo Community para ERP y CRM, PostgreSQL, sitio con el módulo eCommerce de Odoo, Power BI para los reportes.
3. **Dónde se instala: local.** El enunciado lo permite (*"local o en la nube"*) y lo que se califica es el manual con capturas, no dónde vive el servidor. Cuesta cero y no gasta los tres días en DNS y certificados.

Como Odoo cubre ERP y CRM en una sola instalación, los roles 3 y 4 comparten ambiente pero documentan cosas distintas: el 3 instala Odoo y PostgreSQL, el 4 activa y configura el módulo CRM. Cada quien escribe su propio manual.

**Mitigación obligatoria del ambiente local:** respaldo semanal de la base con el exportador de Odoo, subido a Drive, y al menos dos personas capaces de restaurarlo. Si todo vive en una sola laptop, esa laptop es punto único de falla de las tres fases.

## Riesgo abierto

Quedan **tres días** y los roles 3 y 4 no pueden escribir sus secciones hasta tener los sistemas instalados y capturados. Esa es la ruta crítica de la fase: si la instalación se atrasa, se pierden 30 de los 60 puntos de Conocimientos más los manuales obligatorios.

El enunciado dice que la entrega va *"en el formato y la estructura comprimida solicitada"* pero **nunca especifica cuál es esa estructura**: no da nombre de archivo, ni carpetas, ni convención de nombrado. Como "Cumplimiento de entregables" vale 15 puntos, conviene preguntarlo en el foro de UEDI antes del 19.

---

## Indicaciones para todos

- Trabajar directamente sobre la plantilla, con contenido final redactado, no apuntes.
- Borrar el texto gris en cursiva antes de entregar: es instrucción, no contenido.
- **Las capturas se toman mientras se ejecuta el paso, no después.** Una vez que el sistema quedó configurado, reproducir el estado anterior cuesta más que haberlo capturado en el momento.
- No cambiar por cuenta propia el nombre de la empresa, el producto, los objetivos ni los KPIs una vez acordados.
- Los números deben cuadrar entre secciones: el presupuesto del rol 4, los KPIs del rol 2 y los objetivos del rol 1 tienen que contar la misma historia.
- Todos deben poder explicar el proyecto completo en la presentación, no solo su parte.

---

_Repartición Fase 1 — Proyecto 1, Sistemas Organizacionales y Gerenciales 1, 2S 2026._
