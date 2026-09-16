---
tags: [redes/proyecto, proyecto1, estado, bitacora]
aliases: ["avance", "estado", "dónde quedamos", "progreso", "bitácora del proyecto"]
leccion_actual: 2
actualizado: 2026-09-16
---

# Avance del Proyecto 1 — estado actual

> **Este archivo es la fuente de verdad del progreso.** `/paso` lo lee al arrancar y lo actualiza al
> cerrar cada lección. Si trabajás en otra máquina, esto es lo que te dice dónde quedaste.
> Método y secuencia completa: [[PROTOCOLO-CATEDRA]].

## Estado

| Dato | Valor |
|---|---|
| **Lección actual** | **2 — armar la topología en Packet Tracer.** Su redacción ya está hecha; lo que falta es el `.pkt` |
| Lecciones con la redacción cerrada | **8 de 9** (todas menos la 9, que está bloqueada) |
| Lecciones cerradas **del todo** | **5 de 9** — las que no dependen del simulador: 1, 3, 4, 6 y 8 |
| **Días hasta la entrega** | **1** (hoy 16/09; entrega 17/09/2026) |
| Implementado en Packet Tracer | **nada todavía** — se hará en **otra PC, por MCP**: runbook en [[HANDOFF-PACKETTRACER]] |
| Última sesión | 2026-09-16 (4) — preparación para la calificación: [[PREPARACION-AUXILIAR]] |
| **Calificación** | **18–19/09/2026** — guion de defensa listo en [[PREPARACION-AUXILIAR]] |

> [!warning] El calendario se corrió dos días, y el cuello de botella ya no es la redacción
> El plan del 14/09 asumía lecciones 1-3 ese día, 4-6 el 15 y 7-8 el 16. No se ejecutó: el 15/09 no
> hubo sesión. El 16/09 se recuperó **toda la redacción de una vez**: las 9 secciones del Marco
> Teórico, el diseño completo con justificaciones, las 14 figuras propias, los 11 scripts de
> configuración y el plan de pruebas.
>
> **Lo único que falta es tiempo de simulador.** En orden: armar el `.pkt` → pegar los 11 scripts de
> `configs/scripts/` → tomar las 5 capturas (F12, F14–F17) → ejecutar las 9 pruebas y las 3 de falla
> (E1–E14). Todo lo demás está escrito y sólo hay que contrastarlo. La lección 9 (laboratorio físico)
> sigue bloqueada por falta de fecha y de pareja.

## Tablero de lecciones

| # | Lección | Cierra | Estado | Cerrada el |
|---|---|---|---|---|
| 1 | Dominios de colisión y broadcast · Medios | §2, §3, §8, §15, §16, §20 | ✅ **cerrada** | **2026-09-16** |
| 2 | Topología jerárquica y Capa 1 en Packet Tracer | §1, §11, §11.1, §12 | 🟡 **redacción ✅ · falta el `.pkt` y F12, F14–F17** | |
| 3 | VLANs y enlaces troncales 802.1Q | §4, §13, §14 | ✅ **cerrada** | **2026-09-16** |
| 4 | VTP: Server, Client y Transparent | §5, §17 | 🟡 redacción ✅ · falta E1, E2 | |
| 5 | STP/PVST+ y EtherChannel LACP | §6, §7, §18, §19 | 🟡 redacción ✅ · falta E3, E4, E5 | |
| 6 | Seguridad de Capa 2 y segmento Legacy | §9, §21, §22 | ✅ **cerrada** (falta E7, E8) | **2026-09-16** |
| 7 | Verificación, pruebas y evidencia | §23, §24, §27 | 🟡 **plan y comandos ✅ · falta ejecutar E6, E9–E14** | |
| 8 | Cierre: presupuesto, conclusiones y referencias | §26, §28, §29 | ✅ **cerrada** (falta cotizar precios) | **2026-09-16** |
| 9 | Parte física en laboratorio | §25 | ⛔ **bloqueada**: sin fecha de laboratorio ni pareja | |

Leyenda: ⬜ pendiente · 🟡 en curso · ✅ cerrada

~~**Plan de los tres días:** lecciones 1-3 el 14/09 (≈6.5 h) · 4-6 el 15/09 (≈5 h) · 7-8 el 16/09
(≈4.5 h).~~ **No se cumplió** (ver aviso arriba). Plan vigente al 16/09: lección 2 y 3 primero,
porque todo lo demás depende de tener la topología armada; 6 y 8 se redactan sin simulador si el
tiempo aprieta. La 9 entra cuando haya fecha de laboratorio.

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
| **14 de 14** ✅ | **0 de 5** | **0 de 14** |

Las 14 se escribieron **directamente como SVG**, no en Excalidraw: se ven e imprimen igual, pero no
traen escena embebida y no se reabren en Excalidraw. Queda anotado en `diagrama/README.md` junto con
la paleta fija de VLANs (14 violeta · 24 turquesa · 34 ámbar · 44 grafito · 54 rosa) y la regla de
que los colores de medio se usan sólo en líneas y los de VLAN sólo en rellenos.

**Se rompió una regla, a conciencia:** F13, F18 y F19 describen la red real y la regla dice que se
dibujan *después* de configurar. Se dibujaron antes porque el diseño está cerrado y el `.pkt` no.
**Deben contrastarse** contra la captura F12 y las evidencias E3/E4; si difieren, manda el simulador.

## Decisiones tomadas (con su justificación)

<!-- Al cerrar cada lección, agregar aquí las decisiones con su porqué. Este es el borrador literal de
las justificaciones del Manual, así que escribirlas completas, no en clave. -->

| # | Decisión | Justificación | Lección | Sección del Manual |
|---|---|---|---|---|
| 1 | El Manual se entrega como `Proyecto 1/README.md`, no como un `ManualTecnico.md` aparte | El enunciado §4.5 fija esa ruta; un segundo archivo se desincroniza y no es el que se califica | — | — |
| 2 | Las figuras teóricas se hacen en Excalidraw y se exportan a **SVG** | Vectorial: se ve nítido en GitHub y al imprimir, y el `.svg` con *embed scene* sigue siendo editable | — | Parte I |
| 3 | F13, F18 y F19 se dibujan después de configurar | Describen la red real; si se dibujan antes, contradicen las evidencias E3 y E4 | — | §11, §16, §18 |
| 4 | **Anillo de 3 switches en I+D con dos uplinks al distribuidor** (SW-ID-1 y SW-ID-3), no uno | El enunciado pide que la caída de un switch no aísle a los demás. Con un solo uplink, la muerte de ese switch aísla a los otros dos del Core: el anillo interno no basta. Con dos uplinks el anillo tiene dos salidas y STP bloquea un puerto, lo que además da la evidencia E4 | 1 | §12.2, §15 |
| 5 | **Cuatro chasis modulares** (SW-CORE, SW-DIST-ID, SW-DIST-CORP, SW-PLANTA); el resto `2960-24TT` | El `2960-24TT` de Packet Tracer sólo tiene cobre, y esos cuatro switches terminan un enlace de fibra. SW-CORE necesita además 6 puertos de alta velocidad simultáneos (2 Po1 + 2 Po2 + 2 trunks), por encima de los 2 GigabitEthernet de un `3560-24PS` | 1 | §11.1 |
| 6 | **Fibra OM3 en el enlace Core ↔ Planta pese a medir 90 m** | Cabe en cobre por distancia, pero el entorno industrial (motores, variadores de frecuencia, soldadura) induce ruido que degrada el UTP. La fibra es inmune por construcción y aísla galvánicamente ambos edificios. Es el único enlace que **no** se decide por distancia, y por eso es el que mejor demuestra que se aplicaron los cuatro criterios de §8 | 1 | §20, §8 |
| 7 | **Fibra OM4 (no OM3) en el Po2 hacia I+D**, 2 × 1 Gbps | Es el trunk de mayor ancho de banda del campus por exigencia del enunciado; OM4 deja margen para 10 Gbps sin retender fibra. Los 180 m descartan el cobre de plano | 1 | §20, §12.2 |
| 8 | **UTP Cat 6 en el Po1 Core ↔ SRV** (10 m, mismo rack) | Los tres primeros criterios de §8 empatan a favor del cobre; gana el cuarto, el costo. Poner fibra dentro del mismo rack sería pagar transceptores sin ganancia | 1 | §20 |
| 9 | **La VLAN nativa 94 se deja sin ningún puerto de acceso** | Es un dominio de broadcast que existe (transporta lo no etiquetado de los trunks) pero vacío a propósito: sacarla de la VLAN 1 y dejarla sin usuarios cierra el vector de *VLAN hopping* por doble etiquetado | 1 | §16, §9.1, §4.3 |
| 10 | **El trunk SW-DIST-CORP ↔ SW-COMUNES permite sólo las VLANs 54 y 94** | El aislamiento de los visitantes es lógico, no físico: no lo da tener switch propio, lo da la VLAN. Restringir la lista `allowed` hace explícito el aislamiento de tráfico, y el modo VTP Transparent agrega el de administración | 1 | §16, §12.3, §17 |
| 11 | **El dominio de colisión del hub se cuenta una sola vez**, descontándolo de la fila de SW-PLANTA | El puerto del switch al que cuelga el hub y el segmento del hub **son el mismo dominio**. Contarlos por separado inflaría el total y delataría que no se entendió la regla | 1 | §15 |
| 12 | **Nombres de VLAN en MAYÚSCULAS** (`GERENCIA`, `INVESTIGACION`…) | El enunciado es ambiguo: la tabla escribe `Gerencia` pero el ejemplo dice «exactamente `GERENCIA`». Se adopta la forma que el ejemplo declara literal, que además es la convención de Cisco. Sigue como duda #2 para el tutor | 3 | §13 |
| 13 | **Cada trunk lleva una lista `allowed vlan` explícita**, no todas las VLANs | Reduce el alcance de un trunk comprometido y hace visible el aislamiento. El caso que más pesa: el trunk a SW-COMUNES permite sólo `1,54,94` | 3 | §14, §9.2 |
| 14 | **La VLAN 1 se conserva en todas las listas `allowed`**, aunque sin puertos de acceso | Es la VLAN de gestión sobre la que viajan CDP, DTP y los anuncios VTP. Retirarla en el simulador arriesga romper la propagación VTP. En IOS real el tráfico de control sigue circulando igual; la elección es conservadora y se declara como tal | 3 | §14 |
| 15 | **VLAN 999 «muerta» para los puertos no utilizados**, además de `shutdown` | Defensa en profundidad: si alguien reactiva un puerto, queda en una VLAN que no lleva a ninguna parte. **No es requisito del enunciado**: se declara como buena práctica añadida, y su ID se elige fuera del rango 14–94 para no confundirlo con el esquema del carné | 6 | §9.3, §13 |
| 16 | **El cierre del anillo de I+D (SW-ID-1 ↔ SW-ID-3) va en FastEthernet, 100 Mbps** | El `2960-24TT` sólo tiene 2 puertos Gigabit y SW-ID-1 y SW-ID-3 necesitan 3 enlaces de switch. Lejos de ser una limitación sufrida, poner el enlace lento en la *cuerda* del anillo le da costo STP 19 frente a 4 y lo convierte en el candidato natural al bloqueo: el resultado es **predecible** en vez de depender de qué MAC salió más baja | 5 | §12.2, §18, §20 |
| 17 | **Root Bridge en el distribuidor de cada edificio, no en el Core** (VLANs 14, 24 y 54) | **Sustituye a la propuesta inicial** («Core como raíz de 14/34/44/54»). El puerto que STP bloquea es el más alejado de la raíz: con la raíz en el distribuidor, el bloqueo cae sobre el **enlace de respaldo** (Ala A ↔ Ala B, cierre del anillo) y no sobre un uplink de uso diario. Con la raíz en el Core el resultado no es erróneo, pero queda determinado por las MAC en vez de por el diseño | 5 | §18 |
| 18 | **Prioridades secundarias 28672 en SW-ALA-A y SW-ID-1** | Hacen determinista el desempate por Bridge ID en los dos segmentos donde el costo empata, de modo que se puede **predecir y documentar** qué puerto queda bloqueado antes de abrir el simulador | 5 | §18 |
| 19 | **LACP en `mode active` en ambos extremos, nunca `on`** | `active–active` forma el canal sin depender de quién arranque. `on` fuerza el canal sin negociar: ante un error de cableado produce un **bucle**, mientras que LACP simplemente no levanta el canal y deja que STP bloquee. Es la diferencia entre fallar de forma segura y de forma catastrófica | 5 | §7.2, §19 |
| 20 | **`port-security` en modo `restrict`, no `shutdown`** | El modo por defecto deja el puerto en *err-disabled* y exige intervención manual: en una planta de producción eso convierte un incidente de red en una **parada no programada**. `restrict` descarta y registra, manteniendo operativas las máquinas legítimas | 6 | §21.2 |
| 21 | **SW-PLANTA cuelga del Core sin switch de distribución** | La Planta tiene un solo switch de acceso y un único segmento (VLAN 34): un nivel intermedio no agregaría nada y sí añadiría un punto de falla y costo. La jerarquía se aplica donde aporta, no como formalidad | 2 | §11 |
| 22 | **El presupuesto va sin precios**, sólo con cantidades | No se cotizó nada. Poner cifras plausibles pero sin origen sería presentar una suposición como dato. Las cantidades, que son la parte que depende del diseño y no del mercado, sí están completas y son verificables contra §14 y §20 | 8 | §26 |

## Dudas abiertas para el tutor

| # | Duda | Estado |
|---|---|---|
| 1 | El PDF del enunciado no incluye §8.2 *Detalle de la Calificación* ni §8.3 (solo aparecen en el índice); §6 *Metodología* está vacía. Pedir la versión completa. | ⬜ sin preguntar |
| 2 | Los nombres de VLAN: la tabla escribe `Gerencia`, el ejemplo dice "exactamente GERENCIA". ¿Mayúsculas obligatorias? | ⬜ sin preguntar |
| 3 | Fecha del laboratorio de la parte física y confirmación de la pareja. **Urgente**: quedan 3 días y la §25 depende de esto. | ⬜ sin preguntar |

Detalle completo de las diez ambigüedades detectadas: [[Ambigüedades y riesgos del enunciado]].

## Bitácora de sesiones

### 2026-09-16 (4) — Preparación para la calificación del 18–19/09

Se creó **[[PREPARACION-AUXILIAR]]**, el guion para la sesión con el auxiliar. Va con un aviso al
frente que conviene no perder de vista: **es anticipación razonada, no la rúbrica**, porque el PDF
no incluye la §8.2 «Detalle de la Calificación». Se apoya en lo que sí está completo — la lista de
entregables de §4.5, los requisitos de §8.1 y la parte física de §4.4.

Ocho bloques: los **5 «mata-nota»** de §8.1 (carpeta exacta, UEDI/Classroom, Markdown, VLANs por
carné, originalidad) · verificación relámpago de los 9 parámetros del carné con el comando que
demuestra cada uno · el recorrido probable de la calificación en 10 bloques · **42 preguntas con
su respuesta**, 11 de ellas marcadas ⚠ como trampa · las **tareas en vivo** con los comandos listos ·
la parte física con su árbol de diagnóstico de 5 pasos · qué hacer si algo falla en vivo · y las 3
preguntas que hay que hacerle al auxiliar.

Las trampas que más se repiten en una defensa y que el documento deja resueltas: el hub **no** suma
4 dominios de colisión sino que ensancha 1; 3 switches en un edificio **no** son 3 dominios de
broadcast; un EtherChannel de 2 Gbps **no** da 2 Gbps a una sola transferencia; PVST+ **no** es el
modo por defecto; un Client **sí** puede destruir el dominio VTP; y el **ping entre VLANs que falla
es el resultado correcto**, no un error que arreglar.

También se declaran de antemano los dos puntos débiles conocidos, para no ser sorprendido con
ellos: el presupuesto sin precios y las figuras F13/F18/F19 dibujadas antes de configurar.

### 2026-09-16 (3) — Hueco de teoría tapado + traspaso a la otra PC preparado

Se decidió que **el `.pkt` y las capturas se generarán en otra máquina, por MCP**. Esta sesión dejó
dos cosas.

**1. Un hueco real del Marco Teórico, tapado.** §4.2 explicaba access y trunk, y §9.1 cubría VLAN
hopping y MAC flooding, pero faltaba **DTP y el *switch spoofing***, que es el tercer ataque clásico
de Capa 2 y **el más fácil de ejecutar de los tres**: no hay que fabricar ninguna trama, basta con
que un puerto de acceso haya quedado en modo dinámico. Se añadió:
- §4.2: los cinco estados de puerto (`dynamic auto`/`desirable`/`access`/`trunk`/`nonegotiate`) y por
  qué aquí el modo se fija a mano siempre.
- §9.1: el ataque explicado, con la **tabla comparativa contra el doble etiquetado** — el spoofing
  alcanza **todas** las VLANs del trunk y es **bidireccional**, frente a una sola VLAN y
  unidireccional del doble tag.
- §9.2 y §22: las dos medidas nuevas con su alcance y su límite.
- **`switchport nonegotiate` añadido a los 25 puertos troncales físicos** de §23, y los 11 scripts
  regenerados. **No** se puso en las interfaces `Port-channel`: DTP es de enlace físico.

**2. El traspaso, preparado para que nadie tenga que rededucir el diseño.**
- **`configs/topologia.yaml`** — especificación **legible por máquina**: 11 switches, 15 enlaces con
  medio/velocidad/distancia, 7 VLANs, 10 grupos de equipos finales, los 2 canales, el **resultado
  esperado** (54 dominios de colisión, 5 de broadcast, los 3 puertos que deberían quedar en `BLK`) y
  los 3 riesgos abiertos. Validado: parsea como YAML.
- **[[HANDOFF-PACKETTRACER]]** — el runbook de la sesión en 7 fases: probar el riesgo del
  EtherChannel **antes** de cablear → construir → configurar en orden → las 5 capturas → las 14
  evidencias → volcar resultados al Manual → checklist de entrega.

Dos avisos que el runbook subraya porque son los errores típicos: **E10 y E11 deben FALLAR** (un ping
al 100 % de pérdida entre VLANs es el resultado correcto), y **E12–E14 son tres capturas cada una**
(antes / durante / después), con el cronómetro — si E14 tarda 30 s, el EtherChannel no se formó.

### 2026-09-16 (2) — Lecciones 2 a 8: el Manual queda redactado completo

Se pidió correr todas las lecciones seguidas para tener el documento terminado, dejando la clase
paso a paso para el Marco Práctico. Resultado: **el Manual está escrito de punta a punta salvo lo
que exige Packet Tracer.**

**Marco Teórico — cerrado entero (§4 a §9).**
- **§4 VLANs y 802.1Q**: qué es una VLAN (dominio de broadcast por configuración), access vs. trunk,
  el tag de 4 bytes desglosado, y la VLAN nativa con el ataque de doble etiquetado que justifica
  moverla a la 94. Incluye el aviso de que una nativa desalineada **puede producir bucles de STP**.
- **§5 VTP**: qué sí y qué no hace (no asigna puertos), los tres modos, y el número de revisión con
  el escenario completo de cómo un Client puede destruir el dominio.
- **§6 STP/PVST+**: **Ethernet no tiene TTL** como causa raíz, los tres efectos del bucle, Bridge ID,
  costos, los cuatro estados de puerto y de dónde salen los 30–50 s; PVST+ vs. Rapid-PVST+.
- **§7 EtherChannel/LACP**: el desperdicio que resuelve, `active`/`passive`, por qué nunca `on`, y la
  interacción con STP. Con el matiz honesto de que una sola conversación no supera la velocidad de un
  miembro.
- **§9 Seguridad**: VLAN hopping y MAC flooding explicados paso a paso, la tabla de medidas con la
  columna **«qué NO resuelve»** completa, y puertos no utilizados.

**Marco Práctico — todo lo que no depende del simulador.**
- §11 jerarquía de tres niveles + dónde está cada tipo de redundancia · §12 las cuatro áreas con
  requisito → solución → justificación · §13 tabla de VLANs · **§14 asignación puerto por puerto de
  los 11 switches** · §17 VTP · §18 Root Bridge por VLAN con los puertos que se espera ver
  bloqueados · §19 los dos EtherChannel · §21 impacto y contención del Legacy · §22 seguridad
  aplicada con su alcance · **§23 los 11 scripts de configuración completos** · §24 plan de pruebas
  · §25 procedimiento de laboratorio · §26 presupuesto (cantidades) · §27 análisis de PDUs · §28
  ocho conclusiones · §29 referencias ampliadas con ANSI/TIA-568 e IEEE 802.1w.
- **`configs/scripts/`**: los 11 scripts extraídos del §23, listos para pegar en la CLI. El
  `configs/README.md` explica la diferencia entre script y `running-config`.
- **Las 14 figuras propias terminadas** (faltaban F4–F9, F11, F13, F18, F19). Verificadas en
  navegador; se corrigieron seis defectos de maquetación que sólo se vieron al renderizarlas.
- Se unificó la numeración de evidencias entre el Manual y `capturas/EVIDENCIAS.md` (estaban
  cruzadas: E6/E7/E8), y se añadió a ese índice la tabla **«la línea que demuestra el punto»** para
  cada evidencia.

**Once decisiones nuevas** (#12 a #22 arriba). La que más pesa: **el Root Bridge va en el
distribuidor de cada edificio, no en el Core** — sustituye a la propuesta inicial y está razonada.

**Lo que NO se hizo, y por qué.**

| Pendiente | Razón |
|---|---|
| El archivo `Proyecto1_201905884.pkt` | Requiere Packet Tracer. Es el cuello de botella de todo lo demás |
| Capturas F12, F14–F17 | Salen del `.pkt` |
| Evidencias E1–E14 | Salen del `.pkt` |
| Precios del presupuesto (§26) | No se cotizaron. Las cantidades sí están completas |
| Lección 9 / §25 | Sin fecha de laboratorio ni pareja confirmada |

**El riesgo técnico abierto sigue abierto** y es lo primero que hay que probar: que el chasis
modular de Packet Tracer acepte `channel-group … mode active` sobre módulos de **fibra**. Si no lo
hace, **Po2 no se forma** y hay que replantear la redundancia del trunk de I+D.

### 2026-09-16 — Lección 1 CERRADA · modo «resolver y explicar»

**Etapa 2 — las tres preguntas, respondidas.**
1. Switch de 8 puertos con un hub de 4 máquinas colgando: **8 dominios de colisión** (no 12 — el hub
   ensancha uno, no suma cuatro) y **1 de broadcast** (el trunk extiende el dominio, no lo corta).
2. Edificio Corporativo: **2 dominios de broadcast**, no 3. Ala A y Ala B comparten la VLAN 14 y por
   tanto un solo dominio aunque estén en switches distintos; Áreas Comunes está en la 54. Lo que
   separa es la VLAN, no el muro ni el equipo.
3. 180 m ⇒ fibra obligatoria (100 m es límite normativo TIA-568, no consejo). 40 m ⇒ depende de
   **dónde** pasen: en oficina, UTP Cat 6 por costo; cruzando la Planta, fibra por EMI. El criterio
   se aplica como descarte: distancia → ancho de banda → EMI → costo.

**Etapa 3 — implementación.**
- **§2** redactada completa: tres párrafos de síntomas con la realimentación entre ellos.
- **§3.1 y §3.2** redactadas completas, con la tabla de conteo por tipo de dispositivo (incluido el
  **AP**, que también es medio compartido bajo CSMA/CA) y los dos corolarios que se reutilizan en la
  Parte II.
- **§8** redactada: los cuatro criterios con su orden de descarte y el carácter normativo del límite
  de 100 m.
- **§11.1** (inventario): 11 switches, 1 hub, 1 AP, 4 servidores, 24 equipos finales, con puertos
  activos previstos por switch.
- **§15** (dominios de colisión): **54 en total** — 53 cableados + 1 inalámbrico. 52 son punto a
  punto en full-duplex; los únicos compartidos son el del hub (6 miembros) y el del AP (3 laptops).
- **§16** (dominios de broadcast): **5 con usuarios** + la 94 vacía, donde la red plana tenía 1.
- **§20** (medios): 8 filas enlace → medio → distancia → criterio que decide → justificación.
- **Figuras F1, F2, F3 y F10** creadas en `diagrama/`. Paleta fija de VLANs definida en
  `diagrama/README.md`.

**Riesgo técnico abierto (va a la lección 2).** No está verificado que el chasis modular de Packet
Tracer acepte `channel-group … mode active` sobre módulos de fibra. Si no lo soporta, **Po2 se cae**
y la redundancia del trunk de I+D hay que replantearla. Queda anotado como comentario `PENDIENTE L2`
en §11.1 del Manual. Es lo primero que hay que probar al abrir el simulador.

**Lo que NO se hizo.** Nada en Packet Tracer. Las 10 figuras restantes. Las 14 evidencias. Las tres
dudas para el tutor siguen sin preguntar, y la #3 (fecha del laboratorio) ya es crítica: la §25
depende de ella y la entrega es mañana.

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
