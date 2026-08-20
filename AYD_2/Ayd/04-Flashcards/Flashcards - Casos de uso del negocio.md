---
tema: Casos de uso del negocio
fuente: "CDU Negocio - Modelado de Drivers RF.pdf"
fecha: 2026-08-19
---

# Flashcards — Casos de uso del negocio

Compatible con el plugin **Spaced Repetition** de Obsidian: cada tarjeta es una línea con la
pregunta, el separador de dos signos de dos puntos, y la respuesta.

#flashcards/casos-de-uso

¿Quién propuso los casos de uso y cómo los definió?::**Ivar Jacobson**. Describen, bajo la forma de **acciones y reacciones**, el comportamiento de un sistema desde el punto de vista del usuario.

¿Qué permiten definir los casos de uso además de la funcionalidad?::Los **límites del sistema** y las relaciones entre el sistema y el entorno.

¿Qué carencia de métodos previos vinieron a cubrir los casos de uso?::La de OMT y Booch en cuanto a la **determinación de requisitos**.

¿Por qué se dice que los casos de uso son accesibles por los usuarios?::Porque están basados en **lenguaje natural**, así que el usuario los puede leer, validar y corregir.

¿En qué dos momentos del ciclo de vida se usan los casos de uso?::En el **modelamiento del negocio** (de ahí salen los CUN) y en la **captura de requisitos** (de ahí salen los casos de uso del sistema).

¿En qué se diferencia un caso de uso de un proceso de un DFD?::El CU expresa la funcionalidad mediante la **interacción actores–sistema** (visión externa); el proceso de DFD la expresa como **transformación de flujos de entrada en flujos de salida** y puede mostrar descomposición funcional interna.

¿Qué describe el Modelo de Casos de Uso del Negocio?::Los **procesos de un negocio**, vinculados al campo de acción, y cómo se benefician e interactúan los socios y clientes en esos procesos.

¿Cuáles son los dos estereotipos del modelo de CUN?::**Actor del negocio** (monigote) y **caso de uso del negocio** (elipse), unidos por una **asociación** que significa que el actor envía y/o recibe mensajes.

¿Qué es un actor del negocio?::El **rol** que alguien o algo juega cuando interactúa con el negocio para beneficiarse de sus resultados. Rol = Actor: no es una persona específica.

Nombrá candidatos a actor del negocio.::Clientes o potenciales clientes, socios, proveedores, autoridades, propietarios, **sistemas de información externos** al negocio, y otras partes de la organización si ésta es grande.

¿Cuál es la regla que decide si algo es actor del negocio?::Que modele algo que está **fuera** del negocio. Lo que está adentro son los trabajadores y entidades de negocio, que van en las realizaciones de CUN.

¿Qué es un proceso de negocio?::Grupo de tareas lógicamente relacionadas que se llevan a cabo en una determinada secuencia y manera, y que emplean los recursos de la organización para dar resultados en apoyo a sus objetivos.

¿Qué es un Caso de Uso del Negocio (CUN)?::Una secuencia de acciones, realizadas en el negocio, que producen un **resultado de valor observable** para ciertos actores del negocio. Desde la perspectiva de un actor individual, define un flujo de trabajo **completo**.

¿Cuál es la relación entre un CUN y un proceso de negocio?::Uno a uno: **un CUN representa a un proceso de negocio**.

¿Puede un CUN no tener ningún actor asociado?::**Sí**, es posible que un caso de uso **de apoyo** no interactúe con ningún actor. En cambio, cada **actor** sí debe involucrarse con al menos un caso de uso.

¿Cuáles son las tres técnicas para identificar los procesos del negocio?::**Clasificación** (núcleo, soporte, gerenciales), **agrupamiento de actividades** (por función) y **objetivos** (objetivos estratégicos → subobjetivos → procesos).

¿Qué es una **función** y por qué no es un CUN?::Un grupo funcional que responde a un objetivo de la organización y puede involucrar varias áreas. **Agrupa** varios procesos de negocio; los CUN son los procesos, no la función.

¿Qué es la relación de inclusión `<include>`?::Una relación que especifica un comportamiento que se **inserta explícitamente** dentro del CU base. El workflow del proceso entero está en el CU base **más** el (los) CU incluido(s).

¿Cuándo se justifica un `<include>`?::Cuando el comportamiento incluido **se puede reusar** en otros CUN, **o** cuando **simplifica la comprensión** del caso de uso base. Basta con uno de los dos criterios.

¿Qué es la relación de extensión `<extend>`?::La que modela una **conducta opcional u optativa** encontrada después de definir el workflow del CUN base: un subflujo complejo o raro, o flujos distintos según la selección del actor.

¿Cómo distingo rápido `<include>` de `<extend>`?::Preguntate si **siempre ocurre**: si sí, es `include`; si es solo a veces o bajo condiciones, es `extend`. O tapá el CU secundario: si el base queda incompleto era `include`; si se sigue entendiendo, era `extend`.

¿Para qué se usa la generalización-especialización entre casos de uso?::Para mostrar workflows que comparten **estructura, propósito y comportamiento**: un CU padre se especifica en uno o más CU hijos, y así no se describe el mismo flujo varias veces.

¿Cuándo se recomienda usar generalización-especialización?::Cuando se puede afirmar que constituyen **tipos de procesos**: tienen comportamiento **similar** pero con **diferencias sustanciales** que los hacen CUN diferentes.

¿Cómo se modela que varios actores juegan el mismo rol en un CUN?::El rol compartido se modela como el **actor del cual heredan** los actores con roles compartidos; los hijos solo se representan si interactúan como actor con otro CUN.

¿Qué muestran las realizaciones de CUN y con qué se documentan?::Cómo colaboran los **trabajadores y entidades de negocio** para ejecutar el proceso. Se documentan con diagramas de actividad, descripción textual, diagramas de clases y diagramas de secuencia.

¿Qué secciones tiene la descripción textual de un caso de uso?::Nombre, actores, propósito, resumen, flujo de trabajo (básico/normal y curso alterno), otras secciones, prioridad y mejoras.

¿Qué diferencia hay entre un **curso alterno** y un `<extend>`?::El curso alterno es la variante contada **en el texto del mismo caso de uso**; el `<extend>` es cuando esa variante se saca a un **caso de uso propio** por ser compleja o rara.
