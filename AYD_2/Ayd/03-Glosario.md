---
tema: Glosario
fuente: "Arquitectura de Software.pdf / Arquitectura de Software (1).pdf / CDU Negocio - Modelado de Drivers RF.pdf"
fecha: 2026-08-19
---

# Glosario — Análisis y Diseño de Sistemas

Glosario global de la materia, en orden alfabético. Cada término lleva una definición de 1-2
líneas y el enlace a la nota donde se explica a fondo.

---

## A

- **Actor del negocio** — Rol que alguien o algo juega cuando interactúa con el negocio para beneficiarse de sus resultados. Siempre modela algo *fuera* del negocio. → [[Actor del negocio]]
- **Arquitecting** — El proceso de la arquitectura del software. → [[Proceso de diseño arquitectónico]]
- **Arquitecto de software** — Rol responsable de obtener los requisitos del cliente, generar el diseño de arquitectura, dar soluciones a los desarrolladores e integrar los requerimientos no funcionales. → [[Arquitecto de software]]
- **Arquitectura de software** — La organización fundamental de un sistema: sus componentes, la relación entre ellos y con el ambiente, y los principios que guían su diseño y evolución. → [[Arquitectura de software]]
- **Asociación (en CUN)** — Relación entre un actor del negocio y un CUN que significa que el actor envía y/o recibe mensajes. → [[Modelo de casos de uso del negocio]]
- **Atributos de un buen diseño** — Durabilidad, utilidad y encanto; en software: de confianza y fácil de evolucionar, fácil de implementar, entendible. → [[Arquitectura de software]]

## C

- **Caso de uso (CU)** — Descripción del comportamiento de un sistema en forma de acciones y reacciones, desde el punto de vista del usuario. Propuesto por Ivar Jacobson. → [[Caso de uso]]
- **Caso de uso del negocio (CUN)** — Secuencia de acciones realizadas en el negocio que producen un resultado de valor observable para ciertos actores del negocio. Representa un proceso de negocio. → [[Caso de uso del negocio]]
- **Ciclo de influencias en la arquitectura** — Las cuatro influencias (stakeholders, organizaciones de desarrollo, ambiente técnico, experiencia del arquitecto) que moldean la arquitectura y que el sistema resultante retroalimenta. → [[Ciclo de influencias en la arquitectura]]
- **Clasificación de procesos** — Técnica que separa los procesos del negocio en núcleo, soporte y gerenciales. → [[Identificación de procesos del negocio]]
- **Comprobaciones** — Revisión, en cada etapa, de que los productos del diseño sean claros, correctos, completos y consistentes con los requerimientos y entre sí. → [[Proceso de diseño arquitectónico]]
- **CUN expandidos** — Los CUN con relaciones de inclusión, extensión y generalización-especialización. → [[Caso de uso del negocio]]
- **Curso alterno** — La variante, excepción o desvío del flujo de trabajo, contada en el texto del mismo caso de uso. → [[Descripción textual de casos de uso]]

## D

- **Descripción de la arquitectura** — Conjunto de productos que documentan la arquitectura. → [[Arquitectura de software]]
- **Descripción textual (de un CU)** — Documento con nombre, actores, propósito, resumen, flujo de trabajo (básico y alterno), prioridad y mejoras. → [[Descripción textual de casos de uso]]
- **DFD (diagrama de flujo de datos)** — Modela la funcionalidad como transformación de flujos de entrada en flujos de salida; puede mostrar descomposición funcional interna. → [[Casos de uso vs DFD]]
- **Diagrama de Kiviat** — Diagrama radar de cinco ejes (features, quality, cost, schedule, staff) usado como "diagrama de flexibilidad" del proyecto. → [[Equilibrio de restricciones del proyecto]]

## E

- **Escenarios (vista de)** — La vista "+1" del modelo 4+1: los casos de uso que amarran las otras cuatro vistas y dan trazabilidad. → [[Modelo 4+1 vistas]]
- **Estereotipo** — En el modelo de CUN, los dos elementos base: actor del negocio y caso de uso del negocio. → [[Modelo de casos de uso del negocio]]
- **Estructura arquitectónica** — El conjunto de elementos en sí, tal como existen en el software o el hardware. Se representa mediante vistas. → [[Estructuras y vistas arquitectónicas]]
- **Extend (relación de extensión)** — Relación que agrega a un CU base una conducta opcional u optativa, que no siempre ocurre. → [[Relación de extensión extend]]

## F

- **Función** — Grupo funcional que responde a un objetivo de la organización y que puede involucrar a varias áreas. Agrupa varios procesos de negocio; no es un CUN. → [[Identificación de procesos del negocio]]

## G

- **Generalización-especialización** — Relación que muestra workflows que comparten estructura, propósito y comportamiento: un CU padre y uno o más CU hijos. → [[Generalización y especialización en casos de uso]]
- **Gold plating** — Funcionalidad construida que ningún requisito pidió; la detecta la trazabilidad hacia atrás. → [[Matriz de trazabilidad de requisitos]]

## I

- **Include (relación de inclusión)** — Relación en que el comportamiento de un CU se inserta explícitamente dentro del CU base; siempre ocurre. → [[Relación de inclusión include]]

## M

- **Matriz de trazabilidad (RTM)** — Tabla que cruza cada requisito con su origen, su diseño, su código y sus pruebas. → [[Matriz de trazabilidad de requisitos]]
- **Modelo 4+1 vistas** — Forma de documentar la arquitectura con las vistas lógica, de procesos, de despliegue/desarrollo y física, más la vista de escenarios. → [[Modelo 4+1 vistas]]
- **Modelo de casos de uso del negocio** — Modelo que describe los procesos de un negocio y cómo se benefician e interactúan socios y clientes en esos procesos. → [[Modelo de casos de uso del negocio]]

## N

- **NRFs (requerimientos no funcionales)** — Rendimiento, seguridad, disponibilidad, modificabilidad y similares; el arquitecto es responsable de integrarlos en el sistema. → [[Arquitecto de software]]
- **Núcleo, soporte y gerenciales** — Los tres tipos de procesos de negocio en la técnica de clasificación. → [[Identificación de procesos del negocio]]

## P

- **Perspectiva de la arquitectura** — Representación desde una perspectiva específica de un determinado sistema o de una parte del mismo. → [[Arquitectura de software]]
- **Post-RS (trazabilidad)** — Enlaza el requisito con lo que se construyó: diseño, código y pruebas. → [[Matriz de trazabilidad de requisitos]]
- **Pre-RS (trazabilidad)** — Enlaza el requisito con su origen: stakeholders, reglas de negocio, documentos previos. → [[Matriz de trazabilidad de requisitos]]
- **Proceso de negocio** — Grupo de tareas lógicamente relacionadas, en cierta secuencia y manera, que emplean recursos de la organización para dar resultados en apoyo a sus objetivos. → [[Proceso de negocio]]
- **Punto de vista arquitectónico** — Plantilla que describe la forma de crear y utilizar una perspectiva de la arquitectura. → [[Arquitectura de software]]

## R

- **Realizaciones de CUN** — Muestran cómo colaboran los trabajadores y entidades de negocio para ejecutar el proceso; se documentan con diagramas de actividad, clases y secuencia, y descripción textual. → [[Realizaciones de casos de uso del negocio]]
- **Requisito huérfano** — Requisito sin diseño o sin caso de prueba asociado; hueco de cobertura. → [[Matriz de trazabilidad de requisitos]]

## S

- **Sistema** — Conjunto de componentes que cumplen una función o un conjunto de funciones específicas. → [[Arquitectura de software]]
- **Stakeholders** — Participantes del proyecto; cada uno le exige al sistema atributos distintos y a menudo incompatibles. → [[Beneficios de la arquitectura de software]]

## T

- **Trabajador del negocio** — Quien ejecuta el proceso desde *adentro* del negocio; aparece en las realizaciones de CUN y **no** es un actor. → [[Realizaciones de casos de uso del negocio]]
- **Trazabilidad bidireccional** — Hacia adelante y hacia atrás a la vez; la única completa y la que exigen los estándares. → [[Matriz de trazabilidad de requisitos]]
- **Trazabilidad de requisitos** — Capacidad de describir y seguir la vida de un requisito en ambas direcciones, desde su origen hasta su despliegue (Gotel y Finkelstein). → [[Matriz de trazabilidad de requisitos]]
- **Triángulo del proyecto** — Las tres restricciones alcance / costo / tiempo: se pueden fijar dos, la tercera queda como consecuencia. → [[Equilibrio de restricciones del proyecto]]

## V

- **Vista arquitectónica** — Representación de un conjunto coherente de elementos arquitectónicos, escrita y leída por las partes interesadas. Es la representación de una estructura. → [[Estructuras y vistas arquitectónicas]]
- **Vista de despliegue (o de desarrollo)** — Muestra cómo está dividido el software en componentes y las dependencias entre ellos. Diagramas de componentes y de paquetes. → [[Modelo 4+1 vistas]]
- **Vista de procesos** — Muestra los flujos de trabajo paso a paso y varios requisitos no funcionales. Diagrama de actividad. → [[Modelo 4+1 vistas]]
- **Vista física** — Muestra cómo se distribuyen los componentes entre los equipos que conforman la solución. Diagrama de deployment. → [[Modelo 4+1 vistas]]
- **Vista lógica** — Muestra los requisitos funcionales: el dominio de la aplicación, las clases y objetos del *core*. Diagramas de clases y de paquetes. → [[Modelo 4+1 vistas]]
