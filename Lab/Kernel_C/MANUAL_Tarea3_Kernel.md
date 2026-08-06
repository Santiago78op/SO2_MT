# Manual completo — Tarea #3: Compilar el kernel de Linux

**Curso:** Sistemas Operativos 2 · 2S2026
**Entorno real:** MacBook con chip **M5 (Apple Silicon / ARM64)** + **VMware Fusion** + **Debian 13 arm64**
**Kernel a compilar:** `6.12.69` (serie LTS)

---

## Cómo usar este manual

- Los pasos van **en orden**. No te salteés ninguno.
- Cada paso tiene un bloque **✅ VERIFICAR** — si eso no da lo esperado, **parate ahí** y resolvé antes de seguir. Es lo que evita descubrir un problema tres horas después.
- Cada paso tiene un bloque **📸 EVIDENCIA** con lo que hay que capturar para el informe.
- Los bloques **📚 TEORÍA** son lo que tenés que escribir en el informe (documentación vale **30 de 100 puntos**).
- Si tu versión de kernel no es `6.12.69`, reemplazá ese número **en todos los comandos**.

### Convención de rutas

| Ruta | Qué es |
|---|---|
| `~/kernel/` | Carpeta de trabajo que vas a crear |
| `~/kernel/linux-6.12.69/` | Fuente del kernel (**la mayoría de comandos se corren acá**) |
| `~/evidencias/` | Salidas de texto y logs para el informe |

---

# ÍNDICE

| Paso | Qué hacés | Rúbrica | Tiempo |
|---|---|---|---|
| [0](#paso-0) | Medir recursos del Mac | — | 2 min |
| [1](#paso-1) | Descargar Debian 13 arm64 | — | 10 min |
| [2](#paso-2) | Crear la VM en VMware Fusion | — | 10 min |
| [3](#paso-3) | Instalar Debian | — | 20 min |
| [4](#paso-4) | Post-instalación + `open-vm-tools` + **snapshot** | — | 10 min |
| [5](#paso-5) | Instalar GCC, make, GDB y librerías | **10 pts** | 10 min |
| [6](#paso-6) | Verificar el entorno (4 etapas + Makefile + GDB) | — | 20 min |
| [7](#paso-7) | Descargar y verificar el fuente del kernel | **10 pts** | 15 min |
| [8](#paso-8) | Inspeccionar drivers críticos | — | 5 min |
| [9](#paso-9) | Configurar: `.config` + `localmodconfig` | **10 pts** | 15 min |
| [10](#paso-10) | Desactivar firmas de módulos | — | 5 min |
| [11](#paso-11) | Reducir peso del build (recomendado) | — | 5 min |
| [12](#paso-12) | `EXTRAVERSION` con tu nombre y carné | **30 pts** | 10 min |
| [13](#paso-13) | Compilar | **20 pts** | 40–120 min |
| [14](#paso-14) | Instalar módulos y kernel | — | 10 min |
| [15](#paso-15) | Configurar GRUB y reiniciar | — | 10 min |
| [16](#paso-16) | Verificación final: `uname -r` | — | 5 min |
| [17](#paso-17) | Opcional: script bash + comparativa de tiempos | extra | 30 min |
| [18](#paso-18) | Armar el informe PDF | **30 pts** | 2 h |
| [19](#paso-19) | Solución de errores | — | — |

---

<a name="paso-0"></a>
# PASO 0 — Medir los recursos de tu Mac

Abrí la **Terminal de macOS** (no la VM, todavía no existe).

```bash
sysctl -n hw.ncpu          # núcleos totales
sysctl -n hw.memsize       # RAM en bytes
df -h /                    # espacio libre
```

Convertí la RAM a GB: dividí el número entre 1073741824.

### Anotá tus números

| Dato | Tu valor | Qué le vas a dar a la VM |
|---|---|---|
| Núcleos del Mac | `_____` | **núcleos − 2** |
| RAM del Mac | `_____ GB` | **la mitad** (mínimo 8 GB, ideal 16 GB) |
| Espacio libre | `_____ GB` | Necesitás **≥ 60 GB libres** |

> 📚 **TEORÍA — por qué no darle todo a la VM**
> El hipervisor no le "quita" núcleos a macOS: los reparte por tiempo (*time-slicing*). Si le das todos los núcleos, macOS y la VM se pelean por CPU y hay *context switching* constante. Peor es la RAM: la que asignás a la VM queda reservada, y si a macOS no le sobra empieza a hacer *swap* a disco (memory compression + swapfile). El disco es órdenes de magnitud más lento que la RAM, así que la compilación termina siendo **más lenta**, no más rápida.

> ⚠️ **Si tenés menos de 60 GB libres, liberá espacio antes de seguir.** El build del kernel con símbolos de depuración supera los 30 GB. Un `No space left on device` a las dos horas de compilar significa empezar de cero.

---

<a name="paso-1"></a>
# PASO 1 — Descargar Debian 13 arm64

## 1.1 Por qué Debian y no Linux Mint

**Linux Mint no publica ISOs para ARM64.** Solo existe para x86-64. Tu M5 es ARM64, así que Mint queda descartado por hardware.

El enunciado pide *"una distribución basada en Debian (Se recomienda Linux Mint)"*. Mint está basado en Ubuntu, y Ubuntu está basado en Debian. Usar **Debian directamente cumple el requisito.**

Y hay una razón técnica que te ahorra dolor:

| Distro arm64 | Kernel que trae | Consecuencia |
|---|---|---|
| **Debian 13 (trixie)** | **6.12 LTS** | Copiar su `.config` sobre el fuente 6.12.69 = **misma serie**, casi cero opciones nuevas que responder |
| Ubuntu 24.04 | 6.8 / 6.14 HWE | Salto de serie → `make` te interroga por decenas de opciones nuevas |
| Fedora Asahi | 6.x | RPM, no cumple "basada en Debian" |

## 1.2 Descargar

Bajá el **netinst para arm64** (~700 MB):

```
https://www.debian.org/distrib/netinst
→ sección "arm64"
→ debian-13.x.x-arm64-netinst.iso
```

> ⚠️ **Verificá que el nombre diga `arm64`.** Si dice `amd64`, es la versión x86 y **no va a arrancar** en tu Mac.

**✅ VERIFICAR** — en la Terminal de macOS:

```bash
cd ~/Downloads
ls -lh debian-*arm64*.iso
shasum -a 256 debian-*arm64*.iso
```

Comparalo con el `SHA256SUMS` que Debian publica junto a la ISO. Si no coincide, la descarga se corrompió: bajala de nuevo.

> 📚 **TEORÍA — qué es un checksum**
> `SHA-256` es una función hash criptográfica: convierte cualquier archivo en una huella de 256 bits. Cambiar **un solo bit** del archivo produce una huella completamente distinta (*efecto avalancha*). Es *unidireccional*: de la huella no se puede reconstruir el archivo. Sirve para dos cosas: detectar corrupción en la transferencia, y detectar manipulación intencional. El mismo mecanismo se usa dentro del kernel para firmar módulos (Paso 10).

**📸 EVIDENCIA:** captura del `shasum` coincidiendo con el oficial.

---

<a name="paso-2"></a>
# PASO 2 — Crear la VM en VMware Fusion

## 2.1 Crear

1. Abrí **VMware Fusion**.
2. **File → New…**
3. Elegí **Install from disc or image**.
4. Arrastrá el `.iso` de Debian arm64 → **Continue**.
5. Si te pregunta el sistema operativo huésped: **Linux → Debian 12.x 64-bit Arm** (o *Other Linux 6.x kernel 64-bit Arm*).
6. ⚠️ **NO le des "Finish" todavía.** Clic en **Customize Settings**, guardá la VM con nombre `Debian13-SO2`.

## 2.2 Ajustar los recursos

Se abre la ventana de Settings. Configurá **exactamente** esto:

### Processors & Memory

| Campo | Valor |
|---|---|
| Processors | **tus núcleos − 2** (del Paso 0) |
| Memory | **16384 MB** (o la mitad de tu RAM si tenés menos de 32 GB) |
| Enable hypervisor applications | ❌ desmarcado |

### Hard Disk

| Campo | Valor | Por qué |
|---|---|---|
| Disk size | **80 GB** | El build supera 30 GB |
| Pre-allocate disk space | ❌ **desmarcado** | *Thin provisioning*: el archivo crece según uso, no te ocupa 80 GB del Mac de entrada |
| Split into multiple files | ✅ marcado | Archivos de 2 GB, más manejables |

Después de cambiar el tamaño, dale **Apply**.

### Display

| Campo | Valor | Por qué |
|---|---|---|
| Accelerate 3D Graphics | ❌ desmarcado | No lo necesitás, ahorra recursos |
| Use full resolution for Retina display | ❌ desmarcado | Tus capturas quedan de tamaño razonable |

### Network Adapter

| Campo | Valor |
|---|---|
| Share with my Mac (NAT) | ✅ |

> Necesitás internet para `apt` y para descargar el fuente del kernel.

## 2.3 Cerrar y arrancar

Cerrá Settings y dale al botón **▶ Play**.

> 📚 **TEORÍA — virtualización vs. emulación**
> | | **Virtualización** (lo tuyo) | Emulación |
> |---|---|---|
> | ISA del huésped | La **misma** que el host (ARM64 → ARM64) | Distinta (x86 → ARM64) |
> | Mecanismo | El CPU ejecuta las instrucciones **nativamente**; el hipervisor solo intercepta operaciones privilegiadas (acceso a hardware, cambios de tabla de páginas) usando extensiones del procesador | Cada instrucción se **traduce en software** |
> | Overhead | ~2–5 % | 1000–2000 % |
>
> VMware Fusion en Apple Silicon usa el `Hypervisor.framework` de macOS y **solo soporta huéspedes ARM64**. Por eso no podés correr Linux Mint x86: no hay traducción de ISA. Y aunque la hubiera (QEMU en modo TCG), una compilación de 40 minutos pasaría a 8–20 horas. Inviable.
>
> 📚 **TEORÍA — por qué NO sirve Docker para esta tarea**
> Un contenedor **no tiene kernel propio**. Docker usa *namespaces* (aislar PIDs, red, filesystem) y *cgroups* (limitar recursos), pero todos los contenedores comparten el **kernel del host**. Podés compilar un kernel dentro de un contenedor, pero **jamás bootearlo**: no hay firmware, no hay bootloader, no hay `/boot` propio. Y `uname -r` dentro del contenedor devuelve la versión del kernel del host. Como la tarea exige `uname -r` mostrando tu nombre **después de bootear**, hace falta una VM real con hardware virtualizado completo.

**📸 EVIDENCIA:** captura de la ventana de Settings mostrando CPU, RAM y disco.

---

<a name="paso-3"></a>
# PASO 3 — Instalar Debian

Arranca el instalador. Elegí **Graphical install** (o *Install* si preferís texto).

## Decisiones del instalador

Seguí esta tabla al pie de la letra. Las tres marcadas con ⚠️ tienen consecuencias.

| Pantalla | Qué elegir |
|---|---|
| Language | English (recomendado: los mensajes de error son más buscables) o Spanish |
| Location | Guatemala |
| Keymap | El que corresponda a tu teclado (probalo en el campo de prueba) |
| Hostname | `debian-so2` |
| Domain name | *(dejar vacío)* |
| ⚠️ **Root password** | **DEJALO VACÍO** en ambos campos → Continue |
| Full name | Tu nombre completo |
| Username | `tuusuario` (minúsculas, sin espacios) |
| User password | La que quieras — **anotala** |
| Time zone | Guatemala |
| ⚠️ **Partitioning method** | **Guided – use entire disk** |
| Select disk | El único que aparece (~80 GB) |
| ⚠️ **Partitioning scheme** | **All files in one partition** |
| Write changes to disk? | **Yes** |
| Scan extra installation media? | No |
| Debian archive mirror | Guatemala, o `deb.debian.org` |
| HTTP proxy | *(vacío)* |
| Participate in package survey? | No |

### ⚠️ Software selection — la pantalla más importante

Marcá con **espacio** exactamente esto:

```
[*] Debian desktop environment
[*]   Xfce
[ ]   ... (desmarcá GNOME, KDE, y todos los demás escritorios)
[ ] web server
[ ] SSH server        ← opcional, marcalo si querés entrar por ssh desde macOS
[*] standard system utilities
```

> **Por qué XFCE:** es el escritorio más liviano y el más parecido visualmente a Linux Mint. GNOME te come 1.5 GB de RAM que necesitás para compilar.
> **Por qué necesitás escritorio:** la rúbrica pide **capturas de pantalla**. Sin GUI es más incómodo.

| Pantalla | Qué elegir |
|---|---|
| Install GRUB to primary drive? | **Yes** |
| Device for bootloader | El disco (`/dev/nvme0n1` o `/dev/sda`) |

Al terminar: **Continue** → reinicia → entrá con tu usuario.

**✅ VERIFICAR** — abrí una terminal en Debian (Menú → Terminal Emulator) y corré:

```bash
whoami
groups
```

En la salida de `groups` **tiene que aparecer `sudo`**.

> ❌ **Si `sudo` NO aparece:** le pusiste contraseña a root. Arreglalo así:
> ```bash
> su -                          # ingresá la contraseña de root
> /usr/sbin/usermod -aG sudo tuusuario
> exit
> ```
> Después **cerrá sesión y volvé a entrar** (o reiniciá) para que el grupo tome efecto.

---

<a name="paso-4"></a>
# PASO 4 — Post-instalación, guest tools y snapshot

## 4.1 Actualizar el sistema

```bash
sudo apt update
sudo apt full-upgrade -y
```

## 4.2 Instalar las VMware guest tools

```bash
sudo apt install -y open-vm-tools open-vm-tools-desktop
```

Esto te da: portapapeles compartido con macOS, redimensionado automático de pantalla y carpetas compartidas (útil para pasar capturas al informe).

> ⚠️ **Este paso va ANTES del Paso 9 (`localmodconfig`), y no es opcional.**
> Al instalar las guest tools se cargan los módulos `vmw_vmci` y `vmw_vsock_vmci_transport`. `localmodconfig` conserva **solo los módulos cargados en ese momento**. Si corrés `localmodconfig` antes de instalar las tools, esos módulos se eliminan del `.config` y tu kernel nuevo pierde la integración con el host.

## 4.3 Reiniciar

```bash
sudo reboot
```

## 4.4 Crear las carpetas de trabajo

```bash
mkdir -p ~/kernel ~/evidencias
```

## 4.5 📸 SNAPSHOT — no te lo saltés

En VMware Fusion, con la VM corriendo:

**Virtual Machine → Snapshots… → Take Snapshot**
Nombre: **`01-debian-limpio`**

> Este snapshot es tu red de seguridad. El Paso 14 modifica `/boot` y GRUB. Si algo se rompe, volvés acá en 30 segundos en vez de reinstalar Debian.
>
> **Vas a tomar dos snapshots más:** `02-antes-de-compilar` (Paso 12) y `03-antes-de-instalar` (Paso 14).

**✅ VERIFICAR:**

```bash
cat /etc/os-release | head -3
uname -r
uname -m
systemctl status open-vm-tools --no-pager
```

Esperás:
- `VERSION_ID="13"`
- `uname -r` → algo como `6.12.xx-arm64` ← **confirmá que sea 6.12.x**
- `uname -m` → `aarch64`
- open-vm-tools → `active (running)`

> ❌ **Si `uname -r` NO es 6.12.x:** el `.config` que vas a copiar es de otra serie y `make` te va a interrogar por muchas opciones nuevas. No es fatal (contestás con Enter para aceptar defaults), pero avisame antes de seguir.

## 4.6 Guardar la línea base

```bash
{
  echo "===== LINEA BASE - ANTES DE COMPILAR ====="
  echo "Fecha: $(date)"
  echo; echo "--- Sistema ---"; uname -a
  echo; echo "--- Arquitectura ---"; uname -m
  echo; echo "--- Distribucion ---"; cat /etc/os-release
  echo; echo "--- Kernel actual ---"; uname -r
  echo; echo "--- CPU ---"; nproc; lscpu | head -20
  echo; echo "--- RAM ---"; free -h
  echo; echo "--- Disco ---"; df -h /
  echo; echo "--- Contenido de /boot ---"; ls -lh /boot/
} > ~/evidencias/00-linea-base.txt

cat ~/evidencias/00-linea-base.txt
```

**📸 EVIDENCIA:** captura de `uname -a` + `uname -m` + `free -h` + `df -h /`. Este es el **"antes"** contra el que vas a contrastar el `uname -r` final. Guardá también el archivo `00-linea-base.txt`.

---

<a name="paso-5"></a>
# PASO 5 — Instalar GCC, make, GDB y librerías de desarrollo

> 🎯 **Rúbrica: 10 puntos** ("Instalación correcta de GCC, make y librerías de desarrollo")

## 5.1 El comando

```bash
sudo apt install -y \
  build-essential \
  gdb \
  libncurses-dev \
  bison \
  flex \
  libssl-dev \
  libelf-dev \
  libdw-dev \
  fakeroot \
  dwarves \
  bc \
  rsync \
  cpio \
  kmod \
  zstd \
  xz-utils \
  wget \
  git \
  python3
```

> ⚠️ **Esta lista es más larga que la del README del curso, y a propósito.** El README omite `bc`, `rsync`, `cpio`, `zstd` y `libdw-dev`, que en una instalación limpia de Debian **no vienen** y hacen fallar el build en momentos distintos. También omite `gdb`, que la rúbrica pide explícitamente. Mencioná esta diferencia en tu informe: demuestra que no copiaste la guía a ciegas.

## 5.2 Para qué sirve cada paquete

> 📚 **TEORÍA — copiá esta tabla al informe**

| Paquete | Rol en la compilación del kernel |
|---|---|
| `build-essential` | Meta-paquete: `gcc`, `g++`, `make`, `libc6-dev`, `dpkg-dev`. Las **librerías de desarrollo de C** que pide el enunciado están en `libc6-dev` (headers `.h` + libs estáticas de glibc). |
| `gdb` | Depurador. La rúbrica lo pide; se verifica en el Paso 6. |
| `bison` + `flex` | El kernel tiene su **propio lenguaje de configuración** (Kconfig). `flex` genera el analizador **léxico** (parte el texto en tokens) y `bison` el **sintáctico** (aplica la gramática). Son generadores de compiladores usados para construir el parser de la configuración. |
| `libncurses-dev` | Librería de UI en terminal. La usa `make menuconfig`. |
| `libssl-dev` | Headers de OpenSSL. El kernel calcula hashes y **firma módulos** durante el build, y su subsistema de crypto los necesita. |
| `libelf-dev` | ELF (*Executable and Linkable Format*) es el formato de binarios en Linux. El build necesita leer y manipular su propia salida ELF. |
| `libdw-dev` | Lectura de información de depuración DWARF. La usa `pahole`. |
| `dwarves` | Trae **`pahole`**, que convierte DWARF a **BTF** (*BPF Type Format*), requerido por `CONFIG_DEBUG_INFO_BTF` que Debian activa. Sin esto el build muere al final. |
| `fakeroot` | Intercepta syscalls (`chown`, `stat`, `chmod`) vía `LD_PRELOAD` y **le miente al proceso** haciéndole creer que es root. Así compilás sin `sudo`: menos riesgo de romper el sistema por un error en un Makefile. |
| `bc` | Calculadora de precisión arbitraria. `kernel/time/timeconst.bc` la usa para precalcular constantes de conversión de tiempo. |
| `rsync` | Copia los headers del kernel durante `make headers_install` y pasos internos. |
| `cpio` | Empaqueta el **initramfs** (formato cpio, no tar). |
| `kmod` | Provee `modprobe`, `insmod`, `lsmod`, `depmod`. |
| `zstd` | Debian activa `CONFIG_MODULE_COMPRESS_ZSTD`: los `.ko` se comprimen con Zstandard al instalarse. |
| `xz-utils` | Descomprime el tarball `.tar.xz` del kernel. |

## 5.3 ✅ VERIFICAR versiones

```bash
{
  echo "===== HERRAMIENTAS INSTALADAS ====="
  echo "Fecha: $(date)"
  echo; echo "--- GCC ---";   gcc --version
  echo; echo "--- MAKE ---";  make --version | head -3
  echo; echo "--- GDB ---";   gdb --version | head -2
  echo; echo "--- LD ---";    ld --version | head -2
  echo; echo "--- AS ---";    as --version | head -2
  echo; echo "--- CPP ---";   cpp --version | head -2
  echo; echo "--- pahole ---"; pahole --version
  echo; echo "--- bison ---"; bison --version | head -1
  echo; echo "--- flex ---";  flex --version
  echo; echo "--- Librerias de desarrollo de C ---"
  dpkg -l | grep -E '^ii\s+(libc6-dev|libssl-dev|libelf-dev|libncurses-dev|libdw-dev)'
  echo; echo "--- Headers de glibc presentes ---"
  ls /usr/include/stdio.h /usr/include/stdlib.h
  echo; echo "--- Target del compilador ---"
  gcc -dumpmachine
} | tee ~/evidencias/01-herramientas.txt
```

**Esperás:**
- `gcc --version` → GCC 14.x
- `gcc -dumpmachine` → **`aarch64-linux-gnu`** ← confirma que compilás nativo para ARM64
- `pahole --version` → v1.2x o superior
- Los cinco paquetes `lib*-dev` con estado `ii` (installed)

> ❌ **Si algún comando dice `command not found`:** ese paquete no se instaló. Corré `sudo apt install -y <paquete>` de nuevo y revisá el mensaje de error.

**📸 EVIDENCIA:** captura de `gcc --version`, `make --version`, `gdb --version` y del `dpkg -l | grep`. Guardá `01-herramientas.txt`.

---

<a name="paso-6"></a>
# PASO 6 — Verificar que el entorno realmente compila

> 🎯 **Rúbrica:** "Verificación de entorno — el entorno de compilación funciona correctamente" + "make se comprobó con un Makefile simple"

Acá no alcanza con `gcc --version`. Hay que **demostrar** que la cadena completa funciona. Este paso es el que separa un informe de 5 puntos de uno de 10.

```bash
mkdir -p ~/pruebas && cd ~/pruebas
```

## 6.1 Un programa de prueba

Creá `hola.c`:

```bash
cat > hola.c <<'EOF'
#include <stdio.h>
#include <stdlib.h>

#define AUTOR  "TU NOMBRE COMPLETO"
#define CARNE  "TU NUMERO DE CARNE"

int sumar(int a, int b) {
    int resultado = a + b;
    return resultado;
}

int main(void) {
    printf("Verificacion de entorno - Tarea 3 SO2\n");
    printf("Autor: %s\n", AUTOR);
    printf("Carne: %s\n", CARNE);
    printf("sumar(20, 22) = %d\n", sumar(20, 22));
    return EXIT_SUCCESS;
}
EOF
```

> ⚠️ **Editá `AUTOR` y `CARNE` con tus datos reales** antes de compilar:
> ```bash
> nano hola.c      # Ctrl+O guarda, Ctrl+X sale
> ```

## 6.2 Compilar y ejecutar

```bash
gcc -Wall -Wextra -g -o hola hola.c
./hola
```

**Esperás:** el programa imprime tus datos y `sumar(20, 22) = 42`, **sin ningún warning**.

## 6.3 Las 4 etapas de GCC — el punto fuerte del informe

> 📚 **TEORÍA**
> `gcc` no es un compilador: es un **driver** que orquesta cuatro programas distintos.
>
> ```
> hola.c ──[cpp]──> hola.i ──[gcc -S]──> hola.s ──[as]──> hola.o ──[ld]──> hola
>        preproceso        compilación         ensamblado        enlazado
> ```
>
> 1. **Preprocesador (`cpp`)** — resuelve `#include`, `#define` e `#ifdef`. Trabaja sobre **texto puro**; no entiende C. El `#include <stdio.h>` se reemplaza literalmente por el contenido del header.
> 2. **Compilador propiamente dicho** — análisis léxico → sintáctico → semántico → optimización → genera **assembler de tu arquitectura** (ARM64 en tu caso).
> 3. **Ensamblador (`as`)** — traduce el assembler a código máquina y produce un *object file* **relocalizable**: las direcciones aún no son definitivas.
> 4. **Enlazador (`ld`)** — junta todos los `.o` con las librerías, **resuelve los símbolos externos** (`printf` vive en libc) y fija las direcciones finales.

Ejecutá cada etapa por separado:

```bash
# Etapa 1 — Preproceso
gcc -E hola.c -o hola.i
echo ">>> Lineas en hola.c:   $(wc -l < hola.c)"
echo ">>> Lineas en hola.i:   $(wc -l < hola.i)"
echo ">>> (el crecimiento es stdio.h + stdlib.h expandidos)"

# Etapa 2 — Compilación a assembler ARM64
gcc -S hola.i -o hola.s
echo ">>> Assembler ARM64 generado:"
head -25 hola.s

# Etapa 3 — Ensamblado a object file
gcc -c hola.s -o hola.o
file hola.o
echo ">>> Simbolos: 'T' = definido aqui, 'U' = pendiente de resolver"
nm hola.o

# Etapa 4 — Enlazado
gcc hola.o -o hola_final
file hola_final
echo ">>> Librerias dinamicas que necesita:"
ldd hola_final
./hola_final
```

**Qué observar y comentar en el informe:**

| Observación | Qué significa |
|---|---|
| `hola.c` tiene ~20 líneas, `hola.i` tiene ~1000+ | El preprocesador expandió los headers línea por línea |
| `hola.s` contiene `stp`, `ldp`, `bl`, `x0`, `w0` | Son instrucciones y registros **ARM64**. En x86 verías `mov`, `push`, `%rax`. **Prueba directa de que compilás para otra ISA.** |
| `nm hola.o` marca `printf` con **`U`** (undefined) | El object file **no sabe** dónde está `printf`. Lo resuelve el enlazador. |
| `file hola.o` → "relocatable" | Sus direcciones todavía no son definitivas |
| `file hola_final` → "dynamically linked, interpreter /lib/ld-linux-aarch64.so.1" | Enlazado dinámico: libc se carga en tiempo de ejecución |
| `ldd` lista `libc.so.6` | La dependencia que resolvió `ld` |

## 6.4 Verificar `make` con un Makefile propio

> ⚠️ **LA TRAMPA CLÁSICA:** en un Makefile, las líneas de receta **deben empezar con un TAB literal**, no con espacios. Si usás espacios obtenés `Makefile:3: *** missing separator. Stop.`

Usá este heredoc, que ya lleva el tab correcto:

```bash
cat > Makefile <<'EOF'
CC      = gcc
CFLAGS  = -Wall -Wextra -g
TARGET  = hola
OBJS    = hola.o

all: $(TARGET)

$(TARGET): $(OBJS)
	$(CC) $(CFLAGS) -o $@ $^

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	rm -f $(TARGET) $(OBJS) *.i *.s hola_final

.PHONY: all clean
EOF
```

**✅ VERIFICAR que los tabs quedaron bien** — este chequeo te ahorra el error:

```bash
cat -A Makefile | grep -n '\^I'
```

Tienen que aparecer **4 líneas** con `^I` al inicio (las recetas de `$(TARGET)`, `%.o`, y `clean`). `^I` **es** el tab. Si no ves ninguna, el heredoc perdió los tabs: abrí con `nano Makefile` y presioná Tab manualmente al inicio de cada línea de receta.

Ahora probá `make`:

```bash
make clean
make                 # (1) compila todo
make                 # (2) NO recompila: "is up to date"
touch hola.c
make                 # (3) detecta el cambio y recompila
make clean
```

**Esperás:**
- (1) ejecuta `gcc -c` y luego `gcc -o`
- (2) → `make: Nothing to be done for 'all'.` o `'hola' is up to date.`
- (3) recompila, porque `touch` actualizó el *timestamp* de `hola.c`

> 📚 **TEORÍA — cómo decide `make`**
> Un Makefile es un **grafo dirigido de dependencias**. Cada regla dice `objetivo: prerrequisitos`. `make` recorre el grafo y compara **timestamps de modificación** (`mtime`) del filesystem: si algún prerrequisito es **más nuevo** que el objetivo, ejecuta la receta; si no, la salta.
>
> Esa es toda la magia, y es por eso que existe: sin `make`, cambiar una línea en el kernel obligaría a recompilar los 30 millones de líneas. Con `make`, recompila solo los archivos afectados y vuelve a enlazar.
>
> Variables automáticas usadas arriba: `$@` = el objetivo, `$^` = todos los prerrequisitos, `$<` = el primer prerrequisito.
>
> El kernel usa un sistema de Makefiles recursivos propio llamado **Kbuild**, construido sobre GNU Make.

## 6.5 Verificar GDB

```bash
make
gdb -q ./hola <<'EOF'
break sumar
run
info args
print a
print b
next
print resultado
backtrace
info registers x0 x1
continue
quit
EOF
```

**Esperás:** GDB se detiene en `sumar`, te muestra `a = 20`, `b = 22`, y después del `next` te muestra `resultado = 42`, con un `backtrace` que indica que `sumar` fue llamada desde `main`.

> 📚 **TEORÍA — por qué GDB necesita `-g`**
> Un binario compilado sin `-g` contiene **solo código máquina y direcciones**. GDB podría detenerse en `0x400526`, pero no sabría que eso es la línea 8 de `hola.c` ni que el registro `w1` contiene la variable `resultado`.
>
> El flag `-g` incrusta en el binario una sección de metadatos en formato **DWARF** que mapea: dirección de máquina ↔ archivo y número de línea, nombres y tipos de variables, ubicación de cada variable (registro u offset del stack frame), y la estructura de los stack frames para reconstruir el `backtrace`.
>
> Comprobalo:
> ```bash
> gcc -o hola_sing hola.c            # sin -g
> gcc -g -o hola_cong hola.c         # con -g
> ls -l hola_sing hola_cong          # el segundo pesa mas
> readelf -S hola_cong | grep debug  # secciones .debug_*
> readelf -S hola_sing | grep debug  # vacio
> ```
>
> **Este es el mismo mecanismo que el kernel usa** con `CONFIG_DEBUG_INFO`, y la razón por la que el build del kernel puede llegar a 30 GB: los símbolos DWARF de 30 millones de líneas son enormes. En el Paso 11 vas a desactivarlos justamente por eso.

## 6.6 Guardar la evidencia

```bash
cd ~/pruebas
{
  echo "===== VERIFICACION DEL ENTORNO DE COMPILACION ====="
  echo "Fecha: $(date)"
  echo; echo "--- Codigo fuente ---";              cat hola.c
  echo; echo "--- Makefile (^I = TAB) ---";        cat -A Makefile
  echo; echo "--- Etapa 1: preproceso ---"
  echo "hola.c: $(wc -l < hola.c) lineas -> hola.i: $(wc -l < hola.i) lineas"
  echo; echo "--- Etapa 2: assembler ARM64 (primeras 25) ---"; head -25 hola.s
  echo; echo "--- Etapa 3: object file ---";       file hola.o; nm hola.o
  echo; echo "--- Etapa 4: ejecutable ---";        file hola; ldd hola
  echo; echo "--- Ejecucion ---";                  ./hola
  echo; echo "--- Comparacion con/sin -g ---";     ls -l hola_sing hola_cong 2>/dev/null
} | tee ~/evidencias/02-verificacion-entorno.txt
```

**📸 EVIDENCIA (5 capturas):**
1. `hola.c` compilado y ejecutándose
2. La comparación de líneas `hola.c` → `hola.i`
3. El assembler ARM64 (`head -25 hola.s`) — **señalá las instrucciones ARM**
4. `make` diciendo *"is up to date"* en la segunda corrida
5. GDB detenido en el breakpoint mostrando `resultado = 42`

---

<a name="paso-7"></a>
# PASO 7 — Descargar y verificar el fuente del kernel

> 🎯 **Rúbrica: 10 puntos** ("Descarga y configuración del código fuente")

## 7.1 Confirmar que la versión existe

```bash
cd ~/kernel
curl -s https://cdn.kernel.org/pub/linux/kernel/v6.x/ | grep -o 'linux-6\.12\.[0-9]*\.tar\.xz' | sort -uV | tail -5
```

Confirmá que `linux-6.12.69.tar.xz` aparece en la lista.

> ❌ **Si no aparece:** usá la versión 6.12.x más alta que sí aparezca y **reemplazá el número en todos los comandos siguientes**. Anotá el cambio en el informe.

## 7.2 Descargar

```bash
cd ~/kernel
wget https://cdn.kernel.org/pub/linux/kernel/v6.x/linux-6.12.69.tar.xz
wget https://cdn.kernel.org/pub/linux/kernel/v6.x/sha256sums.asc
```

## 7.3 ✅ VERIFICAR integridad

```bash
cd ~/kernel
grep 'linux-6.12.69.tar.xz' sha256sums.asc
sha256sum linux-6.12.69.tar.xz
```

Los dos hashes tienen que ser **idénticos**. Comparación automática:

```bash
grep 'linux-6.12.69.tar.xz$' sha256sums.asc | sha256sum -c -
```

**Esperás:** `linux-6.12.69.tar.xz: OK`

> ❌ **Si dice `FAILED`:** la descarga se corrompió. `rm linux-6.12.69.tar.xz` y descargá de nuevo. **No descomprimas un tarball que falló el checksum** — vas a perder horas persiguiendo errores fantasma.

## 7.4 Descomprimir

```bash
cd ~/kernel
time tar -xf linux-6.12.69.tar.xz
```

Tarda 1–3 minutos (son ~85,000 archivos).

## 7.5 Explorar la estructura — esto va al informe

```bash
cd ~/kernel/linux-6.12.69

echo "=== Tamaño del fuente ==="
du -sh .

echo "=== Archivos totales ==="
find . -type f | wc -l

echo "=== Lineas de codigo C y headers ==="
find . -name '*.c' -o -name '*.h' | xargs wc -l 2>/dev/null | tail -1

echo "=== Directorios de primer nivel ==="
ls -d */

echo "=== Arquitecturas soportadas ==="
ls arch/

echo "=== Version declarada en el Makefile ==="
head -6 Makefile
```

> 📚 **TEORÍA — el árbol del kernel (tabla para el informe)**
>
> | Directorio | Contenido |
> |---|---|
> | `arch/` | Código **específico por arquitectura**: arranque, MMU, tablas de interrupciones, implementación de syscalls. `arch/arm64/` es el tuyo; `arch/x86/` es el que usaría una PC Intel. |
> | `kernel/` | Núcleo independiente de arquitectura: *scheduler*, gestión de procesos, timers, señales |
> | `mm/` | *Memory management*: memoria virtual, paginación, `mmap`, OOM killer |
> | `fs/` | Sistemas de archivos y la capa **VFS** que los abstrae |
> | `drivers/` | **El directorio más grande** (>60% del código): drivers de dispositivos |
> | `net/` | Pila de red: TCP/IP, sockets, netfilter |
> | `include/` | Headers compartidos (`include/linux/`, `include/uapi/` para userspace) |
> | `init/` | Arranque del kernel: `start_kernel()`, la primera función C que corre |
> | `scripts/` | Herramientas del build: `kconfig`, `Kbuild`, `scripts/config` |
> | `certs/` | Certificados para firmar módulos ← **acá está el problema del Paso 10** |
> | `Documentation/` | Documentación oficial |
> | `Makefile` | Makefile raíz ← **acá vas a editar `EXTRAVERSION`** |
>
> **El punto conceptual clave:** el kernel **no es portable a nivel binario**. Cada arquitectura necesita su propio código de arranque, manejo de MMU y ABI de syscalls. Al compilar, Kbuild detecta tu arquitectura con `uname -m` y selecciona `arch/arm64/`. Vas a generar `arch/arm64/boot/Image.gz`, **no** `arch/x86/boot/bzImage` como dice el README del curso.

**📸 EVIDENCIA:** capturas del `sha256sum -c` con `OK`, del `du -sh .`, del conteo de líneas de código, y de `ls arch/` mostrando que `arm64` existe junto a `x86`. Guardá:

```bash
{
  echo "===== FUENTE DEL KERNEL ====="
  echo "Fecha: $(date)"
  cd ~/kernel
  echo; echo "--- Checksum ---"
  grep 'linux-6.12.69.tar.xz$' sha256sums.asc | sha256sum -c -
  cd ~/kernel/linux-6.12.69
  echo; echo "--- Tamaño ---";        du -sh .
  echo; echo "--- Archivos ---";      find . -type f | wc -l
  echo; echo "--- Lineas C/H ---";    find . -name '*.c' -o -name '*.h' | xargs wc -l 2>/dev/null | tail -1
  echo; echo "--- Directorios ---";   ls -d */
  echo; echo "--- Arquitecturas ---"; ls arch/
  echo; echo "--- Makefile ---";      head -6 Makefile
} | tee ~/evidencias/03-fuente-kernel.txt
```

---

<a name="paso-8"></a>
# PASO 8 — Inspeccionar los drivers críticos de la VM

> ⚠️ **Este paso no está en el README del curso y es el que evita el error más común de la práctica.** Hacelo.

## 8.1 El problema

`make localmodconfig` (Paso 9) **elimina del `.config` todo módulo que no esté cargado en este momento**. Si eso incluye el driver de tu disco raíz, tu kernel nuevo arranca, no encuentra el disco y muere con:

```
VFS: Unable to mount root fs on unknown-block(0,0)
Kernel panic - not syncing: No working init found.
```

En una VM, tu disco y tu red no son hardware físico: son **dispositivos paravirtualizados**. Y VMware **no usa virtio** como QEMU/UTM:

| Función | QEMU / UTM | **VMware Fusion** |
|---|---|---|
| Disco | `virtio_blk` | `nvme` o `vmw_pvscsi` |
| Red | `virtio_net` | `vmxnet3` |
| Gráficos | `virtio_gpu` | `vmwgfx` |
| Memoria dinámica | `virtio_balloon` | `vmw_balloon` |
| Canal host↔guest | — | `vmw_vmci`, `vmw_vsock_vmci_transport` |

## 8.2 No adivines: inspeccioná

La habilidad real es responder *"¿qué driver está manejando mi disco raíz ahora mismo?"*. Se hace leyendo `/sys`, el filesystem virtual donde el kernel expone su propio estado:

```bash
echo "=== Que dispositivo es mi raiz ==="
findmnt /

echo "=== Arbol de dispositivos de bloque ==="
lsblk -o NAME,SIZE,TYPE,FSTYPE,MOUNTPOINT

echo "=== EL DATO CLAVE: driver de cada disco ==="
for d in /sys/block/*/device/driver; do
  [ -e "$d" ] && echo "$(echo $d | cut -d/ -f4)  ->  $(basename $(readlink -f $d))"
done

echo "=== Modulos VMware / disco / red cargados ==="
lsmod | grep -Ei 'vmw|vmx|nvme|pvscsi|e1000'

echo "=== Modulos que YA estan dentro del initramfs actual ==="
lsinitramfs /boot/initrd.img-$(uname -r) 2>/dev/null | grep -Ei '\.ko' | grep -Ei 'nvme|vmw|vmx|pvscsi' | head -20

echo "=== Total de modulos cargados ==="
lsmod | tail -n +2 | wc -l
```

## 8.3 Anotá tus resultados

| Pregunta | Tu respuesta |
|---|---|
| Dispositivo raíz (`findmnt /`) | `_______________` |
| **Driver del disco raíz** | `_______________` ← el que NO podés perder |
| Módulos VMware cargados | `_______________` |
| Total de módulos cargados | `_______________` |

> 📚 **TEORÍA — qué es `/sys` y por qué funciona esto**
> `/sys` es **sysfs**, un filesystem virtual (no toca el disco: vive en RAM) donde el kernel publica su estructura interna de dispositivos como si fuera un árbol de archivos. Cada archivo es en realidad una función del kernel que se ejecuta al leerlo.
>
> `/sys/block/<disco>/device/driver` es un **symlink** que apunta a `/sys/bus/<bus>/drivers/<nombre>`. El nombre de ese destino **es** el driver que el kernel está usando ahora mismo. Es información en vivo, no una suposición.
>
> Es el mismo mecanismo detrás de `lsblk`, `lspci -k` y buena parte de `udev`.

## 8.4 Verificación cruzada con el initramfs

El `lsinitramfs` de arriba es doblemente importante:

> 📚 **TEORÍA — el problema del huevo y la gallina, y el initramfs**
> Para montar el disco raíz, el kernel necesita el driver del controlador de disco y del sistema de archivos. Pero si esos drivers son módulos (`=m`), están **en el disco que todavía no puede montar**.
>
> Solución: el **initramfs** (*initial RAM filesystem*). Es un archivo cpio comprimido que GRUB carga en memoria junto al kernel. Contiene un mini-sistema con los módulos indispensables. El kernel lo monta como raíz temporal, carga desde ahí los drivers que necesita, monta el disco real, y **pivota** (`switch_root`) al sistema definitivo.
>
> Por eso el Paso 14 corre `update-initramfs`: si tu kernel nuevo no tiene un initramfs con el driver de disco correcto, no bootea. Y por eso `/boot` necesita espacio: cada kernel instalado trae su propio initramfs de 30–80 MB.

**📸 EVIDENCIA:** captura completa de este bloque. Guardá:

```bash
{
  echo "===== DRIVERS CRITICOS DE LA VM ====="
  echo "Fecha: $(date)"
  echo; echo "--- Raiz ---";              findmnt /
  echo; echo "--- Bloques ---";           lsblk -o NAME,SIZE,TYPE,FSTYPE,MOUNTPOINT
  echo; echo "--- Driver por disco ---"
  for d in /sys/block/*/device/driver; do
    [ -e "$d" ] && echo "$(echo $d | cut -d/ -f4) -> $(basename $(readlink -f $d))"
  done
  echo; echo "--- Modulos VMware/disco/red ---"; lsmod | grep -Ei 'vmw|vmx|nvme|pvscsi|e1000'
  echo; echo "--- Total modulos cargados ---";   lsmod | tail -n +2 | wc -l
  echo; echo "--- lsmod completo ---";           lsmod
} | tee ~/evidencias/04-drivers-vm.txt
```

---

<a name="paso-9"></a>
# PASO 9 — Configurar el kernel

> 🎯 **Rúbrica: 10 puntos** ("Configuración del kernel — `make localmodconfig`")

## 9.1 Copiar la configuración del sistema actual

```bash
cd ~/kernel/linux-6.12.69
cp -v /boot/config-$(uname -r) .config
wc -l .config
cp .config ~/evidencias/config-01-original.txt
```

> 📚 **TEORÍA — qué es `.config`**
> El kernel no se compila "a secas": se compila **una configuración**. `.config` es un archivo de ~13,000 líneas con entradas de tres estados posibles:
>
> ```
> CONFIG_EXT4_FS=y                  # compilado DENTRO de vmlinuz (built-in)
> CONFIG_NTFS3_FS=m                 # compilado como modulo .ko aparte
> # CONFIG_HAMRADIO is not set      # excluido del binario
> ```
>
> El código fuente está lleno de bloques `#ifdef CONFIG_ALGO`. El `.config` se traduce a `include/generated/autoconf.h` y a variables de Make, así que **literalmente decide qué código llega al compilador**. Cambiar `.config` cambia el binario resultante.
>
> **Por qué copiar la config de Debian** en vez de configurar de cero: son ~13,000 opciones. Partir de la config con la que tu sistema **ya arranca correctamente en este hardware** es la garantía más fuerte de que el kernel nuevo también va a arrancar. Configurar de cero con `make defconfig` te da un kernel genérico que muy probablemente no bootee en tu VM.

## 9.2 Ejecutar `localmodconfig`

```bash
cd ~/kernel/linux-6.12.69
yes "" | make localmodconfig 2>&1 | tee ~/evidencias/log-localmodconfig.txt
```

> El `yes "" |` responde **Enter** (= aceptar el valor por defecto) a cualquier opción nueva que `make` te pregunte. Como Debian 13 trae 6.12 y el fuente es 6.12.69, deberían ser muy pocas o ninguna.

## 9.3 ✅ VERIFICAR el resultado

```bash
cd ~/kernel/linux-6.12.69

echo "=== Modulos antes (config de Debian) ==="
grep -c '=m$' ~/evidencias/config-01-original.txt

echo "=== Modulos despues de localmodconfig ==="
grep -c '=m$' .config

echo "=== Built-in (=y) ==="
grep -c '=y$' .config

echo "=== ¡CRITICO! El driver de tu disco raiz sigue presente? ==="
# Reemplaza 'nvme' por el driver que anotaste en el Paso 8.3
grep -iE 'CONFIG_BLK_DEV_NVME|CONFIG_NVME_CORE|CONFIG_SCSI_VMW_PVSCSI' .config

echo "=== Los drivers de VMware siguen presentes? ==="
grep -iE 'CONFIG_VMWARE|CONFIG_VMXNET3|CONFIG_DRM_VMWGFX|CONFIG_VMWARE_BALLOON|CONFIG_VMWARE_VMCI' .config

echo "=== El filesystem de tu raiz sigue presente? ==="
grep -E 'CONFIG_EXT4_FS=|CONFIG_EXT4_FS_' .config
```

### ⛔ Regla de oro antes de seguir

**El driver de tu disco raíz (el que anotaste en el Paso 8.3) tiene que aparecer como `=y` o `=m`.**

Si aparece como `# CONFIG_... is not set`, **parate acá** y forzalo:

```bash
# Ejemplo si tu driver es nvme:
scripts/config --module BLK_DEV_NVME
scripts/config --enable NVME_CORE

# Ejemplo si tu driver es vmw_pvscsi:
scripts/config --module SCSI_VMW_PVSCSI

# Red y guest tools de VMware:
scripts/config --module VMXNET3
scripts/config --module VMWARE_BALLOON
scripts/config --module VMWARE_VMCI
scripts/config --module VMWARE_VMCI_VSOCKETS

# El filesystem de tu raiz DEBE ser built-in o estar en el initramfs:
scripts/config --enable EXT4_FS

make olddefconfig
```

Y volvé a verificar.

> 📚 **TEORÍA — qué hace exactamente `localmodconfig`**
> 1. Lee la salida de `lsmod` (los módulos cargados **ahora mismo**).
> 2. Recorre el `.config` y cambia a `n` **todo `=m` que no esté en esa lista**.
> 3. Resuelve dependencias con `make olddefconfig` para que no queden inconsistencias.
>
> **El beneficio:** en vez de compilar drivers de ~3,000 tarjetas de red, tarjetas de sonido y controladores SCSI que no existen en tu VM, compila solo los tuyos. Reduce el tiempo de compilación entre 3× y 6×, y el tamaño del build de forma proporcional.
>
> **El riesgo:** si un dispositivo estaba desconectado o su módulo no estaba cargado cuando corriste el comando, ese driver desaparece y el dispositivo no va a funcionar con el kernel nuevo. Por eso el Paso 4.2 (instalar `open-vm-tools`) va **antes** de este paso, y por eso el Paso 8 inspecciona los drivers **antes** de tocar nada.

```bash
cp .config ~/evidencias/config-02-localmodconfig.txt
```

**📸 EVIDENCIA:** captura del `make localmodconfig` corriendo, y de la comparación de conteos (`=m` antes vs. después) — ese número es un dato concreto y medible para el informe.

---

<a name="paso-10"></a>
# PASO 10 — Desactivar la verificación de firmas de módulos

> 🎯 **Requisito obligatorio del enunciado:** *"Deshabilitar la verificación de firmas para los módulos"*
> ⚠️ El README del curso solo cubre la mitad de esto. Acá está completo.

## 10.1 Ver el estado actual

```bash
cd ~/kernel/linux-6.12.69
echo "=== ANTES ==="
grep -E 'CONFIG_MODULE_SIG|CONFIG_SYSTEM_TRUSTED_KEYS|CONFIG_SYSTEM_REVOCATION|CONFIG_MODULE_COMPRESS' .config
```

Vas a ver algo así:

```
CONFIG_MODULE_SIG=y
CONFIG_MODULE_SIG_ALL=y
CONFIG_MODULE_SIG_KEY="certs/signing_key.pem"
CONFIG_SYSTEM_TRUSTED_KEYS="debian/canonical-certs.pem"
CONFIG_SYSTEM_REVOCATION_KEYS="debian/canonical-revoked-certs.pem"
```

**Ese `debian/canonical-certs.pem` es el error #1 de esta práctica.** Ese archivo existe en el árbol de packaging de Debian, pero **no** en el tarball limpio de kernel.org. Si compilás así, a los ~40 minutos el build muere con:

```
make[2]: *** No rule to make target 'debian/canonical-certs.pem',
         needed by 'certs/x509_certificate_list'.  Stop.
```

## 10.2 Desactivar todo

```bash
cd ~/kernel/linux-6.12.69

# (a) Vaciar las rutas a llaveros de certificados que no existen
scripts/config --set-str SYSTEM_TRUSTED_KEYS ""
scripts/config --set-str SYSTEM_REVOCATION_KEYS ""

# (b) Desactivar el mecanismo de firma de modulos completo
scripts/config --disable MODULE_SIG
scripts/config --disable MODULE_SIG_ALL
scripts/config --disable MODULE_SIG_FORCE

# (c) Desactivar la lista de revocacion
scripts/config --disable SYSTEM_REVOCATION_LIST

# (d) IMPRESCINDIBLE: resolver dependencias tras editar el .config
make olddefconfig
```

> ⚠️ **El `make olddefconfig` del final no es opcional.** `scripts/config` edita el archivo con una herramienta de texto: no entiende las dependencias entre opciones. `make olddefconfig` recorre el árbol Kconfig, apaga las opciones que quedaron huérfanas y rellena las nuevas con su valor por defecto. Sin este paso el `.config` queda inconsistente y el build falla de formas confusas.

## 10.3 ✅ VERIFICAR

```bash
echo "=== DESPUES ==="
grep -E 'CONFIG_MODULE_SIG|CONFIG_SYSTEM_TRUSTED_KEYS|CONFIG_SYSTEM_REVOCATION' .config
```

**Esperás:**

```
# CONFIG_MODULE_SIG is not set
CONFIG_SYSTEM_TRUSTED_KEYS=""
CONFIG_SYSTEM_REVOCATION_KEYS=""
```

⛔ **Si todavía ves `debian/canonical-certs.pem` en cualquier línea, NO compiles.** Repetí el paso 10.2.

```bash
cp .config ~/evidencias/config-03-sin-firmas.txt
```

> 📚 **TEORÍA — son DOS mecanismos distintos (esto va al informe)**
>
> La confusión más común de esta práctica es creer que "firmas de módulos" es una sola cosa. Son dos capas separadas:
>
> **(a) `SYSTEM_TRUSTED_KEYS` — el llavero incrustado**
> Es una ruta a un archivo `.pem` con certificados X.509 que se **compilan dentro del binario del kernel**, formando un *keyring* de confianza en memoria. El kernel valida contra ese llavero. Ubuntu y Debian apuntan a los certificados de Canonical/Debian para que solo carguen módulos firmados por la distro. Como copiaste su `.config`, heredaste una ruta a un archivo que no tenés.
>
> **(b) `MODULE_SIG` — el mecanismo de verificación**
> Decide si el kernel **exige** firma para cargar un módulo:
>
> | Opción | Qué hace |
> |---|---|
> | `CONFIG_MODULE_SIG` | Habilita el soporte de verificación |
> | `CONFIG_MODULE_SIG_ALL` | Firma automáticamente todos los `.ko` al compilar |
> | `CONFIG_MODULE_SIG_FORCE` | **Rechaza** cargar cualquier módulo sin firma válida |
> | `CONFIG_MODULE_SIG_KEY` | Ruta a la llave privada de firma |
>
> **Por qué existe todo esto:** un módulo del kernel corre en **EL1 (equivalente ARM64 del "ring 0")**, con acceso total a memoria física, hardware y estructuras del kernel. Un módulo malicioso es un rootkit perfecto: puede interceptar syscalls, ocultar procesos y leer cualquier memoria. La firma criptográfica establece una **cadena de confianza**: solo carga código firmado por una llave en la que el kernel confía.
>
> Es el mismo modelo que **Secure Boot** un nivel más abajo: el firmware UEFI verifica la firma del bootloader, el bootloader la del kernel, y el kernel la de los módulos. Como vos vas a compilar un kernel sin firmar, en hardware físico habría que desactivar Secure Boot. En VMware Fusion en Apple Silicon esto no te afecta, pero **mencionalo en el informe** — demuestra que entendés el modelo completo.

**📸 EVIDENCIA:** dos capturas — el `grep` **antes** (mostrando `debian/canonical-certs.pem`) y **después** (mostrando `is not set` y `""`). Es el par de imágenes que prueba este requisito.

---

<a name="paso-11"></a>
# PASO 11 — Reducir el peso del build (recomendado)

> Este paso es **opcional pero muy recomendado**: baja el build de ~30 GB a ~4 GB y recorta el tiempo entre 25% y 40%.

## 11.1 El comando

```bash
cd ~/kernel/linux-6.12.69

# Desactivar la generacion de informacion de depuracion DWARF del kernel
scripts/config --disable DEBUG_INFO
scripts/config --enable  DEBUG_INFO_NONE
scripts/config --disable DEBUG_INFO_DWARF4
scripts/config --disable DEBUG_INFO_DWARF5
scripts/config --disable DEBUG_INFO_BTF
scripts/config --disable DEBUG_INFO_REDUCED
scripts/config --disable GDB_SCRIPTS

make olddefconfig
```

## 11.2 ✅ VERIFICAR

```bash
grep -E 'CONFIG_DEBUG_INFO' .config | head -10
```

**Esperás:** `CONFIG_DEBUG_INFO_NONE=y` y `# CONFIG_DEBUG_INFO is not set`.

```bash
cp .config ~/evidencias/config-04-final.txt
```

## 11.3 El trade-off — declaralo en el informe

> 📚 **TEORÍA — qué ganás y qué perdés**
>
> Es exactamente el mismo `-g` que probaste en el Paso 6.5, pero aplicado a 30 millones de líneas.
>
> | Aspecto | Con `DEBUG_INFO` | Sin `DEBUG_INFO` |
> |---|---|---|
> | Tamaño del build | ~30 GB | ~4 GB |
> | Tiempo de compilación | 100% | ~65–75% |
> | Depurar el **kernel** con GDB/kgdb | ✅ posible | ❌ no |
> | Depurar programas **de usuario** con GDB | ✅ | ✅ (no lo afecta) |
> | Herramientas eBPF/BTF (`bpftrace`) | ✅ | ❌ |
> | Backtraces de kernel panic | ✅ con nombres de línea | ✅ con nombres de símbolo (vía `System.map`) |
>
> **Para esta tarea es seguro:** la rúbrica pide GDB instalado y verificado sobre un **programa de usuario** (Paso 6.5), no depuración del kernel. Los símbolos de kernel siguen disponibles vía `System.map`, así que un panic sigue siendo legible.
>
> **Declaralo explícitamente en el informe** como una decisión de ingeniería justificada: reducir consumo de disco y tiempo en un entorno virtualizado con recursos limitados, sin afectar los objetivos de la práctica. Eso es análisis técnico, y es lo que se califica.

> ❌ **Si querés conservar la capacidad de depurar el kernel**, saltate este paso — pero entonces asegurate de tener **≥ 45 GB libres** y sumale 30–50% más de tiempo de compilación.

## 11.4 Resumen de la configuración final

```bash
cd ~/kernel/linux-6.12.69
{
  echo "===== CONFIGURACION FINAL DEL KERNEL ====="
  echo "Fecha: $(date)"
  echo; echo "--- Conteo de opciones ---"
  echo "Total de lineas:  $(wc -l < .config)"
  echo "Built-in (=y):    $(grep -c '=y$' .config)"
  echo "Modulos (=m):     $(grep -c '=m$' .config)"
  echo "Desactivadas:     $(grep -c 'is not set' .config)"
  echo; echo "--- Evolucion de modulos (=m) ---"
  echo "01 config original de Debian:  $(grep -c '=m$' ~/evidencias/config-01-original.txt)"
  echo "02 tras localmodconfig:        $(grep -c '=m$' ~/evidencias/config-02-localmodconfig.txt)"
  echo "04 configuracion final:        $(grep -c '=m$' .config)"
  echo; echo "--- Firmas de modulos ---"
  grep -E 'CONFIG_MODULE_SIG|CONFIG_SYSTEM_TRUSTED_KEYS|CONFIG_SYSTEM_REVOCATION' .config
  echo; echo "--- Debug info ---"
  grep -E 'CONFIG_DEBUG_INFO' .config | head -8
  echo; echo "--- Drivers criticos de la VM ---"
  grep -iE 'CONFIG_BLK_DEV_NVME|CONFIG_NVME_CORE|CONFIG_SCSI_VMW_PVSCSI|CONFIG_VMXNET3|CONFIG_VMWARE|CONFIG_EXT4_FS=' .config
} | tee ~/evidencias/05-config-final.txt
```

**📸 EVIDENCIA:** captura de esta tabla de evolución de módulos. Es un dato cuantitativo excelente para el informe.

---

<a name="paso-12"></a>
# PASO 12 — `EXTRAVERSION` con tu nombre y carné

> 🎯 **Rúbrica: 30 puntos** — el ítem individual de mayor peso junto a documentación.

## 12.1 Ver el estado actual

```bash
cd ~/kernel/linux-6.12.69
head -8 Makefile
```

Ves:

```make
# SPDX-License-Identifier: GPL-2.0
VERSION = 6
PATCHLEVEL = 12
SUBLEVEL = 69
EXTRAVERSION =
NAME = Baby Opossum Posse
```

## 12.2 Limpiar `LOCALVERSION` primero

> ⚠️ **Este sub-paso no está en el README y sin él tu string de versión sale contaminado.**

La config de Debian trae `CONFIG_LOCALVERSION` con el nombre de su *flavour* (`-arm64`), que también se concatena a la versión. Si no lo limpiás vas a terminar con `6.12.69-tunombre-arm64`. Funciona, pero es más limpio y predecible dejar solo lo tuyo:

```bash
cd ~/kernel/linux-6.12.69
scripts/config --set-str LOCALVERSION ""
scripts/config --disable LOCALVERSION_AUTO
make olddefconfig
grep 'CONFIG_LOCALVERSION' .config
```

**Esperás:** `CONFIG_LOCALVERSION=""` y `# CONFIG_LOCALVERSION_AUTO is not set`.

## 12.3 Editar `EXTRAVERSION`

```bash
cd ~/kernel/linux-6.12.69
nano Makefile
```

Cambiá la línea 5 de:

```make
EXTRAVERSION =
```

a (con **tus** datos):

```make
EXTRAVERSION = -jbarrera-202012345
```

Guardá con **Ctrl+O** → Enter → salí con **Ctrl+X**.

### ⛔ Reglas obligatorias para el valor

| Regla | Por qué |
|---|---|
| Empieza con **guion** `-` | Se concatena directo a `6.12.69`; sin guion queda `6.12.69jbarrera` |
| **Sin espacios** | Forma parte de nombres de archivo (`/boot/vmlinuz-...`) y de rutas (`/lib/modules/...`) |
| Solo `a-z`, `0-9`, `-`, `.`, `_` | Sin tildes, sin `ñ`, sin mayúsculas problemáticas, sin `/` |
| Corto (< 30 caracteres) | Nombres de ruta muy largos causan problemas |

✅ Válidos: `-jbarrera-202012345`, `-julian.barrera-201931045`
❌ Inválidos: `-Julian Barrera 202012345` (espacios), `-josé-123` (tilde), `jbarrera` (sin guion)

## 12.4 ✅ VERIFICAR — el comando que te salva de recompilar en vano

```bash
cd ~/kernel/linux-6.12.69
head -8 Makefile
echo "======================================"
echo "Version que se va a compilar:"
make -s kernelrelease
echo "======================================"
```

**`make kernelrelease` imprime exactamente el string que va a quedar dentro del binario y que va a devolver `uname -r`.** Tiene que salir:

```
6.12.69-jbarrera-202012345
```

⛔ **No pases al Paso 13 hasta que este comando muestre tu nombre y carné correctamente.** Si te equivocás acá, lo descubrís después de 90 minutos de compilación y tenés que rehacer todo.

> ❌ **Si aparece un `+` al final** (`6.12.69-jbarrera-202012345+`): `CONFIG_LOCALVERSION_AUTO` está activo y el script `scripts/setlocalversion` agrega ese sufijo. Repetí el paso 12.2.
>
> ❌ **Si aparece `-arm64` al final:** `CONFIG_LOCALVERSION` no quedó vacío. Repetí el paso 12.2.

## 12.5 La cadena completa — teoría para el informe

> 📚 **TEORÍA — de una línea del Makefile a `uname -r`**
>
> Esta es la cadena de causalidad que tenés que poder explicar. Es el corazón conceptual de la tarea:
>
> ```
> Makefile: VERSION.PATCHLEVEL.SUBLEVEL + EXTRAVERSION
>     │
>     ├─> variable KERNELVERSION  (Makefile raiz, linea ~1250)
>     │
>     ├─> KERNELRELEASE = KERNELVERSION + $(CONFIG_LOCALVERSION) + $(setlocalversion)
>     │       │  se escribe en el archivo generado include/config/kernel.release
>     │       │
>     │       ├─> se compila como macro UTS_RELEASE en include/generated/utsrelease.h
>     │       │       │
>     │       │       └─> init/version.c:  struct uts_namespace init_uts_ns = {
>     │       │                                .name.release = UTS_RELEASE, ... }
>     │       │               ↑ queda GRABADO dentro del binario vmlinuz
>     │       │
>     │       ├─> nombre del archivo instalado:  /boot/vmlinuz-<KERNELRELEASE>
>     │       └─> ruta de los modulos:           /lib/modules/<KERNELRELEASE>/
>     │
>     └─> en ejecucion:
>             uname -r  →  syscall uname(2)  →  copia utsname.release desde
>                          el uts_namespace del proceso  →  imprime el string
> ```
>
> **Dos consecuencias prácticas que explican los avisos de este manual:**
>
> 1. `EXTRAVERSION` **no es cosmético**: define nombres de archivo y rutas reales del filesystem. De ahí la prohibición de espacios y caracteres raros.
> 2. Si cambiás `EXTRAVERSION` **después** de compilar, la ruta `/lib/modules/<version>/` cambia y los módulos ya construidos quedan en la ruta vieja: el kernel arranca pero no encuentra sus módulos. **Por eso este paso va ANTES del Paso 13.**
>
> **Sobre `uts_namespace`:** ese `struct` es la base de los *UTS namespaces* de Linux — el mecanismo que le permite a un contenedor tener su propio hostname. Pero el campo `release` sigue viniendo del kernel real del host, y esa es exactamente la razón por la que Docker no sirve para esta tarea (Paso 2).

## 12.6 📸 SNAPSHOT antes de compilar

**Virtual Machine → Snapshots → Take Snapshot**
Nombre: **`02-antes-de-compilar`**

Si el build falla de forma irrecuperable, volvés acá sin repetir los pasos 1 a 12.

**📸 EVIDENCIA (obligatoria, vale 30 puntos):**
1. Captura de `head -8 Makefile` mostrando tu `EXTRAVERSION`
2. Captura de `make -s kernelrelease` mostrando `6.12.69-tunombre-tucarne`
3. Captura del `grep CONFIG_LOCALVERSION .config`

```bash
{
  echo "===== EXTRAVERSION ====="
  echo "Fecha: $(date)"
  echo; echo "--- Makefile (primeras 8 lineas) ---"; head -8 Makefile
  echo; echo "--- LOCALVERSION ---"; grep 'CONFIG_LOCALVERSION' .config
  echo; echo "--- STRING FINAL DE VERSION ---"; make -s kernelrelease
} | tee ~/evidencias/06-extraversion.txt
```

---

<a name="paso-13"></a>
# PASO 13 — Compilar el kernel

> 🎯 **Rúbrica: 20 puntos** ("Compilación exitosa sin errores críticos")

## 13.1 Chequeo previo (30 segundos que te ahorran 2 horas)

```bash
cd ~/kernel/linux-6.12.69

echo "=== 1. Espacio libre (necesitas >= 15 GB sin debug info, >= 40 GB con) ==="
df -h ~ .

echo "=== 2. Nucleos disponibles ==="
nproc

echo "=== 3. RAM ==="
free -h

echo "=== 4. Version que se va a compilar ==="
make -s kernelrelease

echo "=== 5. Certificados: NO debe aparecer canonical-certs ==="
grep -E 'CONFIG_SYSTEM_TRUSTED_KEYS|CONFIG_MODULE_SIG=' .config

echo "=== 6. pahole disponible (si dejaste BTF activo) ==="
which pahole && pahole --version
```

### Lista de verificación — todo tiene que dar ✅

| # | Chequeo | Esperado |
|---|---|---|
| 1 | Espacio libre | ≥ 15 GB (o ≥ 40 GB si NO hiciste el Paso 11) |
| 2 | `nproc` | Los núcleos que asignaste en Fusion |
| 3 | RAM libre | ≥ 8 GB |
| 4 | `make kernelrelease` | **Tu nombre y carné** |
| 5 | `SYSTEM_TRUSTED_KEYS` | `""` (vacío), y `MODULE_SIG` en *not set* |
| 6 | `pahole` | Presente (o BTF desactivado en el Paso 11) |

⛔ **Si alguno falla, resolvelo antes de compilar.** Es la diferencia entre 90 minutos productivos y 90 minutos perdidos.

## 13.2 Compilar

```bash
cd ~/kernel/linux-6.12.69

# Guarda el nombre de tu version para los pasos siguientes
KREL=$(make -s kernelrelease)
echo "Compilando: $KREL"
echo "$KREL" > ~/evidencias/kernel-release.txt

# COMPILAR (esto tarda entre 40 min y 2 horas)
time ( fakeroot make -j$(nproc) 2>&1 | tee ~/evidencias/log-compilacion.txt )
```

### Qué esperar mientras corre

- Miles de líneas tipo `CC drivers/net/...`, `LD kernel/built-in.a`, `AR ...`
- **Warnings son normales** — el kernel genera cientos. Solo importan los **errors**.
- Las últimas líneas exitosas se parecen a:

```
  LD      vmlinux
  SORTTAB vmlinux
  OBJCOPY arch/arm64/boot/Image
  GZIP    arch/arm64/boot/Image.gz
```

- Al final `time` te da tres números: **real** (tiempo de reloj), **user** (CPU en espacio de usuario), **sys** (CPU en kernel). **Anotá los tres** — te sirven para el punto opcional.

> 💡 **Mientras compila:** abrí otra terminal (o pestaña) y mirá el consumo en vivo. Buenas capturas para el informe:
> ```bash
> watch -n 2 'nproc; uptime; free -h; df -h / | tail -1'
> # o si instalas htop:  sudo apt install -y htop && htop
> ```
> Vas a ver los N núcleos al 100% — evidencia visual de que `-j$(nproc)` funciona.

> ⚠️ **No cierres la ventana ni suspendas el Mac.** Si necesitás dejarlo corriendo desatendido, en macOS: `caffeinate -dims` en una terminal, o desactivá el sleep automático en Configuración del Sistema.

## 13.3 ✅ VERIFICAR que el build terminó bien

```bash
cd ~/kernel/linux-6.12.69

echo "=== 1. Errores en el log ==="
grep -iE '^\s*(Error|make.*\*\*\*)' ~/evidencias/log-compilacion.txt | head -20
echo "(sin salida = sin errores)"

echo "=== 2. Ultimas 25 lineas del build ==="
tail -25 ~/evidencias/log-compilacion.txt

echo "=== 3. Los binarios existen? ==="
ls -lh vmlinux
ls -lh arch/arm64/boot/Image
ls -lh arch/arm64/boot/Image.gz

echo "=== 4. La version quedo grabada en el binario? ==="
cat include/config/kernel.release
strings vmlinux | grep -m3 "$(cat ~/evidencias/kernel-release.txt)"

echo "=== 5. Cuantos modulos se construyeron? ==="
find . -name '*.ko' | wc -l

echo "=== 6. Cuanto ocupa el build ==="
du -sh .
df -h ~
```

### La condición de éxito

| Chequeo | Esperado |
|---|---|
| Errores en el log | **ninguno** |
| `arch/arm64/boot/Image.gz` | existe, ~15–25 MB |
| `vmlinux` | existe |
| `cat include/config/kernel.release` | **tu nombre y carné** |
| `strings vmlinux \| grep <tu version>` | encuentra el string ← **prueba de que quedó dentro del binario** |
| Módulos `.ko` | algunas decenas o cientos (según `localmodconfig`) |

> ⚠️ **Nota importante para tu informe:** el README del curso menciona `arch/x86/boot/bzImage`. En ARM64 el binario es **`arch/arm64/boot/Image.gz`**. Documentá esa diferencia — es consecuencia directa de compilar para otra arquitectura y de que `arch/arm64/Makefile` define `KBUILD_IMAGE := $(boot)/Image.gz`.

**📸 EVIDENCIA (crítica, vale 20 puntos):**
1. El comando de compilación arrancando
2. `htop`/`watch` con todos los núcleos al 100%
3. Las últimas líneas del build (`OBJCOPY Image` / `GZIP Image.gz`)
4. **La salida de `time`** con real/user/sys
5. `ls -lh arch/arm64/boot/Image.gz`
6. **`strings vmlinux | grep <tu-version>`** — prueba de que tu nombre está dentro del binario

```bash
{
  echo "===== RESULTADO DE LA COMPILACION ====="
  echo "Fecha: $(date)"
  cd ~/kernel/linux-6.12.69
  echo; echo "--- Version compilada ---";  cat include/config/kernel.release
  echo; echo "--- Binarios ---";            ls -lh vmlinux arch/arm64/boot/Image arch/arm64/boot/Image.gz
  echo; echo "--- Modulos construidos ---"; find . -name '*.ko' | wc -l
  echo; echo "--- Tamaño del build ---";    du -sh .
  echo; echo "--- Version dentro del binario ---"
  strings vmlinux | grep -m3 "$(cat ~/evidencias/kernel-release.txt)"
  echo; echo "--- Ultimas 25 lineas del log ---"; tail -25 ~/evidencias/log-compilacion.txt
} | tee ~/evidencias/07-compilacion.txt
```

---

<a name="paso-14"></a>
# PASO 14 — Instalar módulos y kernel

## 14.1 📸 SNAPSHOT — el más importante de los tres

Antes de tocar `/boot`:

**Virtual Machine → Snapshots → Take Snapshot**
Nombre: **`03-antes-de-instalar`**

> Este paso modifica `/boot` y la configuración de GRUB. Es el único de todo el manual que puede dejar la VM sin arrancar. Con el snapshot, volvés en 30 segundos.

## 14.2 Instalar los módulos

```bash
cd ~/kernel/linux-6.12.69
sudo make modules_install 2>&1 | tee ~/evidencias/log-modules-install.txt
```

**✅ VERIFICAR:**

```bash
KREL=$(cat ~/evidencias/kernel-release.txt)
echo "Version: $KREL"
ls -d /lib/modules/$KREL
du -sh /lib/modules/$KREL
ls /lib/modules/$KREL/ | head
find /lib/modules/$KREL -name '*.ko*' | wc -l
```

**Esperás:** el directorio existe, contiene `kernel/`, `modules.dep`, `modules.order`, `modules.alias`, y un puñado de `.ko.zst`.

> 📚 **TEORÍA — qué hace `modules_install`**
> 1. Copia todos los `.ko` a `/lib/modules/<KERNELRELEASE>/kernel/`, respetando la estructura de directorios del fuente.
> 2. Los comprime con **zstd** (por `CONFIG_MODULE_COMPRESS_ZSTD` de Debian) → quedan como `.ko.zst`.
> 3. Ejecuta **`depmod`**, que lee los símbolos exportados y requeridos de cada módulo y construye el grafo de dependencias en `modules.dep`.
>
> Ese grafo es lo que le permite a `modprobe` cargar automáticamente las dependencias en el orden correcto. Sin `depmod`, `modprobe` fallaría con "unknown symbol". Fijate que la ruta lleva **`<KERNELRELEASE>`**: es la misma variable del Paso 12, y por eso `EXTRAVERSION` tiene que estar fijo **antes** de compilar.

## 14.3 Instalar el kernel

```bash
cd ~/kernel/linux-6.12.69
sudo make install 2>&1 | tee ~/evidencias/log-make-install.txt
```

## 14.4 ✅ VERIFICAR — los cuatro archivos en `/boot`

```bash
KREL=$(cat ~/evidencias/kernel-release.txt)

echo "=== Contenido de /boot ==="
ls -lh /boot/

echo "=== Los 4 archivos de TU kernel ==="
ls -lh /boot/vmlinuz-$KREL      /boot/initrd.img-$KREL \
       /boot/System.map-$KREL   /boot/config-$KREL

echo "=== Espacio en /boot ==="
df -h /boot
```

**Los cuatro archivos tienen que existir:**

| Archivo | Qué es | Tamaño típico |
|---|---|---|
| `vmlinuz-<version>` | El kernel comprimido y booteable | 15–25 MB |
| `initrd.img-<version>` | El initramfs con los módulos de arranque | 30–90 MB |
| `System.map-<version>` | Tabla de símbolos (nombre ↔ dirección) | 3–8 MB |
| `config-<version>` | Copia del `.config` usado | ~250 KB |

### ❌ Si falta el `initrd.img` — el escenario más común de fallo

`make install` dispara los hooks de `/etc/kernel/postinst.d/`, que generan el initramfs. Si por alguna razón no corrieron, generalo a mano:

```bash
KREL=$(cat ~/evidencias/kernel-release.txt)
sudo update-initramfs -c -k "$KREL"
ls -lh /boot/initrd.img-$KREL
```

⛔ **No reinicies sin `initrd.img`.** Sin initramfs, el kernel no puede cargar el driver del disco y bootea a un `kernel panic`.

### ❌ Si `/boot` se llenó

```bash
df -h /boot
# Si esta al 100%, borra kernels viejos que NO sean el actual ni el tuyo:
dpkg --list | grep linux-image
# sudo apt remove --purge linux-image-<version-vieja>
sudo update-grub
```

> 📚 **TEORÍA — qué hace `make install` realmente (va al informe)**
> En arm64 el target `install` ejecuta `scripts/install.sh` / `arch/arm64/boot/install.sh`, que:
> 1. Detecta que `KBUILD_IMAGE` es `Image.gz` (comprimido) → usa el prefijo `vmlinuz`.
> 2. Si existe `/sbin/installkernel` (lo provee Debian), le delega el trabajo.
> 3. `installkernel` copia `vmlinuz-<ver>`, `System.map-<ver>` y `config-<ver>` a `/boot`, rotando el anterior a `.old`.
> 4. Ejecuta los hooks de **`/etc/kernel/postinst.d/`**:
>    - `initramfs-tools` → corre `update-initramfs -c -k <ver>` y genera el initramfs
>    - `zz-update-grub` → corre `update-grub`, que escanea `/boot` con `os-prober` y regenera `/boot/grub/grub.cfg`
>
> Es decir: `make install` no solo copia un archivo. Integra tu kernel en el ciclo de arranque completo del sistema.

**📸 EVIDENCIA:** captura de `ls -lh /boot/` mostrando **los cuatro archivos con tu nombre en el nombre del archivo**, y de `ls -d /lib/modules/<tu-version>`.

```bash
{
  echo "===== INSTALACION ====="
  echo "Fecha: $(date)"
  KREL=$(cat ~/evidencias/kernel-release.txt)
  echo "Version instalada: $KREL"
  echo; echo "--- /boot ---"; ls -lh /boot/
  echo; echo "--- Mis 4 archivos ---"
  ls -lh /boot/vmlinuz-$KREL /boot/initrd.img-$KREL /boot/System.map-$KREL /boot/config-$KREL
  echo; echo "--- Modulos ---"; ls -d /lib/modules/$KREL; du -sh /lib/modules/$KREL
  echo; echo "--- Cantidad de .ko instalados ---"; find /lib/modules/$KREL -name '*.ko*' | wc -l
  echo; echo "--- Espacio ---"; df -h / /boot
} | tee ~/evidencias/08-instalacion.txt
```

---

<a name="paso-15"></a>
# PASO 15 — Configurar GRUB y reiniciar

## 15.1 Garantizar que el menú de GRUB aparezca

> La rúbrica pide una captura del menú de GRUB. Por defecto Debian puede mostrarlo por solo 5 segundos, o esconderlo. Vamos a forzarlo.

```bash
sudo cp /etc/default/grub /etc/default/grub.bak
sudo nano /etc/default/grub
```

Dejá estas líneas así (agregá las que falten, comentá con `#` las que estorben):

```bash
GRUB_DEFAULT=0
GRUB_TIMEOUT=20
GRUB_TIMEOUT_STYLE=menu
#GRUB_HIDDEN_TIMEOUT=0
#GRUB_HIDDEN_TIMEOUT_QUIET=true
GRUB_CMDLINE_LINUX_DEFAULT=""
GRUB_CMDLINE_LINUX=""
GRUB_DISABLE_SUBMENU=n
```

> **Por qué `GRUB_CMDLINE_LINUX_DEFAULT=""`** (quitando `quiet splash`): así ves **todos los mensajes de arranque del kernel** en pantalla. Es mejor evidencia y, si algo falla, ves exactamente dónde.

Guardá (Ctrl+O, Enter, Ctrl+X) y regenerá la configuración:

```bash
sudo update-grub 2>&1 | tee ~/evidencias/log-update-grub.txt
```

## 15.2 ✅ VERIFICAR que tu kernel está en el menú

```bash
KREL=$(cat ~/evidencias/kernel-release.txt)

echo "=== Entradas de menu detectadas ==="
sudo grep -E "^\s*menuentry|^\s*submenu" /boot/grub/grub.cfg | sed 's/{$//'

echo "=== Mi kernel aparece? ==="
sudo grep -c "$KREL" /boot/grub/grub.cfg
echo "(debe ser > 0)"

echo "=== Las lineas linux/initrd de mi kernel ==="
sudo grep -A2 "vmlinuz-$KREL" /boot/grub/grub.cfg | head -12
```

⛔ **Si tu versión NO aparece en `grub.cfg`, NO reinicies.** Corré `sudo update-grub` de nuevo y revisá su salida buscando `Found linux image: /boot/vmlinuz-<tu-version>`.

## 15.3 Reiniciar

```bash
sync
sudo reboot
```

## 15.4 En el menú de GRUB

1. **📸 Saca la captura del menú principal** (en macOS: `Cmd+Shift+4` y seleccioná la ventana de Fusion).
2. Andá a **"Advanced options for Debian GNU/Linux"** → Enter.
3. **📸 Saca la captura de la lista de kernels** — acá se ven ambos: el de Debian y **el tuyo con tu nombre**. Esta es una de las mejores capturas del informe.
4. Seleccioná **tu kernel** (`6.12.69-tunombre-tucarne`) → Enter.

> 📚 **TEORÍA — GRUB y por qué tu kernel viejo sigue ahí**
> **GRUB** (*GRand Unified Bootloader*) es un bootloader multi-etapa. En arm64 el firmware UEFI carga `grubaa64.efi` desde la partición EFI, GRUB lee `/boot/grub/grub.cfg`, presenta el menú, y para la opción elegida ejecuta dos comandos: `linux /boot/vmlinuz-<ver> <parametros>` e `initrd /boot/initrd.img-<ver>`. Carga ambos en RAM y le transfiere el control al kernel.
>
> **Tu kernel nuevo NO reemplaza al de Debian: convive con él.** `update-grub` escanea `/boot` y genera una entrada por cada `vmlinuz-*` que encuentra. Esa es tu red de seguridad: si el kernel nuevo no arranca, reiniciás, entrás a *Advanced options* y elegís el de Debian. **Nunca borres el kernel original.**
>
> En x86 con BIOS entrarías al menú con SHIFT. En **UEFI/arm64 se usa ESC**, porque no hay el mismo mecanismo de teclado del BIOS legado.

### ❌ Si el kernel nuevo NO arranca

| Síntoma | Causa probable | Solución |
|---|---|---|
| `VFS: Unable to mount root fs` | Se perdió el driver de disco en `localmodconfig` | Reiniciá → ESC → elegí el kernel de Debian → volvé al Paso 9.3 y forzá el driver |
| `Kernel panic - no working init` | Initramfs mal generado o faltante | Bootea el kernel viejo → `sudo update-initramfs -c -k <tu-version>` |
| No hay red / no hay video | Módulo VMware eliminado | Kernel viejo → Paso 9.3, forzá `VMXNET3`/`DRM_VMWGFX` → recompilá |
| No arranca nada, ni el viejo | GRUB roto | **Restaurá el snapshot `03-antes-de-instalar`** |

**Todo error que te pase, documentalo.** El enunciado pide explícitamente *"solución a errores obtenidos durante la compilación si aplica"*. Un error bien diagnosticado y resuelto vale más que un camino sin obstáculos.

---

<a name="paso-16"></a>
# PASO 16 — Verificación final

Ya adentro, con tu kernel corriendo:

```bash
echo "############################################"
echo "###   VERIFICACION FINAL - TAREA 3 SO2   ###"
echo "############################################"
echo
echo "=== uname -r  (LA PRUEBA CENTRAL DE LA TAREA) ==="
uname -r
echo
echo "=== uname -a  (completo) ==="
uname -a
echo
echo "=== Desglose ==="
echo "Kernel name:      $(uname -s)"
echo "Kernel release:   $(uname -r)"
echo "Kernel version:   $(uname -v)"
echo "Arquitectura:     $(uname -m)"
echo
echo "=== Version que reporta el kernel via /proc ==="
cat /proc/version
echo
echo "=== Compilador usado ==="
cat /proc/sys/kernel/osrelease
gcc --version | head -1
echo
echo "=== Modulos cargados ==="
lsmod | tail -n +2 | wc -l
lsmod | head -15
echo
echo "=== Verificacion de firmas DESACTIVADA ==="
cat /proc/sys/kernel/modules_disabled 2>/dev/null
grep -E 'CONFIG_MODULE_SIG' /boot/config-$(uname -r)
echo
echo "=== Drivers criticos funcionando ==="
findmnt /
ip -brief addr show
lsmod | grep -Ei 'vmw|vmx|nvme|pvscsi'
echo
echo "=== Ruta de modulos de este kernel ==="
ls -d /lib/modules/$(uname -r)
echo
echo "=== Kernels disponibles en /boot ==="
ls /boot/vmlinuz-*
echo
echo "=== Errores criticos en el arranque ==="
sudo dmesg --level=err,crit,alert,emerg | head -20
echo "(pocas o ninguna linea = arranque limpio)"
echo
echo "=== Uptime ==="
uptime
```

## ✅ La condición de éxito de toda la tarea

| Chequeo | Esperado |
|---|---|
| **`uname -r`** | **`6.12.69-tunombre-tucarne`** ← esto es lo que califican |
| `uname -m` | `aarch64` |
| `/proc/version` | Tu versión + fecha de compilación + versión de GCC |
| `CONFIG_MODULE_SIG` en `/boot/config-$(uname -r)` | `is not set` |
| `findmnt /` | Tu raíz montada correctamente |
| `ip -brief addr` | Interfaz de red con IP |
| `/lib/modules/$(uname -r)` | Existe |
| `dmesg --level=err` | Pocas o ninguna línea |

**📸 EVIDENCIA — la captura más importante de todo el trabajo:**

Una sola imagen con `uname -r` y `uname -a` juntos, mostrando tu nombre y carné. Ponela **en la portada o en la primera página del informe**.

```bash
{
  echo "############################################"
  echo "###   VERIFICACION FINAL - TAREA 3 SO2   ###"
  echo "###   Fecha: $(date)"
  echo "############################################"
  echo; echo "=== uname -r ==="; uname -r
  echo; echo "=== uname -a ==="; uname -a
  echo; echo "=== /proc/version ==="; cat /proc/version
  echo; echo "=== Arquitectura ==="; uname -m
  echo; echo "=== Modulos cargados ==="; lsmod | tail -n +2 | wc -l
  echo; echo "=== Firmas desactivadas ==="; grep -E 'CONFIG_MODULE_SIG' /boot/config-$(uname -r)
  echo; echo "=== Raiz montada ==="; findmnt /
  echo; echo "=== Red ==="; ip -brief addr show
  echo; echo "=== Modulos VMware ==="; lsmod | grep -Ei 'vmw|vmx|nvme|pvscsi'
  echo; echo "=== Ruta de modulos ==="; ls -d /lib/modules/$(uname -r)
  echo; echo "=== Kernels en /boot ==="; ls /boot/vmlinuz-*
  echo; echo "=== Errores de arranque ==="; sudo dmesg --level=err,crit 2>/dev/null | head -20
} | tee ~/evidencias/09-verificacion-final.txt
```

## 📸 SNAPSHOT final

**Virtual Machine → Snapshots → Take Snapshot** → **`04-kernel-funcionando`**

## Sacar las evidencias hacia macOS

```bash
cd ~
tar czf evidencias-tarea3.tar.gz evidencias/
ls -lh evidencias-tarea3.tar.gz
```

Con `open-vm-tools` instalado podés arrastrar el archivo a macOS, o usar una carpeta compartida (Fusion → Settings → Sharing), o `scp` si instalaste el servidor SSH.

---

<a name="paso-17"></a>
# PASO 17 — Puntos opcionales

El enunciado ofrece dos extras. Ambos son de bajo esfuerzo y alto retorno.

## 17.1 Script bash de verificación automática

Este script es el que el enunciado pide en *"Automatizar parte del proceso de verificación con un script bash"*:

```bash
cat > ~/verificar-entorno.sh <<'SCRIPT'
#!/usr/bin/env bash
# verificar-entorno.sh - Tarea 3 SO2 2S2026
# Verifica que el entorno de compilacion del kernel este completo.
# Uso: ./verificar-entorno.sh

set -uo pipefail

OK=0; FALLOS=0
verde()  { printf '\033[0;32m%s\033[0m\n' "$1"; }
rojo()   { printf '\033[0;31m%s\033[0m\n' "$1"; }
titulo() { printf '\n\033[1;34m=== %s ===\033[0m\n' "$1"; }

check_cmd() {
    if command -v "$1" >/dev/null 2>&1; then
        verde "  [OK]    $1 -> $("$1" --version 2>&1 | head -1)"
        OK=$((OK+1))
    else
        rojo  "  [FALLA] $1 no encontrado"
        FALLOS=$((FALLOS+1))
    fi
}

check_pkg() {
    if dpkg -l "$1" 2>/dev/null | grep -q '^ii'; then
        verde "  [OK]    paquete $1 instalado"
        OK=$((OK+1))
    else
        rojo  "  [FALLA] paquete $1 NO instalado"
        FALLOS=$((FALLOS+1))
    fi
}

check_header() {
    if [ -f "$1" ]; then
        verde "  [OK]    header $1"
        OK=$((OK+1))
    else
        rojo  "  [FALLA] header $1 ausente"
        FALLOS=$((FALLOS+1))
    fi
}

echo "############################################################"
echo "#  Verificacion del entorno de compilacion del kernel"
echo "#  $(date)"
echo "#  Host: $(hostname)  Arch: $(uname -m)"
echo "############################################################"

titulo "Herramientas de compilacion"
for c in gcc g++ make gdb ld as cpp bison flex bc rsync cpio pahole; do
    check_cmd "$c"
done

titulo "Paquetes de desarrollo"
for p in build-essential libc6-dev libssl-dev libelf-dev libncurses-dev \
         libdw-dev fakeroot dwarves kmod zstd; do
    check_pkg "$p"
done

titulo "Headers de C"
for h in /usr/include/stdio.h /usr/include/stdlib.h /usr/include/string.h; do
    check_header "$h"
done

titulo "Prueba real de compilacion"
TMP=$(mktemp -d)
cat > "$TMP/t.c" <<'EOF'
#include <stdio.h>
int main(void){ printf("compilacion-ok\n"); return 0; }
EOF
if gcc -Wall -o "$TMP/t" "$TMP/t.c" 2>/dev/null && [ "$("$TMP/t")" = "compilacion-ok" ]; then
    verde "  [OK]    gcc compila y ejecuta correctamente"
    OK=$((OK+1))
else
    rojo  "  [FALLA] gcc no logro compilar el programa de prueba"
    FALLOS=$((FALLOS+1))
fi
rm -rf "$TMP"

titulo "Recursos del sistema"
LIBRE=$(df --output=avail -BG "$HOME" | tail -1 | tr -dc '0-9')
printf '  Nucleos:      %s\n' "$(nproc)"
printf '  RAM total:    %s\n' "$(free -h | awk '/^Mem:/{print $2}')"
printf '  Disco libre:  %s GB\n' "$LIBRE"
if [ "${LIBRE:-0}" -ge 15 ]; then
    verde "  [OK]    espacio suficiente (>= 15 GB)"; OK=$((OK+1))
else
    rojo  "  [FALLA] espacio insuficiente (< 15 GB)"; FALLOS=$((FALLOS+1))
fi

titulo "Kernel actual"
printf '  uname -r: %s\n' "$(uname -r)"
printf '  uname -m: %s\n' "$(uname -m)"

titulo "Drivers criticos de la VM"
for d in /sys/block/*/device/driver; do
    [ -e "$d" ] && printf '  %s -> %s\n' "$(echo "$d" | cut -d/ -f4)" "$(basename "$(readlink -f "$d")")"
done

echo
echo "############################################################"
printf '#  RESULTADO:  %s OK   /   %s FALLAS\n' "$OK" "$FALLOS"
if [ "$FALLOS" -eq 0 ]; then
    verde "#  ENTORNO LISTO PARA COMPILAR EL KERNEL"
else
    rojo  "#  FALTAN COMPONENTES - revisa las lineas [FALLA]"
fi
echo "############################################################"
exit $(( FALLOS > 0 ? 1 : 0 ))
SCRIPT

chmod +x ~/verificar-entorno.sh
~/verificar-entorno.sh | tee ~/evidencias/10-script-verificacion.txt
echo "Codigo de salida: $?"
```

**📸 EVIDENCIA:** captura del script corriendo con la salida en colores y `0 FALLAS`.

> 💡 **Para el informe, explicá dos decisiones de diseño del script:** (1) usa **códigos de salida** (`exit 1` si hay fallas) para poder integrarse en un pipeline automatizado; (2) no se limita a comprobar que los binarios existan — hace una **compilación real** de un programa de prueba, porque un `gcc` presente pero con headers roto pasaría un chequeo de sola presencia.

## 17.2 Comparativa de tiempos de compilación

> El enunciado pide *"comparativas de tiempos de compilación entre diferentes configuraciones"*.

```bash
cd ~/kernel/linux-6.12.69
cp .config ~/config-respaldo

for J in 1 2 4 $(nproc); do
    echo "===================================="
    echo "Compilando con -j$J"
    echo "===================================="
    make clean > /dev/null 2>&1
    /usr/bin/time -f "j=$J  real=%e s  user=%U s  sys=%S s  maxRSS=%M KB" \
      fakeroot make -j$J > /dev/null 2>> ~/evidencias/11-tiempos.txt
    tail -1 ~/evidencias/11-tiempos.txt
done

cat ~/evidencias/11-tiempos.txt
```

> ⚠️ **Esto tarda muchas horas** (una compilación completa por cada valor de `-j`). Si no tenés tiempo, hacé solo **`-j1` vs `-j$(nproc)`** — con dos puntos ya podés calcular el *speedup* y discutir la ley de Amdahl.
>
> Alternativa rápida: en vez de `make clean` completo, compilá solo un subsistema:
> ```bash
> for J in 1 2 4 8; do
>   make clean >/dev/null 2>&1
>   /usr/bin/time -f "j=$J real=%e" make -j$J fs/ 2>&1 | tail -1
> done
> ```

### Tabla para el informe

| `-jN` | real (s) | user (s) | sys (s) | Speedup vs. j=1 | Eficiencia |
|---|---|---|---|---|---|
| 1 | | | | 1.00× | 100% |
| 2 | | | | | |
| 4 | | | | | |
| N | | | | | |

- **Speedup** = `real(j=1) / real(jN)`
- **Eficiencia** = `Speedup / N × 100`

> 📚 **TEORÍA para el análisis — Ley de Amdahl**
> El speedup nunca es lineal. La mejora máxima está acotada por la **fracción serial** del trabajo:
>
> ```
> S(N) = 1 / ( (1 - P) + P/N )
> ```
>
> donde `P` es la fracción paralelizable y `N` el número de núcleos.
>
> En la compilación del kernel, la parte paralelizable es enorme (compilar ~30,000 archivos `.o` independientes), pero hay etapas **inherentemente seriales**: el enlazado final de `vmlinux`, `SORTTAB`, la generación de `Image.gz`. Además aparecen cuellos de botella que Amdahl no modela: **E/S de disco** (en una VM el disco es un archivo en el filesystem de macOS) y **ancho de banda de memoria**.
>
> Esperá eficiencia decreciente: pasar de 1 a 2 núcleos casi duplica la velocidad; de 4 a 8 gana bastante menos. Comentá también que `user` (tiempo total de CPU) es mucho **mayor** que `real` cuando `N > 1` — es la prueba numérica de que varios núcleos trabajaron en paralelo. Ese es el dato más elegante de la comparativa.

---

<a name="paso-18"></a>
# PASO 18 — Armar el informe PDF

> 🎯 **Rúbrica: 30 puntos** — el mismo peso que `EXTRAVERSION` y más que la compilación.

⚠️ **No entregues solo capturas.** Los 30 puntos son de *análisis técnico*, no de screenshots. Las secciones **📚 TEORÍA** de este manual son el contenido de esos puntos.

## Estructura sugerida (12–18 páginas)

```
PORTADA
  Universidad de San Carlos de Guatemala · Facultad de Ingenieria
  Escuela de Ingenieria en Ciencias y Sistemas
  Sistemas Operativos 2 · Segundo Semestre 2026
  Tarea #3 - Compilacion del kernel de Linux
  Nombre completo · Carne · Fecha
  >>> CAPTURA DE uname -r MOSTRANDO TU NOMBRE <<<

1. INTRODUCCION Y OBJETIVOS                                    (0.5 pag)
   Que se hizo y para que.

2. ENTORNO DE TRABAJO Y JUSTIFICACION DE DECISIONES            (1.5 pag)
   2.1 Hardware: MacBook M5 - arquitectura ARM64 (aarch64)
   2.2 Por que Debian 13 arm64 y no Linux Mint
       - Mint no publica ISOs ARM64
       - Debian 13 trae kernel 6.12 LTS = misma serie que el fuente
       - Cumple "distribucion basada en Debian" del enunciado
   2.3 Por que VMware Fusion: virtualizacion vs. emulacion
       - Tabla comparativa, overhead 2-5% vs 1000-2000%
   2.4 Por que NO Docker: los contenedores comparten el kernel del host
   2.5 Recursos asignados a la VM y su justificacion

3. MARCO TEORICO                                               (3-4 pag)
   3.1 El kernel de Linux: monolitico modular. built-in (=y) vs modulo (=m)
   3.2 La cadena de compilacion de GCC: las 4 etapas
       cpp -> compilacion -> as -> ld     (con tus capturas de cada una)
   3.3 GNU Make: grafo de dependencias y comparacion de timestamps
   3.4 GDB y DWARF: por que hace falta -g
   3.5 El sistema Kconfig y el archivo .config
   3.6 KERNELRELEASE: del Makefile a uname -r  (el diagrama del Paso 12.5)
   3.7 Firmas de modulos: SYSTEM_TRUSTED_KEYS vs MODULE_SIG, y Secure Boot
   3.8 El initramfs y el problema del huevo y la gallina
   3.9 GRUB: bootloader multi-etapa en UEFI/arm64

4. PROCEDIMIENTO EJECUTADO                                     (4-5 pag)
   Un sub-apartado por paso, con: comando exacto + captura + que verifique.
   4.1  Instalacion de herramientas (tabla de para-que-sirve-cada-paquete)
   4.2  Verificacion del entorno (4 etapas + Makefile + GDB)
   4.3  Descarga y verificacion SHA-256 del fuente
   4.4  Estructura del arbol del kernel (tabla de directorios)
   4.5  Inspeccion de drivers criticos de la VM (/sys/block)
   4.6  Configuracion: cp .config + localmodconfig
   4.7  Desactivacion de firmas de modulos
   4.8  Optimizacion: desactivar DEBUG_INFO (con su trade-off declarado)
   4.9  Modificacion de EXTRAVERSION
   4.10 Compilacion
   4.11 Instalacion de modulos y kernel
   4.12 Configuracion de GRUB y arranque

5. ARCHIVOS MODIFICADOS                                        (0.5 pag)
   >>> El enunciado pide esto explicitamente. Tabla: <<<
   | Archivo                          | Modificacion                        |
   |----------------------------------|-------------------------------------|
   | linux-6.12.69/Makefile           | EXTRAVERSION = -tunombre-tucarne    |
   | linux-6.12.69/.config            | copiado de /boot/config-*, luego    |
   |                                  | localmodconfig + 12 opciones        |
   | /etc/default/grub                | GRUB_TIMEOUT, TIMEOUT_STYLE, quiet  |
   Adjunta el diff:  diff config-01-original.txt config-04-final.txt

6. RESULTADOS                                                  (2 pag)
   6.1 Registro completo de uname -r y uname -a   <-- LO CENTRAL
   6.2 /proc/version
   6.3 Contenido de /boot con los 4 archivos
   6.4 Menu de GRUB con ambos kernels
   6.5 Tiempo de compilacion (real/user/sys)
   6.6 Tabla de metricas:
       | Metrica                     | Antes  | Despues |
       | uname -r                    | 6.12.x-arm64 | 6.12.69-tunombre |
       | Modulos en .config (=m)     |        |         |
       | Tamaño del build            |   -    |         |
       | Tamaño de Image.gz          |   -    |         |
       | Tiempo de compilacion       |   -    |         |

7. ERRORES ENCONTRADOS Y SU SOLUCION                           (1-2 pag)
   >>> El enunciado lo pide explicitamente. Por cada error: <<<
   - Mensaje literal del error
   - Diagnostico: por que ocurrio
   - Solucion aplicada (comando exacto)
   - Verificacion de que quedo resuelto
   Si no tuviste errores, documenta los que PREVINISTE y como:
   canonical-certs.pem, drivers de VM en localmodconfig, tabs en Makefile.

8. PUNTOS OPCIONALES                                           (1-2 pag)
   8.1 Script bash de verificacion (codigo + salida + decisiones de diseño)
   8.2 Comparativa de tiempos -jN + analisis con la ley de Amdahl

9. CONCLUSIONES                                                (0.5 pag)
   Minimo 4, tecnicas y especificas. No "aprendi mucho".
   Ejemplos del tipo correcto:
   - El kernel no es portable a nivel binario: arch/ contiene el codigo
     dependiente de ISA, por lo que compilar en ARM64 produce Image.gz
     en lugar de bzImage.
   - EXTRAVERSION no es cosmetico: define rutas del filesystem
     (/lib/modules/<ver>), por lo que debe fijarse antes de compilar.
   - localmodconfig reduce N veces el tiempo de compilacion pero introduce
     el riesgo de eliminar drivers no cargados; en un entorno virtualizado
     eso puede impedir el arranque.

10. BIBLIOGRAFIA
    Documentacion del kernel Linux. https://www.kernel.org/doc/html/latest/
    GCC online documentation. https://gcc.gnu.org/onlinedocs/
    GNU Make Manual. https://www.gnu.org/software/make/manual/
    GDB Documentation. https://sourceware.org/gdb/current/onlinedocs/
    Kernel Build System. Documentation/kbuild/
    Module Signing. Documentation/admin-guide/module-signing.rst

ANEXOS
    A. Salida completa de verificar-entorno.sh
    B. Ultimas 100 lineas del log de compilacion
    C. diff entre .config original y final
```

## Checklist de capturas — mapeadas a la rúbrica

| # | Captura | Paso | Rúbrica |
|---|---|---|---|
| 1 | `shasum` de la ISO coincidiendo | 1 | — |
| 2 | Settings de la VM (CPU/RAM/disco) | 2 | — |
| 3 | `uname -a` + `free -h` + `df -h` inicial | 4 | Línea base |
| 4 | `gcc/make/gdb --version` | 5 | **Instalación 10 pts** |
| 5 | `dpkg -l \| grep lib*-dev` | 5 | **Librerías de C** |
| 6 | `hola.c` compilado y ejecutándose | 6 | **Verificación entorno** |
| 7 | Líneas `hola.c` → `hola.i` | 6 | Teoría |
| 8 | Assembler ARM64 (`head hola.s`) | 6 | Teoría |
| 9 | `make` diciendo "is up to date" | 6 | **make verificado** |
| 10 | GDB detenido en breakpoint | 6 | GDB verificado |
| 11 | `sha256sum -c` del tarball → OK | 7 | **Descarga 10 pts** |
| 12 | `ls arch/` con `arm64` y `x86` | 7 | Teoría |
| 13 | Drivers desde `/sys/block/*/device/driver` | 8 | — |
| 14 | `localmodconfig` + conteo `=m` antes/después | 9 | **Configuración 10 pts** |
| 15 | `grep MODULE_SIG` **antes** | 10 | Firmas |
| 16 | `grep MODULE_SIG` **después** | 10 | Firmas |
| 17 | `head -8 Makefile` con `EXTRAVERSION` | 12 | **30 pts** |
| 18 | **`make -s kernelrelease`** | 12 | **30 pts** |
| 19 | Compilación con núcleos al 100% (`htop`) | 13 | **20 pts** |
| 20 | Últimas líneas del build (`GZIP Image.gz`) | 13 | **20 pts** |
| 21 | Salida de `time` (real/user/sys) | 13 | Opcional |
| 22 | `strings vmlinux \| grep <tu-version>` | 13 | **20 pts** |
| 23 | `ls -lh /boot/` con los 4 archivos | 14 | Evidencias |
| 24 | `ls -d /lib/modules/<tu-version>` | 14 | Evidencias |
| 25 | **Menú de GRUB con ambos kernels** | 15 | Evidencias |
| 26 | Mensajes de arranque del kernel | 15 | Evidencias |
| 27 | ⭐ **`uname -r` + `uname -a`** | 16 | **LA PRUEBA CENTRAL** |
| 28 | `cat /proc/version` | 16 | Resultados |
| 29 | `verificar-entorno.sh` con 0 fallas | 17 | Opcional |
| 30 | Tabla de tiempos `-jN` | 17 | Opcional |

> 💡 **Consejo sobre las capturas:** que sean **legibles**. Terminal con fondo claro o alto contraste, fuente grande (Ctrl+Shift+`+` en la terminal de XFCE), y recortá solo la parte relevante. Una captura de pantalla completa a 1920×1080 con la terminal ocupando un cuarto es ilegible en PDF.

## Antes de entregar

- [ ] El PDF tiene entre **7 y 15 páginas** (o el rango que indique tu tutor)
- [ ] La captura de `uname -r` con tu nombre está **en la portada**
- [ ] Sección 5 "Archivos modificados" completa — el enunciado la pide explícitamente
- [ ] Sección 7 "Errores y solución" completa — el enunciado la pide explícitamente
- [ ] Todas las capturas están numeradas y **referenciadas desde el texto** ("como se observa en la Figura 12…")
- [ ] Las conclusiones son técnicas, no genéricas
- [ ] Nombre y carné en la portada y en el encabezado o pie de cada página
- [ ] Nombre del archivo: `Tarea3_SO2_<TuCarne>.pdf`
- [ ] Subido a **UEDI/Classroom** según indique tu tutor

---

<a name="paso-19"></a>
# PASO 19 — Solución de errores

## Errores de configuración y compilación

### `No rule to make target 'debian/canonical-certs.pem'`

```
make[2]: *** No rule to make target 'debian/canonical-certs.pem',
         needed by 'certs/x509_certificate_list'.  Stop.
```

**Causa:** heredaste `CONFIG_SYSTEM_TRUSTED_KEYS="debian/canonical-certs.pem"` de la config de Debian, pero ese archivo solo existe en el árbol de packaging de Debian, no en el tarball de kernel.org.

```bash
cd ~/kernel/linux-6.12.69
scripts/config --set-str SYSTEM_TRUSTED_KEYS ""
scripts/config --set-str SYSTEM_REVOCATION_KEYS ""
scripts/config --disable MODULE_SIG
make olddefconfig
grep -E 'TRUSTED_KEYS|MODULE_SIG=' .config    # verificar
fakeroot make -j$(nproc)                       # reanuda, no recompila todo
```

### `BTF: .tmp_vmlinux.btf: pahole (pahole) is not available`

**Causa:** falta `pahole`, o su versión es muy vieja para generar BTF.

```bash
sudo apt install -y dwarves
pahole --version
# Si sigue fallando, desactivá BTF:
scripts/config --disable DEBUG_INFO_BTF
make olddefconfig
```

### `bc: command not found` / `rsync: command not found` / `cpio: not found`

```bash
sudo apt install -y bc rsync cpio kmod zstd
```

### `No space left on device`

```bash
df -h /
du -sh ~/kernel/linux-6.12.69

# Opcion A: liberar espacio bajando el peso del build (Paso 11)
cd ~/kernel/linux-6.12.69
scripts/config --disable DEBUG_INFO
scripts/config --enable  DEBUG_INFO_NONE
scripts/config --disable DEBUG_INFO_BTF
make olddefconfig
make clean          # borra objetos, CONSERVA .config
fakeroot make -j$(nproc)

# Opcion B: agrandar el disco en Fusion
# VM apagada -> Settings -> Hard Disk -> subir el tamaño -> Apply
# Luego en Debian: sudo growpart /dev/nvme0n1 2 && sudo resize2fs /dev/nvme0n1p2
```

> ⚠️ **`make clean` vs `make mrproper` vs `make distclean`:**
> | Comando | Borra objetos | Borra `.config` |
> |---|---|---|
> | `make clean` | ✅ | ❌ (**usá este**) |
> | `make mrproper` | ✅ | ✅ **borra tu configuración** |
> | `make distclean` | ✅ | ✅ + archivos de editor |
>
> **Nunca corras `mrproper` sin haber respaldado tu `.config`.** Perdés todo el trabajo de los pasos 9 a 12.

### El compilador es matado (OOM) durante `LD vmlinux`

```
cc1: fatal error: Killed signal terminated program
# o:  ld: out of memory
```

**Causa:** el enlazado final es muy demandante de RAM y `-jN` con N alto multiplica el consumo.

```bash
dmesg | grep -i 'killed process'      # confirma que fue el OOM killer
fakeroot make -j2                     # bajá el paralelismo
# o subí la RAM de la VM en Fusion (VM apagada -> Processors & Memory)
```

### `error: 'gcc-plugins' ... plugin support is not available`

```bash
scripts/config --disable GCC_PLUGINS
make olddefconfig
```

### `Makefile:3: *** missing separator. Stop.`

**Causa:** usaste **espacios** en vez de un **TAB** al inicio de una línea de receta.

```bash
cat -A Makefile | head        # ^I es TAB, los espacios se ven como espacios
# Corregí con nano presionando Tab al inicio de cada linea de receta
```

## Errores de arranque

### `VFS: Unable to mount root fs on unknown-block(0,0)` / `Kernel panic`

**Causa:** `localmodconfig` eliminó el driver del disco raíz, o el initramfs no lo incluye.

**Recuperación:**
1. Reiniciá la VM (**Virtual Machine → Restart**)
2. **ESC** al arrancar → **Advanced options** → elegí el **kernel de Debian** (el viejo)
3. Ya adentro:

```bash
cd ~/kernel/linux-6.12.69
# Reemplaza por el driver que anotaste en el Paso 8.3
scripts/config --module BLK_DEV_NVME
scripts/config --enable  NVME_CORE
scripts/config --module  SCSI_VMW_PVSCSI
scripts/config --enable  EXT4_FS
make olddefconfig
grep -E 'NVME|PVSCSI|EXT4_FS=' .config     # verificar
fakeroot make -j$(nproc)
sudo make modules_install && sudo make install
sudo update-initramfs -c -k "$(cat ~/evidencias/kernel-release.txt)"
sudo update-grub
sudo reboot
```

> 💡 **Este error es oro para tu informe.** Documentá el mensaje literal, el diagnóstico y la solución: la sección 7 del informe existe precisamente para esto.

### Arranca pero no hay red

```bash
lsmod | grep vmxnet3
ip -brief addr show
# Si falta el modulo:
cd ~/kernel/linux-6.12.69
scripts/config --module VMXNET3
make olddefconfig && fakeroot make -j$(nproc)
sudo make modules_install && sudo make install && sudo reboot
```

### Arranca pero no hay entorno gráfico

```bash
lsmod | grep vmwgfx
cd ~/kernel/linux-6.12.69
scripts/config --module DRM_VMWGFX
make olddefconfig && fakeroot make -j$(nproc)
sudo make modules_install && sudo make install && sudo reboot
```

### `modprobe: FATAL: Module X not found`

**Causa:** olvidaste `make modules_install`, o `EXTRAVERSION` cambió después de compilar y los módulos quedaron en otra ruta.

```bash
ls -d /lib/modules/$(uname -r)              # debe existir
cd ~/kernel/linux-6.12.69
sudo make modules_install
sudo depmod -a $(uname -r)
```

### Mi kernel no aparece en el menú de GRUB

```bash
KREL=$(cat ~/evidencias/kernel-release.txt)
ls -l /boot/vmlinuz-$KREL /boot/initrd.img-$KREL   # ambos deben existir
sudo update-grub
sudo grep -c "$KREL" /boot/grub/grub.cfg           # debe ser > 0
```

### No arranca nada, ni el kernel viejo

**Restaurá el snapshot.** VMware Fusion → **Virtual Machine → Snapshots** → seleccioná **`03-antes-de-instalar`** → **Restore**. Volvés al estado previo a tocar `/boot`, con la compilación intacta.

## Comandos de emergencia

| Situación | Comando |
|---|---|
| Ver la versión que se va a compilar | `make -s kernelrelease` |
| Reanudar un build interrumpido | `fakeroot make -j$(nproc)` (no recompila lo hecho) |
| Limpiar objetos, conservar config | `make clean` |
| Respaldar la config | `cp .config ~/config-respaldo` |
| Restaurar la config | `cp ~/config-respaldo .config && make olddefconfig` |
| Ver qué cambió en la config | `diff ~/evidencias/config-01-original.txt .config \| head -60` |
| Buscar una opción de config | `grep -i '<palabra>' .config` |
| Ver una opción en el Kconfig | `grep -rn 'config <NOMBRE>' --include=Kconfig .` |
| Regenerar el initramfs | `sudo update-initramfs -c -k <version>` |
| Regenerar el menú de GRUB | `sudo update-grub` |
| Errores del último arranque | `sudo dmesg --level=err,crit` |
| Espacio ocupado por el build | `du -sh ~/kernel/linux-6.12.69` |

---

# Resumen en una línea

Compilás el kernel `6.12.69` **nativamente para ARM64** dentro de una VM **Debian 13 arm64** en VMware Fusion: copiás la config de Debian, la reducís con `localmodconfig`, desactivás la verificación de firmas, escribís tu nombre y carné en el `EXTRAVERSION` del Makefile, compilás con `fakeroot make -j$(nproc)`, lo instalás con `modules_install` + `install`, booteás desde GRUB y lo probás con `uname -r` — verificando en **cada** paso antes de avanzar, y guardando la evidencia de cada verificación para el informe.
