---
tema: Arquitectura de software
fuente: "Presentación de clase — capturas del 19/08/2026 (MBA. MSc. Claudia Rojas de Morán). NÚCLEO."
fecha: 2026-08-19
---

# Flashcards — Drivers arquitectónicos y diagrama de contexto

Compatible con el plugin **Spaced Repetition** de Obsidian: cada tarjeta es una línea con la
pregunta, el separador de dos signos de dos puntos, y la respuesta.

Salen de [[Drivers arquitectónicos]], [[Diagrama de contexto]], [[Categorías de estructuras]] y
[[Proceso de diseño arquitectónico]]. **Todas son de clase** — sin complemento.

#flashcards/arquitectura

Dá la definición de **driver arquitectónico** de la clase.::Son los **factores críticos que guían el diseño** de un sistema de software. **Determinan su estructura fundamental** y definen si será un **éxito o un fracaso**. Actúan como el **puente entre los requerimientos del negocio y la implementación técnica**.

¿Cuáles son los **tres tipos** de driver arquitectónico?::**RF** (requisitos funcionales), **de calidad** y **de restricción**.

¿Un driver es un RF?::Un RF es **uno de los tres tipos** de driver, no el driver. La clase titula la diapositiva *"Drivers Arquitectónicos: RF – Requisitos Funcionales"*, con el calificativo puesto — igual que la rúbrica.

¿Todo requisito es un driver?::**No.** La definición dice "factores **críticos**". El filtro es estructural: si el requisito cambia y hay que cambiar la estructura, es driver.

¿Qué son los **drivers RF** según la clase?::**Funcionalidades específicas que moldean la estructura del sistema.** La palabra clave es "moldean": no es cualquier funcionalidad, es la que le da forma a la estructura.

¿Cuál es el formato de redacción de un driver RF en la clase?::`RFn - Nombre corto: enunciado`. El nombre corto es una frase nominal (*"Procesamiento de pagos"*) y el enunciado dice qué debe hacer el sistema.

¿Qué definen los **drivers de calidad**?::**Cómo debe comportarse el sistema.**

Nombrá los **siete** atributos de la diapositiva de drivers de calidad.::**Rendimiento** (performance), **Escalabilidad**, **Disponibilidad**, **Seguridad**, **Mantenibilidad**, **Usabilidad** y **Fiabilidad**.

¿Por qué la **funcionalidad** no aparece en la lista de drivers de calidad?::Porque en el modelo de drivers la funcionalidad ya tiene su propia categoría: los **drivers RF**.

¿Qué dos atributos suben a primer nivel respecto de ISO 9126, y por qué tiene sentido?::**Seguridad** (que en 9126 es subcaracterística de funcionalidad) y **Disponibilidad** (que es subcaracterística de fiabilidad). Tiene sentido porque es lo mismo que hacen ISO 25010 y el SAIP.

¿Qué tienen en común **todos** los ejemplos de drivers de calidad de la clase?::**Todos llevan un número.** 300 ms, 10,000 peticiones, 99.99 %, AES-256, TLS 1.3, 80 % de cobertura, 2 días-persona, 3 clics, WCAG 2.1 AA. Un driver de calidad sin número no es driver, es un deseo.

Dá dos ejemplos de driver de **rendimiento** de la clase.::Las consultas de búsqueda deben responder en **menos de 300 ms (percentil 95)**. El sistema debe soportar **10,000 peticiones simultáneas**.

¿Cómo define la clase un driver de **escalabilidad**?::Debe crecer **horizontalmente** (añadir nodos) al aumentar la carga **sin rediseño**.

¿Qué son los **drivers de restricción**?::**Condiciones impuestas externamente que limitan las decisiones arquitectónicas.** Dos palabras clave: *externamente* (no las elegís) y *limitan* (te quitan alternativas).

Nombrá las **seis categorías** de drivers de restricción.::**Tecnológicas**, **Regulatorias/legales**, **De negocio/presupuesto**, **Organizacionales**, **Ambientales/físicas** y **De integración**.

Dá un ejemplo de restricción **organizacional** de la clase.::*"El equipo de operaciones solo conoce Kubernetes"* o *"toda la comunicación entre servicios debe usar REST/HTTP (no se permite gRPC por falta de expertise)"*. La capacidad del equipo es una restricción arquitectónica.

Dá un ejemplo de restricción **ambiental / física**.::*"Dispositivo IoT con batería limitada (consumo energético máximo 100 mW en modo activo)"* o *"tamaño de pantalla mínimo 7 pulgadas"*.

*"El sistema debe permitir dispensaciones offline por al menos 4 horas."* ¿RF o driver de calidad?::**De calidad** — de **disponibilidad**. La funcionalidad *dispensar* ya existe como RF; este enunciado **califica** cómo debe comportarse cuando falla la red. Regla: si califica una funcionalidad existente es de calidad; si agrega funcionalidad nueva es RF.

¿Cuáles son los **tres símbolos** del diagrama de contexto?::**Elipse** = El Producto · **Rectángulo** = Entidades o agentes · **Flecha** = Streamlines.

¿Qué es un *streamline*?::El **flujo de información** entre el producto y una entidad externa, en el diagrama de contexto. Se dibuja como flecha y **siempre lleva nombre**.

¿Qué va en el óvalo del diagrama de contexto?::**El Producto** — el sistema que se está construyendo. Uno solo, y nombra un **sistema**, no un negocio ni un proceso.

En el ejemplo de la biblioteca, ¿por qué el *Bibliotecario* es una entidad externa si trabaja en la biblioteca?::Porque el producto es el **software** (*"Sistema de préstamos y devoluciones de la biblioteca"*), no la biblioteca. Frente al **sistema** el bibliotecario es un agente externo.

¿Cómo se dibuja un flujo bidireccional en el diagrama de contexto?::Con **dos flechas separadas**, cada una con su propio nombre — no con una flecha de doble punta.

¿Los nombres de los streamlines son verbos o sustantivos?::**Sustantivos.** En el ejemplo de clase: *Lista de préstamos*, *Devolución de libros*, *Información de inventario*, *pedido de compra*, *Mantenimiento de información*.

Dá dos razones por las que el diagrama de contexto va antes que todo lo demás.::1) **Define el límite**: sin decidir qué es el producto y qué es externo no se puede decidir si alguien es actor o trabajador. 2) **Cada entidad es candidato a stakeholder**, así que es un barrido gratis para el criterio 2.

Nombrá las **tres categorías de estructuras**.::**Módulos** (unidades de código o datos que se construyen o adquieren) · **Componentes y conectores** (comportamiento en tiempo de ejecución e interacciones) · **Asignación** (relación con lo que no es software en el entorno).

¿Qué muestran las estructuras de **asignación**? Dá cuatro ejemplos.::Cómo se relaciona el sistema con las estructuras que **no son de software** en su entorno: **CPU**, **sistemas de archivos**, **redes** y **equipos de desarrollo**.

¿Por qué "equipos de desarrollo" cae en la categoría de **asignación**?::Porque **quién construye qué** es parte de la arquitectura: es la estructura de asignación de trabajo. Es la base de la ley de Conway.

¿Qué significa que un módulo se pueda "construir o **adquirir**"?::Que una librería o un producto COTS que se **compra** también es un módulo de la arquitectura. Decidir *build vs. buy* es una decisión arquitectónica.

Nombrá los **siete pasos** para la definición de una arquitectura de software.::1) Creación del **caso de negocio**. 2) **Entendimiento de los requisitos**. 3) **Creación y selección** de la arquitectura. 4) **Documentación y comunicación**. 5) **Análisis o evaluación**. 6) **Implementación** del sistema basado en la arquitectura. 7) **Aseguramiento** de que la implementación esté acorde a la arquitectura.

¿Por qué el paso 7 (aseguramiento) es distinto del paso 6 (implementación)?::Porque es la **conformidad**: verificar que lo construido sea lo diseñado. Sin ese paso, la arquitectura documentada y el sistema real se separan, y ahí empieza la deuda arquitectónica.

¿Qué estereotipo usa la clase entre las etapas del ciclo de definición, y qué significa?::**`«precede»`** — precedencia **temporal**: "esto va antes que aquello". No confundir con `«include»` ni `«extend»`, que son relaciones de casos de uso.

¿Cuáles son las cinco etapas del ciclo `«precede»`?::**REQUERIMIENTOS → DISEÑO → DOCUMENTACIÓN → EVALUACIÓN → IMPLEMENTACIÓN**, y desde implementación vuelve a requerimientos. Todas "de la arquitectura".

En el *Flujo de Definición* de Ambler, ¿las actividades son secuenciales o concurrentes?::**Concurrentes.** Hay un *fork/join* (las barras gruesas): definir requisitos, definir la arquitectura de referencia y **dar soporte a los equipos de proyecto** ocurren al mismo tiempo.

¿Qué significa la guarda `[initial effort]` del Flujo de Definición?::Que la **arquitectura candidata** solo se define en el **esfuerzo inicial**; en las vueltas siguientes se va directo a **refinar la arquitectura empresarial**. La candidata es un artefacto de arranque, no de cada iteración.

Diferenciá arquitectura **candidata**, **de referencia** y **empresarial**.::**Candidata**: la primera propuesta, de este proyecto y primera vuelta, todavía por validar. **De referencia**: patrón reutilizable entre varios proyectos, más estable. **Empresarial**: la de toda la organización, que cada proyecto refina.

¿Cómo define la diapositiva "Resumen" la arquitectura de software?::"El **conjunto de estructuras necesarias para razonar sobre el sistema**, que comprende **elementos de software**, **relaciones entre ellos** y **propiedades de ambos**."

Según esa misma diapositiva, ¿qué es una **estructura** y qué es una **vista**?::**Estructura**: un conjunto de elementos y las relaciones entre ellos. **Vista**: una representación de un conjunto **coherente** de elementos arquitectónicos, según lo escrito y leído por los interesados; es representación de **una o más estructuras**.

¿Qué agrega la frase "para razonar sobre el sistema" a la definición?::Que la arquitectura tiene una **finalidad**: permitir razonar. No es un dibujo, es un **instrumento de análisis**.
