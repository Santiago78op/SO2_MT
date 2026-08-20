---
tema: Calidad del software
fuente: "COMPLEMENTO — SAIP vía la Guía de estudio + contenido temático de la unidad 2 del programa"
fecha: 2026-08-19
---

# Flashcards — Atributos de calidad y drivers

Compatible con el plugin **Spaced Repetition** de Obsidian: cada tarjeta es una línea con la
pregunta, el separador de dos signos de dos puntos, y la respuesta.

> [!warning] Complemento
> Salen de [[Atributos de calidad]] y [[Guía - Drivers de calidad y restricción]]. La unidad 2 del
> programa todavía no tiene presentación: hay que revisar estas tarjetas cuando llegue.

#flashcards/calidad

¿Qué es un atributo de calidad?::Una propiedad **medible o testeable** de un sistema, que indica cuán bien satisface las necesidades de sus stakeholders más allá de la función básica.

¿Por qué la funcionalidad NO determina la arquitectura?::Porque dado un conjunto de funciones hay **infinitas arquitecturas** que las satisfacen: si solo importara la funcionalidad, un **blob monolítico** sin estructura interna bastaría. Estructuramos para servir a los atributos de calidad.

¿Por qué se rediseñan los sistemas en la práctica?::**No por deficiencia funcional** —los reemplazos suelen ser funcionalmente idénticos— sino porque son difíciles de mantener, portar o escalar, o son lentos, o fueron vulnerados.

¿Cuáles son los seis atributos de calidad del programa?::**Funcionalidad, fiabilidad, usabilidad, eficiencia, mantenibilidad y portabilidad.** Son las características de ISO 9126.

¿Dónde cae la **seguridad** en la taxonomía del programa?::Bajo **funcionalidad**: en ISO 9126 la seguridad es una subcaracterística de funcionalidad. En ISO/IEC 25010 pasa a ser característica de primer nivel.

¿Cuántas características tiene ISO/IEC 25010 y qué agrega respecto de 9126?::**Ocho**. Agrega **security** y **compatibility** como características de primer nivel. Curiosamente, la **escalabilidad ni aparece**.

¿Cuáles son las dos categorías de atributos de calidad?::Los **en ejecución** (disponibilidad, performance, usabilidad, seguridad, safety, energía), que se miden corriendo el sistema; y los **del desarrollo** (modificabilidad, testabilidad, deployabilidad, integrabilidad), que se miden al **modificarlo**.

¿A qué atributo afectan negativamente casi todos los demás?::A la **performance**. Ejemplo del libro: portabilidad → aislar dependencias → overhead → menos performance.

¿Cuáles son los tres problemas clásicos de las discusiones de atributos de calidad?::1) **Definiciones no testeables** ("el sistema será modificable" no significa nada). 2) **Disputas de pertenencia** (un DoS ¿es disponibilidad, performance, seguridad o usabilidad?). 3) **Vocabularios propios** (eventos, ataques, fallas, input del usuario pueden ser la misma ocurrencia).

¿Qué resuelve los problemas de definiciones no testeables y de pertenencia?::Los **escenarios**. Como dice el SAIP: los nombres de los atributos, por sí solos, son casi inútiles — son invitaciones a empezar una conversación.

¿Cuáles son las **seis partes** de un escenario de atributo de calidad?::1) **Fuente** del estímulo, 2) **Estímulo**, 3) **Artefacto**, 4) **Entorno**, 5) **Respuesta**, 6) **Medida de la respuesta**.

¿Cuál de las seis partes separa un requisito de un deseo?::La **medida de la respuesta** (parte 6). Sin medida el escenario no es testeable y no sirve como driver.

¿Qué diferencia hay entre un escenario **general** y uno **concreto**?::El general es independiente del sistema y sirve para el brainstorming; el concreto es específico del sistema. Se usan los generales porque es más fácil que un stakeholder **adapte** uno que lo genere de la nada.

¿En qué consiste la técnica de "hacerse el tonto" de Kazman?::Ante un "no sé qué valor poner", proponer valores extremos y bajar: ¿24 horas? ¿Una hora? ¿Cinco minutos? ¿Diez segundos? Un **rango** de valores aceptables ya basta, porque 24 horas y 100 ms implican arquitecturas completamente distintas.

¿Qué es un **driver arquitectónico**?::Un requisito que **impacta en la estructura** del sistema. El filtro: ¿si este requisito cambia, tengo que cambiar la estructura?

Según ADD, ¿de qué está compuesto el conjunto de drivers?::De los **ASRs** (requisitos arquitectónicamente significativos), la **funcionalidad primaria**, las **restricciones**, los **concerns** y el **propósito del diseño**.

¿Por qué el diagrama de contexto es la precondición de ADD?::Porque ADD exige establecer el alcance antes de empezar: qué queda dentro y fuera, y con qué entidades externas interactúa el sistema — que es exactamente el diagrama de contexto.

¿Qué es un **driver de restricción** y cómo se reconoce?::Una decisión de diseño **ya tomada** que no se negocia. Se reconoce porque se escribe con "debe" o "no se puede", y porque **no tiene medida**: se cumple o no, sin grados.

¿Cuáles son los cuatro orígenes de las restricciones?::**Explícitas** (una sección del enunciado), **regulatorias** (leyes y normas), **técnicas del entorno** (hardware y red que ya existen) y **organizativas** (el equipo y sus capacidades).

¿Cuál tipo de restricción se olvida más y por qué importa?::Las **organizativas**. En FarmaHosp, que el sistema deba poder ser mantenido solo por 3 desarrolladores con Java y Oracle condiciona lenguaje, base de datos y hasta el estilo arquitectónico.

¿Qué es el QAW y cuántos pasos tiene?::El **Quality Attribute Workshop**: un método facilitado y centrado en stakeholders para generar, priorizar y refinar escenarios antes de que la arquitectura esté completa. Tiene **siete** pasos.

En el QAW, ¿cuántos votos recibe cada stakeholder para priorizar?::Una cantidad igual al **30 % del número de escenarios**. Con 20 escenarios, 6 votos. Fuerza a elegir en vez de aprobar todo.

¿Por qué en el QAW la consolidación va **antes** de la priorización?::Porque si dos escenarios dicen lo mismo con otras palabras, se reparten los votos entre sí y los dos pierden. Primero se fusionan los similares.

¿Por qué el SAIP desconfía de las taxonomías ISO aunque las recomiende?::Porque 1) ninguna lista es completa (siempre aparece un concern imprevisto), 2) generan más controversia que comprensión, y 3) pretenden ser taxonomías pero los atributos son escurridizos. Sirven como **checklist**, no como verdad.
