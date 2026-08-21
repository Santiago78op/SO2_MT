---
tema: Trazabilidad de requerimientos
fuente: "NT1. Trazabilidad de Requerimientos.pdf (cátedra) + ADD 3.0 (Cervantes & Kazman)"
fecha: 2026-08-21
alias: "trazabilidad, matrices, matriz de trazabilidad, stakeholders vs cdu, rf vs rf, cdu vs rf"
---

# Trazabilidad de requerimientos — las tres matrices

Plantillas listas para llenar, con la regla de lectura de cada una. **No son diagramas UML: son
tablas**, y viven acá porque StarUML no las produce de forma legible ni exportable.

Las reglas notacionales y de contenido están en [[estilo-diagramas]] §8, BLOQUE 3.

---

## La regla común a las tres

> **Una matriz solo sirve si se lee en los dos sentidos: por fila y por columna.**

Las celdas marcadas son el inventario. **El hallazgo son los huecos**: una fila vacía o una columna
vacía es una pregunta que hay que contestar por escrito. Un hueco puede ser un error o puede estar
justificado — lo que no puede es quedar sin comentar.

**Los ids no se renumeran nunca.** `STK-03` es `STK-03` en la tabla de stakeholders, en los
diagramas y en las tres matrices. Renumerar rompe la trazabilidad y es la causa más común de que las
matrices no cierren.

| Prefijo | Qué identifica | Dónde nace |
|---|---|---|
| `STK-nn` | Stakeholder | tabla de stakeholders |
| `CDU-nn` | Caso de uso | diagramas de casos de uso |
| `RF-nn` | Driver de requisito funcional | CDU expandidos |
| `AC-nn` | Escenario de atributo de calidad | drivers de calidad |
| `RE-nn` | Restricción | drivers de restricción |

---

## Matriz 1 — Stakeholders vs. CDU

**Qué cruza.** Qué stakeholder **participa en** o **tiene interés en** cada caso de uso.

| Elemento | Definición |
|---|---|
| **Filas** | Los stakeholders, `STK-01` … `STK-nn` |
| **Columnas** | Los casos de uso, `CDU-01` … `CDU-nn` |
| **Celda marcada** | Ese stakeholder participa en ese caso de uso, o el resultado del caso le importa directamente |
| **Marca** | `X` para participación directa; `i` si solo tiene interés en el resultado, sin participar |

### Plantilla

| | `CDU-01` | `CDU-02` | `CDU-03` | `CDU-04` |
|---|---|---|---|---|
| `STK-01` | | | | |
| `STK-02` | | | | |
| `STK-03` | | | | |
| `STK-04` | | | | |

### Cómo se lee

**Por fila** — *«¿en qué casos de uso aparece este stakeholder?»*

- **Fila vacía**: el stakeholder no participa en nada. Dos explicaciones posibles, y hay que elegir
  una y escribirla: (a) lo identifiqué de más, o (b) **me falta un caso de uso** que lo atienda. La
  segunda es la interesante: es así como se descubre funcionalidad olvidada.
- **Fila muy poblada**: probablemente son **dos roles distintos** metidos en un stakeholder. Vale
  revisar si conviene separarlo.

**Por columna** — *«¿para quién es este caso de uso?»*

- **Columna vacía**: caso de uso **sin ningún stakeholder**. Es el hallazgo más grave de esta
  matriz: un caso de uso que no le sirve a nadie **no debería existir**. Si igual tiene que quedar
  —porque es un caso incluido por otro— hay que decirlo explícitamente.

---

## Matriz 2 — Drivers RF vs. Drivers RF

**Qué cruza.** Las **dependencias** entre requisitos funcionales. Es una matriz **cuadrada**: los
mismos ids en filas y en columnas.

> [!important] Se lee «la fila depende de la columna», y NO es simétrica
> Que `RF-03` dependa de `RF-01` **no implica** que `RF-01` dependa de `RF-03`. Esa asimetría es
> justamente lo que la hace útil: sirve para **analizar el impacto de un cambio**.
>
> **La diagonal queda excluida** —se sombrea o se marca `—`—: un requisito no depende de sí mismo.
>
> Si en vez de dependencias se decide modelar **conflictos**, esa variante **sí es simétrica**
> (un conflicto es mutuo) y también excluye la diagonal. Son dos matrices distintas: hay que
> declarar cuál se está usando y no mezclarlas.

| Elemento | Definición |
|---|---|
| **Filas (Y)** | El requisito que **depende** |
| **Columnas (X)** | El requisito **del que se depende** — el que origina la dependencia |
| **Celda marcada** | La fila **no puede realizarse sin** la columna |
| **Diagonal** | Excluida, siempre |

### Plantilla

| depende ↓ / de → | `RF-01` | `RF-02` | `RF-03` | `RF-04` |
|---|---|---|---|---|
| `RF-01` | — | | | |
| `RF-02` | | — | | |
| `RF-03` | | | — | |
| `RF-04` | | | | — |

### Cómo se lee

**Por columna** — *«si cambio esto, ¿qué se rompe?»* Es la lectura que justifica la matriz. Se toma
la columna de `RF-01` y todas las celdas marcadas son los requisitos que hay que **revisar** si
`RF-01` cambia. Eso es análisis de impacto.

**Por fila** — *«¿qué necesito tener listo antes de poder construir esto?»* La fila da el **orden de
construcción**.

Los dos casos límite, y qué significan:

| Situación | Qué indica |
|---|---|
| **Fila vacía** | RF autónomo: no necesita nada previo. **Candidato a construir primero** |
| **Columna vacía** | Nadie depende de él: es una hoja. **Candidato a diferir** sin bloquear a nadie |
| **Columna muy poblada** | Requisito **crítico**: mucho cuelga de él. Es un driver arquitectónico por derecho propio, aunque no lo pareciera |
| **Ciclo** (A depende de B y B de A) | **Hallazgo**: los requisitos están mal separados. No es un problema de la tabla |

---

## Matriz 3 — CDU vs. Drivers RF

**Qué cruza.** Qué requisitos funcionales **cubre** cada caso de uso. Es la matriz de **cobertura**.

| Elemento | Definición |
|---|---|
| **Filas** | Los casos de uso, `CDU-01` … `CDU-nn` |
| **Columnas** | Los drivers RF, `RF-01` … `RF-nn` |
| **Celda marcada** | Ese caso de uso **realiza o satisface** ese requisito |

### Plantilla

| | `RF-01` | `RF-02` | `RF-03` | `RF-04` | `RF-05` |
|---|---|---|---|---|---|
| `CDU-01` | | | | | |
| `CDU-02` | | | | | |
| `CDU-03` | | | | | |

### Cómo se lee

**Por columna** — *«¿quién cumple este requisito?»*

- **Columna vacía**: el requisito **no está cubierto por ningún caso de uso**. Es **falta de
  funcionalidad**, y es el hallazgo por el que existe esta matriz: es la prueba de **completitud**
  que pide el criterio de los drivers RF.

**Por fila** — *«¿qué requisito justifica este caso de uso?»*

- **Fila vacía**: el caso de uso **no mapea a ningún requisito**. O **sobra**, o hay un requisito que
  no se documentó. Las dos son hallazgos.
- **Fila muy poblada**: el caso de uso está haciendo demasiado. Candidato a **partirse** con
  `include`.

---

## Las tres juntas: la cadena completa

La utilidad real aparece al encadenarlas: se puede recorrer el camino desde una persona hasta un
requisito, y de vuelta.

```mermaid
flowchart LR
    STK["STAKEHOLDER<br/><i>STK-nn</i>"] -->|"matriz 1"| CDU["CASO DE USO<br/><i>CDU-nn</i>"]
    CDU -->|"matriz 3"| RF["DRIVER RF<br/><i>RF-nn</i>"]
    RF -->|"matriz 2"| RF2["OTRO DRIVER RF<br/><i>del que depende</i>"]
```

**Las dos preguntas que solo se contestan con las tres:**

1. *«Si este stakeholder se va del proyecto, ¿qué requisitos quedan sin dueño?»* → matriz 1, después
   matriz 3.
2. *«Si cambio este requisito, ¿a qué stakeholders les afecta?»* → matriz 2 hacia atrás, después
   matriz 3 y matriz 1 en reversa.

Si alguna de las dos no se puede contestar, alguna matriz está incompleta.

---

## Checklist de las tres matrices

- [ ] Los ids son los **mismos** que en los entregables anteriores, sin renumerar
- [ ] Cada matriz declara **qué significa una celda marcada**
- [ ] Cada matriz fue leída **por fila y por columna**
- [ ] Todos los **huecos** están comentados: error o justificación explícita
- [ ] La matriz 2 declara si modela **dependencia o conflicto**, y tiene la **diagonal excluida**
- [ ] Ningún caso de uso quedó **sin stakeholder** (columna vacía en la matriz 1)
- [ ] Ningún RF quedó **sin caso de uso** que lo cubra (columna vacía en la matriz 3)
- [ ] Se puede recorrer la cadena `STK → CDU → RF` completa para al menos un ejemplo

---

## Notas relacionadas

- [[estilo-diagramas]] §8 — las reglas de contenido y notación de todos los artefactos
- [[Matriz de trazabilidad de requisitos]] — la teoría
- [[Guía - Matrices de trazabilidad]] — el entregable del criterio 4
- [[Stakeholders]] · [[Caso de uso]] · [[Drivers arquitectónicos]]

## Preguntas de repaso

1. ¿Por qué una matriz de trazabilidad se lee en los dos sentidos?
2. ¿Qué significa una **columna vacía** en cada una de las tres matrices?
3. ¿Por qué la matriz de RF vs. RF no es simétrica, y por qué se excluye su diagonal?
4. ¿Cómo se usa la matriz 2 para analizar el impacto de un cambio?
5. ¿Qué indica una columna muy poblada en la matriz 2?
6. ¿Cuál de las tres matrices demuestra **completitud** de los requisitos funcionales?
