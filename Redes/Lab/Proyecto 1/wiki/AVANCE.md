---
tags: [redes/proyecto, proyecto1, estado, bitacora]
aliases: ["avance", "estado", "dónde quedamos", "progreso", "bitácora del proyecto"]
leccion_actual: 1
actualizado: 2026-09-14
---

# Avance del Proyecto 1 — estado actual

> **Este archivo es la fuente de verdad del progreso.** `/paso` lo lee al arrancar y lo actualiza al
> cerrar cada lección. Si trabajás en otra máquina, esto es lo que te dice dónde quedaste.
> Método y secuencia completa: [[PROTOCOLO-CATEDRA]].

## Estado

| Dato | Valor |
|---|---|
| **Lección actual** | **1 — Dominios de colisión y broadcast · Medios** 🟡 **en curso: teoría dada, esperando las 3 respuestas** |
| Lecciones completadas | 0 de 9 |
| Última sesión | 2026-09-14 — plantilla del Manual terminada; se dictó la teoría de la lección 1 |
| **Días hasta la entrega** | **3** (hoy 14/09; entrega 17/09/2026) |
| Implementado en Packet Tracer | **nada todavía** |

## Tablero de lecciones

| # | Lección | Cierra | Estado | Cerrada el |
|---|---|---|---|---|
| 1 | Dominios de colisión y broadcast · Medios | §2, §3, §8 + borradores | 🟡 en curso | |
| 2 | Topología jerárquica y Capa 1 en Packet Tracer | §1, §11, §12, §20 | ⬜ pendiente | |
| 3 | VLANs y enlaces troncales 802.1Q | §4, §13, §14, §16 | ⬜ pendiente | |
| 4 | VTP: Server, Client y Transparent | §5, §17 | ⬜ pendiente | |
| 5 | STP/PVST+ y EtherChannel LACP | §6, §7, §18, §19 | ⬜ pendiente | |
| 6 | Seguridad de Capa 2 y segmento Legacy | §9, §21, §22, §15 | ⬜ pendiente | |
| 7 | Verificación, pruebas y evidencia | §23, §24, §27 | ⬜ pendiente | |
| 8 | Cierre: presupuesto, conclusiones y referencias | §26, §28, §29 | ⬜ pendiente | |
| 9 | Parte física en laboratorio | §25 | ⬜ pendiente | |

Leyenda: ⬜ pendiente · 🟡 en curso · ✅ cerrada

**Plan de los tres días:** lecciones 1-3 el 14/09 (≈6.5 h) · 4-6 el 15/09 (≈5 h) · 7-8 el 16/09
(≈4.5 h). La 9 entra cuando haya fecha de laboratorio.

## Figuras y evidencias

El Manual usa dos series numeradas, ya referenciadas en su lugar dentro de `README.md`:

| Serie | Qué es | Cuántas | Dónde vive | Índice |
|---|---|---|---|---|
| **F1–F19** | Figuras: 14 diagramas de **Excalidraw** + 5 vistas de Packet Tracer | 19 | `diagrama/*.svg` y `capturas/topologia|areas/` | inicio de `README.md` y `diagrama/README.md` |
| **E1–E14** | Evidencias: salidas de `show`, pings y pruebas de falla | 14 | `capturas/evidencias/` | `capturas/EVIDENCIAS.md` |
| **L1–L4** | Laboratorio: fotos y salidas de los switches reales | 4 | `capturas/laboratorio/` | `capturas/EVIDENCIAS.md` |

Cada `![]()` del Manual trae un comentario `<!-- EXCALIDRAW Fn: … -->` con la descripción de qué
dibujar, así que la figura no hay que diseñarla desde cero. **12 son esenciales**; F10 y F11 están
marcadas como opcionales en `diagrama/README.md` y son las primeras que se sacrifican si falta tiempo.

| Dibujadas | Capturas tomadas | Evidencias completas |
|---|---|---|
| 0 de 14 | 0 de 5 | 0 de 14 |

## Decisiones tomadas (con su justificación)

<!-- Al cerrar cada lección, agregar aquí las decisiones con su porqué. Este es el borrador literal de
las justificaciones del Manual, así que escribirlas completas, no en clave. -->

| # | Decisión | Justificación | Lección | Sección del Manual |
|---|---|---|---|---|
| 1 | El Manual se entrega como `Proyecto 1/README.md`, no como un `ManualTecnico.md` aparte | El enunciado §4.5 fija esa ruta; un segundo archivo se desincroniza y no es el que se califica | — | — |
| 2 | Las figuras teóricas se hacen en Excalidraw y se exportan a **SVG** | Vectorial: se ve nítido en GitHub y al imprimir, y el `.svg` con *embed scene* sigue siendo editable | — | Parte I |
| 3 | F13, F18 y F19 se dibujan después de configurar | Describen la red real; si se dibujan antes, contradicen las evidencias E3 y E4 | — | §11, §16, §18 |
| — | *(las decisiones de diseño de red empiezan en la lección 1)* | | | |

## Dudas abiertas para el tutor

| # | Duda | Estado |
|---|---|---|
| 1 | El PDF del enunciado no incluye §8.2 *Detalle de la Calificación* ni §8.3 (solo aparecen en el índice); §6 *Metodología* está vacía. Pedir la versión completa. | ⬜ sin preguntar |
| 2 | Los nombres de VLAN: la tabla escribe `Gerencia`, el ejemplo dice "exactamente GERENCIA". ¿Mayúsculas obligatorias? | ⬜ sin preguntar |
| 3 | Fecha del laboratorio de la parte física y confirmación de la pareja. **Urgente**: quedan 3 días y la §25 depende de esto. | ⬜ sin preguntar |

Detalle completo de las diez ambigüedades detectadas: [[Ambigüedades y riesgos del enunciado]].

## Bitácora de sesiones

### 2026-09-14 — Lección 1: teoría dictada
- Se dio la **teoría de la lección 1**: dominio de colisión (Capa 1, CSMA/CD, half vs. full duplex,
  hub = 1 dominio / switch = 1 por puerto activo), dominio de broadcast (Capa 2, `FF:FF:FF:FF:FF:FF`,
  lo frenan router y VLAN), la asimetría que sostiene el proyecto —**el switch parte colisión pero no
  broadcast, por eso hacen falta VLANs**—, el impacto del hub Legacy con lo que la contención sí y no
  resuelve, y los cuatro criterios de medio con el límite duro de 100 m del cobre.
- **Pendiente para retomar:** las 3 preguntas de comprensión sin responder (conteo de dominios en un
  switch con hub, dominios de broadcast del Edificio Corporativo, elección de medio a 180 m y a 40 m).
  Al contestarlas sigue la práctica: inventario por área, conteo previsto de dominios y las figuras
  **F1, F2, F3, F10**.

### 2026-09-14 — Plantilla cerrada, figuras nombradas, secuencia recomprimida
- Se estimó el trabajo restante: **≈16-21 h efectivas** en los 3 días que quedan (teoría 3 h,
  topología 3 h, configuración 3 h, figuras 2.5 h, pruebas 2 h, redacción 5-6 h).
- Los **11 pasos se reagruparon en 9 lecciones**, cada una elegida para cerrar secciones completas
  del Manual en vez de dejarlas a medias. Correspondencia en [[PROTOCOLO-CATEDRA]].
- Se completó la plantilla del Manual (382 → 600 líneas): índice de figuras y evidencias, mapa de
  lecciones, esqueleto de §9, tablas *requisito → solución → justificación* en las cuatro áreas de
  §12, y §24 convertida en **reporte de pruebas** (ficha por prueba con resultado obtenido, pruebas
  de tolerancia a fallos con tiempo de convergencia, resumen).
- Se decidió hacer las figuras del Marco Teórico en **Excalidraw**: 19 figuras nombradas y ya
  referenciadas en el Manual, cada una con su especificación de dibujo en un comentario HTML.
  `diagrama/README.md` tiene el flujo de exportación, la convención de nombres, la tabla de estilo
  (fibra naranja, cobre azul, bloqueado punteado rojo, un color por VLAN) y marca cuáles son
  esenciales. `capturas/EVIDENCIAS.md` se reindexó con las series F/E/L.
- **Nada implementado aún en Packet Tracer.**

### 2026-09-07 — Montaje
- Se analizó el enunciado (`analisis-enunciado.md`) y se detectó que el PDF está incompleto.
- Se creó el cerebro del proyecto en `Proyecto 1/wiki/` (20 notas, versionadas) y se contrastó la
  teoría de Capa 2 con los cuatro enlaces oficiales del §5 del enunciado, corrigiendo dos puntos: una
  VLAN nativa desalineada **puede producir bucles de STP** (no es solo un aviso de CDP) y PVST no es
  «el modo por defecto», sino el que se selecciona con `spanning-tree mode pvst`.
- Se creó la estructura de entregables: plantilla del Manual en dos marcos (§1–9 teórico, §10–29
  práctico), `capturas/` con cuatro subcarpetas e índice, `configs/` y `diagrama/`.
- Se definió el modo de trabajo paso a paso: [[PROTOCOLO-CATEDRA]] + comando `/paso`.
- Se hizo portable el contexto: `Proyecto 1/CLAUDE.md` y `.claude/commands/paso.md` quedaron
  **versionados**, así que en otra máquina basta clonar y escribir `/paso`, sin copiar archivos.

<!-- Agregar una entrada por sesión: qué se explicó, qué se implementó, qué quedó pendiente. -->
