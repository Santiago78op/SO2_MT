---
tema: Casos de uso del negocio
fuente: "CDU Negocio - Modelado de Drivers RF.pdf"
fecha: 2026-08-19
---

# Descripción textual de casos de uso

El diagrama de CUN muestra qué procesos hay y quién participa, pero **no cuenta qué pasa
adentro**. Eso lo hace la descripción textual: es uno de los artefactos de las
[[Realizaciones de casos de uso del negocio]].

## La plantilla

Las secciones que pide la presentación, en orden:

| Sección | Qué va |
|---|---|
| **Nombre** del caso de uso del negocio | El nombre del CUN |
| **Actores** | Quiénes participan desde afuera |
| **Propósito** | Para qué existe este proceso |
| **Resumen** | El proceso en un párrafo: cuándo inicia, qué hace, cuándo termina |
| **Flujo de trabajo** | El paso a paso, en dos variantes: **Básico (normal)** y **Curso alterno** |
| **Otras secciones** | Lo que haga falta según el caso |
| **Prioridad** | Qué tan importante es este CUN |
| **Mejoras** | Oportunidades de mejora detectadas |

Las dos variantes del flujo:

- **Básico (normal)**: lo que pasa cuando todo sale bien.
- **Curso alterno**: las variantes, excepciones y desvíos.

> [!tip] No confundir curso alterno con `<extend>`
> El curso alterno es la variante **contada en el texto del mismo caso de uso**. Cuando esa
> variante es compleja o rara y merece un caso de uso propio, se saca con una
> [[Relación de extensión extend]]. Misma idea, distinto nivel de formalidad.

![[adjuntos/cdu-negocio-modelado-drivers-rf/cdu-p26.png]]

## El ejemplo completo: Atender pedido

Es el CUN que salió de identificar procesos por objetivos en
[[Identificación de procesos del negocio]] (empresa de servicio, objetivo *"Satisfacer pedidos
de los clientes"*).

```mermaid
flowchart LR
    C(["Cliente"]) --- AP(("Atender<br/>pedido"))
```

| Campo | Contenido |
|---|---|
| **Nombre** | Atender pedido |
| **Actores** | CLIENTE |
| **Propósito** | Analizar viabilidad del Pedido del Cliente y ordenar su producción. |
| **Resumen** | El caso de uso se inicia cuando el Cliente envía una orden de pedido de productos. El proceso da curso al pedido, analizando la posibilidad de satisfacerlo. El caso de uso finaliza cuando se le comunica al cliente el resultado final del análisis de su pedido. |

### Curso normal de eventos

Se escribe en **dos columnas**: lo que hace el actor y lo que responde el proceso de negocio.
La numeración es **continua entre las dos columnas** — así se ve el orden real de los hechos.

| Acción del actor | Respuesta del proceso de negocio |
|---|---|
| **1.** El Cliente envía una orden de pedido que incluye fecha de solicitud, datos del cliente y productos solicitados. | |
| | **2.** El Comercial recibe el pedido del cliente por teléfono o correo ordinario de la empresa. |
| | **3.** El Comercial revisa el pedido, comienza su procesamiento, y lo envía al Jefe Técnico. |
| | **4.** El Jefe Técnico analiza la viabilidad de cada producto pedido por separado: *si el producto pedido está en Catálogo, se acepta su fabricación.* |
| | **5.** El Jefe Técnico informa al Comercial la aceptación o rechazo de cada producto. → *Si el pedido o parte de éste es aceptado, pasar a 6. Si el pedido es rechazado, pasar a 8.* |
| | **6.** El Jefe Técnico crea una orden de trabajo para cada producto del pedido, a partir de la plantilla de fabricación, y las envía al Jefe de Producción, quedando pendiente su lanzamiento. |
| | **7.** El Jefe de Producción planifica la producción de las órdenes de trabajo recibidas. |
| | **8.** El Comercial informa al cliente. |
| **9.** El Cliente recibe la comunicación del resultado final del análisis del pedido. | |

![[adjuntos/cdu-negocio-modelado-drivers-rf/cdu-p27.png]]

## Qué observar en este ejemplo

Tres cosas que resumen buena parte del tema:

**El único actor es el Cliente.** El Comercial, el Jefe Técnico y el Jefe de Producción son
**trabajadores del negocio**, no actores: están **adentro**. Es la regla de
[[Actor del negocio]] — cada actor modela algo fuera del negocio.

**El flujo es completo de punta a punta.** Arranca cuando el Cliente envía el pedido y termina
cuando el Cliente recibe la respuesta. Eso es lo que pide la definición de
[[Caso de uso del negocio]]: un flujo de trabajo **completo** que produce un resultado de valor
**observable** para el actor.

**Los saltos condicionales del paso 5 son el germen del curso alterno.** "Si es aceptado pasar a
6, si es rechazado pasar a 8" es una bifurcación escrita dentro del flujo básico. Si esa rama se
volviera compleja, se sacaría a un CUN aparte con `<extend>`.

## Notas relacionadas

- [[Caso de uso del negocio]]
- [[Realizaciones de casos de uso del negocio]]
- [[Actor del negocio]]
- [[Identificación de procesos del negocio]]
- [[Relación de extensión extend]]

## Preguntas de repaso

1. Enumerá las secciones de la plantilla de descripción textual.
2. ¿Cuáles son las dos variantes del flujo de trabajo y qué va en cada una?
3. En el ejemplo *Atender pedido*, ¿quién es el actor y por qué el Jefe Técnico no lo es?
4. ¿Por qué la numeración de los pasos es continua entre las dos columnas?
5. ¿Cuándo un curso alterno se convierte en un `<extend>`?
