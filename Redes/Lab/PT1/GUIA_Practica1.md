# Guía de desarrollo — Práctica 1: QuetzalDev S.A.

> **Qué es este documento:** una guía de estudio y trabajo para que VOS realices la práctica.
> No es el entregable. Cada sección tiene: (1) la teoría que necesitás, (2) qué decisión tomar,
> (3) cómo justificarla y (4) la plantilla de tabla que va en tu Manual Técnico.
>
> **Ponderación:** 7 pts · **Entrega:** 21/08/2026 · **Enfoque:** diseño de Capa 1 (física). NO se configura ni se simula nada.

---

## Índice

0. [Preparación: repo y plano](#0-preparación)
1. [Teoría base: Capa 1 y cableado estructurado](#1-teoría-base)
2. [Distribución de hosts (tu diseño único)](#2-distribución-de-hosts)
3. [Ubicación del MDF](#3-ubicación-del-mdf)
4. [Topología física por departamento](#4-topología-física)
5. [Medios de transmisión y categorías de cable](#5-medios-de-transmisión)
6. [Cableado troncal vs. horizontal](#6-troncal-vs-horizontal)
7. [Puntos de red y tomas](#7-puntos-de-red-y-tomas)
8. [Distancias y cálculo de bobinas](#8-distancias-y-bobinas)
9. [Patch panel, switch central y equipo activo](#9-equipo-activo)
10. [T568A / T568B: straight-through y crossover](#10-t568a--t568b)
11. [Canalización](#11-canalización)
12. [Rack o gabinete](#12-rack-o-gabinete)
13. [UPS: estimación de respaldo de energía](#13-ups)
14. [Etiquetado y comparación con TIA/EIA-606](#14-etiquetado-y-tiaeia-606)
15. [Flujo de conexión end-to-end](#15-flujo-end-to-end)
16. [Presupuesto](#16-presupuesto)
17. [El diagrama de diseño físico](#17-el-diagrama)
18. [Estructura de los entregables](#18-entregables)
19. [Checklist final contra la rúbrica](#19-checklist)

---

## 0. Preparación

1. **Descargá tu plano**: en la sección 4 del PDF hay 5 carpetas de Drive según la **terminación de tu carnet** (0-1, 2-3, 4-5, 6-7, 8-9). Bajá el que te corresponde.
2. **Creá el repositorio de GitHub**: nombre exacto `Redes1_2S_2026_CARNET` (tu carnet en lugar de CARNET). Adentro, una carpeta `Practica1`. Invitá a los tutores desde Settings → Collaborators.
3. **Elegí tu herramienta de diagramación**: draw.io (diagrams.net) es la opción típica porque permite importar el plano como imagen de fondo y dibujar encima en capas. Alternativas: Lucidchart, Visio, Excalidraw.
4. **Estructura sugerida del repo:**

```
Redes1_2S_2026_CARNET/
└── Practica1/
    ├── ManualTecnico.md
    ├── InformeDesarrollo.md
    ├── Diagrama/
    │   ├── diseno_fisico.png      (exportado)
    │   └── diseno_fisico.drawio   (editable)
    └── recursos/                  (plano base, imágenes del manual)
```

---

## 1. Teoría base

### 1.1 Capa 1 del modelo OSI

La **Capa Física** define los medios de transmisión (cobre, fibra, aire), conectores, niveles eléctricos y la topología física. Todo lo que diseñás en esta práctica vive acá: cables, tomas, patch panels, racks, canalización. No hay direcciones IP, ni VLANs, ni configuración — eso es de capas superiores y de prácticas posteriores.

### 1.2 Cableado estructurado (ANSI/TIA/EIA-568)

El cableado estructurado es un sistema **estandarizado y jerárquico** de cablear un edificio, independiente del fabricante y de la aplicación. Sus subsistemas relevantes para esta práctica:

| Subsistema | Qué es | En tu práctica |
|---|---|---|
| **Cuarto de telecomunicaciones (MDF)** | Espacio que concentra el equipo activo y las terminaciones de cable del edificio | Lo ubicás vos sobre el plano |
| **Cableado troncal (backbone)** | Une el MDF con los cuartos/switches intermedios | MDF ↔ switch de cada departamento |
| **Cableado horizontal** | Del área de trabajo al cuarto de telecomunicaciones (o al switch del área) | Switch de departamento ↔ hosts |
| **Área de trabajo** | Donde está el usuario final: toma de red + patch cord + dispositivo | Cada escritorio con su toma |

**Regla de oro de la 568:** el enlace horizontal (permanent link) no debe superar **90 m** de cable sólido, más hasta 10 m repartidos en patch cords en ambos extremos = **100 m de canal máximo** para UTP. Esta cifra te sirve para justificar cobre vs. fibra según las distancias de tu plano.

**MDF vs. IDF:** MDF (Main Distribution Frame) es el cuarto principal; los IDF son cuartos intermedios por piso o zona. Como el edificio es de **un solo nivel**, con un MDF basta — decilo explícitamente en tu justificación.

### 1.3 Conceptos de equipo pasivo y activo

- **Equipo pasivo** (no consume energía ni procesa tramas): cables, tomas/jacks, patch panel, ODF, rack, canalización.
- **Equipo activo** (procesa señal/tramas): switches, y en general todo lo que se enchufa.
- **Patch panel:** panel de puertos RJ45 donde termina (se poncha) el cableado horizontal. Del patch panel salen **patch cords** cortos hacia el switch. Su función: proteger el cable sólido de manipulación, dar orden y permitir mover conexiones sin reponchar.
- **ODF (Optical Distribution Frame):** el equivalente del patch panel pero para fibra óptica. Solo aplica si usás fibra en algún troncal.

---

## 2. Distribución de hosts

**Dato fijo:** 30 PCs de escritorio + 12 laptops = 42 equipos de usuario, + 6 servidores.

**Tu decisión:** cuántas PCs y cuántas laptops van en cada departamento (el total por departamento SÍ está fijo). Esto hace tu diseño único — no puede coincidir con otro estudiante.

| Departamento | Total equipos (fijo) | PCs (elegís) | Laptops (elegís) | Servidores (fijo) |
|---|---|---|---|---|
| Recepción | 3 | ? | ? | 1 |
| Recursos Humanos | 8 | ? | ? | 0 |
| Legal | 4 | ? | ? | 0 |
| Sala de Capacitación | 10 | ? | ? | 0 |
| Diseño e Innovación | 7 | ? | ? | 1 |
| Dirección General | 4 | ? | ? | 0 |
| Backend | 6 | ? | ? | 1 |
| Data Center | 0 | 0 | 0 | 3 |
| **Total** | **42** | **30** | **12** | **6** |

**Criterio razonable para decidir:** las laptops tienen sentido donde hay movilidad (Dirección, Diseño, Capacitación); las PCs fijas donde el trabajo es de escritorio permanente (RRHH, Legal, Backend). Aunque una laptop pueda usar Wi‑Fi, **en esta práctica todo host se conecta por cable** (es diseño de capa física); igual dejá el punto de red para cada laptop.

> ✏️ **Tarea tuya:** llená la tabla y anotá en una línea el porqué de cada asignación.

---

## 3. Ubicación del MDF

### Teoría

El MDF debe ubicarse en el punto que **minimice la distancia promedio** hacia todos los puntos de red (piensa en el "centro de gravedad" de los puntos de red del plano). Otros criterios reales que podés sumar a tu justificación:

- Cercanía al **Data Center** (ahí se concentran los servidores y el tráfico crítico; a veces MDF y Data Center comparten espacio o son adyacentes).
- Lejos de fuentes de interferencia electromagnética (motores, transformadores, planta eléctrica).
- Espacio con acceso restringido, ventilación/enfriamiento y alimentación eléctrica disponible.
- Que ningún tendido horizontal supere los 90 m.

### Cómo hacerlo

1. Marcá sobre el plano los puntos de red aproximados de cada departamento.
2. Buscá visualmente el punto medio (o el pasillo/cuarto disponible más cercano a ese punto medio).
3. Verificá que desde ahí **el punto más lejano** quede debajo de 90 m con la escala del plano.
4. Justificá con 2–3 de los criterios de arriba. Si lo ponés junto al Data Center, decí por qué (troncales de servidores cortísimos, seguridad física compartida).

---

## 4. Topología física

### Teoría — topologías físicas y sus trade-offs

| Topología | Cómo funciona | Ventajas | Desventajas | Cuándo conviene |
|---|---|---|---|---|
| **Estrella** | Todos los hosts al switch central del área | Falla de un cable afecta solo a ese host; fácil de escalar y diagnosticar | El switch es punto único de falla | Estándar de facto en LAN por área |
| **Estrella extendida / Árbol (jerárquica)** | Estrellas de área colgando de un nodo superior | Escalable, ordenada, refleja la jerarquía troncal/horizontal | La raíz es crítica | **El edificio completo**: switch principal → switches de departamento → hosts |
| **Malla (completa o parcial)** | Enlaces redundantes entre nodos | Tolerancia a fallos máxima | Costo de cableado y puertos alto | Segmentos críticos (Data Center) con enlaces redundantes |
| **Bus** | Un medio compartido lineal | Barata (histórica) | Una ruptura tira todo; colisiones | Obsoleta — mencionala solo para descartarla |
| **Anillo** | Cada nodo conecta al siguiente | Determinística (histórica) | Una falla corta el anillo (sin doble anillo) | Obsoleta en LAN de oficina |

### Tu decisión

- **Global del edificio:** estrella extendida/árbol de dos niveles (switch principal en MDF → switch por departamento → hosts). Es lo que el enunciado ya induce ("un único switch principal que distribuirá la conexión hacia los switches de cada departamento").
- **Por departamento:** casi siempre estrella, PERO tenés que justificarla **departamento por departamento** con estos tres factores (la rúbrica lo pide así):
  1. **Número de hosts** (una estrella con switch de 8-16 puertos alcanza).
  2. **Criticidad del segmento** (¿qué pasa si se cae? Recepción con 1 servidor y el Data Center son más críticos que Capacitación).
  3. **Balance costo / escalabilidad / tolerancia a fallos**.
- **Data Center:** acá está tu oportunidad de diferenciarte: podés proponer **malla parcial** o **doble enlace troncal** (switch del Data Center con dos uplinks al principal) justificado por criticidad. No es obligatorio, pero suma en "diseño y organización de la topología" (20 pts).

> ✏️ **Tarea tuya:** una tabla en el manual: departamento | topología elegida | nº hosts | criticidad (alta/media/baja) | justificación (2-3 líneas cada una, NO la misma frase copiada 8 veces — la rúbrica penaliza redundancia).

---

## 5. Medios de transmisión

### Teoría — cobre UTP

| Categoría | Ancho de banda | Velocidad típica | Distancia máx. | Uso típico hoy |
|---|---|---|---|---|
| Cat 5e | 100 MHz | 1 Gbps | 100 m | Mínimo aceptable, en retirada |
| **Cat 6** | 250 MHz | 1 Gbps (10 Gbps hasta ~55 m) | 100 m | **Horizontal de oficina — la elección estándar** |
| **Cat 6a** | 500 MHz | 10 Gbps | 100 m | Troncales de cobre, data centers, backbone corto |
| Cat 7/8 | 600+ MHz | 10-40 Gbps | 100/30 m | Nicho data center; blindado (S/FTP), caro |

- **UTP** = par trenzado sin blindaje. El trenzado cancela interferencia (crosstalk). Es el medio estándar de LAN por costo y facilidad de instalación.
- **STP/FTP** = blindado; solo se justifica con interferencia electromagnética fuerte.

### Teoría — fibra óptica

| Tipo | Núcleo | Distancia | Costo | Uso |
|---|---|---|---|---|
| **Multimodo OM3/OM4** | 50 µm | 300–550 m a 10 Gbps | Medio | Backbone dentro de edificio/campus |
| Monomodo OS2 | 9 µm | Kilómetros | Alto (óptica) | Enlaces entre edificios, WAN |

La fibra es inmune a interferencia electromagnética y no tiene el límite de 100 m, pero requiere transceivers (SFP), ODF y fusiones — más costo. **En un edificio de un nivel donde ningún troncal supera 90 m, el cobre Cat 6a suele bastar**; si proponés fibra en algún troncal (p. ej. MDF ↔ Data Center por futura migración a 10/40 Gbps), justificalo por escalabilidad, no por distancia.

### Tu decisión

- **Horizontal (switch de depto → hosts):** UTP Cat 6 es la elección defendible (1 Gbps al escritorio, margen a 10 Gbps corto, precio razonable). Justificá con distancia (< 90 m) y ancho de banda requerido por un puesto de trabajo.
- **Troncal (MDF → switch de depto):** Cat 6a (uplinks a 10 Gbps, distancias cortas de un solo nivel) **o** fibra multimodo OM3/OM4 en los segmentos que quieras destacar como críticos (Data Center). Elegí y justificá con: velocidad de uplink requerida, distancia medida en TU plano, y costo/escalabilidad.
- Si usás fibra en algún enlace: agregá el **ODF** al inventario y al flujo end-to-end.

> ✏️ **Tarea tuya:** tabla: segmento | medio | categoría/tipo | distancia estimada | ancho de banda requerido | justificación.

---

## 6. Troncal vs. horizontal

Esto vale **15 pts** por sí solo. La diferenciación tiene que quedar clara en tres lugares:

1. **En el diagrama:** troncal y horizontal con **colores o grosores distintos** (ej. troncal = línea gruesa roja; horizontal = línea delgada azul). Poné una leyenda.
2. **En el manual:** definí ambos términos y listá qué enlaces de tu diseño son troncales (8: MDF ↔ cada switch de departamento) y cuáles horizontales (42 + 6 puntos hacia hosts/servidores… según tu conteo).
3. **En el etiquetado:** formato distinto para cada uno (sección 14).

| Aspecto | Troncal (backbone) | Horizontal |
|---|---|---|
| Recorrido | MDF ↔ switch de departamento | Switch de departamento ↔ host |
| Cantidad en tu diseño | 8 enlaces (uno por switch de área) | 1 por dispositivo final |
| Medio típico | Cat 6a o fibra (uplink agregado) | Cat 6 |
| Tráfico | Agregado de todo el departamento | De un solo host |
| Etiqueta | `MDF-[Departamento]` | `[Departamento]-PR##` |

---

## 7. Puntos de red y tomas

### Teoría

Una **toma de red** (outlet/faceplate) es la placa de pared con jacks RJ45 hembra donde el usuario conecta su patch cord. Vienen de 1, 2, 3, 4 o 6 puertos:

- **Unitaria:** un dispositivo aislado (una impresora de red, un AP).
- **Doble:** el estándar de puesto de trabajo real (un puerto para PC + uno de reserva/teléfono IP). Es la elección más defendible para escritorios.
- **Triple / N puertos:** puntos donde se agrupan varios dispositivos (islas de trabajo, mesas de capacitación, rack de servidores).

**Cada puerto de toma = un cable horizontal = un puerto de patch panel.** Esta igualdad es la que después dimensiona el patch panel (sección 9). Decidí desde ya si tu conteo de puntos de red incluye puertos de reserva (recomendable para "escalabilidad futura", que es punto recomendado del enunciado).

> ✏️ **Tarea tuya:** para cada departamento, decidí cuántas tomas y de qué tipo, marcálas en el plano, y armá la tabla: departamento | nº tomas | tipo (unitaria/doble/…) | puertos totales | dispositivos conectados.

---

## 8. Distancias y bobinas

### Cómo estimar distancias con la escala del plano

1. Identificá la **escala** del plano (ej. 1:100 → 1 cm del plano = 1 m real). Si no trae escala, deducila de un elemento conocido (una puerta estándar ≈ 0.9–1 m).
2. Para cada punto de red, medí la ruta **por donde iría la canalización** (por pasillos y paredes, en ángulos rectos — NUNCA en línea recta diagonal).
3. Sumá la **altura**: el cable sube del punto de red a la escalerilla en el techo y baja en el MDF. Regla práctica: **+3 a +5 m por extremo** (según altura de techo).
4. Agregá **holgura de servicio (slack)**: 10–15 % extra para terminación, curvas y reservas.

### Fórmula de bobinas

```
metros_totales = Σ (distancia_ruta_i + subidas/bajadas_i) × (1 + slack)
bobinas = ⌈ metros_totales / 305 ⌉
```

La bobina estándar de UTP es de **305 m (1000 ft)**. Redondeá siempre hacia arriba.

**Consejo práctico:** de una bobina no salen "305 m continuos aprovechables" — cada corte desperdicia; por eso el slack del 10-15 % es defendible en el informe. Si te da, por ejemplo, 1 380 m → 5 bobinas, mencioná el excedente como reserva para crecimiento (punto recomendado).

> ✏️ **Tarea tuya:** tabla: punto de red (etiqueta) | departamento | distancia estimada al switch de área (m) | + tabla troncal: enlace MDF-X | distancia. Al pie: metros totales, slack aplicado, nº de bobinas. Esto también alimenta la decisión "compra individual vs. proveedor" (recomendado): pocas bobinas → compra directa; instalación grande → tercerizar con proveedor que certifique el cableado.

---

## 9. Equipo activo

### Regla del enunciado (¡es literal, cumplila!)

> El patch panel del edificio se dimensiona según la **cantidad total de puntos de red**, y el switch seleccionado debe tener **puertos ≥ patch panel**.

### Cómo dimensionar

1. Contá tus puntos de red totales (todos los puertos de todas las tomas + los del Data Center).
2. Elegí patch panel(s) en tamaños comerciales: **24 o 48 puertos** (1U o 2U). Ej.: 52 puntos → 48 + 24 = 72 puertos en dos paneles, o directamente indicar "2 × 48".
3. El switch central: puertos ≥ los del patch panel del MDF. Los switches suelen venir de 8, 16, 24 y 48 puertos.
4. Switches de departamento: puertos ≥ hosts del área + 1 uplink + reserva. (Ej.: Capacitación con 10 PCs → switch de 16).

### Qué justificar de cada elemento (función en el flujo de conexión)

| Elemento | Función que tenés que explicar |
|---|---|
| Switch central | Concentra los troncales; núcleo de la estrella extendida |
| Switch de departamento | Concentra el horizontal de su área; frontera troncal/horizontal |
| Patch panel | Terminación fija del horizontal; orden y protección del cableado |
| ODF (si hay fibra) | Terminación y distribución de fibras del troncal |
| Rack/gabinete | Aloja y organiza el equipo del MDF |
| UPS | Respaldo eléctrico del equipo activo |
| Tomas de red | Interfaz del área de trabajo |

> ✏️ **Tarea tuya:** inventario completo con cantidades y modelos (sacá modelos reales de los catálogos Siemon/Panduit del material de apoyo — te sirven también para el presupuesto).

---

## 10. T568A / T568B

### Teoría — los dos estándares de disposición de pines

Un cable UTP tiene 4 pares (8 hilos). T568A y T568B definen el **orden de colores** en el conector RJ45 (pin 1 = izquierda, con el clip hacia abajo y los contactos hacia arriba):

| Pin | T568A | T568B |
|---|---|---|
| 1 | Blanco/Verde | Blanco/Naranja |
| 2 | Verde | Naranja |
| 3 | Blanco/Naranja | Blanco/Verde |
| 4 | Azul | Azul |
| 5 | Blanco/Azul | Blanco/Azul |
| 6 | Naranja | Verde |
| 7 | Blanco/Café | Blanco/Café |
| 8 | Café | Café |

La única diferencia: los pares **verde y naranja intercambiados** (pines 1-2 ↔ 3-6). En 10/100BASE-T, los pines 1-2 transmiten (TX) y 3-6 reciben (RX).

### Straight-through vs. crossover

- **Straight-through (directo):** mismo estándar en ambos extremos (B-B es el más común en América). Conecta dispositivos de **distinto tipo**: host ↔ switch, servidor ↔ switch, router ↔ switch. El cruce TX→RX lo hace el propio switch internamente.
- **Crossover (cruzado):** un extremo A y el otro B. Conecta dispositivos del **mismo tipo**: switch ↔ switch, host ↔ host, router ↔ router. El cruce lo hace el cable porque ambos extremos transmiten por los mismos pines.
- **Nota honesta para tu manual:** los switches modernos tienen **Auto-MDIX** y detectan/cruzan solos, así que hoy casi todo se cablea straight-through. PERO la práctica exige aplicar la teoría clásica: **tus enlaces switch↔switch (los 8 troncales) van crossover** y los switch↔host/servidor van straight-through. Mencionar Auto-MDIX como observación demuestra comprensión (10 pts de "comprensión teórico-práctica") — pero aplicá la regla clásica en el diseño.

### Lo que exige la práctica exactamente

1. Tabla de **cada enlace** → straight o crossover + justificación (qué dispositivo hay en cada extremo). Podés agrupar: "42 enlaces switch-host: straight-through porque…".
2. **Disposición de pines documentada** de al menos UN straight-through y UN crossover (dibujá o tabulá los 8 pines de ambos extremos). Hacé el dibujo/tabla VOS (es evidencia de comprensión — 5 pts).
3. Declarar que el horizontal se poncha con el **mismo estándar en ambos extremos** (toma y patch panel), y decir cuál elegiste (T568B es lo usual en el continente).

---

## 11. Canalización

### Teoría — opciones

| Tipo | Descripción | Pros | Contras | Dónde encaja |
|---|---|---|---|---|
| **Escalerilla metálica abierta (cable tray/ladder)** | Bandeja tipo escalera suspendida del techo | Barata, ventilada, fácil agregar cables, inspección visual | Acumula polvo, sin protección mecánica, estética | Rutas troncales y horizontales sobre cielo falso / pasillos técnicos |
| **Escalerilla/ducto cerrado** | Bandeja con tapa o ducto metálico | Protección mecánica y de polvo, estética | Más cara, menos ventilación, abrir para mantenimiento | Zonas visibles o con riesgo mecánico |
| **Canaleta plástica decorativa** | Canal PVC sobre pared | Estética en oficina, barata | Capacidad limitada | Bajada de la escalerilla al punto de red |
| **Tubería conduit** | Tubo EMT/PVC empotrado o expuesto | Máxima protección | Difícil ampliar (capacidad fija) | Cruces exteriores o empotrados |

**Diseño típico defendible:** escalerilla abierta sobre cielo falso para las rutas principales (troncal + horizontal por pasillos) + canaleta decorativa para las bajadas a cada toma. Justificá por: volumen de cables, facilidad de crecimiento (escalabilidad), costo y norma de no exceder el radio de curvatura del UTP.

> ✏️ **Tarea tuya:** elegí, dibujá la **ruta** de canalización sobre el plano (es parte del diagrama entregable) y justificá en el manual.

---

## 12. Rack o gabinete

### Teoría

- **Rack de piso abierto (open frame, 42U):** máxima capacidad y ventilación, fácil acceso 360°. Para MDF con bastante equipo y cuarto dedicado con acceso controlado.
- **Gabinete de piso cerrado:** como el rack pero con puertas/llave — seguridad física.
- **Gabinete de pared (6U-12U):** poco equipo, ahorra piso. Para IDFs pequeños o sitios sin cuarto dedicado.
- La unidad **U** = 1.75" (44.45 mm) de alto. Cada switch/patch panel típico ocupa 1U-2U.

### Cómo decidir

Sumá las U de tu MDF: switch central (1-2U) + patch panels (según puertos: 24p=1U, 48p=2U) + ODF si hay (1U) + UPS (2U si es rackeable) + organizadores de cable (1U entre paneles) + bandeja + **30-40 % libre para crecimiento**. Con servidores del Data Center en el mismo cuarto, el rack de piso se justifica solo; si tu MDF solo aloja switch+paneles+UPS, un gabinete de pared de 9-12U es defendible. **Decidí según TU inventario y mostrá la suma de U en el manual.**

---

## 13. UPS

### Teoría

Un **UPS (Uninterruptible Power Supply)** mantiene el equipo activo funcionando ante un corte. Se dimensiona en **VA (volt-amperes)**; la relación con watts es el factor de potencia (PF ≈ 0.9 en UPS modernos):

```
1. Potencia_total_W = Σ consumo de cada equipo activo (W)
2. VA_requeridos   = Potencia_total_W / 0.9
3. VA_UPS          = VA_requeridos × 1.25   (margen 25 % — nunca cargar un UPS al 100 %)
4. Elegí el tamaño comercial superior: 750 / 1000 / 1500 / 2000 / 3000 VA
```

### Consumos de referencia (para tu estimación)

| Equipo | Consumo típico |
|---|---|
| Switch de acceso 8-16 puertos (sin PoE) | 10–20 W |
| Switch 24 puertos (sin PoE) | 20–40 W |
| Switch 48 puertos (sin PoE) | 40–70 W |

El enunciado pide respaldar **el equipo activo del edificio: switch central + switches de departamento** (los 6 servidores y las PCs no entran en este cálculo, aunque podés mencionar que en un diseño real el Data Center tendría su propio UPS). Con ~9 switches el total ronda los 200-350 W → el ejercicio da un UPS chico; mostrá el cálculo paso a paso, que es lo que evalúan.

> ✏️ **Tarea tuya:** tabla equipo | cantidad | W unitario | W total, luego las 4 líneas de cálculo y el UPS comercial elegido. Citá de dónde sacaste los consumos (datasheet del modelo elegido).

---

## 14. Etiquetado y TIA/EIA-606

### Formato obligatorio de la práctica

- **Horizontal:** `[Departamento]-PR[##]` → ej. `Recepcion-PR01`, `Legal-PR03`
- **Troncal:** `MDF-[Departamento]` → ej. `MDF-Backend`

Cada cable del diagrama lleva su etiqueta (o la documentás en tabla en el manual). Armá la tabla completa: etiqueta | tipo (troncal/horizontal) | origen | destino.

### Teoría — TIA/EIA-606 (para tu comparación)

El estándar **ANSI/TIA/EIA-606** (hoy TIA-606-C) norma la **administración** de la infraestructura de telecomunicaciones. Exige, entre otras cosas:

- **Identificadores únicos** para cada elemento (no solo cables: también espacios, rutas, gabinetes, puertos) con formato jerárquico que codifica edificio-piso-cuarto-rack-panel-puerto, p. ej. `1A-B01-24` = piso 1, cuarto A, panel B01, puerto 24.
- **Codificación por colores** normalizada por función: p. ej. azul = horizontal, blanco/gris = troncal de edificio, verde = acometida de proveedor, morado = equipo común.
- **Registros (records) y documentación de administración**: base de datos o planillas vinculando cada identificador con su ubicación, ruta, y elementos conectados; actualización obligatoria ante cada cambio.
- **Etiquetas físicas duraderas**, legibles a máquina cuando aplique, en ambos extremos del cable.
- **Clases de administración** (1 a 4) según el tamaño de la infraestructura (un edificio simple = clase 1; campus multi-edificio = clases superiores).

### Lo que te piden concretamente (mínimo)

Un párrafo o tabla comparando tu formato `Depto-PR##` contra 606, con **al menos 2 diferencias concretas** + **1 razón** de por qué en un entorno real se usa el estándar completo. Diferencias candidatas: (a) tu formato no codifica ubicación física (cuarto/rack/panel/puerto), el de 606 sí; (b) tu esquema no define codificación por colores ni registros de administración actualizables; (c) tu etiqueta no es única a nivel campus (dos edificios tendrían `Legal-PR01` duplicado). Razón real: en un data center con cientos de cables, la trazabilidad ante fallas y los movimientos/cambios (MACs) serían inmanejables sin identificadores jerárquicos únicos y registros — el tiempo de diagnóstico crece brutalmente.

---

## 15. Flujo end-to-end

Documentá (texto o diagrama) el recorrido físico completo de un dispositivo final. Estructura tipo que tenés que poder contar con TUS elementos:

```
PC (NIC RJ45)
 → patch cord Cat 6 (straight-through)
 → toma de red doble [Legal-PR03]
 → cable horizontal Cat 6 por canaleta + escalerilla (ponchado T568B en ambos extremos)
 → patch panel del área/MDF (puerto ##)
 → patch cord
 → switch del departamento (puerto ##)
 → cable troncal [MDF-Legal] (crossover, Cat 6a) por escalerilla
 → switch central en MDF (puerto ##)
 → (hacia Data Center / servidores por su propio troncal)
```

Elegí UN dispositivo concreto de tu diseño (con sus etiquetas reales) y narralo paso a paso. Esto amarra todo el manual y demuestra que el diseño es coherente.

---

## 16. Presupuesto

Tabla con TODO el material y equipo. Fuentes de precios: catálogos Siemon y Panduit (links del enunciado), o tiendas locales (Intelaf, MAX, etc. — citá la fuente). Columnas sugeridas:

| Ítem | Descripción/modelo | Cantidad | Precio unitario (Q) | Subtotal (Q) |
|---|---|---|---|---|

No olvidés: bobinas UTP, jacks/tomas, faceplates, patch panels, patch cords (¡2 por punto: lado toma y lado panel!), conectores RJ45, switches (9), rack/gabinete, organizadores, escalerilla + accesorios, canaletas, UPS, ODF+fibra+SFP si aplica, y un renglón de imprevistos (5-10 %). Cerrá con el total y (recomendado) el análisis compra directa vs. proveedor.

---

## 17. El diagrama

Es el entregable de más peso visual (20 pts de topología + 15 de troncal/horizontal + 5 de estética dependen de él). Debe mostrarse **sobre el plano base**:

**Checklist del diagrama:**
- [ ] Plano base de fondo con los departamentos identificados
- [ ] MDF marcado y rotulado
- [ ] Switch de cada departamento y el central (íconos claros)
- [ ] Cada punto de red con su tipo de toma (unitaria/doble/…)
- [ ] Cantidad de hosts visible por segmento
- [ ] Troncal y horizontal **diferenciados** (color/grosor) con leyenda
- [ ] Ruta de canalización dibujada
- [ ] Etiqueta en cada cable (`MDF-X`, `X-PR##`)
- [ ] Leyenda/simbología y título con tu carnet

**Técnica en draw.io:** File → Import la imagen del plano → clic derecho → Edit Style → agregá como capa de fondo bloqueada (`locked`) → dibujá encima con capas separadas (equipos / cableado troncal / cableado horizontal / etiquetas). Exportá a PNG en alta resolución Y subí también el `.drawio`.

---

## 18. Entregables

### 18.1 `ManualTecnico.md` — estructura sugerida

```markdown
# Manual Técnico — Práctica 1 · Redes 1 · [Carnet]
1.  Inventario de equipos
2.  Distribución de hosts por departamento
3.  Ubicación y justificación del MDF
4.  Topología física por departamento (tabla + justificaciones)
5.  Medios de transmisión: tipo y categoría por segmento (tabla)
6.  Cableado troncal vs. horizontal (definición + enlaces)
7.  Puntos de red y tipos de toma (tabla)
8.  Distancias estimadas y cálculo de bobinas (tablas + fórmula)
9.  Equipo activo: justificación y dimensionamiento (patch panel ≥ → switch)
10. Estándares T568A/T568B: tabla straight/crossover por enlace
11. Disposición de pines (1 straight + 1 crossover, pin a pin)
12. Canalización: tipo, ruta y justificación
13. Rack/gabinete del MDF: cálculo de U y justificación
14. UPS: estimación de consumo y capacidad (cálculo completo)
15. Tabla de etiquetado de cables
16. Comparación con TIA/EIA-606 (≥2 diferencias + 1 razón)
17. Flujo de conexión end-to-end
18. Presupuesto estimado
19. (Recomendado) Consideraciones de escalabilidad futura
20. (Recomendado) Compra directa vs. proveedor
```

### 18.2 `InformeDesarrollo.md`

No repite el manual — cuenta el **proceso**: cómo interpretaste el plano, qué criterios usaste para las topologías/medios/equipo, qué retos encontraste (escala del plano, distancias, ubicación del MDF) y la justificación del medio del troncal. 1-3 páginas honestas valen más que 10 genéricas.

### 18.3 Repositorio

- [ ] Nombre `Redes1_2S_2026_CARNET`, carpeta `Practica1`
- [ ] Tutores invitados como colaboradores
- [ ] Diagrama (PNG/JPG + editable), Manual, Informe adentro
- [ ] Commits con mensajes descriptivos (buena práctica, y evidencia de trabajo propio)

---

## 19. Checklist final contra la rúbrica

**Requisitos sí/no (sin esto no te califican):**
- [ ] Es un diagrama de topología FÍSICA (nada de configuración/simulación)
- [ ] Herramienta de diagramación + Markdown + GitHub usados
- [ ] Manual con: topología, medio físico, pines, etiquetado, comparación 606
- [ ] Medio físico justificado por distancia y ancho de banda; cables etiquetados
- [ ] Pines T568B (y A si aplica) para ≥1 straight y ≥1 crossover
- [ ] Topología justificada POR departamento (hosts, criticidad, costo/escalabilidad/tolerancia)

**Puntos (100 internos):**

| Criterio | Pts | Dónde se gana |
|---|---|---|
| Diseño y organización de la topología | 20 | Diagrama §17 + §4 |
| Medio físico (tipo/categoría) | 10 | §5 |
| T568A/T568B (straight/crossover) | 10 | §10 tabla por enlace |
| Disposición de pines | 5 | §10 documentación pin a pin |
| Troncal vs. horizontal | 15 | §6 (diagrama + manual + etiquetas) |
| Documentación técnica (.md) | 25 | Manual completo §18.1 |
| Diseño estético y profesional | 5 | Leyendas, orden, consistencia |
| Comprensión teórico-práctica | 10 | Justificaciones propias, Auto-MDIX, 606 |

---

## Orden de trabajo sugerido (≈20 h)

1. **(1 h)** Descargar plano, crear repo, elegir herramienta.
2. **(1 h)** Decidir distribución PCs/laptops (§2) y criticidad por departamento.
3. **(2 h)** Ubicar MDF (§3) y marcar puntos de red con tipos de toma (§7) sobre el plano.
4. **(4 h)** Dibujar el diagrama completo (§17): switches, cableado troncal/horizontal, canalización, etiquetas.
5. **(2 h)** Medir distancias con la escala y calcular bobinas (§8).
6. **(1 h)** Dimensionar patch panel, switches, rack y UPS (§9, §12, §13).
7. **(4 h)** Escribir el Manual Técnico (§18.1) con todas las tablas y justificaciones.
8. **(2 h)** Pines T568A/B, tabla straight/crossover, etiquetado completo y comparación 606 (§10, §14).
9. **(1.5 h)** Presupuesto (§16) e Informe de Desarrollo (§18.2).
10. **(1.5 h)** Revisión contra el checklist §19, estética del diagrama, push final e invitación a tutores.
