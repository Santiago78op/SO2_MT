# Proyecto 1 — "SmartCity Tech Park" · Contexto para Claude Code

> Archivo de contexto **portable y versionado**: viaja con el repo dentro de `Proyecto 1/wiki/`. Lo importa `Proyecto 1/CLAUDE.md` —también versionado— con la línea `@wiki/CONTEXTO-CLAUDE.md`, así que Claude Code lo carga solo al abrir la carpeta, en cualquier máquina y sin instalar nada. Contiene todo lo que Claude necesita saber para continuar el proyecto sin releer el enunciado.

## Quién y qué
- **Curso:** Redes de Computadoras 1, USAC, Facultad de Ingeniería, 2S-2026. Ponderación **22 pts**, 35 h estimadas.
- **Estudiante:** Santiago Barrera, carné **201905884**. Repo `Redes1_2S_2026_201905884`, carpeta `Proyecto 1/`.
- **Entrega:** elaboración hasta el **17/09/2026**; calificación 18–19/09/2026, vía UEDI/Classroom.
- **Problema:** campus tecnológico con red plana (maquinaria Legacy, servidores e invitados en un mismo dominio de broadcast, un solo dominio de colisión industrial, enlaces únicos sin redundancia). Se rediseña Capa 1 y Capa 2 en **Cisco Packet Tracer ≥ 8.0**.
- **Enunciado:** `doc/0972_Proyecto_1_2S2026.pdf` (+ `.md` convertido, ambos ignorados en git). **Está incompleto:** el índice va corrido una página y, además, §8.2 *Detalle de la Calificación* y §8.3 no existen en el archivo (solo en el índice); la §6 *Metodología* viene vacía. Pedir la versión completa.
- **Análisis completo y autocontenido:** `wiki/analisis-enunciado.md` — leerlo primero al retomar el proyecto en otra máquina.

## Parámetros por carné (NO cambiar: penaliza -50 % a -100 %)
| Ítem | Valor |
|---|---|
| VLANs | **14** Gerencia (Corporativo) · **24** Investigacion (I+D) · **34** Produccion (Planta) · **44** Servidores (Centro de Datos) · **54** Visitantes (Corporativo, Áreas Comunes) |
| VLAN nativa de todos los trunks | **94** |
| Dominio VTP / contraseña | `Smart_8` / `proyecto12S2026` |
| EtherChannel | **LACP** (carné par) |
| STP | **PVST** (`spanning-tree mode pvst`, carné par) |
| Banner MOTD (distribución) | `Acceso Restringido - TechPark_201905884` |
| Archivo | `Proyecto1_201905884.pkt` |
| Manual Técnico | `Proyecto 1/README.md` en Markdown |

Duda abierta: la tabla del enunciado escribe `Gerencia` pero el ejemplo dice "exactamente `GERENCIA`". Si el tutor no aclara, usar MAYÚSCULAS.

## Requerimientos por área (mínimos obligatorios)
1. **Centro de Datos (Core):** VTP **Server**; trunks a los 3 edificios; granja de **≥ 4 servidores** conectada por un enlace de alto tráfico **redundante** (EtherChannel LACP).
2. **Centro de I+D:** **≥ 3 switches** interconectados entre sí (caída de uno no aísla a los demás); su trunk al Core es el de **mayor ancho de banda** del campus; **≥ 8 PCs/laptops**.
3. **Edificio Corporativo:** **2 alas** con switch de acceso cada una; conectividad entre alas debe sobrevivir a la caída de la ruta al distribuidor (enlace directo entre alas + STP); **Áreas Comunes** para visitantes con aislamiento total de tráfico y de administración de VLANs (VTP Transparent propuesto), con **Access Point** para laptops.
4. **Planta de Producción (Legacy):** un **hub** con las máquinas industriales conectado a un switch de acceso, mostrando un dominio de colisión compartido; documentar impacto y medidas de contención en el switch (storm-control, port-security, VLAN 34).
5. **Transversal:** justificar el medio (cobre/fibra) de cada enlace por distancia, ancho de banda y buenas prácticas; etiquetar los medios en el `.pkt`.
6. **Parte física (lab, por pareja):** 2 switches reales, uno VTP Server y otro Client, trunk entre ellos, puertos access a PCs, VLANs propagadas.

## Figuras y evidencias del Manual (estado al 2026-09-16)

El Manual usa **dos series numeradas**, ya referenciadas en su lugar dentro de `README.md` (índice completo al inicio del archivo):

| Serie | Qué es | Cuántas | Estado | Dónde vive |
|---|---|---|---|---|
| **F1–F11** | Marco Teórico: red plana, dominios, access/trunk, trama 802.1Q, modos VTP, bucle, Root Bridge, EtherChannel, medios, ataques de Capa 2 | 11 | ✅ **hechas** | `diagrama/NN-nombre.svg` |
| **F13, F18, F19** | Marco Práctico: topología lógica, dominios de broadcast del campus, árbol STP | 3 | ✅ **hechas** | `diagrama/` |
| **F12, F14–F17** | Vistas de la topología en Packet Tracer (completa + 4 áreas) | 5 | ⬜ **pendientes** | `capturas/topologia/`, `capturas/areas/` |
| **E1–E14** | Salidas de `show`, pings y pruebas de falla | 14 | ⬜ **pendientes** | `capturas/evidencias/` |
| **L1–L4** | Laboratorio: switches reales | 4 | ⛔ bloqueadas | `capturas/laboratorio/` |

**Las 14 figuras propias son SVG escritos a mano, no archivos de Excalidraw.** Se ven e imprimen
igual y el Manual las referencia sin cambios, pero **no traen escena embebida**: para editarlas hay
que tocar el SVG o redibujarlas desde cero. Está declarado en `diagrama/README.md`, que también
tiene la **paleta fija de VLANs** (14 violeta · 24 turquesa · 34 ámbar · 44 grafito · 54 rosa) y la
tabla de estilo: **fibra naranja, cobre azul, puerto bloqueado punteado rojo con candado, rojo =
problema, verde = correcto**. Regla que evita el choque de paletas: los colores de **medio** se usan
sólo como **línea**; los de **VLAN**, sólo como **relleno**.

Se rompió una regla a conciencia: **F13, F18 y F19 se dibujaron antes de configurar** (la regla dice
después, porque describen la red real). Se hizo así porque el diseño está cerrado y el `.pkt` no.
**Deben contrastarse** contra F12 y las evidencias E3/E4; si difieren, manda el simulador.

## Entregables del README.md
Capturas (topología completa + cada área) · tabla de dominios de colisión (por switch = puertos activos; el compartido del hub) · tabla de dominios de broadcast (uno por VLAN) · lista de comandos por dispositivo · tabla de VLANs · tabla de puertos por switch · captura + justificación del VTP Server · captura + justificación del Root Bridge por VLAN · captura + justificación de cada EtherChannel · evidencia de `show spanning-tree`, `show etherchannel summary`, `show interfaces trunk` · justificación de medios · presupuesto (switches, módulos de fibra, UTP, fibra) · impacto y contención del segmento Legacy. Opcional: capturas de BPDU y PDU VTP en Modo Simulación.

## Requisitos para optar a nota
Carpeta exactamente **"Proyecto 1"** en el mismo repo de la práctica · entrega por UEDI/Classroom · Manual en Markdown · esquema de VLANs por carné · **originalidad** (topología idéntica a otro = copia).

## Decisiones de diseño (estado al 2026-09-16)

**El diseño de red está cerrado.** Las 22 decisiones con su justificación completa están en
`wiki/AVANCE.md`; acá sólo las que hacen falta para no re-discutirlas:

| Tema | Decisión |
|---|---|
| **Jerarquía** | Core (SW-CORE) → distribución (SW-DIST-ID, SW-DIST-CORP) → acceso (7 switches). **SW-PLANTA cuelga del Core sin distribuidor**: un nivel intermedio no aportaría nada y sí un punto de falla |
| **Redundancia** | Dos tipos, y no son lo mismo: **EtherChannel LACP** donde hace falta capacidad (Po1 a servidores, Po2 a I+D) y **STP/PVST+** donde hace falta camino alterno (anillo de I+D, triángulo del Corporativo) |
| **Anillo de I+D** | 3 switches en anillo cerrado **+ dos uplinks** (desde ID-1 e ID-3). Con un solo uplink, la caída de ese switch aislaría a los otros dos |
| **Cierre del anillo** | SW-ID-1 ↔ SW-ID-3 en **FastEthernet 100 Mbps**: costo STP 19 frente a 4, así el bloqueo es **predecible** y no depende de las MAC |
| **Root Bridge** | **En el distribuidor de cada edificio, no en el Core** (VLANs 14, 24, 54). Sustituye a la propuesta inicial: el puerto bloqueado cae así sobre el **enlace de respaldo** y no sobre un uplink de uso diario. VLANs 34 y 44 en SW-CORE (no hay ciclo) |
| **Determinismo de STP** | Prioridades secundarias **28672** en SW-ALA-A y SW-ID-1 para fijar el desempate por Bridge ID |
| **Medios** | Fibra **OM4** en Po2 (180 m) · **OM3** al Corporativo (120 m) · **OM3 a la Planta pese a medir 90 m**, decidido por **EMI industrial y no por distancia** · UTP Cat 6 en todo lo intraedificio y en Po1 |
| **Áreas Comunes** | VLAN 54 + **VTP Transparent** + trunk restringido a `allowed vlan 1,54,94`: tres medidas para tres cosas distintas |
| **Trunks** | Los 13 con **nativa 94** y lista `allowed` explícita. La VLAN 1 se conserva en las listas (lleva CDP/DTP/VTP) pero **sin ningún puerto de acceso** |
| **LACP** | `mode active` en **ambos** extremos, nunca `on`: `on` ante un error de cableado produce un bucle |
| **Legacy** | Hub en **un solo** puerto access, VLAN 34, `storm-control broadcast level 20` y `port-security maximum 5` en modo **`restrict`** (no `shutdown`: evita paradas de producción) |
| **Puertos libres** | `shutdown` + VLAN muerta **999**. No es requisito del enunciado: se declara como buena práctica añadida |
| **Presupuesto** | Cantidades completas, **sin precios**: no se cotizó nada y poner cifras sin origen sería presentar una suposición como dato |

**Riesgo técnico abierto (probarlo ANTES de cablear):** no está verificado que el chasis modular de
Packet Tracer acepte `channel-group … mode active` sobre módulos de **fibra**. Si no lo soporta,
**Po2 no se forma**. Plan B en `wiki/HANDOFF-PACKETTRACER.md`, fase 1.

## Modo de trabajo: clase guiada en 9 lecciones

El proyecto se trabaja **enseñando la teoría y aplicándola en la misma lección**, no de corrido. El
método y la secuencia de las **9 lecciones** están en `wiki/PROTOCOLO-CATEDRA.md`; el estado actual
(lección en curso, decisiones tomadas con su justificación, dudas abiertas) en **`wiki/AVANCE.md`**,
que es la fuente de verdad del progreso.

Se invoca con el slash command **`/paso`** (`.claude/commands/paso.md`, versionado: viaja con el
`git clone`). Cada lección tiene cuatro etapas obligatorias en orden: **teoría con cita oficial →
2-3 preguntas de comprensión que el estudiante debe responder → implementación (incluidas las
figuras de Excalidraw de esa lección) → registro en `AVANCE.md` y en la sección del Manual**. Al
retomar el proyecto en cualquier máquina: leer `AVANCE.md` y escribir `/paso`.

> Hasta el 2026-09-07 la secuencia tenía **11 pasos**. Se reagruparon en 9 lecciones el 14/09, al
> quedar tres días, para que cada una cierre secciones completas del Manual. La tabla de
> correspondencia está al final de `PROTOCOLO-CATEDRA.md`.

## Cómo trabajar conmigo en este proyecto
- Los commits y pushes los hace el usuario; Claude no commitea.
- **El proyecto se trabaja en dos marcos, como en la Práctica 1:**
  - **Marco Teórico**: los conceptos que sustentan cada decisión (dominios de colisión/broadcast, VLAN/802.1Q, VTP, STP/PVST, EtherChannel/LACP, medios de transmisión, seguridad básica), redactados con definiciones, comparaciones y referencias, antes de configurar nada. Fuente: notas de `wiki/02 - Conceptos Capa 2/`.
  - **Marco Práctico**: la implementación (topología, tablas de VLANs/puertos/dominios, comandos por dispositivo, capturas de `show`, justificaciones de Root Bridge/EtherChannel/medios, presupuesto). Cada decisión práctica cita la sección teórica que la respalda.
  - En la Práctica 1 esto se materializó en dos documentos: `../Practica1/ManualTecnico.md` (23 secciones) e `../Practica1/InformeDesarrollo.md` (proceso, criterios, retos, conclusiones). Reutilizar su encabezado institucional, índice numerado, tablas y sección de referencias.
- Todo comando ejecutado se copia al README de inmediato, por dispositivo.
- Toda decisión de diseño se anota con su justificación en el momento (la rúbrica califica la justificación).
- Conocimiento ampliado (conceptos con citas oficiales, comandos con los valores ya sustituidos, ambigüedades del enunciado, calendario): **esta misma carpeta `wiki/`**, bóveda Obsidian de **22 notas** versionada en el repo. Índice: `wiki/00 - 🌐 Cerebro Redes (MOC).md`.
- **Tres notas operativas que conviene abrir antes de trabajar:**
  - `wiki/AVANCE.md` — estado, 22 decisiones con su porqué, dudas abiertas, bitácora.
  - `wiki/HANDOFF-PACKETTRACER.md` — runbook de la sesión de Packet Tracer (otra PC, por MCP): construir, configurar, 5 capturas, 14 evidencias, qué volcar al Manual.
  - `wiki/PREPARACION-AUXILIAR.md` — guion de la calificación del 18–19/09: los 5 «mata-nota» de §8.1, 42 preguntas probables con respuesta, tareas en vivo con sus comandos.

## Estructura de la carpeta (creada el 2026-09-07, actualizada el 2026-09-16)
```
Proyecto 1/
├── CLAUDE.md                    ← importa wiki/CONTEXTO-CLAUDE.md (versionado: viaja al clonar)
├── README.md                    ← Manual Técnico (PLANTILLA: índice de figuras + mapa de lecciones,
│                                  Parte I Marco Teórico §1–9, Parte II Marco Práctico §10–29)
├── Proyecto1_201905884.pkt      ← topología (entregable; se genera en Packet Tracer)
├── capturas/
│   ├── EVIDENCIAS.md            ← índice de las series F / E / L, convención NN-<dispositivo>-<comando>.png
│   ├── topologia/  areas/  evidencias/  laboratorio/
├── configs/
│   ├── topologia.yaml           ← ESPECIFICACIÓN legible por máquina (dispositivos, 15 enlaces, VLANs,
│   │                              equipos finales, resultado esperado y riesgos abiertos)
│   ├── scripts/<hostname>.txt   ← los 11 scripts de configuración, listos para pegar en la CLI
│   └── <hostname>.txt           ← running-config real (pendiente); README con cabecera obligatoria
├── diagrama/                    ← 14 figuras propias de Excalidraw en SVG (README con índice,
│                                  flujo de exportación y tabla de estilo)
├── doc/                         ← enunciado PDF/MD (ignorados en git)
├── wiki/                        ← cerebro del proyecto (versionado, viaja con el push)
│   ├── AVANCE.md                ← estado del progreso: LEER PRIMERO
│   ├── PROTOCOLO-CATEDRA.md     ← método y secuencia de las 9 lecciones
│   ├── HANDOFF-PACKETTRACER.md  ← runbook de la sesión de Packet Tracer (otra PC, por MCP):
│   │                              construir, configurar, 5 capturas, 14 evidencias, qué volcar al Manual
└── cerebro/                     ← notas personales locales, si hacen falta (no versionado)

.claude/commands/paso.md         ← (raíz del repo) el slash command /paso, versionado
```
Las guías de redacción de la plantilla van en comentarios HTML `<!-- -->`; se borran al cerrar cada sección.

## Retomar el proyecto en otra PC

Sin pasos manuales: el contexto (`Proyecto 1/CLAUDE.md` + `wiki/`) y el comando
(`.claude/commands/paso.md`) están versionados.

```bash
git clone https://github.com/Santiago78op/Redes1_2S_2026_201905884.git
cd Redes1_2S_2026_201905884
claude          # y adentro:  /paso
```

Dos aclaraciones sobre lo que **no** viaja, para no buscarlo: la memoria de Claude vive en
`~/.claude/projects/…/memory/` de cada máquina, y el output style «Catedrático» también es local. Por
eso todo lo que importa está acá, en el repo, y el comando `/paso` trae sus propias reglas de
redacción.

Opcional, si esa máquina tiene diamon: agregar en `brains.json`, mundo `personal`,
`"redes": "<ruta-del-repo>/Proyecto 1/wiki"` y reiniciar la sesión.

> [!warning] La ruta del cerebro depende de dónde se clonó el repo
> El 16/09 se encontró que `brains.json` apuntaba a
> `C:/Users/72358/Desktop/Redes1_2S_2026_201905884/Proyecto 1/wiki`, una **ruta que no existía** en
> esa máquina, donde el repo está clonado en `C:/Users/72358/Desktop/SO2/Redes/Lab/`. El cerebro
> `redes` no cargaba y no aparecía en `brain_list`. Se corrigió. **Si `brain_search` no encuentra
> nada del proyecto, lo primero que hay que revisar es esa ruta.**
