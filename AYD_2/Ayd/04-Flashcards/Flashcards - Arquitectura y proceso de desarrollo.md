---
tema: Arquitectura en el ciclo de vida
fuente: "COMPLEMENTO — Garland & Anthony, Large-Scale Software Architecture (cap. 3) + Reynoso"
fecha: 2026-08-19
---

# Flashcards — Arquitectura y proceso de desarrollo

Compatible con el plugin **Spaced Repetition** de Obsidian: cada tarjeta es una línea con la
pregunta, el separador de dos signos de dos puntos, y la respuesta.

Salen de [[Arquitectura y proceso de desarrollo]]. **Todas son de complemento**: la unidad 3 todavía
no tiene presentación, así que si la clase dice algo distinto, manda la clase.

#flashcards/arquitectura

¿Por qué los proyectos grandes "siempre van a ser un proceso iterativo"?::Por tres razones: la **imposibilidad de especificar completamente** los requisitos, las **modificaciones** a los requisitos, y la necesidad de **mantener el sistema durante un ciclo de vida largo**.

Si la iteración es inevitable, ¿cuál es "la única decisión" que queda?::**Tomar el control de las iteraciones o no.** El debate real no es cascada vs. iterativo — iterativo va a ser igual — sino **iteración gestionada vs. iteración accidental**.

¿Cuáles son las cuatro fases de RUP?::**Inception** → **Elaboration** → **Construction** → **Transition**.

¿Qué se define en la fase de **inception**?::La **visión** del producto final, el **caso de negocio** y el **alcance** del trabajo, analizando los requisitos de más alto nivel.

En inception los requisitos de alto nivel están incompletos. ¿Qué hay que hacer?::**Asumir supuestos** para los requisitos faltantes y **refinarlos en fases posteriores**. Asumir es parte del proceso; lo que no es parte del proceso es asumir **sin declararlo**.

¿Qué fase de RUP corresponde a los criterios 1 y 2 de la rúbrica del Caso 1?::La fase de **inception**: caso de negocio, alcance, requisitos incompletos y supuestos que se refinan. La rúbrica está siguiendo el proceso.

¿Qué hace el arquitecto en el flujo de **modelado del negocio**?::Participa en la **selección y definición de los casos de uso** y en el modelo de dominio del negocio, normalmente como **facilitador**: quien conoce el negocio no suele tener experiencia en modelado.

¿Qué relación tiene el arquitecto con el flujo de **requisitos**?::Es el **cliente** de esos requisitos y debe revisarlos con cuidado, porque van a ser **la base de la definición de la arquitectura**.

¿En qué dos niveles ocurre el análisis y diseño?::El **equipo de arquitectura** produce la arquitectura de alto nivel; cada **equipo de desarrollo** diseña su parte **bajo revisión y aprobación** del equipo de arquitectura.

¿Qué hace el arquitecto en el flujo de **implementación**?::La arquitectura de alto nivel y las de subsistema son **entrada** del flujo, y el arquitecto debe asegurar que la implementación **coincida con ellas en cada iteración**.

¿Qué hace el arquitecto en el flujo de **pruebas**?::Participa **activamente**: aporta la descripción de arquitectura para que el equipo de test entienda el software, e **identifica implementaciones que se desviaron** de los lineamientos.

¿Qué hace el arquitecto en el flujo de **despliegue**?::**Comunica la arquitectura a los usuarios finales**, y potencialmente al área de ventas, para que se vean sus beneficios frente a otras arquitecturas.

¿Qué tienen en común los flujos de diseño de subsistema, implementación y pruebas?::Los tres **descubren problemas en la arquitectura y la modifican**. Es la prueba práctica de que la arquitectura no puede ser una fase: sigue viva durante todo el proyecto.

Nombrá las cuatro características de los procesos ágiles según el libro.::1) Entrega **rápida y frecuente** de software funcionando. 2) **Capacidad de respuesta** a cambios de requisitos. 3) Arquitecturas que **emergen de equipos autoorganizados**. 4) El equipo **se autoexamina** para mejorar el proceso.

¿Cuál de esas cuatro genera tensión con la arquitectura y por qué?::La tercera: **"arquitecturas que emergen de equipos autoorganizados"**. Si la arquitectura emerge sola, se pone en duda la necesidad de un arquitecto y de vistas documentadas.

¿Cuál es el veredicto del libro sobre ágil y arquitectura?::**"Vemos poco conflicto"** entre los procesos ágiles y las técnicas y viewpoints recomendados. La postura tiene nombre: **moderación cautelosa**.

¿Qué matiz agrega el libro para proyectos grandes con proceso ágil?::Que los equipos ágiles tienden a mantener **menos vistas**, pero un proyecto grande tiene más desarrolladores y más necesidad de comunicación: **incluso un equipo ágil va a necesitar un número razonable de vistas**.

¿Por qué "que todos lean el código" no sirve para comunicar la arquitectura?::Porque **no es factible ni efectivo** como medio de comunicar el diseño general en un equipo grande.

¿Cuál es la regla para decidir si vale la pena producir un artefacto?::Preguntar **"¿quién va a mirar esto?"**. Si se produce un documento grande que **no tiene stakeholders**, hay que **descartarlo**.

¿Qué pasa cuando no hay un **punto focal** para la comunicación arquitectónica?::"Una buena arquitectura no va a emerger": los equipos **reinventan código de infraestructura**, usan **estándares de desarrollo distintos** y persiguen **objetivos limitados** en vez de las metas generales.

¿Qué práctica de XP choca con el despliegue, y por qué?::El **refactoring implacable del esquema de datos**: no es práctico por los costos de **testing y transición**, y puede provocar **pesadillas de despliegue**. El esquema es el contrato que une a todos los accesores.

En la anécdota del proyecto de ~250 desarrolladores, ¿qué les faltaba a los desarrolladores experimentados que intentaron resolver los concerns arquitectónicos?::Les faltaba la **autoridad para tomar decisiones** (y no había acuerdo total). No era falta de conocimiento técnico: era falta de un rol con autoridad y de un mecanismo para resolver desacuerdos.

¿Qué pasó cuando ese proyecto nombró un arquitecto full-time?::**Resolvió el problema**, pero tarde: el arquitecto tuvo que **jugar a ponerse al día** (*play catch-up*), porque el proyecto había arrancado sin arquitecto.

¿Qué es la **infraestructura de software** y cuándo debe empezar?::Frameworks y clases utilitarias compartidas: debug y logging, wrappers de COTS, frameworks de componentes, arranque/apagado de procesos, interfaces de gestión de red. Debe empezar **antes** del análisis y diseño a nivel de subsistema, porque tiene que estar lista cuando los desarrolladores arrancan.

¿Cuál es "la trampa" de la infraestructura de software, y cómo se resuelve?::La trampa: **sus requisitos salen de las propias actividades de desarrollo**. La salida: construir un conjunto **preliminar** basado en la experiencia y **modificarlo o ampliarlo rápido** cuando aparecen requisitos nuevos.

¿Qué es un diseño **straw man**?::Empezar el diseño **en cuanto exista cualquier descripción del sistema**, marcándolo **claramente como preliminar**, para tener algo concreto que criticar en vez de esperar información completa.

¿Cómo divide Reynoso el "gran debate metodológico"?::Los **pesados/rigurosos** tipo SEI/CMM (De Marco, Yourdon, Lister) contra los **ágiles** (XP, SCRUM, Crystal, FDD, DSDM, Lean, Adaptive — Fowler, Highsmith), con **Kruchten y RUP** intentando establecerse en **ambos terrenos**.

¿Qué dato irónico anota Reynoso sobre ese debate?::Que ambos bandos operan en el contexto de la "crisis del software" **acusándose mutuamente de haberla ocasionado**.
