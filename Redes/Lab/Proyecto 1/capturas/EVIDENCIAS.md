# Evidencias del Proyecto 1 — SmartCity Tech Park

**Carné:** 201905884 · **X = 4, # = 8** · **Archivo:** `Proyecto1_201905884.pkt`
**Parámetros:** VLANs 14/24/34/44/54 · nativa 94 · VTP `Smart_8` · LACP · PVST+

Todas las capturas se toman sobre la simulación corriendo en Packet Tracer, a resolución completa
de la ventana del dispositivo, de modo que en la barra de título se vea **de qué equipo salió cada
salida**. Nombre de archivo: `NN-<dispositivo>-<comando>.png`, en minúsculas y con guiones.

El manual usa dos series: las **Figuras (F)** son vistas de la topología y diagramas de Excalidraw
(`../diagrama/`), y las **Evidencias (E)** son salidas de comandos y pruebas. El índice completo de
figuras está al inicio de `../README.md`.

## Carpetas

| Carpeta | Contenido | Serie | Sección del manual |
|---|---|---|---|
| `topologia/` | Topología completa con medios etiquetados | F12 | §11 |
| `areas/` | Una captura por área (Core, I+D, Corporativo, Planta) | F14–F17 | §12 |
| `evidencias/` | Salidas de `show`, pings, pruebas de falla, PDUs | E1–E14 | §17–§24, §27 |
| `laboratorio/` | Fotos y salidas de los switches reales (parte física) | L1–L4 | §25 |

---

## Vistas de la topología (Figuras)

| Fig. | Archivo | Qué evidencia | § |
|---|---------|---------------|---|
| F12 | `topologia/00-topologia-completa.png` | Jerarquía Core → distribución → acceso, medios etiquetados | 11 |
| F14 | `areas/01-centro-de-datos.png` | Core VTP Server + granja de servidores por EtherChannel | 12.1 |
| F15 | `areas/02-centro-id.png` | Anillo de 3 switches, ≥ 8 estaciones, trunk de mayor capacidad | 12.2 |
| F16 | `areas/03-edificio-corporativo.png` | Dos alas con enlace directo, Áreas Comunes con AP | 12.3 |
| F17 | `areas/04-planta-produccion.png` | Hub Legacy colgado de un puerto del switch de acceso | 12.4 |

## Salidas y pruebas (Evidencias)

| Ev. | Archivo | Dispositivo | Comando / acción | Qué evidencia | § |
|---|---------|-------------|------------------|---------------|---|
| E1 | `evidencias/01-sw-core-show-vtp-status.png` | SW-CORE | `show vtp status` | Modo **Server**, dominio `Smart_8`, versión 2 | 17 |
| E2 | `evidencias/02-sw-ala-a-show-vlan-brief.png` | SW-ALA-A (Client) | `show vlan brief` | VLANs 14/24/34/44/54/94 propagadas **sin crearse localmente** | 17, 24 |
| E3 | `evidencias/03-show-spanning-tree-raices.png` | SW-DIST-CORP, SW-DIST-ID, SW-CORE | `show spanning-tree` | **`This bridge is the root`** en el switch previsto para cada VLAN | 18, 24 |
| E4 | `evidencias/04-puerto-bloqueado.png` | SW-ALA-B, SW-ID-3 | `show spanning-tree vlan 14` / `vlan 24` | `Gi0/2` y `Fa0/24` en rol `Altn`, estado `BLK` | 18, 24 |
| E5 | `evidencias/05-sw-core-show-etherchannel-summary.png` | SW-CORE | `show etherchannel summary` | `Po1(SU)` y `Po2(SU)`, los 4 miembros en `(P)` | 19, 24 |
| E6 | `evidencias/06-show-interfaces-trunk.png` | SW-CORE, SW-DIST-CORP | `show interfaces trunk` | `Native vlan 94` y la lista `allowed` de cada trunk | 20, 22, 24 |
| E7 | `evidencias/07-banner-motd.png` | SW-DIST-CORP | inicio de sesión por consola | `Acceso Restringido - TechPark_201905884` | 22 |
| E8 | `evidencias/08-sw-planta-port-security.png` | SW-PLANTA | `show port-security interface Fa2/1` | `Maximum: 5`, `Violation Mode: Restrict` | 21.2, 22 |
| E9 | `evidencias/09-ping-intra-vlan.png` | PC-GER-1 → PC-GER-4 | `ping` | **0 % de pérdida** en la misma VLAN 14, en switches distintos | 24 |
| E10 | `evidencias/10-ping-inter-vlan.png` | PC-GER-1 → SRV-BD | `ping` | **100 % de pérdida** entre VLAN 14 y 44 — comportamiento **correcto** | 24 |
| E11 | `evidencias/11-ping-visitantes-servidor.png` | PC-VIS-1 (VLAN 54) → SRV-BD | `ping` | **100 % de pérdida**: aislamiento de visitantes | 24 |
| E12 | `evidencias/12-falla-sw-id-2.png` | — | apagar SW-ID-2 (prueba F-1) | SW-ID-1 y SW-ID-3 siguen conectados · tiempo de convergencia | 24.2 |
| E13 | `evidencias/13-falla-uplink-ala-b.png` | — | apagar `Gi0/1` de SW-ALA-B (F-2) | Ala A ↔ Ala B por el enlace directo · tiempo de convergencia | 24.2 |
| E14 | `evidencias/14-falla-miembro-po1.png` | — | apagar `Gi1/1` de SW-CORE (F-3) | El canal sigue activo · recuperación **≈ inmediata**, sin reconvergencia de STP | 24.2 |

**Opcionales — Modo Simulación (§27).** No llevan número de la serie E porque el enunciado las marca
como opcionales: `evidencias/op-bpdu.png` (Root ID, Bridge ID y costo en una BPDU),
`evidencias/op-pdu-vtp.png` (Domain Name y Configuration Revision Number) y
`evidencias/op-trama-8021q.png` (el campo VLAN ID del tag dentro de un trunk).

**Las tres capturas por prueba de falla.** Cada evidencia E12–E14 no es una imagen sino tres:
*antes* (topología normal, con el puerto en `BLK`), *durante* (interfaz apagada y el ping perdiendo
paquetes) y *después* (el puerto en `FWD` y el ping recuperado). Se nombran con sufijo
`-antes`, `-durante`, `-despues`.

## Laboratorio (parte física)

| Ev. | Archivo | Qué evidencia | § |
|---|---------|---------------|---|
| L1 | `laboratorio/01-topologia-fisica.jpg` | Los dos switches reales y el cableado del trunk | 25 |
| L2 | `laboratorio/02-sw1-show-vtp-status.png` | Switch 1 en modo Server, dominio `Smart_8` | 25 |
| L3 | `laboratorio/03-sw2-show-vlan-brief.png` | Switch 2 (Client) con las VLANs propagadas | 25 |
| L4 | `laboratorio/04-ping-entre-pcs.png` | Conectividad entre PCs de la misma VLAN en switches distintos | 25 |

<!-- Al agregar una captura: nombrarla según la convención, subirla a su carpeta y completar la fila. -->

---

## Lo que hay que saber leer de cada captura

Una captura sin la línea señalada no prueba nada. Ésta es la línea que hay que buscar en cada una:

| Ev. | La línea que demuestra el punto | Por qué esa y no otra |
|---|---|---|
| **E1** | `VTP Operating Mode : Server` · `VTP Domain Name : Smart_8` | Demuestra que el Core administra el dominio del carné, no uno cualquiera |
| **E1** | `Configuration Revision : N` | El número que, si llega más alto desde otro switch, borra el dominio (§5.3) |
| **E2** | Las filas `14 GERENCIA`, `24 INVESTIGACION`… en un switch **Client** | Si aparecen sin haberlas creado ahí, VTP propagó. Es *la* prueba de §17 |
| **E3** | `This bridge is the root` | Frase literal. Debe salir en SW-DIST-CORP para las VLANs 14 y 54, en SW-DIST-ID para la 24 y en SW-CORE para la 34 y la 44 |
| **E3** | `Priority 24576` (o `24590`, `24600`…) | La prioridad efectiva incluye el ID de sistema extendido: `24576 + VLAN` (§6.3) |
| **E4** | `Gi0/2  Altn BLK  4  128.2  P2p` | `Altn` es el rol y `BLK` el estado. Juntos prueban que STP rompió el ciclo |
| **E5** | `Po1(SU)` y `Po2(SU)` | `S` = canal de Capa 2, `U` = *in use* |
| **E5** | `Gi1/1(P)   Gi1/2(P)` | `(P)` = *bundled*. Un miembro en `(I)` significa que LACP **no** negoció |
| **E6** | Columna `Native vlan` = `94` | Si sale `1`, la nativa no se cambió y el vector de VLAN hopping sigue abierto (§4.3) |
| **E6** | Columna `Vlans allowed on trunk` | Debe coincidir con las listas de §14, trunk por trunk |
| **E7** | `Acceso Restringido - TechPark_201905884` | Texto **literal** del carné. Un carácter distinto y no cuenta |
| **E8** | `Maximum MAC Addresses : 5` · `Violation Mode : Restrict` | `Restrict` y no `Shutdown`: es la decisión justificada en §21.2 |
| **E9** | `Success rate is 100 percent (5/5)` | 0 % de pérdida dentro de la VLAN 14, entre switches distintos |
| **E10** | `Success rate is 0 percent (0/5)` | **El fallo es el resultado correcto**: demuestra el aislamiento inter-VLAN (§4.1) |
| **E11** | `Success rate is 0 percent (0/5)` | Ídem, desde la VLAN 54 hacia la 44 |
| **E12–E13** | El puerto que estaba en `BLK` ahora en `FWD`, y el cronómetro | Contrastar con los 30–50 s teóricos de PVST+ (§6.2) |
| **E14** | `Po1(SU)` con **un solo** miembro en `(P)` y el ping **sin cortes** | Demuestra la diferencia entre agregación y redundancia por STP (§7.3). Si aquí también tarda 30 s, el canal no se formó |
