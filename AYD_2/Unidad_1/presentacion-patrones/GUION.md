# Guion de defensa — Patrones de diseño, AutoRent Express S.A.

> Esto NO es la diapositiva. Es tu chuleta para defender la práctica: qué decir, qué apretar en vivo,
> qué responder si preguntan. Las diapositivas están escritas para la audiencia; este documento está
> escrito para vos, en 2ª persona, como notas de director.
> **Regla de oro: la diapositiva es el respaldo visual, no el libreto. Si te limitás a leerla, el
> auxiliar lo nota.**

---

## Antes de empezar

**Cómo abrís la presentación:** doble clic en `index.html` (carpeta `presentacion-patrones/`).
No necesita servidor ni internet. Navegación: flechas ← → o los botones de abajo; botón ◐ arriba a la
derecha para tema claro/oscuro. Desde el índice saltás a cada sección con un clic; desde cualquier
sección, «⌂ Índice» te regresa.

**Duración total estimada: ~16 min** de contenido + preguntas. Si te dan menos, mirá el plan de recorte
al final de este documento.

**Qué preparar antes de arrancar:**

1. **Probá el proyector antes.** El tema oscuro se ve bien en pantalla pero en algunos proyectores
   viejos el contraste se lava. Si el aula tiene mucha luz, apretá ◐ y presentá en **tema claro**.
2. **Tené el proyecto abierto en el editor**, en una segunda ventana, con estos cuatro archivos ya en
   pestañas: `reservas/estados.py`, `reservas/calculos.py`, `reservas/models.py`, `reservas/views.py`.
   Si el auxiliar pide ver el código real, no querés estar buscando carpetas en vivo.
3. **Probá las tres demos una vez** antes de entrar. Son botones, no hay riesgo, pero conviene que
   tengas el pulso de cuánto tarda cada animación (~1 segundo) para no hablar encima.
4. Si el equipo expone en grupo, **decidan quién dice qué** antes. La transición más natural es una
   persona por patrón.

**Los tres números que tenés que tener en la punta de la lengua:**
- **3** patrones: State, Strategy, Factory Method.
- **6** estados de la reserva: SOLICITADA, PROPUESTA, ACEPTADA, RECHAZADA, EN_RENTA, FINALIZADA.
- **0** condicionales sobre el estado en la clase `Reserva`. Ese cero es tu mejor argumento.

---

## Apertura — el índice (~1 min)

**Objetivo:** que en 60 segundos sepan qué vas a defender y por qué esos tres patrones y no otros.

**Qué decir (no leas las tarjetas):**

> «El enunciado nos pedía elegir un framework y un patrón de diseño. Elegimos Django con PostgreSQL,
> y terminamos implementando tres patrones, no uno — porque el dominio nos los pidió.
> El problema difícil de AutoRent no es listar carros: es el ida y vuelta entre el cliente y el
> agente para cerrar una renta, y el precio, que depende del plan. De ahí salieron los tres.»

Señalá con el mouse las tres tarjetas mientras las nombrás, sin leerlas.

**El gancho, decilo tal cual:**

> «Y lo importante es que no son tres patrones sueltos puestos para cumplir el requisito. Se activan
> en cadena en una sola operación: cuando el cliente acepta la propuesta, el State decide que la
> acción es legal, el Factory entrega el algoritmo y la Strategy calcula el precio. Al final les
> muestro esa secuencia.»

**Transición:** «Antes de los patrones, treinta segundos de cómo funciona el sistema, para que se
entienda dónde vive cada cosa.»

---

## Contexto (4 láminas, ~2:30 min)

**Objetivo pedagógico:** ubicar al que escucha. Si no entienden el flujo del negocio, los patrones
son abstractos.

**Lámina 1 — qué pidió el enunciado (~20 s).** No la leas. Decí:

> «Tres roles: cliente, agente y administrador. Pero la lógica interesante está entre cliente y
> agente.»

**Lámina 2 — el recorrido de la renta (~1 min).** Esta sí trabajala, es la más útil.
Recorré los cinco pasos con el mouse mientras los contás como una historia:

> «El cliente solicita. El agente propone un horario. El cliente acepta o rechaza — y si rechaza,
> el sistema le exige un motivo. El agente entrega el vehículo. Y al final registra la devolución.
> Fíjense en algo: **ninguno de los dos puede avanzar solo**, se van pasando el turno.»

Después bajá a la franja violeta de abajo y rematá:

> «Y acá está el punto: los tres patrones se concentran en el paso 3. Es el único momento en que se
> calcula dinero.»

**Lámina 3 — del clic a la clase (~40 s).** El mensaje es uno solo:

> «Django organiza esto en modelo, plantilla y vista. Los patrones los pusimos en el **modelo**, no
> en la vista. La vista no conoce ningún estado ni ninguna tarifa.»

**Lámina 4 — la vista completa (~30 s).** Mostrá el bloque de código y señalá **una sola línea**:

> «Toda la vista tiene una sola línea de negocio: `reserva.aceptar()`. Lo demás es permisos y
> mensajes. Si mañana cambia la regla de qué estado puede aceptar, esta vista no se toca.»

Si querés sumar un punto técnico, agregá:

> «Y corre dentro de una transacción con `select_for_update`, que bloquea la fila: si dos peticiones
> intentaran avanzar la misma reserva al mismo tiempo, la segunda espera.»

**Transición:** «Vamos al primero, y lo voy a explicar con un dron antes de mostrar una línea de Python.»

---

## State (8 láminas, ~5 min) — la sección más importante

**Objetivo pedagógico:** que entiendan que el objeto **sabe** en qué estado está y **él** decide qué se
le puede pedir. Si esto queda claro, el resto es fácil.

### Lámina 2 — la demo del dron (~1:30 min). NO la apures.

Esta es tu mejor herramienta. La coreografía exacta:

1. **Primero apretá «Aterrizar»** — el botón ilegal, con el dron apagado.
   Sale en rojo y el dron tiembla. Decí:
   > «El botón existe. Está ahí, se puede apretar. Pero el dron contesta: no puedo aterrizar, estoy
   > en tierra. **El dron sabe en qué estado está.**»
2. **Encender** → **Despegar**. Dejá que suba y que las hélices giren un segundo antes de seguir hablando.
3. **Apretá «Apagar» mientras vuela** — ilegal otra vez.
   > «Y esto es lo bonito: tampoco lo deja apagarse en el aire. Primero hay que aterrizar.»
4. **Aterrizar** → **Apagar**. Cerraste el ciclo.

**El remate, dicho mirando a la audiencia y no a la pantalla:**

> «Cambien "dron" por "reserva" y "volando" por "propuesta", y es exactamente nuestro sistema.»

Bajá a la tabla «En el dron ≡ En AutoRent» y leé sólo la frase de la derecha:
*«No se puede aceptar una reserva en estado EN_RENTA»* — y aclarà que ese es un mensaje real que
produce el sistema, no un ejemplo inventado.

### Lámina 3 — el problema (~50 s)

> «Sin el patrón, esto se escribe así: cinco operaciones, y cada una con su propio `if` sobre el
> campo estado.»

Señalá las tres tarjetas y **decí una sola cosa de cada una**: regla dispersa, cerrado a extensión,
fácil de romper. No las leas enteras.

Si querés sonar sólido, citá la aplicabilidad del GoF (está en la lámina):
> «Y esto no es interpretación nuestra: el GoF dice literalmente que State aplica cuando varias
> operaciones contienen la misma estructura condicional. Nosotros teníamos cinco.»

### Lámina 4 — el diagrama de clases (~50 s)

Los diagramas se revelan por partes solos. **Aprovechalo: hablá al ritmo de la animación.**

> «`Reserva` es el Context. `EstadoReserva` es la clase abstracta. Y abajo, una clase por estado.»

Pará en la nota ámbar de la derecha, que es la decisión de diseño:
> «La implementación por defecto de las cinco operaciones **rechaza**. Cada estado concreto sobreescribe
> solamente las que le son legales.»

### Lámina 5 — la máquina de estados (~40 s)

Se dibuja transición por transición. Narrala:
> «Solicitada, propuesta, aceptada, en renta, finalizada. Y por acá el camino del rechazo.»

Y señalá las cajitas verdes:
> «En verde, el efecto sobre el vehículo. Cada transición lo sincroniza. Al estar dentro de la clase
> de estado, es imposible cambiar la reserva y olvidarse del vehículo.»

### Lámina 6 — la clase abstracta (~50 s)

Este es **el momento técnico más fuerte de toda la defensa**. Bajá el ritmo.

> «Miren la clase base. No declara métodos abstractos vacíos: declara métodos que **lanzan excepción**.
> El comportamiento por omisión es "esta transición es ilegal".»

Y después mostrá `Rechazada`:
> «Por eso un estado terminal completo son tres líneas. No escribimos ni un `if`: hereda cinco métodos
> que ya rechazan.»

### Lámina 7 — ConcreteState y Context (~40 s)

> «Y en la clase `Reserva` no quedó **ni un solo `if`** sobre el estado. Cinco métodos, cada uno de una
> línea, que sólo delegan.»

Ese «ni un solo if» decilo despacio. Es tu mejor frase.

### Lámina 8 — el espejo con la base de datos (~30 s)

> «Y las reglas no viven sólo en Python: están espejadas en los CHECK del esquema. Si alguien
> insertara por SQL directo, la base también las hace cumplir.»

**Transición:** «Ese `calcular_total()` que apareció cuando el cliente acepta es el siguiente patrón.»

---

## Strategy (4 láminas, ~3 min)

**Objetivo pedagógico:** que quede clara la diferencia con State. Si sólo entienden «otra jerarquía de
clases», no entendieron.

### Lámina 2 — la demo del Pokémon (~1 min)

Coreografía:

1. Con **Eléctrico** equipado, apretá **¡Ataca!**. Sale el daño.
2. Cambiá a **Planta** y **apretá el mismo botón**. Otro color, otro número.
3. Decí, y esto es el punto entero:
   > «Fíjense que **yo apreté el mismo botón las dos veces**. La orden no cambió: "ataca". Lo que
   > cambió fue el ataque equipado, y cada ataque trae su propia fórmula.»
4. Señalá la consola, donde se ve `daño = 25 + 18 × nivel`:
   > «El entrenador no conoce esa fórmula. Sólo sabe pedir que ataque.»

**El matiz que te suma puntos —** decilo acá, no esperes a que pregunten:

> «Y ojo con una diferencia importante: el ataque **lo elijo yo desde afuera**, y no cambia solo a
> mitad del combate. Por eso esto es Strategy y no State.»

### Lámina 3 — problema y UML (~1 min)

> «Tres planes: diario, semanal, mensual. Cada uno cobra distinto. Sin el patrón,
> `calcular_total` tendría un `if` por plan, y agregar un plan quincenal obligaría a modificar una
> clase que no tiene nada que ver con fórmulas de precio.»

### Lámina 4 — el código (~1 min)

Mostrá `TarifaSemanal` y explicá la regla de negocio, que es concreta y se entiende:

> «El descuento aplica sólo sobre bloques completos. Si alguien renta 10 días con plan semanal, se le
> cobran 7 días con descuento más 3 días a tarifa plena. Esa regla vive en una sola clase.»

Cerrá con la pregunta que abre el siguiente patrón:

> «Pero queda un cabo suelto: si `Reserva` no nombra a ninguna tarifa… ¿quién decide cuál se usa?»

**Transición:** ese cabo suelto es literalmente la lámina siguiente. Aprovechalo.

---

## Factory Method (4 láminas, ~2:30 min)

### Lámina 2 — la demo de la tubería (~1 min)

Coreografía:

1. Apretá **'GOOMBA'**. Sale el Goomba de la tubería.
2. Apretá **'KOOPA'**. Sale el otro.
   > «Yo no armé al Goomba pieza por pieza. Sólo dije el nombre, y la tubería sabe cuál construir.
   > Eso es una fábrica.»
3. **Apretá 'DRAGON'** — el que no existe. Sale `KeyError`.
   > «Y si le pido algo que no está en el catálogo, no inventa nada: falla. Para que exista un dragón
   > hay que agregarlo al catálogo, **y sólo ahí**. Ni Mario ni el resto del juego se enteran.»

### Lámina 3 — el UML (~40 s)

> «`PlanRenta` es el Creator. Su método `calculo()` lee el código que él mismo tiene guardado y
> devuelve el objeto correcto. El Creator conoce a los productos; `Reserva` no. Ese es todo el punto.»

### Lámina 4 — el código y el matiz honesto (~50 s)

**Decí el matiz vos, antes de que lo pregunten.** Queda mucho mejor que si te lo sacan:

> «Y quiero aclarar algo antes de que me lo pregunten: esta es la variante que el propio GoF llama
> *factory method parametrizado* — un solo método que recibe un identificador, en vez de una subclase
> por producto. La elegimos porque el discriminador ya existía como columna en la base. Crear una
> subclase de `PlanRenta` por cada plan habría duplicado la tabla sin ganar nada.»

Y agregá el cierre conceptual:

> «Ese mismo mecanismo es el que usamos en `EstadoReserva.crear()`. Es la pieza que conecta una base
> de datos relacional con un patrón de comportamiento — porque una tabla no puede guardar un objeto
> que sólo tiene comportamiento.»

**Transición:** «Ya vimos los tres por separado. Ahora los tres juntos, que es lo que pasa de verdad
cuando el cliente aprieta Aceptar.»

---

## Los tres juntos (4 láminas, ~2:30 min)

### Lámina 1 — el diagrama de secuencia (~1 min)

Los ocho mensajes se revelan uno a uno. **Narralos al ritmo de la animación**, no antes:

> «El cliente acepta. La reserva le pregunta a su estado actual si eso es legal — y lo es, porque está
> en Propuesta. El estado pide calcular el total. La reserva le pide la estrategia al plan: ahí actúa
> el Factory. El plan devuelve una TarifaSemanal. Esa tarifa calcula el precio. Y por último el estado
> cambia a Aceptada, y de paso el vehículo pasa a Reservado.»

**El remate, que es la frase que querés que se lleven:**

> «State decide **si** se puede y **qué** sigue. Factory decide **quién** calcula. Strategy decide
> **cómo** se calcula. Ninguno invade al otro.»

### Lámina 2 — State frente a Strategy (~40 s)

Esta lámina es defensiva: está para cuando te lo pregunten. Si vas bien de tiempo, adelantate:

> «Los dos tienen la misma estructura, y por eso se confunden. La diferencia es la intención: en State
> el objeto **está** en una situación y el propio patrón decide la siguiente. En Strategy el objeto
> **usa** un algoritmo que alguien eligió desde afuera. Una reserva pasa sola de Solicitada a Propuesta;
> nunca "pasa" de TarifaDiaria a TarifaSemanal.»

### Lámina 3 — preguntas (~30 s)

No la leas. Es tu red de seguridad. Decí:

> «Dejamos anticipadas las preguntas más probables, por si quieren entrar en alguna.»

Y pasá. Si preguntan, volvés.

### Lámina 4 — resumen (~20 s)

Cerrá con el beneficio concreto, no con la teoría:

> «En resumen: el Context quedó sin un solo `if` sobre el estado; agregar un plan o un estado nuevo es
> escribir una clase, sin modificar las existentes; y las reglas están espejadas en la base de datos.»

---

## Preguntas probables (y qué contestar)

**«¿Por qué tres patrones y no uno, si el enunciado pedía uno?»**
> Porque el dominio los pidió. El ciclo de vida de la reserva y el cálculo del precio son dos problemas
> distintos. Podríamos haber entregado sólo State y cumplir, pero el precio habría quedado con
> condicionales dentro de la reserva.

**«¿Ese Factory Method es realmente el del GoF?»**
> Es la variante parametrizada que el propio GoF describe. Decidilo con seguridad y explicá el porqué
> del discriminador en la base (arriba está la frase completa). **No digas que sí y ya** — si insiste,
> te va a hacer quedar peor.

**«¿Qué pasa si intento una transición ilegal?»**
> Se lanza `ValidationError` con un mensaje concreto: «No se puede aceptar una reserva en estado
> EN_RENTA». La vista lo captura y lo muestra. El dato nunca se corrompe porque todo corre dentro de
> `transaction.atomic`.

**«¿Cómo agregarían un plan nuevo?»**
> Tres pasos, sin tocar `Reserva` ni las vistas: una clase `TarifaQuincenal`, una entrada en el
> diccionario `_PRODUCTOS`, y una fila en la tabla `plan_renta`.
> **Esta es la mejor pregunta que te pueden hacer.** Es la demostración de que el patrón sirvió.

**«¿Y un estado nuevo?»**
> Una clase que hereda de `EstadoReserva`, sobreescribe sólo lo que es legal en ese estado, y se
> registra en `_ESTADOS`. Las clases existentes no se modifican.

**«¿Dónde está el `if` que dicen que eliminaron?»**
> No hay ninguno sobre el estado. El único condicional que queda es en `Propuesta.rechazar()`, y valida
> que el motivo no venga vacío — es validación de dato, no una decisión de transición.

**«¿Por qué no guardaron el objeto de estado en la base?»**
> Porque no tiene datos propios, sólo comportamiento. Guardamos el código y reconstruimos el objeto con
> `EstadoReserva.crear()`.

**«Muéstrenme el código.»**
> Andá al editor, no a la diapositiva. `reservas/estados.py` primero: es el archivo que mejor se
> defiende solo.

---

## Si el tiempo aprieta

**Te dan 10 minutos:** dejá afuera la sección **Contexto** entera (4 láminas) y la lámina de
*State frente a Strategy*. Arrancá directo en la demo del dron.

**Te dan 5 minutos:** sólo tres cosas — la **demo del dron**, la **lámina de la clase abstracta**
(la que rechaza por defecto) y el **diagrama de secuencia** de los tres juntos. Con eso se entiende
el 80 %.

**Lo que NO deberías apurar nunca:** la demo del dron y la lámina de la clase abstracta. Ahí está el
corazón de la defensa.

---

## Errores a evitar

- **No leas las tablas en voz alta.** Están para que el auxiliar las vea, no para que las recites.
- **No digas «implementamos el patrón State» y sigas.** Decí *qué problema resolvió*. El auxiliar ya
  sabe qué es State; lo que evalúa es si vos sabés por qué lo usaste.
- **No te adelantes a la animación.** Si narrás los ocho pasos de la secuencia antes de que aparezcan,
  se pierde el efecto. Esperá.
- **No inventes si no sabés.** Si preguntan por algo que no implementaron, decilo: «eso no lo cubrimos
  en esta entrega». Es mucho mejor que improvisar y que te desarmen la respuesta.
- **No presentes de espaldas.** Las demos son para la audiencia; apretá el botón y girate a hablar
  mientras la animación corre.
