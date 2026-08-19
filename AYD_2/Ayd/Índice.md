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
| `05-Quizzes/` | Quizzes generados y mis resultados, con fecha. |
| `06-Proyecto-MCP/` | El proyecto práctico: diseño del servidor MCP `tutor-ayds`. |
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
- [ ] **1.7 Diagramas de Despliegue** — sin nota; solo mencionado en [[Modelo 4+1 vistas]]
- [ ] 1.8 Estructuras y Vistas · Categorías de Estructuras — parcial: [[Estructuras y vistas arquitectónicas]]
- [ ] **1.9 Géneros y Estilos Arquitectónicos** — sin nada

### Unidad 2 — Calidad del Software

- [ ] Conceptos generales · ¿Por qué es importante?
- [ ] **Normas ISO**
- [ ] **Atributos de calidad**: funcionalidad, fiabilidad, usabilidad, eficiencia, mantenibilidad, portabilidad

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
| **Alta** | **1.7 Diagramas de Despliegue** | Entra en el primer parcial |
| **Alta** | **1.9 Géneros y Estilos Arquitectónicos** | Se está dando ahora (17–24 de agosto) |
| Media | 1.8 Categorías de Estructuras | Segundo parcial |
| Media | Unidad 2 completa (Calidad del Software) | Se da del 25 de agosto al 7 de septiembre |
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
