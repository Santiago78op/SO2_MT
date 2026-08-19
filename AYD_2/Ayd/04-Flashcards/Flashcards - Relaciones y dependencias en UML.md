---
tema: Arquitectura de software
fuente: "COMPLEMENTO — docs.staruml.io + Garland & Anthony + Reynoso + verificación propia"
fecha: 2026-08-19
---

# Flashcards — Relaciones y dependencias en UML

Formato `pregunta::respuesta`, compatible con el plugin **Spaced Repetition** de Obsidian.

Salen de [[Relaciones y dependencias en UML]], que es **complemento**: las presentaciones nombran la
dependencia como concepto pero no explican su notación.

#flashcards/uml-relaciones

¿Qué comunica la **punta** de una flecha UML y qué comunica el **trazo**?::La **punta** dice qué tipo de relación es (triángulo = es-un, punta abierta = usa, rombo = es-parte-de). El **trazo** dice qué tan fuerte es el vínculo: **llena** = estructural, **punteada** = débil o de dependencia.

¿Cómo se dibuja una **generalización**?::Línea **llena** con triángulo **hueco**, del elemento **específico** al **general**. Significa "el hijo es un tipo de padre". En Mermaid: `--|>`.

¿Cómo se dibuja una **realización**?::Línea **punteada** con triángulo **hueco**, del elemento que implementa hacia la **interfaz**. Significa "cumplo este contrato". En Mermaid: `..|>`.

¿Cómo se dibuja una **dependencia** y hacia dónde apunta?::Línea **punteada** con punta **abierta**, del **cliente** al **proveedor**: la flecha sale del que depende. En Mermaid: `..>`.

¿Qué significa una dependencia?::Que si cambia el proveedor, puede que haya que cambiar el cliente. Es un vínculo **débil**: el cliente usa al proveedor en algún momento pero no guarda una referencia estructural.

¿Cuál es el criterio práctico para distinguir **dependencia** de **asociación**?::¿Hay una referencia guardada, estructural? Es **asociación** (línea llena). ¿Solo lo usa y lo suelta —lo recibe por parámetro, lo instancia y lo descarta—? Es **dependencia** (punteada).

¿En qué se diferencian **agregación** y **composición**?::Solo en el **relleno del rombo**, y eso define el ciclo de vida. Agregación: rombo **hueco**, la parte **sobrevive** al todo. Composición: rombo **macizo**, la parte **muere** con el todo.

¿Dónde va el rombo de una agregación o composición?::Siempre en el **todo**, nunca en la parte.

Dá un ejemplo de agregación y uno de composición.::**Agregación**: un Departamento agrupa Empleados — si cierra el departamento, los empleados siguen existiendo. **Composición**: un Pedido compone LíneaPedido — si se borra el pedido, sus líneas no tienen sentido.

Según StarUML, ¿cómo se definen agregación y composición?::Como **asociaciones** cuya propiedad `aggregation` vale `shared` (agregación) o `composite` (composición). Son la misma relación con una propiedad distinta.

¿Por qué `«include»`, `«extend»` y `«deploy»` se dibujan **punteadas**?::Porque las tres son **dependencias estereotipadas**, no relaciones estructurales. El estereotipo de UML se aplica tanto a clases como a relaciones.

En un `«include»`, ¿quién es el cliente y quién el proveedor?::El cliente es el **CU base** (depende del incluido: sin él su flujo queda incompleto) y el proveedor es el **CU incluido**. La flecha va base → incluido.

En un `«extend»`, ¿quién es el cliente?::La **extensión**: necesita saber a quién y en qué punto se engancha. El base no sabe que lo extienden. La flecha va extensión → base.

En un `«deploy»`, ¿hacia dónde apunta la flecha?::Del **artefacto** al **nodo**: el artefacto depende del nodo donde se despliega.

¿La generalización entre casos de uso es una dependencia?::**No.** Es un "es-un", igual que entre clases: línea **llena** con triángulo. Solo `include`, `extend` y `deploy` son dependencias.

En la matriz de dependencias, ¿a qué corresponden la **cola** y la **punta** de la flecha?::La **cola** es la **fila** (el que depende) y la **punta** es la **columna** (de quien depende). La matriz se lee "fila depende de columna".

¿Por qué el diagrama y la matriz de dependencias son intercambiables?::Porque representan la misma relación. Con el diagrama se llena la matriz leyendo flechas; con la matriz se dibuja el diagrama leyendo marcas.

¿Qué detecta la matriz que el diagrama esconde?::Los **ciclos**. En un diagrama de veinte requisitos un ciclo es invisible; en la matriz salta. También los requisitos críticos (columna poblada) y frágiles (fila poblada).

¿Qué dos relaciones dibuja **Mermaid** de forma indistinguible y por qué es grave?::**Agregación y composición**: Mermaid dibuja los dos rombos **macizos**, y en UML la única diferencia entre ellas es el relleno. Nadie puede saber a simple vista si la parte sobrevive al todo.

¿Qué sí respeta Mermaid correctamente?::El **trazo**: línea llena para generalización, asociación, agregación y composición; punteada para realización y dependencia.

Si hiciste un diagrama de clases en Mermaid con agregación y composición, ¿qué tenés que hacer?::Aclararlo **por escrito**, porque el dibujo no lo va a mostrar. Y para el entregable formal, redibujarlo en StarUML, que sí respeta la notación.

¿Cómo se dibuja una relación **bidireccional**?::Sin puntas. Poner punta en las dos direcciones es un error.
