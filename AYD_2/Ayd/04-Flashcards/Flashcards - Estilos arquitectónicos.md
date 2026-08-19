---
tema: Arquitectura de software
fuente: "COMPLEMENTO — Reynoso + SAIP 4ª ed. + Guía de estudio. NO hay material de clase todavía"
fecha: 2026-08-19
---

# Flashcards — Estilos arquitectónicos (punto 1.9)

Formato `pregunta::respuesta`, compatible con el plugin **Spaced Repetition** de Obsidian.

> [!warning] Todo esto es complemento
> Salen de [[Estilos arquitectónicos]], que **no tiene núcleo de clase**: las presentaciones no
> cubren el tema. Cuando llegue la presentación de 1.9 hay que revisar estas tarjetas contra ella.

#flashcards/estilos

¿Qué es un estilo arquitectónico según Reynoso?::Un **concepto descriptivo** que define una forma de articulación u organización arquitectónica. El conjunto de los estilos cataloga las formas básicas posibles de estructuras de software; las complejas se articulan por **composición**.

¿Cuáles son los cuatro ingredientes con que se describe un estilo?::**Componentes** (elementos), **conectores**, **configuraciones** y **restricciones**.

¿Por qué el concepto de estilo va más allá de lo que cubre UML?::Porque pone los **conectores** como elemento de primera clase, y el modelado orientado a objetos y UML no los cubren satisfactoriamente. De ahí la existencia de los ADLs.

¿Cuántos estilos arquitectónicos hay y cuántos patrones de diseño?::Estilos: **seis o siete clases** fundamentales y unos **veinte ejemplares** como máximo. Patrones de diseño: **centenares**.

¿Por qué "ningún sistema real es de un solo estilo"?::Porque las arquitecturas complejas resultan del **agregado o la composición** de estilos más básicos. Ejemplo: microservicios (cliente-servidor) + bus de eventos (invocación implícita) + capas internas + contenedor (VM) + base de datos (centrado en datos) + pipeline de despliegue (batch secuencial).

¿Cuáles son los componentes y conectores del estilo **tubería y filtro**?::Componentes: **filtros** que transforman un flujo de forma **incremental** (empiezan a producir antes de terminar de consumir), más fuente y sumidero. Conectores: **tuberías**, flujos unidireccionales que preservan el orden y no transforman nada.

¿Cuál es la restricción clave de tubería y filtro?::Los filtros **no comparten estado ni conocen la identidad de sus vecinos**; toda la comunicación pasa por las tuberías. La corrección no debe depender del orden en que procesan.

¿Qué favorece y qué sacrifica tubería y filtro?::Favorece modificabilidad, reutilización, **paralelismo** y testabilidad. Sacrifica **interactividad**, estado compartido, latencia por etapa y el manejo de errores.

¿Qué es el **batch secuencial** y en qué se diferencia de tubería y filtro?::Es el caso **degenerado**: cada etapa espera a que la anterior termine del todo y pasa **archivos completos**, sin concurrencia. Es el estilo de los procesos nocturnos de mainframe y de un pipeline de despliegue.

¿Cuál es la diferencia entre **repositorio** y **pizarra**?::Quién tiene la **iniciativa**. En el repositorio la tienen los accesores (el almacén es pasivo); en la pizarra el propio almacén **notifica** a los agentes suscritos. La pizarra es repositorio + invocación implícita.

¿Cuál es la restricción del estilo centrado en datos?::Los accesores solo interactúan **a través del almacén**, nunca directamente entre sí. El **esquema de datos es el contrato** compartido por todos.

¿Qué sacrifica el estilo centrado en datos?::Performance y disponibilidad (el almacén es **cuello de botella y punto único de falla**), **acoplamiento oculto** por el esquema —cambiarlo impacta a todos los accesores— y dificultad de distribución.

¿Cuál es la restricción que **define** el estilo en capas?::La relación "tiene permitido usar" debe ser **unidireccional y estrictamente ordenada**: nunca usos hacia arriba, y normalmente solo la capa inmediata inferior.

¿Cómo se llama usar una capa no adyacente?::***Layer bridging***. En exceso destruye las metas de portabilidad que justificaban el estilo.

¿Qué favorece y qué sacrifica el estilo en capas?::Favorece modificabilidad, **portabilidad** (la capa baja aísla el SO o la red) y testabilidad de abajo hacia arriba. Sacrifica **performance**: una llamada del tope puede atravesar muchas capas.

¿Cuál es la diferencia entre una **capa** y un **tier**?::La capa es una partición del **código**: vive en la estructura de **módulos** (estática). El tier es una partición del **despliegue**: vive en la estructura de **asignación**. Se pueden tener tres capas en un solo tier.

¿En qué se diferencian **capas** y **microkernel**, siendo los dos jerárquicos?::En capas la jerarquía es de **abstracción** (cada nivel oculta el de abajo); en microkernel es de **extensión** (el centro es mínimo y la funcionalidad se enchufa por interfaces fijas).

¿Qué sacrifica el estilo **microkernel / plug-in**?::**Seguridad y privacidad**: como los plug-ins pueden venir de terceros, es más fácil introducir vulnerabilidades.

¿Cuál es el rasgo definitorio de la **invocación implícita**?::El componente que emite **no invoca a nadie directamente**: anuncia un evento y la infraestructura decide a quién le llega. De ahí que la invocación de los suscriptores sea implícita.

¿Qué se gana y qué se pierde con publish-subscribe?::Se gana modificabilidad máxima e integrabilidad: agregar un suscriptor es registrarse en un evento, **cero cambios en el publicador**. Se pierde **determinismo y trazabilidad**: nadie sabe cuánto tarda el mensaje ni en qué orden se invocan los suscriptores.

¿Cuáles son las restricciones de **cliente-servidor**?::La comunicación la **inicia siempre el cliente**; los clientes **no se comunican entre sí**. Si el servidor guarda estado del cliente, cada petición debe identificarlo y hace falta fin de sesión o timeout.

¿Qué distingue **microservicios** de **SOA** según el SAIP?::SOA: servicios **heterogéneos y de organizaciones distintas**, reutilizables y con SLA. Microservicios: **un solo sistema de una sola organización**, equipos pequeños, dependencias acíclicas y **solo comunicación por mensajes** (sin enlace directo, sin leer el almacén de otro, sin memoria compartida).

¿Qué es **peer-to-peer** y qué sacrifica?::Estilo simétrico donde cada par actúa como cliente y servidor, sin coordinador central y con churn. Favorece escalabilidad sin centro y resiliencia; sacrifica consistencia, seguridad y administrabilidad.

¿Cuáles son los cuatro elementos del estilo **intérprete / máquina virtual**?::El **motor de interpretación**, la **representación del programa** (bytecode o AST), el **estado del programa** y el **estado del propio intérprete**.

¿Se puede decir que un estilo es mejor que otro?::No. Cada estilo **canjea** un atributo de calidad por otro. Elegir estilo es elegir **qué sacrificar**, y eso solo se decide contra requerimientos concretos.

¿Qué significa "instanciar" una arquitectura de referencia?::Realizar una **customización**: agregar o quitar elementos de la estructura que la arquitectura de referencia define. Ejemplo del SAIP: agregar un componente de integración de pagos junto a los tiers de presentación, negocio y datos.

*(sin fuente en el material)* ¿Qué es una **arquitectura candidata**?::La primera versión de la arquitectura, todavía **no validada**, que se somete a evaluación y de la que puede haber varias en competencia. **Este término no está en el material local: confirmar en clase.**
