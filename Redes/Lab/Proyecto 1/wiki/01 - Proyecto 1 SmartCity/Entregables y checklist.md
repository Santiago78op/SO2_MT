---
tags: [redes/proyecto, proyecto1, entregables, checklist]
aliases: ["entregables", "checklist", "README del proyecto", "qué entregar"]
---

# Entregables y checklist del Proyecto 1

Dos archivos dentro de `Proyecto 1/` en el repo, más la parte física en laboratorio.

> [!info] Estado al 2026-09-16
> **El Manual está redactado completo; falta todo lo que sale del simulador.** Marcado abajo:
> ✅ hecho · 🟡 parcial · ⬜ pendiente · ⛔ bloqueado.

## A. `Proyecto1_201905884.pkt` — ⬜ **no existe todavía**
- [ ] ⬜ Packet Tracer **8.0 o superior**.
- [ ] ⬜ Las 4 áreas + Core, con los mínimos de [[Requerimientos por área]]. *(diseño cerrado en `configs/topologia.yaml`: 11 switches, 15 enlaces, 24 equipos finales)*
- [ ] ⬜ Todos los **medios de transmisión etiquetados** en la topología. *(decididos y justificados en §20)*
- [ ] ⬜ 100 % de conectividad **intra-VLAN** y aislamiento **inter-VLAN**. *(plan de prueba en §24, pruebas 5–7)*

Se construye siguiendo [[HANDOFF-PACKETTRACER]], que arranca **probando el riesgo del EtherChannel
sobre fibra antes de cablear nada**.

## B. `README.md` — Manual Técnico (Markdown) — ✅ **redactado completo**
Se organiza en **dos marcos, como en la Práctica 1**: **Marco Teórico** (conceptos que sustentan las decisiones: [[Dominios de colisión y broadcast]], [[VLAN y enlaces troncales 802.1Q]], [[VTP]], [[STP y PVST]], [[EtherChannel LACP]], medios y seguridad básica) y **Marco Práctico** (la implementación con evidencia). Los ítems que exige la rúbrica van en el Marco Práctico, cada uno citando la teoría que lo respalda:

- [ ] ⬜ Capturas de la **topología completa** y de **cada área**. → §11, §12 · salen del `.pkt`
- [x] ✅ **Tabla de dominios de colisión** → **§15: 54 en total** (53 cableados + 1 inalámbrico; sólo 2 compartidos, el hub y el AP). → [[Dominios de colisión y broadcast]]
- [x] ✅ **Tabla de dominios de broadcast** → **§16: 5 con usuarios** + la 94 vacía a propósito.
- [x] ✅ **Lista de comandos** por dispositivo → **§23, los 11 switches**; extraídos también a `configs/scripts/`. → [[Comandos Cisco IOS del proyecto]]
- [x] ✅ **Tabla de VLANs** → §13. → [[Parámetros por carné 201905884]]
- [x] ✅ **Tabla de asignación de puertos** por switch → §14, puerto por puerto de los 11.
- [ ] 🟡 **VTP Server**: justificación ✅ §17 · captura ⬜ (E1).
- [ ] 🟡 **Root Bridge por cada VLAN**: justificación ✅ §18, con los puertos que se espera ver bloqueados · captura ⬜ (E3, E4).
- [ ] 🟡 **Cada EtherChannel**: justificación ✅ §19 · captura ⬜ (E5).
- [ ] ⬜ Evidencia de pruebas: `show spanning-tree`, `show etherchannel summary`, `show interfaces trunk`. *(plan completo en §24; qué línea demuestra cada punto, en `capturas/EVIDENCIAS.md`)*
- [x] ✅ **Justificación del medio** por segmento → §20, con los cuatro criterios en orden de descarte.
- [ ] 🟡 **Presupuesto** → §26: **cantidades completas, sin precios**. No se cotizó nada; poner cifras sin origen sería presentar una suposición como dato.
- [x] ✅ Impacto del segmento Legacy y medidas de contención → §21, incluido **lo que NO resuelven**.
- [ ] ⬜ (Opcional) BPDU y PDU VTP en Modo Simulación → §27: procedimiento escrito, sin ejecutar.

### B.1 Apoyo visual — ✅ **14 de 14 figuras propias hechas**
El Manual lleva **dos series numeradas**, ya referenciadas en su lugar; el índice completo está al inicio de `README.md`.

- [x] ✅ **F1–F11** — Marco Teórico. **Son SVG escritos a mano, no archivos de Excalidraw**: se ven e imprimen igual, pero no traen escena embebida.
- [x] ✅ **F13, F18, F19** — Marco Práctico. **Se dibujaron antes de configurar**, al revés de la regla: hay que **contrastarlas** contra F12 y E3/E4, y si difieren manda el simulador.
- [ ] ⬜ **F12, F14–F17** — capturas de la topología en Packet Tracer (completa + las 4 áreas).
- [ ] ⬜ **E1–E14** — salidas de `show`, pings y pruebas de falla → `capturas/evidencias/`.
- [ ] ⛔ **L1–L4** — laboratorio físico → sin fecha ni pareja.
- [ ] ⬜ Antes de entregar: **borrar los comentarios `<!-- -->`** de guía y la sección *Mapa de lecciones* del Manual.

Convención de estilo de las figuras (en `diagrama/README.md`): fibra naranja · cobre azul · puerto bloqueado punteado rojo con candado · **paleta fija de VLANs** (14 violeta · 24 turquesa · 34 ámbar · 44 grafito · 54 rosa) · rojo = problema, verde = correcto. Regla que evita el choque: los colores de **medio** van en la **línea**, los de **VLAN** en el **relleno**.

## C. Parte física (laboratorio, por pareja)
- [ ] Switch 1 → **VTP Server**; Switch 2 → **VTP Client**.
- [ ] VLANs por carné creadas en el Server y **propagadas** al Client (`show vlan brief` en ambos).
- [ ] Puerto de interconexión en **trunk** con las VLANs permitidas; puertos a PCs en **access**.
- [ ] Coordinar con la pareja: cada uno configura un switch.

## D. Antes de entregar
- [ ] Carpeta se llama exactamente **"Proyecto 1"** en el repo `Redes1_2S_2026_201905884`.
- [ ] Entrega por **UEDI/Classroom** con el enlace al repo.
- [ ] Revisar [[Ambigüedades y riesgos del enunciado]] por si el tutor aclaró algo.

Volver a [[Proyecto 1 - SmartCity Tech Park]].

> 📚 Fuente: enunciado §4.3 "Parte Física", §4.5 "Entregables", §8.1.
