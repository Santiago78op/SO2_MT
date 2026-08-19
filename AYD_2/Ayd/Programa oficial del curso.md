---
tema: Programa del curso
fuente: "ProgramaClase-AYD2-2-26.pdf — ECYS-USAC, vía DTT-ECYS"
fecha: 2026-08-19
---

# Programa oficial — Análisis y Diseño de Sistemas II (785)

Datos del programa oficial de **mi sección**, para saber contra qué se estudia y qué falta.

| Dato | Valor |
|---|---|
| Curso | Análisis y Diseño de Sistemas II |
| Código | **785** · 5 créditos |
| Escuela | Ciencias y Sistemas · Área de **Software** |
| Pre-requisito | 283 — Análisis y Diseño de Sistemas 1 |
| Post-requisito | 780 — Software Avanzado |
| Semestre | **2do semestre 2026** |
| Docente | MBA. MSc. Ing. Claudia Rojas de Morán |
| Auxiliar | Kevin Josué Hernández Gómez |
| Sección | **A** |
| Curso | Lunes y Martes, 17:20–19:00 (meet) |
| Laboratorio | Jueves, 17:20–19:00 (meet) |

## Descripción y objetivo

> El curso está diseñado para que el estudiante identifique y aplique los distintos estilos
> arquitectónicos, así como los patrones aplicables para el diseño de componentes de una
> aplicación. El uso de dichos estilos y patrones de arquitectura, **técnicas para definir una
> arquitectura que satisfaga los requerimientos funcionales y no funcionales**, comprenden el
> resto del curso.

Objetivo general: aplicar procesos de diseño de software que consideren **los diferentes tipos de
requerimientos** que pueden impactar en la estructura del sistema.

Eso último es la brújula del curso: todo se juzga contra los requerimientos, funcionales y no
funcionales. Es la razón por la que la [[Matriz de trazabilidad de requisitos]] importa acá.

---

## Cronograma y evaluaciones

| Actividad | Fecha |
|---|---|
| Principios de Diseño de Software (1.1 a 1.7) | 13 de julio al 10 de agosto |
| **Primer parcial** | **22 de agosto** |
| Principios de Diseño de Software (1.8 y 1.9) | 17 al 24 de agosto |
| Calidad del Software | 25 de agosto al 7 de septiembre |
| **Segundo parcial** | **19 de septiembre** |
| Arquitectura en el ciclo de vida | 8 de septiembre al 12 de octubre |
| Semana de Congresos Estudiantiles | 28 de septiembre al 2 de octubre |
| **Tercer parcial** | **17 de octubre** |
| Arquitectura y Negocios | 19 al 27 de octubre |
| Último día de clases | 30 de octubre |
| Evaluaciones finales | 31 de octubre al 13 de noviembre |

Ponderación: zona 75 pts (clase: exposición 4 + tareas/cortos 5 + tres parciales 10/13/13;
laboratorio 30 pts equivalentes) y examen final 25 pts. **Se aprueba con 61.** El laboratorio se
aprueba con 61/100 y es **obligatorio ganarlo** para tener derecho al examen final.

---

## Contenido temático y estado de mis notas

Leyenda: ✅ cubierto · 🟡 parcial · ❌ sin nota

### Unidad 1 — Principios de Diseño de Arquitectura de Software

| Punto | Tema | Estado | Nota |
|---|---|---|---|
| 1.1 | Concepto de arquitectura de software | ✅ | [[Arquitectura de software]] |
| 1.2 | ¿Por qué es importante? | ✅ | [[Arquitectura de software]] |
| 1.3 | Beneficios de una arquitectura de SW | ✅ | [[Beneficios de la arquitectura de software]] |
| 1.4 | Pasos para la definición de una arquitectura | ✅ | [[Proceso de diseño arquitectónico]] |
| 1.5 | ¿Qué se tiene en cuenta para el diseño? | 🟡 | [[Ciclo de influencias en la arquitectura]], [[Equilibrio de restricciones del proyecto]] |
| 1.6 | **Arquitectura y Requerimientos (CDU de negocio)** | ✅ | Todo el bloque de casos de uso + [[Matriz de trazabilidad de requisitos]] |
| 1.7 | **¿Cómo se modela? Diagramas de Despliegue** | ❌ | solo mencionado en [[Modelo 4+1 vistas]] |
| 1.8 | Estructuras y Vistas · Categorías de Estructuras | 🟡 | [[Estructuras y vistas arquitectónicas]] — falta "categorías de estructuras" |
| 1.9 | Géneros y Estilos Arquitectónicos | ❌ | — |

El detalle de 1.9, que no tengo nada: **arquitectura candidata**, **arquitectura de referencia**,
**diseño arquitectónico on premise vs cloud**, y el **catálogo de estilos**: cliente-servidor,
centrada en datos, en o por capas, centrada en el flujo de datos, llamada y retorno, y basada en
eventos.

### Unidad 2 — Calidad del Software ❌

Nada cubierto todavía:

1. Conceptos generales
2. ¿Por qué es importante?
3. **Normas ISO**
4. **Atributos de calidad**: funcionalidad, fiabilidad, usabilidad, eficiencia, mantenibilidad,
   portabilidad, y otros atributos no observables vía ejecución

### Unidad 3 — Arquitectura en el Ciclo de Vida 🟡

| Tema | Estado |
|---|---|
| Arquitectura en las metodologías: enfoque predictivo y ágil (SCRUM) | ❌ |
| Integrando con la arquitectura de la información | ❌ |
| Documentando la arquitectura de software | 🟡 — algo en [[Estructuras y vistas arquitectónicas]] |
| Implementación y pruebas | ❌ |
| Evaluación de la arquitectura | ❌ |

Lo que sí tengo es [[Arquitectura en el ciclo de vida del software]], que corresponde a la
diapositiva "¿Dónde debe colocarse la arquitectura en el ciclo de vida?" — es una parte, no la
unidad completa.

### Unidad 4 — Arquitectura y Negocios ❌

"Aplicaciones con casos". Sin material todavía.

---

## Lo que falta pedir

Las presentaciones que tengo cubren bien **1.1–1.6**. Para el resto necesito material:

| Prioridad | Qué falta | Para cuándo |
|---|---|---|
| **Alta** | **1.7 Diagramas de Despliegue** — entra en el primer parcial | ya |
| **Alta** | **1.9 Géneros y Estilos Arquitectónicos** — se está dando ahora (17–24 de agosto) | ya |
| Media | 1.8 Categorías de Estructuras | antes del segundo parcial |
| Media | Unidad 2 completa — Calidad del Software | 25 de agosto al 7 de septiembre |
| Baja | Unidades 3 y 4 | septiembre y octubre |

---

## Bibliografía oficial

- *Essential Software Architecture* — Ian Gorton
- *Just Enough Software Architecture* — George Fairbanks
- *Head First Design Patterns* — Freeman, Freeman, Bates, Sierra
- *Software Systems Architecture: working with stakeholders using viewpoints and perspectives* — Rozanski, Woods
- *Software Performance and Scalability: a quantitative approach* — Henry H. Liu
- *Software Architecture Patterns*, 2ª ed. — Mark Richards
- *Software Quality Engineering* — Jeff Tian
- *Software Architecture in Practice* — Bass, Clements, **Kazman**

> [!note] Dos de estos ya aparecen en clase
> **Bass/Clements/Kazman** es la fuente de la definición de arquitectura que está en
> [[Arquitectura de software]] ("la estructura de estructuras..."), y el PDF
> `software-architecture-in-practice-4th-edition.pdf` está en la carpeta `Unidad_1` del disco.
> Rozanski y Woods es de donde sale el vocabulario de **vistas y perspectivas** de
> [[Estructuras y vistas arquitectónicas]].

---

## El laboratorio

El programa de laboratorio de AYD2 (785) cubre, además: administración de la configuración
(control de versiones, integración continua), entrega continua, **pruebas** (unitarias, de
integración, de sistema, de aceptación de requerimientos funcionales y no funcionales),
arquitectura de software (**por capas, 4+1 vistas, MVC**), arquitecturas orientadas al servicio
(SOA, web services, cloud) y **patrones de diseño** (creación, estructura, comportamiento).

Dos cosas que conectan con lo que ya tengo:

- **4+1 vistas** aparece explícitamente en el laboratorio → [[Modelo 4+1 vistas]].
- **Pruebas de aceptación de requerimientos funcionales y no funcionales** es el otro extremo de
  la [[Matriz de trazabilidad de requisitos]]: son la columna "cómo se verifica".

Y en el disco ya hay una presentación de patrones (Factory, State, Strategy) en
`Unidad_1/presentacion-patrones/`, que corresponde a la unidad de patrones del laboratorio.

---

## Notas relacionadas

- [[Índice]] — el mapa de la bóveda
- [[Matriz de trazabilidad de requisitos]] — el tema que conecta 1.6 con las unidades 2 y 3
- [[Arquitectura de software]] · [[Estructuras y vistas arquitectónicas]] · [[Modelo 4+1 vistas]]

## Preguntas de repaso

1. ¿Cuáles son las cuatro unidades del curso y cuál es la fecha de cada parcial?
2. ¿Qué punto del programa cubre "Arquitectura y Requerimientos" y por qué dice "(CDU de negocio)"?
3. ¿Cuáles son los seis estilos del catálogo del punto 1.9?
4. ¿Cuáles son los seis atributos de calidad de la unidad 2?
5. ¿Qué hace falta para tener derecho al examen final?
