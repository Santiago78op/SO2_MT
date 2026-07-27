# Programación de módulos del kernel Linux

**Curso práctico basado en _The Linux Kernel Module Programming Guide_ (sysprog21/lkmpg)**

Material de clase. El repo original está clonado en `..\lkmpg\` — los ejemplos
oficiales en `..\lkmpg\examples\`, el libro completo en `..\lkmpg\lkmpg.tex`.

---

## Clase 0 — La idea que hay que entender antes de escribir una línea

El kernel de Linux es **monolítico**: todo el manejo de hardware, memoria,
procesos y red vive en un solo programa privilegiado. Un microkernel pondría
cada driver en su propio proceso; Linux no. Eso plantea un problema práctico
evidente: si cada driver del planeta tuviera que estar compilado dentro del
binario, el kernel pesaría gigabytes y habría que recompilarlo para enchufar
un mouse.

La solución son los **LKM** (*Loadable Kernel Modules*): código objeto que se
enlaza **dentro** del kernel en caliente, en tiempo de ejecución.

Y ahí está la consecuencia que define todo lo demás:

> Tu módulo **no es un programa que usa el kernel. Tu módulo _es_ el kernel.**

De eso se derivan las reglas del oficio:

| En espacio de usuario | En espacio del kernel |
|---|---|
| `printf()` | `pr_info()` / `pr_err()` — salen a `dmesg`, no a una terminal |
| `malloc()` / `free()` | `kmalloc()` / `kfree()`, `vmalloc()`, `kmem_cache` |
| Segfault → muere tu proceso | Puntero malo → **oops o pánico**, se puede caer la máquina |
| Existe la libc | **No existe.** Solo la API interna del kernel |
| Pila de megabytes | Pila de **8 KB (o 16 KB)** total. Nada de arreglos grandes locales |
| Punto flotante libre | `float`/`double` prácticamente prohibidos |
| Tu proceso tiene un `main()` | No hay `main()`: hay ganchos que el kernel llama |
| ABI estable, tu binario sobrevive años | **No hay ABI estable**: cada versión puede romper tu módulo |

Esa última fila explica el 80% de la frustración de los principiantes: un
módulo se compila **contra los headers exactos del kernel que va a ejecutarlo**.

---

## Programa del curso

| Clase | Tema | Archivo del laboratorio |
|---|---|---|
| 1 | Anatomía del módulo mínimo | `lab1_hola.c` |
| 2 | Compilación con Kbuild | `Makefile` |
| 3 | Ciclo de vida: `insmod`, `lsmod`, `rmmod`, `dmesg` | — |
| 4 | Parámetros y validación de entrada | `lab2_params.c` |
| 5 | Interfaz con el usuario vía `/proc` | `lab3_procfs.c` |
| 6 | Reglas de oro y errores clásicos | esta guía |
| 7 | Hacia dónde seguir | esta guía |

---

## Clase 1 — Anatomía del módulo mínimo

Abrí `lab1_hola.c`. Son 25 líneas útiles y **cada una tiene una razón de ser**.
Vamos por partes.

### 1.1 Los includes

```c
#include <linux/module.h>  /* obligatorio en todo módulo */
#include <linux/init.h>    /* module_init / module_exit, __init, __exit */
#include <linux/printk.h>  /* pr_info y familia */
```

Fijate en `<linux/...>`: **no** hay `<stdio.h>`, **no** hay `<stdlib.h>`. Esos
headers son de la libc, que no existe acá. Todo lo que uses tiene que venir de
los headers del kernel.

### 1.2 Los dos ganchos

```c
static int  __init lab1_init(void) { ...; return 0; }
static void __exit lab1_exit(void) { ... }

module_init(lab1_init);
module_exit(lab1_exit);
```

Cuatro decisiones de diseño en cuatro palabras:

- **`static`** — la función no se exporta a la tabla global de símbolos del
  kernel. Sin `static`, tu `init` compite con los símbolos de miles de módulos.
  Regla: en un módulo, **todo es `static` salvo lo que exportes a propósito**
  con `EXPORT_SYMBOL()`.
- **`__init`** — marca la función en una sección especial (`.init.text`). El
  kernel la ejecuta y **libera esa memoria**. Solo válido para código de
  inicialización que jamás se vuelve a llamar.
- **`__exit`** — si el módulo se compila como *built-in* (dentro del kernel, no
  cargable), esta función es imposible de invocar, así que el linker la
  descarta. Ahorro gratis y correcto.
- **`module_init` / `module_exit`** — el registro. Sin esas dos líneas el
  módulo compila, carga, y no hace absolutamente nada.

> **Nota histórica que importa:** el ejemplo `hello-1.c` del libro usa los
> nombres mágicos `init_module()` y `cleanup_module()`. Funciona, pero es el
> estilo viejo, obliga a usar esos nombres exactos y solo permite un módulo por
> nombre. **Usá siempre `module_init()`/`module_exit()`** (como `hello-2.c` y
> nuestro `lab1`). Compará los dos archivos del libro: es la mejor forma de ver
> la diferencia.

### 1.3 El valor de retorno es un contrato

```c
return 0;        /* cargado con éxito  */
return -ENOMEM;  /* falló: sin memoria */
return -EINVAL;  /* falló: parámetro inválido */
```

`insmod` traduce ese número negativo al mensaje de error que ves en la
terminal. Nunca inventes códigos propios y nunca devuelvas positivos.

**La regla de oro del `init`:** si `init` falla, tiene que dejar el sistema
**exactamente** como lo encontró. Si registraste tres cosas y la cuarta falla,
desregistrás las tres antes de retornar el error. El kernel no limpia por vos:
si tu `init` devuelve error, tu `exit` **no se llama nunca**.

### 1.4 Los metadatos y el kernel "contaminado"

```c
MODULE_LICENSE("GPL");
MODULE_AUTHOR("...");
MODULE_DESCRIPTION("...");
MODULE_VERSION("1.0");
```

`MODULE_LICENSE` no es un trámite legal decorativo: tiene **efecto técnico**.
Si declarás una licencia no compatible con GPL (o no declarás nada), el kernel
se marca como *tainted* y tu módulo pierde acceso a todos los símbolos
exportados con `EXPORT_SYMBOL_GPL()` — que son la mayoría de los útiles.
Además, cualquier reporte de bug desde un kernel contaminado es ignorado por
los desarrolladores.

Los metadatos se leen después con `modinfo lab1_hola.ko`.

---

## Clase 2 — Cómo se compila esto (Kbuild)

Acá se cae mucha gente, porque el `Makefile` de un módulo **no se parece** a un
Makefile normal. Mirá el nuestro:

```make
obj-m += lab1_hola.o

KDIR ?= /lib/modules/$(shell uname -r)/build
PWD  := $(CURDIR)

all:
	$(MAKE) -C $(KDIR) M=$(PWD) modules
```

### 2.1 Qué pasa realmente cuando escribís `make`

1. `make` lee tu Makefile y corre la regla `all`.
2. `all` **no compila nada**. Hace `make -C $(KDIR)`: se va al directorio de
   build del kernel y ejecuta **el sistema de compilación del kernel** allá.
3. `M=$(PWD)` le dice al kernel: "tu código fuente principal es el tuyo, pero
   además quiero módulos externos que están en *este* directorio".
4. El Kbuild del kernel vuelve a leer **tu mismo Makefile**, pero esta vez solo
   le interesa la línea `obj-m`.

O sea: **tu Makefile se lee dos veces, con dos propósitos distintos.** Esa es
la parte que confunde, y entenderla te ahorra horas.

### 2.2 `obj-m` vs `obj-y`

- `obj-m += foo.o` → construir `foo.ko`, un módulo **cargable**.
- `obj-y += foo.o` → compilar dentro del kernel (*built-in*).

Para un módulo con varios archivos fuente:

```make
obj-m += midriver.o
midriver-objs := parte1.o parte2.o
```

(Está en el libro como el ejemplo `startstop`, con `start.c` + `stop.c`.)

### 2.3 `KDIR` y la maldición del *vermagic*

```make
KDIR ?= /lib/modules/$(shell uname -r)/build
```

`uname -r` da la versión del kernel **corriendo ahora**. Ese directorio tiene
los headers de *esa* versión exacta. El `.ko` resultante lleva grabada una
cadena llamada **vermagic** con versión, compilador y opciones de config.
`insmod` la compara, y si no coincide, rechaza el módulo:

```
insmod: ERROR: could not insert module foo.ko: Invalid module format
```

Y en `dmesg` verás la explicación real: *"version magic ... should be ..."*.
Casi nunca es un bug de tu código: **es que compilaste contra los headers
equivocados**.

### 2.4 Requisito de sintaxis que rompe todo

Las líneas de receta de un Makefile van con **TAB real**, no espacios. Y si
editás estos archivos en un editor de Windows, cuidado con los finales de línea
**CRLF**: `make` se atraganta. Los archivos de este directorio están en LF; si
alguno se rompe, `dos2unix Makefile` lo arregla.

---

## Clase 3 — Ciclo de vida: el laboratorio de comandos

Este es el bucle en el que vas a vivir. Todos los comandos son de un Linux real
(o VM), con `sudo`.

```bash
make                      # compila -> genera lab1_hola.ko, etc.
modinfo lab1_hola.ko      # metadatos: licencia, autor, params, vermagic

sudo insmod lab1_hola.ko  # cargar (ruta explícita, no busca en el sistema)
lsmod | grep lab1         # ¿está cargado? ¿cuántos lo usan?
sudo dmesg | tail         # ¿qué imprimió? -- acá aparece pr_info()
sudo rmmod lab1_hola      # descargar (SIN .ko: es el nombre del módulo)
sudo dmesg | tail         # ver el mensaje de salida
make clean
```

Y el atajo más útil de todos, en una segunda terminal:

```bash
sudo dmesg -wH            # log del kernel en vivo, con timestamps legibles
```

### 3.1 Detalles que valen puntos en el examen

- **`insmod` vs `modprobe`.** `insmod` carga *un* archivo `.ko` por ruta y
  falla si le falta una dependencia. `modprobe` trabaja por *nombre* de módulo,
  busca en `/lib/modules/$(uname -r)/`, y resuelve dependencias
  automáticamente. Para desarrollo: `insmod`. Para instalar de verdad:
  `make modules_install && sudo depmod -a`, y después `modprobe`.
- **`rmmod` falla si el contador de uso no es cero.** La columna "Used by" de
  `lsmod` te dice quién lo tiene tomado. Un archivo abierto en `/proc` que sea
  tuyo cuenta.
- **El módulo no "corre".** Entre `insmod` y `rmmod` está dormido. Solo despierta
  cuando alguien lo invoca: una syscall sobre su `/proc`, una interrupción, un
  timer. No hay bucle principal.
- **Secure Boot.** Si tu máquina lo tiene activado, el kernel rechaza módulos
  sin firmar (`ERROR: could not insert module: Key was rejected by service`).
  Para aprender, lo más simple es desactivar Secure Boot en la VM. Para hacerlo
  bien, el libro tiene la sección *Secure Boot Signing Guide*.

---

## Clase 4 — Parámetros (`lab2_params.c`)

Un módulo no recibe `argv[]`. Declara **parámetros tipados** que el kernel
parsea y valida antes de llamar a tu `init`:

```c
static char *nombre = "mundo";
module_param(nombre, charp, 0444);
MODULE_PARM_DESC(nombre, "A quién saludar");
```

```bash
sudo insmod lab2_params.ko nombre="Saju" veces=3 ruidoso=1
```

- **Tipos:** `byte`, `short`, `ushort`, `int`, `uint`, `long`, `ulong`,
  `charp` (puntero a char), `bool`, `invbool`. Para arreglos:
  `module_param_array(arr, int, &cuantos, 0644)` — y `cuantos` te dice cuántos
  elementos pasó el usuario realmente (ver `hello-5.c` del libro).
- **El tercer argumento son permisos de archivo**, y define la visibilidad en
  `/sys/module/lab2_params/parameters/`:
  - `0` → no aparece en sysfs.
  - `0444` → visible, solo lectura.
  - `0644` → **root puede modificarlo en caliente**, sin avisarte y sin
    notificación a tu código. Si usás `0644`, tu código debe tolerar que el
    valor cambie en cualquier momento.

```bash
cat /sys/module/lab2_params/parameters/nombre
echo 1 | sudo tee /sys/module/lab2_params/parameters/ruidoso
```

**Y la lección de fondo:** los parámetros vienen de espacio de usuario, o sea
que son **entrada no confiable**. En `lab2_init()` validamos rango y cadena
vacía, y devolvemos `-EINVAL` si no cierran. Fallar en `init` es la forma
limpia y correcta de rechazar basura.

---

## Clase 5 — Cruzar la frontera: `/proc` (`lab3_procfs.c`)

Un módulo que solo escribe en `dmesg` es un módulo sordo. Para hablar con el
espacio de usuario, Linux ofrece varias puertas:

| Mecanismo | Para qué se usa |
|---|---|
| `/proc` | Info y ajustes simples de texto. Fácil de empezar |
| `sysfs` | Un valor por archivo, atributos de dispositivo. Lo *correcto* hoy |
| `debugfs` | Depuración; nada de API estable, se puede romper cuando quieras |
| Char device | Un driver de verdad: `open/read/write/ioctl` |
| `netlink` | Sockets, eventos asincrónicos hacia usuario |

Empezamos con `/proc` porque el mecanismo se ve completo en 40 líneas.

```bash
sudo insmod lab3_procfs.ko
cat /proc/contador_curso        # lecturas=1
cat /proc/contador_curso        # lecturas=2
echo 100 | sudo tee /proc/contador_curso
cat /proc/contador_curso        # lecturas=101
sudo rmmod lab3_procfs
```

### 5.1 Las cuatro cosas que hay que entender del código

**a) Nunca desreferencies un puntero de usuario.**

Ese `char __user *buf` puede ser basura, puede estar paginado a disco, puede
apuntar a memoria de otro proceso. Tocarlo directo es un agujero de seguridad y
un oops. Se usa `copy_to_user()` / `copy_from_user()`, que verifican y devuelven
la cantidad de bytes **no** copiados (cualquier valor distinto de 0 → `-EFAULT`).
La anotación `__user` no hace nada al compilar, pero el analizador estático
`sparse` la usa para cazar exactamente este error.

**b) `read()` tiene offset, y hay que respetarlo.**

`cat` no llama a tu `read` una vez: lo llama hasta que devuelvas **0** (fin de
archivo). Si siempre devolvés datos ignorando `*off`, `cat` entra en bucle
infinito escupiendo texto. Por eso usamos
`simple_read_from_buffer(buf, len, off, tmp, n)`: respeta el offset, recorta a
`len`, llama a `copy_to_user()` y devuelve 0 cuando ya no queda nada.

**c) El kernel es concurrente por defecto.**

Dos procesos en dos CPUs pueden estar leyendo tu `/proc` en el mismo instante.
`contador++` sobre un `int` es una carrera de datos. Por eso el contador es
`atomic_t` con `atomic_inc()` / `atomic_read()`. Para estructuras más complejas
hacen falta mutex o spinlocks (capítulo *Synchronization* del libro).

**d) Lo que se crea en `init` se destruye en `exit`, en orden inverso.**

`proc_create()` en init ⇄ `proc_remove()` en exit. Si te olvidás, queda en
`/proc` una entrada cuyos punteros de función apuntan a código **que ya se
descargó de memoria**. El primer `cat` después de eso es un pánico del kernel.
No es una posibilidad teórica: es la consecuencia inevitable.

---

## Clase 6 — Las diez reglas de oro

1. **Todo `static`** salvo lo que exportes a propósito con `EXPORT_SYMBOL()`.
2. **Validá toda entrada de usuario.** Longitudes, rangos, punteros, `NULL`.
3. **Chequeá todo valor de retorno.** `kmalloc` puede fallar. `proc_create`
   puede fallar. Ignorar eso es un oops esperando turno.
4. **`init` limpia lo suyo si falla.** Si `init` devuelve error, `exit` no se
   llama. Nunca.
5. **Pila diminuta.** 8–16 KB para toda la cadena de llamadas. Nada de
   `char buf[4096]` local: eso va a `kmalloc`.
6. **No bloquees en contexto atómico.** Dentro de un manejador de interrupción
   o con un spinlock tomado no podés dormir: prohibido `kmalloc(GFP_KERNEL)`,
   `mutex_lock()`, `copy_to_user()` o cualquier cosa que ceda la CPU.
7. **Cada `kmalloc` tiene su `kfree`.** No hay recolector de basura, y una fuga
   en el kernel no se libera al terminar un proceso: **queda hasta el reboot**.
8. **Ojo con el punto flotante.** El kernel no guarda el estado FPU en cambios
   de contexto por defecto. Usá enteros o aritmética de punto fijo.
9. **La API no es estable.** Compilá contra los headers de tu kernel exacto y
   protegé con `LINUX_VERSION_CODE` lo que cambió (como el `proc_ops` de
   `lab3_procfs.c`).
10. **Probá en una VM, nunca en la máquina que te importa.** Un módulo con un
    bug no te tira un mensaje de error: te congela el sistema, y podés corromper
    un sistema de archivos montado.

### Errores clásicos y su síntoma

| Síntoma | Causa casi siempre |
|---|---|
| `Invalid module format` | vermagic ≠ kernel corriendo; recompilá contra los headers correctos |
| `Key was rejected by service` | Secure Boot activo y módulo sin firmar |
| `Operation not permitted` al `insmod` | Falta `sudo`, o `kernel.modules_disabled=1` |
| `Unknown symbol in module` | Usás un símbolo no exportado, o falta cargar otro módulo primero |
| `Module is in use` al `rmmod` | Alguien tiene tu recurso abierto; mirá "Used by" en `lsmod` |
| `cat` que nunca termina | No respetás `*offset` en tu `read()` |
| No aparece nada en `dmesg` | Nivel de log filtrado: probá `dmesg \| tail`, o subí el nivel en `/proc/sys/kernel/printk` |
| Compila pero `make` dice "missing separator" | Espacios en vez de TAB, o finales de línea CRLF en el Makefile |

---

## Clase 7 — Hacia dónde seguir

Terminaste los tres labs. El camino que recomiendo en el libro clonado
(`..\lkmpg\lkmpg.tex`), en este orden:

1. **`chardev.c`** — el primer driver de verdad: `open`/`read`/`release`,
   número mayor/menor, `struct file_operations`. Es *el* salto conceptual grande.
2. **`hello-sysfs.c`** — la forma moderna y correcta de exponer valores.
3. **`ioctl.c` + `other/userspace_ioctl.c`** — comandos con estructura, y un
   programa de usuario que los habla.
4. **`example_mutex.c`, `example_spinlock.c`, `example_atomic.c`** —
   sincronización, que es donde vive la mitad de los bugs reales del kernel.
5. **`sleep.c`, `completions.c`** — bloquear y despertar procesos.
6. **`bottomhalf.c`, `intrpt.c`, `example_tasklet.c`** — interrupciones y
   trabajo diferido.
7. **`devicemodel.c`, `devicetree.c`, `led.c`, `dht11.c`** — hardware real
   (ideal con una Raspberry Pi).
8. **`vinput.c`/`vkbd.c`, `blkram.c`, `vnetloop.c`** — subsistemas: input,
   bloque, red.

Y para hacerlo en serio: `Documentation/process/coding-style.rst` del árbol del
kernel, la herramienta `scripts/checkpatch.pl`, y la lista `linux-kernel@vger`.

---

## Anexo — Montar el entorno de compilación

**Esta máquina es Windows y no tiene WSL instalado.** Un módulo del kernel de
Linux solo se compila y carga en Linux. Dos caminos:

### Opción A (recomendada): VM con Ubuntu — el camino sin sorpresas

Hyper-V, VirtualBox o VMware con Ubuntu Desktop/Server. Dentro:

```bash
sudo apt update
sudo apt install build-essential linux-headers-$(uname -r)
```

Eso es todo. `uname -r` y los headers coinciden, `make` funciona, y si rompés
el kernel reiniciás una VM en vez de tu máquina — que es justamente **como se
debe** practicar esto.

### Opción B: WSL2 — con una advertencia honesta

```powershell
wsl --install -d Ubuntu     # requiere reinicio
```

WSL2 sirve perfecto para **leer, editar y estudiar** el código, y para generar
el PDF del libro. Pero para *cargar* módulos tiene una trampa que hay que saber:
WSL2 corre un kernel propio de Microsoft, y `apt install linux-headers-$(uname -r)`
normalmente **no tiene paquete para esa versión**. Para compilar módulos ahí hay
que bajar el fuente de [`microsoft/WSL2-Linux-Kernel`](https://github.com/microsoft/WSL2-Linux-Kernel)
en la rama de tu versión exacta y prepararlo. Es un desvío de una tarde.

Mi consejo de profesor: **opción A para el laboratorio**, WSL2 solo si ya lo
tenés y querés leer código.

### Generar el libro en PDF (opcional)

Con Docker en Windows, desde `..\lkmpg\`:

```powershell
docker run --rm -it -v ${PWD}:/workdir twtug/lkmpg
# adentro: make all
```

O leelo online: <https://sysprog21.github.io/lkmpg/>

---

## Tarea

**Ejercicio 1.** Modificá `lab2_params.c` para agregar un parámetro
`char *saludo` (por defecto `"hola"`) y usalo en lugar de la palabra fija.
Validá que no supere 32 caracteres.

**Ejercicio 2.** Hacé que `lab3_procfs.c` exponga **dos** archivos:
`/proc/contador_curso/lecturas` y `/proc/contador_curso/escrituras`, dentro de
un directorio creado con `proc_mkdir()`. Pista: `proc_remove()` sobre el
directorio limpia todo lo de adentro, pero pensá el orden con cuidado.

**Ejercicio 3.** Escribí un módulo que, al cargarse, imprima en `dmesg` el
`PID` y el nombre del proceso que lo cargó. Pista: la macro `current` y
`current->comm`.

**Preguntas de examen oral** (respondelas en voz alta antes de mirar la guía):

1. ¿Por qué `init` debe deshacer su propio trabajo si falla?
2. ¿Qué pasa exactamente si te olvidás de `proc_remove()` en el `exit`?
3. Tu `insmod` dice `Invalid module format`. ¿Qué revisás primero?
4. ¿Por qué `copy_to_user()` no se puede llamar con un spinlock tomado?
5. ¿Qué diferencia técnica —no legal— produce `MODULE_LICENSE("GPL")`?

---

*Basado en The Linux Kernel Module Programming Guide (Peter Jay Salzman, Michael
Burian, Ori Pomerantz, Bob Mottram, Jim Huang y colaboradores), licencia OSL-3.0.
Código de ejemplo del libro bajo GPL-2.*
