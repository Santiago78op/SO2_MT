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
- **ADD (Attribute-Driven Design)** — Método del SAIP para diseñar la arquitectura convirtiendo drivers en estructuras, en rondas e iteraciones. → [[Guía - Drivers de calidad y restricción]]
- **Agregación** — Relación es-parte-de con rombo **hueco** en el todo: la parte sobrevive al todo. → [[Relaciones y dependencias en UML]]
- **allocated-to / migrates-to** — Las dos relaciones de la estructura de despliegue: dónde reside un elemento de software, y a dónde puede migrar si la asignación es dinámica. → [[Diagrama de despliegue]]
- **Arquitecting** — El proceso de la arquitectura del software. → [[Proceso de diseño arquitectónico]]
- **Arquitecto de software** — Rol responsable de obtener los requisitos del cliente, generar el diseño de arquitectura, dar soluciones a los desarrolladores e integrar los requerimientos no funcionales. → [[Arquitecto de software]]
- **Arquitectura de software** — La organización fundamental de un sistema: sus componentes, la relación entre ellos y con el ambiente, y los principios que guían su diseño y evolución. → [[Arquitectura de software]]
- **Artefacto (UML)** — El archivo físico que se despliega (`.jar`, `.ear`, `.dll`); se dibuja como rectángulo con la esquina doblada y se une a su nodo con `«deploy»`. → [[Diagrama de despliegue]]
- **Asociación** — Vínculo estructural estable entre elementos, con línea llena. → [[Relaciones y dependencias en UML]]
- **Asociación (en CUN)** — Relación entre un actor del negocio y un CUN que significa que el actor envía y/o recibe mensajes. → [[Modelo de casos de uso del negocio]]
- **ASR (requisito arquitectónicamente significativo)** — Requisito de calidad que impacta en la estructura del sistema; es uno de los componentes de los drivers en ADD. → [[Guía - Drivers de calidad y restricción]]
- **Atributo de calidad (QA)** — Propiedad **medible o testeable** que indica cuán bien un sistema satisface las necesidades de sus stakeholders más allá de la función básica. → [[Atributos de calidad]]
- **Atributos de un buen diseño** — Durabilidad, utilidad y encanto; en software: de confianza y fácil de evolucionar, fácil de implementar, entendible. → [[Arquitectura de software]]

## B

- **Batch secuencial** — Caso degenerado del flujo de datos: cada etapa espera a que la anterior termine del todo y pasa archivos completos, sin concurrencia. → [[Estilos arquitectónicos]]

## C

- **Capa vs tier** — La capa es una partición del código (estructura de módulos); el tier es una partición del despliegue (estructura de asignación). Confundirlos es el error clásico. → [[Estilos arquitectónicos]]
- **Caso de uso (CU)** — Descripción del comportamiento de un sistema en forma de acciones y reacciones, desde el punto de vista del usuario. Propuesto por Ivar Jacobson. → [[Caso de uso]]
- **Caso de uso del negocio (CUN)** — Secuencia de acciones realizadas en el negocio que producen un resultado de valor observable para ciertos actores del negocio. Representa un proceso de negocio. → [[Caso de uso del negocio]]
- **Ciclo de influencias en la arquitectura** — Las cuatro influencias (stakeholders, organizaciones de desarrollo, ambiente técnico, experiencia del arquitecto) que moldean la arquitectura y que el sistema resultante retroalimenta. → [[Ciclo de influencias en la arquitectura]]
- **Clasificación de procesos** — Técnica que separa los procesos del negocio en núcleo, soporte y gerenciales. → [[Identificación de procesos del negocio]]
- **Cliente y proveedor (en una dependencia)** — El cliente es el que depende; el proveedor, el que se depende. La flecha sale del cliente. → [[Relaciones y dependencias en UML]]
- **Cliente-servidor** — Estilo asimétrico: el cliente siempre inicia la petición y los clientes no se comunican entre sí. → [[Estilos arquitectónicos]]
- **Composición** — Relación es-parte-de con rombo **macizo** en el todo: si muere el todo, mueren las partes. → [[Relaciones y dependencias en UML]]
- **Comprobaciones** — Revisión, en cada etapa, de que los productos del diseño sean claros, correctos, completos y consistentes con los requerimientos y entre sí. → [[Proceso de diseño arquitectónico]]
- **CUN expandidos** — Los CUN con relaciones de inclusión, extensión y generalización-especialización. → [[Caso de uso del negocio]]
- **Curso alterno** — La variante, excepción o desvío del flujo de trabajo, contada en el texto del mismo caso de uso. → [[Descripción textual de casos de uso]]

## D

- **Dependencia (UML)** — Relación débil de línea **punteada** y punta abierta, del cliente al proveedor: si cambia el proveedor puede haber que cambiar el cliente. → [[Relaciones y dependencias en UML]]
- **Deployability** — Atributo de calidad que mide la capacidad de despliegue; la estructura de despliegue es la clave para lograrlo. → [[Diagrama de despliegue]]
- **Descripción de la arquitectura** — Conjunto de productos que documentan la arquitectura. → [[Arquitectura de software]]
- **Descripción textual (de un CU)** — Documento con nombre, actores, propósito, resumen, flujo de trabajo (básico y alterno), prioridad y mejoras. → [[Descripción textual de casos de uso]]
- **DFD (diagrama de flujo de datos)** — Modela la funcionalidad como transformación de flujos de entrada en flujos de salida; puede mostrar descomposición funcional interna. → [[Casos de uso vs DFD]]
- **Diagrama de despliegue** — Diagrama UML que muestra cómo el software se asigna a los procesadores y las vías de comunicación del hardware. → [[Diagrama de despliegue]]
- **Diagrama de Kiviat** — Diagrama radar de cinco ejes (features, quality, cost, schedule, staff) usado como "diagrama de flexibilidad" del proyecto. → [[Equilibrio de restricciones del proyecto]]
- **Driver arquitectónico** — Requisito que impacta en la estructura del sistema. El enunciado del Caso 1 pide tratar los escenarios de calidad como drivers. → [[Plan - Caso 1 FarmaHosp]]
- **Driver de restricción** — Decisión de diseño ya tomada que no se negocia; se reconoce por el "debe" o "no se puede" y por no tener medida. → [[Guía - Drivers de calidad y restricción]]
- **Driver de restricción** — Decisión ya tomada que no se negocia (tecnología prohibida, política, ley). En el Caso 1 son los "lo que NO debe hacer el sistema". → [[Plan - Caso 1 FarmaHosp]]
- **Driver RF** — Driver de requisito funcional; se modela con casos de uso expandidos. → [[Guía - Matrices de trazabilidad]]

## E

- **Escenario de atributo de calidad** — La especificación de un requisito de calidad en seis partes: fuente, estímulo, artefacto, entorno, respuesta y **medida**. → [[Atributos de calidad]]
- **Escenarios (vista de)** — La vista "+1" del modelo 4+1: los casos de uso que amarran las otras cuatro vistas y dan trazabilidad. → [[Modelo 4+1 vistas]]
- **Estereotipo** — Extensión de UML que define un tipo especializado; se escribe entre `«»` y se aplica tanto a clases como a **relaciones**. → [[Relaciones y dependencias en UML]]
- **Estereotipo** — En el modelo de CUN, los dos elementos base: actor del negocio y caso de uso del negocio. → [[Modelo de casos de uso del negocio]]
- **Estilo arquitectónico** — Concepto descriptivo que define una forma de organización arquitectónica; conjuga componentes, conectores, configuraciones y restricciones (Reynoso). → [[Estilos arquitectónicos]]
- **Estructura arquitectónica** — El conjunto de elementos en sí, tal como existen en el software o el hardware. Se representa mediante vistas. → [[Estructuras y vistas arquitectónicas]]
- **Estructura de despliegue** — Muestra cómo el software se asigna a los elementos de procesamiento y comunicación del hardware; permite razonar sobre rendimiento, integridad, seguridad y disponibilidad. → [[Diagrama de despliegue]]
- **Estructuras de asignación** — Las que mapean software sobre lo que NO es software: despliegue, implementación y asignación de trabajo. → [[Diagrama de despliegue]]
- **Extend (relación de extensión)** — Relación que agrega a un CU base una conducta opcional u optativa, que no siempre ocurre. → [[Relación de extensión extend]]

## F

- **Función** — Grupo funcional que responde a un objetivo de la organización y que puede involucrar a varias áreas. Agrupa varios procesos de negocio; no es un CUN. → [[Identificación de procesos del negocio]]

## G

- **Generalización-especialización** — Relación que muestra workflows que comparten estructura, propósito y comportamiento: un CU padre y uno o más CU hijos. → [[Generalización y especialización en casos de uso]]
- **Gold plating** — Funcionalidad construida que ningún requisito pidió; la detecta la trazabilidad hacia atrás. → [[Matriz de trazabilidad de requisitos]]

## I

- **Include (relación de inclusión)** — Relación en que el comportamiento de un CU se inserta explícitamente dentro del CU base; siempre ocurre. → [[Relación de inclusión include]]
- **Invocación implícita** — Estilo basado en eventos: el emisor anuncia un evento y la infraestructura decide a quién le llega; los suscriptores se invocan implícitamente. → [[Estilos arquitectónicos]]
- **ISO 9126** — Norma de calidad de producto con seis características: funcionalidad, fiabilidad, usabilidad, eficiencia, mantenibilidad y portabilidad. Es la lista del programa. → [[Atributos de calidad]]
- **ISO/IEC 25010** — Sucesora de ISO 9126; asciende la seguridad y la compatibilidad a características de primer nivel, llegando a ocho. → [[Atributos de calidad]]

## L

- **Layer bridging** — Usar una capa no adyacente, violando la restricción del estilo en capas; en exceso destruye la portabilidad que justificaba el estilo. → [[Estilos arquitectónicos]]

## M

- **MAC (medicamento de alto costo)** — Medicamento cuyo valor mensual por paciente supera los Q. 50,000; el objeto del sistema FarmaHosp. → [[Plan - Caso 1 FarmaHosp]]
- **Matriz de trazabilidad (RTM)** — Tabla que cruza cada requisito con su origen, su diseño, su código y sus pruebas. → [[Matriz de trazabilidad de requisitos]]
- **Microkernel / plug-in** — Forma del estilo jerárquico: un núcleo con mecanismos mínimos y plug-ins que aportan la funcionalidad por interfaces fijas. → [[Estilos arquitectónicos]]
- **Modelo 4+1 vistas** — Forma de documentar la arquitectura con las vistas lógica, de procesos, de despliegue/desarrollo y física, más la vista de escenarios. → [[Modelo 4+1 vistas]]
- **Modelo de casos de uso del negocio** — Modelo que describe los procesos de un negocio y cómo se benefician e interactúan socios y clientes en esos procesos. → [[Modelo de casos de uso del negocio]]

## N

- **Necesidad oculta** — Lo que el stakeholder realmente necesita, distinto de lo que dice que quiere; en el Caso 1 es una columna de la tabla de stakeholders. → [[Plan - Caso 1 FarmaHosp]]
- **Nodo (UML)** — Un equipo, servidor o dispositivo en un diagrama de despliegue; se dibuja como caja 3D y puede contener otros nodos. → [[Diagrama de despliegue]]
- **NRFs (requerimientos no funcionales)** — Rendimiento, seguridad, disponibilidad, modificabilidad y similares; el arquitecto es responsable de integrarlos en el sistema. → [[Arquitecto de software]]
- **Núcleo, soporte y gerenciales** — Los tres tipos de procesos de negocio en la técnica de clasificación. → [[Identificación de procesos del negocio]]

## P

- **Perspectiva de la arquitectura** — Representación desde una perspectiva específica de un determinado sistema o de una parte del mismo. → [[Arquitectura de software]]
- **Pizarra (blackboard)** — Variante activa del estilo centrado en datos: el almacén notifica a los agentes suscritos. Es repositorio + invocación implícita. → [[Estilos arquitectónicos]]
- **Post-RS (trazabilidad)** — Enlaza el requisito con lo que se construyó: diseño, código y pruebas. → [[Matriz de trazabilidad de requisitos]]
- **Pre-RS (trazabilidad)** — Enlaza el requisito con su origen: stakeholders, reglas de negocio, documentos previos. → [[Matriz de trazabilidad de requisitos]]
- **Proceso de negocio** — Grupo de tareas lógicamente relacionadas, en cierta secuencia y manera, que emplean recursos de la organización para dar resultados en apoyo a sus objetivos. → [[Proceso de negocio]]
- **Punto de vista arquitectónico** — Plantilla que describe la forma de crear y utilizar una perspectiva de la arquitectura. → [[Arquitectura de software]]

## Q

- **QAW (Quality Attribute Workshop)** — Método facilitado de siete pasos para generar, priorizar y refinar escenarios de calidad con los stakeholders. → [[Guía - Drivers de calidad y restricción]]

## R

- **Realización** — Relación punteada con triángulo hueco: el elemento implementa una interfaz. → [[Relaciones y dependencias en UML]]
- **Realizaciones de CUN** — Muestran cómo colaboran los trabajadores y entidades de negocio para ejecutar el proceso; se documentan con diagramas de actividad, clases y secuencia, y descripción textual. → [[Realizaciones de casos de uso del negocio]]
- **Repositorio** — Variante pasiva del estilo centrado en datos: los accesores tienen la iniciativa y el esquema de datos es el contrato común. → [[Estilos arquitectónicos]]
- **Requisito huérfano** — Requisito sin diseño o sin caso de prueba asociado; hueco de cobertura. → [[Matriz de trazabilidad de requisitos]]

## S

- **Sistema** — Conjunto de componentes que cumplen una función o un conjunto de funciones específicas. → [[Arquitectura de software]]
- **Stakeholders** — Participantes del proyecto; cada uno le exige al sistema atributos distintos y a menudo incompatibles. → [[Beneficios de la arquitectura de software]]

## T

- **Trabajador del negocio** — Quien ejecuta el proceso desde *adentro* del negocio; aparece en las realizaciones de CUN y **no** es un actor. → [[Realizaciones de casos de uso del negocio]]
- **Tradeoff (de atributos)** — Ningún atributo de calidad se logra en aislamiento: lograr uno afecta a los otros, y casi todos afectan negativamente a la performance. → [[Atributos de calidad]]
- **Trazabilidad bidireccional** — Hacia adelante y hacia atrás a la vez; la única completa y la que exigen los estándares. → [[Matriz de trazabilidad de requisitos]]
- **Trazabilidad de requisitos** — Capacidad de describir y seguir la vida de un requisito en ambas direcciones, desde su origen hasta su despliegue (Gotel y Finkelstein). → [[Matriz de trazabilidad de requisitos]]
- **Triángulo del proyecto** — Las tres restricciones alcance / costo / tiempo: se pueden fijar dos, la tercera queda como consecuencia. → [[Equilibrio de restricciones del proyecto]]
- **Tubería y filtro** — Estilo de flujo de datos: filtros que transforman incrementalmente un stream, conectados por tuberías que preservan el orden. → [[Estilos arquitectónicos]]

## V

- **Vía de comunicación** — La línea simple que une dos nodos en un diagrama de despliegue; lleva el protocolo como estereotipo y admite multiplicidad. → [[Diagrama de despliegue]]
- **Vista arquitectónica** — Representación de un conjunto coherente de elementos arquitectónicos, escrita y leída por las partes interesadas. Es la representación de una estructura. → [[Estructuras y vistas arquitectónicas]]
- **Vista de despliegue (o de desarrollo)** — Muestra cómo está dividido el software en componentes y las dependencias entre ellos. Diagramas de componentes y de paquetes. → [[Modelo 4+1 vistas]]
- **Vista de procesos** — Muestra los flujos de trabajo paso a paso y varios requisitos no funcionales. Diagrama de actividad. → [[Modelo 4+1 vistas]]
- **Vista física** — Muestra cómo se distribuyen los componentes entre los equipos que conforman la solución. Diagrama de deployment. → [[Modelo 4+1 vistas]]
- **Vista lógica** — Muestra los requisitos funcionales: el dominio de la aplicación, las clases y objetos del *core*. Diagramas de clases y de paquetes. → [[Modelo 4+1 vistas]]
