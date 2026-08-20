---
tema: Casos de uso del negocio
fuente: "Presentación de clase — capturas del 19/08/2026 (MBA. MSc. Claudia Rojas de Morán). NÚCLEO."
fecha: 2026-08-19
---

# Flashcards — CUN, convenios y método de diseño

Compatible con el plugin **Spaced Repetition** de Obsidian: cada tarjeta es una línea con la
pregunta, el separador de dos signos de dos puntos, y la respuesta.

Salen de [[Convenios del diagrama de CUN]], [[Método de diseño centrado en la arquitectura]],
[[Guía - Caso de negocio]] y [[Descripción textual de casos de uso]]. **Todas de clase.**

#flashcards/casos-de-uso

¿Cuál es el **paso 0** del método de diseño centrado en la arquitectura?::**Creación del caso de negocio.** Va en rojo y **fuera** del diagrama de las ocho etapas: no es una etapa del método, es lo que existe antes de que el método arranque.

Nombrá las **ocho etapas** del método de diseño centrado en la arquitectura.::1) Identificación de **drivers arquitectónicos**. 2) Especificación del **alcance** del proyecto. 3) **Creación o refinamiento** de la arquitectura. 4) **Revisión** de la arquitectura. 5) **Decisión** de llevar o no la arquitectura a producción. 6) **Experimentación**. 7) **Planeación** de la implementación. 8) **Implementación**.

¿Cuáles son las **cuatro fases** del método y qué etapas caen en cada una?::**Requerimientos** (1–2), **diseño/refinamiento** (3–4), **experimentación** (5–6) y **producción** (7–8).

¿Qué significa el lazo "Refinar" de la etapa 2 a la 1?::Que al fijar el **alcance** aparecen drivers nuevos o se caen algunos: **el alcance y los drivers se ajustan mutuamente**.

¿Qué significa el lazo "Refinar" de la etapa 6 a la 3?::Que la **experimentación descubre que el diseño no sirve** y hay que volver a crear o refinar la arquitectura.

En la etapa 5 (decisión de llevar a producción), ¿a dónde va cada salida?::**"Sí llevar"** salta directo a la etapa **7 (planeación de la implementación)**. **"No llevar"** baja a la etapa **6 (experimentación)**, y de ahí se vuelve a la 3.

¿Por qué la experimentación no es un paso obligatorio del método?::Porque es **la salida del "todavía no"**: si la arquitectura no convence en la etapa 5, en vez de construirla se prueba en chico y se rediseña. Es decisión bajo incertidumbre guiada por el riesgo.

¿Qué partes del método cubre la rúbrica del Caso 1?::El **paso 0** (caso de negocio y stakeholders) y la **etapa 1** (drivers y su priorización). No pide diseñar la arquitectura: pide tener listos los **insumos** para diseñarla.

¿Cómo se distingue gráficamente un **actor del negocio** de un actor de sistema?::El actor del negocio lleva una **barra diagonal cruzando la cabeza**. El CUN lleva una **barra diagonal en el borde derecho** de la elipse. Sin la diagonal, es un caso de uso del **sistema**.

¿Con cuántos actores puede asociarse un caso de uso?::Con **uno o más**.

¿Qué pasa si un CU no se comunica con ningún actor?::**Hay error en el modelo**, con dos excepciones: 1) es un **CU hijo** en generalización/especialización y el **padre** describe toda la comunicación; 2) es un **CU de apoyo** (el incluido por particionamiento).

¿Qué indica la **navegabilidad** en el diagrama de CUN?::**Quién inicia la comunicación.** Se muestra con una flecha.

Si la flecha apunta al CUN, ¿quién inicia? ¿Y si apunta al actor?::Si apunta al **CUN**, inicia el **actor**. Si apunta al **actor**, inicia el **CUN**.

¿Cómo se dibuja una relación en los **dos sentidos**?::**Sin saetas** — una línea sin puntas de flecha. Una línea sin flecha no significa "no sé": significa "en los dos sentidos".

¿Hay que dibujar el mensaje de respuesta en el diagrama de CUN?::**No.** "Por cada flecha de comunicación **se asume un mensaje de retorno**".

¿Qué advierte la clase que NO hay que confundir con la navegabilidad?::Los **flujos de datos**. "La navegabilidad **solo indica relación de iniciación**."

¿Cuál es el convenio sobre qué flechas se dibujan siempre?::La **flecha de iniciación del actor al CUN siempre se muestra**, aún si más tarde el CU inicia comunicación con ese actor — en ese caso **solo** se pone la flecha del actor al CUN. **El resto puede omitirse**, e incluirse solo para esclarecer el diagrama.

¿Cuáles son los dos usos de `«include»` que distingue la clase?::**REUTILIZAR** (varios CU base comparten el incluido) y **PARTICIONAR** (un solo CU base, se parte para simplificar).

¿Cuál es la señal de `«include»` por **reutilizar**? Dá el ejemplo de clase.::Que **dos o más** casos base lo incluyen. Ejemplo de aduana: *Check-In Individual* (Pasajero) y *Check-In de Grupo* (Guía de turismo) ambos incluyen *Manipular Equipaje*.

¿Cuál es la señal de `«include»` por **particionar**? Dá el ejemplo de clase.::Que lo usa **uno solo**, y se saca aparte para simplificar. Ejemplo de empresa de servicios: *Venta de producto* incluye *Verificar política de descuento* — y la diapositiva anota que **"es un CU de apoyo que no se relaciona con actores"**.

¿Cuál es la prueba de una palabra para elegir entre `«include»` y `«extend»`?::`«include»` = **"siempre pasa"**. `«extend»` = **"solo a veces pasa"**. En el ejemplo de aduana: todo check-in manipula equipaje (include), pero *"solo para algunos pasajeros hay que ir al counter de equipaje especial"* (extend).

¿En qué dirección va la flecha en `«include»` y en `«extend»`?::En `«include»` va **del base al incluido**. En `«extend»` va **del extensor al base** — al revés.

¿Cuántos CUN tiene el diagrama **Core** y qué nombra?::**Uno solo**, y nombra **el negocio completo**. En el ejemplo: *"Sistema de Ventas on line Tienda X"*, con seis actores alrededor (Contabilidad, Ventas, Cliente, Almacén, Transporte, Banco).

¿La **primera descomposición** es un diagrama o uno por proceso?::**Un solo diagrama** con todos los procesos como CUN, conservando **el mismo juego de actores** del core.

¿Qué relación hay entre el diagrama Core y la primera descomposición?::La descomposición **abre la única elipse del core en N procesos**, conservando los mismos actores. Si aparece o desaparece un actor, hay inconsistencia.

Nombrá los cinco procesos de la primera descomposición de la Tienda Electrónica.::**Procesamiento de Pedidos**, **Gestión de Inventario**, **Pagos**, **Envío** y **Soporte al Cliente**.

¿Cómo debe nombrarse un CDU y qué formas sirven?::Debe expresar **qué sucede** al ejecutarse, en forma activa: **sustantivo derivado de verbo** + complemento (*chequeo de equipaje*, *gestión de inventario*) **o verbo** + complemento (*chequear equipaje*). Un sustantivo de cosa (*Inventario*, *Préstamos*) **no sirve**.

¿Cuál es la prueba para saber si el nombre de un CDU sirve?::**¿Se puede convertir en verbo sin cambiar el sentido?** *Gestión de inventario* → *gestionar el inventario* ✅. *Inventario* → no hay verbo ❌.

En el CU expandido *Procesamiento de Pedido*, ¿qué muestra que la inclusión **anida**?::Que *Pedido* incluye *Mostrar productos*, y *Mostrar productos* a su vez incluye *Verificar stock*. Un CU incluido puede incluir otro.

En ese mismo ejemplo, ¿qué hace *Pedido compuesto*?::**Extiende** a *Pedido* (`«extends»`, flecha hacia el base) **y además incluye** *Agrupar pedido*. Un CU extensor también puede incluir: las relaciones se combinan.

Nombrá los campos de la plantilla de descripción textual.::**Identificador** y **nombre descriptivo**, **Descripción**, **Secuencia Normal** (Paso/Acción, con sub-pasos 2a, 2b…), **Excepciones** (Paso/Acción), **Rendimiento**, **Frecuencia**, **Importancia**, **Urgencia**, **Comentarios**.

¿Cuáles son los valores posibles de **Importancia** y de **Urgencia**?::**Importancia**: {vital, importante, quedaría bien}. **Urgencia**: {inmediatamente, hay presión, puede esperar}. Son escalas **cerradas**.

¿Cuál es la diferencia entre importancia y urgencia?::La **importancia** es cuánto vale; la **urgencia** es cuándo se necesita. Algo puede ser *vital* y a la vez *puede esperar*.

¿Por qué los campos Rendimiento, Frecuencia, Importancia y Urgencia enganchan con la arquitectura?::Porque no dicen *qué* hace el caso de uso sino **cómo de bien** y **cuánto pesa**: **Rendimiento** con su cota de tiempo es un driver de calidad; **Frecuencia** es el volumen que sostiene los escenarios de carga; **Importancia** y **Urgencia** son los ejes de priorización.
