---
tema: Guía de entregable
fuente: "Rúbrica del Caso 1 (núcleo) + ISO 42010, PALM y SAIP (complemento)"
fecha: 2026-08-19
entregable: Identificación de Stakeholders
alias: "stakeholders, identificacion de stakeholders, criterio 2, interesados, necesidad oculta"
---

# Guía — Identificación de stakeholders

Cómo se identifican, se completan y se documentan. Es el **criterio 2** de la rúbrica.

> [!important] Vale 25 puntos y la rúbrica no dice más que el título
> El criterio dice, textual, solo *"Identificación de Stakeholders"* — sin sub-entregables. Eso es una
> trampa: **un criterio vago no significa un criterio fácil**, significa que el evaluador espera lo
> que la teoría manda. Esta guía es el "qué se espera".

La teoría de fondo está en [[Stakeholders]]. Acá va el cómo.

---

## Paso 0 — El punto de inicio

**No se empieza listando personas.** Se empieza definiendo la **frontera**, porque quién es
stakeholder depende de dónde la pongas.

Dos preguntas, con el enunciado en la mano:

1. ¿Cuál es la **entidad de interés**? (el hospital, el sistema FarmaHosp, la gestión de MAC)
2. ¿Cuál es su **razón de ser**? La meta de negocio, con las palabras del enunciado.

Es la misma frontera que fija el diagrama de contexto del criterio 1 — y por eso **los dos criterios
tienen que ser consistentes**: todo actor del contexto es stakeholder, aunque no todo stakeholder
aparezca en el contexto.

> [!tip] Tu turno
> Escribí en una línea la entidad de interés y en otra su razón de ser. Si el enunciado no lo dice,
> anotá la pregunta en vez de asumir.

---

## Paso 1 — Barrer, con checklists en vez de memoria

El error típico es listar los obvios (usuario, cliente) y entregar cinco. Se barre con **tres
checklists distintas**, porque cada una encuentra stakeholders que las otras no ven.

### Checklist A — Los cinco de la clase

Los de la diapositiva de [[Stakeholders]]. Son roles genéricos y sirven para cualquier sistema:

- Director de la organización de desarrollo
- Mercadeo
- Usuario final
- Organización del mantenimiento
- Cliente

### Checklist B — Las categorías de metas de PALM

Esta es la más productiva porque busca **por interés**, no por persona. Si un casillero queda vacío,
probablemente falte alguien:

| Categoría de meta | Quién la encarna |
|---|---|
| Crecimiento y continuidad | dueños, dirección |
| Objetivos financieros | administración, quien paga |
| Objetivos personales | los individuos con carrera en juego |
| Responsabilidad hacia **empleados** | RRHH, sindicatos, los propios trabajadores |
| Responsabilidad hacia la **sociedad** | comunidad, pacientes, ciudadanos |
| Responsabilidad hacia el **estado** | **reguladores, auditores** |
| Responsabilidad hacia **accionistas** | inversores, junta directiva |
| Posición de mercado | competencia, marketing |
| Mejora de procesos | dueños de proceso |
| Calidad y reputación del producto | soporte, calidad |
| Gestión del cambio del entorno | quien absorbe los cambios externos |

### Checklist C — Los internos que no son usuarios

De Garland & Anthony, y son los que más se olvidan porque no aparecen en ningún caso de uso
funcional:

- gestión de proyecto
- gerentes de los equipos de desarrollo
- arquitecto de sistema / ingeniero jefe
- arquitecto de hardware
- **testers e integradores**
- **personal de operaciones de red y gestión del sistema** — el libro lo marca explícitamente como
  *"a menudo olvidado cuando se escriben los requerimientos"*
- **sistemas externos** con los que hay que integrarse

> [!warning] Un sistema externo es un stakeholder
> No tiene opiniones, pero **tiene requisitos**: un formato, un horario de disponibilidad, un
> protocolo. En FarmaHosp, el sistema legacy de admisiones (COBOL/SOAP, solo de 7 a 17 h) y el
> sistema nacional de farmacovigilancia (XML con DTD, recibe solo de 8 a 16 h) imponen restricciones
> tan duras como cualquier persona.

---

## Paso 2 — Clasificar

Con la lista cruda, se ordena. Dos ejes útiles:

**Por posición respecto a la frontera** — determina si además es actor:

| Posición | ¿Es actor del negocio? |
|---|---|
| Fuera, e interactúa | **sí** |
| Fuera, no interactúa (solo tiene interés) | no |
| Dentro del negocio | no — es **trabajador** |

**Por tipo de interés**, que anticipa qué requisitos va a traer:

| Tipo | Interés dominante | Requisitos que suele traer |
|---|---|---|
| Quien **usa** | que funcione y sea usable | funcionalidad, usabilidad, eficiencia |
| Quien **paga** | costo y plazo | restricciones de presupuesto |
| Quien **mantiene** | poder cambiarlo | mantenibilidad, modificabilidad |
| Quien **opera** | poder monitorearlo | disponibilidad, observabilidad |
| Quien **regula** | cumplimiento | restricciones normativas, trazabilidad |
| Quien **construye** | poder construirlo | restricciones de stack y de equipo |

> [!tip] Para qué sirve esta segunda tabla
> Es un **generador de drivers**. Si identificaste a alguien que mantiene y no tenés ningún driver de
> mantenibilidad, te falta un requisito — no te falta un stakeholder.

---

## Paso 3 — La necesidad oculta

Esto es lo que separa un "bueno" de un "excelente", y el enunciado del Caso 1 lo pide de forma
explícita con su columna *"lo que realmente necesitan (necesidad oculta)"*.

El SAIP lo fundamenta: *los stakeholders **a menudo no saben** cuáles son sus requerimientos de
calidad*. Lo que dicen suele ser **un medio**, no el fin.

**Ejemplo trabajado** (biblioteca municipal, otro dominio a propósito):

| Stakeholder | Lo que dice que quiere | Lo que realmente necesita |
|---|---|---|
| Bibliotecario | *"que el sistema no se trabe cuando hay cola"* | que registrar un préstamo tome < 5 s incluso con 200 devoluciones simultáneas, y que si se cae la red pueda seguir prestando y sincronizar después |
| Vecino lector | *"que me avisen antes de la multa"* | notificación 48 h antes del vencimiento por el canal que él usa, y poder renovar sin ir a la biblioteca |
| Municipalidad | *"quiero saber si la biblioteca sirve"* | un tablero con préstamos por barrio y por rango de edad, exportable para el informe anual |

Fijate el patrón: **lo que dicen no tiene medida; lo que necesitan sí.** Convertir la columna derecha
en escenarios de seis partes es el criterio 3 (→ [[Guía - Drivers de calidad y restricción]]).

Cómo se deduce la necesidad oculta:

1. **Preguntá "¿para qué?"** hasta llegar a un objetivo, no a un mecanismo. *"Que no se trabe"* →
   ¿para qué? → *"para no hacer esperar a la gente"* → ahí está el requisito: tiempo de respuesta con
   una cola de N personas.
2. **Buscá el escenario de peor caso** que ese stakeholder teme. Casi siempre es el requisito real.
3. **Leé lo que el enunciado cuenta de él**, no solo lo que le hace decir. En FarmaHosp, el dato de
   que *"la farmacia está en el sótano y la conexión es inestable"* es un requisito del farmacéutico,
   aunque él no lo mencione.

> [!tip] Tu turno
> Tomá **un** stakeholder de tu caso y completá las dos columnas. Después preguntate: ¿de la columna
> derecha sale al menos un driver de calidad? Si no sale ninguno, la columna derecha todavía es un
> deseo, no una necesidad.

---

## Paso 4 — Los conflictos

La diapositiva de clase existe para mostrar esto: **los stakeholders piden cosas incompatibles.**
Documentar los conflictos es análisis; ignorarlos es hacer una lista.

Formato: una tabla de tensiones.

| Stakeholder A | pide | Stakeholder B | pide | Tensión |
|---|---|---|---|---|
| Cliente | bajos costos, pocos cambios | Mercadeo | muchas características, rápido | alcance vs. costo y plazo |
| Usuario final | rendimiento y seguridad | Cliente | bajos costos | calidad vs. costo |
| Organización del mantenimiento | modificabilidad | Mercadeo | corto tiempo al mercado | diseño cuidado vs. velocidad |

En FarmaHosp los conflictos están puestos a propósito por el enunciado. Dos que salen sin esfuerzo:

- El **equipo interno** necesita Java/Oracle para poder mantenerlo; la **consultora** prefiere
  Python/PostgreSQL. Y el hospital exige que el interno lo mantenga solo, después.
- El **paciente** necesita confidencialidad máxima de su diagnóstico; el **director administrativo**
  necesita auditar todo. El enunciado hasta resuelve la tensión: *ni el director puede ver esos
  diagnósticos sin orden judicial.*

> [!important] Un conflicto documentado no es un problema, es un hallazgo
> Cada tensión que señalás es un **tradeoff** que la arquitectura va a tener que resolver, y su
> resolución es una decisión de diseño con rationale. Ver
> [[Equilibrio de restricciones del proyecto]].

---

## Paso 5 — El formato de entrega

Una tabla, una fila por stakeholder:

| ID | Stakeholder | Tipo | Posición | Lo que dice que quiere | Necesidad oculta | Concern dominante |
|---|---|---|---|---|---|---|
| `STK-01` | … | usa / paga / mantiene / opera / regula / construye | fuera-actor · fuera · dentro | … | … | el atributo de calidad que le importa |

Los **IDs con prefijo** (`STK-nn`) porque van a la matriz *Stakeholders vs. CDU* del criterio 4, y
ahí un ID **no se renumera nunca** (→ [[Guía - Matrices de trazabilidad]]).

Y debajo de la tabla, dos cosas que la rúbrica premia:

1. La **tabla de conflictos** del paso 4.
2. Un párrafo declarando **la frontera** que usaste y por qué, porque de eso depende quién quedó
   dentro y quién fuera.

---

## Checklist de rigor

**Completitud**
- [ ] Están **todos** los stakeholders que el enunciado nombra, ninguno de menos
- [ ] Se barrió con las **tres checklists** (los cinco de clase, las categorías de PALM, los internos)
- [ ] Hay al menos un **regulador** si el dominio está regulado
- [ ] Están los **sistemas externos** como stakeholders
- [ ] Está quien **opera** el sistema, no solo quien lo usa
- [ ] Está el **equipo de desarrollo** — trae restricciones de stack y de mantenimiento

**Calidad de cada fila**
- [ ] Cada stakeholder es un **rol**, no una persona con nombre
- [ ] Cada uno tiene su **necesidad oculta**, distinta de lo que dice querer
- [ ] Cada necesidad oculta es **medible** o al menos apunta a algo medible
- [ ] Cada uno tiene un **concern dominante** identificado

**Análisis**
- [ ] Está la tabla de **conflictos** entre stakeholders
- [ ] Está declarada la **frontera** de la entidad de interés
- [ ] Está clasificado quién es además **actor del negocio** y quién es **trabajador**

**Consistencia**
- [ ] Los IDs son los que se usan en la matriz *Stakeholders vs. CDU*
- [ ] Todo actor del diagrama de contexto aparece en esta tabla
- [ ] Todo stakeholder que pide algo genera al menos **un driver** (calidad o restricción)

---

## Cómo se ve mal

| Error | Por qué |
|---|---|
| Una lista de 5 nombres sin más | La rúbrica vale 25 puntos: espera análisis, no un listado |
| Personas con nombre propio en vez de roles | Un stakeholder es un **rol** — la persona cambia, el interés queda |
| Copiar la columna "lo que dicen" como si fuera el requisito | Es justo lo que el enunciado marca como insuficiente |
| No incluir reguladores ni sistemas externos | Traen las restricciones más duras y no aparecen si los buscás entre "usuarios" |
| Sin conflictos | Si nadie choca con nadie, no analizaste: la diapositiva de clase existe para mostrar el choque |
| Stakeholders que no generan ningún driver | O sobra el stakeholder, o falta el requisito |
| Confundir stakeholder con actor | Todo actor es stakeholder; **no** todo stakeholder es actor |

---

## Notas relacionadas

- [[Stakeholders]] — la teoría: ISO 42010, concerns, PALM, y la diferencia con actor y trabajador
- [[Plan - Caso 1 FarmaHosp]] — los 8 stakeholders del caso y su materia prima
- [[Guía - Caso de negocio]] — el diagrama de contexto, que comparte la frontera
- [[Guía - Drivers de calidad y restricción]] — las necesidades ocultas convertidas en drivers
- [[Guía - Matrices de trazabilidad]] — la matriz *Stakeholders vs. CDU*
- [[Beneficios de la arquitectura de software]] — el conflicto entre stakeholders, en la clase
- [[Equilibrio de restricciones del proyecto]] — por qué no se puede satisfacer a todos

## Preguntas de repaso

1. ¿Cuál es el punto de inicio de este entregable y por qué no es listar personas?
2. Nombrá las tres checklists de barrido y qué encuentra cada una que las otras no.
3. ¿Por qué un **sistema externo** es un stakeholder?
4. ¿Qué stakeholder marca Garland como "a menudo olvidado" y qué requisitos trae?
5. ¿Cómo se deduce una necesidad oculta a partir de lo que el stakeholder dice?
6. ¿Por qué documentar los **conflictos** es análisis y no relleno?
7. ¿Qué relación hay entre esta tabla y la matriz del criterio 4?
8. Si un stakeholder no genera ningún driver, ¿qué dos cosas pueden estar pasando?
