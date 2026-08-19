---
tema: Índice
fuente: —
fecha: 2026-08-19
---

# Índice — Análisis y Diseño de Sistemas

Nota de entrada de la bóveda. Desde acá navego todo.

> [!important] Antes que nada
> [[Programa oficial del curso]] — el contenido temático oficial de la sección A, el cronograma
> con las fechas de los parciales, y qué puntos del programa **todavía no tienen nota**.

## Mapa de carpetas

| Carpeta | Qué guarda |
|---|---|
| `00-Fuentes/presentaciones/` | Las presentaciones originales. **No se modifican nunca.** |
| `adjuntos/` | Imágenes extraídas de cada presentación (una subcarpeta por presentación). |
| `01-Notas/` | Notas atómicas: una por concepto. |
| `02-Diagramas/` | Diagramas exportados (`.excalidraw`, `.svg`, imágenes). |
| [[03-Glosario]] | Glosario global de términos. |
| `04-Flashcards/` | Tarjetas de repaso por tema (`pregunta::respuesta`). |
| `00-Fuentes/lecturas/` | Lecturas complementarias en PDF (Reynoso). |
| `05-Quizzes/` | Quizzes generados y mis resultados, con fecha. |
| `06-Proyecto-MCP/` | El proyecto práctico: diseño del servidor MCP `tutor-ayds`. |
| `08-Tareas/` | Método de trabajo, guías paso a paso por entregable, planes de tarea y enunciados. |
| `07-Referencias/` | Manual de las herramientas de dibujo (StarUML, Excalidraw) y el puente de la teoría al diagrama. No es materia de examen. |

## Notas por tema

### Arquitectura de software

- [[Arquitectura de software]] — definiciones (IEEE 1471, Kazman, Arlow & Neustadt, Booch), terminología y atributos
- [[Arquitecto de software]] — el rol según RUP y según SUN SL-425
- [[Beneficios de la arquitectura de software]] — los tres beneficios y qué permite la arquitectura
- [[Ciclo de influencias en la arquitectura]] — las cuatro influencias y la retroalimentación del sistema
- [[Estructuras y vistas arquitectónicas]] — estructura ≠ vista
- [[Modelo 4+1 vistas]] — las cinco vistas y sus diagramas UML
- [[Proceso de diseño arquitectónico]] — los cuatro pasos, el producto final y las comprobaciones
- [[Equilibrio de restricciones del proyecto]] — triángulo, diagrama de Kiviat y cubo de dimensiones
- [[Arquitectura en el ciclo de vida del software]] — por qué es iterativa y no una fase
- [[Diagrama de despliegue]] — punto 1.7: la vista física, la estructura de despliegue y la notación UML
- [[Estilos arquitectónicos]] — punto 1.9: el catálogo de estilos, sus canjes de atributos y las trampas típicas
- [[Relaciones y dependencias en UML]] — qué significa cada flecha, hacia dónde apunta, y el puente con la matriz de dependencias

### Calidad del software

- [[Atributos de calidad]] — unidad 2: definición, los seis del programa, escenarios de 6 partes, tradeoffs e ISO

### Requisitos

- [[Matriz de trazabilidad de requisitos]] — trazabilidad pre-RS y post-RS, la RTM y la cadena de arquitectura (**tema externo**, no está en las presentaciones)

### Casos de uso

- [[Caso de uso]] — definición de Jacobson, para qué sirven y en qué momento se usan
- [[Casos de uso vs DFD]] — la comparación, en dos diferencias
- [[Modelo de casos de uso del negocio]] — el modelo, sus estereotipos y cómo se construye
- [[Actor del negocio]] — rol, candidatos, consideraciones y generalización entre actores
- [[Caso de uso del negocio]] — definición de CUN y sus consideraciones
- [[Proceso de negocio]] — la definición desarmada, y por qué no es una función
- [[Identificación de procesos del negocio]] — clasificación, agrupamiento y objetivos
- [[Relación de inclusión include]] — `<include>`
- [[Relación de extensión extend]] — `<extend>`
- [[Generalización y especialización en casos de uso]] — padre e hijos, y las tres relaciones comparadas
- [[Realizaciones de casos de uso del negocio]] — el adentro del negocio
- [[Descripción textual de casos de uso]] — la plantilla y el ejemplo *Atender pedido*

## Flashcards

- [[Flashcards - Arquitectura de software]] (20 tarjetas)
- [[Flashcards - Casos de uso del negocio]] (27 tarjetas)
- [[Flashcards - Trazabilidad de requisitos]] (25 tarjetas)
- [[Flashcards - Diagrama de despliegue]] (23 tarjetas)
- [[Flashcards - Estilos arquitectónicos]] (24 tarjetas)
- [[Flashcards - Relaciones y dependencias en UML]] (22 tarjetas)
- [[Flashcards - Atributos de calidad]] (23 tarjetas)

## Tareas

- [[_Método para resolver una tarea]] — el método general: punto de inicio y 6 pasos
- [[Plan - Caso 1 FarmaHosp]] — la rúbrica desarmada: 4 criterios, 100 puntos, y las ambigüedades a preguntar
- [[Guía - Caso de negocio]] — la secuencia canónica: contexto → core → primera descomposición → CDU expandidos → matriz
- [[Guía - Diagrama de casos de uso del negocio]] — paso a paso con ejemplo visual incremental
- [[Guía - Drivers de calidad y restricción]] — criterio 3 (30 pts): escenarios, restricciones y la priorización de los 5
- [[Guía - Matrices de trazabilidad]] — las tres matrices que pide la rúbrica (20 pts)

## Referencias de herramientas

No es materia de examen: es el manual de las herramientas del ecosistema.

- [[StarUML]] — los 7 tipos de Mermaid importables y qué se pierde en el camino
- [[Excalidraw]] — los 5 tipos nativos y el fallback a imagen SVG
- [[De la teoría al diagrama]] — el puente: qué sintaxis usar para cada diagrama de la materia

## Contenido del curso — estado real

Alineado con el **programa oficial** de la sección A (4 unidades), no con una lista genérica.
El detalle punto por punto está en [[Programa oficial del curso]].

### Unidad 1 — Principios de Diseño de Arquitectura de Software

- [x] 1.1 Concepto — [[Arquitectura de software]]
- [x] 1.2 ¿Por qué es importante? — [[Arquitectura de software]]
- [x] 1.3 Beneficios — [[Beneficios de la arquitectura de software]]
- [x] 1.4 Pasos para la definición — [[Proceso de diseño arquitectónico]]
- [ ] 1.5 ¿Qué se tiene en cuenta para el diseño? — parcial: [[Ciclo de influencias en la arquitectura]], [[Equilibrio de restricciones del proyecto]]
- [x] 1.6 Arquitectura y Requerimientos (CDU de negocio) — bloque de casos de uso + [[Matriz de trazabilidad de requisitos]]
- [x] **1.7 Diagramas de Despliegue** — [[Diagrama de despliegue]] (núcleo de la presentación + complemento del SAIP y Reynoso)
- [ ] 1.8 Estructuras y Vistas · Categorías de Estructuras — parcial: [[Estructuras y vistas arquitectónicas]]; las **tres categorías** están en [[Diagrama de despliegue]] §3
- [x] **1.9 Géneros y Estilos Arquitectónicos** — [[Estilos arquitectónicos]] (**complemento entero**: Reynoso + SAIP + guía; sin material de clase)

### Unidad 2 — Calidad del Software

- [x] Conceptos generales · ¿Por qué es importante? — [[Atributos de calidad]] (**complemento**: falta la presentación)
- [x] **Normas ISO** — ISO 9126 y 25010 en [[Atributos de calidad]] (**complemento**)
- [x] **Atributos de calidad**: los seis del programa, con escenarios de 6 partes — [[Atributos de calidad]] (**complemento**)

### Unidad 3 — Arquitectura en el Ciclo de Vida

- [ ] Arquitectura en las metodologías: predictivo y ágil (SCRUM)
- [ ] Integrando con la arquitectura de la información
- [ ] Documentando la arquitectura de software
- [ ] Implementación y pruebas
- [ ] Evaluación de la arquitectura
- [x] Dónde se coloca en el ciclo de vida — [[Arquitectura en el ciclo de vida del software]]

### Unidad 4 — Arquitectura y Negocios

- [ ] Aplicaciones con casos

## Huecos detectados

Lo que **falta material** para poder escribir la nota, ordenado por urgencia:

| Prioridad | Qué falta | Por qué urge |
|---|---|---|
| **Alta** | Presentación de **1.9** para validar [[Estilos arquitectónicos]], que hoy es todo complemento | Se está dando ahora (17–24 de agosto) |
| **Alta** | **Arquitectura candidata**, **arquitectura de referencia** y **on premise vs cloud** — el material local casi no los cubre | Parte de 1.9 |
| Media | 1.8 Categorías de Estructuras | Segundo parcial |
| **Alta** | Presentación de la **unidad 2** para validar [[Atributos de calidad]], que hoy es todo complemento | Se da del 25 de agosto al 7 de septiembre |
| Baja | Unidades 3 y 4 | Septiembre y octubre |

Y lo que falta por otras razones:

- **Casos de uso del sistema.** El deck dice "del Negocio **y del Sistema**" pero solo desarrolla los del negocio.
- **DFD.** Aparece solo como término de comparación en [[Casos de uso vs DFD]].
- **Diagramas UML individuales.** [[Modelo 4+1 vistas]] dice qué diagrama va en cada vista, pero ninguno está explicado.
- **Trazabilidad de requisitos.** Ya tiene nota, pero de **fuente externa**: no está en las presentaciones ni en el programa oficial. Conviene confirmar el enfoque con la catedrática.

## Presentaciones procesadas

| Presentación | Páginas | Fecha de proceso | Notas generadas |
|---|---|---|---|
| Arquitectura de Software.pdf | 29 | 2026-08-19 | 9 (bloque de arquitectura) |
| Arquitectura de Software (1).pdf | 20 | 2026-08-19 | aporta a las mismas 9 |
| CDU Negocio - Modelado de Drivers RF.pdf | 27 | 2026-08-19 | 12 (bloque de casos de uso) |

> [!info] Sobre los dos PDF de arquitectura
> No son el mismo archivo ni uno es subconjunto del otro. El de **29 páginas** trae las
> definiciones formales y el **modelo 4+1 vistas** completo; el de **20 páginas** trae el
> **ciclo de influencias**, el **diagrama de Kiviat**, el cubo de dimensiones, los **beneficios
> 2 y 3** y el ejemplo de AWS. Las notas están hechas con la **unión** de ambos y cada nota
> declara en el frontmatter de cuál viene.
