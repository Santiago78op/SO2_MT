---
tags: [redes/proyecto, proyecto1, handoff, packettracer, mcp]
aliases: ["handoff", "traspaso", "runbook packet tracer", "qué hacer en la otra PC", "mcp packet tracer"]
actualizado: 2026-09-16
---

# Traspaso a Packet Tracer — runbook para la otra PC

> **Para qué es este archivo.** Todo el trabajo de diseño y redacción está hecho y versionado. Lo que
> falta —el `.pkt`, las 5 capturas de topología y las 14 evidencias— se generará en **otra máquina**,
> con un MCP de Packet Tracer. Este documento es el guion de esa sesión: qué construir, en qué orden,
> qué capturar y dónde dejarlo, para que nadie tenga que volver a deducir el diseño.
>
> Estado del proyecto: [[AVANCE]] · Método de la clase: [[PROTOCOLO-CATEDRA]]

## Lo que ya viaja en el repo

| Insumo | Ruta | Qué es |
|---|---|---|
| **Especificación de topología** | `configs/topologia.yaml` | **Legible por máquina.** Dispositivos, 15 enlaces con medio y distancia, VLANs, equipos finales, canales y resultado esperado. Es la fuente para construir |
| **Scripts de configuración** | `configs/scripts/*.txt` | Los 11 switches, listos para pegar en la CLI |
| **Manual** | `README.md` §14, §17, §18, §19, §23 | La versión humana y justificada de lo mismo |
| **Plan de capturas** | `capturas/EVIDENCIAS.md` | Nombre de archivo, dispositivo, comando y **la línea exacta que hay que ver** en cada una |

Si algo del `.yaml` y del `README.md` se contradice, **manda el `README.md`**: es el entregable que
se califica.

---

## Fase 1 — Probar el riesgo antes de construir

**No cablear nada todavía.** Hay un supuesto sin verificar que puede obligar a rediseñar:

```
¿Acepta el chasis modular de Packet Tracer 'channel-group N mode active'
sobre módulos de FIBRA?
```

Prueba mínima: dos `Switch-PT` con módulo de fibra Gigabit, dos enlaces entre ellos, y en ambos
extremos `channel-group 2 mode active`. Verificar con `show etherchannel summary` que sale `Po2(SU)`
con los dos miembros en `(P)`.

| Resultado | Qué hacer |
|---|---|
| ✅ Forma el canal | Seguir con la Fase 2 tal cual está diseñado |
| ❌ No lo forma | **Po2 se degrada a un enlace de fibra simple.** Hay que: (1) anotarlo en §19 y en [[AVANCE]], (2) reescribir la justificación del «trunk de mayor ancho de banda» apoyándola en la fibra OM4 y no en la agregación, (3) mantener Po1 (que va sobre cobre y debería funcionar) |

Los otros dos riesgos están en `configs/topologia.yaml` → `riesgos_abiertos` (R2: la numeración
slot/puerto de los chasis modulares es **prevista**; R3: `switchport nonegotiate` podría no estar
soportado).

## Fase 2 — Construir la topología

Fuente: `configs/topologia.yaml`.

1. **11 switches** con los hostnames y modelos de `switches:`. Cuatro son modulares (SW-CORE,
   SW-DIST-ID, SW-DIST-CORP, SW-PLANTA) y necesitan módulos de fibra.
2. **15 enlaces entre switches** según `enlaces_switch:`. Respetar el **medio** de cada uno: la fibra
   sólo entra en puerto de fibra, y el enlace Core ↔ Planta va en fibra **a propósito** aunque mida
   90 m.
3. **Equipos finales** según `equipos_finales:`, con los nombres exactos (se citan en las pruebas).
4. **Etiquetar cada enlace** en el `.pkt` con su medio y distancia — lo exige el enunciado y es lo
   que debe verse en la captura F12.
5. Guardar como `Proyecto1_201905884.pkt`. Guardar copias por fase (`..._f1.pkt`, `..._f2.pkt`) para
   poder volver atrás sin rearmar.

**Si la numeración de interfaces de los chasis modulares no coincide** con la prevista (R2):
ajustarla en el `.pkt`, y después corregir `configs/topologia.yaml`, `README.md` §14 y §23, y los
scripts. El orden importa: primero el simulador, luego los documentos.

## Fase 3 — Aplicar la configuración

**Orden obligatorio:** `SW-CORE` primero. Es el VTP Server y el único que crea las VLANs; si se
configuran antes los Client, rechazan la asignación de puertos a VLANs que todavía no conocen.

```
1. SW-CORE
2. SW-DIST-ID · SW-DIST-CORP          (distribución)
3. SW-SRV · SW-ID-1/2/3 · SW-ALA-A/B · SW-PLANTA   (acceso)
4. SW-COMUNES                          (Transparent: crea sus VLANs a mano)
```

Cada script está en `configs/scripts/<hostname>.txt` y se pega entero en la pestaña **CLI**.
Ya incluyen la puesta a cero de la revisión VTP (`vtp mode transparent` → `vtp mode client`), que
**no es opcional**: un switch con revisión más alta puede borrar las VLANs de todo el dominio.

Al terminar cada switch: `show running-config` → guardar en `configs/<hostname>.txt` con la cabecera
que define `configs/README.md`.

## Fase 4 — Las 5 capturas de topología

Van en `capturas/topologia/` y `capturas/areas/`, con estos nombres exactos:

| Fig. | Archivo | Qué tiene que verse |
|---|---|---|
| **F12** | `topologia/00-topologia-completa.png` | El campus entero con **las etiquetas de medio y distancia visibles**. Deben distinguirse los tres niveles y los dos canales agregados |
| **F14** | `areas/01-centro-de-datos.png` | SW-CORE, SW-SRV, los 4 servidores y los **dos cables** de Po1 |
| **F15** | `areas/02-centro-id.png` | SW-DIST-ID, el anillo de 3 switches con sus **dos** uplinks, las 8 PC y los dos cables de Po2 |
| **F16** | `areas/03-edificio-corporativo.png` | Las dos alas, el **enlace directo entre ellas**, SW-COMUNES y el AP con sus laptops |
| **F17** | `areas/04-planta-produccion.png` | El hub con las 4 máquinas colgando de **un solo** puerto del switch, y las 2 PC de supervisión aparte |

Las cuatro de área deben poder leerse solas: si el nombre de un dispositivo no se distingue, la
captura no sirve como evidencia.

## Fase 5 — Las 14 evidencias

El detalle completo —dispositivo, comando, nombre de archivo y **la línea exacta que demuestra el
punto**— está en `capturas/EVIDENCIAS.md`. Resumen del orden de ejecución:

| Bloque | Evidencias | Comando principal |
|---|---|---|
| VTP | E1, E2 | `show vtp status` · `show vlan brief` |
| STP | E3, E4 | `show spanning-tree` · `show spanning-tree vlan 14 / 24` |
| EtherChannel | E5 | `show etherchannel summary` |
| Trunks y seguridad | E6, E7, E8 | `show interfaces trunk` · banner al entrar · `show port-security interface Fa2/1` |
| Conectividad | E9, E10, E11 | `ping` intra-VLAN, inter-VLAN y desde visitantes |
| Tolerancia a fallos | E12, E13, E14 | apagar SW-ID-2 · apagar uplink de SW-ALA-B · apagar un miembro de Po1 |

**Dos cosas que se hacen mal a menudo:**

- **E10 y E11 deben FALLAR.** Un ping al 100 % de pérdida entre VLANs distintas es el resultado
  **correcto**: demuestra el aislamiento. No es un error que haya que arreglar.
- **E12–E14 son tres capturas cada una**, no una: *antes* (el puerto en `BLK`), *durante* (interfaz
  apagada, ping perdiendo paquetes) y *después* (el puerto en `FWD`, ping recuperado). Sufijos
  `-antes`, `-durante`, `-despues`. **Cronometrar** la recuperación: en E12 y E13 debe rondar los
  30–50 s de PVST+; en **E14 debe ser casi inmediata**, y si tarda 30 s significa que el
  EtherChannel no se formó.

## Fase 6 — Volcar los resultados al Manual

Esto es lo que convierte las capturas en entregable:

| Dónde | Qué escribir |
|---|---|
| **§24.1** | Una ficha por prueba con el **resultado obtenido transcrito**, no anticipado |
| **§24.2** | Los tiempos de convergencia medidos, contrastados con los 30–50 s teóricos |
| **§24.3** | El resumen: ejecutadas / aprobadas / falladas y corregidas |
| **§18** | Si el puerto bloqueado **no** es el previsto, corregir la tabla y explicar por qué |
| **§19** | Si algún miembro no llega a `(P)`, documentar la causa |
| **§11** | Dos líneas de lectura de la F12 |
| **F13, F18, F19** | Contrastarlas contra la realidad del `.pkt` y corregirlas si difieren |

**La regla, y es la que más importa:** si el simulador contradice al documento, **gana el
simulador**. Se corrige el documento y se anota qué cambió y por qué. Un resultado que falla y se
explica vale más que una tabla de ✅ sin evidencia detrás.

## Fase 7 — Antes de entregar

- [ ] `Proyecto1_201905884.pkt` en la raíz de `Proyecto 1/`
- [ ] 5 capturas + 14 evidencias en sus carpetas, con los nombres de `capturas/EVIDENCIAS.md`
- [ ] Los 11 `configs/<hostname>.txt` con el `running-config` real
- [ ] §24 relleno con resultados **obtenidos**
- [ ] Precios del §26 cotizados (o declarado explícitamente que no se cotizaron)
- [ ] **Borrar los comentarios `<!-- -->`** de guía que queden en `README.md`
- [ ] Borrar del `README.md` la sección «Mapa de lecciones → secciones», que es andamiaje interno
- [ ] Verificar que la carpeta se llama exactamente **`Proyecto 1`**

## Lo que este traspaso NO cubre

La **lección 9 / §25, la parte física de laboratorio**, sigue bloqueada: necesita fecha de
laboratorio, pareja confirmada y dos switches reales. El procedimiento y las cuatro evidencias
L1–L4 están escritos en §25, listos para ejecutarse en una sola sesión.
