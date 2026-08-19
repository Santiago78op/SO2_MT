---
tema: Arquitectura de software
fuente: "Arquitectura de Software.pdf (núcleo) + SAIP 4ª ed. y Reynoso (complemento)"
fecha: 2026-08-19
---

# Flashcards — Diagrama de despliegue (punto 1.7)

Formato `pregunta::respuesta`, compatible con el plugin **Spaced Repetition** de Obsidian.

Salen de [[Diagrama de despliegue]]. Las primeras son del **núcleo** (la presentación); las que
llevan *(complemento)* vienen del SAIP y de Reynoso.

#flashcards/despliegue

Según la presentación, ¿qué muestra la **Vista Física** del modelo 4+1?::Cómo están distribuidos los componentes entre los distintos equipos que conforman la solución, incluyendo los servicios. Los elementos definidos en la vista lógica se mapean a componentes de software o de hardware.

¿Qué diagrama UML acompaña a la Vista Física?::El **diagrama de Deployment** (despliegue).

Cuidado con el nombre: ¿qué diagrama usa la vista que la presentación llama "Vista de Despliegue"?::El de **componentes** (y el de paquetes). En la presentación la "Vista de Despliegue o de Desarrollo" muestra cómo se divide el software en componentes; el diagrama de deployment pertenece a la **Vista Física**.

Completá la frase clave del núcleo: los elementos definidos en la vista lógica se ______ a ______.::se **mapean** a componentes de **software o de hardware**.

*(complemento)* ¿Qué muestra la **estructura de despliegue** según el SAIP?::Cómo el software se **asigna** a los elementos de procesamiento y de comunicación del hardware.

*(complemento)* ¿Cuáles son los tres tipos de elemento de una estructura de despliegue?::Elementos de **software** (normalmente un proceso de la estructura C&C), entidades de **hardware** (los procesadores) y **vías de comunicación**.

*(complemento)* ¿Cuáles son las dos relaciones de la estructura de despliegue y en qué se diferencian?::***allocated-to***: sobre qué unidad física reside el elemento de software. ***migrates-to***: a dónde puede moverse, si la asignación es **dinámica**.

*(complemento)* ¿Sobre qué cuatro atributos de calidad permite razonar la estructura de despliegue?::**Rendimiento**, **integridad de datos**, **seguridad** y **disponibilidad**.

*(complemento)* ¿Para qué atributo de calidad es la estructura clave, y en qué tipo de sistemas interesa especialmente?::Para la ***deployability*** (capacidad de despliegue). Interesa especialmente en **sistemas distribuidos**.

*(complemento)* ¿Cuáles son las tres categorías de estructuras arquitectónicas?::De **módulos** (unidades de implementación), de **componente y conector** (elementos en ejecución) y de **asignación** (software sobre lo que no es software).

*(complemento)* ¿A qué categoría pertenece la estructura de despliegue?::A las de **asignación**, junto con la de **implementación** (archivos) y la de **asignación de trabajo** (equipos).

*(complemento)* ¿Qué mapean las estructuras de asignación?::Los elementos de las estructuras de módulos o C&C sobre cosas que **no son software**: hardware (posiblemente virtualizado), equipos de trabajo y sistemas de archivos.

*(complemento)* ¿Cómo se dibuja un **nodo** en UML y qué representa?::Como una **caja 3D** (cubo). Representa un equipo, servidor o dispositivo, y puede llevar estereotipo (`«Win server»`, `«Linux server»`) y contener otros nodos.

*(complemento)* ¿Qué es un **artefacto** y cómo se dibuja?::El archivo físico que se despliega (`.jar`, `.ear`, `.dll`). Se dibuja como un rectángulo con la esquina doblada y se une a su nodo con una flecha punteada `«deploy»`.

*(complemento)* ¿Cuál es la diferencia entre artefacto y componente?::El **artefacto** es el archivo físico desplegable; el **componente** es un elemento en ejecución de la estructura C&C.

*(complemento)* ¿Cómo se dibuja una **vía de comunicación** y qué información lleva?::Como una **línea simple** entre nodos (no una flecha, porque la comunicación es bidireccional), con el protocolo o la red como estereotipo (`«internet»`, `«intranet»`) y la **multiplicidad** en los extremos.

*(complemento)* ¿Qué es un `«execution environment»` en un diagrama de despliegue?::Un **nodo anidado** dentro de otro: por ejemplo un servidor de aplicaciones (`:WebSphere`) dentro del servidor físico que lo hospeda.

*(complemento)* ¿Cuáles son los cuatro conceptos principales de la vista de despliegue según la tabla de Reynoso?::**Nodo, componente, dependencia y localización**.

*(complemento)* ¿Por qué la "vista de despliegue" de UML y la "vista física" de Kruchten son lo mismo?::Porque las dos describen el mapeo del software sobre el hardware. Booch/Rumbaugh/Jacobson la llaman **de despliegue** ("los nodos que forman la topología de hardware"); Kruchten la llama **física** ("un mapeado del software sobre el hardware").

¿Por qué el diagrama de despliegue no se puede llevar a StarUML con Mermaid?::Porque StarUML solo importa 7 tipos de Mermaid y el de despliegue no está entre ellos. Además Mermaid no tiene diagrama de despliegue nativo, y los `subgraph` con que se aproxima se pierden al importar.

¿Qué error se comete al poner clases en un diagrama de despliegue?::El diagrama es de **nodos y artefactos**. Las clases pertenecen a la vista lógica (diagrama de clases).

¿Por qué la multiplicidad en las vías de comunicación no es un detalle cosmético?::Porque "muchos clientes contra un servidor" es información arquitectónica: cambia por completo el análisis de rendimiento.

*(complemento)* ¿Por qué los mapeos entre estructuras son muchos-a-muchos?::Porque un solo módulo puede compilarse en un servicio replicado miles de veces en ejecución, y mil módulos pueden enlazarse en un único ejecutable.
