---
tags: [redes/proyecto, proyecto1, metodo, catedra]
aliases: ["protocolo", "cómo damos la clase", "modo cátedra", "paso a paso", "secuencia de pasos", "lecciones", "secuencia de lecciones"]
actualizado: 2026-09-14
---

# Protocolo de cátedra — cómo trabajamos el Proyecto 1

Este documento define **cómo** se trabaja el proyecto: no de corrido, sino en lecciones donde primero
se entiende la teoría y después se implementa esa misma teoría. Lo invoca el slash command **`/paso`**
(definido en `.claude/commands/paso.md`, en la raíz del repo, así que viaja con el `git clone`).

El estado vive en [[AVANCE]]; este archivo solo describe el método y la secuencia.

> [!important] Cambio del 2026-09-14: 11 pasos → 9 lecciones
> La secuencia original tenía 11 pasos. Al quedar **tres días** para la entrega se reagruparon en
> **9 lecciones**, elegidas para que cada una **cierre secciones completas del Manual** en vez de
> dejarlas a medias. El método de cuatro etapas no cambió. La correspondencia con los 11 pasos
> viejos está al final, para que las referencias anteriores sigan siendo legibles.

## El método de cada lección

```
   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
   │ 1. TEORÍA    │──►│ 2. PREGUNTAS │──►│ 3. PRÁCTICA  │──►│ 4. REGISTRO  │
   │ concepto +   │   │ 2-3, hay que │   │ implementar  │   │ AVANCE.md +  │
   │ cita oficial │   │ responderlas │   │ + evidencia  │   │ sección del  │
   │              │   │              │   │ + figura     │   │ Manual       │
   └──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘
```

Las cuatro etapas son obligatorias y en ese orden. La etapa 2 existe por una razón concreta: si la
implementación empieza antes de que el concepto esté claro, el Manual termina con justificaciones
inventadas al final, y eso es exactamente lo que la rúbrica §8.1 castiga.

La etapa 3 incluye **dibujar las figuras de Excalidraw** de esa lección: el diagrama se hace mientras
el concepto está fresco, no en una tanda al final. El índice de figuras está en `diagrama/README.md`
y cada `![]()` del Manual ya trae un comentario `<!-- EXCALIDRAW Fn: … -->` que describe qué dibujar.

## Secuencia de lecciones

Cada lección empareja teoría con implementación y cierra secciones del Manual
(`Proyecto 1/README.md`). **F** = figura de Excalidraw; **E** = evidencia de Packet Tracer.

| # | Teoría (nota del cerebro) | Práctica | Cierra en el Manual | Figuras | Tiempo |
|---|---|---|---|---|---|
| 1 | [[Dominios de colisión y broadcast]] + medios de transmisión | Inventario por área, conteo previsto de dominios, medio de cada enlace | §2, §3, §8 · borrador §11.1, §15, §16, §20 | F1, F2, F3, F10 | 1 h |
| 2 | Topología jerárquica (§4.2 del enunciado) | Capa 1 en Packet Tracer: dispositivos, cableado, etiquetas de medio, hub, AP | §1, §11, §12, §20 | F12, F13, F14–F17 | 3 h |
| 3 | [[VLAN y enlaces troncales 802.1Q]] | VLANs, puertos access, trunks con nativa 94 y VLANs permitidas | §4, §13, §14, §16 | F4, F5, F18 | 2.5 h |
| 4 | [[VTP]] | Core en Server, resto en Client, Áreas Comunes en Transparent | §5, §17 | F6 · E1, E2 | 1 h |
| 5 | [[STP y PVST]] + [[EtherChannel LACP]] | `spanning-tree mode pvst`, Root Bridge por VLAN, Po1 y Po2 con LACP `active` | §6, §7, §18, §19 | F7, F8, F9, F19 · E3–E5 | 2.5 h |
| 6 | Seguridad de Capa 2 y segmento Legacy | Banner MOTD, `storm-control`, `port-security`; impacto del hub | §9, §21, §22, §15 | F11 · E6, E7 | 1.5 h |
| 7 | Verificación y evidencia | Los tres `show`, pings intra e inter-VLAN, pruebas de falla | §23, §24, §27 · `capturas/EVIDENCIAS.md` | E8–E14 | 2.5 h |
| 8 | Redacción y cierre | Presupuesto, conclusiones, referencias, borrado de las guías `<!-- -->` | §26, §28, §29 | — | 2 h |
| 9 | Parte física | Dos switches reales con la pareja: Server + Client, trunk, access | §25 | L1–L4 | *lab* |

Total ≈ **16 h**. La lección 9 depende del calendario del laboratorio: puede darse en cualquier
momento sin romper la secuencia, porque solo necesita la teoría de las lecciones 3 y 4.

## Reglas de trabajo

| Regla | Por qué |
|---|---|
| Los comandos se copian a `configs/<hostname>.txt` y a §23 **en el momento** | Reconstruirlos después cuesta el doble y se pierden detalles |
| Cada decisión se anota en [[AVANCE]] **con su porqué** | Es el borrador de la justificación que pide la rúbrica |
| Las figuras de la lección se dibujan **dentro** de la lección | Al final se vuelven una tanda de dos horas que nadie quiere hacer |
| F13, F18 y F19 se dibujan **después** de configurar | Describen la red real: no pueden contradecir las evidencias |
| Los valores por carné se verifican antes de teclear | Un ID de VLAN mal puesto penaliza del -50 % al -100 % |
| El `.pkt` se guarda por fase en local (`Proyecto1_201905884_fN.pkt`) | Permite volver atrás sin rearmar |
| Los commits los hace el estudiante | Convención del repositorio |

## Cómo usarlo en cualquier máquina

No hay pasos manuales: tanto el comando como el contexto (`Proyecto 1/CLAUDE.md` y esta carpeta)
están versionados.

```bash
git clone <repo> && cd <repo>
claude          # y adentro:  /paso
```

`/paso` sin argumentos continúa donde marca [[AVANCE]]. También acepta `/paso 4` (ir a una lección
concreta), `/paso siguiente` y `/paso repasar 6` (solo la teoría, sin implementar).

## Correspondencia con los 11 pasos originales

| Lección | Pasos viejos |
|---|---|
| 1 | 1 · Dominios · 2 · Medios |
| 2 | 3 · Topología |
| 3 | 4 · VLANs y trunks |
| 4 | 5 · VTP |
| 5 | 6 · STP · 7 · EtherChannel |
| 6 | 8 · Seguridad y Legacy |
| 7 | 9 · Verificación |
| 8 | 10 · Redacción |
| 9 | 11 · Parte física |

> 📚 Método propio, derivado de la rúbrica §8.1 del enunciado y del estilo de la Práctica 1.
