---
tema: Arquitectura de software
fuente: "Arquitectura de Software (1).pdf (los cinco stakeholders) + ISO 42010, SAIP y Garland (complemento)"
fecha: 2026-08-19
---

# Flashcards — Stakeholders, tácticas y evaluación

Compatible con el plugin **Spaced Repetition** de Obsidian: cada tarjeta es una línea con la
pregunta, el separador de dos signos de dos puntos, y la respuesta.

Salen de [[Stakeholders]], [[Tácticas y patrones arquitectónicos]], [[El ciclo del architecting]] y
[[Evaluación de la arquitectura]]. Solo la primera tarjeta es **de clase**; el resto es complemento.

#flashcards/arquitectura

*(de clase)* Nombrá los cinco stakeholders de la diapositiva y qué pide cada uno.::**Director de la organización de desarrollo**: bajos costos, mantener la gente empleada. **Mercadeo**: características, corto tiempo al mercado, bajos costos. **Usuario final**: comportamiento, rendimiento, seguridad, confiabilidad, usabilidad. **Organización del mantenimiento**: modificabilidad. **Cliente**: bajos costos, tiempo de entrega, pocos cambios en corto tiempo.

*(de clase)* ¿Cuál es la lección de esa diapositiva?::El **conflicto**: casi todos piden bajos costos, pero el usuario final pide rendimiento y seguridad y mantenimiento pide modificabilidad — y eso cuesta. El arquitecto no puede satisfacer a todos: tiene que equilibrar.

¿Cómo define ISO 42010 **stakeholder** y **concern**?::**Stakeholder**: "individuos, equipos u organizaciones con un interés en la entidad de interés". **Concern**: "los intereses que los stakeholders tienen en la entidad de interés, tales como performance, seguridad o mantenibilidad".

¿Cuál es la cadena del modelo de ISO 42010?::Stakeholder → tiene un **concern** → el concern se enmarca en un **viewpoint** → el viewpoint se instancia como una **vista** → las vistas forman la **descripción arquitectónica**.

¿Qué diferencia hay entre stakeholder, actor del negocio y trabajador del negocio?::El **stakeholder** tiene un interés y puede no interactuar nunca. El **actor** interactúa y está **fuera** del negocio. El **trabajador** ejecuta el proceso **desde adentro**. Todo actor es stakeholder; **no** todo stakeholder es actor.

¿Por qué el SAIP dice que los stakeholders no saben lo que quieren?::Porque a menudo no conocen sus requerimientos de calidad. Es una **oportunidad de colaboración**, no motivo de queja: el arquitecto aporta la experiencia de sistemas similares.

¿Cuáles son las tres fuentes de requisitos de calidad y su método?::Los **artefactos del sistema** (leer lo que existe), **entrevistar stakeholders** (QAW) y las **metas de negocio** (PALM).

¿Cuáles son las tres relaciones posibles entre una meta de negocio y la arquitectura?::1) Conducen a requisitos de calidad. 2) Afectan la arquitectura **directamente sin inducir ningún atributo** (la anécdota de los DBAs ociosos que necesitaban trabajo). 3) No influyen en absoluto.

¿Qué stakeholder marca Garland como "a menudo olvidado"?::El **personal de operaciones de red y de gestión del sistema**. Tiene requisitos de monitoreo, logs y despliegue, y no aparece en ningún caso de uso funcional.

¿Qué es una **táctica** arquitectónica?::Una decisión de diseño que influye en el logro de la respuesta de un atributo de calidad — afecta directamente la respuesta del sistema a un estímulo. Actúa sobre **una** respuesta de **un** atributo.

¿Qué es un **patrón arquitectónico**?::Describe un problema de diseño recurrente que surge en contextos específicos y presenta una solución probada, especificando roles, responsabilidades, relaciones y colaboraciones de sus elementos.

¿Cuál es la relación entre táctica y patrón?::Los patrones **empaquetan tácticas**, y por eso implican tradeoffs entre **varios** atributos a la vez; la táctica se enfoca en **una sola** respuesta de **un solo** atributo.

Ordená por granularidad: estilo, táctica, patrón arquitectónico.::**Táctica** (la más fina, una respuesta de un atributo) → **patrón arquitectónico** (solución probada que empaqueta tácticas) → **estilo** (la forma de organización del sistema completo).

¿Por qué enfocarse en tácticas y no solo en patrones?::1) A veces **ningún patrón** resuelve el problema completo (hace falta el broker de alta disponibilidad **y** alta seguridad). 2) Si no existe patrón, permiten diseñar desde primeros principios. 3) Hacen el diseño y el análisis más sistemáticos.

Nombrá cuatro súper-tácticas.::**Encapsular** (la base de todas), **restringir dependencias**, **usar un intermediario** y **abstraer servicios comunes**. Son tácticas de modificabilidad y están en casi todos los patrones.

¿Por qué la aplicación de una táctica depende del contexto?::Ejemplo del libro: *manage sampling rate* vale en ciertos sistemas de tiempo real y **jamás** en una base de datos o en trading, donde perder un evento es grave.

¿Qué es la "muerte por mil cortes"?::El deterioro de una arquitectura tolerablemente modificable por la **acumulación** de muchas decisiones pequeñas y bienintencionadas. Ninguna es el problema; la suma sí.

Nombrá los seis pasos del ciclo del architecting.::1) Entender el contexto (PALM), 2) elicitar los ASRs (QAW, utility tree), 3) diseñar (ADD), 4) documentar (vistas + rationale), 5) evaluar (ATAM), 6) realizar y sostener (deuda, refactoring).

¿Por qué el architecting es un ciclo y no una cascada?::Porque cada vuelta es una **ronda** y las evaluaciones alimentan nuevas decisiones: "el cambio sucede", los ASRs se mueven y el ciclo vuelve a empezar.

¿Qué porcentaje del costo del sistema ocurre después del primer release?::Alrededor del **80 %**. Por eso el architecting es continuo e incremental, no termina en el primer release.

¿Cuál es la diferencia entre la **arquitectura** y la **descripción arquitectónica (AD)**?::La arquitectura son los conceptos y propiedades fundamentales de la entidad. La AD es el producto de trabajo que la expresa: "una colección de artefactos que documentan una arquitectura". **Todo sistema tiene arquitectura, pero puede que nadie la conozca.**

Explicá la analogía de IEEE 1471 sobre viewpoints.::"Un **viewpoint** es a una **vista** lo que una **clase** es a un **objeto**": el viewpoint es la plantilla reutilizable, la vista es su instancia concreta para este sistema.

¿Qué es evaluar una arquitectura y de qué naturaleza es?::Determinar el grado en que la arquitectura es **apta para el propósito** al que se destina. Es una actividad de **reducción de riesgo**: funciona como un seguro.

¿Cuál es la regla de oro de la evaluación y cuál su salida principal?::El **costo de evaluar debe ser menor que el valor que aporta**. Su salida principal son los **riesgos identificados**; arreglarlos es una decisión de costo/beneficio posterior.

¿Contra qué se evalúa una arquitectura?::Contra los **escenarios de calidad de mayor prioridad** — explícitamente **no** contra los casos de uso puramente funcionales, porque la funcionalidad no determina la arquitectura.

¿Cuál es la regla cardinal del ATAM?::Que **el arquitecto participe de buena gana**. Es uno de los decisores del proyecto y está siempre.

¿Por qué el ATAM se parte en dos fases con un hiato de una semana?::La fase 1 es con los decisores (pasos 1–6) y la fase 2 con los stakeholders (pasos 7–9). La analogía del libro: la fase 1 es probar tu programa con tus propios criterios; la fase 2, dárselo al equipo de QA independiente.

Diferenciá **punto de sensibilidad** de **punto de tradeoff**.::**Sensibilidad**: una decisión con efecto marcado sobre una respuesta de un atributo. **Tradeoff**: una decisión a la que dos o más respuestas son sensibles, **una mejorando y otra empeorando**. Ejemplo: la frecuencia del heartbeat mejora la disponibilidad y empeora la performance.

¿Qué se descubre al comparar la votación del paso 7 del ATAM con el utility tree del paso 5?::Si **concuerdan**, valida al arquitecto: entendió las prioridades. Si hay una **discrepancia grande**, eso *es en sí un riesgo*: hay desacuerdo sobre las metas entre stakeholders y arquitecto.

¿Para qué documentar los **no-riesgos**?::Porque son decisiones que **sí** satisfacen un escenario: son evidencia de que la arquitectura cumple, no solo de dónde falla.
