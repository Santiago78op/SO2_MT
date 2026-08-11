# Manual — Práctica 1: contador de `sys_getpid()` + syscall `getpid_counter()`

> **Curso:** Sistemas Operativos 2 · 2S2026 · **Ponderación:** 5 pts (100 pts internos)
> **Entrega:** 19/08/2026 · rama = tu carné · carpeta `Practica_1_2S2026`
> **Kernel exigido por el lab:** `linux-6.12.69.tar.xz`
> **Basado en:** tu entorno real de la Tarea 3 (Debian 13 **arm64**, VMware Fusion, Mac M5)

---

## 📖 Cómo usar este manual

Está partido en tres partes con propósitos distintos:

| Parte | Qué es | Cuándo leerla |
|---|---|---|
| **PARTE 0 — TEORÍA** | El *por qué*. Qué es una syscall, qué pasa en el cruce usuario→kernel, por qué `int++` está mal. | **Antes de tocar código.** 25 min de lectura que te ahorran 3 horas de confusión. |
| **PARTE 1 — EJECUCIÓN** | El *cómo*. Comandos exactos, archivo por archivo, con verificación en cada paso. | Con la VM abierta al lado. |
| **PARTE 2 — INFORME** | Material para el entregable escrito y la pregunta teórica de 5 pts. | Al final, cuando ya funcionó. |
| **PARTE 3 — ERRORES** | Los fallos concretos y cómo salir de cada uno. | Cuando algo explote. |

**Convención:** los bloques marcados **⛔ VERIFICAR** no son opcionales. Si la salida no coincide, parás ahí — no seguís. Los marcados **🔧 CAMPO** son cosas que muerden en la práctica real y que ningún tutorial de internet menciona.

---

## 🎯 Supuestos de partida (verificalos antes de arrancar)

El lab exige **`linux-6.12.69`**. Este manual asume que venís de la Tarea 3 (donde compilaste un 6.12.x distinto, probablemente `6.12.102`) y que vas a bajar el 6.12.69 heredando la configuración que ya te funcionó. Confirmá el punto de partida:

```bash
uname -m          # esperado: aarch64   ← arquitectura
uname -r          # tu kernel de la Tarea 3, ej. 6.12.102-<tunombre>-<tucarne>
ls ~/kernel/      # el árbol de la Tarea 3
df -h /           # ⚠️ esperado: >= 20 GB libres (vas a tener DOS árboles)
```

> **⛔ Sobre la versión.** 6.12.69 y 6.12.102 son releases *stable* de la misma serie LTS, y **son idénticos en todo lo que toca esta práctica**: mismo `SYSCALL_DEFINE0(getpid)` en `kernel/sys.c`, misma tabla terminando en `462 common mseal` (→ tu syscall es la **463**), mismo symlink de arm64. Todos los pasos, rutas y números de este manual valen igual para ambos. Lo único que cambia es que con un árbol nuevo la compilación es **completa** (1–2 h) y no incremental.

| Si `uname -m` dice… | Entonces… |
|---|---|
| `aarch64` | Sos **arm64**. Seguí este manual tal cual. |
| `x86_64` | Sos **x86_64**. Todo aplica, pero **§1.6 cambia de archivo** — está marcado ahí. |

> **🔧 CAMPO — no borres el árbol de la Tarea 3.** Te sirve para dos cosas: (1) heredar su `.config`, que ya tiene resueltos `MODULE_SIG`, `localmodconfig` y los drivers de VMware — eso te ahorra repetir toda esa pelea; (2) su kernel instalado queda como **opción de arranque de rescate** en GRUB si el nuevo falla.

### 🧠 Misma VM, misma distro, kernel adicional

**Usás la MISMA máquina virtual y la MISMA instalación de Debian 13 de la Tarea 3.** No creás una VM nueva ni reinstalás nada. La distro y el kernel son cosas separadas:

| | Qué es | Dónde vive |
|---|---|---|
| **Distro** (Debian 13) | El *userspace*: glibc, systemd, apt, bash, `/etc`, tu home, GCC | Todo el filesystem |
| **Kernel** | Una imagen + sus módulos | `/boot/` y `/lib/modules/` |

Una instalación de Debian soporta **varios kernels en paralelo**. Cada uno deja su propio juego de archivos identificado por su *release string*, así que no se pisan:

```
/boot/vmlinux-6.12.69-jbarrera-202012345      ← el nuevo
/boot/initrd.img-6.12.69-jbarrera-202012345
/lib/modules/6.12.69-jbarrera-202012345/      ← sus módulos
```

Elegís cuál arrancar en GRUB (*Advanced options*). Al cambiar de kernel **tu sistema sigue siendo el mismo**: mismos programas, mismos archivos, misma configuración. Solo cambia el núcleo por debajo.

Comprobalo:
```bash
ls /boot/ | grep -E "vmlinu|initrd"
ls /lib/modules/
```

> **No desinstales el kernel de la Tarea 3** ni el original de Debian. Son tus opciones de rescate en GRUB.

Y sí: podés **compilar** el 6.12.69 mientras estás **corriendo** el 6.12.102. Compilar es trabajo de userspace (GCC, make) — no requiere estar ejecutando el kernel que construís.

> **⚠️ Por qué `make modules_install` no es opcional.** Cuando arranques el 6.12.69, sus módulos se cargan desde `/lib/modules/6.12.69-.../`. Si ese directorio no existe o está incompleto, el kernel arranca sin drivers de disco o de red → pánico. Es la causa #1 de "compiló bien pero no bootea".

**Fijá tus variables** (en cada terminal nueva):

```bash
export KVER="6.12.69"                          # la versión que exige el lab
export KDIR="$HOME/kernel/linux-$KVER"
export KVER_T3="6.12.102"                      # ⚠️ tu versión de la Tarea 3
export KDIR_T3="$HOME/kernel/linux-$KVER_T3"
export CARNE="202012345"                       # ⚠️ tu carné real
echo "Nuevo: $KDIR" ; echo "Tarea 3: $KDIR_T3"
```

---

## Índice

**[PARTE 0 — TEORÍA](#parte-0)**
- [0.1 ¿Qué es realmente una llamada al sistema?](#t01)
- [0.2 El viaje completo de `getpid()`](#t02)
- [0.3 Por qué no podés llamar a una función del kernel directamente](#t03)
- [0.4 Qué hace la macro `SYSCALL_DEFINE0`](#t04)
- [0.5 La tabla de syscalls: el número **es** la API](#t05)
- [0.6 Mapa de los 4 archivos que vas a tocar](#t06)
- [0.7 Concurrencia: por qué `contador++` está mal](#t07)
- [0.8 `printk`, niveles de log y el ring buffer](#t08)

**[PARTE 1 — EJECUCIÓN](#parte-1)**
- [1.0 Ruta mínima (resumen)](#p10)
- [1.1 Snapshot — tu seguro de vida](#p11)
- [1.1b Bajar el 6.12.69 y heredar el `.config`](#p11b)
- [1.1c Preparar el repo — 📸 y 💾 desde el arranque](#p11c)
- [1.2 Reconocimiento: no adivines, inspeccioná](#p12)
- [1.3 Archivo 1 — el contador en `kernel/sys.c`](#p13)
- [1.4 Archivo 2 — la syscall `getpid_counter()`](#p14)
- [1.5 Archivo 3 — el prototipo en `include/linux/syscalls.h`](#p15)
- [1.6 Archivo 4 — la tabla de syscalls](#p16)
- [1.7 Compilar (incremental)](#p17)
- [1.8 Instalar y arrancar](#p18)
- [1.9 El programa de prueba](#p19)
- [1.10 Verificar con `dmesg`](#p110)
- [1.11 Evidencias y estructura del repo](#p111)

**[PARTE 2 — INFORME](#parte-2)** · **[PARTE 3 — ERRORES](#parte-3)**

---
<a name="parte-0"></a>
# 🧠 PARTE 0 — TEORÍA

<a name="t01"></a>
## 0.1 ¿Qué es realmente una llamada al sistema?

Tu programa en C corre en **espacio de usuario** (en ARM64: nivel de excepción **EL0**). El kernel corre en **espacio de kernel** (**EL1**). Son dos mundos con privilegios distintos, y la separación la impone el **hardware**, no el software.

En EL0 la CPU **físicamente te prohíbe**:
- ejecutar instrucciones privilegiadas (cambiar tablas de páginas, apagar interrupciones),
- leer o escribir memoria marcada como del kernel,
- hablarle directo al hardware.

Entonces, ¿cómo hace tu programa para obtener su PID, si esa información vive en una estructura del kernel? No puede leerla. Lo que puede hacer es **pedir que el kernel la lea por él**.

Ese pedido es la llamada al sistema: **la única puerta legítima de EL0 a EL1**. Y es una puerta angosta a propósito — no podés saltar a cualquier dirección del kernel, solo podés decir *"ejecutá la operación número N"*. El kernel valida N contra su tabla y ejecuta solo lo que está registrado ahí.

> **La idea que tenés que llevarte:** una syscall no es una llamada a función. Es una **excepción controlada** — le pedís al hardware que suba el nivel de privilegio y salte a un punto de entrada fijo del kernel. Es más parecido a una interrupción que a un `call`.

<a name="t02"></a>
## 0.2 El viaje completo de `getpid()`

Esto es lo que pasa cuando escribís `getpid()` en C. Seguilo con el dedo, porque es exactamente el camino que vas a instrumentar:

```
   ESPACIO DE USUARIO (EL0)
┌──────────────────────────────────────────────────────────┐
│ 1. tu_programa.c:   pid_t p = getpid();                  │
│                              │                           │
│ 2. glibc (wrapper):  mov  x8, #172      ← nº de syscall  │
│                      svc  #0            ← ¡LA PUERTA!    │
└──────────────────────────────┬───────────────────────────┘
                               │  el hardware conmuta EL0 → EL1
   ESPACIO DE KERNEL (EL1)     ▼
┌──────────────────────────────────────────────────────────┐
│ 3. Tabla de vectores de excepción  (arch/arm64/kernel/    │
│    entry.S)  →  el0t_64_sync  →  el0_svc                 │
│                                                           │
│ 4. arch/arm64/kernel/syscall.c :  invoke_syscall()        │
│      lee x8 (=172), valida  172 < __NR_syscalls           │
│                                                           │
│ 5. sys_call_table[172]  →  __arm64_sys_getpid             │
│      (puntero generado automáticamente)                  │
│                                                           │
│ 6. kernel/sys.c :  SYSCALL_DEFINE0(getpid)         ◄──────┼── ACÁ
│      { return task_tgid_vnr(current); }             AQUÍ  │   PONÉS
│                                                           │   EL
│ 7. retorno en x0  →  eret  (vuelve a EL0)                │   CONTADOR
└──────────────────────────────────────────────────────────┘
```

Lo importante de cada paso:

| Paso | Concepto que te enseña |
|---|---|
| 2 | El **número** viaja en un registro (`x8` en arm64, `rax` en x86_64). Los argumentos en `x0`–`x5`. Es una **ABI**: un contrato binario. |
| 2 | `svc #0` = *supervisor call*. En x86_64 es la instrucción `syscall`. Es la que dispara el cambio de privilegio. |
| 3 | El kernel **no confía** en dónde querés saltar. Solo hay un punto de entrada. |
| 4 | La validación `nº < __NR_syscalls` es lo que impide que pidas la syscall 99999 y leas memoria arbitraria. |
| 5 | `sys_call_table` es un **array de punteros a función**. Tu syscall nueva va a ser una entrada más de este array. |
| 6 | Este es el cuerpo real. Es una función en C normal — pero corre con privilegios totales. |

> **`current`** (paso 6) es una macro que te da el `struct task_struct *` del proceso que hizo la llamada. En arm64 sale de un registro reservado (`sp_el0`). Es "quién me está llamando" — la pieza que hace que el kernel sepa de quién es el PID que tiene que devolver.

<a name="t03"></a>
## 0.3 Por qué no podés llamar a una función del kernel directamente

Pregunta razonable: si `sys_getpid_counter` es una función en C, ¿por qué no la llamo desde mi programa como cualquier función?

Tres razones, en orden de contundencia:

1. **No está en tu espacio de direcciones.** Tu proceso tiene su propia tabla de páginas. Las direcciones del kernel están mapeadas pero marcadas como accesibles solo desde EL1. Si intentás saltar ahí, la MMU genera un fallo → `SIGSEGV`.
2. **No sabés su dirección.** No está en ninguna biblioteca que puedas enlazar. Y con **KASLR** activado, el kernel se carga en una dirección distinta en cada arranque.
3. **Aunque pudieras, sería un agujero de seguridad total.** Si userspace pudiera saltar a cualquier dirección del kernel, podría saltar al medio de una función, saltándose las validaciones. La tabla de syscalls existe precisamente para que solo se pueda entrar por puntos aprobados.

Por eso el trabajo de esta práctica **no es escribir una función** — eso es lo fácil. Es **registrarla** en los cuatro lugares que el kernel necesita para que sea alcanzable desde EL0.

<a name="t04"></a>
## 0.4 Qué hace la macro `SYSCALL_DEFINE0`

Cuando escribís esto:

```c
SYSCALL_DEFINE0(getpid_counter)
{
        return 42;
}
```

no estás definiendo *una* función. El preprocesador genera **varias**. En esencia:

```c
/* 1. El punto de entrada real, con la firma que espera la tabla:
      recibe UN puntero a pt_regs (los registros guardados del usuario). */
asmlinkage long __arm64_sys_getpid_counter(const struct pt_regs *regs);

/* 2. Tu cuerpo, movido a una función inline aparte. */
static inline long __do_sys_getpid_counter(void);

/* 3. El puente: extrae argumentos de pt_regs y llama a tu cuerpo. */
asmlinkage long __arm64_sys_getpid_counter(const struct pt_regs *regs)
{
        return __do_sys_getpid_counter();
}

/* 4. Metadatos para tracing, ftrace, error injection, etc. */
```

Por qué esto importa para vos:

- **El `0` de `SYSCALL_DEFINE0` es la cantidad de argumentos.** Tu syscall no recibe nada, así que es `DEFINE0`. Si recibiera dos, sería `SYSCALL_DEFINE2(nombre, tipo1, arg1, tipo2, arg2)`.
- **El prefijo `__arm64_` lo pone la arquitectura.** En x86_64 sería `__x64_`. Por eso vos escribís `sys_getpid_counter` en la tabla y el sistema de build se encarga del prefijo: **nunca escribas el prefijo a mano**.
- **`asmlinkage`** le dice al compilador que esta función va a ser llamada desde ensamblador, así que no use convenciones de paso de parámetros optimizadas.
- **El nombre en la tabla y el nombre en `SYSCALL_DEFINE0` tienen que coincidir exactamente.** `SYSCALL_DEFINE0(getpid_counter)` ↔ `sys_getpid_counter` en la tabla. Un typo acá te da un error de enlazado al final de la compilación (ver [PARTE 3](#parte-3)).

<a name="t05"></a>
## 0.5 La tabla de syscalls: el número **es** la API

Los números de syscall son **permanentes e inmutables**. El 172 es `getpid` en arm64 y lo va a ser para siempre, porque hay binarios compilados hace 15 años que tienen `mov x8, #172` grabado. Cambiar un número rompería todo el userspace.

De ahí salen dos reglas:

1. **Solo se agregan al final.** Nunca en medio, nunca reutilizando huecos.
2. **Tu syscall nueva es local a tu kernel.** El número que elijas (463) es válido solo en tu build. En un kernel oficial futuro, el 463 va a ser otra cosa.

En 6.12, el último número asignado en la tabla común es:

```
462     common  mseal                           sys_mseal
```

→ **tu syscall es la 463.** (Pero verificalo con `tail`, no lo asumas: §1.2.)

**Qué significan las columnas:**

```
463     common  getpid_counter                  sys_getpid_counter
 │        │            │                                │
 │        │            │                                └─ función del kernel (sin prefijo de arch)
 │        │            └─ nombre para userspace → genera __NR_getpid_counter
 │        └─ ABI: "common" = vale para 64 y 32 bits
 └─ el número
```

**El `__NR_syscalls` se recalcula solo.** El build corre `scripts/syscallhdr.sh` sobre la tabla y genera `include/generated/asm/unistd_64.h` con los `#define __NR_*` y el total. **No tenés que editar ningún contador a mano** — muchos tutoriales viejos dicen que sí, y están desactualizados.

<a name="t06"></a>
## 0.6 Mapa de los 4 archivos que vas a tocar

| # | Archivo | Qué le agregás | Por qué es necesario |
|---|---|---|---|
| 1 | `kernel/sys.c` | La variable contador | Tiene que persistir entre llamadas → duración estática |
| 2 | `kernel/sys.c` | `atomic_inc()` dentro de `SYSCALL_DEFINE0(getpid)` | Es el punto que querés instrumentar |
| 3 | `kernel/sys.c` | `SYSCALL_DEFINE0(getpid_counter)` | El cuerpo de la syscall nueva |
| 4 | `include/linux/syscalls.h` | `asmlinkage long sys_getpid_counter(void);` | Sin prototipo → warning `-Wmissing-prototypes` |
| 5 | `scripts/syscall.tbl` **(arm64)** | La línea `463 common …` | Sin esto la función existe pero es **inalcanzable** |

Fijate que 1, 2 y 3 caen en el **mismo archivo**. Eso es deliberado: si el contador y la syscall que lo lee viven juntos, no necesitás `extern` ni un header nuevo, y hay menos superficie para errores de enlazado.

> **🔧 CAMPO — el symlink que confunde a todo el mundo.** La práctica menciona `syscall_64.tbl`. En arm64 ese archivo existe (`arch/arm64/tools/syscall_64.tbl`) **pero es un symlink** a `../../../scripts/syscall.tbl`. Si lo editás con `nano`, estás editando el archivo real de todas formas — pero `git status` te va a mostrar `scripts/syscall.tbl` como modificado, no el symlink. Comprobalo vos mismo en §1.2. Es un detalle que vale mencionar en el informe.

<a name="t07"></a>
## 0.7 Concurrencia: por qué `contador++` está mal

Acá está la diferencia entre 30/30 y 18/30 en la rúbrica. Presta atención.

El instinto es:

```c
static int getpid_call_count = 0;    /* ❌ */
...
getpid_call_count++;                 /* ❌ */
```

Compila. Funciona. Y **pierde incrementos silenciosamente.**

`contador++` no es una operación, son tres:

```asm
ldr  w0, [x1]      ; 1. leer  de memoria a registro
add  w0, w0, #1    ; 2. sumar 1
str  w0, [x1]      ; 3. escribir de vuelta
```

Tu VM tiene varios núcleos. `getpid` se llama desde muchos procesos a la vez. Considerá esta secuencia real:

| Tiempo | CPU 0 | CPU 1 | Valor en memoria |
|---|---|---|---|
| t1 | lee → 100 | | 100 |
| t2 | | lee → 100 | 100 |
| t3 | suma → 101 | | 100 |
| t4 | | suma → 101 | 100 |
| t5 | escribe 101 | | **101** |
| t6 | | escribe 101 | **101** |

Dos llamadas, un solo incremento. Se perdió una. Esto es una **race condition**, y en el kernel es un bug de verdad, no un detalle académico.

La solución es `atomic_t`:

```c
static atomic_t getpid_call_count = ATOMIC_INIT(0);    /* ✅ */
...
atomic_inc(&getpid_call_count);                        /* ✅ */
```

`atomic_inc()` no es una función normal — compila a una instrucción atómica del hardware. En ARMv8.1+ es `LDADD` (una sola instrucción que lee-suma-escribe indivisiblemente). En ARMv8.0 es un bucle `LDXR`/`STXR` (load-exclusive / store-exclusive) que reintenta si otro núcleo tocó la dirección en el medio. En cualquier caso: **ningún incremento se pierde.**

| Operación | Qué hace |
|---|---|
| `ATOMIC_INIT(0)` | Inicializador estático |
| `atomic_inc(&v)` | `v++` atómico, no devuelve nada |
| `atomic_read(&v)` | Lee el valor (devuelve `int`) |
| `atomic_inc_return(&v)` | Incrementa **y** devuelve el nuevo valor |

> **Sobre `static`.** La rúbrica dice que la variable debe ser "global" y que falla si "se reinicia". Lo que importa es la **duración de almacenamiento estática** (vive todo el tiempo que viva el kernel), no la visibilidad externa. `static` a nivel de archivo da exactamente eso, y además es más limpio: no contamina el espacio de nombres global del kernel. Explicá esto en el informe y ganás el punto en vez de perderlo. (Si tu auxiliar insiste en que no sea `static`, quitá la palabra — pero entonces deberías declararla `extern` en un header para ser consistente.)

<a name="t08"></a>
## 0.8 `printk`, niveles de log y el ring buffer

`printk()` es el `printf` del kernel. No puede usar `printf` porque esa función vive en glibc, en userspace, y el kernel no enlaza contra bibliotecas de usuario.

Escribe a un **ring buffer** circular en memoria del kernel (tamaño fijo, `CONFIG_LOG_BUF_SHIFT`, típicamente 128 KB – 1 MB). `dmesg` lee ese buffer. Cuando se llena, **los mensajes viejos se sobreescriben**.

**Los 8 niveles de severidad:**

| Nivel | Macro | Nº | Uso |
|---|---|---|---|
| Emergency | `KERN_EMERG` | 0 | El sistema se está muriendo |
| Alert | `KERN_ALERT` | 1 | Acción inmediata requerida |
| Critical | `KERN_CRIT` | 2 | Fallo crítico de hardware/software |
| Error | `KERN_ERR` | 3 | Condición de error |
| Warning | `KERN_WARNING` | 4 | Advertencia |
| Notice | `KERN_NOTICE` | 5 | Normal pero significativo |
| **Info** | **`KERN_INFO`** | **6** | **Informativo ← usá este** |
| Debug | `KERN_DEBUG` | 7 | Depuración (puede estar filtrado) |

Dos formas equivalentes de escribir lo mismo:

```c
printk(KERN_INFO "SO2-P1: contador = %d\n", count);   /* forma clásica */
pr_info("SO2-P1: contador = %d\n", count);            /* forma moderna, preferida */
```

`pr_info()` es azúcar sintáctico sobre `printk(KERN_INFO ...)`. El kernel moderno prefiere `pr_*`.

**Por qué `KERN_INFO` y no `KERN_DEBUG`:** la rúbrica da 5 pts por "nivel de severidad adecuado" y penaliza el nivel "que oculta el mensaje". `KERN_DEBUG` (7) puede quedar por debajo del umbral de consola y, si el kernel se compiló con `CONFIG_DYNAMIC_DEBUG`, requiere habilitación explícita. `KERN_INFO` sale siempre en `dmesg`. No te compliques.

> ### ⛔ 🔧 CAMPO — NUNCA pongas un `printk` dentro de `sys_getpid()`
>
> Es el error más destructivo de esta práctica y es tentador ("quiero ver cada llamada").
>
> `getpid` se invoca **constantemente**: cada `fork`, cada shell, `systemd`, cada script. Son **cientos o miles de llamadas por segundo** en un sistema idle.
>
> Qué te pasa si ponés un `printk` ahí:
> 1. El ring buffer se llena en segundos y **se sobreescribe toda tu evidencia**.
> 2. `printk` serializa y escribe a consola → el sistema se arrastra.
> 3. Si la consola es serie o gráfica lenta, el arranque puede volverse **inusable** y tenés que restaurar el snapshot.
>
> **La regla:** el contador se **incrementa** en `sys_getpid()` (sin imprimir nada). El `printk` va **solo** en `getpid_counter()`, que se llama cuando vos querés. Así lo pide la práctica y así es lo correcto.

**Un detalle sobre `%d` con `atomic_t`:** no podés pasar un `atomic_t` a `printk`. Tenés que leerlo primero con `atomic_read()`, que devuelve un `int` normal:

```c
int count = atomic_read(&getpid_call_count);
pr_info("... %d ...\n", count);     /* ✅ */
pr_info("... %d ...\n", getpid_call_count);   /* ❌ no compila */
```

---
<a name="parte-1"></a>
# 🔧 PARTE 1 — EJECUCIÓN

<a name="p10"></a>
## ⚡ 1.0 Ruta mínima (resumen)

Si ya entendiste la teoría, esto es todo el trabajo. Cada bloque está detallado abajo.

| # | Bloque | Tiempo | Pts rúbrica |
|---|---|---|---|
| 1 | Snapshot de la VM | 3 min | — (seguro) |
| 2 | Bajar 6.12.69 + heredar `.config` | 15 min | — |
| 3 | Reconocimiento (`grep`, `tail`, `ls -l`) | 5 min | — |
| 4 | Editar `kernel/sys.c` (contador + syscall) | 15 min | 25 + 30 + 5 |
| 5 | Editar `include/linux/syscalls.h` | 2 min | — |
| 6 | Editar `scripts/syscall.tbl` | 2 min | (habilita todo) |
| 7 | `make -j$(nproc)` **completo** | 1–2 h (desatendido) | 25 |
| 8 | `make modules_install install` + reboot | 15 min | — |
| 9 | Programa de prueba + `dmesg` | 15 min | 20 + 10 |
| 10 | Informe y repo | 45 min | 10 |

**Total: ~2 h de trabajo activo + 1–2 h de compilación desatendida.**

> **Estrategia de tiempo:** hacé los bloques 1–6 de una sentada (~40 min), lanzá el `make` del bloque 7 y andate a hacer otra cosa. Los bloques 8–10 son otros ~75 min. **Editá los 4 archivos ANTES de compilar** — así compilás una sola vez en vez de dos.

<a name="p11"></a>
## 1.1 Snapshot — tu seguro de vida

Vas a modificar el kernel. Si metés la pata, el sistema **no arranca**. El snapshot es la diferencia entre perder 5 minutos y perder la tarde.

**VMware Fusion:** con la VM **apagada** → menú *Virtual Machine* → *Snapshots…* → *Take Snapshot* → nombrala `pre-practica1-syscall`.

Además, guardá tu red de seguridad de arranque:

```bash
mkdir -p ~/evidencias/practica1
uname -r > ~/evidencias/practica1/kernel-anterior.txt
cat ~/evidencias/practica1/kernel-anterior.txt
```

> Si el kernel nuevo no arranca: reiniciá, apretá **ESC** repetidamente (UEFI/arm64), *Advanced options for Debian GNU/Linux*, y elegí el kernel de la Tarea 3 o el original de Debian. El sistema arranca igual — los kernels viejos siguen instalados.

<a name="p11b"></a>
## 1.1b Bajar el 6.12.69 y heredar el `.config`

El lab exige **`linux-6.12.69.tar.xz`**. Es una versión anterior a la que compilaste en la Tarea 3, y eso está perfecto: los tarballs *stable* viejos quedan **permanentemente** en el CDN de kernel.org, aunque la portada del sitio solo liste el más reciente de cada serie.

### (a₀) ¿Desde qué kernel conviene trabajar?

Antes de bajar nada, mirá en cuál estás:

```bash
uname -r
```

| Salida | Cuál es |
|---|---|
| `6.12.101+deb13-arm64` (con `+deb13`, sin tu nombre) | El original de Debian ← **preferí este** |
| `6.12.102-jbarrera-<carné>` (con tu nombre) | El de tu Tarea 3 |

**Recomendación: trabajá desde el kernel original de Debian.** Para compilar da casi lo mismo (compilar es userspace), pero hay tres razones concretas:

1. **Estabilidad.** La VM va a compilar 1–2 h. El kernel de Debian trae todos los módulos y está mantenido; tu 6.12.102 salió de `localmodconfig`, con un set reducido.
2. **`localmodconfig` es acumulativo** ← la razón de peso. Si tenés que regenerar el `.config` con `make localmodconfig`, ese comando lee los módulos **cargados** (`lsmod`). Corriéndolo bajo el 6.12.102 recortás sobre lo ya recortado y podés perder drivers que necesitás. Bajo el de Debian, `lsmod` refleja el set completo real de tu hardware.
3. **Coherencia.** El `.config` que vas a heredar se generó originalmente desde el kernel de Debian.

Para cambiar: reiniciá → **ESC** repetido → *Advanced options for Debian GNU/Linux* → el que **no** tiene tu nombre.

> **Sin dramatismo:** si ya estás en el 6.12.102 y todo anda, no reinicies solo por esto. Importa de verdad únicamente en el caso 2.
>
> **Y ojo:** el `.config` que copiás en (c) sale de `$KDIR_T3/.config` — un archivo en disco. **No** depende de qué kernel esté corriendo, así que ese paso es idéntico en cualquier caso.

### (a) Descargar y verificar

```bash
mkdir -p ~/kernel && cd ~/kernel

wget https://cdn.kernel.org/pub/linux/kernel/v6.x/linux-6.12.69.tar.xz
```

Verificá la integridad antes de descomprimir (30 segundos que te evitan depurar un árbol corrupto):

```bash
curl -sO https://cdn.kernel.org/pub/linux/kernel/v6.x/sha256sums.asc
grep " linux-6.12.69.tar.xz$" sha256sums.asc | sha256sum -c -
```

⛔ **VERIFICAR** — esperado:
```
linux-6.12.69.tar.xz: OK
```

### (b) Descomprimir

```bash
tar -xf linux-6.12.69.tar.xz
cd "$KDIR" && pwd
```

⛔ **VERIFICAR** que estás en el árbol correcto:
```bash
head -5 Makefile
```
Esperado — las tres primeras variables de versión:
```
VERSION = 6
PATCHLEVEL = 12
SUBLEVEL = 69
```

> **🔧 CAMPO — espacio en disco.** Ahora tenés dos árboles de kernel. Chequeá:
> ```bash
> df -h /
> ```
> Si te quedan menos de 15 GB, liberá espacio limpiando los objetos compilados del árbol de la Tarea 3 (**no** borra el kernel ya instalado en `/boot`, así que tu opción de rescate en GRUB sigue intacta, y el `.config` se conserva):
> ```bash
> make -C "$KDIR_T3" clean
> df -h /
> ```

### (c) Heredar el `.config` que ya te funcionó ← el paso que te ahorra la tarde

En vez de repetir `localmodconfig`, la pelea con `MODULE_SIG` y la inspección de drivers de VMware, copiá la configuración que ya sabés que compila y arranca en tu VM. Como ambos son 6.12.x, transfiere prácticamente sin fricción:

```bash
cp "$KDIR_T3/.config" "$KDIR/.config"
make olddefconfig
```

`olddefconfig` acepta los defaults de cualquier opción que difiera entre las dos versiones, sin preguntarte nada.

> **⛔ 🔧 CAMPO — nunca uses `make oldconfig` a secas.** Entra en modo interactivo y te hace cientos de preguntas; si pegás un bloque de comandos mientras espera, el shell lo interpreta como respuestas y **corrompe el `.config`**. Ya te pasó en la Tarea 3. Usá `olddefconfig`.

### (d) Re-verificar las firmas de módulos

`olddefconfig` puede reactivar opciones de firma. Confirmá que las tres condiciones críticas de tu errata siguen en pie:

```bash
grep -E 'CONFIG_SYSTEM_TRUSTED_KEYS|CONFIG_MODULE_SIG_FORCE|CONFIG_MODULE_SIG_ALL' .config
```

⛔ **VERIFICAR** — esperado exactamente:
```
CONFIG_SYSTEM_TRUSTED_KEYS=""
# CONFIG_MODULE_SIG_FORCE is not set
# CONFIG_MODULE_SIG_ALL is not set
```

Si alguna no coincide, reaplicá la secuencia que ya sabés que funciona:

```bash
scripts/config --set-str SYSTEM_TRUSTED_KEYS ""
scripts/config --set-str SYSTEM_REVOCATION_KEYS ""
scripts/config --disable MODULE_SIG_ALL
scripts/config --disable MODULE_SIG_FORCE
scripts/config --disable SYSTEM_REVOCATION_LIST
make olddefconfig
```

Y volvé a verificar. (Que `CONFIG_MODULE_SIG=y` quede activo **está bien** — con `FORCE` y `ALL` apagados y las rutas de certificados vacías, el build firma con su propia llave local y no falla.)

### (e) Tu nombre en el kernel

```bash
grep "^CONFIG_LOCALVERSION=" .config
```

Debería venir heredado de la Tarea 3 (ej. `CONFIG_LOCALVERSION="-jbarrera-202012345"`). Si no, ponelo:

```bash
scripts/config --set-str LOCALVERSION "-jbarrera-$CARNE"
make olddefconfig
```

⛔ **VERIFICAR:**
```bash
make -s kernelrelease
```
Esperado: `6.12.69-jbarrera-202012345` — con el **69**, que es lo que demuestra que usaste la versión exigida.

### (f) La captura de `menuconfig` (la rúbrica la pide)

```bash
make menuconfig
```

Abrilo, **📸 sacá la captura**, y salí con *Exit* → *No* (no necesitás cambiar nada; la configuración ya está lista). Guardala como `capturas/01-menuconfig.png`.

<a name="p11c"></a>
## 1.1c Preparar el repo de entrega — hacelo AHORA, no al final

> ### ⛔ Por qué acá y no al final
> **Las capturas no se pueden recrear.** Si no capturás la pantalla del `make` mientras corre, se fue: la segunda compilación es incremental y se ve totalmente distinta. Lo mismo con `dmesg`, que es un buffer circular que se sobreescribe. Y armar el repo al final, apurado, es como se pierden puntos tontos.
>
> Creá la estructura ahora y vas llenándola. Cada punto del manual marcado **📸** es una captura obligatoria y **💾** es un punto de commit.

```bash
export DEST="$HOME/Practica_1_2S2026"
mkdir -p "$DEST"/{kernel,include/linux,scripts,Programa_Intermedio,capturas,evidencias}
mkdir -p ~/evidencias/practica1

cd "$DEST"
git init -q
git checkout -b "$CARNE"          # ⚠️ la rama DEBE ser tu carné
echo "# Práctica 1 - 2S2026 - Carné $CARNE" > README.md
git add -A && git commit -qm "Estructura inicial de la práctica"
git log --oneline
```

**📸 Movés la captura de `menuconfig` acá:**
```bash
# copiá/movés el PNG que acabás de sacar
mv ~/Pictures/*menuconfig* "$DEST/capturas/01-menuconfig.png"   # ajustá la ruta origen
ls "$DEST/capturas/"
```

> **🔧 CAMPO — son DOS repos distintos, no los confundas.**
>
> | Repo | Dónde | Para qué |
> |---|---|---|
> | **El de entrega** | `~/Practica_1_2S2026` | Lo que subís a GitLab. Rama = tu carné. |
> | El del árbol del kernel | `~/kernel/linux-6.12.69` (§1.2e, opcional) | Solo para generar el `diff` de tus cambios. **Nunca se sube.** |

<a name="p12"></a>
## 1.2 Reconocimiento: no adivines, inspeccioná

Esta sección no cambia nada. Solo confirma que la realidad de tu árbol coincide con lo que dice este manual. Cinco minutos acá te ahorran una compilación fallida de 20.

```bash
cd "$KDIR"
```

**(a) ¿Dónde está `sys_getpid` y cómo se ve?**

```bash
grep -n "SYSCALL_DEFINE0(getpid)" -A 3 kernel/sys.c
```

⛔ **VERIFICAR** — esperado:
```c
1006:SYSCALL_DEFINE0(getpid)
1007-{
1008-	return task_tgid_vnr(current);
1009-}
```
*(el número de línea puede variar unas cuantas; lo que importa es el cuerpo)*

**(b) ¿La tabla de arm64 es un symlink?**

```bash
ls -l arch/arm64/tools/syscall_64.tbl
```

⛔ **VERIFICAR** — esperado:
```
lrwxrwxrwx 1 user user 26 ... arch/arm64/tools/syscall_64.tbl -> ../../../scripts/syscall.tbl
```

Ahí está la confirmación de §0.6: **el archivo real es `scripts/syscall.tbl`.**

**(c) ¿Cuál es el último número de syscall usado?**

```bash
tail -5 scripts/syscall.tbl
```

⛔ **VERIFICAR** — esperado:
```
459	common	lsm_get_self_attr		sys_lsm_get_self_attr
460	common	lsm_set_self_attr		sys_lsm_set_self_attr
461	common	lsm_list_modules		sys_lsm_list_modules
462	common	mseal				sys_mseal
```

→ **El último es 462, entonces el tuyo es el 463.** Si tu salida muestra otro número, **usá el siguiente al que veas**, no el 463. Anotalo:

```bash
export NSYS=463      # ⚠️ ajustá si tu tail mostró otro último número
echo "Mi syscall será la número: $NSYS"
```

**(d) ¿Dónde va el prototipo?**

```bash
grep -n "asmlinkage long sys_getpid(void);" include/linux/syscalls.h
```

⛔ **VERIFICAR** — esperado: una línea (alrededor de la 700–780) con:
```c
asmlinkage long sys_getpid(void);
```

**(e) Estado limpio de git (opcional pero útil)**

Si tu árbol es un tarball sin git, saltealo. Si querés un diff limpio para el repo, inicializá uno ahora:

```bash
git -C "$KDIR" rev-parse --is-inside-work-tree 2>/dev/null || (cd "$KDIR" && git init -q && git add -A && git commit -qm "baseline $KVER" && echo "baseline creada")
```

Con eso, al final `git diff` te da exactamente los archivos modificados para el repo.

<a name="p13"></a>
## 1.3 Archivo 1 — el contador en `kernel/sys.c`

```bash
nano +$(grep -n "SYSCALL_DEFINE0(getpid)" kernel/sys.c | cut -d: -f1) kernel/sys.c
```

Ese comando te deja el cursor **justo en la línea de `SYSCALL_DEFINE0(getpid)`**.

Vas a encontrar esto:

```c
/**
 * sys_getpid - return the thread group id of the current process
 *
 * Note, despite the name, this returns the tgid not the pid.  The tgid and
 * the pid are identical unless CLONE_THREAD was specified on clone() in
 * which case the tgid is the same in all threads of the same group.
 *
 * This is SMP safe as current->tgid does not change.
 */
SYSCALL_DEFINE0(getpid)
{
	return task_tgid_vnr(current);
}
```

**Dejalo así** (reemplazá `<TU_CARNE>` por tu carné real):

```c
/* ==========================================================================
 * Práctica 1 - Sistemas Operativos 2 - 2S2026 - Carné <TU_CARNE>
 *
 * Contador global de invocaciones a sys_getpid().
 *
 * Se usa atomic_t y no un int porque sys_getpid() se ejecuta
 * concurrentemente en todos los núcleos: un "contador++" plano es una
 * secuencia load-add-store no atómica y perdería incrementos.
 * Es "static" (ámbito de archivo) porque la syscall que lo lee,
 * sys_getpid_counter(), vive en este mismo archivo; lo relevante es su
 * duración de almacenamiento estática, que garantiza que NO se reinicia
 * entre llamadas.
 * ========================================================================== */
static atomic_t getpid_call_count = ATOMIC_INIT(0);

/**
 * sys_getpid - return the thread group id of the current process
 *
 * Note, despite the name, this returns the tgid not the pid.  The tgid and
 * the pid are identical unless CLONE_THREAD was specified on clone() in
 * which case the tgid is the same in all threads of the same group.
 *
 * This is SMP safe as current->tgid does not change.
 */
SYSCALL_DEFINE0(getpid)
{
	/* Práctica 1 SO2: instrumentación. Solo se incrementa — NO se imprime
	 * acá: sys_getpid() se invoca cientos de veces por segundo y un printk
	 * en este punto inundaría el ring buffer del kernel. */
	atomic_inc(&getpid_call_count);

	return task_tgid_vnr(current);
}
```

Guardá con `Ctrl+O`, `Enter`, y **quedate en nano** — el siguiente paso es en el mismo archivo.

> **¿Hace falta `#include <linux/atomic.h>`?** No. `kernel/sys.c` ya lo arrastra por su cadena de includes (`linux/sched.h` y otros lo traen). Si por alguna razón te da error de tipo desconocido, agregalo — pero probá compilar primero.

<a name="p14"></a>
## 1.4 Archivo 2 — la syscall `getpid_counter()`

Seguí en `kernel/sys.c`. Bajá hasta **después** de `SYSCALL_DEFINE0(gettid)` — es el bloque de syscalls de identidad de proceso y es el lugar natural.

```bash
grep -n "SYSCALL_DEFINE0(gettid)" -A 4 kernel/sys.c
```

Agregá **después** de que cierra `gettid`:

```c
/**
 * sys_getpid_counter - Práctica 1 SO2 2S2026 - Carné <TU_CARNE>
 *
 * Llamada al sistema nueva (nº 463). Imprime en el log del kernel
 * (visible con dmesg) cuántas veces se ha invocado sys_getpid() desde
 * el arranque, y devuelve ese mismo valor a espacio de usuario para
 * que el programa de prueba pueda validarlo sin depender del log.
 *
 * Return: número de invocaciones acumuladas a sys_getpid().
 */
SYSCALL_DEFINE0(getpid_counter)
{
	int count = atomic_read(&getpid_call_count);

	pr_info("SO2-P1 [%s]: sys_getpid() invocada %d veces (consultado por PID %d)\n",
		"<TU_CARNE>", count, task_tgid_vnr(current));

	return count;
}
```

Guardá y salí: `Ctrl+O`, `Enter`, `Ctrl+X`.

**Decisiones de diseño que conviene que entiendas (y que van al informe):**

| Decisión | Por qué |
|---|---|
| `atomic_read()` antes del `pr_info` | No podés pasar un `atomic_t` a un `%d`. Y leerlo una sola vez asegura que el valor impreso y el retornado sean el mismo. |
| Devuelve `count` además de imprimirlo | La rúbrica pide validar con un programa de usuario. Si la syscall retorna el valor, el programa puede verificarlo directamente en vez de parsear `dmesg`. |
| `pr_info` (= `KERN_INFO`) | Nivel 6: garantizado visible en `dmesg`. Ver §0.8. |
| Prefijo `SO2-P1` en el mensaje | Te permite hacer `dmesg | grep SO2-P1` y aislar tu evidencia del ruido del kernel. |
| Incluye el PID del consultante | Evidencia más rica para el informe: se ve *quién* preguntó. |

⛔ **VERIFICAR** los tres cambios en el archivo:

```bash
grep -n "getpid_call_count\|SYSCALL_DEFINE0(getpid" kernel/sys.c
```

Esperado: **4 apariciones** — la declaración, el `atomic_inc`, `SYSCALL_DEFINE0(getpid)` y `SYSCALL_DEFINE0(getpid_counter)` con su `atomic_read`.

<a name="p15"></a>
## 1.5 Archivo 3 — el prototipo en `include/linux/syscalls.h`

Sin esto, el compilador te tira `warning: no previous prototype for '__arm64_sys_getpid_counter'`. La rúbrica penaliza advertencias.

```bash
nano +$(grep -n "asmlinkage long sys_getpid(void);" include/linux/syscalls.h | cut -d: -f1) include/linux/syscalls.h
```

Vas a ver:

```c
asmlinkage long sys_adjtimex_time32(struct old_timex32 __user *txc_p);
asmlinkage long sys_getpid(void);
asmlinkage long sys_getppid(void);
```

Agregá tu línea **justo después de `sys_getpid`**:

```c
asmlinkage long sys_adjtimex_time32(struct old_timex32 __user *txc_p);
asmlinkage long sys_getpid(void);
/* Práctica 1 SO2 2S2026 - Carné <TU_CARNE> */
asmlinkage long sys_getpid_counter(void);
asmlinkage long sys_getppid(void);
```

Guardá y salí.

⛔ **VERIFICAR:**
```bash
grep -n "sys_getpid_counter" include/linux/syscalls.h
```
Esperado: una línea.

> **Ojo con el nombre:** `sys_getpid_counter` — sin prefijo de arquitectura. El `__arm64_` lo agrega la macro (§0.4).

<a name="p16"></a>
## 1.6 Archivo 4 — la tabla de syscalls

### 🅰️ Si estás en **arm64** (tu caso)

El archivo real es `scripts/syscall.tbl` (confirmado en §1.2b).

```bash
nano scripts/syscall.tbl
```

Bajá al final del archivo (`Ctrl+End` en nano) y agregá una línea **después** de `462 common mseal`:

```
462	common	mseal				sys_mseal
463	common	getpid_counter			sys_getpid_counter
```

> ### ⛔ 🔧 CAMPO — **TABULADORES, no espacios**
> Los separadores de esta tabla **tienen que ser tabs**. El script que la parsea (`scripts/syscalltbl.sh`) usa tab como delimitador. Si nano te inserta espacios, la línea se ignora silenciosamente: compila perfecto y tu syscall devuelve `ENOSYS`. Es el fallo más frustrante de esta práctica porque no da ningún error.
>
> En nano, presioná la tecla **Tab** literalmente entre cada columna. Y verificá después:
> ```bash
> tail -2 scripts/syscall.tbl | cat -A | tail -2
> ```
> Tenés que ver `^I` (que es cómo `cat -A` muestra un tab), **nunca** secuencias de espacios:
> ```
> 463^Icommon^Igetpid_counter^I^I^Isys_getpid_counter$
> ```
> Si ves espacios, arreglalo con:
> ```bash
> printf '463\tcommon\tgetpid_counter\t\t\tsys_getpid_counter\n' >> scripts/syscall.tbl
> ```
> (después de borrar la línea mala con nano)

### 🅱️ Si estás en **x86_64**

El archivo es `arch/x86/entry/syscalls/syscall_64.tbl`. Buscá el final de la sección de números **bajos** (la zona 512–547 es el ABI `x32`, **no toques ahí**):

```bash
grep -n "^462" arch/x86/entry/syscalls/syscall_64.tbl
```

Agregá tu línea inmediatamente después de la 462, **antes** de que empiece el bloque `x32`:

```
462	common	mseal			sys_mseal
463	common	getpid_counter		sys_getpid_counter
```

Aplican las mismas reglas de tabuladores.

<a name="p17"></a>
## 1.7 Compilar

```bash
cd "$KDIR"
nproc                    # cuántos núcleos tenés
```

**Primero, una compilación de prueba solo del archivo que tocaste** — esto tarda segundos y atrapa el 90% de los errores de sintaxis **antes** de invertir una hora en el build completo. No te lo saltés:

```bash
make kernel/sys.o 2>&1 | tail -20
```

⛔ **VERIFICAR:** tiene que terminar con `CC kernel/sys.o` y **sin** `error:`. Si hay errores, andá a [PARTE 3](#parte-3) antes de seguir.

### 💾 COMMIT antes de compilar

Los 4 archivos ya están editados. Guardalos en el repo **antes** del build, así si algo sale mal tenés el estado exacto:

```bash
cp "$KDIR/kernel/sys.c"             "$DEST/kernel/"
cp "$KDIR/include/linux/syscalls.h" "$DEST/include/linux/"
cp "$KDIR/scripts/syscall.tbl"      "$DEST/scripts/"

cd "$DEST"
git add -A
git commit -qm "Contador atomico en sys_getpid() y syscall getpid_counter() (nro 463)"
cd "$KDIR"
```

### El build completo

```bash
time make -j$(nproc) 2>&1 | tee ~/evidencias/practica1/log-compilacion.txt
```

> ### 📸 CAPTURA 02 — `capturas/02-compilacion.png`
> **Sacala mientras el `make` está corriendo**, con líneas `CC`/`LD` visibles en pantalla. **No es recuperable después:** cuando el build termina ya no ves esas líneas, y si recompilás es incremental y se ve distinto. Dejá pasar un par de minutos para que haya salida en pantalla y capturá.

Qué esperar:
- **1–2 horas.** Es un árbol nuevo, así que compila todo desde cero. Dejalo corriendo y andate a hacer otra cosa — el `tee` guarda el log completo. (Si más adelante tenés que corregir algo y recompilar, esa segunda vez **sí** es incremental: 5–20 min.)
- Se regenera `include/generated/asm/unistd_64.h` con tu `__NR_getpid_counter` (paso `SYSHDR`/`SYSTBL`).
- **`libfakeroot internal error: payload not recognized!`** → si el build sigue avanzando después (líneas `LD`, `AR`, `BTF`), **ignoralo**. Es el bug conocido de Debian 13 arm64 de tu Tarea 3.

⛔ **VERIFICAR que tu número llegó al header generado:**

```bash
grep -rn "getpid_counter" include/generated/ | head
```

Esperado — algo así:
```
include/generated/asm/unistd_64.h:#define __NR_getpid_counter 463
include/generated/asm/syscall_table_64.h:__SYSCALL(463, sys_getpid_counter)
```

> **Si este grep sale vacío, tu línea en la tabla no se parseó** — casi siempre es el problema de tabuladores (§1.6). Arreglalo y recompilá. **No sigas sin esto**: si el header no tiene tu syscall, el `syscall(463)` va a devolver `ENOSYS` y perdés los 20 puntos de validación.

⛔ **VERIFICAR que no hay warnings de tu código:**

```bash
grep -i "warning" ~/evidencias/practica1/log-compilacion.txt | grep -i "getpid\|sys\.c"
```
Esperado: **vacío**.

<a name="p18"></a>
## 1.8 Instalar y arrancar

```bash
cd "$KDIR"
KREL=$(make -s kernelrelease)
echo "$KREL" | tee ~/evidencias/practica1/kernel-release.txt
```

⛔ **VERIFICAR:** tiene que mostrar tu versión con tu nombre y carné, ej. `6.12.102-jbarrera-202012345`.

```bash
sudo make modules_install    # 2-5 min
sudo make install            # copia a /boot y corre update-grub
```

⛔ **VERIFICAR que los archivos llegaron a `/boot`:**

```bash
ls -lh /boot/ | grep "$KREL"
```

> **🔧 CAMPO — en arm64 es `vmlinux`, no `vmlinuz`.** Esperás ver 4 archivos: `vmlinux-$KREL`, `initrd.img-$KREL`, `System.map-$KREL`, `config-$KREL`. (En x86_64 el primero se llama `vmlinuz-`.)

```bash
sudo update-grub 2>&1 | grep -i "$KREL"
sudo reboot
```

> ### ⛔ 🔧 CAMPO — reiniciar NO alcanza
> GRUB arranca el primero de la lista, que probablemente **no** es tu kernel nuevo. Al arrancar:
> 1. Apretá **ESC** repetidamente (UEFI/arm64; en x86/BIOS sería SHIFT).
> 2. *Advanced options for Debian GNU/Linux* → Enter.
> 3. Elegí tu kernel: `$KREL`.

Al volver:

```bash
uname -r                     # ⛔ tiene que ser TU kernel
uname -r > ~/evidencias/practica1/uname-post-boot.txt
```

Si no coincide, arrancaste el viejo. Reiniciá y elegí bien en GRUB.

> ### 📸 CAPTURA 03 — `capturas/03-uname.png`
> La terminal mostrando `uname -r` con `6.12.69-<tunombre>-<tucarné>`. Es tu prueba de dos cosas a la vez: que usaste **la versión exigida (69)** y que el kernel modificado **arranca** (requisito para optar a calificación).

<a name="p19"></a>
## 1.9 El programa de prueba

```bash
mkdir -p ~/practica1/Programa_Intermedio
cd ~/practica1/Programa_Intermedio
nano test_getpid.c
```

```c
/* ==========================================================================
 * Práctica 1 - Sistemas Operativos 2 - 2S2026
 * Carné: <TU_CARNE>
 *
 * Valida la instrumentación de sys_getpid() y la nueva syscall
 * getpid_counter() (nº 463) agregadas al kernel.
 *
 * Compilar:  gcc -Wall -Wextra -o test_getpid test_getpid.c
 * Ejecutar:  ./test_getpid 10
 * ========================================================================== */

#define _GNU_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <errno.h>
#include <string.h>
#include <sys/syscall.h>

/* Número asignado en scripts/syscall.tbl (arm64) */
#define SYS_GETPID_COUNTER 463

/* Lee el contador del kernel. Devuelve -1 y deja errno si falla. */
static long leer_contador(void)
{
        return syscall(SYS_GETPID_COUNTER);
}

int main(int argc, char *argv[])
{
        int n = (argc > 1) ? atoi(argv[1]) : 10;
        long antes, despues;

        if (n <= 0)
                n = 10;

        printf("=== Práctica 1 SO2 - Validación de syscalls ===\n");
        printf("Kernel en ejecución: ");
        fflush(stdout);
        if (system("uname -r") != 0)
                printf("(no se pudo obtener)\n");
        printf("PID de este proceso: %d\n\n", getpid());

        /* -------- 1. Estado inicial del contador -------- */
        antes = leer_contador();
        if (antes < 0) {
                fprintf(stderr,
                        "ERROR: syscall(%d) falló: %s (errno=%d)\n",
                        SYS_GETPID_COUNTER, strerror(errno), errno);
                if (errno == ENOSYS)
                        fprintf(stderr,
                                "  ENOSYS = la syscall no existe en este kernel.\n"
                                "  ¿Arrancaste el kernel modificado? (uname -r)\n"
                                "  ¿La línea de scripts/syscall.tbl usa TABS?\n");
                return EXIT_FAILURE;
        }
        printf("[1] Contador ANTES de las llamadas: %ld\n", antes);

        /* -------- 2. Invocar getpid() n veces --------
         *
         * Se usa syscall(SYS_getpid) y NO getpid() de glibc a propósito:
         * el wrapper de glibc cacheó el PID en userspace durante años
         * (se quitó en glibc 2.25). Llamando la syscall cruda garantizamos
         * que CADA iteración cruza a espacio de kernel y por lo tanto
         * incrementa el contador.
         */
        printf("[2] Invocando sys_getpid() %d veces...\n", n);
        for (int i = 0; i < n; i++) {
                long pid = syscall(SYS_getpid);
                if (pid < 0) {
                        perror("syscall(SYS_getpid)");
                        return EXIT_FAILURE;
                }
        }

        /* -------- 3. Estado final -------- */
        despues = leer_contador();
        if (despues < 0) {
                perror("syscall(SYS_GETPID_COUNTER)");
                return EXIT_FAILURE;
        }
        printf("[3] Contador DESPUÉS de las llamadas: %ld\n", despues);

        /* -------- 4. Análisis -------- */
        printf("\n=== Resultado ===\n");
        printf("Incremento observado : %ld\n", despues - antes);
        printf("Incremento esperado  : >= %d\n", n);
        printf("  (puede ser mayor: otros procesos del sistema también\n"
               "   llaman a getpid() concurrentemente, y este programa\n"
               "   consume 1 llamada extra en el printf de arriba)\n");

        if (despues - antes >= n) {
                printf("\n✅ CORRECTO: el contador incrementa de forma acumulativa.\n");
                printf("   Verificá el log del kernel con:\n");
                printf("     dmesg | grep SO2-P1 | tail -5\n");
                return EXIT_SUCCESS;
        }

        printf("\n❌ FALLO: el contador no incrementó lo esperado.\n");
        return EXIT_FAILURE;
}
```

Compilá y corré:

```bash
gcc -Wall -Wextra -o test_getpid test_getpid.c
./test_getpid 10
```

> ### 📸 CAPTURA 04 — `capturas/04-programa.png`
> La salida completa del programa, con el `✅ CORRECTO` y los valores antes/después visibles. Son los **20 pts de "Validación con programa de prueba"**.

### 💾 COMMIT del programa

```bash
cp test_getpid.c "$DEST/Programa_Intermedio/"
cd "$DEST" && git add -A && git commit -qm "Programa de prueba en espacio de usuario"
cd ~/practica1/Programa_Intermedio
```

⛔ **VERIFICAR** — salida esperada (los números varían):

```
=== Práctica 1 SO2 - Validación de syscalls ===
Kernel en ejecución: 6.12.102-jbarrera-202012345
PID de este proceso: 1834

[1] Contador ANTES de las llamadas: 15427
[2] Invocando sys_getpid() 10 veces...
[3] Contador DESPUÉS de las llamadas: 15441

=== Resultado ===
Incremento observado : 14
Incremento esperado  : >= 10

✅ CORRECTO: el contador incrementa de forma acumulativa.
```

> **¿Por qué el incremento es 14 y no exactamente 10?** Porque el contador es **global al sistema**, no por proceso. Entre tus dos lecturas, otros procesos también llamaron a `getpid()`. Además tu propio `printf`/`system()` genera llamadas. **Esto es correcto y esperado** — y explicarlo bien en el informe demuestra que entendiste que instrumentaste el kernel, no tu programa. Lo que la rúbrica exige es que incremente **secuencial y acumulativamente**, no que dé un número exacto.

<a name="p110"></a>
## 1.10 Verificar con `dmesg` — 10 pts

```bash
sudo dmesg | grep "SO2-P1"
```

Esperado — una línea por cada llamada a `getpid_counter()`:

```
[  312.445821] SO2-P1 [202012345]: sys_getpid() invocada 15427 veces (consultado por PID 1834)
[  312.446103] SO2-P1 [202012345]: sys_getpid() invocada 15441 veces (consultado por PID 1834)
```

**La rúbrica pide demostrar que "el contador incrementa secuencialmente en cada llamada".** Así lo demostrás de forma contundente:

```bash
sudo dmesg -C                                    # limpiar el buffer
for i in 1 2 3 4 5; do ./test_getpid 100; done > /dev/null
sudo dmesg | grep "SO2-P1"
```

Vas a ver 10 líneas (2 por ejecución) con valores **estrictamente crecientes**. Eso es la evidencia.

> ### 📸 CAPTURA 05 — `capturas/05-dmesg.png` ← la más importante
> La salida de `sudo dmesg | grep "SO2-P1"` con **varias líneas de valores crecientes** visibles a la vez. Son los **10 pts de "Uso de comando dmesg"**.
>
> **⚠️ No es recuperable:** el ring buffer es circular y se sobreescribe. Si dejás la VM corriendo horas y volvés después, tus líneas pueden haber sido desplazadas por otros mensajes del kernel. Capturá **en el momento**.

Guardá todo:

```bash
cd ~/evidencias/practica1
uname -r                       > evidencia-uname.txt
sudo dmesg | grep "SO2-P1"     > evidencia-dmesg.txt
~/practica1/Programa_Intermedio/test_getpid 20 > evidencia-programa.txt 2>&1
cat evidencia-dmesg.txt
```

### 📸 Inventario de capturas — control final

Cada una está marcada **📸** en su sección. Verificá que las tengas todas:

| # | Archivo | Dónde se saca | ¿Recuperable? |
|---|---|---|---|
| 1 | `01-menuconfig.png` | [§1.1b(f)](#p11b) | ✅ sí (`make menuconfig` otra vez) |
| 2 | `02-compilacion.png` | [§1.7](#p17) | ❌ **NO** — el build completo ya pasó |
| 3 | `03-uname.png` | [§1.8](#p18) | ✅ sí |
| 4 | `04-programa.png` | [§1.9](#p19) | ✅ sí |
| 5 | `05-dmesg.png` | [§1.10](#p110) | ⚠️ el buffer se sobreescribe |
| 6 | `06-diff.png` | acá abajo | ✅ sí |

```bash
ls -1 "$DEST/capturas/"          # ⛔ tenés que ver las 6
```

**📸 CAPTURA 06** — el diff de tus cambios, prueba de qué archivos tocaste:

```bash
git -C "$KDIR" diff --stat       # si inicializaste git en §1.2e
# alternativa sin git:
grep -n "getpid_call_count\|getpid_counter" "$KDIR/kernel/sys.c"
```

<a name="p111"></a>
## 1.11 Evidencias y estructura del repo

La práctica es explícita: **solo los archivos modificados, respetando la estructura de carpetas del kernel.** No subas el kernel completo.

```
Practica_1_2S2026/
├── README.md                       ← el informe técnico
├── kernel/
│   └── sys.c                       ← contador + getpid_counter()
├── include/
│   └── linux/
│       └── syscalls.h              ← el prototipo
├── scripts/
│   └── syscall.tbl                 ← la tabla (arm64)
├── Programa_Intermedio/
│   ├── test_getpid.c
│   └── Makefile
├── capturas/
│   ├── 01-menuconfig.png
│   ├── 02-compilacion.png
│   ├── 03-uname.png
│   ├── 04-programa.png
│   └── 05-dmesg.png
└── evidencias/
    ├── evidencia-dmesg.txt
    ├── evidencia-uname.txt
    └── cambios.diff
```

> **Si estás en x86_64**, en vez de `scripts/syscall.tbl` va `arch/x86/entry/syscalls/syscall_64.tbl`.

La estructura ya existe desde [§1.1c](#p11c) y venís commiteando en cada 💾. Esto es solo el **sync final** — reconfirma que todo está actualizado:

```bash
cp "$KDIR/kernel/sys.c"                  "$DEST/kernel/"
cp "$KDIR/include/linux/syscalls.h"      "$DEST/include/linux/"
cp "$KDIR/scripts/syscall.tbl"           "$DEST/scripts/"
cp ~/practica1/Programa_Intermedio/test_getpid.c "$DEST/Programa_Intermedio/"
cp ~/evidencias/practica1/*.txt          "$DEST/evidencias/"

# El diff, si inicializaste git en §1.2e
git -C "$KDIR" diff > "$DEST/evidencias/cambios.diff" 2>/dev/null

find "$DEST" -type f | sort
```

Un `Makefile` para el programa (queda profesional y cuesta 30 segundos):

```bash
cat > "$DEST/Programa_Intermedio/Makefile" <<'EOF'
CC      = gcc
CFLAGS  = -Wall -Wextra -O2
TARGET  = test_getpid

all: $(TARGET)

$(TARGET): test_getpid.c
	$(CC) $(CFLAGS) -o $@ $<

run: $(TARGET)
	./$(TARGET) 10

clean:
	rm -f $(TARGET)

.PHONY: all run clean
EOF
```

### 💾 COMMIT final y push

```bash
cd "$DEST"
git add -A
git commit -qm "Evidencias, capturas e informe tecnico"

# ⛔ VERIFICAR antes de subir
git branch --show-current        # tiene que ser tu CARNÉ
git log --oneline                # tus 4 commits incrementales
git status                       # tiene que estar limpio

git remote add origin <URL_DE_TU_REPO_GITLAB>
git push -u origin "$CARNE"
```

> **🔧 CAMPO — la rama es requisito de entrega.** La práctica dice explícitamente que la rama lleva el nombre de tu carné y que todo va dentro de `Practica_1_2S2026`. Si `git branch --show-current` no muestra tu carné, corregilo antes del push:
> ```bash
> git branch -m "$CARNE"
> ```

### Historial esperado

Si seguiste los 💾 del manual, tu historial cuenta la historia del trabajo — eso se ve bien en una revisión:

```
* Evidencias, capturas e informe tecnico
* Programa de prueba en espacio de usuario
* Contador atomico en sys_getpid() y syscall getpid_counter() (nro 463)
* Estructura inicial de la práctica
```

---
<a name="parte-2"></a>
# ✍️ PARTE 2 — MATERIAL PARA EL INFORME

## 2.1 Estructura que pide la rúbrica

| Sección | Qué poner |
|---|---|
| 1. Introducción y objetivos | Qué es instrumentar el kernel y para qué sirve. Objetivo concreto. |
| 2. Guía paso a paso de archivos modificados | Los 4 archivos, con el diff de cada uno y **por qué** cada cambio es necesario. Usá §0.6. |
| 3. Capturas | `menuconfig`, compilación (las 6 de §1.10). |
| 4. Evidencia con `dmesg` | La salida de §1.10 con valores crecientes. |
| 5. Conclusiones | Ver §2.3 — acá es donde se gana o se pierde. |

## 2.2 Los conceptos que tenés que poder explicar

Si podés responder estas seis preguntas sin mirar, entendiste la práctica:

1. **¿Por qué no alcanza con escribir la función?** Porque el kernel solo ejecuta lo que está registrado en `sys_call_table`, y esa tabla se genera desde la tabla de syscalls. Sin la entrada, la función existe en el binario pero es inalcanzable desde EL0 → `ENOSYS`.
2. **¿Qué hace `SYSCALL_DEFINE0`?** Genera el punto de entrada `__arm64_sys_*` que recibe `struct pt_regs`, más una función inline con tu cuerpo, más el puente entre ambas, más metadatos de tracing. Ver §0.4.
3. **¿Por qué `atomic_t`?** Porque `++` es load-add-store no atómico y `sys_getpid` corre concurrentemente en varios núcleos. Sin atomicidad se pierden incrementos. Ver §0.7.
4. **¿Por qué el `printk` no va en `sys_getpid`?** Porque se llama cientos de veces por segundo: inundaría el ring buffer, borraría la evidencia y degradaría el sistema. Ver §0.8.
5. **¿Por qué el incremento no es exactamente N?** Porque el contador es global al sistema, no por proceso. Ver §1.9.
6. **¿Qué diferencia hay entre `getpid()` y `syscall(SYS_getpid)`?** El primero es el wrapper de glibc (que históricamente cacheaba el PID en userspace, hasta glibc 2.25); el segundo fuerza el cruce a modo kernel siempre.

## 2.3 Conclusiones — el apartado donde se ganan los puntos

La rúbrica dice que las conclusiones satisfactorias "demuestran un análisis profundo sobre **la diferencia entre espacios de memoria**", y que las insatisfactorias son "superficiales y no técnicas". Traducción: no escribas "aprendí mucho sobre el kernel".

Ideas concretas y defendibles para desarrollar:

- **La separación EL0/EL1 la impone el hardware, no el software.** Lo comprobás porque tu programa **no puede** leer `getpid_call_count` — no hay forma de acceder a esa variable desde userspace excepto pidiéndole al kernel que la lea. Tuviste que construir una syscall entera solo para leer un entero.
- **La ABI es un contrato inmutable.** Los números de syscall no se pueden reordenar porque hay binarios compilados que los tienen grabados. De ahí que solo se agregue al final. Tu 463 es válido solo en tu kernel.
- **El costo del cruce de contexto es real.** Cada `syscall(SYS_getpid)` es una excepción sincrónica: guardar registros, cambiar nivel de privilegio, validar, ejecutar, `eret`. Por eso existe el **vDSO** — para que llamadas como `clock_gettime()` se resuelvan en userspace sin cruzar. `getpid` no está en el vDSO, y por eso tu instrumentación funciona.
- **La concurrencia en el kernel no es opcional.** Un bug de race condition en `sys_getpid` afecta a todos los procesos del sistema simultáneamente. Programar en el kernel es programar en un entorno multihilo por defecto, sin excepciones.
- **El contador global revela que el kernel es un recurso compartido.** Que tu contador suba cuando *otros* procesos llaman a `getpid()` es la demostración empírica de que hay un solo kernel para todos los procesos.

## 2.4 Posibles preguntas teóricas (5 pts)

| Pregunta probable | Respuesta corta |
|---|---|
| ¿Qué es una syscall y por qué es necesaria? | La única puerta de EL0→EL1. Necesaria porque el hardware impide a userspace acceder a recursos privilegiados. |
| ¿Qué diferencia hay entre `printk` y `printf`? | `printf` está en glibc (userspace) y escribe a `stdout` vía `write()`. `printk` está en el kernel, escribe a un ring buffer en memoria del kernel, y tiene niveles de severidad. El kernel no puede enlazar glibc. |
| ¿Qué es `dmesg`? | La herramienta que lee el ring buffer del kernel (vía `/dev/kmsg` o `syslog()`). Es circular: los mensajes viejos se sobreescriben. |
| ¿Qué significan los niveles de `printk`? | 8 niveles, 0 (`KERN_EMERG`) a 7 (`KERN_DEBUG`). Determinan si el mensaje sale a consola según el `loglevel` configurado. Ver §0.8. |
| ¿Qué es `current`? | Macro que devuelve el `struct task_struct *` del proceso que está ejecutando en este núcleo. En arm64 sale de `sp_el0`. |
| ¿Por qué recompilar todo el kernel y no un módulo? | Porque `sys_getpid` está compilado dentro de la imagen del kernel (`vmlinux`), no en un módulo. La tabla de syscalls es un array estático de tamaño fijo (`__NR_syscalls`) que se define en tiempo de compilación — un módulo no puede agregarle entradas de forma soportada. |
| ¿Qué es `__NR_syscalls`? | El total de syscalls. Se genera automáticamente desde la tabla y se usa como límite en la validación `nr < __NR_syscalls` que impide accesos fuera de rango. |

---
<a name="parte-3"></a>
# 🔥 PARTE 3 — ERRORES Y CÓMO SALIR

## E1 · Errores de compilación

### E1.1 `error: 'getpid_call_count' undeclared`

La declaración quedó **después** del uso, o en otro archivo. En C el orden importa. Verificá que `static atomic_t getpid_call_count = ATOMIC_INIT(0);` esté **arriba** de ambas funciones:

```bash
grep -n "getpid_call_count" kernel/sys.c
```
El número de línea de la declaración tiene que ser **menor** que los otros dos.

### E1.2 `undefined reference to '__arm64_sys_getpid_counter'`

Error de **enlazado** (aparece al final, en el paso `LD`). El nombre en la tabla no coincide con el de `SYSCALL_DEFINE0`.

```bash
grep -n "getpid_counter" scripts/syscall.tbl kernel/sys.c
```
La tabla dice `sys_getpid_counter`, y `SYSCALL_DEFINE0` dice `getpid_counter` (**sin** el `sys_`). Esa asimetría es correcta — la macro agrega el `sys_`. Revisá que no tengas `SYSCALL_DEFINE0(sys_getpid_counter)`, que es el error típico.

### E1.3 `warning: no previous prototype for '__arm64_sys_getpid_counter'`

Falta el prototipo en `include/linux/syscalls.h`. Volvé a §1.5.

### E1.4 `format '%d' expects argument of type 'int', but argument has type 'atomic_t'`

Pasaste el `atomic_t` directo al `pr_info`. Leelo primero con `atomic_read()`. Ver §0.8.

### E1.5 El build no recompila `kernel/sys.c`

`make` cree que no cambió nada. Forzá:

```bash
touch kernel/sys.c && make kernel/sys.o
```

### E1.6 `libfakeroot internal error: payload not recognized!`

Bug conocido de Debian 13 arm64. **Si el build sigue avanzando, ignoralo** (ya lo viste en la Tarea 3).

## E2 · La syscall no funciona

### E2.1 ⭐ `syscall(463)` devuelve -1 con `ENOSYS` — el error #1 de esta práctica

Significa "esta syscall no existe". Diagnosticá **en este orden**:

```bash
# (a) ¿Estás en el kernel modificado?
uname -r
```
Si no es tu kernel → reiniciá y elegí bien en GRUB (§1.8).

```bash
# (b) ¿El número llegó al header generado?
grep -rn "getpid_counter" "$KDIR/include/generated/"
```
Si sale **vacío** → la tabla no se parseó. Casi siempre son **espacios en vez de tabs**:

```bash
tail -3 "$KDIR/scripts/syscall.tbl" | cat -A
```
Tenés que ver `^I` entre columnas. Si ves espacios, corregí (§1.6) y **recompilá**.

```bash
# (c) ¿El número que usa tu programa coincide con el de la tabla?
grep "getpid_counter" "$KDIR/scripts/syscall.tbl"
grep "SYS_GETPID_COUNTER" ~/practica1/Programa_Intermedio/test_getpid.c
```
Tienen que ser el mismo número.

```bash
# (d) ¿Instalaste después de compilar?
ls -l --time-style=full-iso /boot/vmlinux-$(uname -r) "$KDIR/vmlinux"
```
Si el de `/boot` es más viejo que el del árbol, te faltó `sudo make install`.

### E2.2 El contador siempre devuelve 0

`atomic_inc()` no está dentro de `SYSCALL_DEFINE0(getpid)`, o quedó después del `return` (código muerto):

```bash
grep -n "SYSCALL_DEFINE0(getpid)" -A 8 kernel/sys.c
```
El `atomic_inc` tiene que estar **antes** del `return task_tgid_vnr(current);`.

### E2.3 El contador no incrementa al llamar `getpid()` de glibc

Depende de la versión de glibc (cacheaba el PID hasta 2.25). Por eso el programa de prueba usa `syscall(SYS_getpid)` directo. No es un bug de tu kernel — es un buen punto para el informe.

### E2.4 `dmesg` no muestra nada

```bash
sudo dmesg | grep -i "SO2-P1"        # ¿con sudo?
sudo dmesg | tail -30                # ¿hay algo reciente?
cat /proc/sys/kernel/printk          # nivel de consola
```
Si `dmesg` sin `sudo` falla, es `kernel.dmesg_restrict=1`. Usá `sudo`.
Si usaste `KERN_DEBUG` en vez de `KERN_INFO`, cambialo (§0.8).

### E2.5 El buffer se llenó y perdí la evidencia

Casi seguro pusiste un `printk` dentro de `sys_getpid()`. Quitalo (§0.8), recompilá, reinstalá. Mientras tanto:

```bash
sudo dmesg -C        # limpiar y volver a probar
```

## E3 · El kernel no arranca

### E3.1 Pánico al arrancar / no llega al login

1. Reiniciá la VM.
2. **ESC** repetido → *Advanced options* → elegí el kernel de la **Tarea 3** o el original de Debian.
3. Ya con el sistema arriba, corregí el código y recompilá.
4. Si nada arranca: restaurá el snapshot `pre-practica1-syscall` (§1.1).

> Un contador atómico y un `pr_info` **no pueden** causar un pánico. Si el kernel no arranca, el problema casi seguro está en la configuración (`.config`), no en tu código de esta práctica.

### E3.2 `/boot` sin espacio

```bash
df -h /boot
sudo apt autoremove --purge        # limpia kernels viejos de Debian
```
Recordá que tu initramfs pesa ~530 MB (lo viste en la Tarea 3).

---

## ✅ Checklist final

**Antes de compilar:**
- [ ] `head -5 Makefile` → `SUBLEVEL = 69` ← **la versión que exige el lab**
- [ ] `make -s kernelrelease` → `6.12.69-<tunombre>-<tucarne>`
- [ ] `grep -E 'SYSTEM_TRUSTED_KEYS|MODULE_SIG_FORCE|MODULE_SIG_ALL' .config` → las 3 condiciones OK
- [ ] `grep -n "getpid_call_count" kernel/sys.c` → 3 apariciones, declaración primero
- [ ] `grep -n "SYSCALL_DEFINE0(getpid_counter)" kernel/sys.c` → 1
- [ ] `grep -n "sys_getpid_counter" include/linux/syscalls.h` → 1
- [ ] `tail -2 scripts/syscall.tbl | cat -A` → muestra `^I`, **no** espacios
- [ ] **NO** hay ningún `printk`/`pr_*` dentro de `SYSCALL_DEFINE0(getpid)`
- [ ] `make kernel/sys.o` pasa sin errores ni warnings

**Después de compilar:**
- [ ] `grep -rn "getpid_counter" include/generated/` → **encuentra `__NR_getpid_counter 463`**
- [ ] `make -s kernelrelease` muestra tu nombre y carné
- [ ] Sin warnings de `sys.c` en el log

**Después de instalar y reiniciar:**
- [ ] Elegí mi kernel en GRUB (**ESC** → Advanced options)
- [ ] `uname -r` = mi kernel
- [ ] `./test_getpid 10` → ✅ CORRECTO
- [ ] `sudo dmesg | grep SO2-P1` → valores **crecientes**

**📸 Capturas (cada una marcada en su sección):**
- [ ] `01-menuconfig.png` — §1.1b(f)
- [ ] `02-compilacion.png` — §1.7 ← **la que NO se puede recrear**
- [ ] `03-uname.png` — §1.8 (con el `69` visible)
- [ ] `04-programa.png` — §1.9 (con el `✅ CORRECTO`)
- [ ] `05-dmesg.png` — §1.10 (valores crecientes)
- [ ] `06-diff.png` — §1.10
- [ ] `ls -1 "$DEST/capturas/"` → las 6

**💾 Entrega:**
- [ ] `git branch --show-current` = **mi carné**
- [ ] `git status` limpio
- [ ] Carpeta `Practica_1_2S2026`
- [ ] Solo los 3 archivos del kernel, con estructura de carpetas
- [ ] `Programa_Intermedio/test_getpid.c` + `Makefile`
- [ ] `README.md` con las 5 secciones
- [ ] Conclusiones técnicas (§2.3), no genéricas
- [ ] `git push -u origin "$CARNE"` hecho

---

## 📌 Resumen en una línea

Agregás un `atomic_t` y un `atomic_inc()` a `SYSCALL_DEFINE0(getpid)` en `kernel/sys.c`, definís ahí mismo `SYSCALL_DEFINE0(getpid_counter)` con un `pr_info`, declarás el prototipo en `include/linux/syscalls.h`, registrás la línea `463 common getpid_counter sys_getpid_counter` **con tabuladores** en `scripts/syscall.tbl` (que es a donde apunta el symlink `arch/arm64/tools/syscall_64.tbl`), recompilás incremental, y validás con `syscall(463)` desde userspace más `dmesg | grep SO2-P1`.

---

*Manual generado el 2026-08-11 para la Práctica 1 de SO2 2S2026. Datos del kernel verificados contra el fuente real de **Linux v6.12.69** (`kernel/sys.c`, `scripts/syscall.tbl`) y v6.12 (`include/linux/syscalls.h`, `arch/arm64/tools/syscall_64.tbl`): en ambas versiones el último syscall es `462 mseal` → el nuevo es el **463**, y `SYSCALL_DEFINE0(getpid)` es idéntico. Entorno de referencia: Debian 13 arm64 / VMware Fusion / Mac M5.*
