# wiki/ — cerebro del Proyecto 1

Bóveda Obsidian con el conocimiento de trabajo del proyecto: contexto para Claude Code, análisis del enunciado, decisiones de diseño y conceptos de Capa 2. **No es un entregable**; el Manual Técnico es `../README.md`.

**22 notas**, versionadas: el cerebro viaja con el `git clone` y es el mismo en todas las máquinas.

| Archivo | Para qué |
|---|---|
| `AVANCE.md` | **Estado del progreso**: lección actual (9 en total), decisiones con su justificación, dudas abiertas, cuántas figuras y evidencias faltan, bitácora de sesiones. Lo lee y actualiza `/paso`. |
| `PROTOCOLO-CATEDRA.md` | El método de clase guiada (teoría → preguntas → práctica → registro) y la secuencia de las **9 lecciones** (antes 11 pasos; reagrupadas el 14/09). |
| `HANDOFF-PACKETTRACER.md` | **Runbook de la sesión de Packet Tracer**, que se hará en otra PC por MCP: probar el riesgo del EtherChannel, construir desde `configs/topologia.yaml`, aplicar los 11 scripts, las 5 capturas, las 14 evidencias y qué volcar al Manual. |
| `PREPARACION-AUXILIAR.md` | **Guion de la calificación del 18–19/09**: los 5 «mata-nota» de §8.1, verificación de parámetros por carné, 42 preguntas probables con respuesta (11 marcadas como trampa), tareas en vivo con sus comandos y la parte física. |
| `CONTEXTO-CLAUDE.md` | Lo que Claude Code debe saber al abrir el proyecto. El `../CLAUDE.md` local lo importa con `@wiki/CONTEXTO-CLAUDE.md`. |
| `analisis-enunciado.md` | Análisis completo y autocontenido del PDF del enunciado. |
| `00 - 🌐 Cerebro Redes (MOC).md` | Índice de las notas; empezar por acá. |
| `01 - Proyecto 1 SmartCity/` | Resumen, parámetros por carné, áreas, entregables, ambigüedades, plan. |
| `02 - Conceptos Capa 2/` | Dominios, VLAN/802.1Q, VTP, STP/PVST, EtherChannel/LACP, comandos IOS. |
| `Glosario.md` · `log.md` | Términos en una línea · bitácora de cambios del cerebro. |

## Usarla en otra PC

No hay pasos manuales: `Proyecto 1/CLAUDE.md` y `.claude/commands/paso.md` están versionados.

```bash
git clone <repo> && cd <repo>
claude          # y adentro:  /paso
```

Opcional, si esa máquina tiene diamon: en `brains.json`, mundo `personal`, agregar
`"redes": "<ruta-del-repo>/Proyecto 1/wiki"` y reiniciar la sesión para poder usar `brain_search`.

**Ojo con esa ruta.** El 16/09 el registro apuntaba a una carpeta que no existía en la máquina (el
repo estaba clonado en otro sitio), así que el cerebro no cargaba y no salía en `brain_list`. Si
`brain_search` no encuentra nada del proyecto, revisá esa línea de `brains.json` antes que nada.
