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
| E1 | `evidencias/01-sw-core-show-vtp-status.png` | SW-CORE | `show vtp status` | Modo Server, dominio `Smart_8`, revisión, 5 VLANs | 17 |
| E2 | `evidencias/02-<client>-show-vlan-brief.png` | (un Client) | `show vlan brief` | VLANs 14/24/34/44/54 propagadas sin crearse localmente | 17 |
| E3 | `evidencias/03-sw-core-show-spanning-tree.png` | SW-CORE | `show spanning-tree` | **`This bridge is the root`** en las VLANs asignadas | 18 |
| E4 | `evidencias/04-<switch>-puerto-bloqueado.png` | (I+D o ala) | `show spanning-tree vlan NN` | Puerto `Altn BLK`: el que rompe el bucle | 18 |
| E5 | `evidencias/05-sw-core-show-etherchannel-summary.png` | SW-CORE | `show etherchannel summary` | Po1/Po2 en `SU`, miembros en `P` | 19 |
| E6 | `evidencias/06-<switch>-show-interfaces-trunk.png` | (distribución) | `show interfaces trunk` | Nativa 94, VLANs permitidas | 20, 22 |
| E7 | `evidencias/07-banner-motd.png` | (distribución) | inicio de sesión | `Acceso Restringido - TechPark_201905884` | 22 |
| E8 | `evidencias/08-ping-intra-vlan.png` | PC | `ping` | 0 % loss dentro de la misma VLAN | 24 |
| E9 | `evidencias/09-ping-inter-vlan.png` | PC | `ping` | 100 % loss entre VLANs distintas | 24 |
| E10 | `evidencias/10-falla-switch-id.png` | — | apagar un switch de I+D | Los otros dos siguen conectados | 24.2 |
| E11 | `evidencias/11-falla-uplink-ala.png` | — | apagar uplink de un ala | Ala A ↔ Ala B sigue activo | 24.2 |
| E12 | `evidencias/12-ping-visitantes-servidor.png` | PC VLAN 54 | `ping` al servidor | 100 % loss: aislamiento de visitantes | 24 |
| E13 | `evidencias/13-bpdu.png` (opcional) | — | Modo Simulación, STP | Root ID, Bridge ID, costo en la BPDU | 27 |
| E14 | `evidencias/14-pdu-vtp.png` (opcional) | — | Modo Simulación, VTP | Domain Name y Configuration Revision Number | 27 |

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

<!-- Modelo: capturas/EVIDENCIAS.md de la APT 3. Por cada evidencia clave, pegar el fragmento de la salida y señalar la línea que demuestra el punto (ej. "This bridge is the root", "Gi0/2 Altn BLK", "Po1(SU)", "Native vlan 94"). -->
