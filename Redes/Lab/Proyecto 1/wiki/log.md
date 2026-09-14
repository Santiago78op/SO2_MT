# Bitácora del cerebro `redes`

## [2026-09-07] ingest | Creación del cerebro y carga del Proyecto 1 "SmartCity Tech Park"
Se convirtió `0972_Proyecto_1_2S2026.pdf` (11 páginas) con markitdown + pdfplumber. Se crearon el MOC, 6 notas del proyecto y 6 notas de conceptos de Capa 2. Hallazgo: el PDF está incompleto (faltan §8.2 y §8.3; §6 vacía).

## [2026-09-07] lint | Verificación de integridad del PDF
Se comprobó página por página: índice corrido una página; §8.2/§8.3 solo existen en el índice. Copia portable del análisis en `Proyecto 1/cerebro/analisis-enunciado.md` (repo del curso, fuera de git).

## [2026-09-07] lint | Mudanza al repo
El cerebro se movió de `C:/mcp/brains/personal/redes` a `Proyecto 1/wiki/` (versionado; `brains.json` re-apuntado). Se sumaron `CONTEXTO-CLAUDE.md` (importado por el stub `CLAUDE.md`) y `analisis-enunciado.md`.

## [2026-09-07] ingest | Convención Marco Teórico / Marco Práctico
El Manual se redacta en dos marcos, como la Práctica 1: teoría (notas de `02 - Conceptos Capa 2/`) y práctica (implementación con evidencia). Registrado en `CONTEXTO-CLAUDE.md` y `Entregables y checklist`.

## [2026-09-07] ingest | Estructura de entregables
Se crearon `README.md` (plantilla del Manual en dos marcos, 29 secciones), `capturas/` (4 subcarpetas + EVIDENCIAS.md), `configs/` y `diagrama/` con sus README. El árbol quedó en `CONTEXTO-CLAUDE.md`.

## [2026-09-07] ingest | Teoria contrastada con la documentacion Cisco del enunciado
Se consultaron los 4 enlaces oficiales de §5 (VLAN Trunks, VTP 10558, STP 2960, EtherChannel 2960) y se enriquecieron las notas con citas y numeros verificados: costos STP por velocidad, prioridad 32768 / extended system ID, temporizadores 2/15/20 s y ~50 s de convergencia, priority multiplo de 4096 y root primary = 24576, tabla DTP, limite de 8 puertos y 6 canales, balanceo por flujo. Dos correcciones: la nativa desalineada **puede provocar bucles** (no solo un aviso de CDP), y PVST no es 'el modo por defecto' sino el que se selecciona con `spanning-tree mode pvst`.

## [2026-09-07] ingest | Modo clase guiada paso a paso
Se creo el slash command de proyecto `/paso` (`.claude/commands/paso.md`, versionado), el `PROTOCOLO-CATEDRA.md` (metodo de 4 etapas + secuencia de 11 pasos) y `AVANCE.md` (estado del progreso, fuente de verdad). Hallazgo: `.claude/` estaba entero en `.git/info/exclude`, lo que habria impedido que el comando viajara al remoto; se estrecho a `.claude/settings.local.json`.

## [2026-09-07] lint | Refresco del cerebro y contexto sin pasos manuales
Se reviso el cerebro completo (20 notas). El MOC lista ahora `CONTEXTO-CLAUDE`, `analisis-enunciado`, `log` y `README`, y declara el conteo. Se reconcilio la doble vista del trabajo: `Plan de trabajo` es el calendario (8 fases con fecha) y `PROTOCOLO-CATEDRA` la secuencia didactica (11 pasos), con tabla de correspondencia entre ambas. Se corrigieron las referencias obsoletas a `C:/mcp/brains/personal/redes` y al conteo de 16 notas en `analisis-enunciado` §13 y en `AVANCE`. El Glosario sumo DTP, Bridge ID, port-channel, PortFast, storm-control y port-security. Cambio de fondo: el patron `CLAUDE.md` del `.git/info/exclude` se anclo a la raiz (`/CLAUDE.md`), asi `Proyecto 1/CLAUDE.md` quedo versionado y en otra maquina ya no hay que crearlo a mano: clonar y `/paso`.

## [2026-09-14] ingest | Plantilla del Manual cerrada, figuras nombradas y secuencia recomprimida a 9 lecciones
Se estimó el trabajo restante con la entrega a 3 días (≈16-21 h efectivas) y se reagruparon los **11 pasos en 9 lecciones**, cada una elegida para cerrar secciones completas del Manual en vez de dejarlas a medias; la correspondencia quedó al final de `PROTOCOLO-CATEDRA`. La plantilla del Manual pasó de 382 a 600 líneas: índice de figuras y evidencias, mapa de lecciones, esqueleto de §9 (superficie de ataque + tabla medida/comando/qué mitiga/qué NO), tablas *requisito → solución → justificación* en las cuatro áreas de §12, y §24 convertida en **reporte de pruebas** (ficha por prueba con resultado **obtenido**, tolerancia a fallos con tiempo de convergencia medido contra los 30-50 s teóricos de PVST+, y resumen). Se decidió hacer el apoyo visual del Marco Teórico en **Excalidraw**: 19 figuras nombradas y ya referenciadas en su sección, cada una con su especificación de dibujo en un comentario HTML, más 14 evidencias y 4 del laboratorio. `diagrama/README.md` se reescribió con el flujo de exportación (SVG con *embed scene*), la convención de nombres, la tabla de estilo y la marca de cuáles son esenciales; `capturas/EVIDENCIAS.md` se reindexó con las series F/E/L. Decisión con su porqué: F13, F18 y F19 se dibujan **después** de configurar, porque describen la red real y si se dibujan antes contradicen las evidencias E3 y E4. Hallazgo del replan: el calendario original de `Plan de trabajo` (una fase por día del 7 al 17) **no se ejecutó** —entre el 7 y el 13 se trabajó el material, nada en Packet Tracer—, así que las fases se replanificaron a los 3 días reales y el desfase quedó anotado a la vista. La duda 3 (fecha del laboratorio) pasó a urgente: la §25 depende de ella.
