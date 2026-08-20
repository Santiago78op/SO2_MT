---
tema: Casos de uso del negocio
fuente: "CDU Negocio - Modelado de Drivers RF.pdf"
fecha: 2026-08-19
---

# Relación de extensión `<extend>`

La segunda relación de los **CUN expandidos**, junto con
[[Relación de inclusión include]] y [[Generalización y especialización en casos de uso]].

## De dónde sale

> Una vez definido el workflow de un caso de uso del negocio, se puede encontrar alguna
> **conducta opcional u optativa**.

Ese es el punto de partida: primero se define el flujo normal del CUN, y **después** aparecen
comportamientos que no siempre pasan. Esos se sacan a un CU aparte que **extiende** al base.

```mermaid
flowchart LR
    A(["Actor"]) --- B(("CU base"))
    E(("CU de extensión")) -.->|"«extend»"| B
```

Fijate en la dirección de la flecha: apunta **desde** el CU que extiende **hacia** el base. Es
al revés que en `<include>`. Tiene lógica: el base no necesita saber que alguien lo extiende
—sigue funcionando igual sin la extensión—, pero la extensión sí necesita saber a quién y en
qué punto se engancha.

## ¿Cuándo tiene sentido definir un nuevo CU?

Dos situaciones:

1. **Modelar un workflow complejo o un subflujo separado, que raramente ocurre u ocurre bajo
   ciertas condiciones.**
2. **Flujos distintos que pueden ejecutarse en base a la selección del actor.**

El caso 1 es el excepcional: un trámite especial que se da una vez cada tanto y que, metido en
el flujo principal, lo ensuciaría. El caso 2 es el de la bifurcación: el actor elige, y cada
opción es un flujo distinto.

```mermaid
flowchart TD
    B(("CU base:<br/>flujo normal"))
    E1(("Subflujo raro o<br/>bajo condición")) -.->|"«extend»"| B
    E2(("Flujo según<br/>selección del actor")) -.->|"«extend»"| B
```

![[adjuntos/cdu-negocio-modelado-drivers-rf/cdu-p20.png]]

## El mecanismo formal: los puntos de extensión

La definición del deck de relaciones agrega la pieza que falta para entender **cómo** funciona:

> Es un **estereotipo de dependencia**. Ofrece una forma de extensión **más controlada** que la
> relación de generalización. El caso de uso base **declara un conjunto de puntos de extensión**. El
> caso de uso especializado **sólo puede alterar el comportamiento de los puntos de extensión
> marcados**.
>
> Se usa esta relación cuando se tiene un caso de uso que es **similar a otro, pero que hace un poco
> más**.

```mermaid
flowchart LR
    B(("Caso de uso <b>BASE</b><br/><i>declara puntos<br/>de extensión</i>")) 
    E(("Caso de uso <b>EXTENDIDO</b><br/><i>solo puede alterar<br/>los puntos marcados</i>"))
    E -.->|"«extends»"| B
```

> [!important] Esto resuelve dos confusiones de un golpe
> **1. Por qué la flecha va del extendido al base.** El base **no sabe quién** lo extiende, pero sí
> declara **dónde** se lo puede extender. Los puntos son parte del base; quien los usa es el
> extendido, y por eso la dependencia apunta hacia el base.
>
> **2. Por qué es "más controlada" que la generalización.** El extendido **solo puede tocar los puntos
> marcados**; el hijo de una generalización puede **redefinir** cualquier cosa del padre
> (→ [[Generalización y especialización en casos de uso]]).
>
> De ahí la escala de "fuerza" de las tres relaciones:
> **`«include»`** (el base manda, siempre pasa) → **`«extend»`** (el base autoriza puntos, a veces pasa)
> → **generalización** (el hijo hereda todo y puede redefinir).

> [!tip] La consecuencia práctica para tu entrega
> Si dibujás un `«extend»`, tené lista la respuesta a **"¿en qué punto del caso base se engancha?"**.
> En el ejemplo de aduana el punto es *el momento del check-in en que se revisa el equipaje*; en el de
> la tienda, *el paso en que se evalúa el pedido*.
>
> Una extensión sin punto de enganche identificable no es una extensión: es un caso de uso suelto.

### Un ejemplo mínimo del deck

![[adjuntos/capturas-clase/ejemplo-completo-expandido-maquina.png]]

Y el más corto de todos: **GIRO** ←`«extend»`— **GIRO POR INTERNET**. El giro por internet *"es
similar al giro, pero hace un poco más"*: el mismo trámite con un canal adicional.

## `include` vs `extend`, en una tabla

| | `<include>` | `<extend>` |
|---|---|---|
| ¿Siempre ocurre? | **Sí** | **No** — opcional u optativa |
| Dirección de la dependencia | base → incluido | extensión → base |
| Motivo | Reutilizar comportamiento o simplificar la comprensión | Conducta opcional, subflujo raro, o elección del actor |
| Sin el otro CU, el base… | queda **incompleto** | **funciona igual** |

La última fila es la mejor prueba: **tapá el CU secundario y leé el base.** Si el proceso queda
incompleto, era `include`. Si el proceso se sigue entendiendo de punta a punta, era `extend`.

Y ojo con no confundir esto con el **curso alterno** de la
[[Descripción textual de casos de uso]]: el curso alterno es la variante contada en el texto del
mismo caso de uso; `<extend>` es cuando esa variante se saca a un caso de uso propio porque es
compleja o rara.

## Notas relacionadas

- [[Caso de uso del negocio]]
- [[Relación de inclusión include]]
- [[Generalización y especialización en casos de uso]]
- [[Descripción textual de casos de uso]]

## Preguntas de repaso

1. ¿En qué momento del modelado aparece la necesidad de un `<extend>`?
2. ¿Hacia dónde apunta la flecha de `<extend>` y por qué en esa dirección?
3. Nombrá las dos situaciones en que tiene sentido definir un nuevo CU de extensión.
4. Explicá la prueba de "tapar el CU secundario" para distinguir `include` de `extend`.
5. ¿Qué diferencia hay entre un `<extend>` y un curso alterno?
