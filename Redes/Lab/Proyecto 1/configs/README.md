# Configuraciones por dispositivo — Proyecto 1

Un archivo por switch con su configuración **completa** (`show running-config`), nombrado igual que su
`hostname`: `SW-CORE.txt`, `SW-DIST-ID.txt`, `SW-ID-1.txt`, … El manual (§23) cita solo los comandos
relevantes; aquí queda la evidencia íntegra.

Cabecera obligatoria al inicio de cada archivo (misma convención que `APT_3/configs/`):

```
! ==========================================================
! SW-CORE  -  Core / VTP Server   (carne 201905884)
! Modelo: <modelo PT>   |   MAC (Bridge ID): <xxxx.xxxx.xxxx>
! Gi0/1-2 -> SW-SRV (Po1)  |  Gi0/3-4 -> SW-DIST-ID (Po2)
! ==========================================================
```

## Parámetros que deben aparecer en todos

| Parámetro | Valor | Dónde |
|---|---|---|
| Dominio / contraseña VTP | `Smart_8` / `proyecto12S2026` | todos |
| Modo VTP | Server (Core), Client (resto), Transparent (SW-COMUNES) | según rol |
| VLANs | 14, 24, 34, 44, 54, 94 | Server (y Transparent localmente) |
| Nativa de trunks | `switchport trunk native vlan 94` | todo trunk |
| STP | `spanning-tree mode pvst` | todos |
| EtherChannel | `channel-group N mode active` (LACP) | Core, SW-SRV, SW-DIST-ID |
| Banner | `Acceso Restringido - TechPark_201905884` | distribución (y Core) |

## Tres insumos, tres cosas distintas

| Ruta | Qué es | Para quién |
|---|---|---|
| **`topologia.yaml`** | Especificación **legible por máquina**: 11 switches, 15 enlaces con medio y distancia, VLANs, equipos finales, canales, resultado esperado y riesgos abiertos | Para construir el `.pkt` (incluido por MCP) |
| **`scripts/<hostname>.txt`** | El script de configuración listo para pegar en la CLI | Para configurar |
| **`<hostname>.txt`** | El volcado de `show running-config` una vez aplicado | Evidencia, **pendiente** |

El runbook completo de la sesión de Packet Tracer —construcción, configuración, las 5 capturas y las
14 evidencias— está en [`../wiki/HANDOFF-PACKETTRACER.md`](../wiki/HANDOFF-PACKETTRACER.md).

## Script y running-config

| Ruta | Qué contiene | Origen |
|---|---|---|
| **`scripts/<hostname>.txt`** | El **script de configuración** listo para pegar en la CLI de Packet Tracer, en el orden correcto | Escrito a partir del diseño (§14, §17, §18, §19). **Ya disponible** |
| **`<hostname>.txt`** (esta carpeta) | El volcado de **`show running-config`** una vez aplicado el script | Se extrae del simulador. **Pendiente** |

Los dos deben coincidir. Si no coinciden, manda el `running-config` —es lo que la red hace de
verdad— y se corrige el script y el §23 del manual.

### Cómo aplicar un script

1. En Packet Tracer, abrir el switch → pestaña **CLI**.
2. Pegar el contenido de `scripts/<hostname>.txt` completo.
3. Verificar con los comandos de §23.12 del manual.
4. `show running-config` → guardar la salida en `configs/<hostname>.txt` con la cabecera de arriba.

**Orden recomendado:** primero `SW-CORE` (es el VTP Server y crea las VLANs), después los
distribuidores y por último los de acceso. Si se hace al revés, los switches Client rechazan la
asignación de puertos a VLANs que todavía no conocen.

## Inventario

| Script | running-config | Rol | Modo VTP |
|---|---|---|---|
| ✅ `scripts/SW-CORE.txt` | ⬜ pendiente | Core / VTP Server / Root VLAN 34 y 44 | **Server** |
| ✅ `scripts/SW-SRV.txt` | ⬜ pendiente | Acceso granja de servidores (Po1) | Client |
| ✅ `scripts/SW-DIST-ID.txt` | ⬜ pendiente | Distribución I+D / Root VLAN 24 (Po2) | Client |
| ✅ `scripts/SW-ID-1.txt` | ⬜ pendiente | Acceso I+D — anillo, raíz secundaria VLAN 24 | Client |
| ✅ `scripts/SW-ID-2.txt` | ⬜ pendiente | Acceso I+D — anillo | Client |
| ✅ `scripts/SW-ID-3.txt` | ⬜ pendiente | Acceso I+D — anillo (puerto `Fa0/24` previsto en BLK) | Client |
| ✅ `scripts/SW-DIST-CORP.txt` | ⬜ pendiente | Distribución Corporativo / Root VLAN 14 y 54 | Client |
| ✅ `scripts/SW-ALA-A.txt` | ⬜ pendiente | Acceso Ala A — raíz secundaria VLAN 14 | Client |
| ✅ `scripts/SW-ALA-B.txt` | ⬜ pendiente | Acceso Ala B (puerto `Gi0/2` previsto en BLK) | Client |
| ✅ `scripts/SW-COMUNES.txt` | ⬜ pendiente | Acceso visitantes | **Transparent** |
| ✅ `scripts/SW-PLANTA.txt` | ⬜ pendiente | Acceso Legacy + contención del hub | Client |

> **Nota sobre los nombres de interfaz.** En los `2960-24TT` (SW-SRV, SW-ID-1/2/3, SW-ALA-A/B,
> SW-COMUNES) los nombres son exactos. En los cuatro **chasis modulares** (SW-CORE, SW-DIST-ID,
> SW-DIST-CORP, SW-PLANTA) la notación `Gi1/1`, `Gi2/1`… depende de en qué ranura se instale cada
> módulo: hay que ajustarla al armar el `.pkt` y luego corregir §14 y §23 del manual.

> **Riesgo abierto.** No está verificado que el chasis modular de Packet Tracer acepte
> `channel-group … mode active` sobre módulos de **fibra**. Si no lo soporta, **Po2 no se forma** y
> la redundancia del trunk de I+D hay que replantearla. Es lo primero que conviene probar al abrir el
> simulador.
