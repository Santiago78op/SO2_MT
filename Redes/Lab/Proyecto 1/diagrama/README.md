# Diagramas — Proyecto 1, SmartCity Tech Park

Figuras del Manual Técnico que **no** salen de Packet Tracer (las capturas del simulador van en
`../capturas/`). Se dibujan en **Excalidraw** y se exportan a **SVG**, que es vectorial: se ve nítido
en GitHub y al imprimir.

## Flujo de trabajo

1. Dibujar en [excalidraw.com](https://excalidraw.com) (no necesita cuenta).
2. Guardar la fuente editable: *File → Save to…* → `src/NN-nombre.excalidraw`.
3. Exportar la imagen: *File → Export image…* → **SVG**, fondo transparente, *Embed scene* activado
   (así el `.svg` sigue siendo reabrible en Excalidraw) → `NN-nombre.svg`.
4. La figura ya está referenciada en el manual: no hay que tocar el `README.md` del proyecto, solo
   dejar el archivo con el nombre exacto de la tabla.

**Convención de nombre:** `NN-nombre-en-kebab-case.svg`, donde `NN` es el orden dentro de esta
carpeta. El número de **Figura** del manual es otra serie (F1–F19) y está en la columna "Fig.".

## Índice

### Marco Teórico

| Archivo | Fig. | § | Qué muestra | Prioridad |
| --- | --- | --- | --- | --- |
| `01-red-plana-problema.svg` | F1 | 2 | La red plana actual con sus cuatro síntomas | ⭐ esencial |
| `02-dominios-colision.svg` | F2 | 3.1 | Hub (1 dominio compartido) vs. switch (1 por puerto) | ⭐ esencial |
| `03-dominios-broadcast.svg` | F3 | 3.2 | Red plana = 1 dominio · con VLANs = 1 por VLAN | ⭐ esencial |
| `04-access-vs-trunk.svg` | F4 | 4.2 | Puerto access y puerto trunk lado a lado | ⭐ esencial |
| `05-trama-8021q.svg` | F5 | 4.3 | Trama Ethernet con el tag de 4 bytes desglosado | ⭐ esencial |
| `06-vtp-modos.svg` | F6 | 5.2 | Anuncios entre Server, Client y Transparent | ⭐ esencial |
| `07-bucle-capa2.svg` | F7 | 6.1 | Tormenta de broadcast en un triángulo de switches | ⭐ esencial |
| `08-eleccion-root-bridge.svg` | F8 | 6.2 | Bridge ID, costos y el puerto que queda bloqueado | ⭐ esencial |
| `09-etherchannel-lacp.svg` | F9 | 7.1 | Enlaces físicos agrupados en un port-channel | ⭐ esencial |
| `10-medios-transmision.svg` | F10 | 8 | Alcance y ancho de banda de UTP vs. fibra | ○ si da el tiempo |
| `11-seguridad-capa2.svg` | F11 | 9.1 | VLAN hopping por doble etiquetado y MAC flooding | ○ si da el tiempo |

### Marco Práctico

| Archivo | Fig. | § | Qué muestra | Prioridad |
| --- | --- | --- | --- | --- |
| `12-topologia-logica.svg` | F13 | 11 | Jerarquía Core → distribución → acceso, VLANs, canales y medios | ⭐ esencial |
| `13-dominios-broadcast-campus.svg` | F18 | 16 | Las 5 VLANs como dominios independientes sobre la planta física | ⭐ esencial |
| `14-arbol-stp.svg` | F19 | 18 | Root Bridge por VLAN y puertos bloqueados | ⭐ esencial |

Las **12 esenciales** son las que sostienen una justificación del manual; las dos marcadas con ○ son
valor agregado y se pueden sustituir por texto si el calendario aprieta.

## Consistencia con la implementación

Tres figuras describen la red real y **no pueden contradecir las evidencias**: la F13 debe coincidir
con la captura de la topología, la F18 con la tabla de §16, y la F19 con lo que muestren
`show spanning-tree` (E3) y el puerto bloqueado (E4). Se dibujan **después** de configurar, no antes.

## Estilo

| Elemento | Convención |
| --- | --- |
| Fibra óptica | Línea naranja gruesa |
| Cobre UTP | Línea azul delgada |
| Enlace bloqueado por STP | Línea punteada roja con candado |
| Problema / ataque | Rojo |
| Solución / estado correcto | Verde |
| VLANs | Un color fijo por VLAN, el mismo en todas las figuras (tabla abajo) |
| Tipografía | La de mano alzada de Excalidraw, tamaño M; rótulos en español |

**Regla que evita el choque de paletas:** los colores de **medio** (naranja fibra, azul cobre) se usan
sólo como **línea**; los de **VLAN**, sólo como **relleno** de nodos y nubes. Así el azul del cobre y
el de una VLAN nunca se confunden aunque aparezcan en la misma figura.

### Paleta fija de VLANs (fijada en la lección 1, 2026-09-16)

| VLAN | Nombre | Color | Hex |
| --- | --- | --- | --- |
| 14 | GERENCIA | violeta | `#7048e8` |
| 24 | INVESTIGACION | turquesa | `#0c8599` |
| 34 | PRODUCCION | ámbar | `#f08c00` |
| 44 | SERVIDORES | grafito | `#343a40` |
| 54 | VISITANTES | rosa | `#d6336c` |
| 94 | nativa (control) | gris punteado | `#adb5bd` |

Ninguno es rojo ni verde puros, que están reservados para *problema* y *estado correcto*.

## Estado de los archivos

**Las 14 figuras propias están hechas** (2026-09-16). Las 5 capturas de Packet Tracer (F12, F14–F17)
siguen pendientes porque el `.pkt` no está armado.

| Archivo | Fig. | Origen | Lección |
| --- | --- | --- | --- |
| `01-red-plana-problema.svg` | F1 | SVG escrito a mano | 1 |
| `02-dominios-colision.svg` | F2 | SVG escrito a mano | 1 |
| `03-dominios-broadcast.svg` | F3 | SVG escrito a mano | 1 |
| `04-access-vs-trunk.svg` | F4 | SVG escrito a mano | 3 |
| `05-trama-8021q.svg` | F5 | SVG escrito a mano | 3 |
| `06-vtp-modos.svg` | F6 | SVG escrito a mano | 4 |
| `07-bucle-capa2.svg` | F7 | SVG escrito a mano | 5 |
| `08-eleccion-root-bridge.svg` | F8 | SVG escrito a mano | 5 |
| `09-etherchannel-lacp.svg` | F9 | SVG escrito a mano | 5 |
| `10-medios-transmision.svg` | F10 | SVG escrito a mano | 1 |
| `11-seguridad-capa2.svg` | F11 | SVG escrito a mano | 6 |
| `12-topologia-logica.svg` | F13 | SVG escrito a mano | 2 |
| `13-dominios-broadcast-campus.svg` | F18 | SVG escrito a mano | 3 |
| `14-arbol-stp.svg` | F19 | SVG escrito a mano | 5 |

> **Límite honesto 1 — no son archivos de Excalidraw.** Las 14 se escribieron directamente como SVG.
> Se ven y se imprimen igual, y el manual las referencia sin cambios, pero **no** traen escena
> embebida: para editarlas hay que tocar el SVG a mano o redibujarlas en Excalidraw desde cero. No
> hay nada en `src/`.

> **Límite honesto 2 — la tipografía puede cambiar de máquina.** Se declara `Segoe Print` con reserva
> a `Comic Sans MS` y `cursive`. En un equipo sin ninguna de las dos, el texto cae a la cursiva por
> defecto del sistema y el trazo deja de parecer de mano alzada. El contenido no se pierde, el estilo
> sí.

> **Límite honesto 3 — F13, F18 y F19 se dibujaron ANTES de configurar**, al revés de lo que manda la
> regla de esta carpeta. Se hizo así porque el diseño ya está cerrado y el `.pkt` no. **Deben
> contrastarse** contra la captura F12 y las evidencias E3 y E4 en cuanto existan; si difieren, manda
> el simulador y hay que corregir las figuras.

<!-- Al agregar una figura: crear el archivo con la convención, agregar su fila acá y referenciarla en el manual con su número de Figura. -->
