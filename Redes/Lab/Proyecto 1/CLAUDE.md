# Proyecto 1 — "SmartCity Tech Park"

Contexto de esta carpeta para Claude Code. **Versionado**: viaja con el `git clone`, así que en
cualquier máquina el contexto se carga solo, sin copiar nada.

Lo primero, en este orden:

1. **`wiki/AVANCE.md`** — dónde quedamos: lección actual, decisiones tomadas con su justificación,
   dudas abiertas, cuántas figuras y evidencias faltan. Es la fuente de verdad del progreso.
2. **`wiki/PROTOCOLO-CATEDRA.md`** — cómo trabajamos: clase guiada en **9 lecciones**, con cuatro
   etapas obligatorias por lección (teoría con cita oficial → preguntas de comprensión → práctica y
   figuras → registro). Se invoca con el comando **`/paso`**.
3. El contexto completo del proyecto, importado abajo.

## Estado al 2026-09-16: el documento está escrito, falta el simulador

| Qué | Estado |
|---|---|
| **Manual Técnico** (`README.md`, 29 secciones, ~2 400 líneas) | ✅ **redactado completo** — Marco Teórico §1–§9 y Marco Práctico §10–§29 |
| **14 figuras propias** (`diagrama/*.svg`) | ✅ hechas y verificadas en navegador |
| **Diseño de red** con sus justificaciones | ✅ cerrado — 22 decisiones registradas en `AVANCE.md` |
| **11 scripts de configuración** (`configs/scripts/`) | ✅ listos para pegar en la CLI |
| **`Proyecto1_201905884.pkt`** | ⬜ **no existe todavía** |
| **5 capturas** (F12, F14–F17) y **14 evidencias** (E1–E14) | ⬜ pendientes: salen del `.pkt` |
| **§25 parte física** | ⛔ bloqueada: sin fecha de laboratorio ni pareja |

**Lo que falta es tiempo de simulador, no redacción.** Se hará **en otra máquina, por MCP de Packet
Tracer**. El guion de esa sesión está en **`wiki/HANDOFF-PACKETTRACER.md`** y la especificación
legible por máquina —dispositivos, 15 enlaces con medio y distancia, VLANs, resultado esperado— en
**`configs/topologia.yaml`**.

## Reglas que no se negocian

- **Los valores por carné se verifican antes de teclear.** Un ID de VLAN mal puesto penaliza del
  **−50 % al −100 %**. Están en `wiki/CONTEXTO-CLAUDE.md` y en §10 del Manual.
- **Lo medido y lo previsto no se mezclan.** Cada sección del Manual que depende del simulador lo
  declara en su propio encabezado. Si el simulador contradice al documento, **gana el simulador**:
  se corrige el documento y se anota qué cambió.
- **Los commits y pushes los hace el usuario.** Claude no commitea.
- **Toda decisión de diseño se anota con su justificación en el momento**, en `wiki/AVANCE.md`. La
  rúbrica califica la justificación, no sólo el resultado.

## Dónde está cada cosa

- El **Manual Técnico es `README.md`** de esta carpeta (el enunciado §4.5 fija esa ruta).
- Las **figuras propias** son SVG escritos a mano en `diagrama/` (índice, paleta fija de VLANs y
  tabla de estilo en `diagrama/README.md`). **No son archivos de Excalidraw**: no traen escena
  embebida y no se reabren ahí.
- Las **capturas del simulador** van en `capturas/`, indexadas en `capturas/EVIDENCIAS.md`, que
  además dice **qué línea exacta demuestra el punto** en cada evidencia.
- La **preparación para la calificación** del 18–19/09 está en `wiki/PREPARACION-AUXILIAR.md`:
  los 5 «mata-nota» de §8.1, 42 preguntas probables con respuesta y las tareas en vivo con sus
  comandos.

@wiki/CONTEXTO-CLAUDE.md
