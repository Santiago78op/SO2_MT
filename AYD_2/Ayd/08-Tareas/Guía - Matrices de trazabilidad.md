---
tema: Guía de entregable
fuente: "Rúbrica del Caso FarmaHosp (núcleo) + teoría de trazabilidad (complemento)"
fecha: 2026-08-19
entregable: Matrices de trazabilidad de requerimientos
alias: "matriz de trazabilidad, matrices, trazabilidad, matriz de dependencias, stakeholders vs cdu, cdu vs drivers"
---

# Guía — Matrices de trazabilidad de requerimientos

Cómo se construyen las **tres** matrices que pide la rúbrica, y cómo se leen para que sirvan de algo.

> [!important] Esto vale 20 puntos y son tres matrices, no una
> La rúbrica del [[Plan - Caso 1 FarmaHosp|Caso 1]] lo pide textual:
>
> | Matriz | Cruza |
> |---|---|
> | **Stakeholders vs. CDU** | Quién pidió cada caso de uso |
> | **Drivers RF vs. Drivers RF** | Cómo se relacionan los requisitos entre sí |
> | **CDU vs. Drivers RF** | Qué caso de uso realiza cada requisito funcional |
>
> La teoría de fondo está en [[Matriz de trazabilidad de requisitos]]. Esta guía es el "cómo se
> hace".

> [!important] La plantilla oficial
> Esta es la plantilla que hay que usar. Está en
> `adjuntos/plantillas/plantilla-matriz-dependencias.jpeg` y viene de *"Un Caso de Estudio para la
> Adopción de un Modelo de Trazabilidad de Requisitos en el Sector Energético"* (fig. 1, p. 91).
>
> ![[adjuntos/plantillas/plantilla-matriz-dependencias.jpeg]]
>
> **Fig. 1 — Matriz de dependencias requisitos X vs requisitos Y**
>
> Y ojo con la cantidad: lo habitual son **1 o 2 matrices**; el Caso 1 pide **tres**. Manda el
> enunciado — ver [[Guía - Caso de negocio]].

## La plantilla, elemento por elemento

Lo que hay que respetar de la imagen:

| Elemento | Cómo va |
|---|---|
| **Eje horizontal** | Un encabezado que **abarca todas las columnas** con el nombre del eje y su letra: `REQUISITOS (X)`. Debajo, la fila de identificadores |
| **Eje vertical** | Una **columna extra a la izquierda** con el nombre del eje **rotado 90°**: `REQUISITOS (Y)`. Al lado, la columna de identificadores |
| **Identificadores** | Cortos y uniformes: `R1`, `R2`, `R3`… y **`Rn`** como última fila y última columna, para indicar que la serie sigue |
| **Marca** | Una **X** sola. Sin otros símbolos, sin colores, sin números |
| **Celdas sin relación** | **Vacías**. El vacío es información: es lo que se lee al buscar huecos |
| **Bordes** | Todas las celdas con borde visible: sin la grilla completa la matriz no se puede leer |
| **Pie de figura** | Numerado y descriptivo: *"Fig. N. Matriz de dependencias requisitos X vs requisitos Y"* |

> [!important] El pie de figura resuelve la ambigüedad #6
> La plantilla se titula **"Matriz de dependencias"**. Eso confirma que, para el cruce
> *Drivers RF vs. Drivers RF*, la relación que se marca es **dependencia** — no conflicto ni
> precedencia. Igual conviene declararlo en el documento, pero ya no es una decisión a ciegas.

> [!warning] Dos cosas de la imagen que NO hay que copiar
> **1. La diagonal.** En la plantilla la fila `R5` tiene una X en la columna `R5`. Un requisito no
> depende de sí mismo: es un artefacto de la ilustración. En tu matriz la diagonal va **vacía** o
> marcada como no aplicable.
>
> **2. Los ejes de distinto largo.** La plantilla tiene 8 filas y 6 columnas porque es un dibujo
> genérico. Si cruzás requisitos contra requisitos, la matriz es **cuadrada**: los mismos IDs en los
> dos ejes.

### Adaptar la plantilla a las otras dos matrices

La plantilla es de requisitos vs. requisitos, pero su estructura sirve para las tres. Solo cambian
los rótulos de los ejes:

| Matriz | Eje X (arriba) | Eje Y (izquierda, rotado) |
|---|---|---|
| 1 | `CDU (X)` | `STAKEHOLDERS (Y)` |
| 2 | `DRIVERS RF (X)` | `DRIVERS RF (Y)` |
| 3 | `DRIVERS RF (X)` | `CDU (Y)` |

Y una nota sobre la marca: la plantilla usa **solo X**. Si en la matriz 1 querés distinguir *actor*
de *interesado*, es una **extensión** de la plantilla — se puede, pero hay que declararla en la
leyenda, porque te estás saliendo del formato dado.

El ejemplo es de una **biblioteca municipal**, igual que en
[[Guía - Diagrama de casos de uso del negocio]], para que veas la forma sin copiar contenido.

---

## Paso 0 — El punto de inicio: los identificadores

**No se empieza dibujando la tabla.** Una matriz cruza cosas que ya tienen **nombre y número**. Si
los identificadores no existen o cambian, la matriz nace muerta.

Antes de la primera matriz hace falta:

| Artefacto | Prefijo de ID | De dónde sale |
|---|---|---|
| Stakeholders | `STK-nn` | La tabla de stakeholders del enunciado |
| Casos de uso del negocio | `CDU-nn` | El diagrama de CDU y la primera descomposición |
| Drivers funcionales | `RF-nn` | Los CDU expandidos |
| Drivers de atributo de calidad | `RNF-nn` o `AC-nn` | Los acuerdos de calidad del enunciado |
| Drivers de restricción | `RES-nn` | El "lo que NO debe hacer el sistema" |

**Regla que no se rompe:** un ID **nunca** se reutiliza ni se renumera. Si eliminás un requisito, su
ID queda muerto. Renumerar rompe las tres matrices a la vez.

> [!tip] Tu turno
> Antes de seguir, numerá tus stakeholders, CDU y drivers. Es media hora de trabajo aburrido que
> ahorra rehacer las tres matrices.

---

## Matriz 1 — Stakeholders vs. CDU

**Qué pregunta responde:** *¿quién pidió cada caso de uso, y hay algún stakeholder al que no le
estamos dando nada?*

Es trazabilidad **pre-RS**: conecta el caso de uso con su **origen**. Ver
[[Matriz de trazabilidad de requisitos]].

### Cómo se arma

Stakeholders en las filas, CDU en las columnas. En la celda, una marca. Conviene distinguir dos
tipos de participación:

- **X** — es **actor** del CDU: interactúa directamente
- **i** — tiene **interés** en el CDU: le afecta el resultado, pero no participa

Ejemplo (biblioteca):

| | CDU-01<br/>Prestar libro | CDU-02<br/>Devolver libro | CDU-03<br/>Adquirir material | CDU-04<br/>Difundir actividades |
|---|---|---|---|---|
| **STK-01** Vecino lector | **X** | **X** | | i |
| **STK-02** Vecino potencial | | | | **X** |
| **STK-03** Editorial | | | **X** | |
| **STK-04** Municipalidad | i | | **X** | i |
| **STK-05** Sistema nacional de bibliotecas | | | i | |

### Cómo se lee

| Lectura | Qué detecta | Qué significa |
|---|---|---|
| **Por filas** | Una fila **vacía** | Un stakeholder al que el sistema no le da nada. O falta un CDU, o ese stakeholder no debería estar |
| **Por columnas** | Una columna **vacía** | Un CDU que nadie pidió. Es *gold plating*: se modeló algo que ningún stakeholder necesita |
| **Por densidad** | Una fila muy poblada | Un stakeholder crítico: cualquier cambio lo afecta. Suele ser el que hay que consultar primero |

En el ejemplo, **STK-05 tiene solo un interés y ningún X**: es un candidato a revisar. O interactúa
con algo que no modelamos, o su participación es tan marginal que quizá no es stakeholder.

> [!warning] El error más común en esta matriz
> Poner una **X a todos los stakeholders en todos los CDU** "por si acaso". Una matriz donde todo
> está marcado no informa nada: la utilidad está en los **huecos**. Si dudás, usá `i` en vez de `X`.

---

## Matriz 2 — Drivers RF vs. Drivers RF

Esta es la menos obvia de las tres y la que más se hace mal.

**Qué pregunta responde:** *¿cómo se relacionan los requisitos entre sí?* Es una matriz
**cuadrada**: los mismos drivers en filas y en columnas.

> [!warning] Antes de armarla, definí QUÉ relación cruzás
> "Drivers RF vs. Drivers RF" no dice qué relación se marca, y hay al menos tres posibles:
>
> | Relación | Significa | Se lee |
> |---|---|---|
> | **Dependencia** | RF-A necesita que RF-B exista o esté hecho antes | "A depende de B" |
> | **Conflicto** | RF-A y RF-B no se pueden satisfacer plenamente a la vez | "A choca con B" |
> | **Precedencia** | RF-A se implementa antes que RF-B | "A va antes que B" |
>
> **La plantilla oficial dice "Matriz de dependencias"**, así que la relación es **dependencia**.
> Declarala igual en el documento: una matriz con la relación declarada vale más que una matriz
> "correcta" sin explicar qué marca.

### Cómo se arma (con dependencia)

La matriz es cuadrada y **no simétrica**: que A dependa de B no implica que B dependa de A. Por eso
importa el sentido de lectura: **fila depende de columna**.

Con la notación de la plantilla (marca `X`, diagonal vacía, `Rn` al final):

| DRIVERS RF (Y) ↓ depende de → | RF-01 | RF-02 | RF-03 | RF-04 | RFn |
|---|---|---|---|---|---|
| **RF-01** Registrar préstamo | | | **X** | | |
| **RF-02** Registrar devolución | **X** | | **X** | | |
| **RF-03** Verificar credencial | | | | | |
| **RF-04** Reservar ejemplar | **X** | | **X** | | |
| **RFn** | | | | | |

Se lee: *RF-02 (devolución) depende de RF-01 (préstamo)* — no se puede devolver lo que no se prestó
— *y de RF-03 (verificar credencial)*.

### Cómo se lee

| Lectura | Qué detecta |
|---|---|
| Una **columna muy poblada** | Un requisito **crítico**: muchos dependen de él. Se implementa primero y se prueba más |
| Una **fila muy poblada** | Un requisito **frágil**: depende de muchos, es el último que va a funcionar |
| Una fila y columna **vacías** | Un requisito **aislado**: candidato a entregarse en la primera iteración, o a revisar si de verdad pertenece al sistema |
| Un **ciclo** (A depende de B y B de A) | **Problema de diseño.** Hay que romperlo separando el requisito o revisando la dependencia |

En el ejemplo, **RF-03 no depende de nada y tres requisitos dependen de él**: es el cimiento. Se
implementa y se prueba primero.

> [!tip] Tu turno
> Marcá la diagonal con "—" (nada depende de sí mismo) y buscá ciclos. Si encontrás uno, no lo
> tapes: es un hallazgo, y decirlo en el documento suma.

---

## Matriz 3 — CDU vs. Drivers RF

**Qué pregunta responde:** *¿qué caso de uso realiza cada requisito funcional, y hay requisitos
huérfanos?*

Es trazabilidad **post-RS**: conecta el requisito con lo que lo realiza.

### Cómo se arma

CDU en las filas, drivers RF en las columnas (o al revés, da igual mientras esté rotulado).

| | RF-01<br/>Registrar préstamo | RF-02<br/>Registrar devolución | RF-03<br/>Verificar credencial | RF-04<br/>Reservar ejemplar | RF-05<br/>Notificar vencimiento |
|---|---|---|---|---|---|
| **CDU-01** Prestar libro | **X** | | **X** | **X** | |
| **CDU-02** Devolver libro | | **X** | **X** | | |
| **CDU-03** Adquirir material | | | | | |
| **CDU-04** Difundir actividades | | | | | |

### Cómo se lee

| Lectura | Qué detecta | Qué significa |
|---|---|---|
| **Fila vacía** | Un CDU sin ningún RF | El caso de uso no está especificado: falta expandirlo |
| **Columna vacía** | Un RF que ningún CDU realiza | **Requisito huérfano**: se pidió y no está en ningún caso de uso |
| RF en **varias filas** | Comportamiento compartido | Es candidato a `«include»` — ver [[Relación de inclusión include]] |

Dos hallazgos en el ejemplo, y los dos son valiosos:

**RF-03 aparece en CDU-01 y CDU-02.** Comportamiento que ocurre en los dos y siempre → es
exactamente el criterio de `«include»`. La matriz **descubrió** una relación que el diagrama debería
tener.

**RF-05 (notificar vencimiento) tiene la columna vacía.** Es un requisito huérfano: se pidió y ningún
CDU lo realiza. Hay que agregarlo a un CDU existente o crear uno nuevo. Sin la matriz, ese requisito
se entrega sin cubrir y nadie lo nota.

**CDU-03 y CDU-04 tienen fila vacía**: no están expandidos todavía. Es trabajo pendiente, y la matriz
lo hace visible.

> [!important] Esto es lo que la rúbrica premia
> Una matriz que solo muestra marcas prolijas está "bueno". Una matriz **donde señalás los huecos que
> encontraste y qué hiciste con ellos** demuestra que entendiste para qué sirve. Escribí abajo de cada
> matriz un párrafo de **hallazgos**: filas vacías, columnas vacías, ciclos, y la decisión que tomaste.

---

## Las tres juntas: la cadena completa

```mermaid
flowchart LR
    STK(["Stakeholder<br/>STK-nn"]) -->|"Matriz 1"| CDU(("CDU-nn"))
    CDU -->|"Matriz 3"| RF["Driver RF<br/>RF-nn"]
    RF -->|"Matriz 2"| RF2["otros RF<br/>dependencias"]
```

Las tres cubren tramos distintos, y por eso son tres:

| Matriz | Tramo | Pregunta |
|---|---|---|
| Stakeholders vs. CDU | **pre-RS** | ¿de dónde salió? |
| CDU vs. Drivers RF | **post-RS** | ¿en qué se realizó? |
| Drivers RF vs. Drivers RF | **horizontal** | ¿cómo se relacionan entre sí? |

Y el recorrido completo se puede hacer en los dos sentidos, que es la **trazabilidad bidireccional**
que piden los estándares:

- **Hacia adelante**: un stakeholder → sus CDU → sus RF → los RF que dependen de esos.
- **Hacia atrás**: un RF → qué CDU lo realiza → qué stakeholder lo pidió. Si en algún salto la celda
  está vacía, encontraste un hueco.

---

## Checklist de rigor

**Identificadores**
- [ ] Todos los stakeholders, CDU y drivers tienen **ID único**
- [ ] Ningún ID se reutilizó ni se renumeró
- [ ] Los IDs de las tres matrices son **los mismos** (no "RF-1" en una y "RF-01" en otra)

**Matriz 1 — Stakeholders vs. CDU**
- [ ] Están **todos** los stakeholders del enunciado como filas
- [ ] Están **todos** los CDU como columnas
- [ ] La leyenda distingue **actor** de **interesado**
- [ ] Revisadas las filas vacías (stakeholder sin nada) y las columnas vacías (CDU que nadie pidió)
- [ ] No está todo marcado "por si acaso"

**Matriz 2 — Drivers RF vs. Drivers RF**
- [ ] **Declarada** qué relación se cruza (dependencia, conflicto o precedencia)
- [ ] Declarado el **sentido de lectura** (fila → columna)
- [ ] La diagonal está marcada como no aplicable
- [ ] Buscados los **ciclos**, y si hay, están reportados
- [ ] Identificados los requisitos **crítico** (columna poblada) y **frágil** (fila poblada)

**Matriz 3 — CDU vs. Drivers RF**
- [ ] Están todos los CDU y todos los drivers RF
- [ ] Revisadas las columnas vacías → **requisitos huérfanos**
- [ ] Revisadas las filas vacías → **CDU sin expandir**
- [ ] Los RF que aparecen en varias filas están evaluados como candidatos a `«include»`

**Presentación**
- [ ] Cada matriz tiene **título, leyenda** y qué significa cada símbolo
- [ ] Cada matriz tiene abajo un párrafo de **hallazgos** y las decisiones tomadas
- [ ] Las matrices son legibles al tamaño de entrega (si son grandes, partirlas por subsistema)
- [ ] La numeración coincide con los otros entregables

---

## Cómo se ve mal

```
        CDU-01  CDU-02  CDU-03
STK-01    X       X       X
STK-02    X       X       X
STK-03    X       X       X
```

Tres errores en nueve celdas:

1. **Todo marcado.** No informa nada: la utilidad de una matriz está en los huecos.
2. **Sin leyenda.** ¿La X significa que es actor, que le interesa, que lo aprueba?
3. **Sin hallazgos.** No hay nada escrito sobre qué se descubrió al armarla, así que parece
   trámite y no análisis.

---

## Notas relacionadas

- [[Matriz de trazabilidad de requisitos]] — la teoría: pre-RS, post-RS, direcciones, qué detecta
- [[Plan - Caso 1 FarmaHosp]] — la rúbrica y las ambigüedades a preguntar
- [[Guía - Diagrama de casos de uso del negocio]] — de donde salen los CDU
- [[_Método para resolver una tarea]] — el método general
- [[Relación de inclusión include]] — lo que la matriz 3 puede descubrir

## Preguntas de repaso

1. ¿Por qué el punto de inicio de una matriz son los identificadores y no la tabla?
2. ¿Qué detecta una **fila vacía** en Stakeholders vs. CDU? ¿Y una **columna vacía**?
3. ¿Por qué la matriz RF vs. RF **no es simétrica** y qué hay que declarar antes de armarla?
4. ¿Qué significa una columna muy poblada en la matriz RF vs. RF?
5. ¿Qué es un requisito huérfano y en cuál de las tres matrices aparece?
6. ¿Cómo puede una matriz **descubrir** un `«include»` que falta en el diagrama?
7. ¿Qué diferencia una matriz "bueno" de una "excelente" según la rúbrica?
