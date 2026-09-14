# Manual Técnico — Proyecto 1: SmartCity Tech Park

**Universidad de San Carlos de Guatemala** · Facultad de Ingeniería\
**Curso:** Redes de Computadoras 1 — Segundo Semestre 2026\
**Estudiante:** Santiago Barrera\
**Carné:** 201905884\
**Archivo de simulación:** `Proyecto1_201905884.pkt` (Cisco Packet Tracer 8.x)\

---

<!--
PLANTILLA. Cómo usarla:
- Los comentarios HTML como este son guías de redacción; no se ven en GitHub. Borrarlos al cerrar cada sección.
- Parte I (Marco Teórico): la teoría que sustenta cada decisión; se redacta con definiciones, comparaciones y referencias, ANTES de configurar.
- Parte II (Marco Práctico): la implementación con evidencia; cada decisión cita la sección teórica que la respalda (ej. "véase §6.2").
- Capturas: capturas/topologia/, capturas/areas/, capturas/evidencias/, capturas/laboratorio/ (índice en capturas/EVIDENCIAS.md).
- Configs completas por dispositivo: configs/<hostname>.txt.
- Valores por carné ya sustituidos: NO cambiarlos (penaliza -50 % a -100 %).
-->

## Índice

**Parte I — Marco Teórico**

1. [Introducción y alcance](#1-introducción-y-alcance)
2. [El problema de la red plana](#2-el-problema-de-la-red-plana)
3. [Dominios de colisión y dominios de broadcast](#3-dominios-de-colisión-y-dominios-de-broadcast)
4. [VLANs y enlaces troncales IEEE 802.1Q](#4-vlans-y-enlaces-troncales-ieee-8021q)
5. [VLAN Trunking Protocol (VTP)](#5-vlan-trunking-protocol-vtp)
6. [Spanning Tree Protocol y PVST+](#6-spanning-tree-protocol-y-pvst)
7. [EtherChannel y LACP](#7-etherchannel-y-lacp)
8. [Medios de transmisión: cobre y fibra óptica](#8-medios-de-transmisión-cobre-y-fibra-óptica)
9. [Seguridad básica en Capa 2](#9-seguridad-básica-en-capa-2)

**Parte II — Marco Práctico**

10. [Parámetros de diseño derivados del carné](#10-parámetros-de-diseño-derivados-del-carné)
11. [Topología general](#11-topología-general)
12. [Diseño por área](#12-diseño-por-área)
13. [Tabla de VLANs](#13-tabla-de-vlans)
14. [Asignación de puertos por switch](#14-asignación-de-puertos-por-switch)
15. [Dominios de colisión de la red](#15-dominios-de-colisión-de-la-red)
16. [Dominios de broadcast de la red](#16-dominios-de-broadcast-de-la-red)
17. [VTP: servidor, modos y propagación](#17-vtp-servidor-modos-y-propagación)
18. [STP: Root Bridge por VLAN](#18-stp-root-bridge-por-vlan)
19. [EtherChannel implementados](#19-etherchannel-implementados)
20. [Medios de transmisión por segmento](#20-medios-de-transmisión-por-segmento)
21. [Segmento Legacy: impacto y contención](#21-segmento-legacy-impacto-y-contención)
22. [Seguridad básica aplicada](#22-seguridad-básica-aplicada)
23. [Comandos de configuración por dispositivo](#23-comandos-de-configuración-por-dispositivo)
24. [Evidencia de pruebas](#24-evidencia-de-pruebas)
25. [Parte física: laboratorio](#25-parte-física-laboratorio)
26. [Presupuesto estimado](#26-presupuesto-estimado)
27. [Análisis de PDUs en Modo Simulación (opcional)](#27-análisis-de-pdus-en-modo-simulación-opcional)
28. [Conclusiones](#28-conclusiones)
29. [Referencias](#29-referencias)

---

## Índice de figuras y evidencias

El manual usa **dos series numeradas**. Las **Figuras (F)** son diagramas propios hechos en
Excalidraw (`diagrama/*.svg`) y las vistas de la topología en Packet Tracer. Las **Evidencias (E)**
son las salidas de comandos y pruebas del simulador (`capturas/evidencias/`), indexadas en
[`capturas/EVIDENCIAS.md`](capturas/EVIDENCIAS.md).

**Figuras del Marco Teórico** — Excalidraw, exportadas a SVG en `diagrama/`

| Fig. | § | Archivo | Qué ilustra |
|---|---|---|---|
| F1 | 2 | `diagrama/01-red-plana-problema.svg` | La red plana actual y sus cuatro síntomas |
| F2 | 3.1 | `diagrama/02-dominios-colision.svg` | Hub (1 dominio compartido) vs. switch (1 por puerto) |
| F3 | 3.2 | `diagrama/03-dominios-broadcast.svg` | Red plana = 1 dominio · con VLANs = 1 por VLAN |
| F4 | 4.2 | `diagrama/04-access-vs-trunk.svg` | Puerto access y puerto trunk lado a lado |
| F5 | 4.3 | `diagrama/05-trama-8021q.svg` | Trama Ethernet con el tag de 4 bytes y la nativa sin etiquetar |
| F6 | 5.2 | `diagrama/06-vtp-modos.svg` | Propagación de anuncios entre Server, Client y Transparent |
| F7 | 6.1 | `diagrama/07-bucle-capa2.svg` | Tormenta de broadcast en un triángulo de switches |
| F8 | 6.2 | `diagrama/08-eleccion-root-bridge.svg` | Bridge ID, costos por enlace y el puerto que queda bloqueado |
| F9 | 7.1 | `diagrama/09-etherchannel-lacp.svg` | Enlaces físicos agrupados en un port-channel lógico |
| F10 | 8 | `diagrama/10-medios-transmision.svg` | Alcance y ancho de banda de UTP vs. fibra en el campus |
| F11 | 9.1 | `diagrama/11-seguridad-capa2.svg` | VLAN hopping por doble etiquetado y MAC flooding |

**Figuras del Marco Práctico** — Packet Tracer (`capturas/`) y Excalidraw (`diagrama/`)

| Fig. | § | Archivo | Qué ilustra | Origen |
|---|---|---|---|---|
| F12 | 11 | `capturas/topologia/00-topologia-completa.png` | Topología completa con medios etiquetados | Packet Tracer |
| F13 | 11 | `diagrama/12-topologia-logica.svg` | Jerarquía Core → distribución → acceso, VLANs y canales | Excalidraw |
| F14 | 12.1 | `capturas/areas/01-centro-de-datos.png` | Centro de Datos | Packet Tracer |
| F15 | 12.2 | `capturas/areas/02-centro-id.png` | Centro de I+D | Packet Tracer |
| F16 | 12.3 | `capturas/areas/03-edificio-corporativo.png` | Edificio Corporativo | Packet Tracer |
| F17 | 12.4 | `capturas/areas/04-planta-produccion.png` | Planta de Producción | Packet Tracer |
| F18 | 16 | `diagrama/13-dominios-broadcast-campus.svg` | Las 5 VLANs como dominios independientes sobre la planta física | Excalidraw |
| F19 | 18 | `diagrama/14-arbol-stp.svg` | Root Bridge por VLAN y puertos bloqueados | Excalidraw |

Las **evidencias E1–E14** (salidas de `show`, pings y pruebas de falla) están listadas con su
comando y su sección en `capturas/EVIDENCIAS.md`.

---

## Mapa de lecciones → secciones

<!-- TABLERO DE AVANCE DEL MANUAL. Se marca al cerrar cada lección. Borrar esta sección completa antes de entregar. -->

| Lección | Tema | Secciones que cierra | Estado |
|---|---|---|---|
| **1** | Dominios de colisión y broadcast · Medios de transmisión | §2, §3, §8 · borrador §11.1, §15, §16, §20 | ⬜ |
| **2** | Topología jerárquica y Capa 1 en Packet Tracer | §1, §11, §12, §20 (cierre) | ⬜ |
| **3** | VLANs y enlaces troncales 802.1Q | §4, §13, §14, §16 (cierre) | ⬜ |
| **4** | VTP: Server, Client y Transparent | §5, §17 | ⬜ |
| **5** | STP/PVST+ y EtherChannel LACP | §6, §7, §18, §19 | ⬜ |
| **6** | Seguridad de Capa 2 y segmento Legacy | §9, §21, §22, §15 (cierre) | ⬜ |
| **7** | Verificación, pruebas y evidencia | §23, §24, §27 | ⬜ |
| **8** | Cierre: presupuesto, conclusiones y referencias | §26, §28, §29 | ⬜ |
| **9** | Parte física en laboratorio (depende del calendario) | §25 | ⬜ |

Leyenda: ⬜ pendiente · 🟡 en curso · ✅ cerrada

---

# Parte I — Marco Teórico

## 1. Introducción y alcance

<!-- 2–3 párrafos: qué es SmartCity Tech Park, qué se le pide al diseño (Capa 1 y Capa 2), qué contiene este manual y cómo está organizado (teoría → práctica). Modelo: §1 del ManualTecnico.md de la Práctica 1. -->

El complejo tecnológico SmartCity Tech Park integra cuatro áreas —Centro de Datos, Centro de Investigación y Desarrollo, Edificio Corporativo y Planta de Producción— que hoy operan sobre una red plana. Este manual documenta el rediseño de su infraestructura en las **Capas 1 y 2 del modelo OSI**: topología jerárquica, segmentación lógica con VLANs, administración centralizada con VTP, prevención de bucles con Spanning Tree y agregación de enlaces con EtherChannel.

El documento se organiza en dos partes. La **Parte I (Marco Teórico)** expone los conceptos que sustentan cada decisión de diseño. La **Parte II (Marco Práctico)** presenta la implementación en Cisco Packet Tracer con su evidencia, citando en cada caso la sección teórica que la respalda.

## 2. El problema de la red plana

<!-- Describir con precisión los síntomas del enunciado (§3 y §4.1): dominio de broadcast único, dominio de colisión compartido en la Planta, enlaces saturados, rutas únicas. Cerrar con la tabla síntoma → causa → tecnología que lo resuelve. -->

![La red plana del campus y sus síntomas](diagrama/01-red-plana-problema.svg)

**Figura 1 — La red plana actual.**
<!-- EXCALIDRAW F1: las cuatro áreas colgando de un mismo bloque de switches sin jerarquía; una nube de broadcast que las envuelve a todas; el hub de la Planta con flechas de colisión; un solo cable por enlace marcado como punto único de falla. Rojo para el problema, gris para lo neutro. -->

| Síntoma en el campus | Causa en Capa 1/2 | Tecnología que lo resuelve | Sección |
|---|---|---|---|
| Tráfico administrativo mezclado con el de invitados | Un solo dominio de broadcast | VLANs | §4 |
| Colisiones continuas en el segmento industrial | Hub: dominio de colisión compartido | Switch de acceso + contención | §3, §21 |
| Enlaces saturados hacia servidores e I+D | Un solo enlace físico por trunk | EtherChannel | §7 |
| Caída total ante la falla de un cable o switch | Rutas únicas, sin redundancia | Topología redundante + STP | §6 |
| VLANs inconsistentes entre switches | Administración manual por equipo | VTP | §5 |

## 3. Dominios de colisión y dominios de broadcast

### 3.1 Dominio de colisión
<!-- Definición, CSMA/CD, half vs full duplex. Regla de conteo: hub = 1 dominio para todo lo conectado; switch = 1 dominio por puerto activo; router también separa. -->

![Hub frente a switch: dominios de colisión](diagrama/02-dominios-colision.svg)

**Figura 2 — El hub comparte un dominio de colisión; el switch crea uno por puerto.**
<!-- EXCALIDRAW F2: dos escenas lado a lado. Izquierda: hub con 4 PCs, un solo óvalo rojo que abarca los 4 enlaces, rótulo "1 dominio de colisión · half-duplex · CSMA/CD". Derecha: switch con 4 PCs, cuatro óvalos verdes independientes, rótulo "4 dominios · full-duplex · sin colisiones". -->

### 3.2 Dominio de broadcast
<!-- Definición, trama FF:FF:FF:FF:FF:FF, inundación. Lo delimitan el router y la VLAN. Red plana con N switches = 1 dominio; con VLANs = 1 por VLAN. -->

![Red plana frente a red segmentada en VLANs](diagrama/03-dominios-broadcast.svg)

**Figura 3 — Un dominio de broadcast en la red plana; uno por VLAN tras la segmentación.**
<!-- EXCALIDRAW F3: arriba, tres switches encadenados con PCs de distinto color, una sola nube que los cubre a todos, rótulo "1 dominio de broadcast". Abajo, los mismos switches con las PCs agrupadas por color en nubes separadas, rótulo "1 dominio por VLAN". Dibujar la trama FF:FF:FF:FF:FF:FF propagándose en el primero y deteniéndose en el segundo. -->

### 3.3 Comparación

| Criterio | Dominio de colisión | Dominio de broadcast |
|---|---|---|
| Capa OSI | 1 (medio físico) | 2 (direccionamiento MAC) |
| Lo crea | Medio compartido (hub, half-duplex) | Alcance de una trama de difusión |
| Lo separa | Switch (por puerto), router | Router, VLAN |
| Cómo se cuenta | Puertos activos de switch + 1 por hub | Una por VLAN activa |

## 4. VLANs y enlaces troncales IEEE 802.1Q

### 4.1 Qué es una VLAN
### 4.2 Puertos de acceso y puertos troncales
### 4.3 Etiquetado 802.1Q y VLAN nativa
<!-- Explicar el tag de 4 bytes, por qué la nativa viaja sin etiqueta, riesgo de dejar la VLAN 1 (VLAN hopping) y por qué el enunciado exige cambiarla a la 94. -->

| Puerto | Qué transporta | Etiqueta 802.1Q | Se usa hacia |
|---|---|---|---|
| Access | Una VLAN | No | PCs, servidores, AP, hub |
| Trunk | Varias VLANs | Sí (excepto la nativa) | Otros switches |

![Puerto de acceso y puerto troncal](diagrama/04-access-vs-trunk.svg)

**Figura 4 — Un puerto access entrega una sola VLAN sin etiqueta; un trunk transporta varias etiquetadas.**
<!-- EXCALIDRAW F4: switch izquierdo con tres PCs de colores distintos en puertos access (tramas sin tag) y un enlace trunk al switch derecho por el que viajan las tres tramas, cada una con un rectángulo "TAG 14 / 24 / 34" adosado, más una cuarta sin tag rotulada "VLAN nativa 94". -->

![Trama Ethernet con etiqueta 802.1Q](diagrama/05-trama-8021q.svg)

**Figura 5 — Inserción del tag 802.1Q de 4 bytes en la trama Ethernet.**
<!-- EXCALIDRAW F5: dos barras horizontales. Arriba, trama normal: MAC destino | MAC origen | Tipo | Datos | FCS. Abajo, la misma con el bloque de 4 bytes insertado tras MAC origen, desglosado en TPID 0x8100 (2 B) | PCP 3 b | DEI 1 b | VLAN ID 12 b. Anotar "12 bits → 4096 VLANs" y "la nativa viaja por la barra de arriba, sin tag". -->

## 5. VLAN Trunking Protocol (VTP)

### 5.1 Propósito y funcionamiento
### 5.2 Modos Server, Client y Transparent

| Modo | Crea/borra VLANs | Adopta anuncios | Reenvía anuncios | Uso típico |
|---|---|---|---|---|
| Server | Sí | Sí | Sí | Núcleo que administra el dominio |
| Client | No | Sí | Sí | Distribución y acceso |
| Transparent | Solo localmente | No | Sí (v2) | Switch que debe aislarse de la administración |

![Propagación de anuncios VTP entre los tres modos](diagrama/06-vtp-modos.svg)

**Figura 6 — El Server anuncia, el Client adopta, el Transparent reenvía sin adoptar.**
<!-- EXCALIDRAW F6: cadena de cuatro switches. Server (crea VLANs) → Client (las adopta, marcado ✔) → Transparent (la flecha lo atraviesa pero su base de VLANs queda con candado y VLANs propias) → Client (vuelve a adoptar). Rotular el dominio "Smart_8" y la contraseña como un candado sobre los enlaces. -->

<!-- EXCALIDRAW opcional: el escenario del número de revisión más alto borrando el dominio; si no da el tiempo, se explica solo con texto en §5.3. -->

### 5.3 El número de revisión de configuración
<!-- Por qué un switch con revisión más alta puede borrar las VLANs del dominio; mitigación (transparent → client, contraseña). -->

## 6. Spanning Tree Protocol y PVST+

### 6.1 El problema del bucle de Capa 2

![Tormenta de broadcast en un triángulo de switches](diagrama/07-bucle-capa2.svg)

**Figura 7 — Sin STP, una sola trama de difusión circula indefinidamente y multiplica su copia.**
<!-- EXCALIDRAW F7: tres switches en triángulo, una PC emitiendo un broadcast; flechas curvas rojas girando en ambos sentidos con rótulos "copia 1, copia 2, copia 4…"; anotar los tres efectos: tormenta, inestabilidad de la tabla MAC y tramas duplicadas. Ethernet no tiene TTL: subrayarlo. -->

### 6.2 Elección del Root Bridge y cálculo de costos
<!-- Bridge ID = prioridad + MAC; BPDU; costos por velocidad; estados de puerto; por qué conviene fijar el Root a mano. -->
### 6.3 PVST+ frente a Rapid-PVST+
<!-- Una instancia por VLAN; convergencia 30–50 s vs segundos; el carné par asigna PVST. -->

| Velocidad del enlace | 10 Mbps | 100 Mbps | 1 Gbps | 10 Gbps |
|---|---|---|---|---|
| Costo STP por defecto | 100 | 19 | 4 | 2 |

![Elección del Root Bridge y bloqueo de puerto](diagrama/08-eleccion-root-bridge.svg)

**Figura 8 — El Bridge ID elige la raíz; el costo acumulado decide qué puerto se bloquea.**
<!-- EXCALIDRAW F8: el mismo triángulo de la F7. Cada switch con su recuadro "Prioridad + MAC". El de menor BID coronado como Root. Cada enlace rotulado con su costo (4, 19). En cada switch no raíz, el Root Port marcado en verde y, en el enlace sobrante, un puerto con candado rojo "Altn BLK". Anotar los estados Blocking → Listening → Learning → Forwarding con sus tiempos. -->

<!-- La guía del 2960 tabula hasta 1 Gbps (100/19/4); el valor 2 para 10 Gbps viene de la tabla ampliada de 802.1D-2004. Citar la fuente que se use. -->

## 7. EtherChannel y LACP

### 7.1 Agregación de enlaces: capacidad y tolerancia a fallos

![Cuatro enlaces físicos agrupados en un port-channel](diagrama/09-etherchannel-lacp.svg)

**Figura 9 — Cuatro enlaces físicos se presentan a STP como un único enlace lógico.**
<!-- EXCALIDRAW F9: izquierda, dos switches unidos por 4 cables donde STP bloquea 3 (candados rojos) y rotula "3 Gbps desperdiciados". Derecha, los mismos 4 cables envueltos en una cápsula "Po1" con un solo enlace lógico hacia STP, rótulo "4 Gbps · si cae un miembro, quedan 3". -->

### 7.2 LACP (IEEE 802.3ad) frente a PAgP

| | LACP | PAgP |
|---|---|---|
| Estándar | IEEE 802.3ad (abierto) | Propietario Cisco |
| Modos | active / passive | desirable / auto |
| Combinación que forma el canal | active–active, active–passive | desirable–desirable, desirable–auto |

### 7.3 Interacción con Spanning Tree
<!-- STP ve el port-channel como un solo enlace: no bloquea los miembros. -->

## 8. Medios de transmisión: cobre y fibra óptica

<!-- Criterios: distancia (100 m del cobre), ancho de banda, inmunidad electromagnética (ambiente industrial), costo. Cuándo conviene cada uno en un campus de varios edificios. Modelo: §8 del ManualTecnico.md de la Práctica 1. -->

| Medio | Alcance típico | Ancho de banda | Inmunidad EMI | Costo relativo | Uso recomendado en el campus |
|---|---|---|---|---|---|
| UTP Cat 6 | 100 m (1 Gbps) | 1 Gbps | Baja | Bajo | Horizontal dentro de cada edificio |
| UTP Cat 6A | 100 m (10 Gbps) | 10 Gbps | Media (F/UTP) | Medio | Troncales cortos intraedificio |
| Fibra multimodo OM3/OM4 | 300–550 m (10 Gbps) | 10–40 Gbps | Total | Alto (transceptores) | Troncales entre edificios |
| Fibra monomodo OS2 | 10 km+ | 10–100 Gbps | Total | Alto | Distancias largas |

![Alcance y ancho de banda de cobre y fibra](diagrama/10-medios-transmision.svg)

**Figura 10 — El límite de 100 m del cobre decide qué enlaces del campus van en fibra.**
<!-- EXCALIDRAW F10: eje horizontal de distancia (0 → 10 km) con las barras de UTP Cat 6/6A cortadas en 100 m, OM3/OM4 hasta 550 m y OS2 hasta 10 km. Encima, siluetas de los cuatro edificios con las distancias asumidas entre ellos, para que se vea cuáles caen fuera del alcance del cobre. Marcar el ícono de interferencia electromagnética sobre la Planta de Producción. -->

## 9. Seguridad básica en Capa 2

### 9.1 Superficie de ataque de un switch
<!-- Qué ataques vive un switch sin configurar: VLAN hopping (double tagging por la nativa), MAC flooding, broadcast storms, acceso a consola sin aviso legal. -->

![VLAN hopping por doble etiquetado y MAC flooding](diagrama/11-seguridad-capa2.svg)

**Figura 11 — Dos ataques que la configuración por defecto permite.**
<!-- EXCALIDRAW F11: dos escenas. Arriba, VLAN hopping: atacante en la VLAN nativa envía una trama con dos tags (94 + 44); el primer switch quita el externo y el segundo la entrega en la VLAN 44 → flecha roja hasta el servidor. Abajo, MAC flooding: atacante generando MACs falsas hasta llenar la tabla CAM, y el switch inundando todo por todos los puertos. Al lado de cada una, la contramedida: "nativa 94 sin puertos access" y "port-security". -->

### 9.2 Medidas aplicables y qué mitiga cada una

| Medida | Comando base | Qué ataque o falla mitiga | Qué NO resuelve |
|---|---|---|---|
| Banner MOTD | `banner motd` | Acceso sin aviso legal | No impide el acceso |
| VLAN nativa distinta de la 1 | `switchport trunk native vlan 94` | VLAN hopping por doble etiquetado | |
| VLANs permitidas en el trunk | `switchport trunk allowed vlan` | Propagación innecesaria de broadcast | |
| `port-security` | `switchport port-security` | MAC flooding, equipos no autorizados | |
| `storm-control` | `storm-control broadcast level` | Tormentas de broadcast y del segmento Legacy | La colisión del hub (§21) |

### 9.3 Puertos no utilizados
<!-- Apagado administrativo (`shutdown`) y confinamiento a una VLAN muerta: por qué es buena práctica y si el enunciado lo exige o es valor agregado. -->

---

# Parte II — Marco Práctico

## 10. Parámetros de diseño derivados del carné

Carné **201905884**: penúltimo dígito **8**, último dígito **4** (par).

| Parámetro | Regla del enunciado | Valor aplicado |
|---|---|---|
| VLANs | `1X` … `5X` con X = 4 | 14, 24, 34, 44, 54 |
| VLAN nativa de los trunks | `9X` | **94** |
| Dominio VTP | `Smart_#` | **Smart_8** |
| Contraseña VTP | fija | `proyecto12S2026` |
| EtherChannel | LACP si par | **LACP** |
| Spanning Tree | PVST si par | **PVST+** (`spanning-tree mode pvst`) |
| Banner MOTD (distribución) | `Acceso Restringido - TechPark_[Carné]` | `Acceso Restringido - TechPark_201905884` |
| Archivo | `Proyecto1_#carnet.pkt` | `Proyecto1_201905884.pkt` |

## 11. Topología general

<!-- Captura de la topología completa con los medios etiquetados. Explicar la jerarquía: Core → distribución → acceso. -->

![Topología completa del campus](capturas/topologia/00-topologia-completa.png)

**Figura 12 — Topología completa en Packet Tracer.** <!-- una o dos líneas de lectura de la figura -->

![Topología lógica del campus](diagrama/12-topologia-logica.svg)

**Figura 13 — Topología lógica: jerarquía, VLANs por área y canales agregados.**
<!-- EXCALIDRAW F13: redibujo limpio de la F12 (la captura de Packet Tracer se lee mal impresa). Tres niveles marcados con bandas horizontales: Core, distribución, acceso. Cada enlace con su medio (fibra en naranja, UTP en azul) y su velocidad. Po1 y Po2 como cápsulas. Cada bloque de acceso rotulado con su VLAN. -->

### 11.1 Inventario de dispositivos

| Hostname | Modelo (PT) | Área | Rol | Modo VTP |
|---|---|---|---|---|
| SW-CORE | | Centro de Datos | Core / VTP Server | Server |
| SW-SRV | | Centro de Datos | Acceso servidores | Client |
| SW-DIST-ID | | Centro de I+D | Distribución | Client |
| SW-ID-1 / 2 / 3 | | Centro de I+D | Acceso (anillo) | Client |
| SW-DIST-CORP | | Edificio Corporativo | Distribución | Client |
| SW-ALA-A / SW-ALA-B | | Edificio Corporativo | Acceso | Client |
| SW-COMUNES | | Edificio Corporativo | Acceso visitantes | Transparent |
| SW-PLANTA | | Planta de Producción | Acceso | Client |
| HUB-LEGACY | Hub-PT | Planta de Producción | Segmento Legacy | — |
| AP-VISITANTES | AccessPoint-PT | Edificio Corporativo | Inalámbrico | — |

## 12. Diseño por área

<!-- Para cada área: captura, qué exige el enunciado, cómo se resolvió y por qué (citar §3–§9). -->

<!-- Estructura fija de cada subsección: captura → tabla requisito/solución/justificación → párrafo de lectura. -->

### 12.1 Centro de Datos (Core)
![Centro de Datos](capturas/areas/01-centro-de-datos.png)

**Figura 14 — Centro de Datos.**

| Requisito del enunciado | Cómo se resolvió | Justificación (§) |
|---|---|---|
| VTP Server del dominio | | §5.2 |
| Trunks hacia los 3 edificios | | §4.2 |
| Granja de ≥ 4 servidores con enlace redundante de alto tráfico | | §7.1 |

### 12.2 Centro de I+D
![Centro de I+D](capturas/areas/02-centro-id.png)

**Figura 15 — Centro de I+D.**

| Requisito del enunciado | Cómo se resolvió | Justificación (§) |
|---|---|---|
| ≥ 3 switches interconectados; la caída de uno no aísla a los demás | | §6.1 |
| Trunk al Core de mayor ancho de banda del campus | | §7.1, §8 |
| ≥ 8 PCs/laptops | | — |

### 12.3 Edificio Corporativo
![Edificio Corporativo](capturas/areas/03-edificio-corporativo.png)

**Figura 16 — Edificio Corporativo.**

| Requisito del enunciado | Cómo se resolvió | Justificación (§) |
|---|---|---|
| Dos alas, cada una con su switch de acceso | | — |
| Conectividad entre alas que sobreviva a la caída de la ruta al distribuidor | | §6.1, §6.2 |
| Áreas Comunes: aislamiento de tráfico y de administración de VLANs | | §4.1, §5.2 |
| Access Point para laptops de visitantes | | — |

### 12.4 Planta de Producción
![Planta de Producción](capturas/areas/04-planta-produccion.png)

**Figura 17 — Planta de Producción.**

| Requisito del enunciado | Cómo se resolvió | Justificación (§) |
|---|---|---|
| Hub con las máquinas industriales sobre un switch de acceso | | §3.1 |
| Dominio de colisión compartido visible y documentado | | §21.1 |
| Medidas de contención en el switch | | §9.2, §21.2 |

## 13. Tabla de VLANs

| VLAN ID | Nombre | Ubicación física | Dispositivos finales |
|---|---|---|---|
| 14 | Gerencia | Edificio Corporativo (Ala A y Ala B) | |
| 24 | Investigacion | Centro de I+D | ≥ 8 PCs/laptops |
| 34 | Produccion | Planta de Producción | Máquinas vía hub |
| 44 | Servidores | Centro de Datos | ≥ 4 servidores |
| 54 | Visitantes | Edificio Corporativo (Áreas Comunes) | Laptops vía AP |
| 94 | Nativa | Todos los trunks | — |

<!-- Confirmar con el tutor si los nombres van en MAYÚSCULAS (el ejemplo del enunciado dice "exactamente GERENCIA"). -->

## 14. Asignación de puertos por switch

<!-- Una tabla por switch. Columnas fijas. -->

### 14.1 SW-CORE
| Puerto | Modo | VLAN(s) | Conecta a | Medio |
|---|---|---|---|---|
| | | | | |

<!-- Repetir 14.2 … 14.n para cada switch. -->

## 15. Dominios de colisión de la red

<!-- Regla de §3.1: un dominio por puerto activo de switch; el hub y todo lo que cuelga de él forman UN dominio compartido. -->

| Dispositivo | Puertos activos | Dominios de colisión que genera | Observación |
|---|---|---|---|
| SW-CORE | | | |
| … | | | |
| HUB-LEGACY | n máquinas + 1 uplink | **1 (compartido)** | Segmento Legacy, véase §21 |
| **Total** | | | |

## 16. Dominios de broadcast de la red

![Los cinco dominios de broadcast del campus](diagrama/13-dominios-broadcast-campus.svg)

**Figura 18 — Cada VLAN es un dominio de broadcast independiente sobre la misma planta física.**
<!-- EXCALIDRAW F18: la topología lógica de la F13 en gris tenue de fondo, y encima cinco siluetas de color —14, 24, 34, 44, 54— que abarcan solo los puertos de su VLAN, cruzando edificios cuando corresponde. Es el mismo dibujo de la F3 aplicado al campus real. -->

| Dominio | VLAN | Alcance | Switches que la transportan |
|---|---|---|---|
| 1 | 14 Gerencia | | |
| 2 | 24 Investigacion | | |
| 3 | 34 Produccion | | |
| 4 | 44 Servidores | | |
| 5 | 54 Visitantes | | |
| 6 | 94 Nativa (control) | | |

## 17. VTP: servidor, modos y propagación

<!-- Captura de `show vtp status` en SW-CORE y en un Client; `show vlan brief` en un Client mostrando las VLANs propagadas. Justificar por qué el Core es el Server (§5.2) y por qué SW-COMUNES es Transparent. -->

![show vtp status en SW-CORE](capturas/evidencias/01-sw-core-show-vtp-status.png)

## 18. STP: Root Bridge por VLAN

<!-- Tabla VLAN → Root elegido → justificación (§6.2). Captura de `show spanning-tree` en el Root ("This bridge is the root") y en un switch con puerto bloqueado. -->

![Árbol STP resultante por VLAN](diagrama/14-arbol-stp.svg)

**Figura 19 — Root Bridge por VLAN y puertos bloqueados en el anillo de I+D y el triángulo de alas.**
<!-- EXCALIDRAW F19: la topología con los enlaces redundantes; corona sobre el switch raíz de cada VLAN (usar el color de la VLAN) y candado rojo sobre cada puerto en Blocking, con el nombre exacto de la interfaz. Debe coincidir con lo que muestren las evidencias E3 y E4. -->

| VLAN | Root Bridge | Prioridad | Justificación |
|---|---|---|---|
| 14 | | | |
| 24 | | | |
| 34 | | | |
| 44 | | | |
| 54 | | | |

## 19. EtherChannel implementados

<!-- Tabla por canal: extremos, puertos miembros, protocolo (LACP active), VLANs, justificación (§7). Captura de `show etherchannel summary` con SU / P. -->

| Port-channel | Extremo A | Extremo B | Puertos | Protocolo | Propósito |
|---|---|---|---|---|---|
| Po1 | SW-CORE | SW-SRV | | LACP active/active | Redundancia y capacidad hacia servidores |
| Po2 | SW-CORE | SW-DIST-ID | | LACP active/active | Trunk de mayor ancho de banda del campus |

## 20. Medios de transmisión por segmento

<!-- Tabla enlace → medio → distancia asumida → justificación (§8). Captura de las etiquetas en el .pkt. -->

| Enlace | Medio | Distancia asumida | Justificación |
|---|---|---|---|
| SW-CORE ↔ SW-DIST-ID | | | |
| SW-CORE ↔ SW-DIST-CORP | | | |
| SW-CORE ↔ SW-PLANTA | | | |
| Intraedificio (acceso) | UTP Cat 6 | < 100 m | |

## 21. Segmento Legacy: impacto y contención

### 21.1 Impacto del dominio de colisión compartido
<!-- Half-duplex, CSMA/CD, retransmisiones, latencia, visibilidad de tramas, propagación de fallas (§3.1). -->
### 21.2 Medidas de contención en el switch de acceso
<!-- Confinamiento a la VLAN 34, storm-control, port-security, un solo puerto para el hub. Qué mitigan y qué NO eliminan. -->

## 22. Seguridad básica aplicada

<!-- Captura del banner al entrar a un switch de distribución; `show interfaces trunk` mostrando nativa 94. -->

## 23. Comandos de configuración por dispositivo

<!-- Bloques por hostname, en el orden en que se ejecutaron. La configuración completa (`show running-config`) va en configs/<hostname>.txt; aquí los comandos relevantes con comentario de propósito. -->

### 23.1 SW-CORE
```
```

## 24. Evidencia de pruebas

<!-- Obligatorias: show spanning-tree, show etherchannel summary, show interfaces trunk. Además: ping intra-VLAN (0 % loss), ping inter-VLAN (100 % loss), prueba de falla (apagar un switch de I+D / un uplink de ala). Índice completo en capturas/EVIDENCIAS.md. -->

| # | Prueba | Dispositivo | Comando | Resultado esperado | Captura |
|---|---|---|---|---|---|
| 1 | Árbol STP | | `show spanning-tree` | Root correcto, puertos BLK donde corresponde | |
| 2 | Canales | | `show etherchannel summary` | Po en `SU`, puertos `P` | |
| 3 | Trunks | | `show interfaces trunk` | Nativa 94, VLANs permitidas | |
| 4 | Conectividad intra-VLAN | PC | `ping` | 0 % loss | |
| 5 | Aislamiento inter-VLAN | PC | `ping` | 100 % loss | |
| 6 | Tolerancia a fallos I+D | | apagar un switch | Los otros dos siguen conectados | |
| 7 | Tolerancia a fallos alas | | apagar uplink | Ala A ↔ Ala B sigue activo | |
| 8 | Aislamiento de visitantes | PC VLAN 54 | `ping` a servidor | 100 % loss | |
| 9 | Propagación VTP | Switch Client | `show vlan brief` | Las 5 VLANs + la 94 | |

### 24.1 Detalle de cada prueba

<!-- Una ficha por prueba, con la misma estructura. El resultado OBTENIDO se transcribe del simulador, no se anticipa: si no coincide con el esperado, se documenta la causa y la corrección. -->

#### Prueba N — <título>

| Campo | Contenido |
|---|---|
| **Objetivo** | Qué propiedad del diseño se está comprobando |
| **Escenario** | Dispositivo de origen, destino y estado previo de la red |
| **Procedimiento** | Comandos exactos ejecutados, en orden |
| **Resultado esperado** | |
| **Resultado obtenido** | <!-- transcripción literal de la salida --> |
| **Veredicto** | ✅ pasa / ❌ falla — y qué se corrigió |
| **Evidencia** | `capturas/evidencias/NN-<dispositivo>-<comando>.png` |

### 24.2 Pruebas de tolerancia a fallos

<!-- Las dos que el enunciado exige explícitamente. Documentar los tres momentos: antes (topología normal, qué puerto está en BLK), durante (interfaz apagada) y después (el puerto bloqueado pasa a FWD y el ping se recupera). Anotar el tiempo de convergencia observado y contrastarlo con los 30–50 s teóricos de PVST+ (§6.3). -->

| Falla inducida | Qué debe sobrevivir | Puerto que pasa a Forwarding | Tiempo de convergencia | Veredicto |
|---|---|---|---|---|
| Apagado de un switch de I+D | Conectividad entre los otros dos | | | |
| Caída del uplink de un ala al distribuidor | Ala A ↔ Ala B por el enlace directo | | | |
| Caída de un miembro del Po1 | El canal sigue activo con capacidad reducida | | | |

### 24.3 Resumen de resultados

| Pruebas ejecutadas | Aprobadas | Falladas y corregidas | Pendientes |
|---|---|---|---|
| | | | |

## 25. Parte física: laboratorio

<!-- Switch 1 (Server) y Switch 2 (Client) reales; VLANs por carné propagadas; trunk entre ellos; access hacia PCs. Fotos y salidas de show en capturas/laboratorio/. Indicar pareja y fecha. -->

## 26. Presupuesto estimado

<!-- Switches, módulos SFP de fibra, cable UTP y fibra, patch cords. Moneda y fuente de cada precio. Modelo: §20 del ManualTecnico.md de la Práctica 1. -->

| Ítem | Descripción | Cantidad | Precio unitario (USD) | Subtotal | Fuente |
|---|---|---|---|---|---|
| | | | | | |
| **Total** | | | | | |

## 27. Análisis de PDUs en Modo Simulación (opcional)

<!-- BPDU: señalar Root ID, Bridge ID y costo. PDU VTP: Domain Name y Configuration Revision Number. Capturas en capturas/evidencias/. -->

## 28. Conclusiones

## 29. Referencias

<!-- Mismo formato que §23 de la Práctica 1: normas, bibliografía del curso, documentación oficial (los enlaces del enunciado §5), catálogos para el presupuesto. -->

**Normas técnicas**

1. IEEE 802.1Q — *Bridges and Bridged Networks* (VLAN tagging).
2. IEEE 802.1D — *Spanning Tree Protocol*.
3. IEEE 802.3ad — *Link Aggregation* (LACP).

**Documentación oficial**

4. Cisco. *Configure VLAN Trunks* (Catalyst 9000). <https://www.cisco.com/c/en/us/td/docs/switches/lan/c9000/lyr2-fwd/vlan/vlan-configuration-guide/configure-vlan-trunks.html>
5. Cisco. *Understanding VLAN Trunk Protocol (VTP)*, documento 10558. <https://www.cisco.com/c/en/us/support/docs/lan-switching/vtp/10558-21.html>
6. Cisco. *Configuring STP* (Catalyst 2960, IOS 12.2(53)SE). <https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst2960/software/release/12-2_53_se/configuration/guide/2960scg/swstp.html>
7. Cisco. *Configuring EtherChannels* (Catalyst 2960, IOS 12.2(53)SE). <https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst2960/software/release/12-2_53_se/configuration/guide/2960scg/swethchl.html>

**Bibliografía del curso**

8. Odom, Wendell. 2019. *CCNA 200-301 Official Cert Guide*, Vol. 1. Indianápolis: Cisco Press.
9. Cisco Networking Academy. *Switching, Routing, and Wireless Essentials*. <https://www.netacad.com/>
