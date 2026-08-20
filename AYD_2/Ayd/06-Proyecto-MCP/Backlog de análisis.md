---
tema: Proyecto MCP
fuente: "Análisis de Fable 5 sobre el MCP y la bóveda — sondas reales por stdio + verificación contra capturas. Para implementar por Opus."
fecha: 2026-08-20
---

# Backlog de análisis — IMPLEMENTADO (2026-08-20)

> [!important] Estado: los 16 ítems están implementados
> Este documento se conserva como **registro de qué se cambió y por qué**, con la evidencia de cada
> hallazgo. Ya no es una lista de pendientes.
>
> | Parte | Ítems | Resultado |
> |---|---|---|
> | 1 — MCP | M-01 … M-05 | `buscar` tokeniza y puntúa, sin duplicados; `leer_nota` resuelve alias; tope por archivo; 5 casos de regresión |
> | 2 — Bóveda | F-01, F-02, F-03, F-04 | reconciliación de estereotipos, calibración epistémica, regla espejo |
> | 2-bis — Contenido | F-05 … F-09 | contexto y core alineados a la clase, mapa del parcial |
> | 2-ter — Conceptos | F-10, F-11, F-12 | colisión de navegabilidad, campo de acción, mantenibilidad |
>
> **Quedaron sin hacer a propósito:** M-06 (orden aleatorio en flashcards) y M-07 (frontmatter
> crudo en `metodo_tarea`). Los dos son 🟡 y el backlog mismo dice que el cliente puede resolverlos.
>
> Verificación al cierre: **37/37** lógica · **12/12** herramientas por protocolo MCP · **0**
> hallazgos de integridad · **39/39** cobertura · **106/106** diagramas parsean y renderizan · 0
> enlaces rotos · 141 términos sin duplicados ni desorden.

Reparto de trabajo acordado: **Fable analiza, Opus implementa.** Cada hallazgo trae la evidencia con
la que se verificó, para no re-derivar nada. Nada de esto está implementado todavía.

**Convención de prioridad:** 🔴 alta (afecta el uso real) · 🟠 media (calidad) · 🟡 baja (pulido).

---

## Parte 1 — MCP: robustez

### 🔴 M-01 · `buscar` es frase-exacta y falla con consultas naturales

**Evidencia (sonda por stdio, 2026-08-20):**

| Consulta real de estudiante | Resultado |
|---|---|
| `"diferencia entre include y extend"` | **0 resultados** — y el tema está cubierto en 3 notas |
| `"priorizar drivers"` | **0 resultados** — es el criterio de 30 puntos |
| `"cuantos actores debe tener un caso de uso"` | **0 resultados** — la regla está en Convenios §2 |
| `"contexto guatemalteco"` | 10 resultados (la frase aparece literal) |

**Causa raíz:** `src/notas.ts` ~línea 187: `if (!clave(linea).includes(termino)) continue;` —
la consulta completa se busca como **subcadena literal** de cada línea. Si la frase no aparece
textual, no hay nada.

**Especificación del arreglo:**

1. Tokenizar la consulta con `clave()`, descartando *stopwords* (`de la el los las un una y o
   que como entre debe tener cuantos cual es en del al por para se`).
2. Buscar en **tres pasadas**, con puntaje decreciente:
   - **frase exacta** en la línea (comportamiento actual) — puntaje máximo;
   - **todos los tokens en la misma línea**;
   - **todos los tokens en el mismo archivo** — reportando la línea que más tokens junta.
3. Bonificar cuando el match cae en el **título de la nota**, en un **alias** del frontmatter o en
   un **encabezado** (`## `): esas coincidencias van primero en la salida.
4. Si una consulta queda sin tokens tras las stopwords, caer al comportamiento actual.

**Criterio de aceptación** (agregar a `pruebas/cobertura.mjs`, ver M-05): las tres consultas que hoy
dan 0 devuelven, respectivamente, algo que contenga `"inclusi"` o `"extensi"`; `"priorizar"`;
`"Convenios"`.

### 🔴 M-02 · `buscar` escanea el glosario dos veces y devuelve duplicados

**Evidencia:** `buscar("plantilla obligatoria")` devuelve la línea `03-Glosario.md:148` **dos
veces**.

**Causa raíz:** en `src/notas.ts` (~149-165) la lista `objetivos` agrega `CARPETAS.glosario`
explícitamente **y además** el listado de la raíz (`listarArchivos(".")`) vuelve a incluir
`03-Glosario.md`. El mismo archivo se recorre dos veces.

**Arreglo:** deduplicar `objetivos` (un `Set` sobre la ruta normalizada) antes del bucle.
**Aceptación:** ninguna consulta devuelve dos veces la misma `ruta:línea`.

### 🔴 M-03 · `leer_nota` no resuelve los alias del frontmatter

**Evidencia:** `leer_nota("drivers")` → error, aunque la nota `Drivers arquitectónicos` declara
`alias: "drivers, driver arquitectonico, ..."`. La sugerencia del error es buena (propone la nota
correcta), pero obliga a una segunda llamada.

**Arreglo:** antes de fallar, resolver contra los `alias` del frontmatter de las notas — la misma
mecánica que ya usa `metodo_tarea` en `src/tareas.ts`. Si un alias matchea una única nota, devolverla
directamente. Si matchea varias, error con las candidatas (comportamiento actual).
**Aceptación:** `leer_nota("drivers")` devuelve la nota; `leer_nota("driver arquitectonico")` también.

### 🔴 M-05 · Regresión: agregar los casos nuevos a `cobertura.mjs`

Cuando M-01/M-02/M-03 estén hechos, agregar estos casos (formato del archivo existente):

```
["buscar", { consulta: "diferencia entre include y extend" }, "inclusi"],
["buscar", { consulta: "priorizar drivers" }, "priorizar"],
["buscar", { consulta: "cuantos actores debe tener un caso de uso" }, "Convenios"],
["leer_nota", { nombre: "drivers" }, "factores cr"],
```

Y un caso negativo de duplicados si el harness lo permite (o verificarlo en `verificaciones.ts`).

### 🟠 M-04 · Resultados de `buscar` sin agrupar: un archivo puede acaparar la salida

**Evidencia:** `buscar("paso 0")` → 19 coincidencias, muchas del mismo archivo; el tope global es 40
y se llena por orden de recorrido, no por relevancia.

**Arreglo:** tope de **2-3 líneas por archivo** en la salida (indicando "+N más en esta nota"), y
orden por puntaje de M-01. Mantener el tope global.

### 🟡 M-06 · `obtener_flashcards`: opción de orden aleatorio

Hoy devuelve las primeras N en orden del archivo. Para armar quizzes variados, un parámetro opcional
`aleatorio: true` que muestree sin repetir. Baja prioridad: el cliente puede pedir todas y elegir.

### 🟡 M-07 · `metodo_tarea` devuelve el frontmatter crudo

La salida arranca con el YAML (`---\ntema: ...`). Inofensivo para un cliente LLM, pero limpio sería
quitarlo y conservar solo `entregable`/`alias` en la cabecera formateada que ya imprime.

**Lo que se sondeó y está bien (no tocar):** las sugerencias de `leer_nota` ante error; el matcheo
parcial de `glosario` (`"driver"` → 4 entradas, `"cun"` → 4); la resolución de `metodo_tarea`
(`"priorizar"` → guía de drivers, `"caso 1"` → plan); el matcheo parcial de `obtener_flashcards`;
el corte en el **primer** `::` del parser de flashcards.

---

## Parte 2 — Bóveda: comprensión fina

### 🔴 F-02 · Calibración epistémica: hay inferencias nuestras etiquetadas como "de clase"

La jerarquía núcleo/complemento **depende de que las etiquetas sean confiables**. Tres archivos de
flashcards declaran *"Todas son de clase"* y contienen tarjetas cuya **respuesta es lectura nuestra**
(correcta, pero no verbatim de una diapositiva):

| Archivo | Tarjeta / claim | Qué es en realidad |
|---|---|---|
| `Flashcards - Drivers arquitectónicos y contexto` | *"El filtro es estructural: si el requisito cambia y hay que cambiar la estructura, es driver"* | **derivación nuestra** de "factores críticos que determinan su estructura fundamental" |
| ídem | *"Un driver de calidad sin número no es un driver, es un deseo"* | **editorial nuestro**; lo verbatim es que todos sus ejemplos llevan número |
| `Flashcards - Ejemplos resueltos y descripción textual` | *"3 a 5 procesos"* como escala | **patrón inducido** de 2 ejemplos (5 y 5) + 1 de 3; ella nunca dictó un rango |
| ídem | *"conviene la de la NT1"* para IDs | **consejo nuestro**, no indicación de ella |

**Arreglo (sin borrar contenido — las lecturas son valiosas):**
1. Cambiar la cabecera de los 3 archivos a: *"Salen de las diapositivas de clase; las respuestas
   marcadas «(lectura nuestra)» derivan de ellas pero no son texto de la catedrática."*
2. Agregar el marcador **«(lectura nuestra)»** al final de las ~4 respuestas listadas.
3. En `08-Tareas/Ejemplos resueltos…`, la regla 2 ("3 a 5 procesos") debe decir **"patrón observado
   en sus ejemplos, no regla dictada"**.

**Aceptación:** `grep -l "Todas son de clase" 04-Flashcards/` → 0 archivos con esa frase absoluta;
las 4 tarjetas llevan el marcador.

### 🟠 F-01 · Las formas del estereotipo están dispersas y nadie las reconcilia completo

El material de clase usa **siete** grafías para dos relaciones, y la bóveda las cita fielmente
(bien), pero solo hay una reconciliación parcial (extender/extiende/extend, en Ejemplos resueltos).
Conteo actual en la bóveda: `«include»` 47 · `«extend»` 35 · `«includes»` 7 · `«extends»` 5 ·
`«extender»` 5 · `«extiende»` 3 · `«incluye»` 1.

**Arreglo:** una tabla corta en `01-Notas/Relaciones y dependencias en UML.md` (junto a "La tabla
resumen de la clase"):

| Forma | Dónde aparece en el material |
|---|---|
| `«extiende»` / `«incluye»` | la tabla *Resumen de los Tipos de Relaciones* |
| `«extends»` / `«include»` | las diapositivas de definición (Extensión / Inclusión) |
| `«extender»` | el expandido del restaurante (con guardas `{...}`) |
| `«includes»` / `«extends»` | el expandido *Procesamiento de Pedido* |

Con la regla: **todas nombran la misma relación; en una entrega se elige UNA pareja y se es
consistente; al citar una diapositiva, se cita textual.** Cross-link desde
[[Relación de inclusión include]] y [[Relación de extensión extend]].

### 🟠 F-04 · La regla espejo (actor sin CU) no está en la nota canónica de convenios

La regla existe — diapositiva 30: *"cada actor se involucra con al menos un caso de uso"* — y está
en `Caso de uso del negocio.md:48` y en la checklist de `Guía - Diagrama de casos de uso del
negocio.md:156` ("un actor suelto es un error"). Pero **`Convenios del diagrama de CUN` §2 solo
cubre la dirección CU-sin-actor**. Quien lea la nota canónica de reglas de dibujo no ve la mitad
espejo.

**Arreglo:** en Convenios §2, añadir la regla espejo con la cita de la diapositiva y el cross-link.
Nota fina: en la generalización de actores del hospital, el padre *Cliente* **sí** tiene CU propio
(*Despachar medicamentos*), así que la regla no tiene la excepción simétrica del lado del actor —
vale decirlo.

### 🟡 F-03 · Áreas-como-actores: la conclusión está, la base doctrinal no está conectada

`Ejemplos resueltos` justifica "las áreas son actores" **empíricamente** (el hospital de ella). La
base doctrinal ya vive en `Actor del negocio.md:24`: los candidatos incluyen *"otras partes de la
organización, si ésta es grande"* — eso es exactamente Contabilidad/Ventas/Almacén como actores.
**Arreglo:** una línea en Ejemplos resueltos §4 citando esa viñeta y enlazando [[Actor del negocio]].
Convierte una induction en una regla con dos fuentes.

---

## Parte 2-bis — Análisis de contenido del segundo cerebro (2ª pasada)

Pasada de **coherencia conceptual**: buscar lugares donde material pre-capturas y post-capturas
conviven sin reconciliar. Se encontraron dos contradicciones reales, en el peor archivo posible: la
guía que el estudiante va a seguir para el Caso 1.

### 🔴 F-05 · `Guía - Caso de negocio` §Diagrama 1: definición de contexto PRE-capturas

**Evidencia:** la sección dice *"¿dónde termina el **negocio**?… El negocio se dibuja como una sola
**caja**"* y mantiene el callout *"Negocio o sistema: **sigue siendo ambigüedad #2** — preguntalo"*.
Pero esa ambigüedad **ya está resuelta** con fuente de clase: la diapositiva *"Diagramas de
Contexto"* define **elipse = El Producto**, rectángulos = entidades, flechas = *streamlines* — y el
`Plan - Caso 1` la marca RESUELTA, igual que la nota [[Diagrama de contexto]]. La guía quedó con la
versión anterior: pide preguntar algo respondido, sugiere que la caja puede ser el negocio, y usa
otra notación ("caja" vs elipse).

**Arreglo:** reescribir la apertura de §Diagrama 1 alineada a [[Diagrama de contexto]] (que es
núcleo): es el contexto **del sistema/producto**, con la notación de ella. El material de Garland
(Context Viewpoint) se conserva como complemento — es compatible: *"el sistema va siempre en el
medio"*. Eliminar el callout de ambigüedad y remitir al Plan.
**Aceptación:** `grep "sigue siendo ambigüedad" 08-Tareas/` → 0; la sección menciona
elipse/entidades/streamlines.

### 🔴 F-06 · `Guía - Caso de negocio` §Diagrama 2: dos definiciones de "core" contradictorias a 5 líneas de distancia

**Evidencia:** la definición dice *"el core es la categoría **núcleo**… Ejemplo (restaurante): el
core es **Servicio de comida**. Uno solo"* — con un Mermaid `Cliente --- Servicio de comida`. El
callout inmediatamente siguiente (*"El ejemplo resuelto por ella"*) muestra lo contrario: el core es
**una elipse con el negocio completo** — *"Sistema de Ventas on line Tienda X"*, y en sus otros
casos *"Automatización de Procesos del Restaurante X"* y *"Sistema Hospitalario"*.

**Resolución (mandan sus diapositivas, 4 casos consistentes):** core = **UNA elipse que nombra el
negocio/sistema completo**, todos los actores alrededor. La clasificación núcleo/soporte/gerencial
de la NT aplica a la **primera descomposición** — el propio ejemplo del restaurante de ella la
muestra ahí (Servicio de comida / Comprar suministros / Marketing son los TRES procesos del
diagrama 3, no el core). El criterio de la NT (*"¿qué servicios básicos recibe el cliente?"*) sigue
sirviendo, pero para **clasificar procesos en el diagrama 3**, no para definir el core.

**Arreglo:** reescribir la definición de §Diagrama 2; recalibrar el warning (*"si tu core tiene más
de una elipse, ya es la descomposición"* — no "ocho CDU"); corregir el Mermaid de ejemplo; mover el
criterio de la NT a §Diagrama 3; revisar el ítem de la checklist *"el core del diagrama 2 está
contenido en la descomposición"* → *"la descomposición abre la elipse del core conservando el juego
de actores"* (el patrón verificado).
**Aceptación:** la sección no contiene *"el core es Servicio de comida"*; definición y ejemplo dicen
lo mismo.

**Verificado sin daño colateral:** las flashcards **no** tienen la versión vieja del core (la única
tarjeta del tema da la respuesta correcta), y la checklist de consistencia es mayormente salvable.

### 🟠 F-07 · Tres versiones de "los pasos" sin distinguir en las flashcards

En el material conviven, todas legítimas: los **4 pasos** del deck PDF (diseño de datos →
representaciones → alternativas → método), la **lista de 7** actividades, y las **8 etapas** de la
Figura 2-8 con el paso 0. La nota [[Proceso de diseño arquitectónico]] las reconcilia, pero la
tarjeta *"¿Cuáles son los cuatro pasos…?"* (`Flashcards - Arquitectura de software:38`) no se
distingue de las otras — en un parcial, "¿cuáles son los pasos?" tiene tres respuestas defendibles.
**Arreglo:** coletilla en esa tarjeta ("los cuatro del deck; no confundir con la lista de 7 ni las 8
etapas") + una tarjeta nueva de diferenciación de las tres versiones.

### 🟠 F-08 · El primer parcial (22 ago) cae DENTRO del bloque 1.8/1.9 del cronograma

**Evidencia:** cronograma — *"1.8 y 1.9: 17 al 24 de agosto"*, parcial el **22**. No se puede asumir
que solo entra hasta 1.7. Estado de preparación real: **1.1–1.7 núcleo sólido**; **1.8 núcleo**
(capturas de Categorías de Estructuras); **1.9 es el punto débil** — estilos arquitectónicos es
complemento entero, candidata/referencia ya tienen fuente de clase (flujo de Ambler), y **on-premise
vs cloud no tiene fuente alguna**.
**Arreglo (contenido, no código):** sección corta *"Preparación del primer parcial"* en el `Índice`
con este mapa, y la pregunta operativa para el auxiliar: *"¿el parcial cubre 1.8/1.9?"*.

### 🟡 F-09 · Ítem de checklist a reformular tras F-06

Cubierto dentro del arreglo de F-06 (último punto). Se lista aparte solo para que no se pierda si
F-06 se implementa parcial.

---

## Parte 2-ter — Validación conceptual de la teoría (3ª pasada)

Pasada distinta de las anteriores: no *¿transcribimos bien?* sino *¿la teoría cierra?* — diapositiva
contra diapositiva, y diapositivas contra la teoría canónica (UML, SAIP). Tres hallazgos y una lista
de validaciones positivas.

### 🟠 F-10 · Colisión normativa entre las dos diapositivas de navegabilidad — y la nota hereda el lado equivocado

**Evidencia (ambas releídas a resolución completa, verbatim):**

- Diapositiva 50: *"La relación **en los dos sentidos** se muestra **sin saetas**."*
- Diapositiva 51 (la que dice **"los convenios que usaremos serán"**): *"La flecha de iniciación del
  actor al CUN **siempre se muestra**, aún si más tarde el CU inicia comunicación con el actor que lo
  mostró. **En este último caso solo se pone una flecha del actor al CUN**."* Y: *"el resto de las
  flechas **puede ser omitida**."*

**La colisión:** para el caso *ambos inician*, la 50 manda "sin saetas" y la 51 manda "solo flecha
actor→CUN". Y como la 51 permite **omitir** las flechas CUN→actor, una línea sin puntas puede ser
una flecha omitida — no una afirmación de bidireccionalidad.

**Dónde golpea:** `Convenios del diagrama de CUN` §3 tiene el callout *"Una línea sin flecha NO
significa 'no sé'. Significa 'en los dos sentidos'. Es una afirmación, no una omisión"* — eso es la
lógica de la 50 sola, y **bajo el convenio de la 51 es engañoso**. El árbol de decisión de §4 de la
misma nota ya sigue a la 51: la nota se contradice a sí misma entre secciones.

**Resolución propuesta:** la 51 es la operativa (ella la titula "los convenios que **usaremos**");
la 50 es la semántica general de la notación. Arreglo: reescribir el callout de §3 —
*"bajo la notación general (diap. 50), sin saetas = dos sentidos; bajo **el convenio de la clase**
(diap. 51), ambos-inician se dibuja como flecha actor→CUN y las flechas CUN→actor pueden omitirse,
así que una línea sin puntas NO es señal fiable de bidireccionalidad"*. En un examen: contestar
según la diapositiva que se cite; en el Caso 1: dibujar según la 51.
**Aceptación:** el callout de §3 menciona ambas diapositivas y cuál manda; el árbol de §4 no cambia.

### 🟠 F-11 · "Campo de acción" es el concepto que unifica la frontera actor/trabajador — y la bóveda no lo usa

**La tensión real:** *"cada actor modela algo **fuera del negocio**"* (diap. 30) convive con áreas
internas como actores en los 4 ejemplos de ella (Contabilidad, Ventas, Almacén, Farmacia,
Encamamiento). La bóveda lo resuelve ad-hoc en tres lugares con tres vocabularios ("fuera del
*proceso*", "frente al *sistema*", "otras partes de la organización").

**El material de clase ya trae el concepto unificador y aparece 3 veces solo como cita pasajera:**
el Modelo de CUN describe procesos *"vinculados al **campo de acción**"* (diap. 22) y la NT dice que
clasificar *"**depende del campo de acción** que se esté modelando"*. La frontera que decide
actor-vs-trabajador **es el campo de acción modelado, no la empresa**: Contabilidad es actor del CUN
*Ventas online* porque está fuera de *ese* campo de acción, aunque esté dentro de la Tienda X.

**Arreglo:** sección corta en [[Actor del negocio]] ("La frontera es el campo de acción") que
unifique los tres casos con el vocabulario de clase, y cross-links desde `Ejemplos resueltos` §4 y
la guía. Absorbe también el F-03 (que queda contenido en este).
**Aceptación:** `grep -c "campo de acción" 01-Notas/Actor del negocio.md` ≥ 2, con la resolución
explícita de la tensión.

### 🟠 F-12 · La definición de "drivers de calidad" de la diapositiva no cubre a uno de sus propios siete

**Evidencia:** la diapositiva define *"definen **cómo debe comportarse el sistema**"*, pero entre
sus siete está **Mantenibilidad** con ejemplos que no son comportamiento del sistema: *"cobertura de
pruebas > 80 %"* y *"añadir un nuevo tipo de reporte en menos de 2 días-persona"*. Ahí quien
responde es **el equipo**, no el sistema — exactamente la distinción estímulo/respuesta que la
propia bóveda enseña en [[Atributos de calidad]] §4 (calidades de ejecución vs del desarrollo,
SAIP): *"un estímulo para modificabilidad es una solicitud de modificación"* y responden los
desarrolladores.

**Qué es:** una **simplificación de la diapositiva**, no un error nuestro — 6 de los 7 son de
ejecución y mantenibilidad es la excepción. Documentarlo blinda contra la pregunta cruzada
(*"¿la mantenibilidad define cómo se comporta el sistema?"* → no: define cómo responde el equipo).

**Arreglo:** en [[Drivers arquitectónicos]] §4, una fila/nota que mapee los 7 contra
ejecución/desarrollo y marque la simplificación con la conexión a Atributos §4.
**Aceptación:** la nota contiene el mapeo y la frase "quien responde es el equipo" (o equivalente).

### ✅ Validaciones positivas (teoría que se verificó y aguantó — no tocar)

| Qué se validó | Contra qué | Veredicto |
|---|---|---|
| Dirección de `«extend»` (extendido→base) y de `«include»` (base→incluido) | UML 2.x | ✔ las diapositivas son correctas |
| *"El base declara puntos de extensión; el extendido solo altera los marcados"* | UML `ExtensionPoint` | ✔ correcto y bien capturado |
| Generalización: línea **llena** + triángulo hueco | UML | ✔ (el error era nuestro y ya está corregido) |
| *"Por cada flecha se asume un mensaje de retorno"* vs no dibujar respuestas | coherencia interna | ✔ consistente |
| RF2 "Autenticación multifactor" clasificado como **RF** | nuestra regla de frontera (agrega vs califica) | ✔ la diapositiva y la regla coinciden: MFA **agrega** funcionalidad, aunque sirva a seguridad — buen ejemplo de examen |
| Las tres taxonomías de calidad (9126 / FURPS / 7 drivers) | entre sí | ✔ ya reconciliadas en [[Atributos de calidad]], sin nueva contradicción |

---

## Parte 3 — Orden de implementación sugerido

0. **PRIMERO, por el parcial del 22 y el Caso 1: F-05, F-06, F-10** (la guía y la nota de convenios
   contradicen o distorsionan a la clase en cosas que se dibujan/contestan ya) y **F-08** (el mapa
   del parcial en el Índice). Son los únicos con fecha encima.
1. **M-02** (bug de 3 líneas) → **M-03** (mecánica ya existe en `tareas.ts`) → **M-01+M-04** (el
   grueso) → **M-05** (regresión).
2. **F-02** (integridad de etiquetas: es lo que protege la jerarquía de fuentes) → **F-11** (absorbe
   F-03) → **F-12** → **F-01** → **F-04** → **F-07**.
3. Al cerrar: `npm run build` + los cuatro audits + validar Mermaid + espejar al repo + commit.

Lo que NO hay que hacer: no re-dibujar en Mermaid los diagramas de ella (ver la advertencia en
`CLAUDE.md` §Procesar capturas); no agregar herramientas nuevas al MCP (las 12 cubren los casos de
uso; el problema es la calidad de `buscar`, no la falta de superficie).
