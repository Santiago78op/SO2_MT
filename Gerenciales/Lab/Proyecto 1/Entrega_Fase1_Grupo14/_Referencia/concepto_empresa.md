# La empresa ficticia — RutaMoto

Premisa compartida del caso. **Todos escriben desde aquí**: si una sección contradice este documento, la que está mal es la sección.

---

## La empresa en una línea

**RutaMoto** — tienda en línea de repuestos y accesorios para motocicleta, con entrega en el área metropolitana de Guatemala y envío a departamentos.

| | |
|---|---|
| Nombre | RutaMoto |
| Dominio | rutamoto.gt |
| Sector | Comercio minorista de repuestos y accesorios para motocicleta (mercado de reposición) |
| Fundación | 2026, con financiamiento y acompañamiento de QuetzalDev |
| Alcance inicial | Área metropolitana: Guatemala, Mixco, Villa Nueva |
| Expansión proyectada | Regional (Sacatepéquez, Chimaltenango, Escuintla) y luego nacional |
| Modelo | E-commerce propio, con entrega a domicilio y recogida en tienda |

## Por qué este giro y no otro

Elegí repuestos de moto por cuatro razones, y las cuatro son argumentables frente al catedrático:

**1. Cada módulo del proyecto se justifica solo.** Este es el punto importante. En un negocio de repuestos, el inventario, las órdenes de compra a proveedores y las cotizaciones a clientes no son features que hay que inventarles un uso: son la operación.

| Módulo que exige el proyecto | Por qué existe de verdad en RutaMoto |
|---|---|
| Inventario y alertas de stock bajo | El repuesto se compra con urgencia. Si no hay, el cliente se va al local de enfrente y no vuelve |
| Compras a proveedores (RFQ → OC → Recepción) | Se importa por lote y con crédito; el ciclo formal ya existe en el negocio |
| Cotizaciones a clientes | Los talleres piden cotización por volumen antes de comprar. Es una práctica real, no un trámite |
| CRM con segmentación | Un repartidor que cambia aceite cada mes no se atiende igual que un taller ni que un motociclista de fin de semana |
| Campañas de correo | El consumible es recurrente: el recordatorio de mantenimiento tiene sentido comercial |
| Reportes de BI | Rotación por categoría y quiebre de stock son las dos decisiones semanales del negocio |

**2. Hay compra recurrente.** Aceite, filtros, pastillas, cadena: todo se consume y se vuelve a comprar. Eso hace creíbles la fidelización, la recompra y los KPIs de retención. Un negocio de compra única haría que esas secciones sonaran forzadas.

**3. Hay un segmento B2B natural.** Los talleres mecánicos compran por volumen y piden cotización. Eso alimenta el pipeline del CRM con algo más interesante que clientes sueltos.

**4. No se parece a la Práctica 2.** Ahí el caso fue una productora de café. El enunciado pone la *Originalidad del Trabajo* como valor formativo explícito, así que repetir el rubro es gratuitamente riesgoso.

> **Honestidad sobre el mercado:** la motocicleta como transporte urbano y de reparto masivo en Guatemala, y la debilidad digital de los locales de repuestos, son las **premisas del caso ficticio**. Son plausibles, pero yo no tengo cifras verificadas que las respalden. Si quieren afirmarlas como dato en el informe —y la sección de diagnóstico del rol 2 lo pide— hay que citar una fuente real: INE, SAT (parque vehicular), o gremiales del sector. **No inventen un porcentaje.** Si no encuentran fuente, se redacta como supuesto del proyecto y se dice que lo es.

## El problema que resuelve

El motociclista guatemalteco compra repuestos yendo físicamente a un local, sin saber de antemano si hay existencia ni cuánto cuesta. El vendedor no lleva registro de qué le vendió a quién, así que no hay historial, no hay recordatorio de mantenimiento y no hay forma de anticipar la demanda. El resultado es doble: el cliente pierde el día buscando una pieza y el negocio pierde ventas por quiebres de stock que nadie midió.

RutaMoto ataca eso con catálogo en línea con existencia visible, entrega a domicilio y un historial por cliente que permite recordar el mantenimiento antes de que la pieza falle.

## Segmentos de cliente

Esto es lo que el rol 4 usa para el CRM y lo que el rol 2 usa para beneficiarios.

| Segmento | Quién es | Qué compra | Qué lo mueve |
|---|---|---|---|
| **Repartidor** | Mensajería y reparto por aplicación. Uso intensivo diario | Aceite, filtros, pastillas, llantas. Compra frecuente | Precio y disponibilidad inmediata: cada hora parado es dinero |
| **Motociclista particular** | Usa la moto para ir al trabajo | Mantenimiento periódico, accesorios básicos | Comodidad y confianza en que la pieza es la correcta |
| **Taller mecánico (B2B)** | Talleres pequeños e independientes | Volumen, crédito, cotización previa | Margen, plazo de pago y que le cumplan la entrega |
| **Entusiasta** | Motociclismo recreativo y de fin de semana | Cascos, accesorios, equipo de protección. Ticket alto | Marca, calidad y diferenciación |

## Competencia

**Verifiquen los nombres y los datos actuales antes de ponerlos en el informe.** Puedo darles las categorías con confianza; los nombres propios y su situación de hoy no los tengo verificados.

| Tipo de competidor | Ejemplos a verificar | Su debilidad |
|---|---|---|
| Locales físicos de repuestos | Almacenes concentrados en zona 1 y corredores comerciales | Sin catálogo en línea ni existencia visible; dependen de que el cliente llegue |
| Repuestos de concesionario | Departamentos de repuesto de marcas como Italika, Honda, Yamaha, Bajaj, TVS | Precio alto y solo piezas de su propia marca |
| Marketplaces | Kemik, Facebook Marketplace, Instagram | Sin control de inventario ni garantía; la confianza depende del vendedor |
| Importadores informales | Venta por redes sociales | Precio bajo, pero sin factura, sin garantía y sin continuidad |

La oportunidad está en el cruce: existencia visible en línea + entrega rápida + factura y garantía. Ninguno de los cuatro tipos ofrece las tres cosas juntas.

## Catálogo — 36 productos en 6 categorías

Cubre el mínimo de 30 que exige el sitio web. Las seis categorías están pensadas para que la gráfica de pastel del BI tenga sentido y no quede una categoría comiéndose el 80%.

Los precios son del caso ficticio y están puestos con criterio de orden de magnitud. Si alguien quiere afinarlos contra precios reales, mejor.

### Lubricantes y filtros
| Código | Producto | Precio | Costo |
|---|---|---|---|
| LUB-001 | Aceite mineral 20W-50, 1 L | Q 45 | Q 28 |
| LUB-002 | Aceite semisintético 10W-40, 1 L | Q 75 | Q 48 |
| LUB-003 | Aceite sintético 10W-40, 1 L | Q 110 | Q 72 |
| LUB-004 | Filtro de aceite estándar | Q 35 | Q 19 |
| LUB-005 | Filtro de aire de alto flujo | Q 60 | Q 34 |
| LUB-006 | Kit de cambio de aceite (aceite + filtro + empaque) | Q 145 | Q 92 |

### Frenos y transmisión
| Código | Producto | Precio | Costo |
|---|---|---|---|
| FRE-001 | Pastillas de freno delanteras | Q 95 | Q 55 |
| FRE-002 | Zapatas de freno traseras | Q 75 | Q 42 |
| FRE-003 | Disco de freno delantero | Q 290 | Q 185 |
| FRE-004 | Kit de arrastre (cadena y piñones) | Q 395 | Q 255 |
| FRE-005 | Cadena de transmisión 428H | Q 180 | Q 110 |
| FRE-006 | Líquido de frenos DOT 4, 500 ml | Q 45 | Q 24 |

### Llantas y neumáticos
| Código | Producto | Precio | Costo |
|---|---|---|---|
| LLA-001 | Llanta delantera 90/90-18 | Q 320 | Q 205 |
| LLA-002 | Llanta trasera 110/90-17 | Q 420 | Q 275 |
| LLA-003 | Llanta 80/100-14 | Q 240 | Q 150 |
| LLA-004 | Neumático (tubo) rin 17" | Q 65 | Q 35 |
| LLA-005 | Kit de reparación de pinchazos | Q 40 | Q 21 |
| LLA-006 | Válvula de neumático, par | Q 15 | Q 7 |

### Sistema eléctrico e iluminación
| Código | Producto | Precio | Costo |
|---|---|---|---|
| ELE-001 | Batería 12V 5Ah | Q 285 | Q 180 |
| ELE-002 | Bujía estándar | Q 35 | Q 18 |
| ELE-003 | Bujía de iridio | Q 120 | Q 78 |
| ELE-004 | Foco LED H4 | Q 145 | Q 88 |
| ELE-005 | Kit de luces direccionales LED | Q 110 | Q 62 |
| ELE-006 | Regulador de voltaje | Q 195 | Q 125 |

### Cascos y protección
| Código | Producto | Precio | Costo |
|---|---|---|---|
| CAS-001 | Casco abierto certificado DOT | Q 295 | Q 180 |
| CAS-002 | Casco integral | Q 650 | Q 420 |
| CAS-003 | Casco modular abatible | Q 890 | Q 590 |
| CAS-004 | Guantes de protección | Q 135 | Q 78 |
| CAS-005 | Chaqueta con protecciones | Q 680 | Q 440 |
| CAS-006 | Rodilleras de protección | Q 180 | Q 105 |

### Accesorios y equipaje
| Código | Producto | Precio | Costo |
|---|---|---|---|
| ACC-001 | Baúl trasero 30 L | Q 450 | Q 290 |
| ACC-002 | Parrilla trasera universal | Q 220 | Q 135 |
| ACC-003 | Soporte de celular para manubrio | Q 95 | Q 48 |
| ACC-004 | Cargador USB para moto | Q 120 | Q 68 |
| ACC-005 | Funda impermeable para moto | Q 140 | Q 82 |
| ACC-006 | Candado de disco con alarma | Q 185 | Q 112 |

## Proveedores

Ficticios a propósito: atribuirle condiciones de pago inventadas a una empresa real sería incorrecto.

| Proveedor | Qué provee | Condiciones de pago |
|---|---|---|
| Importadora Centroamericana de Repuestos, S.A. | Lubricantes y filtros | Crédito 30 días |
| Frenos y Transmisiones de Guatemala, S.A. | Frenos, cadenas, kits de arrastre | Crédito 30 días |
| Distribuidora Llantera del Sur | Llantas y neumáticos | 50% anticipo, 50% contra entrega |
| Grupo Eléctrico Moto GT | Baterías, bujías, iluminación | Crédito 15 días |
| Protección Vial, S.A. | Cascos y equipo de protección | Crédito 45 días |
| AccesoRuta Importaciones | Accesorios y equipaje | Contado |

## Cobro y entrega

El rol 2 lo necesita para "características del proyecto". **Verifiquen la disponibilidad y las comisiones actuales antes de citarlas como dato.**

**Formas de cobro**
- Tarjeta de crédito y débito mediante pasarela de pago.
- Transferencia bancaria.
- Pago contra entrega en efectivo. En Guatemala esto no es opcional: una parte importante del mercado no usa tarjeta en línea, y excluirlo recortaría el alcance del negocio.
- Pago en cuotas para el ticket alto (cascos, llantas, baúles).

**Entrega**
- Motomensajería propia en el área metropolitana, mismo día o siguiente día hábil. Es coherente con el negocio: repartimos en moto lo que le vendemos a la moto.
- Envío a departamentos por empresa de encomiendas.
- Recogida en tienda sin costo.

## La cadena numérica

Igual que en la Práctica 2: **todo cuadra entre sí**. Si alguien mueve un número, hay que mover los demás. Período: primer trimestre de operación, octubre a diciembre de 2026.

```
8,000 visitas  →  2.5% conversión  →  200 pedidos  →  Q 57,000 en ventas
                                      ticket promedio Q 285
                                      350 clientes registrados
                                      15 talleres afiliados (B2B)
```

Otros compromisos del trimestre: 20% de recompra · 90% de pedidos metropolitanos entregados en menos de 24 horas · quiebre de stock por debajo del 5% de los SKU · satisfacción postventa de 4.3 sobre 5.

Comprobación: 200 × Q 285 = Q 57,000. Si suben la conversión, suben los pedidos y sube el ingreso; si bajan el ticket, hay que subir pedidos para sostener el ingreso.

## Los 5 KPIs

Cumplen el reparto obligatorio del enunciado: dos de ventas, uno de logística, uno de satisfacción, uno de operaciones.

| # | KPI | Categoría | Cómo se calcula | Meta |
|---|---|---|---|---|
| 1 | Tasa de conversión del sitio | Clientes / ventas | Pedidos ÷ visitas × 100 | 2.5% |
| 2 | Ticket promedio | Clientes / ventas | Ventas totales ÷ número de pedidos | Q 285 |
| 3 | Entregas metropolitanas en menos de 24 h | Operaciones / logística | Pedidos entregados a tiempo ÷ pedidos del área × 100 | 90% |
| 4 | Satisfacción postventa (CSAT) | Satisfacción | Promedio de la encuesta de 1 a 5 tras la entrega | ≥ 4.3 |
| 5 | Quiebre de stock | Operaciones | SKU con existencia cero ÷ SKU activos × 100 | ≤ 5% |

Los cinco son calculables con lo que el ERP registra. Eso importa: en la Fase 3 hay que presentarlos con números reales y un KPI que nadie pueda calcular se vuelve una promesa vacía.

## Stack recomendado

| Componente | Elección | Por qué |
|---|---|---|
| ERP | Odoo Community | Inventario, compras, ventas y facturación en una sola instalación |
| CRM | Odoo CRM | Nativo: no hay que construir integración con API |
| Sitio | Módulo eCommerce de Odoo | El catálogo sale solo de los productos del ERP, y trae portal de cliente |
| Base de datos | PostgreSQL | Es la que Odoo usa |
| BI | Power BI Desktop conectado a PostgreSQL | Gratuito y da reportes interactivos |
| Servidor | **Local** | Ver la sección siguiente |

Los cuatro están dentro de las listas permitidas del enunciado. La alternativa —CRM externo tipo Zoho o HubSpot— da más mérito técnico pero obliga a construir la integración a mano, y con tres días para la Fase 1 eso es riesgo puro.

## Dónde se instala: local

**Decisión: instalación local.** El enunciado lo permite sin reservas — pide *"un entorno de servidor (local o en la nube)"* — y para lo que se entrega el 19 es la opción correcta.

Por qué local gana ahora:

- Lo que se califica en la Fase 1 es el **manual de instalación con capturas**, no dónde vive el servidor. Una instalación local produce exactamente las mismas capturas.
- Quedan tres días. Contratar un VPS, configurar DNS, abrir puertos y resolver certificados es tiempo que se le quita a lo que sí da puntos.
- Cuesta cero.
- Sin proxy ni red corporativa de por medio. Instalar esto desde una máquina de trabajo es buscarse problemas; que sea en una máquina personal.

Forma recomendada, por rapidez y por lo bien que se captura:

| Opción | Qué implica | Cuándo conviene |
|---|---|---|
| **Instalador de Odoo para Windows** | Un `.exe` que trae PostgreSQL adentro. Pasos numerados y limpios | **La recomendada.** Es la que menos puede fallar y da el mejor manual |
| Docker Desktop (odoo + postgres) | Dos contenedores, reproducible, fácil de copiar entre máquinas | Si alguien ya maneja Docker |
| VirtualBox + Ubuntu 22.04 + apt | Se ve más "de servidor" en el manual, pero son muchos más pasos | Solo si sobra tiempo, y no sobra |

### El riesgo del local, y cómo se tapa

Si todo vive en una sola laptop, esa persona es punto único de falla para las tres fases. Se resuelve barato y hay que hacerlo desde el día uno:

- Odoo trae respaldo de base de datos integrado (`/web/database/manager`), que exporta un `.zip` con datos y archivos adjuntos. **Un respaldo por semana, subido a la carpeta del grupo en Drive.**
- Que al menos dos personas tengan Odoo instalado y sepan restaurar ese respaldo.
- El manual de instalación que escribe el rol 3 sirve también para esto: si está bien hecho, cualquiera del grupo puede levantar el ambiente de cero.

### Lo que hay que revisar antes de la Fase 3

Para el 24 de octubre hay que **demostrar** el sitio funcionando y la integración de extremo a extremo. Eso se puede hacer desde una laptop en la presentación, pero conviene decidirlo antes, no esa mañana. Dos salidas si hiciera falta exponerlo:

- Un túnel temporal (tipo `ngrok` o Cloudflare Tunnel) para darle una URL pública al Odoo local durante la demo.
- Mover la base a un VPS en octubre, restaurando el respaldo. El manual ya estaría escrito.

No hay que decidirlo hoy. Solo no llegar a octubre sin haberlo pensado.

> **Ojo con no confundir dos cosas.** Instalar local es una decisión *nuestra, de desarrollo académico*. El presupuesto de abajo describe lo que gastaría **RutaMoto como empresa real**, y una tienda en línea de verdad sí paga hosting y dominio. Por eso el VPS y el `.gt` siguen apareciendo en el presupuesto aunque nosotros trabajemos en una laptop. Si alguien pregunta en la presentación, esa es la respuesta.

## Presupuesto pre-operativo, primer esbozo

Para el rol 4. Ajústenlo, pero mantengan la coherencia con el resto del documento.

| Recurso | Costo estimado | Observaciones |
|---|---|---|
| VPS (4 GB RAM, 2 vCPU, 80 GB), 12 meses | Q 2,400 | Odoo Community, sin licencia |
| Dominio .gt, 1 año | Q 700 | rutamoto.gt |
| Certificado SSL | Q 0 | Let's Encrypt |
| Odoo Community y PostgreSQL | Q 0 | Código abierto |
| Power BI Desktop | Q 0 | Versión de escritorio gratuita |
| Pasarela de pago, afiliación | Q 1,500 | Más comisión por transacción |
| Inventario inicial (36 SKU) | Q 45,000 | El grueso del presupuesto |
| Equipo de cómputo y lector de códigos | Q 12,000 | Dos estaciones |
| Capacitación en Odoo | Q 3,000 | Personal de bodega y ventas |
| Fotografía de producto | Q 2,500 | 36 productos |
| **Total** | **Q 67,100** | |

---

## Dos alternativas, por si el grupo prefiere votar

| Giro | A favor | En contra |
|---|---|---|
| **Despensa gourmet guatemalteca** (cardamomo, chocolate, miel, salsas) | Buena historia de origen, proveedores de cooperativas, categorías claras | Se parece demasiado al café de la Práctica 2; el producto perecedero complica el inventario |
| **Papelería y útiles escolares y de oficina** | Segmento B2B fuerte, estacionalidad marcada en enero, muchos SKU baratos | Márgenes bajos y el caso es menos distintivo |

Mi recomendación es RutaMoto, por la primera razón de todas: es el giro donde el ciclo de compras, las cotizaciones y el control de inventario existen por necesidad del negocio y no porque la rúbrica los pida.

---

## Lo que falta decidir

1. **Si aceptan el giro.** Todo lo demás cuelga de eso.
2. **Nombre definitivo.** RutaMoto es propuesta; si a alguien se le ocurre mejor, cámbienlo ahora y no en tres días.
3. **Logo y paleta.** Los necesita el rol 1 para la portada y el rol 4 para el sitio.
4. **Verificar los datos de mercado** que quieran citar como hechos: competidores, parque vehicular, medios de pago. Lo que no tenga fuente se redacta como supuesto del caso.
