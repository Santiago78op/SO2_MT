---
tema: Trazabilidad de requisitos
fuente: FUENTE EXTERNA — no está en las presentaciones ni en el programa oficial
fecha: 2026-08-19
---

# Flashcards — Trazabilidad de requisitos

Formato `pregunta::respuesta`, compatible con el plugin **Spaced Repetition** de Obsidian.

> [!warning] Material externo
> Estas tarjetas salen de [[Matriz de trazabilidad de requisitos]], cuyo contenido **no** viene de
> las presentaciones ni del programa oficial del curso. Conviene confirmar el enfoque con la
> catedrática antes de darlas por definitivas.

#flashcards/trazabilidad

¿Cómo definen Gotel y Finkelstein la trazabilidad de requisitos?::La capacidad de **describir y seguir la vida de un requisito**, en ambas direcciones: desde sus orígenes, pasando por su desarrollo y especificación, hasta su despliegue y uso, y a través de los períodos de refinamiento e iteración.

¿Qué es una matriz de trazabilidad de requisitos (RTM)?::Una tabla que cruza cada requisito con los demás artefactos del proyecto —origen, casos de uso, diseño, código, pruebas, defectos— y hace visible qué está conectado con qué.

¿Qué es la trazabilidad **pre-RS**?::La que enlaza el requisito con su **origen**: stakeholders, reglas de negocio, documentos previos, y con otros requisitos. Responde "¿de dónde salió esto y quién lo pidió?".

¿Qué es la trazabilidad **post-RS**?::La que enlaza el requisito con lo que se **construyó**: diseño, código y pruebas. Responde "¿se cumplió, y dónde?".

¿Cuál de los dos tramos (pre-RS o post-RS) se hace menos, y por qué duele?::El **pre-RS**. Casi todos hacen post-RS porque lo exigen las pruebas. Sin pre-RS nadie sabe *por qué* existe un requisito, y entonces nadie se anima a eliminarlo aunque ya no sirva.

¿Cuáles son los tres tipos de trazabilidad de uso práctico?::**Hacia adelante** (requisito → diseño → código → prueba), **hacia atrás** (prueba/código → requisito) y **bidireccional** (las dos a la vez).

¿Qué detecta la trazabilidad **hacia adelante**?::Requisitos **huérfanos**: los que se pidieron pero no se implementaron o no se probaron.

¿Qué detecta la trazabilidad **hacia atrás** que la hacia adelante no puede ver?::***Gold plating***: funcionalidad construida que ningún requisito documentado pidió. Es una forma de *scope creep*.

¿Cuántos tipos de trazabilidad hay, tres o cuatro?::Las fuentes difieren. La literatura práctica dice **tres** (forward, backward, bidireccional); Gotel y Finkelstein distinguen **cuatro** combinando dirección y sentido del enlace: *backward-from*, *forward-from*, *backward-to* y *forward-to*. Los cuatro son la versión fina de los dos primeros.

¿Cuáles son los cuatro usos reales de una matriz de trazabilidad?::Análisis de **cobertura** (¿está todo implementado y probado?), análisis de **impacto** (si cambio esto, ¿qué se rompe?), detección de **huecos**, y evidencia de **cumplimiento** ante auditoría.

¿Cuál es el uso que más justifica el costo de mantener la matriz?::El **análisis de impacto**. Sin la matriz, cuando el cliente cambia un requisito la única forma de saber qué se rompe es que alguien se acuerde.

En una matriz de doble entrada requisitos × pruebas, ¿qué significa una **fila vacía**?::Un requisito sin ninguna prueba que lo verifique: un hueco de cobertura.

En una matriz de doble entrada requisitos × pruebas, ¿qué significa una **columna vacía**?::Una prueba que no responde a ningún requisito documentado: indicio de *gold plating*.

¿Cuál es el chequeo mínimo al validar una matriz de trazabilidad?::Que **todo requisito tenga al menos un caso de prueba** asociado.

¿Por qué un ID de requisito no se debe reutilizar ni renumerar?::Porque las referencias a ese ID están repartidas en diseño, código, pruebas y commits. Renumerar las rompe todas de golpe. Si un requisito se elimina, su ID queda muerto.

¿Por qué una matriz desactualizada es peor que no tener matriz?::Porque da **falsa seguridad**: parece demostrar cobertura que en realidad no existe. Si no hay quien la mantenga, es más honesto no empezarla.

¿Qué exige ISO/IEC/IEEE 29148 sobre trazabilidad?::Que cada requisito se pueda rastrear desde su origen —la necesidad del cliente— hasta su implementación y verificación, **e incluso hasta su baja** si deja de ser necesario.

¿Qué exige CMMI sobre trazabilidad?::Trazabilidad **bidireccional**, como práctica del área de gestión de requisitos.

¿Cuál es la cadena de trazabilidad que interesa en un curso de arquitectura?::Requerimiento no funcional → atributo de calidad → táctica arquitectónica → decisión de diseño (estilo o patrón) → vista donde se documenta → evaluación de la arquitectura.

¿Por qué la cadena de trazabilidad de arquitectura no es la misma que la de análisis?::Porque la pregunta del curso de arquitectura no es "¿implementé todo?" sino "¿cómo demuestro que **esta** arquitectura satisface **estos** requerimientos, sobre todo los no funcionales?".

¿Qué significa una táctica arquitectónica sin ningún requerimiento a su izquierda en la matriz?::Que es una decisión que nadie pidió: arquitectura por gusto y no por necesidad. Es el equivalente arquitectónico del *gold plating*.

¿Y un requerimiento sin ninguna táctica a su derecha?::Una promesa que la arquitectura no está cumpliendo, aunque el documento diga que sí.

¿Qué columnas mínimas lleva una matriz de trazabilidad?::ID del requisito, descripción, origen (pre-RS), caso de uso, elemento de diseño, caso de prueba y estado.

¿Qué problema de granularidad arruina una matriz?::Mezclar niveles: si un requisito dice "el sistema gestionará pedidos" y otro dice "el botón será azul", la matriz no sirve para nada.

¿Cómo se logra que la matriz se pueda **regenerar** en vez de transcribirla a mano?::Referenciando el ID del requisito en el commit, en el nombre del caso de prueba y en el comentario del código.
