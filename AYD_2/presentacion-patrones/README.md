# Patrones de diseño — AutoRent Express S.A. (presentación)

Presentación de defensa de la **Práctica 1** de Análisis y Diseño de Sistemas 2 (USAC, 2S2026).
Explica los tres patrones GoF implementados en el proyecto **AutoRent Express S.A.**:
**State**, **Strategy** y **Factory Method**.

- **Ver localmente:** abrir `index.html` con doble clic (no necesita servidor ni internet).
- **Navegación:** el índice enlaza a cada sección; dentro de una sección, flechas ← → o los botones.
  Botón ◐ para tema claro/oscuro.
- **Proyecto que documenta:** `AYD2_A_2S2026_PRACTICA1_G2` (Django 6.0.7 + PostgreSQL).

## Estructura

```
presentacion-patrones/
├── index.html            ← portada + roadmap con links
├── contexto.html         ← cómo funciona el sistema y dónde encaja cada patrón
├── state.html            ← patrón State
├── strategy.html         ← patrón Strategy
├── factory.html          ← patrón Factory Method
├── colaboracion.html     ← los tres juntos, State vs Strategy y preguntas de defensa
├── assets/
│   ├── estilo.css        ← sistema de diseño (heredado de presentacion-compscript)
│   ├── fuentes.css       ← @font-face de las tres tipografías
│   ├── fuentes/          ← woff2 empotrados (funciona sin internet)
│   ├── deck.js           ← navegación + tema + revelado por pasos de los diagramas
│   └── motion.js         ← Motion 13.0.0 (MIT), vendorizado para animar sin conexión
└── README.md
```

**Agregar una lámina** = copiar el esqueleto de una `<section class="slide">` existente.
El CSS y el JS no se tocan.

## Contenido

| Página | Tema | Láminas |
|---|---|---|
| `index.html` | Portada y roadmap | — |
| `contexto.html` | Roles, flujo de la renta paso a paso, cadena plantilla → vista → modelo → BD | 4 |
| `state.html` | **Analogía del dron** (interactiva), la cadena de `if` que se eliminó, UML de clases, máquina de estados, código real, espejo con los `CHECK` del DDL | 8 |
| `strategy.html` | **Analogía Pokémon** (interactiva), las tres tarifas intercambiables, UML, fórmulas y planes sembrados | 4 |
| `factory.html` | **Analogía de la tubería de Mario** (interactiva), del texto persistido al objeto de cálculo, UML y el matiz del *factory method parametrizado* | 4 |
| `colaboracion.html` | Diagrama de secuencia de `aceptar()`, State frente a Strategy, preguntas de defensa y resumen | 4 |

## Las tres analogías interactivas

Cada patrón abre con una demo que se puede **apretar en vivo durante la exposición**. La idea es
que el concepto se vea antes de mostrar el código.

| Patrón | Analogía | Qué hace ver |
|---|---|---|
| **State** | 🚁 Un **dron** con botones Encender / Despegar / Aterrizar / Apagar | El botón «Aterrizar» existe siempre, pero sólo funciona si el dron está volando. Las acciones ilegales se rechazan con un temblor y un mensaje rojo — igual que `ValidationError`. |
| **Strategy** | ⚡ Un **Pokémon** con cuatro ataques equipables | La orden es siempre la misma (`¡Ataca!`); cambia la fórmula de daño según el ataque equipado. Se elige desde afuera y no cambia sola: por eso es Strategy y no State. |
| **Factory Method** | 🍄 Una **tubería de Mario** que devuelve Goomba, Koopa o Planta Piraña | Se le pide un objeto **por su nombre en texto** y ella construye el correcto. Pedir `'DRAGON'` da `KeyError`: sólo existe lo que está en el catálogo. |

Cada demo cierra con una tabla «En el juego ≡ En AutoRent» que traduce la analogía al código real.
Los estilos viven en `assets/analogias.css`; la lógica, en un `<script>` al final de cada página.

## Animación

Los diagramas revelan sus pasos en orden (`[data-step]`) usando **Motion**. Es **puramente aditivo**:
si `motion.js` no carga, o el sistema pide menos movimiento
(`prefers-reduced-motion: reduce`), no se anima nada y **todo el contenido queda visible igual**.
Nada se oculta por CSS.

## Verificación

Todos los fragmentos de código de las láminas están tomados del repositorio del proyecto,
no son pseudocódigo:

| Lámina | Fuente real |
|---|---|
| Clase abstracta y estados concretos | `reservas/estados.py` |
| Context y Factory Method | `reservas/models.py` |
| Las tres tarifas | `reservas/calculos.py` |
| La vista `aceptar_reserva` | `reservas/views.py` |
| Constraints `chk_*` | `db/ddl.sql` |

## Referencia

Gamma, E., Helm, R., Johnson, R. & Vlissides, J. — *Design Patterns: Elements of Reusable
Object-Oriented Software*. Patrones State, Strategy y Factory Method.
