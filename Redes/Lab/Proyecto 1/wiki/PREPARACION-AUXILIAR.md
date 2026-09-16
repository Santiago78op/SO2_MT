---
tags: [redes/proyecto, proyecto1, calificacion, defensa, laboratorio, auxiliar]
aliases: ["defensa", "calificación", "qué va a preguntar el auxiliar", "preparación auxiliar", "prep defensa"]
actualizado: 2026-09-16
---

# Qué va a pedir el auxiliar — preparación para la calificación

> [!warning] Esto es **anticipación razonada**, no la rúbrica
> El PDF del enunciado **no incluye la §8.2 «Detalle de la Calificación»** (solo aparece en el
> índice), así que **no se sabe cómo se reparten los 22 puntos**. Todo lo de abajo se deduce de tres
> fuentes que sí están completas: la lista de entregables de **§4.5**, los requisitos para optar a
> nota de **§8.1** y la descripción de la parte física de **§4.4**.
>
> **Acción previa:** pedirle al auxiliar la versión completa del enunciado o la rúbrica detallada.
> Es la duda #1 de [[AVANCE]] y sigue sin preguntar.

Calificación: **18–19/09/2026**. Estado del proyecto: [[AVANCE]] · Runbook del simulador:
[[HANDOFF-PACKETTRACER]].

---

## 1. Los cinco «mata-nota» de §8.1 — revisar ANTES de entrar

Estos no dan puntos: **su ausencia los quita todos**. Dos minutos de revisión.

| # | Requisito | Cómo se verifica en 10 segundos |
|---|---|---|
| 1 | Carpeta llamada **exactamente** `Proyecto 1` en el repo de la práctica | Mirar la URL de GitHub. Un espacio de más, un acento, y no cuenta |
| 2 | Entrega por **UEDI o Classroom** | Otro medio **se anula**. No vale «se lo mando por correo» |
| 3 | Manual Técnico **en Markdown dentro de la carpeta** | Es `Proyecto 1/README.md`, no un PDF ni un `.docx` |
| 4 | **Esquema de VLANs por carné** | Penaliza del **−50 % al −100 %**. Ver el §2 de abajo |
| 5 | **Originalidad** | Una topología idéntica a la de otro estudiante **es copia aunque cambien los parámetros** |

Sobre el punto 5, conviene tener la respuesta lista porque es la que más incomoda improvisar: lo que
hace propio este diseño no son las VLANs (ésas las asigna el carné), son **las decisiones**: el
anillo de I+D con **dos** uplinks y no uno, el Root Bridge en el distribuidor y no en el Core, el
enlace de cierre del anillo en 100 Mbps a propósito, y la fibra a la Planta decidida por EMI y no
por distancia. Las cuatro están justificadas en el Manual y en [[AVANCE]] con su porqué.

---

## 2. Verificación relámpago de los parámetros por carné

Es lo primero que suele mirar un auxiliar porque es objetivo y rápido. Carné **201905884** → `X = 4`,
`# = 8`.

| Parámetro | Valor correcto | Comando que lo demuestra |
|---|---|---|
| VLANs | **14, 24, 34, 44, 54** | `show vlan brief` |
| Nombres | `GERENCIA` `INVESTIGACION` `PRODUCCION` `SERVIDORES` `VISITANTES` | `show vlan brief` |
| VLAN nativa | **94** en **todos** los trunks | `show interfaces trunk` → columna `Native vlan` |
| Dominio VTP | **`Smart_8`** | `show vtp status` |
| Contraseña VTP | `proyecto12S2026` | `show vtp password` |
| EtherChannel | **LACP** (carné par) | `show etherchannel summary` → columna `Protocol` |
| Spanning Tree | **PVST+** (carné par) | `show spanning-tree summary` → `Switch is in pvst mode` |
| Banner MOTD | `Acceso Restringido - TechPark_201905884` | Entrar por consola |
| Archivo | `Proyecto1_201905884.pkt` | El nombre del archivo |

**El error de un dígito cuesta la mitad de la nota.** Revisarlo con el archivo abierto, no de memoria.

---

## 3. El recorrido probable de la calificación

Lo más probable es que el auxiliar siga la lista de entregables de §4.5, porque es la única que la
rúbrica visible referencia. En ese orden:

| Bloque | Qué va a pedir | Dónde está listo |
|---|---|---|
| **A. Abrir el `.pkt`** | Ver la topología completa y las etiquetas de medio | `Proyecto1_201905884.pkt`, §11 |
| **B. Parámetros** | Los 9 valores de la tabla de arriba | §10, §13 |
| **C. Los tres `show` obligatorios** | `show spanning-tree` · `show etherchannel summary` · `show interfaces trunk` | §24, E3–E6 |
| **D. Las tres justificaciones** | VTP Server · Root Bridge **por cada VLAN** · cada EtherChannel | §17, §18, §19 |
| **E. Las dos tablas de dominios** | Colisión (por puertos activos + el del hub) y broadcast (uno por VLAN) | §15, §16 |
| **F. Medios** | Por qué cada segmento va en cobre o fibra | §20 |
| **G. Legacy** | Impacto del hub y qué lo contiene | §21 |
| **H. Pruebas en vivo** | Pings y tirar un enlace | §24, §5 de este documento |
| **I. Presupuesto** | Switches, módulos de fibra, cableado | §26 — **ojo: sin precios** |
| **J. Parte física** | Los dos switches reales | §25, §6 de este documento |

**Dos puntos débiles conocidos, que conviene declarar antes de que los encuentren:**

1. **El presupuesto no tiene precios**, sólo cantidades. La razón está escrita en §26: no se cotizó
   nada, y poner cifras sin origen habría sido presentar una suposición como dato. Si el auxiliar lo
   exige con números, es un pendiente reconocido, no un olvido.
2. **Las figuras F13, F18 y F19 se dibujaron antes de configurar.** Deben coincidir con las
   evidencias; si el simulador dice otra cosa, manda el simulador.

---

## 4. Preguntas probables, con la respuesta

Ordenadas por tema. **⚠ = trampa**: la respuesta intuitiva es la equivocada.

### Dominios de colisión y broadcast

| Pregunta | Respuesta |
|---|---|
| ¿Cuántos dominios de colisión tiene la red? | **54**: 53 cableados + 1 inalámbrico. La regla es **un dominio por puerto de switch con cable conectado** |
| ⚠ El hub tiene 4 máquinas, ¿suma 4 dominios? | **No. Suma uno, y lo ensancha.** El hub, sus 4 máquinas y el puerto de SW-PLANTA al que cuelga son **un solo** segmento compartido, de 6 miembros. Contarlos aparte inflaría el total |
| ¿Por qué 52 de los 54 no importan? | Son punto a punto en **full-duplex**: la colisión es estructuralmente imposible y el dominio existe sólo a efectos del conteo. Los únicos reales son el del hub y el del AP (Wi-Fi, CSMA/CA) |
| ⚠ El Edificio Corporativo tiene 3 switches, ¿3 dominios de broadcast? | **No, 2.** Se cuenta **por VLAN**, no por equipo: Ala A y Ala B comparten la VLAN 14 y forman **un** dominio aunque estén en switches distintos; Áreas Comunes está en la 54 |
| ⚠ Si encadeno switches, ¿reduzco el broadcast? | **Al contrario: lo extiendo.** El switch parte colisión pero **no** parte broadcast — esa asimetría es la que obliga a usar VLANs |
| ¿Cuántos dominios de broadcast hay? | **5 con usuarios** (14, 24, 34, 44, 54) + la **94** nativa, que existe pero está vacía a propósito |

### VLANs y 802.1Q

| Pregunta | Respuesta |
|---|---|
| ¿Cuántos bytes añade el tag 802.1Q y dónde? | **4 bytes**, entre la MAC de origen y el campo Tipo. Eleva la trama máxima de 1518 a **1522** y obliga a recalcular el FCS |
| ¿Por qué hay 4094 VLANs y no más? | El campo **VLAN ID son 12 bits** → 4096 valores, de los que 1–4094 son utilizables |
| ¿La PC sabe en qué VLAN está? | **No.** Envía Ethernet corriente sin etiqueta. La VLAN es propiedad **del puerto del switch**, por eso cambiarla no requiere tocar la PC |
| ¿Por qué la nativa es la 94 y no la 1? | Para cerrar el **VLAN hopping por doble etiquetado**. Y no basta con moverla: hay que dejarla **sin ningún puerto de acceso**, que es lo que hace este diseño |
| ⚠ ¿Una VLAN nativa desalineada es sólo un aviso de CDP? | **No.** Además del *Native VLAN mismatch*, **puede producir bucles de STP**, porque las BPDU de una VLAN llegan a la instancia de otra |
| ¿Qué es el switch spoofing? | Un puerto en modo dinámico acepta negociar un trunk por DTP. El atacante queda en **todas** las VLANs del trunk, y es **bidireccional** — más grave que el doble tag. Se cierra fijando el modo a mano y con `switchport nonegotiate` |

### VTP

| Pregunta | Respuesta |
|---|---|
| ¿Por qué SW-CORE es el Server? | Es el punto por el que pasan los cuatro trunks del campus: un anuncio suyo llega a los tres edificios **en un salto**. Además el enunciado lo exige para el Centro de Datos |
| ¿VTP asigna puertos a VLANs? | **No.** Propaga la **existencia** de las VLANs (ID y nombre). Asignar puertos es siempre manual, switch por switch |
| ¿Por qué SW-COMUNES es Transparent? | Porque el enunciado pide aislamiento **de tráfico y de administración de VLANs**. La VLAN 54 da lo primero; Transparent da lo segundo: ese switch **ni siquiera sabe que existe la VLAN 44** |
| ⚠ Un Client no puede crear VLANs, ¿entonces no puede dañar el dominio? | **Sí puede, y es el riesgo clásico.** Si llega con un **número de revisión más alto**, todos los switches **sobrescriben** su base de VLANs con la suya. Un Client de laboratorio con revisión 47 borra un dominio en revisión 12 |
| ¿Cómo se evita? | Poner la revisión en **0** antes de conectar: `vtp mode transparent` → `vtp mode client`. Más la contraseña del dominio. Está en todos los scripts de `configs/scripts/` |

### STP y PVST+

| Pregunta | Respuesta |
|---|---|
| ¿Por qué hace falta STP? | Porque **Ethernet no tiene TTL**. Con un camino redundante, una trama de difusión circula para siempre y produce tormenta, tabla MAC inestable y tramas duplicadas |
| ¿Qué es el Bridge ID? | **Prioridad (4 bits) + ID de sistema extendido (12 bits = VLAN) + MAC**. Por eso la prioridad efectiva de la VLAN 24 se lee como `24576 + 24` |
| ⚠ ¿Por qué el Root Bridge no está en el Core? | Porque **el puerto que STP bloquea es el más alejado de la raíz**. Con la raíz en el distribuidor del edificio, el bloqueo cae sobre el **enlace de respaldo** (Ala A ↔ Ala B) y no sobre un uplink de uso diario. Con la raíz en el Core no es un error, pero el bloqueo lo deciden las MAC en vez del diseño |
| ¿Por qué está bloqueado **ese** puerto y no otro? | Ambas alas empatan a costo 4, así que desempata el **BID**: SW-ALA-A lleva prioridad 28672 y SW-ALA-B la de defecto 32768, así que ALA-A gana el designado y **ALA-B bloquea**. En I+D, SW-ID-1 lleva 28672 por la misma razón |
| ¿Cuánto tarda en recuperarse? | **30 s** (Listening 15 + Learning 15), y hasta **50 s** si antes hay que esperar el *max age* de 20 s |
| ⚠ ¿PVST+ es el modo por defecto? | **No.** Es un modo que **se selecciona** con `spanning-tree mode pvst`, y el comando debe aparecer en la configuración |
| ¿Por qué no Rapid-PVST+, que converge en segundos? | Porque el **carné par asigna PVST+**, y cambiarlo penaliza del −50 % al −100 %. Queda anotado como mejora futura en §28 |

### EtherChannel y LACP

| Pregunta | Respuesta |
|---|---|
| ¿Qué problema resuelve? | Si se tienden 4 cables entre dos switches, STP bloquea 3: quedan 1 Gbps útiles y 3 desperdiciados. EtherChannel los presenta como **un enlace lógico**, así que STP no bloquea ninguno |
| ⚠ Po1 es de 2 Gbps, ¿una transferencia entre dos equipos va a 2 Gbps? | **No.** El reparto se hace por *hash* **por conversación**, no por trama: una sola conversación **no supera la velocidad de un miembro**. Los 2 Gbps son capacidad total repartida entre flujos distintos |
| ¿Por qué `active` y no `on`? | `on` fuerza el canal **sin negociar**. Ante un error de cableado produce un **bucle**; LACP simplemente no levanta el canal y deja que STP bloquee. Es fallar seguro frente a fallar catastróficamente |
| ¿Qué pasa si los dos extremos están en `passive`? | **El canal nunca se forma.** `passive` sólo responde, no inicia |
| ¿Qué significa `Po1(SU)` y `Gi1/1(P)`? | `S` = Capa 2, `U` = *in use*, `(P)` = *bundled*, el puerto está agrupado. Un miembro en `(I)` significa que LACP **no** negoció |

### Medios

| Pregunta | Respuesta |
|---|---|
| ⚠ ¿Por qué el enlace a la Planta va en fibra si mide 90 m y el cobre llega a 100? | Porque el criterio que decide **no es la distancia sino la EMI**: motores, variadores de frecuencia y soldadura inducen ruido que degrada el UTP. Además aísla galvánicamente ambos edificios. **Es el único enlace del campus que no se decide por distancia** |
| ¿De dónde salen los 100 m? | **ANSI/TIA-568**: 90 m de cableado horizontal + 10 m de *patch cords*. Es un **límite normativo**, no una recomendación: a 180 m el enlace no va lento, no va |
| ¿Por qué no fibra en todos lados? | Por el cuarto criterio, el costo. El Po1 son 10 m dentro del mismo rack: los tres primeros criterios empatan a favor del cobre y poner fibra sería pagar transceptores sin ganancia |

### Seguridad y Legacy

| Pregunta | Respuesta |
|---|---|
| ⚠ El ping entre VLANs te falla. ¿Es un error? | **No: es el resultado correcto.** Las VLANs **aíslan**, no comunican. Comunicarlas exigiría Capa 3 (*routing* inter-VLAN), que está fuera del alcance de este proyecto. El 100 % de pérdida es evidencia de éxito |
| ⚠ ¿`storm-control` resuelve la colisión del hub? | **No.** Limita el tráfico de difusión; **no convierte el medio compartido en conmutado**. Las 4 máquinas siguen disputándose el mismo canal. Lo único que lo eliminaría es sustituir el hub por un switch |
| ¿Qué NO resuelve `port-security`? | La **MAC es falsificable**: quien clone la autorizada pasa igual. Y mal dimensionado deja puertos caídos por un cambio legítimo de equipo |
| ¿Por qué `violation restrict` y no `shutdown`? | `shutdown` deja el puerto en *err-disabled* y exige intervención manual. En una planta de producción eso convierte un incidente de red en una **parada no programada** |
| ¿El banner impide el acceso? | **No.** Es un **aviso legal**: evita que un acceso no autorizado alegue desconocimiento. No cifra, no autentica y no bloquea |

---

## 5. Tareas en vivo que puede pedir, con los comandos

Lo más probable es que pida **demostrar**, no explicar. Los comandos, listos:

### «Agregá una VLAN nueva y mostrame que se propaga»

```
! En SW-CORE (el único Server)
configure terminal
 vlan 64
  name PRUEBA
 exit
end
show vtp status            ! la revisión subió en 1

! En cualquier Client, p. ej. SW-ALA-A
show vlan brief            ! la VLAN 64 aparece SIN haberla creado aquí
```

Si además pregunta por SW-COMUNES: **ahí no aparece**, porque está en Transparent. Ésa es la
demostración del aislamiento de administración.

### «Mové esta PC a otra VLAN»

```
configure terminal
 interface FastEthernet0/1
  switchport access vlan 24
 exit
end
show vlan brief            ! el puerto cambió de fila
```

Y el efecto que hay que señalar: esa PC **deja de ver** a las de su VLAN anterior. Sin tocar un cable.

### «Hacé que otro switch sea la raíz de una VLAN»

```
configure terminal
 spanning-tree vlan 14 priority 8192      ! menor que el 24576 actual
end
show spanning-tree vlan 14               ! "This bridge is the root"
```

Y señalar que **el puerto bloqueado se movió**, porque el bloqueo depende de dónde está la raíz.

### «Demostrá la tolerancia a fallos»

```
! 1. ANTES: dónde está el puerto bloqueado
show spanning-tree vlan 14      ! SW-ALA-B Gi0/2 en Altn BLK

! 2. Tirar el uplink
configure terminal
 interface GigabitEthernet0/1
  shutdown
 end

! 3. DESPUÉS: el puerto bloqueado tomó el relevo
show spanning-tree vlan 14      ! Gi0/2 ahora en FWD
! y el ping entre alas se recupera en ~30 s
```

**Cronometrarlo y decir el número en voz alta.** Que tarde 30 s no es un defecto: es lo que PVST+
tarda, y saberlo de antemano demuestra que se entendió.

### «Demostrá que el EtherChannel es distinto»

```
! Tirar UN miembro de Po1
configure terminal
 interface GigabitEthernet1/1
  shutdown
 end
show etherchannel summary       ! Po1 sigue en (SU), con un solo miembro (P)
```

El punto que hay que señalar: **el ping no se corta y no hay 30 s de espera**, porque desde el punto
de vista de STP la topología no cambió. Es la diferencia entre agregación y redundancia por STP.

### «Mostrame el banner»

Salir y volver a entrar por consola al switch de distribución. Debe aparecer
`Acceso Restringido - TechPark_201905884` **antes** del prompt.

---

## 6. Parte física: los dos switches reales (§4.4)

Es por **pareja**, un switch cada uno. Lo que exige el enunciado es corto y concreto:

| Paso | Switch 1 (Server) | Switch 2 (Client) |
|---|---|---|
| 1 | `vtp domain Smart_8` + `vtp password proyecto12S2026` + `vtp mode server` | **Primero** `vtp mode transparent` → `vtp mode client` (revisión a 0), luego dominio y contraseña |
| 2 | Crear las 5 VLANs con sus nombres | **No crear nada**: deben llegar solas |
| 3 | Puerto de interconexión en `switchport mode trunk` + `switchport trunk native vlan 94` | Igual, en ambos extremos |
| 4 | Puertos a PC en `switchport mode access` + su VLAN | Igual |
| 5 | `show vtp status` → Server | `show vlan brief` → **las 5 VLANs sin haberlas creado** |

**Si las VLANs no se propagan**, revisar en este orden (es el orden en que suelen fallar):

| # | Revisar | Comando |
|---|---|---|
| 1 | ¿El enlace entre switches es **trunk** de verdad? VTP **no viaja por puertos access** | `show interfaces trunk` |
| 2 | ¿El **dominio** coincide exactamente, mayúsculas incluidas? | `show vtp status` |
| 3 | ¿La **contraseña** coincide? | `show vtp password` |
| 4 | ¿El Client tiene una **revisión más alta** que el Server? Entonces el problema es al revés: está imponiendo la suya | `show vtp status` |
| 5 | ¿La **versión** de VTP coincide en ambos? | `show vtp status` |

Evidencias a llevarse: **L1** foto del montaje · **L2** `show vtp status` del Server · **L3**
`show vlan brief` del Client · **L4** ping entre PCs de la misma VLAN en switches distintos.

---

## 7. Si algo falla en vivo

Pasa, y cómo se reacciona también se califica. Tres reglas:

1. **Decir qué se esperaba y qué salió.** «Esperaba ver el puerto en `BLK` y está en `FWD`» vale
   mucho más que quedarse callado tocando teclas.
2. **Diagnosticar en voz alta, de lo físico a lo lógico.** ¿El enlace está arriba? ¿Es trunk? ¿La
   VLAN existe en los dos? ¿El puerto está en la VLAN correcta?
3. **No inventar.** Si algo no se midió, se dice. El Manual está escrito con ese criterio —cada
   sección que depende del simulador lo declara en su encabezado— y conviene sostenerlo en la
   defensa.

---

## 8. Las tres preguntas que hay que hacerle al auxiliar

Están abiertas desde el 07/09 y siguen **sin preguntar** ([[AVANCE]]):

| # | Pregunta | Por qué importa |
|---|---|---|
| **1** | El PDF no incluye la **§8.2 «Detalle de la Calificación»** ni la §8.3, y la §6 «Metodología» está vacía. ¿Hay una versión completa? | **Se desconoce cómo se reparten los 22 puntos.** Es la que más pesa |
| **2** | Los nombres de VLAN: la tabla escribe `Gerencia`, el ejemplo dice «exactamente `GERENCIA`». ¿Mayúsculas obligatorias? | Se adoptaron **mayúsculas**. Si el criterio es el otro, es un cambio de 5 comandos — pero hay que saberlo antes |
| **3** | **Fecha del laboratorio** de la parte física y confirmación de la pareja | La §25 depende de esto y es lo único del Manual que no se puede avanzar solo |
