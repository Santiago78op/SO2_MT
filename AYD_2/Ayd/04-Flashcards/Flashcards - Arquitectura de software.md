---
tema: Arquitectura de software
fuente: "Arquitectura de Software.pdf / Arquitectura de Software (1).pdf"
fecha: 2026-08-19
---

# Flashcards — Arquitectura de software

Formato `pregunta::respuesta`, compatible con el plugin **Spaced Repetition** de Obsidian.

#flashcards/arquitectura

Según IEEE 1471, ¿qué es la arquitectura de software?::La organización fundamental de un sistema descrita en sus componentes, la relación entre ellos y con el ambiente, y los principios que guían su diseño y evolución.

¿Cuál es el criterio de Grady Booch para decidir si algo es arquitectura?::"Toda la arquitectura es diseño, pero no todo el diseño es arquitectura." Lo significativo se mide por el **costo del cambio**: si cambiarlo sale caro, es arquitectura.

¿Qué fórmula explica por qué creció la importancia de la arquitectura?::Escala + Complejidad + Distribución = **Riesgos**.

¿Qué diferencia hay entre una **estructura** y una **vista** arquitectónica?::La estructura es el conjunto de elementos *en sí*, tal como existen en el software o hardware. La vista es la *representación* de esa estructura para las partes interesadas. Los arquitectos diseñan estructuras y documentan vistas.

¿Qué es un **punto de vista arquitectónico**?::Una plantilla que describe la forma de crear y utilizar una perspectiva de la arquitectura; incluye nombre, socios, problemas abordados, y el modelado y las convenciones analíticas.

¿Cuáles son las cinco vistas del modelo 4+1?::Vista lógica, vista de procesos, vista de despliegue (o desarrollo), vista física y la vista "+1" de escenarios.

¿Qué diagramas UML acompañan a cada vista del modelo 4+1?::Lógica → clases y paquetes. Procesos → actividad. Despliegue/desarrollo → componentes y paquetes. Física → deployment. Escenarios (+1) → casos de uso.

¿Por qué la quinta vista del modelo 4+1 se llama "+1"?::Porque no es una vista más al mismo nivel: los casos de uso **unen** las otras cuatro y dan trazabilidad de componentes, clases, equipos y paquetes para la realización de cada caso de uso.

¿En qué vista del modelo 4+1 aparecen los requisitos no funcionales?::En la **vista de procesos**: ejecución, disponibilidad, tolerancia a fallas, integridad, seguridad y confiabilidad, entre otros.

¿Cuáles son las cuatro influencias en la arquitectura?::Stakeholders, organizaciones de desarrollo, ambiente técnico y experiencia del arquitecto. Stakeholders + organizaciones de desarrollo producen los requisitos de calidad.

¿Por qué el ciclo de influencias es un ciclo y no una secuencia?::Porque el **sistema construido retroalimenta a sus propias influencias**: cambia lo que esperan los stakeholders, la organización que lo mantiene, el ambiente técnico y la experiencia del arquitecto.

¿Cuáles son los tres beneficios de una arquitectura de software?::1) Proporciona la comunicación entre stakeholders. 2) Manifiesta las decisiones de diseño tempranamente. 3) Las arquitecturas como modelo reusable y transferible.

¿Cuáles son los cuatro pasos del proceso de diseño arquitectónico?::1) Diseño de los datos. 2) Obtención de las representaciones de la estructura arquitectónica. 3) Análisis de alternativas de estilos o patrones arquitectónicos. 4) Elaboración de la arquitectura con un método de diseño.

¿Qué cuatro propiedades se revisan en las comprobaciones de cada etapa del diseño?::Que los productos sean **claros, correctos, completos y consistentes** con los requerimientos y entre sí.

¿De qué tipo de requerimientos es responsable el arquitecto según SUN SL-425?::De integrar los **requerimientos no funcionales (NRFs)** en el sistema. Además visualiza el comportamiento, crea los planos y define cómo trabajan juntos los elementos.

¿Qué son los tres vértices del triángulo del proyecto y qué frase lo resume?::Cost/Resources, Scope y Time/Schedule. "I can make it for you fast, cheap, or good. Pick any two."

¿Qué mide un diagrama de Kiviat en este contexto y cuáles son sus ejes?::Mide la **flexibilidad** del proyecto —cuánto se puede mover cada dimensión— sobre cinco ejes: features, quality, cost, schedule y staff.

Completá: la arquitectura del software es el resultado de equilibrar ______ y ______.::Requisitos funcionales y calidad.

¿Por qué la arquitectura no es una fase del ciclo de vida?::Porque es un **proceso iterativo** a través de requisitos y calidad: se va y se vuelve entre requisitos, atributos de calidad y decisiones de diseño.

¿Qué significa "menos es más" como beneficio de la arquitectura?::Que un **vocabulario restringido de alternativas de diseño** es bueno: un equipo con pocas formas acordadas de hacer las cosas es más consistente y más rápido que uno donde cada quien inventa.
