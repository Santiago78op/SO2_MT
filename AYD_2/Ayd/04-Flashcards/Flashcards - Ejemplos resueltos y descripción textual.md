---
tema: Casos de uso del negocio
fuente: "Presentación de clase — capturas del 19/08/2026 (MBA. MSc. Claudia Rojas de Morán). NÚCLEO."
fecha: 2026-08-19
---

# Flashcards — Ejemplos resueltos y descripción textual

Compatible con el plugin **Spaced Repetition** de Obsidian: cada tarjeta es una línea con la
pregunta, el separador de dos signos de dos puntos, y la respuesta.

Salen de [[Ejemplos resueltos de casos de negocio]] y [[Descripción textual de casos de uso]].
**Todas de clase.**

#flashcards/casos-de-uso

¿Cuáles son los tres casos que resolvió completos en clase?::**Tienda Electrónica**, **Fábrica de Materiales para Construcción** y **Hospital**.

¿Cuántas elipses tiene un diagrama **core** en los tres ejemplos?::**Una sola**, y nombra el negocio o sistema completo: *Sistema de Ventas on line Tienda X*, *Gestión de la Producción de Productos de Construcción*, *Sistema Hospitalario*.

¿Cuántos procesos tiene la primera descomposición en los ejemplos de clase?::**Cinco**, en los dos casos donde la mostró (Tienda Electrónica y Fábrica de Materiales).

En la Fábrica, los actores pasan de **3** en el core a **6** en la descomposición. ¿Es un error?::**No.** Al abrir los procesos aparecen contrapartes que estaban implícitas (Banco, Contabilidad, Transporte, Ventas). Lo que **no** puede pasar es que **desaparezca** un actor que sí estaba en el core.

¿Qué patrón de nombres usa para los cinco procesos de la Fábrica y de dónde sale?::**"Gestión de X"**, donde las X son las **etapas del ciclo de vida del material**: suministros → materia prima → producto en proceso → producto terminado → venta/alquiler.

¿Cómo se aplica ese patrón a FarmaHosp?::Nombrando los procesos según las **6 etapas del ciclo de vida del medicamento** que da el enunciado: adquisición, almacenamiento, prescripción, dispensación, administración, seguimiento y farmacovigilancia. Así la cobertura del enunciado queda demostrada.

¿Qué patrón usa el expandido de la Fábrica, y por qué **no** sirve para FarmaHosp?::Usa **CRUD**: cada proceso `«include»` *Añadir / consultar / modificar / eliminar*. No sirve porque FarmaHosp es de **flujo** (recibir lote → controlar temperatura → validar prescripción → asignar lote → escanear), no de mantenimiento de tablas. El patrón útil es el de *Procesamiento de Pedido*.

En el ejemplo del Hospital, ¿qué actores rodean al *Sistema Hospitalario*?::**Paciente**, **Encamamiento** y **Farmacia**.

¿Qué resuelve el ejemplo del Hospital para FarmaHosp?::Que **las áreas del hospital son ACTORES**, no procesos: *Farmacia* y *Encamamiento* son actores del *Sistema Hospitalario*. Los individuos (médico, farmacéutico, enfermero) van como **trabajadores** en las realizaciones.

En la generalización entre actores del ejemplo del Hospital, ¿qué CUN se queda cada uno?::El **padre** (*Cliente*) se queda el CUN **compartido** (*Despachar medicamentos en farmacia*); cada **hijo** se queda el suyo: *Administrador Consulta Externa* → *Asignar citas*, *Administrador Hospitalización* → *Asignar camas*.

¿Cuáles son las **dos** convenciones de ID en el material de clase?::`CU_0n Nombre` (guion **bajo**, dos dígitos) en sus diapositivas; y `CU-0nn` / `RFG-0nn` con prefijo de paquete (guion **medio**, tres dígitos) en la NT1. Hay que elegir una y **declararla**.

Si vas a entregar matrices de trazabilidad, ¿qué convención de ID conviene?::La de la **NT1** (`CU-0nn`, `RFG-0nn`), porque es la que aparece en la **plantilla obligatoria** de la matriz.

¿Por qué en el diagrama expandido con IDs hay casos de uso **sin actor**?::Porque están conectados por `«extend»` o `«include»` a otro caso de uso, no por asociación a un actor. Es la excepción de los convenios del diagrama de CUN.

¿Cuáles son los campos de la descripción textual, según la lista de clase?::**Nombre** del CUN, **actores**, **propósito**, **resumen**, **flujo de trabajo** (Básico/normal y Curso Alterno), **otras secciones**, **Prioridad** y **Mejoras**.

¿Cuál es la fórmula del **Resumen** en el ejemplo de clase?::**"Se inicia cuando … / \[qué hace\] / finaliza cuando …"**. Tres piezas en un párrafo.

¿Cómo se estructura el **CURSO NORMAL DE EVENTOS**?::En **dos columnas**: *"Acción del actor"* y *"Respuesta del proceso de negocio"*.

¿La numeración de los pasos es una o dos secuencias?::**Una sola secuencia**, repartida entre las dos columnas según quién actúa. En el ejemplo: paso 1 a la izquierda, pasos 2–8 a la derecha, paso 9 vuelve a la izquierda.

¿Cómo se escriben las bifurcaciones dentro del curso normal?::Dentro del texto del paso: *"Si el pedido o parte de éste es aceptado **pasar a 6**"*, *"si el pedido es rechazado **pasar a 8**"*.

¿Por qué la segunda columna se llama "Respuesta del **proceso de negocio**" y no "del sistema"?::Porque ahí aparecen los **trabajadores del negocio** — el Comercial, el Jefe Técnico, el Jefe de Producción. Ninguno es actor: todos están **adentro** del negocio.

¿Cómo se indexa un **curso alterno**?::Por número de línea del curso normal: **"En la línea 4"**. Eso hace la ficha navegable.

¿Qué se hace cuando la variante de un curso alterno es larga?::Se manda a una **sección aparte**: *"Ver Sección Aceptar Producto Especial"*. Mismo principio que `«extend»`, pero dentro del texto.

¿Qué son las "Otras secciones" de la ficha?::Bloques con **nombre propio** (*Aceptar Producto Especial*, *Rechazar Producto Especial*) y sus propios pasos numerados desde 1, a los que remiten los cursos alternos.

Hay dos plantillas de descripción textual en el material de clase. ¿Cuál usar y por qué?::La de ***Atender pedido*** (Nombre, Actores, Propósito, Resumen, curso normal en dos columnas, Cursos alternos, Prioridad, Mejoras, Otras secciones): es la que coincide con la lista de campos que dictó y **la única que mostró resuelta**.

¿Para qué sirve entonces la otra plantilla?::Para **sacarle campos extra** si piden más rigor — sobre todo **Rendimiento**, **Frecuencia**, **Importancia** y **Urgencia**, que son los que enganchan con los drivers de calidad.

¿Con qué cuatro artefactos se documentan las **realizaciones de CUN**?::**Diagramas de actividad**, **descripción textual**, **diagramas de clases** y **diagramas de secuencia**.
