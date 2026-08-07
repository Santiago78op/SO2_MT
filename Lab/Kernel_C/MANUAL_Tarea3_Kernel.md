# Manual — Tarea #3: Compilar el kernel de Linux

**Curso:** Sistemas Operativos 2 · 2S2026 · 4 pts
**Entorno:** MacBook **M5 (ARM64)** + **VMware Fusion** + **Debian 13 arm64**
**Kernel:** serie **`6.12.x`** (LTS) — los ejemplos usan `6.12.69`, la corrida real de campo fue `6.12.102`

> **Revisión de campo (2026-08-07).** Este manual incorpora las correcciones de una compilación real en Debian 13 arm64 sobre VMware Fusion. Los puntos que cambiaron respecto a la primera versión están marcados con **🔧 CAMPO** y son: la variable `$KVER` en vez de la versión fija, el orden de copiar el `.config` antes de mirar los certificados, la imposibilidad de desactivar `MODULE_SIG` en Debian 13 arm64, los `grep` que no encontraban las líneas `# ... is not set`, el `libfakeroot internal error`, el kernel instalado como **`vmlinux`** (sin `z`) en arm64, y que **reiniciar no alcanza: hay que elegir el kernel en GRUB con ESC**.

---

## 📖 Cómo usar este manual

Está dividido en **tres partes independientes**. **No leas las tres.** Según lo que estés haciendo ahora:

| Si estás… | Abrí | Qué es |
|---|---|---|
| 🔧 **Ejecutando la práctica** | **PARTE 1** | Los comandos, en orden, con su verificación. **Es lo único que hay que *hacer*.** |
| ✍️ **Escribiendo el informe** | **PARTE 2** | Toda la teoría, ya ordenada como las secciones del informe. **Es lo que hay que *escribir*** (30 de 100 pts). |
| 🔥 **Algo se rompió** | **PARTE 3** | El mensaje de error → diagnóstico → comando que lo arregla. |

**Empezá por [§1.0 Ruta mínima](#ruta-minima)**: los 9 bloques de comandos, sin una línea de teoría. Si un bloque te da problema, bajás al paso detallado correspondiente.

Dentro de PARTE 1, cada paso trae:

| Marca | Significa |
|---|---|
| **✅ VERIFICAR** | Corré esto y comparalo con lo esperado. Toma 5 segundos y te ahorra horas. |
| ⛔ | **No avances** hasta que esto dé bien. Los 5 críticos están resumidos al final de [§1.0](#ruta-minima). |
| **📸 EVIDENCIA** | Capturá esto para el informe. |
| **🔧 CAMPO** | Corrección de la corrida real. Lo que la primera versión del manual decía mal. **Leelo.** |
| **→ 📚 §T…** | Puntero a la teoría de PARTE 2. **No la necesitás para ejecutar.** |

### Convención de rutas

| Ruta | Qué es |
|---|---|
| `~/kernel/linux-$KVER/` | Fuente del kernel — **la mayoría de comandos van acá** |
| `~/evidencias/` | Salidas y logs para el informe |

### 🔧 CAMPO — `$KVER`: no asumas `6.12.69`

**El problema real:** la primera versión de este manual escribía `~/kernel/linux-6.12.69/` en todos lados. Pero kernel.org rota los tarballs: cuando se hizo la corrida real ya no existía la `6.12.69`, la disponible era la **`6.12.102`**, y **todos los `cd` fallaban** con `No such file or directory`.

**La solución:** una variable de entorno que se define **una sola vez** y sobrevive a los reinicios de la terminal:

```bash
# Ajustá el número a la versión que REALMENTE bajaste (§1.8 te dice cuál es)
echo 'export KVER=6.12.102' >> ~/.bashrc
source ~/.bashrc
echo "$KVER"          # tiene que imprimir tu versión
```

A partir de acá, **todos** los comandos del manual usan `~/kernel/linux-$KVER`. Si abrís una terminal nueva y `echo $KVER` sale vacío, corré `source ~/.bashrc` otra vez.

> Los ejemplos de **salida** siguen mostrando `6.12.69` o `6.12.102` como ilustración; lo que importa es que tu `$KVER` coincida con el directorio que existe en `~/kernel/`.

---

## Índice general

### 🔧 [PARTE 1 — EJECUCIÓN](#parte-1)

| § | Paso | Rúbrica | Tiempo |
|---|---|---|---|
| [1.0](#ruta-minima) | **⚡ Ruta mínima** (los 9 bloques) | — | — |
| [1.1](#p1) | Medir recursos del Mac | — | 2 min |
| [1.2](#p2) | Descargar Debian 13 arm64 | — | 10 min |
| [1.3](#p3) | Crear la VM en Fusion | — | 10 min |
| [1.4](#p4) | Instalar Debian | — | 20 min |
| [1.5](#p5) | Post-instalación + snapshot | — | 10 min |
| [1.6](#p6) | Instalar GCC, make, GDB, librerías | **10 pts** | 10 min |
| [1.7](#p7) | Verificar el entorno | — | 20 min |
| [1.8](#p8) | Descargar el fuente | **10 pts** | 15 min |
| [1.9](#p9) | Inspeccionar drivers de la VM | — | 5 min |
| [1.10](#p10) | Configurar: `.config` + `localmodconfig` | **10 pts** | 15 min |
| [1.11](#p11) | 🔧 **Neutralizar** firmas de módulos *(reescrita)* | — | 5 min |
| [1.12](#p12) | Reducir el peso del build | — | 5 min |
| [1.13](#p13) | `EXTRAVERSION` con tu nombre | **30 pts** | 10 min |
| [1.14](#p14) | Compilar | **20 pts** | 40–120 min |
| [1.15](#p15) | Instalar módulos y kernel | — | 10 min |
| [1.16](#p16) | GRUB y reiniciar | — | 10 min |
| [1.17](#p17) | Verificación final: `uname -r` | — | 5 min |
| [1.18](#p18) | Opcionales: script bash + tiempos | extra | 30 min |

### ✍️ [PARTE 2 — TEORÍA PARA EL INFORME](#parte-2)

| § | Tema |
|---|---|
| [T1](#t1) | Arquitecturas y virtualización |
| [T2](#t2) | El kernel de Linux: monolítico modular |
| [T3](#t3) | La cadena de compilación: GCC, make, GDB |
| [T4](#t4) | Kconfig y el archivo `.config` |
| [T5](#t5) | `KERNELRELEASE`: del Makefile a `uname -r` |
| [T6](#t6) | Firmas de módulos y Secure Boot · 🔧 **T6.1b: por qué `MODULE_SIG` no se puede apagar** |
| [T7](#t7) | Initramfs, GRUB y el arranque · 🔧 **`vmlinux` vs `vmlinuz`, initrd de 532 MB, por qué arranca el viejo** |
| [T8](#t8) | Paralelismo y ley de Amdahl |
| [T9](#t9) | **Estructura del informe + checklist de 34 capturas** |

### 🔥 [PARTE 3 — ERRORES](#parte-3)

| § | Tema |
|---|---|
| [E1](#e1) | Errores de configuración y compilación (E1.1–E1.8) |
| [E1.9–E1.13](#e1) | 🔧 **Los 5 errores de la corrida real:** `libfakeroot`, loop de `MODULE_SIG`, `grep` con falso negativo, `.config` corrupto por pegar en un prompt, directorio inexistente |
| [E2](#e2) | Errores de arranque (E2.1–E2.6) |
| [E2.7–E2.9](#e2) | 🔧 **`uname -r` muestra el kernel viejo**, `vmlinuz` que no existe, `kernel-release.txt` ausente |
| [E3](#e3) | Comandos de emergencia |
| [✅](#checklist-campo) | 🔧 **Checklist de campo** — la lista corta que evita los 8 errores |

---
---

<a name="parte-1"></a>
# 🔧 PARTE 1 — EJECUCIÓN

<a name="ruta-minima"></a>
## ⚡ 1.0 — Ruta mínima

> **Todo lo que hay que ejecutar, sin teoría.** ~30 comandos, y 11 son un solo bloque de copiar y pegar.
> Si un bloque falla, bajá al paso detallado (§1.1–§1.17) o a [PARTE 3](#parte-3).

### En macOS

```bash
sysctl -n hw.ncpu && sysctl -n hw.memsize && df -h /
```

Descargá el ISO **arm64** de `debian.org/distrib/netinst`.
En Fusion: **New → Install from image** → *Customize Settings* → **(ncpu−2) núcleos / 16 GB RAM / 80 GB disco sin pre-allocate**.
Instalá Debian con 3 decisiones: **root sin contraseña**, **todo en una partición**, **XFCE + standard utilities**.

### Bloque 1 — Preparar · 10 min

```bash
sudo apt update && sudo apt full-upgrade -y
sudo apt install -y open-vm-tools open-vm-tools-desktop
mkdir -p ~/kernel ~/evidencias
sudo reboot
```

📸 **SNAPSHOT** → `01-debian-limpio`

### Bloque 2 — Herramientas · 5 min · *10 pts*

```bash
sudo apt install -y build-essential gdb libncurses-dev bison flex libssl-dev \
  libelf-dev libdw-dev fakeroot dwarves bc rsync cpio kmod zstd xz-utils wget git python3

gcc --version && make --version | head -1 && gdb --version | head -1
```

### Bloque 3 — Fuente · 15 min · *10 pts*

🔧 **CAMPO:** primero averiguá qué versión existe hoy, después fijala en `$KVER`.

```bash
cd ~/kernel
# 1. Ver las 6.12.x que kernel.org tiene AHORA
curl -s https://cdn.kernel.org/pub/linux/kernel/v6.x/ \
  | grep -o 'linux-6\.12\.[0-9]*\.tar\.xz' | sort -uV | tail -5

# 2. Fijar la que elegiste (ejemplo: 6.12.102) — persiste entre terminales
echo 'export KVER=6.12.102' >> ~/.bashrc && source ~/.bashrc && echo "$KVER"

# 3. Bajar, verificar y descomprimir
wget "https://cdn.kernel.org/pub/linux/kernel/v6.x/linux-${KVER}.tar.xz"
tar -xf "linux-${KVER}.tar.xz"
cd ~/kernel/linux-$KVER
```

### Bloque 4 — Configurar · 10 min · *10 pts*

```bash
# ANOTÁ la salida de estos dos: los necesitás si el kernel nuevo no arranca
ls -l /sys/block/*/device/driver
lsmod | grep -Ei 'vmw|vmx|nvme|pvscsi'

cp /boot/config-$(uname -r) .config
cp .config ~/evidencias/config-original.txt
yes "" | make localmodconfig
```

### Bloque 5 — Los ajustes obligatorios · 2 min

> 🔧 **CAMPO — ojo con este bloque, cambió.** La versión anterior traía `scripts/config --disable MODULE_SIG`. En Debian 13 arm64 **eso genera un loop infinito**: `make olddefconfig` lo vuelve a poner en `y` porque otra opción del Kconfig lo fuerza. Ver [§1.11](#p11) para el detalle. **No intentes desactivar `MODULE_SIG`.**

```bash
scripts/config --set-str SYSTEM_TRUSTED_KEYS ""
scripts/config --set-str SYSTEM_REVOCATION_KEYS ""
scripts/config --disable SYSTEM_REVOCATION_LIST
scripts/config --disable MODULE_SIG_ALL
scripts/config --disable MODULE_SIG_FORCE
scripts/config --set-str LOCALVERSION ""
scripts/config --disable LOCALVERSION_AUTO
scripts/config --disable DEBUG_INFO
scripts/config --enable  DEBUG_INFO_NONE
scripts/config --disable DEBUG_INFO_BTF

make olddefconfig
```

**✅ VERIFICAR** — usá **este** grep, no `^CONFIG_MODULE_SIG=`:

```bash
grep -E 'CONFIG_SYSTEM_TRUSTED_KEYS|CONFIG_MODULE_SIG_FORCE|CONFIG_MODULE_SIG_ALL' .config
```

Esperás:

```text
CONFIG_SYSTEM_TRUSTED_KEYS=""
# CONFIG_MODULE_SIG_FORCE is not set
# CONFIG_MODULE_SIG_ALL is not set
```

`CONFIG_MODULE_SIG=y` puede quedar activo y **está bien**: con `FORCE` y `ALL` apagados y las rutas de certificados vacías, el build genera su propia clave local y no falla.

### Bloque 6 — Tu nombre · 2 min · *30 pts*

```bash
nano Makefile        # línea 5 →  EXTRAVERSION = -tunombre-tucarne
make -s kernelrelease
```

⛔ **Debe imprimir `${KVER}-tunombre-tucarne`** (ej. `6.12.102-jbarrera-202012345`). Si no, arreglalo antes de seguir → [§1.13](#p13)

📸 **SNAPSHOT** → `02-antes-de-compilar`

### Bloque 7 — Compilar · 40–120 min de espera · *20 pts*

```bash
df -h ~                      # necesitás >= 15 GB libres
time ( fakeroot make -j$(nproc) 2>&1 | tee ~/evidencias/log-compilacion.txt )
ls -lh arch/arm64/boot/Image.gz
```

> 🔧 **CAMPO:** si aparece `libfakeroot internal error: payload not recognized!` y el build **sigue avanzando** (`CC`, `LD`, `AR`), **ignoralo**. Es un bug de `libfakeroot` en arm64, no un error tuyo → [§E1.9](#e1).

### Bloque 8 — Instalar · 10 min

📸 **SNAPSHOT** → `03-antes-de-instalar` ← el más importante

```bash
KREL=$(make -s kernelrelease)
echo "$KREL" > ~/evidencias/kernel-release.txt
sudo make modules_install
sudo make install
ls -lh /boot/vmlinu?-$KREL /boot/initrd.img-$KREL
```

> 🔧 **CAMPO:** en **arm64 el kernel se instala como `vmlinux-<ver>`, sin la `z`**. Por eso el `ls` usa el comodín `vmlinu?-`, que agarra tanto `vmlinuz-` (x86) como `vmlinux-` (arm64).

Si falta el `initrd.img`: `sudo update-initramfs -c -k "$KREL"`

```bash
sudo sed -i 's/^GRUB_TIMEOUT=.*/GRUB_TIMEOUT=20/' /etc/default/grub
sudo update-grub
sudo grep -c "$KREL" /boot/grub/grub.cfg     # debe ser > 0
sudo reboot
```

### Bloque 9 — Verificar · 1 min

⛔ 🔧 **CAMPO — reiniciar NO alcanza.** GRUB arranca el **kernel viejo de Debian** por defecto. Si te limitás a `sudo reboot` y corrés `uname -r`, vas a ver `6.12.101+deb13-arm64` y vas a creer que la compilación falló. **No falló: no elegiste tu kernel.**

1. Al arrancar la VM, apretá **ESC** repetidamente (UEFI/arm64; en x86/BIOS sería SHIFT).
2. **Advanced options for Debian GNU/Linux** → Enter.
3. 📸 captura del menú → elegí **tu** kernel (`<KVER>-tunombre-tucarne`).

```bash
uname -r
uname -a
```

📸 **Esta es LA captura de la tarea.** Va en la portada del informe.

### Resumen de esfuerzo

| | Trabajo activo | Esperando |
|---|---|---|
| Bloques 1–6 | ~45 min | — |
| Bloque 7 | 1 min | 40–120 min |
| Bloques 8–9 | ~15 min | — |
| **Informe** ([§T9](#t9)) | **~2 h** | — |

### Los 5 puntos donde no te podés equivocar

| ⛔ | Qué | Si falla |
|---|---|---|
| 1 | `make -s kernelrelease` muestra tu nombre **antes** de compilar | Compilás 90 min al vacío |
| 2 | `SYSTEM_TRUSTED_KEYS=""` antes de compilar | El build muere a los 40 min |
| 3 | El driver del disco sobrevive a `localmodconfig` | Kernel panic al arrancar |
| 4 | Los **3 snapshots** en Fusion | Un error te cuesta reinstalar |
| 5 | 🔧 **Elegir tu kernel en GRUB** (ESC → Advanced options) | `uname -r` muestra el kernel viejo y creés que todo falló |

**Todo lo demás es recuperable.**

---
---

<a name="p1"></a>
## 1.1 — Medir los recursos del Mac

En la **Terminal de macOS** (no la VM, todavía no existe):

```bash
sysctl -n hw.ncpu          # núcleos totales
sysctl -n hw.memsize       # RAM en bytes (dividí entre 1073741824 para GB)
df -h /                    # espacio libre
```

### Anotá tus números

| Dato | Tu valor | Para la VM |
|---|---|---|
| Núcleos del Mac | `_____` | **núcleos − 2** |
| RAM del Mac | `_____ GB` | **la mitad** (mín. 8 GB, ideal 16) |
| Espacio libre | `_____ GB` | Necesitás **≥ 60 GB** |

⛔ **Con menos de 60 GB libres, liberá espacio antes de seguir.** Un `No space left on device` a las dos horas de compilar significa empezar de cero.

→ 📚 [§T1.3 — por qué no darle todo a la VM](#t13)

---

<a name="p2"></a>
## 1.2 — Descargar Debian 13 arm64

```
https://www.debian.org/distrib/netinst   →  sección "arm64"
debian-13.x.x-arm64-netinst.iso  (~700 MB)
```

⛔ **Verificá que diga `arm64`.** Si dice `amd64` es la versión x86 y **no arranca** en tu Mac.

**✅ VERIFICAR** — en la Terminal de macOS:

```bash
cd ~/Downloads
ls -lh debian-*arm64*.iso
shasum -a 256 debian-*arm64*.iso
```

Comparalo con el `SHA256SUMS` que Debian publica junto a la ISO. Si no coincide, la descarga se corrompió: bajala de nuevo.

**📸 EVIDENCIA:** el `shasum` coincidiendo con el oficial.

→ 📚 [§T1.2 — por qué Debian y no Mint](#t12) · [§T6.3 — qué es un checksum](#t63)

---

<a name="p3"></a>
## 1.3 — Crear la VM en VMware Fusion

**File → New… → Install from disc or image** → arrastrá el `.iso`.
Sistema huésped: **Debian 12.x 64-bit Arm** (o *Other Linux 6.x kernel 64-bit Arm*).

⛔ **Antes de "Finish", entrá a "Customize Settings"** y guardá la VM como `Debian13-SO2`.

### Processors & Memory

| Campo | Valor |
|---|---|
| Processors | **tus núcleos − 2** |
| Memory | **16384 MB** (o la mitad de tu RAM) |
| Enable hypervisor applications | ❌ |

### Hard Disk

| Campo | Valor | Por qué |
|---|---|---|
| Disk size | **80 GB** | El build supera 30 GB |
| Pre-allocate disk space | ❌ **desmarcado** | El archivo crece según uso |
| Split into multiple files | ✅ | Trozos de 2 GB, más manejables |

Después de cambiar el tamaño → **Apply**.

### Display

| Campo | Valor |
|---|---|
| Accelerate 3D Graphics | ❌ |
| Use full resolution for Retina | ❌ (tus capturas quedan legibles) |

### Network Adapter

**Share with my Mac (NAT)** ✅ — necesitás internet para `apt` y `wget`.

Cerrá Settings → **▶ Play**.

**📸 EVIDENCIA:** la ventana de Settings mostrando CPU, RAM y disco.

→ 📚 [§T1.4 — virtualización vs. emulación](#t14) · [§T1.5 — por qué NO Docker](#t15)

---

<a name="p4"></a>
## 1.4 — Instalar Debian

Elegí **Graphical install**. Seguí esta tabla; las tres ⚠️ tienen consecuencias.

| Pantalla | Qué elegir |
|---|---|
| Language | English (errores más buscables) o Spanish |
| Location | Guatemala |
| Keymap | El de tu teclado (probalo en el campo de prueba) |
| Hostname | `debian-so2` |
| Domain name | *(vacío)* |
| ⚠️ **Root password** | **DEJALO VACÍO** en ambos campos → Continue |
| Full name / Username | Tu nombre / `tuusuario` (minúsculas, sin espacios) |
| User password | La que quieras — **anotala** |
| Time zone | Guatemala |
| ⚠️ **Partitioning method** | **Guided – use entire disk** |
| ⚠️ **Partitioning scheme** | **All files in one partition** |
| Write changes to disk? | **Yes** |
| Mirror | Guatemala o `deb.debian.org` |
| Package survey | No |

### ⚠️ Software selection — la pantalla clave

Marcá con **espacio** exactamente esto:

```
[*] Debian desktop environment
[*]   Xfce
[ ]   ... (desmarcá GNOME, KDE y todos los demás)
[ ] web server
[ ] SSH server        ← opcional
[*] standard system utilities
```

**XFCE** porque es el escritorio más liviano y el más parecido a Mint; GNOME te come 1.5 GB de RAM que necesitás para compilar. Y **necesitás escritorio** porque la rúbrica pide capturas de pantalla.

| Pantalla | Qué elegir |
|---|---|
| Install GRUB to primary drive? | **Yes** |
| Device for bootloader | El disco (`/dev/nvme0n1` o `/dev/sda`) |

**✅ VERIFICAR** — en una terminal de Debian:

```bash
whoami
groups
```

⛔ **En `groups` tiene que aparecer `sudo`.**

Si no aparece, le pusiste contraseña a root:

```bash
su -                                     # contraseña de root
/usr/sbin/usermod -aG sudo tuusuario
exit
```

Después **cerrá sesión y volvé a entrar** para que el grupo tome efecto.

---

<a name="p5"></a>
## 1.5 — Post-instalación, guest tools y snapshot

```bash
sudo apt update
sudo apt full-upgrade -y
sudo apt install -y open-vm-tools open-vm-tools-desktop
mkdir -p ~/kernel ~/evidencias
sudo reboot
```

⛔ **`open-vm-tools` va ANTES de [§1.10](#p10) (`localmodconfig`), y no es opcional.** Al instalarlo se cargan los módulos `vmw_vmci` y `vmw_vsock_vmci_transport`. `localmodconfig` conserva **solo los módulos cargados en ese momento**; si corrés `localmodconfig` antes, esos módulos desaparecen del `.config`.

### 📸 SNAPSHOT — no te lo saltés

**Virtual Machine → Snapshots… → Take Snapshot** → nombre **`01-debian-limpio`**

> Es tu red de seguridad. [§1.15](#p15) modifica `/boot` y GRUB; si algo se rompe volvés acá en 30 segundos en vez de reinstalar. Vas a tomar dos más: `02-antes-de-compilar` ([§1.13](#p13)) y `03-antes-de-instalar` ([§1.15](#p15)).

**✅ VERIFICAR:**

```bash
cat /etc/os-release | head -3
uname -r
uname -m
systemctl status open-vm-tools --no-pager
```

| Chequeo | Esperado |
|---|---|
| `VERSION_ID` | `"13"` |
| `uname -r` | **`6.12.xx-arm64`** ← confirmá que sea **6.12.x** |
| `uname -m` | `aarch64` |
| open-vm-tools | `active (running)` |

> Si `uname -r` **no** es 6.12.x, el `.config` que vas a copiar es de otra serie y `make` te va a preguntar por muchas opciones nuevas. No es fatal (contestás con Enter), pero sabelo.

### Guardar la línea base

```bash
{
  echo "===== LINEA BASE - ANTES DE COMPILAR ====="
  echo "Fecha: $(date)"
  echo; echo "--- Sistema ---";      uname -a
  echo; echo "--- Arquitectura ---"; uname -m
  echo; echo "--- Distro ---";       cat /etc/os-release
  echo; echo "--- CPU ---";          nproc; lscpu | head -20
  echo; echo "--- RAM ---";          free -h
  echo; echo "--- Disco ---";        df -h /
  echo; echo "--- /boot ---";        ls -lh /boot/
} > ~/evidencias/00-linea-base.txt
cat ~/evidencias/00-linea-base.txt
```

**📸 EVIDENCIA:** `uname -a` + `uname -m` + `free -h` + `df -h /`. Este es el **"antes"** contra el que vas a contrastar el `uname -r` final.

---

<a name="p6"></a>
## 1.6 — Instalar GCC, make, GDB y librerías · **10 pts**

```bash
sudo apt install -y \
  build-essential gdb libncurses-dev bison flex libssl-dev \
  libelf-dev libdw-dev fakeroot dwarves \
  bc rsync cpio kmod zstd xz-utils wget git python3
```

> ⚠️ **Esta lista es más larga que la del README del curso, a propósito.** Al README le faltan `bc`, `rsync`, `cpio`, `zstd` y `libdw-dev`, que en un Debian limpio **no vienen** y hacen fallar el build en cuatro momentos distintos. También le falta `gdb`, que la rúbrica pide explícitamente. **Mencioná esta diferencia en el informe:** demuestra que no copiaste la guía a ciegas.

**✅ VERIFICAR:**

```bash
{
  echo "===== HERRAMIENTAS INSTALADAS ====="
  echo "Fecha: $(date)"
  echo; echo "--- GCC ---";     gcc --version
  echo; echo "--- MAKE ---";    make --version | head -3
  echo; echo "--- GDB ---";     gdb --version | head -2
  echo; echo "--- LD / AS / CPP ---"
  ld --version | head -2; as --version | head -2; cpp --version | head -2
  echo; echo "--- pahole ---";  pahole --version
  echo; echo "--- bison / flex ---"; bison --version | head -1; flex --version
  echo; echo "--- Librerias de desarrollo de C ---"
  dpkg -l | grep -E '^ii\s+(libc6-dev|libssl-dev|libelf-dev|libncurses-dev|libdw-dev)'
  echo; echo "--- Headers de glibc ---"; ls /usr/include/stdio.h /usr/include/stdlib.h
  echo; echo "--- Target del compilador ---"; gcc -dumpmachine
} | tee ~/evidencias/01-herramientas.txt
```

| Chequeo | Esperado |
|---|---|
| `gcc --version` | GCC 14.x |
| **`gcc -dumpmachine`** | **`aarch64-linux-gnu`** ← confirma compilación nativa ARM64 |
| `pahole --version` | v1.2x o superior |
| Los 5 paquetes `lib*-dev` | estado `ii` (installed) |

> Si algo dice `command not found`, ese paquete no se instaló: `sudo apt install -y <paquete>` y leé el error.

**📸 EVIDENCIA:** `gcc/make/gdb --version` y el `dpkg -l | grep`.

→ 📚 [§T3.5 — para qué sirve cada paquete](#t35) (tabla lista para el informe)

---

<a name="p7"></a>
## 1.7 — Verificar que el entorno realmente compila

> Acá no alcanza con `gcc --version`. Hay que **demostrar** que la cadena funciona. Este paso separa un informe de 5 puntos de uno de 10.

```bash
mkdir -p ~/pruebas && cd ~/pruebas
```

### 1.7.1 Programa de prueba

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

nano hola.c        # ⚠️ editá AUTOR y CARNE con tus datos (Ctrl+O, Ctrl+X)

gcc -Wall -Wextra -g -o hola hola.c
./hola
```

**✅ Esperás:** tus datos y `sumar(20, 22) = 42`, **sin warnings**.

### 1.7.2 Las 4 etapas de GCC

```bash
# Etapa 1 — Preproceso
gcc -E hola.c -o hola.i
echo ">>> hola.c: $(wc -l < hola.c) lineas  ->  hola.i: $(wc -l < hola.i) lineas"

# Etapa 2 — Compilación a assembler ARM64
gcc -S hola.i -o hola.s
head -25 hola.s

# Etapa 3 — Ensamblado
gcc -c hola.s -o hola.o
file hola.o
nm hola.o          # 'T' = definido aqui, 'U' = pendiente de resolver

# Etapa 4 — Enlazado
gcc hola.o -o hola_final
file hola_final
ldd hola_final
./hola_final
```

**✅ Qué observar** (y comentar en el informe):

| Observación | Qué significa |
|---|---|
| `hola.c` ~20 líneas → `hola.i` ~1000+ | El preprocesador expandió los headers |
| `hola.s` tiene `stp`, `ldp`, `bl`, `x0`, `w0` | Instrucciones y registros **ARM64**. En x86 verías `mov`, `push`, `%rax`. **Prueba directa de otra ISA.** |
| `nm hola.o` marca `printf` con **`U`** | El object file no sabe dónde está `printf`; lo resuelve el enlazador |
| `file hola.o` → "relocatable" | Direcciones aún no definitivas |
| `file hola_final` → "interpreter /lib/ld-linux-aarch64.so.1" | Enlazado dinámico |

### 1.7.3 Verificar `make` con un Makefile propio

⛔ **LA TRAMPA CLÁSICA:** las recetas de un Makefile **deben empezar con TAB literal**, no espacios. Con espacios obtenés `Makefile:3: *** missing separator. Stop.`

Este heredoc ya lleva el tab correcto:

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

**✅ VERIFICAR que los tabs quedaron bien:**

```bash
cat -A Makefile | grep -n '\^I'
```

Tienen que aparecer **4 líneas** con `^I` al inicio. `^I` **es** el tab. Si no ves ninguna, abrí con `nano Makefile` y presioná Tab al inicio de cada receta.

```bash
make clean
make                 # (1) compila
make                 # (2) NO recompila: "is up to date"
touch hola.c
make                 # (3) detecta el cambio y recompila
```

**✅ Esperás:** (2) dice `'hola' is up to date.` y (3) recompila.

### 1.7.4 Verificar GDB

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

**✅ Esperás:** se detiene en `sumar`, muestra `a = 20`, `b = 22`, después del `next` muestra `resultado = 42`, y el `backtrace` indica que `sumar` fue llamada desde `main`.

Comprobación extra de por qué hace falta `-g`:

```bash
gcc -o hola_sing hola.c            # sin -g
gcc -g -o hola_cong hola.c         # con -g
ls -l hola_sing hola_cong          # el segundo pesa mas
readelf -S hola_cong | grep debug  # secciones .debug_*
readelf -S hola_sing | grep debug  # vacio
```

### 1.7.5 Guardar la evidencia

```bash
cd ~/pruebas
{
  echo "===== VERIFICACION DEL ENTORNO ====="
  echo "Fecha: $(date)"
  echo; echo "--- Fuente ---";                cat hola.c
  echo; echo "--- Makefile (^I = TAB) ---";   cat -A Makefile
  echo; echo "--- Etapa 1 ---"
  echo "hola.c: $(wc -l < hola.c) -> hola.i: $(wc -l < hola.i) lineas"
  echo; echo "--- Etapa 2: assembler ARM64 ---"; head -25 hola.s
  echo; echo "--- Etapa 3 ---";               file hola.o; nm hola.o
  echo; echo "--- Etapa 4 ---";               file hola; ldd hola
  echo; echo "--- Ejecucion ---";             ./hola
  echo; echo "--- Con/sin -g ---";            ls -l hola_sing hola_cong 2>/dev/null
} | tee ~/evidencias/02-verificacion-entorno.txt
```

**📸 EVIDENCIA (5 capturas):** ① `hola.c` ejecutándose · ② líneas `hola.c`→`hola.i` · ③ assembler ARM64 (señalá las instrucciones ARM) · ④ `make` diciendo *"is up to date"* · ⑤ GDB detenido mostrando `resultado = 42`

→ 📚 [§T3.1 las 4 etapas](#t31) · [§T3.2 cómo decide make](#t32) · [§T3.3 GDB y DWARF](#t33)

---

<a name="p8"></a>
## 1.8 — Descargar y verificar el fuente · **10 pts**

### ⛔ 🔧 CAMPO — Paso 0: fijar `$KVER` antes de nada

**Lo que pasó de verdad:** el manual decía `6.12.69`, pero para cuando se hizo la práctica kernel.org ya había rotado esa versión fuera del índice. La disponible era la **`6.12.102`**. Todos los `cd ~/kernel/linux-6.12.69` posteriores fallaban.

```bash
cd ~/kernel
# Qué 6.12.x existe HOY
curl -s https://cdn.kernel.org/pub/linux/kernel/v6.x/ \
  | grep -o 'linux-6\.12\.[0-9]*\.tar\.xz' | sort -uV | tail -5
```

Tomá la más alta de la lista y fijala **de forma persistente**:

```bash
echo 'export KVER=6.12.102' >> ~/.bashrc     # ← cambiá el número por el tuyo
source ~/.bashrc
echo "KVER = $KVER"
```

> **Anotá en el informe** qué versión usaste y por qué difiere de la del enunciado (si difiere): es una decisión técnica justificada, no un descuido.

### Descargar y verificar

```bash
cd ~/kernel
wget "https://cdn.kernel.org/pub/linux/kernel/v6.x/linux-${KVER}.tar.xz"
wget https://cdn.kernel.org/pub/linux/kernel/v6.x/sha256sums.asc

grep "linux-${KVER}.tar.xz\$" sha256sums.asc | sha256sum -c -
```

⛔ **Esperás `linux-<tu-versión>.tar.xz: OK`.** Si dice `FAILED`, la descarga se corrompió: `rm` y bajala de nuevo. **No descomprimas un tarball que falló el checksum** — vas a perder horas persiguiendo errores fantasma.

```bash
time tar -xf "linux-${KVER}.tar.xz"      # 1-3 min, son ~85,000 archivos
cd ~/kernel/linux-$KVER
pwd                                      # confirmá que el directorio existe
```

### Explorar la estructura

```bash
{
  echo "===== FUENTE DEL KERNEL ====="
  echo "Fecha: $(date)"
  echo "Version: $KVER"
  echo; echo "--- Checksum ---"
  (cd ~/kernel && grep "linux-${KVER}.tar.xz\$" sha256sums.asc | sha256sum -c -)
  echo; echo "--- Tamaño ---";        du -sh .
  echo; echo "--- Archivos ---";      find . -type f | wc -l
  echo; echo "--- Lineas C/H ---";    find . -name '*.c' -o -name '*.h' | xargs wc -l 2>/dev/null | tail -1
  echo; echo "--- Directorios ---";   ls -d */
  echo; echo "--- Arquitecturas ---"; ls arch/
  echo; echo "--- Makefile ---";      head -6 Makefile
} | tee ~/evidencias/03-fuente-kernel.txt
```

**📸 EVIDENCIA:** `sha256sum -c` con `OK` · `du -sh .` · conteo de líneas de código · **`ls arch/` mostrando que `arm64` existe junto a `x86`**

→ 📚 [§T2.2 — el árbol del kernel](#t22)

---

<a name="p9"></a>
## 1.9 — Inspeccionar los drivers críticos de la VM

> ⚠️ **Este paso no está en el README del curso y es el que evita el error más común.** Hacelo.

### El problema

[§1.10](#p10) (`localmodconfig`) **elimina del `.config` todo módulo que no esté cargado ahora**. Si eso incluye el driver de tu disco raíz, el kernel nuevo arranca, no encuentra el disco y muere con `VFS: Unable to mount root fs`.

Y **VMware no usa virtio** como QEMU/UTM:

| Función | QEMU / UTM | **VMware Fusion** |
|---|---|---|
| Disco | `virtio_blk` | `nvme` o `vmw_pvscsi` |
| Red | `virtio_net` | `vmxnet3` |
| Gráficos | `virtio_gpu` | `vmwgfx` |
| Memoria dinámica | `virtio_balloon` | `vmw_balloon` |
| Canal host↔guest | — | `vmw_vmci`, `vmw_vsock_vmci_transport` |

### No adivines: inspeccioná

```bash
echo "=== Que dispositivo es mi raiz ==="
findmnt /

echo "=== Arbol de bloques ==="
lsblk -o NAME,SIZE,TYPE,FSTYPE,MOUNTPOINT

echo "=== EL DATO CLAVE: driver de cada disco ==="
for d in /sys/block/*/device/driver; do
  [ -e "$d" ] && echo "$(echo $d | cut -d/ -f4)  ->  $(basename $(readlink -f $d))"
done

echo "=== Modulos VMware / disco / red cargados ==="
lsmod | grep -Ei 'vmw|vmx|nvme|pvscsi|e1000'

echo "=== Modulos que YA estan en el initramfs actual ==="
lsinitramfs /boot/initrd.img-$(uname -r) 2>/dev/null \
  | grep -Ei '\.ko' | grep -Ei 'nvme|vmw|vmx|pvscsi' | head -20

echo "=== Total de modulos cargados ==="
lsmod | tail -n +2 | wc -l
```

### ⛔ Anotá esto — lo necesitás en [§1.10](#p10) y en [PARTE 3](#parte-3)

| Pregunta | Tu respuesta |
|---|---|
| Dispositivo raíz (`findmnt /`) | `_______________` |
| **Driver del disco raíz** | `_______________` ← el que NO podés perder |
| Módulos VMware cargados | `_______________` |
| Total de módulos cargados | `_______________` |

```bash
{
  echo "===== DRIVERS CRITICOS DE LA VM ====="
  echo "Fecha: $(date)"
  echo; echo "--- Raiz ---";    findmnt /
  echo; echo "--- Bloques ---"; lsblk -o NAME,SIZE,TYPE,FSTYPE,MOUNTPOINT
  echo; echo "--- Driver por disco ---"
  for d in /sys/block/*/device/driver; do
    [ -e "$d" ] && echo "$(echo $d | cut -d/ -f4) -> $(basename $(readlink -f $d))"
  done
  echo; echo "--- Modulos VMware/disco/red ---"; lsmod | grep -Ei 'vmw|vmx|nvme|pvscsi|e1000'
  echo; echo "--- Total ---"; lsmod | tail -n +2 | wc -l
  echo; echo "--- lsmod completo ---"; lsmod
} | tee ~/evidencias/04-drivers-vm.txt
```

**📸 EVIDENCIA:** el bloque completo, sobre todo la línea del driver del disco raíz.

→ 📚 [§T4.4 qué es `/sys`](#t44) · [§T7.1 el initramfs](#t71)

---

<a name="p10"></a>
## 1.10 — Configurar el kernel · **10 pts**

### Copiar la configuración del sistema actual

⛔ 🔧 **CAMPO — este `cp` va PRIMERO, sí o sí.**

Si mirás el `.config` **antes** de copiar el de Debian, `CONFIG_SYSTEM_TRUSTED_KEYS` aparece **vacío** y no vas a ver por ningún lado el famoso `debian/canonical-certs.pem`. Vas a pensar que el problema de los certificados ([§1.11](#p11)) no te aplica — y sí te aplica, apenas copiés la config.

**Por qué:** el tarball de kernel.org no trae los certificados de Debian. La ruta `debian/canonical-certs.pem` **la mete la config de Debian**, no el fuente.

```bash
cd ~/kernel/linux-$KVER
cp -v /boot/config-$(uname -r) .config
wc -l .config
cp .config ~/evidencias/config-01-original.txt
```

**Recién ahora** tiene sentido mirar el estado de las firmas.

### Ejecutar `localmodconfig`

```bash
yes "" | make localmodconfig 2>&1 | tee ~/evidencias/log-localmodconfig.txt
```

> El `yes "" |` responde **Enter** (aceptar el default) a cualquier opción nueva. Como Debian 13 trae 6.12 y el fuente también es 6.12.x, deberían ser muy pocas o ninguna.

### ⛔ 🔧 CAMPO — nunca pegues comandos durante un `make *config` interactivo

**Lo que pasó:** se corrió `make oldconfig` **sin** el `yes "" |`. El comando entró en modo interactivo y quedó preguntando opción por opción. Al pegar el siguiente bloque de comandos del manual, el shell **no** lo ejecutó: se lo entregó a `oldconfig` como respuestas a las preguntas. Resultado literal en pantalla:

```text
nVidia Framebuffer Support (FB_NVIDIA) [N/m/y/?] (NEW) Ycd ~/kernel/linux-6.12.69
```

Ahí `FB_NVIDIA` quedó en `Y` y el resto del texto se comió como más respuestas. **El `.config` quedó corrupto.**

**Las tres reglas:**

| Regla | Comando |
|---|---|
| Preferí la variante **no interactiva** | `make olddefconfig` ← usa el default de todo, no pregunta nada |
| Si necesitás `oldconfig`, canalizalo | `yes "" \| make oldconfig` |
| Si igual caíste en el prompt | **Ctrl+C**, `cp ~/evidencias/config-01-original.txt .config`, y empezá de nuevo |

**Nunca pegues un bloque de varias líneas mientras haya un prompt esperando entrada.** Cada línea de tu bloque se convierte en una respuesta.

### ✅ VERIFICAR el resultado

```bash
echo "=== Modulos ANTES (config de Debian) ==="
grep -c '=m$' ~/evidencias/config-01-original.txt

echo "=== Modulos DESPUES de localmodconfig ==="
grep -c '=m$' .config

echo "=== Built-in (=y) ==="
grep -c '=y$' .config

echo "=== CRITICO: el driver de tu disco raiz sigue presente? ==="
grep -iE 'CONFIG_BLK_DEV_NVME|CONFIG_NVME_CORE|CONFIG_SCSI_VMW_PVSCSI' .config

echo "=== Los drivers de VMware siguen presentes? ==="
grep -iE 'CONFIG_VMWARE|CONFIG_VMXNET3|CONFIG_DRM_VMWGFX|CONFIG_VMWARE_BALLOON|CONFIG_VMWARE_VMCI' .config

echo "=== El filesystem de tu raiz sigue presente? ==="
grep -E 'CONFIG_EXT4_FS=|CONFIG_EXT4_FS_' .config
```

### ⛔ Regla de oro antes de seguir

**El driver que anotaste en [§1.9](#p9) tiene que aparecer como `=y` o `=m`.**

Si aparece como `# CONFIG_... is not set`, **parate acá** y forzalo:

```bash
# Segun el driver que anotaste:
scripts/config --module BLK_DEV_NVME       # si tu disco es nvme
scripts/config --enable  NVME_CORE
scripts/config --module  SCSI_VMW_PVSCSI   # si tu disco es vmw_pvscsi

# Red y guest tools de VMware:
scripts/config --module VMXNET3
scripts/config --module VMWARE_BALLOON
scripts/config --module VMWARE_VMCI
scripts/config --module VMWARE_VMCI_VSOCKETS

# El filesystem de tu raiz:
scripts/config --enable EXT4_FS

make olddefconfig
```

Y volvé a verificar.

```bash
cp .config ~/evidencias/config-02-localmodconfig.txt
```

**📸 EVIDENCIA:** `make localmodconfig` corriendo, y la **comparación de conteos `=m` antes vs. después** — es un dato cuantitativo concreto para el informe.

→ 📚 [§T4.1 qué es `.config`](#t41) · [§T4.2 qué hace `localmodconfig`](#t42)

---

<a name="p11"></a>
## 1.11 — Neutralizar la verificación de firmas de módulos

> 🎯 **Requisito obligatorio del enunciado.** El README del curso solo cubre la mitad.
>
> 🔧 **CAMPO — esta sección se reescribió entera.** El objetivo real **no** es poner `CONFIG_MODULE_SIG` en *not set*: en Debian 13 arm64 **eso es imposible**. El objetivo es que el build no muera buscando certificados que no existen. Abajo está por qué y cómo.

### Ver el estado actual

> ⚠️ Este `grep` solo tiene sentido **después** de haber copiado `/boot/config-$(uname -r)` en [§1.10](#p10). Si lo corrés sobre un `.config` recién salido del tarball, `SYSTEM_TRUSTED_KEYS` sale vacío y parece que no hay problema.

```bash
cd ~/kernel/linux-$KVER
echo "=== ANTES ==="
grep -E 'CONFIG_MODULE_SIG|CONFIG_SYSTEM_TRUSTED_KEYS|CONFIG_SYSTEM_REVOCATION' .config
```

Vas a ver algo así:

```
CONFIG_MODULE_SIG=y
CONFIG_MODULE_SIG_ALL=y
CONFIG_SYSTEM_TRUSTED_KEYS="debian/canonical-certs.pem"
CONFIG_SYSTEM_REVOCATION_KEYS="debian/canonical-revoked-certs.pem"
```

⚠️ **Ese `debian/canonical-certs.pem` es el error #1 de la práctica.** Existe en el árbol de packaging de Debian, no en el tarball de kernel.org. Si compilás así, a los ~40 minutos el build muere.

### ⛔ 🔧 CAMPO — por qué NO podés desactivar `MODULE_SIG` (y no hace falta)

**Lo que pasó de verdad:**

```bash
scripts/config --disable MODULE_SIG
make olddefconfig
grep MODULE_SIG .config      # → CONFIG_MODULE_SIG=y   ... otra vez
```

`olddefconfig` lo **vuelve a encender**, a veces cambiando de paso el algoritmo (SHA256 → SHA1, RSA → ECDSA). En Debian 13 arm64 `MODULE_SIG` está marcado como **obligatorio** — en `make menuconfig` aparece como `-*-` en vez de `[ ]`, y la barra espaciadora no hace nada — porque lo fuerza `SYSTEM_TRUSTED_KEYRING` / el perfil de *lockdown* del kernel.

**Los dos intentos que NO funcionan** (no pierdas tiempo con ellos):

| Intento | Qué pasa |
|---|---|
| `sed -i` para borrar las líneas del `.config` | El archivo queda inconsistente y `make` te vuelve a preguntar al compilar |
| `scripts/config --disable MODULE_SIG` + `olddefconfig` | Loop infinito: se reactiva en cada `olddefconfig` |
| Desmarcarlo en `make menuconfig` | Aparece `-*-` (forzado), la barra espaciadora no responde |

**Lo que sí resuelve el problema.** No hay que apagar el mecanismo: hay que **quitarle los certificados que no existen y sacarle la obligatoriedad**.

### La secuencia que funciona

```bash
cd ~/kernel/linux-$KVER

# (a) Vaciar las rutas a llaveros que no existen  ← esto es lo que evita el error #1
scripts/config --set-str SYSTEM_TRUSTED_KEYS ""
scripts/config --set-str SYSTEM_REVOCATION_KEYS ""

# (b) Que la firma no sea obligatoria ni se aplique a todos los módulos
scripts/config --disable MODULE_SIG_ALL
scripts/config --disable MODULE_SIG_FORCE

# (c) Lista de revocacion
scripts/config --disable SYSTEM_REVOCATION_LIST

# (d) IMPRESCINDIBLE
make olddefconfig
```

> **Nota:** ya **no** aparece `scripts/config --disable MODULE_SIG`. Si lo dejás, entrás en el loop de arriba.

⛔ **El `make olddefconfig` no es opcional.** `scripts/config` edita el archivo como texto: no entiende dependencias entre opciones. `make olddefconfig` recorre el árbol Kconfig, apaga las opciones huérfanas y rellena las nuevas con su default. Sin esto el `.config` queda inconsistente y el build falla de formas confusas.

### ✅ VERIFICAR

> 🔧 **CAMPO — el `grep` del manual anterior estaba mal.** `grep -E '^CONFIG_MODULE_SIG='` **nunca** encuentra una opción desactivada, porque la línea real es `# CONFIG_MODULE_SIG is not set` y empieza con `#`. Da falsos negativos y te hace creer que algo salió mal.

```bash
echo "=== DESPUES ==="
grep -E 'CONFIG_SYSTEM_TRUSTED_KEYS|CONFIG_MODULE_SIG_FORCE|CONFIG_MODULE_SIG_ALL' .config
echo "--- panorama completo (incluye las lineas comentadas) ---"
grep -E 'CONFIG_MODULE_SIG[^_]|CONFIG_SYSTEM_TRUSTED_KEYS|CONFIG_SYSTEM_REVOCATION' .config
cp .config ~/evidencias/config-03-sin-firmas.txt
```

**Esperás — estas tres líneas son la condición de éxito:**

```text
CONFIG_SYSTEM_TRUSTED_KEYS=""
# CONFIG_MODULE_SIG_FORCE is not set
# CONFIG_MODULE_SIG_ALL is not set
```

| Línea | Veredicto |
|---|---|
| `CONFIG_SYSTEM_TRUSTED_KEYS=""` | ✅ **obligatorio** — sin esto el build muere a los 40 min |
| `# CONFIG_MODULE_SIG_FORCE is not set` | ✅ **obligatorio** |
| `# CONFIG_MODULE_SIG_ALL is not set` | ✅ **obligatorio** |
| `CONFIG_MODULE_SIG=y` | ✅ **aceptable en Debian 13 arm64** — no lo pelees |

> **Por qué `CONFIG_MODULE_SIG=y` no rompe nada:** con `FORCE` y `ALL` apagados y las rutas de certificados vacías, el kernel **genera su propia clave local** (`certs/signing_key.pem`) durante el build, firma con ella lo que quiera firmar, y **no exige** que los módulos vengan firmados para cargarlos. El mecanismo existe pero no bloquea nada.

⛔ **Si todavía ves `debian/canonical-certs.pem` en cualquier línea, NO compiles.** Repetí el bloque de arriba.

### Para el informe

Esto es material de primera para la sección de errores: documentá que el requisito *"desactivar la verificación de firmas"* **no se cumple literalmente** en Debian 13 arm64 porque `MODULE_SIG` está forzado por el Kconfig, y que se cumplió **funcionalmente** vaciando los llaveros y quitando `FORCE`/`ALL`. Explicá la diferencia entre *"el mecanismo está compilado"* y *"el mecanismo bloquea la carga de módulos"*.

**📸 EVIDENCIA:** tres capturas — ① el `grep` **antes** (con `debian/canonical-certs.pem`) · ② el `grep` **después** (con `""` y los dos `is not set`) · ③ `make menuconfig` mostrando `MODULE_SIG` como `-*-` (la prueba visual de que está forzado).

→ 📚 [§T6 — firmas de módulos y Secure Boot](#t6)

---

<a name="p12"></a>
## 1.12 — Reducir el peso del build *(recomendado)*

> Opcional pero muy recomendado: baja el build de **~30 GB a ~4 GB** y recorta el tiempo **25–40 %**.

```bash
cd ~/kernel/linux-$KVER
scripts/config --disable DEBUG_INFO
scripts/config --enable  DEBUG_INFO_NONE
scripts/config --disable DEBUG_INFO_DWARF4
scripts/config --disable DEBUG_INFO_DWARF5
scripts/config --disable DEBUG_INFO_BTF
scripts/config --disable DEBUG_INFO_REDUCED
scripts/config --disable GDB_SCRIPTS
make olddefconfig
```

**✅ VERIFICAR:**

```bash
grep -E 'CONFIG_DEBUG_INFO' .config | head -10
cp .config ~/evidencias/config-04-final.txt
```

Esperás `CONFIG_DEBUG_INFO_NONE=y` y `# CONFIG_DEBUG_INFO is not set`.

> **Es seguro para esta tarea:** la rúbrica pide GDB verificado sobre un **programa de usuario** ([§1.7.4](#p7)), no depuración del kernel. Los símbolos del kernel siguen disponibles vía `System.map`, así que un panic sigue siendo legible.
>
> **Si querés conservar la capacidad de depurar el kernel**, saltate este paso — pero necesitás **≥ 45 GB libres** y 30–50 % más de tiempo.

### Resumen de la configuración final

```bash
{
  echo "===== CONFIGURACION FINAL ====="
  echo "Fecha: $(date)"
  echo; echo "--- Conteo ---"
  echo "Total de lineas:  $(wc -l < .config)"
  echo "Built-in (=y):    $(grep -c '=y$' .config)"
  echo "Modulos (=m):     $(grep -c '=m$' .config)"
  echo "Desactivadas:     $(grep -c 'is not set' .config)"
  echo; echo "--- Evolucion de modulos (=m) ---"
  echo "01 config de Debian:      $(grep -c '=m$' ~/evidencias/config-01-original.txt)"
  echo "02 tras localmodconfig:   $(grep -c '=m$' ~/evidencias/config-02-localmodconfig.txt)"
  echo "04 configuracion final:   $(grep -c '=m$' .config)"
  echo; echo "--- Firmas ---"
  grep -E 'CONFIG_MODULE_SIG|CONFIG_SYSTEM_TRUSTED_KEYS|CONFIG_SYSTEM_REVOCATION' .config
  echo; echo "--- Debug info ---"; grep -E 'CONFIG_DEBUG_INFO' .config | head -8
  echo; echo "--- Drivers criticos ---"
  grep -iE 'CONFIG_BLK_DEV_NVME|CONFIG_NVME_CORE|CONFIG_SCSI_VMW_PVSCSI|CONFIG_VMXNET3|CONFIG_VMWARE|CONFIG_EXT4_FS=' .config
} | tee ~/evidencias/05-config-final.txt
```

**📸 EVIDENCIA:** la tabla de evolución de módulos.

→ 📚 [§T3.4 — el trade-off de DEBUG_INFO](#t34)

---

<a name="p13"></a>
## 1.13 — `EXTRAVERSION` con tu nombre y carné · **30 pts**

> El ítem individual de mayor peso junto a documentación.

### Estado actual

```bash
cd ~/kernel/linux-$KVER
head -8 Makefile
```

```make
VERSION = 6
PATCHLEVEL = 12
SUBLEVEL = 102          # ← el que corresponda a tu $KVER
EXTRAVERSION =
NAME = Baby Opossum Posse
```

> ✅ **Chequeo rápido:** `VERSION.PATCHLEVEL.SUBLEVEL` tiene que coincidir con tu `$KVER`. Si no coincide, estás parado en el directorio equivocado.

### Primero: limpiar `LOCALVERSION`

> ⚠️ No está en el README, y sin esto tu string de versión sale contaminado con `-arm64`.

```bash
scripts/config --set-str LOCALVERSION ""
scripts/config --disable LOCALVERSION_AUTO
make olddefconfig
grep 'CONFIG_LOCALVERSION' .config
```

Esperás `CONFIG_LOCALVERSION=""` y `# CONFIG_LOCALVERSION_AUTO is not set`.

### Editar `EXTRAVERSION`

```bash
nano Makefile
```

Línea 5, de `EXTRAVERSION =` a (con **tus** datos):

```make
EXTRAVERSION = -jbarrera-202012345
```

Ctrl+O → Enter → Ctrl+X.

### ⛔ Reglas obligatorias del valor

| Regla | Por qué |
|---|---|
| Empieza con **guion** `-` | Se concatena directo a `$KVER` (ej. `6.12.102`) |
| **Sin espacios** | Forma parte de nombres de archivo y rutas |
| Solo `a-z`, `0-9`, `-`, `.`, `_` | Sin tildes, sin `ñ`, sin `/` |
| Corto (< 30 caracteres) | Rutas muy largas dan problemas |

✅ `-jbarrera-202012345` · `-julian.barrera-201931045`
❌ `-Julian Barrera 202012345` (espacios) · `-josé-123` (tilde) · `jbarrera` (sin guion)

### ⛔ VERIFICAR — el comando que te salva de recompilar en vano

```bash
head -8 Makefile
echo "======================================"
make -s kernelrelease
echo "======================================"
```

**`make kernelrelease` imprime exactamente el string que va a quedar dentro del binario y que va a devolver `uname -r`.** Tiene que salir:

```
6.12.102-jbarrera-202012345
```

⛔ **No pases a [§1.14](#p14) hasta que esto muestre tu nombre y carné.** Si te equivocás acá, lo descubrís después de 90 minutos de compilación.

| Problema | Causa | Solución |
|---|---|---|
| Aparece un `+` al final | `LOCALVERSION_AUTO` activo | Repetí "limpiar LOCALVERSION" |
| Aparece `-arm64` al final | `CONFIG_LOCALVERSION` no quedó vacío | Repetí "limpiar LOCALVERSION" |

### 🔧 CAMPO — guardá el `KERNELRELEASE` en un archivo (y sabé regenerarlo)

El manual usa `~/evidencias/kernel-release.txt` en [§1.14](#p14), [§1.15](#p15) y [§1.16](#p16). **Crealo acá:**

```bash
make -s kernelrelease > ~/evidencias/kernel-release.txt
cat ~/evidencias/kernel-release.txt
```

**Si en un paso posterior te sale `cat: ~/evidencias/kernel-release.txt: No such file or directory`** — porque te saltaste este paso, reiniciaste la terminal o restauraste un snapshot — **no lo busques: regeneralo.** El valor sale del Makefile, no de ningún estado guardado:

```bash
cd ~/kernel/linux-$KVER
KREL=$(make -s kernelrelease)
echo "$KREL" > ~/evidencias/kernel-release.txt
echo "$KREL"
```

> Regla práctica: cada vez que abras una terminal nueva y vayas a usar `$KREL`, corré `KREL=$(make -s kernelrelease)` desde el directorio del fuente. Es instantáneo y siempre da el valor correcto.

### 📸 SNAPSHOT

**Take Snapshot** → **`02-antes-de-compilar`**

```bash
{
  echo "===== EXTRAVERSION ====="
  echo "Fecha: $(date)"
  echo; echo "--- Makefile ---";         head -8 Makefile
  echo; echo "--- LOCALVERSION ---";     grep 'CONFIG_LOCALVERSION' .config
  echo; echo "--- STRING FINAL ---";     make -s kernelrelease
} | tee ~/evidencias/06-extraversion.txt
```

**📸 EVIDENCIA (obligatoria, 30 pts):** ① `head -8 Makefile` con tu `EXTRAVERSION` · ② **`make -s kernelrelease`** mostrando tu nombre · ③ `grep CONFIG_LOCALVERSION .config`

→ 📚 [§T5 — de una línea del Makefile a `uname -r`](#t5)

---

<a name="p14"></a>
## 1.14 — Compilar · **20 pts**

### Chequeo previo — 30 segundos que te ahorran 2 horas

```bash
cd ~/kernel/linux-$KVER
echo "=== 1. Espacio libre ==="; df -h ~ .
echo "=== 2. Nucleos ==="; nproc
echo "=== 3. RAM ==="; free -h
echo "=== 4. Version a compilar ==="; make -s kernelrelease
echo "=== 5. Certificados (NO debe aparecer canonical-certs) ==="
grep -E 'CONFIG_SYSTEM_TRUSTED_KEYS|CONFIG_MODULE_SIG_FORCE|CONFIG_MODULE_SIG_ALL' .config
echo "=== 6. pahole ==="; which pahole && pahole --version
```

> 🔧 **CAMPO:** el chequeo 5 cambió. Antes usaba `CONFIG_MODULE_SIG=`, que **no encuentra** la línea cuando la opción está desactivada (`# CONFIG_MODULE_SIG is not set` empieza con `#`). Y en Debian 13 arm64 `CONFIG_MODULE_SIG=y` es lo normal → [§1.11](#p11).

| # | Chequeo | Esperado |
|---|---|---|
| 1 | Espacio libre | **≥ 15 GB** (≥ 40 GB si NO hiciste [§1.12](#p12)) |
| 2 | `nproc` | Los núcleos que asignaste en Fusion |
| 3 | RAM libre | ≥ 8 GB |
| 4 | `make kernelrelease` | **Tu nombre y carné** |
| 5 | `SYSTEM_TRUSTED_KEYS` | `""` · `MODULE_SIG_FORCE` y `MODULE_SIG_ALL` en *not set*. **`CONFIG_MODULE_SIG=y` es aceptable** |
| 6 | `pahole` | Presente (o BTF desactivado en [§1.12](#p12)) |

⛔ **Si alguno falla, resolvelo antes de compilar.**

### Compilar

```bash
KREL=$(make -s kernelrelease)
echo "Compilando: $KREL"
echo "$KREL" > ~/evidencias/kernel-release.txt

time ( fakeroot make -j$(nproc) 2>&1 | tee ~/evidencias/log-compilacion.txt )
```

**Qué esperar:**
- Miles de líneas `CC drivers/net/...`, `LD kernel/built-in.a`, `AR ...`
- **Warnings son normales** — el kernel genera cientos. Solo importan los **errors**.
- Las últimas líneas exitosas: `LD vmlinux` → `SORTTAB` → `OBJCOPY arch/arm64/boot/Image` → `GZIP arch/arm64/boot/Image.gz`
- `time` te da **real** (reloj), **user** (CPU en usuario), **sys** (CPU en kernel). **Anotá los tres.**

### 🔧 CAMPO — `libfakeroot internal error: payload not recognized!`

En la corrida real apareció, varias veces, esto en medio del build:

```text
libfakeroot internal error: payload not recognized!
```

**No es un error tuyo y el build NO se detiene.** Es un bug conocido de `libfakeroot` en Debian 13 **arm64** cuando intercepta ciertas syscalls durante el linkado de `vmlinux`.

| Situación | Qué hacer |
|---|---|
| Después del mensaje siguen apareciendo líneas `CC`, `LD`, `AR`, `BTF` | **Ignoralo.** Seguí esperando. |
| El build se cuelga o muere ahí | Recompilá **sin** `fakeroot` (abajo) |

Alternativa sin `fakeroot` — funciona igual, solo hay que usar `sudo` en la instalación:

```bash
# Compilación (sin fakeroot)
time ( make -j$(nproc) 2>&1 | tee ~/evidencias/log-compilacion.txt )

# Instalación con sudo (§1.15)
sudo make modules_install
sudo make install
```

> 📸 **Capturá el mensaje** y su diagnóstico: es exactamente el tipo de error que la rúbrica quiere ver documentado (mensaje literal → causa → decisión tomada → resultado).

> 💡 **Mientras compila,** en otra terminal:
> ```bash
> watch -n 2 'nproc; uptime; free -h; df -h / | tail -1'
> # o:  sudo apt install -y htop && htop
> ```
> Vas a ver los N núcleos al 100 % — buena captura para el informe.

> ⚠️ **No cierres la ventana ni suspendas el Mac.** Para dejarlo desatendido: `caffeinate -dims` en una terminal de macOS.

### ✅ VERIFICAR que el build terminó bien

```bash
echo "=== 1. Errores en el log ==="
grep -iE '^\s*(Error|make.*\*\*\*)' ~/evidencias/log-compilacion.txt | head -20
echo "(sin salida = sin errores)"

echo "=== 2. Ultimas 25 lineas ==="
tail -25 ~/evidencias/log-compilacion.txt

echo "=== 3. Los binarios existen? ==="
ls -lh vmlinux arch/arm64/boot/Image arch/arm64/boot/Image.gz

echo "=== 4. La version quedo grabada en el binario? ==="
cat include/config/kernel.release
strings vmlinux | grep -m3 "$(make -s kernelrelease)"

echo "=== 5. Modulos construidos ==="
find . -name '*.ko' | wc -l

echo "=== 6. Tamaño del build ==="
du -sh .; df -h ~
```

| Chequeo | Esperado |
|---|---|
| Errores en el log | **ninguno** |
| `arch/arm64/boot/Image.gz` | existe, ~15–25 MB |
| `cat include/config/kernel.release` | **tu nombre y carné** |
| `strings vmlinux \| grep <tu versión>` | lo encuentra ← **prueba de que quedó dentro del binario** |

> ⚠️ **Para el informe:** el README del curso menciona `arch/x86/boot/bzImage`. En ARM64 el binario es **`arch/arm64/boot/Image.gz`**, porque `arch/arm64/Makefile` define `KBUILD_IMAGE := $(boot)/Image.gz`. Documentá esa diferencia.

```bash
{
  echo "===== RESULTADO DE LA COMPILACION ====="
  echo "Fecha: $(date)"
  echo; echo "--- Version ---";      cat include/config/kernel.release
  echo; echo "--- Binarios ---";     ls -lh vmlinux arch/arm64/boot/Image arch/arm64/boot/Image.gz
  echo; echo "--- Modulos ---";      find . -name '*.ko' | wc -l
  echo; echo "--- Tamaño ---";       du -sh .
  echo; echo "--- Version en el binario ---"
  strings vmlinux | grep -m3 "$(make -s kernelrelease)"
  echo; echo "--- Ultimas 25 lineas del log ---"; tail -25 ~/evidencias/log-compilacion.txt
} | tee ~/evidencias/07-compilacion.txt
```

**📸 EVIDENCIA (20 pts):** ① la compilación arrancando · ② `htop` con núcleos al 100 % · ③ últimas líneas (`GZIP Image.gz`) · ④ **salida de `time`** · ⑤ `ls -lh Image.gz` · ⑥ **`strings vmlinux | grep <tu-versión>`**

→ 📚 [§T8 — paralelismo y ley de Amdahl](#t8)

---

<a name="p15"></a>
## 1.15 — Instalar módulos y kernel

### 📸 SNAPSHOT — el más importante de los tres

**Take Snapshot** → **`03-antes-de-instalar`**

> Este paso modifica `/boot` y GRUB. Es el único de todo el manual que puede dejar la VM sin arrancar.

### Instalar los módulos

```bash
cd ~/kernel/linux-$KVER
sudo make modules_install 2>&1 | tee ~/evidencias/log-modules-install.txt
```

**✅ VERIFICAR:**

> 🔧 **CAMPO — `$KREL` a prueba de terminales nuevas.** No hagas `cat ~/evidencias/kernel-release.txt` a secas: si el archivo no existe (te saltaste [§1.13](#p13), reiniciaste la shell o restauraste un snapshot) el comando falla y todos los `ls` posteriores quedan con `$KREL` vacío. Usá esta línea, que lo regenera si hace falta:

```bash
cd ~/kernel/linux-$KVER
KREL=$(make -s kernelrelease); echo "$KREL" > ~/evidencias/kernel-release.txt
echo "KREL = $KREL"
```

```bash
ls -d /lib/modules/$KREL
du -sh /lib/modules/$KREL
ls /lib/modules/$KREL/ | head
find /lib/modules/$KREL -name '*.ko*' | wc -l
```

Esperás que el directorio exista y contenga `kernel/`, `modules.dep`, `modules.order`, `modules.alias` y `.ko.zst`.

### Instalar el kernel

```bash
sudo make install 2>&1 | tee ~/evidencias/log-make-install.txt
```

### ⛔ 🔧 CAMPO — en arm64 el kernel se llama `vmlinux`, no `vmlinuz`

El manual original verificaba con `ls -lh /boot/vmlinuz-$KREL`. En la corrida real eso dio **`No such file or directory`** y pareció que `make install` había fallado. No falló: en **arm64** el archivo instalado es

```text
/boot/vmlinux-6.12.102-jbarrera-202012345
```

**sin la `z`**. La `z` de `vmlinuz` viene de *zipped*; en x86 `make install` copia el `bzImage` comprimido, en arm64 copia la imagen con otro nombre.

**Regla:** nunca escribas `vmlinuz-` a mano. Usá el comodín `vmlinu?-`, que agarra las dos formas.

### ✅ VERIFICAR — los cuatro archivos en `/boot`

```bash
ls -lh /boot/                                  # el panorama completo, primero
ls -lh /boot/vmlinu?-$KREL /boot/initrd.img-$KREL \
       /boot/System.map-$KREL /boot/config-$KREL
df -h /boot
```

**Los cuatro tienen que existir:**

| Archivo | Qué es | Tamaño típico |
|---|---|---|
| `vmlinux-<ver>` (arm64) / `vmlinuz-<ver>` (x86) | El kernel booteable | 15–40 MB |
| `initrd.img-<ver>` | El initramfs con los módulos de arranque | 30–90 MB · 🔧 **en la corrida real: 532 MB** |
| `System.map-<ver>` | Tabla de símbolos (nombre ↔ dirección) | 3–8 MB |
| `config-<ver>` | Copia del `.config` usado | ~250 KB |

> 🔧 **CAMPO — un initramfs de medio giga es normal, no un error.** En la compilación real `initrd.img` pesó **532 MB** porque incluye *todos* los módulos construidos, firmwares y herramientas de rescate. **No bloquea el arranque.** Solo importa si `/boot` se te llena; en ese caso, y solo entonces, editá `/etc/initramfs-tools/initramfs.conf` y poné `MODULES=dep` en vez de `MODULES=most`, después `sudo update-initramfs -c -k "$KREL"`. Está fuera del alcance de la tarea.

⛔ **Si falta el `initrd.img`, generalo antes de reiniciar:**

```bash
sudo update-initramfs -c -k "$KREL"
ls -lh /boot/initrd.img-$KREL
```

**Sin initramfs el kernel no puede cargar el driver del disco y bootea a un panic.**

Si `/boot` se llenó → [§E1.4](#e1)

```bash
{
  echo "===== INSTALACION ====="
  echo "Fecha: $(date)"
  echo "Version instalada: $KREL"
  echo; echo "--- /boot ---"; ls -lh /boot/
  echo; echo "--- Mis 4 archivos ---"
  ls -lh /boot/vmlinu?-$KREL /boot/initrd.img-$KREL /boot/System.map-$KREL /boot/config-$KREL
  echo; echo "--- Modulos ---"; ls -d /lib/modules/$KREL; du -sh /lib/modules/$KREL
  echo; echo "--- .ko instalados ---"; find /lib/modules/$KREL -name '*.ko*' | wc -l
  echo; echo "--- Espacio ---"; df -h / /boot
} | tee ~/evidencias/08-instalacion.txt
```

> ⚠️ Este bloque usa el `$KREL` que definiste arriba en **esta misma terminal**. Si abriste una nueva, volvé a correr `KREL=$(make -s kernelrelease)` desde `~/kernel/linux-$KVER`.

**📸 EVIDENCIA:** `ls -lh /boot/` mostrando **los cuatro archivos con tu nombre en el nombre del archivo** (y notá el `vmlinux` sin `z` — comentalo en el informe), y `ls -d /lib/modules/<tu-versión>`.

→ 📚 [§T7.2 qué hace `make install`](#t72) · [§T7.3 qué hace `modules_install`](#t73)

---

<a name="p16"></a>
## 1.16 — Configurar GRUB y reiniciar

### Garantizar que el menú aparezca

> La rúbrica pide captura del menú de GRUB. Por defecto Debian lo muestra 5 segundos; vamos a forzarlo a 20.

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

> **`GRUB_CMDLINE_LINUX_DEFAULT=""`** (quitando `quiet splash`) hace que veas **todos los mensajes de arranque del kernel**. Mejor evidencia, y si algo falla ves dónde.

```bash
sudo update-grub 2>&1 | tee ~/evidencias/log-update-grub.txt
```

### ✅ VERIFICAR que tu kernel está en el menú

```bash
cd ~/kernel/linux-$KVER
KREL=$(make -s kernelrelease)
sudo grep -E "^\s*menuentry|^\s*submenu" /boot/grub/grub.cfg | sed 's/{$//'
sudo grep -c "$KREL" /boot/grub/grub.cfg          # debe ser > 0
sudo grep -A2 "vmlinu.-$KREL" /boot/grub/grub.cfg | head -12
```

⛔ **Si tu versión NO aparece en `grub.cfg`, NO reinicies.** Corré `sudo update-grub` otra vez y buscá en su salida `Found linux image: /boot/vmlinux-<tu-versión>` (🔧 en arm64 dice **`vmlinux`**, sin `z`).

### Reiniciar

```bash
sync
sudo reboot
```

### ⛔ 🔧 CAMPO — reiniciar NO instala tu kernel: hay que ELEGIRLO

**Lo que pasó de verdad.** Se corrió `sudo reboot`, el sistema levantó normal, y:

```bash
uname -r
# 6.12.101+deb13-arm64        ← el kernel VIEJO de Debian
```

Parecía que las 90 minutos de compilación no habían servido. **Habían servido perfectamente.** El problema es que **GRUB arranca la primera entrada de la lista por defecto**, y esa es el kernel empaquetado de Debian. El tuyo vive dentro del submenú *Advanced options*, y hay que ir a buscarlo **en cada arranque**.

**El procedimiento, paso a paso:**

1. Apenas la VM empiece a arrancar, apretá **ESC** repetidamente.
   - **UEFI / arm64 (tu caso, VMware Fusion en Mac): ESC.**
   - x86 con BIOS: SHIFT. *(El manual anterior solo mencionaba SHIFT — por eso no aparecía el menú.)*
2. 📸 **Captura del menú principal de GRUB** (en macOS: `Cmd+Shift+4`).
3. Bajá a **"Advanced options for Debian GNU/Linux"** → Enter.
4. 📸 **Captura de la lista de kernels** — acá se ven **ambos**: el de Debian y **el tuyo con tu nombre**. Una de las mejores capturas del informe.
5. Seleccioná **tu kernel** (`<KVER>-tunombre-tucarne`) → Enter.
6. Ya adentro, confirmá:
   ```bash
   uname -r
   # 6.12.102-jbarrera-202012345   ← ahora sí
   ```

> **Si `uname -r` te muestra el kernel viejo, no rehagas nada.** Reiniciá y elegí bien en GRUB. Es un error de selección de arranque, no de compilación.

**¿Y si querés que arranque solo con el tuyo?** Se puede fijar como default, pero **no lo hagas antes de comprobar que arranca**: si tu kernel falla y GRUB lo tiene por default, te quedás sin sistema usable.

```bash
# SOLO después de haber booteado tu kernel con éxito al menos una vez
KREL=$(uname -r)
sudo grub-set-default "gnulinux-advanced-$(findmnt -no UUID /)>gnulinux-$KREL-advanced-$(findmnt -no UUID /)"
sudo update-grub
```

**Si el kernel nuevo no arranca** → [§E2](#e2). Tenés el kernel de Debian intacto en *Advanced options*: **nunca lo borres.**

→ 📚 [§T7.4 — GRUB y por qué el kernel viejo sigue ahí](#t74)

---

<a name="p17"></a>
## 1.17 — Verificación final

> ⛔ **Antes de correr nada:** confirmá que arrancaste **tu** kernel y no el de Debian. Si `uname -r` no tiene tu nombre, volvé a [§1.16](#p16) y elegí bien en GRUB.

```bash
echo "=== uname -r  (LA PRUEBA CENTRAL DE LA TAREA) ==="
uname -r
echo; echo "=== uname -a ==="
uname -a
echo; echo "=== /proc/version ==="
cat /proc/version
echo; echo "=== Arquitectura ==="; uname -m
echo; echo "=== Modulos cargados ==="; lsmod | tail -n +2 | wc -l; lsmod | head -15
echo; echo "=== Estado de las firmas de modulos ==="
grep -E 'CONFIG_MODULE_SIG|CONFIG_SYSTEM_TRUSTED_KEYS' /boot/config-$(uname -r)
echo; echo "=== Drivers criticos funcionando ==="
findmnt /; ip -brief addr show; lsmod | grep -Ei 'vmw|vmx|nvme|pvscsi'
echo; echo "=== Ruta de modulos ==="; ls -d /lib/modules/$(uname -r)
echo; echo "=== Kernels en /boot ==="; ls /boot/vmlinu?-*
echo; echo "=== Errores criticos de arranque ==="
sudo dmesg --level=err,crit,alert,emerg | head -20
echo; echo "=== Uptime ==="; uptime
```

### ✅ La condición de éxito de toda la tarea

| Chequeo | Esperado |
|---|---|
| **`uname -r`** | **`<KVER>-tunombre-tucarne`** (ej. `6.12.102-jbarrera-202012345`) ← esto es lo que califican |
| `uname -m` | `aarch64` |
| `/proc/version` | Tu versión + fecha de compilación + versión de GCC |
| 🔧 `CONFIG_MODULE_SIG_FORCE` y `_ALL` en `/boot/config-$(uname -r)` | `is not set` |
| 🔧 `CONFIG_SYSTEM_TRUSTED_KEYS` | `""` |
| 🔧 `CONFIG_MODULE_SIG` | `=y` **es aceptable** en Debian 13 arm64 → [§1.11](#p11) |
| `findmnt /` | Tu raíz montada |
| `ip -brief addr` | Interfaz con IP |
| `/lib/modules/$(uname -r)` | Existe |
| `dmesg --level=err` | Pocas o ninguna línea |

> 🔧 **CAMPO:** el manual anterior pedía `CONFIG_MODULE_SIG` en *is not set* como condición de éxito. **Eso no se puede lograr en Debian 13 arm64** y hacía parecer que la tarea estaba mal hecha. El criterio real es el de las tres filas marcadas arriba.

**📸 EVIDENCIA — la captura más importante del trabajo:** una sola imagen con `uname -r` y `uname -a` juntos, mostrando tu nombre y carné. **Va en la portada del informe.**

```bash
{
  echo "###   VERIFICACION FINAL - TAREA 3 SO2   ###"
  echo "###   Fecha: $(date)"
  echo; echo "=== uname -r ==="; uname -r
  echo; echo "=== uname -a ==="; uname -a
  echo; echo "=== /proc/version ==="; cat /proc/version
  echo; echo "=== Arquitectura ==="; uname -m
  echo; echo "=== Modulos cargados ==="; lsmod | tail -n +2 | wc -l
  echo; echo "=== Firmas ==="
  grep -E 'CONFIG_MODULE_SIG|CONFIG_SYSTEM_TRUSTED_KEYS' /boot/config-$(uname -r)
  echo; echo "=== Raiz ==="; findmnt /
  echo; echo "=== Red ==="; ip -brief addr show
  echo; echo "=== Modulos VMware ==="; lsmod | grep -Ei 'vmw|vmx|nvme|pvscsi'
  echo; echo "=== Ruta de modulos ==="; ls -d /lib/modules/$(uname -r)
  echo; echo "=== Kernels en /boot ==="; ls /boot/vmlinu?-*
  echo; echo "=== Errores de arranque ==="; sudo dmesg --level=err,crit 2>/dev/null | head -20
} | tee ~/evidencias/09-verificacion-final.txt
```

### 📸 SNAPSHOT final

**Take Snapshot** → **`04-kernel-funcionando`**

### Sacar las evidencias hacia macOS

```bash
cd ~
tar czf evidencias-tarea3.tar.gz evidencias/ pruebas/
ls -lh evidencias-tarea3.tar.gz
```

Con `open-vm-tools` podés arrastrarlo a macOS, usar una carpeta compartida (Fusion → Settings → Sharing) o `scp`.

**🎉 La parte técnica terminó.** Lo que queda es el informe → [§T9](#t9).

---

<a name="p18"></a>
## 1.18 — Puntos opcionales

### 1.18.1 Script bash de verificación

> El enunciado pide *"automatizar parte del proceso de verificación con un script bash"*.

```bash
cat > ~/verificar-entorno.sh <<'SCRIPT'
#!/usr/bin/env bash
# verificar-entorno.sh - Tarea 3 SO2 2S2026
# Verifica que el entorno de compilacion del kernel este completo.
set -uo pipefail

OK=0; FALLOS=0
verde()  { printf '\033[0;32m%s\033[0m\n' "$1"; }
rojo()   { printf '\033[0;31m%s\033[0m\n' "$1"; }
titulo() { printf '\n\033[1;34m=== %s ===\033[0m\n' "$1"; }

check_cmd() {
    if command -v "$1" >/dev/null 2>&1; then
        verde "  [OK]    $1 -> $("$1" --version 2>&1 | head -1)"; OK=$((OK+1))
    else
        rojo  "  [FALLA] $1 no encontrado"; FALLOS=$((FALLOS+1))
    fi
}
check_pkg() {
    if dpkg -l "$1" 2>/dev/null | grep -q '^ii'; then
        verde "  [OK]    paquete $1 instalado"; OK=$((OK+1))
    else
        rojo  "  [FALLA] paquete $1 NO instalado"; FALLOS=$((FALLOS+1))
    fi
}
check_header() {
    if [ -f "$1" ]; then
        verde "  [OK]    header $1"; OK=$((OK+1))
    else
        rojo  "  [FALLA] header $1 ausente"; FALLOS=$((FALLOS+1))
    fi
}

echo "############################################################"
echo "#  Verificacion del entorno de compilacion del kernel"
echo "#  $(date)"
echo "#  Host: $(hostname)  Arch: $(uname -m)"
echo "############################################################"

titulo "Herramientas de compilacion"
for c in gcc g++ make gdb ld as cpp bison flex bc rsync cpio pahole; do check_cmd "$c"; done

titulo "Paquetes de desarrollo"
for p in build-essential libc6-dev libssl-dev libelf-dev libncurses-dev \
         libdw-dev fakeroot dwarves kmod zstd; do check_pkg "$p"; done

titulo "Headers de C"
for h in /usr/include/stdio.h /usr/include/stdlib.h /usr/include/string.h; do check_header "$h"; done

titulo "Prueba real de compilacion"
TMP=$(mktemp -d)
cat > "$TMP/t.c" <<'EOF'
#include <stdio.h>
int main(void){ printf("compilacion-ok\n"); return 0; }
EOF
if gcc -Wall -o "$TMP/t" "$TMP/t.c" 2>/dev/null && [ "$("$TMP/t")" = "compilacion-ok" ]; then
    verde "  [OK]    gcc compila y ejecuta correctamente"; OK=$((OK+1))
else
    rojo  "  [FALLA] gcc no logro compilar el programa de prueba"; FALLOS=$((FALLOS+1))
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

**📸 EVIDENCIA:** el script corriendo en colores con `0 FALLAS`.

> 💡 **Para el informe, explicá dos decisiones de diseño:** ① usa **códigos de salida** (`exit 1` si hay fallas) para integrarse en un pipeline automatizado; ② no se limita a comprobar que los binarios existan — hace una **compilación real**, porque un `gcc` presente pero con headers rotos pasaría un chequeo de sola presencia.

### 1.18.2 Comparativa de tiempos

```bash
cd ~/kernel/linux-$KVER
cp .config ~/config-respaldo

for J in 1 2 4 $(nproc); do
    echo "==== Compilando con -j$J ===="
    make clean > /dev/null 2>&1
    /usr/bin/time -f "j=$J  real=%e s  user=%U s  sys=%S s  maxRSS=%M KB" \
      fakeroot make -j$J > /dev/null 2>> ~/evidencias/11-tiempos.txt
    tail -1 ~/evidencias/11-tiempos.txt
done
cat ~/evidencias/11-tiempos.txt
```

> ⚠️ **Esto tarda muchas horas** (una compilación completa por cada `-jN`). Si no tenés tiempo, hacé solo **`-j1` vs `-j$(nproc)`**: con dos puntos ya calculás el speedup.
>
> Alternativa rápida — compilá solo un subsistema:
> ```bash
> for J in 1 2 4 8; do
>   make clean >/dev/null 2>&1
>   /usr/bin/time -f "j=$J real=%e" make -j$J fs/ 2>&1 | tail -1
> done
> ```

| `-jN` | real (s) | user (s) | sys (s) | Speedup vs. j=1 | Eficiencia |
|---|---|---|---|---|---|
| 1 | | | | 1.00× | 100 % |
| 2 | | | | | |
| 4 | | | | | |
| N | | | | | |

- **Speedup** = `real(j=1) / real(jN)`
- **Eficiencia** = `Speedup / N × 100`

→ 📚 [§T8 — ley de Amdahl, para el análisis](#t8)

---
---

<a name="parte-2"></a>
# ✍️ PARTE 2 — TEORÍA PARA EL INFORME

> **Esto no se ejecuta: se escribe.** Son los **30 puntos de documentación** — el mismo peso que `EXTRAVERSION` y más que la compilación.
>
> Las secciones están en el orden en que conviene que aparezcan en el informe. Adaptá la redacción a tu voz; no copies literal.

---

<a name="t1"></a>
## T1 — Arquitecturas y virtualización

<a name="t11"></a>
### T1.1 Tu hardware no es x86, y eso cambia todo

Tu Mac M5 es **Apple Silicon = arquitectura ARM64** (`aarch64`). El README del curso asume implícitamente una PC Intel/AMD (x86-64). Son dos **ISA** distintas — *Instruction Set Architecture*, el juego de instrucciones que el procesador entiende físicamente.

**El kernel de Linux no es portable a nivel binario.** Cada arquitectura necesita su propio código de arranque, manejo de MMU y ABI de syscalls. Por eso el árbol tiene un directorio `arch/` con un subdirectorio por arquitectura. Al compilar, Kbuild detecta la tuya y selecciona `arch/arm64/`.

**Consecuencia práctica y verificable:** el binario que generás es **`arch/arm64/boot/Image.gz`**, no `arch/x86/boot/bzImage`. Lo define `arch/arm64/Makefile` con `KBUILD_IMAGE := $(boot)/Image.gz`.

Otra evidencia directa: en [§1.7.2](#p7) el archivo `hola.s` contiene instrucciones `stp`, `ldp`, `bl` y registros `x0`, `w0` — instrucciones ARM64. En x86 verías `mov`, `push`, `%rax`. Y `gcc -dumpmachine` devuelve `aarch64-linux-gnu`.

<a name="t12"></a>
### T1.2 Por qué Debian 13 arm64 y no Linux Mint

**Linux Mint no publica ISOs para ARM64.** Solo existe para x86-64, así que queda descartado por hardware.

El enunciado pide *"una distribución basada en Debian (Se recomienda Linux Mint)"*. Mint está basado en Ubuntu, que está basado en Debian: **usar Debian directamente cumple el requisito.**

Y hay una razón técnica adicional:

| Distro arm64 | Kernel que trae | Consecuencia |
|---|---|---|
| **Debian 13 (trixie)** | **6.12 LTS** | Copiar su `.config` sobre un fuente 6.12.x = **misma serie**, casi cero opciones nuevas que responder |
| Ubuntu 24.04 | 6.8 / 6.14 HWE | Salto de serie → `make` interroga por decenas de opciones nuevas |
| Fedora Asahi | 6.x | RPM, no cumple "basada en Debian" |

<a name="t13"></a>
### T1.3 Por qué no darle todos los recursos a la VM

El hipervisor no le "quita" núcleos a macOS: los reparte por tiempo (*time-slicing*). Si le das todos, macOS y la VM se pelean por CPU y hay *context switching* constante.

Peor es la RAM: la asignada a la VM queda reservada, y si a macOS no le sobra empieza a hacer *swap* a disco (memory compression + swapfile). El disco es órdenes de magnitud más lento que la RAM, así que la compilación resulta **más lenta**, no más rápida.

<a name="t14"></a>
### T1.4 Virtualización vs. emulación

| | **Virtualización** (lo usado) | Emulación |
|---|---|---|
| ISA del huésped | La **misma** que el host (ARM64 → ARM64) | Distinta (x86 → ARM64) |
| Mecanismo | El CPU ejecuta las instrucciones **nativamente**; el hipervisor solo intercepta operaciones privilegiadas (acceso a hardware, cambios de tabla de páginas) usando extensiones del procesador | Cada instrucción se **traduce en software** |
| Overhead | ~2–5 % | 1000–2000 % |

VMware Fusion en Apple Silicon usa el `Hypervisor.framework` de macOS y **solo soporta huéspedes ARM64**. Emular x86 (QEMU en modo TCG) convertiría una compilación de 40 minutos en 8–20 horas: inviable.

<a name="t15"></a>
### T1.5 Por qué NO sirve Docker para esta tarea

Es el malentendido conceptual más común, y vale la pena explicarlo bien:

Un contenedor **no tiene kernel propio**. Docker usa *namespaces* (aislar PIDs, red, filesystem, hostname) y *cgroups* (limitar recursos), pero todos los contenedores comparten el **kernel del host**. Podés *compilar* un kernel dentro de un contenedor, pero **jamás bootearlo**: no hay firmware, no hay bootloader, no hay `/boot` propio.

Y `uname -r` dentro del contenedor devuelve la versión del kernel del host, porque el campo `release` del `uts_namespace` viene del kernel real (ver [§T5](#t5)). Como la tarea exige `uname -r` mostrando tu nombre **después de bootear**, hace falta una VM con hardware virtualizado completo.

---

<a name="t2"></a>
## T2 — El kernel de Linux: monolítico modular

<a name="t21"></a>
### T2.1 Qué produce la compilación

El kernel es un **programa en C** de ~30 millones de líneas. Se compila como cualquier proyecto en C, solo que el resultado no es un ejecutable normal:

| Artefacto | Qué es | Dónde termina |
|---|---|---|
| `vmlinux-<ver>` en arm64 · `vmlinuz-<ver>` en x86 | El kernel comprimido y booteable (🔧 ojo al nombre → [§T7.2](#t72)) | `/boot/` |
| `*.ko` (*kernel objects*) | Los **módulos**: drivers cargables en caliente | `/lib/modules/<ver>/` |
| `initrd.img-<ver>` | Mini-sistema temporal para arrancar antes de montar el disco real | `/boot/` |
| `System.map-<ver>` | Tabla de símbolos (nombre ↔ dirección) | `/boot/` |

Linux es un kernel **monolítico modular**: el núcleo va todo en un binario, pero los drivers pueden ir *dentro* (`=y`) o *aparte* como módulo (`=m`). Esa decisión, multiplicada por ~13,000 opciones, es lo que vive en el `.config`.

<a name="t22"></a>
### T2.2 El árbol del kernel

| Directorio | Contenido |
|---|---|
| `arch/` | Código **específico por arquitectura**: arranque, MMU, tablas de interrupciones, implementación de syscalls. `arch/arm64/` es el tuyo. |
| `kernel/` | Núcleo independiente de arquitectura: *scheduler*, procesos, timers, señales |
| `mm/` | *Memory management*: memoria virtual, paginación, `mmap`, OOM killer |
| `fs/` | Sistemas de archivos y la capa **VFS** que los abstrae |
| `drivers/` | **El más grande** (>60 % del código): drivers de dispositivos |
| `net/` | Pila de red: TCP/IP, sockets, netfilter |
| `include/` | Headers compartidos (`include/linux/`, `include/uapi/` para userspace) |
| `init/` | Arranque: `start_kernel()`, la primera función C que corre |
| `scripts/` | Herramientas del build: `kconfig`, `Kbuild`, `scripts/config` |
| `certs/` | Certificados para firmar módulos ← el problema de [§1.11](#p11) |
| `Documentation/` | Documentación oficial |
| `Makefile` | Makefile raíz ← acá se edita `EXTRAVERSION` |

---

<a name="t3"></a>
## T3 — La cadena de compilación: GCC, make, GDB

<a name="t31"></a>
### T3.1 Las 4 etapas de GCC

`gcc` no es un compilador: es un **driver** que orquesta cuatro programas distintos.

```
hola.c ──[cpp]──> hola.i ──[gcc -S]──> hola.s ──[as]──> hola.o ──[ld]──> hola
       preproceso         compilación          ensamblado       enlazado
```

1. **Preprocesador (`cpp`)** — resuelve `#include`, `#define`, `#ifdef`. Trabaja sobre **texto puro**; no entiende C. El `#include <stdio.h>` se reemplaza literalmente por el contenido del header. *(De ahí que `hola.c` de 20 líneas produzca un `hola.i` de más de 1000.)*
2. **Compilador propiamente dicho** — análisis léxico → sintáctico → semántico → optimización → genera **assembler de tu arquitectura**.
3. **Ensamblador (`as`)** — traduce el assembler a código máquina y produce un *object file* **relocalizable**: las direcciones aún no son definitivas.
4. **Enlazador (`ld`)** — junta los `.o` con las librerías, **resuelve los símbolos externos** (`printf` vive en libc) y fija las direcciones finales.

Evidencia de la etapa 3: `nm hola.o` marca `printf` con **`U`** (*undefined*). El object file no sabe dónde está; lo resuelve el enlazador. Después del enlazado, `ldd` muestra `libc.so.6` como dependencia dinámica.

<a name="t32"></a>
### T3.2 Cómo decide `make` qué recompilar

Un Makefile es un **grafo dirigido de dependencias**. Cada regla declara `objetivo: prerrequisitos`. `make` recorre el grafo y compara **timestamps de modificación** (`mtime`) del filesystem: si algún prerrequisito es **más nuevo** que el objetivo, ejecuta la receta; si no, la salta.

Esa es toda la magia, y es por eso que existe: sin `make`, cambiar una línea del kernel obligaría a recompilar los 30 millones. Con `make`, recompila solo lo afectado y vuelve a enlazar.

Variables automáticas usadas en [§1.7.3](#p7): `$@` = el objetivo, `$^` = todos los prerrequisitos, `$<` = el primer prerrequisito.

El kernel usa un sistema de Makefiles recursivos propio llamado **Kbuild**, construido sobre GNU Make.

<a name="t33"></a>
### T3.3 GDB y DWARF: por qué hace falta `-g`

Un binario compilado sin `-g` contiene **solo código máquina y direcciones**. GDB podría detenerse en `0x400526`, pero no sabría que eso es la línea 8 de `hola.c` ni que el registro `w1` contiene la variable `resultado`.

El flag `-g` incrusta una sección de metadatos en formato **DWARF** que mapea:
- dirección de máquina ↔ archivo y número de línea
- nombres y tipos de variables
- ubicación de cada variable (registro u offset del stack frame)
- estructura de los stack frames, para reconstruir el `backtrace`

Comprobación en [§1.7.4](#p7): `readelf -S` muestra secciones `.debug_*` solo en el binario compilado con `-g`, y ese binario pesa más.

<a name="t34"></a>
### T3.4 El mismo mecanismo en el kernel: el trade-off de `DEBUG_INFO`

`CONFIG_DEBUG_INFO` es exactamente el `-g` de arriba, aplicado a 30 millones de líneas. De ahí que el build pueda llegar a 30 GB.

| Aspecto | Con `DEBUG_INFO` | Sin `DEBUG_INFO` |
|---|---|---|
| Tamaño del build | ~30 GB | ~4 GB |
| Tiempo de compilación | 100 % | ~65–75 % |
| Depurar el **kernel** (GDB/kgdb) | ✅ | ❌ |
| Depurar programas **de usuario** | ✅ | ✅ (no lo afecta) |
| Herramientas eBPF/BTF | ✅ | ❌ |
| Backtraces de kernel panic | con números de línea | con nombres de símbolo (vía `System.map`) |

**Justificación de la decisión tomada en [§1.12](#p12):** reducir consumo de disco y tiempo en un entorno virtualizado con recursos limitados, sin afectar los objetivos de la práctica — la rúbrica pide GDB verificado sobre un programa de usuario, no depuración del kernel. Declarar el trade-off explícitamente es análisis de ingeniería, y es lo que se califica.

<a name="t35"></a>
### T3.5 Para qué sirve cada dependencia

| Paquete | Rol en la compilación del kernel |
|---|---|
| `build-essential` | Meta-paquete: `gcc`, `g++`, `make`, `libc6-dev`, `dpkg-dev`. Las **librerías de desarrollo de C** que pide el enunciado están en `libc6-dev` (headers `.h` + libs estáticas de glibc). |
| `gdb` | Depurador. Lo pide la rúbrica. |
| `bison` + `flex` | El kernel tiene su **propio lenguaje de configuración** (Kconfig). `flex` genera el analizador **léxico** (parte el texto en tokens) y `bison` el **sintáctico** (aplica la gramática). Son generadores de compiladores usados para construir el parser de la configuración. |
| `libncurses-dev` | Librería de UI en terminal; la usa `make menuconfig`. |
| `libssl-dev` | Headers de OpenSSL. El kernel calcula hashes y **firma módulos** durante el build, y su subsistema de crypto los necesita. |
| `libelf-dev` | ELF (*Executable and Linkable Format*) es el formato de binarios en Linux; el build lee y manipula su propia salida ELF. |
| `libdw-dev` | Lectura de información DWARF; la usa `pahole`. |
| `dwarves` | Trae **`pahole`**, que convierte DWARF a **BTF** (*BPF Type Format*), requerido por `CONFIG_DEBUG_INFO_BTF` que Debian activa. |
| `fakeroot` | Intercepta syscalls (`chown`, `stat`, `chmod`) vía `LD_PRELOAD` y **le miente al proceso** haciéndole creer que es root. Así compilás sin `sudo`: menos riesgo de romper el sistema por un error en un Makefile. |
| `bc` | Calculadora de precisión arbitraria; `kernel/time/timeconst.bc` precalcula constantes de conversión de tiempo. |
| `rsync` | Copia headers durante pasos internos del build. |
| `cpio` | Empaqueta el **initramfs** (formato cpio, no tar). |
| `kmod` | Provee `modprobe`, `insmod`, `lsmod`, `depmod`. |
| `zstd` | Debian activa `CONFIG_MODULE_COMPRESS_ZSTD`: los `.ko` se comprimen con Zstandard al instalarse. |
| `xz-utils` | Descomprime el tarball `.tar.xz`. |

> **Punto para el informe:** el README del curso omite `bc`, `rsync`, `cpio`, `zstd`, `libdw-dev` y `gdb`. En un Debian limpio los cuatro primeros no vienen y hacen fallar el build en momentos distintos.

---

<a name="t4"></a>
## T4 — Kconfig y el archivo `.config`

<a name="t41"></a>
### T4.1 Qué es `.config`

El kernel no se compila "a secas": se compila **una configuración**. `.config` es un archivo de ~13,000 líneas con entradas de tres estados:

```
CONFIG_EXT4_FS=y                  # compilado DENTRO del kernel (built-in)
CONFIG_NTFS3_FS=m                 # compilado como modulo .ko aparte
# CONFIG_HAMRADIO is not set      # excluido del binario
```

El código fuente está lleno de bloques `#ifdef CONFIG_ALGO`. El `.config` se traduce a `include/generated/autoconf.h` y a variables de Make, así que **literalmente decide qué código llega al compilador**.

**Por qué copiar la config de Debian** en vez de configurar de cero: son ~13,000 opciones. Partir de la config con la que el sistema **ya arranca en este hardware** es la garantía más fuerte de que el kernel nuevo también arranque. Un `make defconfig` daría un kernel genérico que probablemente no bootee en la VM.

<a name="t42"></a>
### T4.2 Qué hace exactamente `localmodconfig`

1. Lee la salida de `lsmod` (los módulos cargados **en ese momento**).
2. Recorre el `.config` y cambia a `n` **todo `=m` que no esté en esa lista**.
3. Resuelve dependencias con `olddefconfig` para no dejar inconsistencias.

**El beneficio:** en vez de compilar drivers de ~3,000 tarjetas de red, tarjetas de sonido y controladores SCSI que no existen en la VM, compila solo los presentes. Reduce el tiempo de compilación entre 3× y 6×.

**El riesgo:** si un dispositivo estaba desconectado o su módulo no estaba cargado, ese driver desaparece y el dispositivo no funciona con el kernel nuevo. Por eso [§1.5](#p5) (instalar `open-vm-tools`) va antes, y por eso [§1.9](#p9) inspecciona los drivers antes de tocar nada.

<a name="t43"></a>
### T4.3 Por qué `make olddefconfig` después de `scripts/config`

`scripts/config` edita el archivo con una herramienta de texto: **no entiende las dependencias** entre opciones. `make olddefconfig` recorre el árbol Kconfig, apaga las opciones que quedaron huérfanas (por ejemplo `MODULE_SIG_ALL` cuando `MODULE_SIG` se desactivó) y rellena las nuevas con su valor por defecto. Sin ese paso el `.config` queda inconsistente y el build falla de formas confusas.

### 🔧 CAMPO — T4.3b · La otra cara: `olddefconfig` también revierte lo que vos querías

Esa misma capacidad de "restaurar la coherencia" es la que hace que **no puedas desactivar una opción forzada**. Kconfig tiene tres formas de dependencia:

| Directiva | Significado | En `menuconfig` |
|---|---|---|
| `depends on X` | Esta opción **solo aparece** si `X` está activa | Se oculta si no se cumple |
| `select X` | Activar esta opción **fuerza** `X` a `y` | `X` sale como `-*-` |
| `imply X` | Sugiere `X` pero se puede cambiar | `[*]` editable |

Cuando algo hace `select MODULE_SIG`, el ciclo es siempre el mismo:

```
scripts/config --disable MODULE_SIG   →  el .config dice "not set"
make olddefconfig                     →  detecta la inconsistencia
                                      →  restaura MODULE_SIG=y
```

**No es un bug ni un error tuyo: es exactamente para lo que existe `olddefconfig`.** Un `.config` con una opción `select`-ada apagada no es un `.config` válido.

**Cómo averiguar quién fuerza una opción:**

```bash
grep -rn 'select MODULE_SIG$' --include=Kconfig .
```

**La lección práctica:** cuando `olddefconfig` "deshace" tu cambio, no lo repitas en loop. Buscá el `select` que lo fuerza y decidí si podés atacar la causa (desactivar quien selecciona) o si te alcanza con **neutralizar los efectos** — que es lo que se hace en [§1.11](#p11) con `MODULE_SIG_FORCE` y `SYSTEM_TRUSTED_KEYS`.

<a name="t44"></a>
### T4.4 `/sys` y la inspección de drivers en vivo

`/sys` es **sysfs**, un filesystem virtual (no toca el disco: vive en RAM) donde el kernel publica su estructura interna de dispositivos como si fuera un árbol de archivos. Cada archivo es en realidad una función del kernel que se ejecuta al leerlo.

`/sys/block/<disco>/device/driver` es un **symlink** que apunta a `/sys/bus/<bus>/drivers/<nombre>`. El nombre de ese destino **es** el driver que el kernel está usando ahora mismo. Es información en vivo, no una suposición. Es el mismo mecanismo detrás de `lsblk`, `lspci -k` y buena parte de `udev`.

En una VM los dispositivos son **paravirtualizados**: el huésped sabe que está virtualizado y habla un protocolo eficiente con el hipervisor en vez de fingir un chip físico. VMware usa `nvme`/`vmw_pvscsi` (disco), `vmxnet3` (red), `vmwgfx` (gráficos) y `vmw_vmci` (canal host↔guest) — **no** los `virtio_*` de QEMU/UTM.

---

<a name="t5"></a>
## T5 — `KERNELRELEASE`: del Makefile a `uname -r`

Esta es la cadena de causalidad central de la tarea:

```
Makefile: VERSION.PATCHLEVEL.SUBLEVEL + EXTRAVERSION
    │
    ├─> variable KERNELVERSION  (Makefile raiz)
    │
    ├─> KERNELRELEASE = KERNELVERSION + $(CONFIG_LOCALVERSION) + $(setlocalversion)
    │       │  se escribe en include/config/kernel.release
    │       │
    │       ├─> se compila como macro UTS_RELEASE en include/generated/utsrelease.h
    │       │       │
    │       │       └─> init/version.c:  struct uts_namespace init_uts_ns = {
    │       │                                .name.release = UTS_RELEASE, ... }
    │       │               ↑ queda GRABADO dentro del binario del kernel
    │       │
    │       ├─> nombre del archivo instalado:  /boot/vmlinux-<KERNELRELEASE>
    │       │                                   (arm64; en x86 es vmlinuz-)
    │       └─> ruta de los modulos:           /lib/modules/<KERNELRELEASE>/
    │
    └─> en ejecucion:
            uname -r  →  syscall uname(2)  →  copia utsname.release desde
                         el uts_namespace del proceso  →  imprime el string
```

**Dos consecuencias prácticas:**

1. `EXTRAVERSION` **no es cosmético**: define nombres de archivo y rutas reales del filesystem. De ahí la prohibición de espacios y caracteres raros.
2. Si cambiás `EXTRAVERSION` **después** de compilar, la ruta `/lib/modules/<ver>/` cambia y los módulos ya construidos quedan en la ruta vieja: el kernel arranca pero no encuentra sus módulos. Por eso se fija **antes** de compilar, y por eso `make -s kernelrelease` se verifica antes ([§1.13](#p13)).

**Nota sobre `uts_namespace`:** ese `struct` es la base de los *UTS namespaces* de Linux — el mecanismo que le permite a un contenedor tener su propio hostname. Pero el campo `release` sigue viniendo del kernel real del host, y esa es exactamente la razón por la que Docker no sirve para esta tarea ([§T1.5](#t15)).

**Sobre `CONFIG_LOCALVERSION`:** Debian lo usa para embeber el nombre de su *flavour* (`-arm64`). Como se copia su `.config`, si no se vacía el string final sale `6.12.102-tunombre-arm64`. Y `CONFIG_LOCALVERSION_AUTO` invoca `scripts/setlocalversion`, que agrega un `+` cuando detecta un árbol git modificado.

---

<a name="t6"></a>
## T6 — Firmas de módulos y Secure Boot

<a name="t61"></a>
### T6.1 Son dos mecanismos distintos

La confusión más común de esta práctica es creer que "firmas de módulos" es una sola cosa. Son dos capas separadas:

**(a) `SYSTEM_TRUSTED_KEYS` — el llavero incrustado**
Es una ruta a un archivo `.pem` con certificados X.509 que se **compilan dentro del binario del kernel**, formando un *keyring* de confianza en memoria. Debian y Ubuntu apuntan a los certificados de la distro para que solo carguen módulos firmados por ella. Al copiar su `.config` se hereda una ruta (`debian/canonical-certs.pem`) a un archivo que **no existe** en el tarball de kernel.org — de ahí el error #1 de la práctica.

**(b) `MODULE_SIG` — el mecanismo de verificación**

| Opción | Qué hace |
|---|---|
| `CONFIG_MODULE_SIG` | Habilita el soporte de verificación de firmas |
| `CONFIG_MODULE_SIG_ALL` | Firma automáticamente todos los `.ko` al compilar |
| `CONFIG_MODULE_SIG_FORCE` | **Rechaza** cargar cualquier módulo sin firma válida |
| `CONFIG_MODULE_SIG_KEY` | Ruta a la llave privada de firma |

El enunciado pide desactivar **(b)**; el README del curso solo cubre **(a)**.

### 🔧 CAMPO — T6.1b · Por qué en Debian 13 arm64 no se puede desactivar (b), y por qué igual se cumple el requisito

**El hecho:** `CONFIG_MODULE_SIG` en Debian 13 arm64 **no es desactivable**. En `make menuconfig` aparece como `-*-` en vez de `[*]`, y la barra espaciadora no responde. Ese `-*-` de Kconfig significa *"seleccionado por otra opción, no lo podés tocar"*: lo fuerzan `SYSTEM_TRUSTED_KEYRING` y el perfil de *lockdown* del kernel de Debian, que declaran `select MODULE_SIG`. Cualquier `scripts/config --disable MODULE_SIG` se revierte en el siguiente `make olddefconfig`, porque `olddefconfig` justamente existe para restaurar la coherencia del árbol Kconfig.

**Por qué eso no impide cumplir el requisito.** Hay que separar tres cosas que la opción `MODULE_SIG` confunde:

| Pregunta | Opción que la controla | Estado en tu build |
|---|---|---|
| ¿El kernel **sabe** verificar firmas? | `MODULE_SIG` | `y` — forzado, no se puede cambiar |
| ¿El kernel **exige** que los módulos vengan firmados? | `MODULE_SIG_FORCE` | **`not set`** ← esto es lo que importa |
| ¿El build **firma** todos los módulos al compilar? | `MODULE_SIG_ALL` | **`not set`** |
| ¿Con qué llavero verifica? | `SYSTEM_TRUSTED_KEYS` | **`""`** — vacío |

Con `FORCE` apagado, el kernel **carga módulos sin firma sin protestar**: la verificación existe como código pero no bloquea nada. Y con `SYSTEM_TRUSTED_KEYS=""` el build ya no busca `debian/canonical-certs.pem`; genera su propia llave efímera en `certs/signing_key.pem` y sigue de largo.

**Lo que hay que escribir en el informe:** que el requisito *"desactivar la verificación de firmas"* se cumplió **funcionalmente**, no literalmente, y por qué la distinción es correcta. Es una respuesta más fuerte que un `is not set` conseguido a la fuerza — demuestra que se leyó el Kconfig en vez de copiar comandos.

<a name="t62"></a>
### T6.2 Por qué existe todo esto

Un módulo del kernel corre en **EL1** (el equivalente ARM64 del "ring 0"), con acceso total a memoria física, hardware y estructuras del kernel. Un módulo malicioso es un rootkit perfecto: puede interceptar syscalls, ocultar procesos y leer cualquier memoria. La firma criptográfica establece una **cadena de confianza**: solo se carga código firmado por una llave en la que el kernel confía.

Es el mismo modelo que **Secure Boot** un nivel más abajo: el firmware UEFI verifica la firma del bootloader, el bootloader la del kernel, y el kernel la de los módulos. Un kernel compilado por vos no está firmado por una autoridad conocida, así que en hardware físico habría que desactivar Secure Boot. En VMware Fusion en Apple Silicon esto no afecta, pero mencionarlo demuestra que se entiende el modelo completo.

<a name="t63"></a>
### T6.3 Qué es un checksum (y por qué es el mismo mecanismo)

`SHA-256` es una función hash criptográfica: convierte cualquier archivo en una huella de 256 bits. Cambiar **un solo bit** produce una huella completamente distinta (*efecto avalancha*), y es *unidireccional*: de la huella no se puede reconstruir el archivo.

Sirve para detectar corrupción en la transferencia y manipulación intencional. Es el mismo primitivo criptográfico que usa el kernel para firmar módulos: la firma es un hash cifrado con una llave privada.

---

<a name="t7"></a>
## T7 — Initramfs, GRUB y el arranque

<a name="t71"></a>
### T7.1 El problema del huevo y la gallina

Para montar el disco raíz, el kernel necesita el driver del controlador de disco y del sistema de archivos. Pero si esos drivers son módulos (`=m`), están **en el disco que todavía no puede montar**.

Solución: el **initramfs** (*initial RAM filesystem*). Es un archivo cpio comprimido que GRUB carga en memoria junto al kernel. Contiene un mini-sistema con los módulos indispensables. El kernel lo monta como raíz temporal, carga desde ahí los drivers que necesita, monta el disco real y **pivota** (`switch_root`) al sistema definitivo.

Por eso `make install` corre `update-initramfs`, y por eso `/boot` necesita espacio: cada kernel instalado trae su propio initramfs.

> 🔧 **CAMPO — el tamaño real.** La cifra de "30–90 MB" corresponde a un initramfs de distribución, generado con `MODULES=dep` (solo lo indispensable). El que produce **tu** build en Debian usa `MODULES=most` y empaqueta *todos* los módulos construidos más los firmwares: en la corrida real pesó **532 MB**. Es esperable y no impide arrancar; solo hay que tener `/boot` con espacio. Es un buen dato cuantitativo para el informe: explica el trade-off entre *arrancar en cualquier hardware* (most) y *arrancar rápido y liviano* (dep).

<a name="t72"></a>
### T7.2 Qué hace `make install` realmente

En arm64 el target `install` ejecuta `scripts/install.sh` / `arch/arm64/boot/install.sh`, que:

1. Resuelve `KBUILD_IMAGE` (en arm64, `arch/arm64/boot/Image.gz`) y decide el nombre de destino.
2. Si existe `/sbin/installkernel` (lo provee Debian), le delega el trabajo.
3. `installkernel` copia la imagen, `System.map-<ver>` y `config-<ver>` a `/boot`, rotando el anterior a `.old`.

4. Ejecuta los hooks de **`/etc/kernel/postinst.d/`**:
   - `initramfs-tools` → `update-initramfs -c -k <ver>`
   - `zz-update-grub` → `update-grub`, que escanea `/boot` y regenera `/boot/grub/grub.cfg`

Es decir: `make install` no solo copia un archivo. **Integra el kernel en el ciclo de arranque completo del sistema.**

#### 🔧 CAMPO — el nombre del archivo: `vmlinux`, no `vmlinuz`

La primera versión de este manual daba por hecho el prefijo `vmlinuz` (el de x86). En la instalación real sobre Debian 13 **arm64** el archivo quedó como:

```text
/boot/vmlinux-6.12.102-jbarrera-202012345
```

La `z` de `vmlinuz` viene de *zipped* y es una convención heredada de x86, donde `make install` copia el `bzImage` comprimido. En arm64 el flujo de `installkernel` no aplica ese prefijo.

**Consecuencia práctica:** cualquier `ls`, `grep` o script que busque `/boot/vmlinuz-$KREL` devuelve `No such file or directory` y hace parecer que la instalación falló. Usá el comodín `vmlinu?-$KREL`, o simplemente `ls -lh /boot/` y leé qué hay.

Vale la pena documentarlo en el informe junto a la diferencia `bzImage` vs `Image.gz`: son dos caras de lo mismo — **el README del curso está escrito para x86**, y trasladarlo a arm64 exige revisar los nombres de archivo, no solo los comandos.

<a name="t73"></a>
### T7.3 Qué hace `modules_install`

1. Copia todos los `.ko` a `/lib/modules/<KERNELRELEASE>/kernel/`, respetando la estructura del fuente.
2. Los comprime con **zstd** (por `CONFIG_MODULE_COMPRESS_ZSTD` de Debian) → quedan como `.ko.zst`.
3. Ejecuta **`depmod`**, que lee los símbolos exportados y requeridos de cada módulo y construye el grafo de dependencias en `modules.dep`.

Ese grafo es lo que le permite a `modprobe` cargar automáticamente las dependencias en el orden correcto. Sin `depmod`, `modprobe` fallaría con "unknown symbol".

Fijate que la ruta lleva **`<KERNELRELEASE>`**: es la misma variable de [§T5](#t5), y por eso `EXTRAVERSION` debe quedar fijo antes de compilar.

<a name="t74"></a>
### T7.4 GRUB y por qué el kernel viejo sigue ahí

**GRUB** (*GRand Unified Bootloader*) es un bootloader multi-etapa. En arm64 el firmware UEFI carga `grubaa64.efi` desde la partición EFI, GRUB lee `/boot/grub/grub.cfg`, presenta el menú, y para la opción elegida ejecuta dos comandos: `linux /boot/vmlinux-<ver> <parámetros>` (en arm64; `vmlinuz-` en x86) e `initrd /boot/initrd.img-<ver>`. Carga ambos en RAM y transfiere el control al kernel.

**El kernel nuevo NO reemplaza al de Debian: convive con él.** `update-grub` escanea `/boot` y genera una entrada por cada imagen de kernel que encuentra. Esa es la red de seguridad: si el kernel nuevo no arranca, se reinicia, se entra a *Advanced options* y se elige el de Debian. **Nunca borres el kernel original.**

En x86 con BIOS se entra al menú con SHIFT. En **UEFI/arm64 se usa ESC**, porque no existe el mismo mecanismo de teclado del BIOS legado.

> 🔧 **CAMPO — la consecuencia que hay que entender.** Como conviven, **GRUB tiene que elegir uno**, y con `GRUB_DEFAULT=0` elige la **primera entrada del menú principal**: el kernel de Debian. Las entradas de los demás kernels (incluido el tuyo) quedan dentro del submenú *Advanced options*. Por eso, después de `sudo reboot`, `uname -r` devolvió `6.12.101+deb13-arm64` y pareció que la compilación no había servido: el kernel propio estaba instalado y en el menú, simplemente **no fue el que arrancó**.
>
> Esto no es un bug; es el diseño. Un bootloader que arrancara automáticamente el último kernel instalado dejaría el sistema sin salida cuando ese kernel fallara. **Elegir manualmente en cada arranque es el precio de tener red de seguridad** — y es un punto de análisis interesante para el informe.

---

<a name="t8"></a>
## T8 — Paralelismo y ley de Amdahl

`make -jN` lanza N trabajos de compilación concurrentes. `nproc` reporta los núcleos disponibles. Usar más `-j` que núcleos solo satura RAM y disco.

El speedup nunca es lineal. La mejora máxima está acotada por la **fracción serial** del trabajo:

```
S(N) = 1 / ( (1 - P) + P/N )
```

donde `P` es la fracción paralelizable y `N` el número de núcleos.

En la compilación del kernel la parte paralelizable es enorme (compilar ~30,000 archivos `.o` independientes), pero hay etapas **inherentemente seriales**: el enlazado final de `vmlinux`, `SORTTAB`, la generación de `Image.gz`. Además aparecen cuellos de botella que Amdahl no modela: **E/S de disco** (en una VM el disco es un archivo en el filesystem de macOS) y **ancho de banda de memoria**.

Esperá eficiencia decreciente: de 1 a 2 núcleos casi se duplica la velocidad; de 4 a 8 se gana mucho menos.

**El dato más elegante para el informe:** con `N > 1`, el tiempo `user` que reporta `time` es mucho **mayor** que `real`. Eso es la prueba numérica de que varios núcleos trabajaron en paralelo — `user` suma el tiempo de CPU de todos los núcleos, `real` mide el reloj de pared.

---

<a name="t9"></a>
## T9 — Estructura del informe y checklist de capturas

> 🎯 **30 puntos.** ⚠️ **No entregues solo capturas.** Los puntos son de *análisis técnico*. Toda la PARTE 2 es el contenido de esos puntos.

### Estructura sugerida (12–18 páginas)

```
PORTADA
  Universidad de San Carlos de Guatemala · Facultad de Ingenieria
  Escuela de Ingenieria en Ciencias y Sistemas
  Sistemas Operativos 2 · Segundo Semestre 2026
  Tarea #3 - Compilacion del kernel de Linux
  Nombre completo · Carne · Fecha
  >>> CAPTURA DE uname -r MOSTRANDO TU NOMBRE <<<

1. INTRODUCCION Y OBJETIVOS                                    (0.5 pag)

2. ENTORNO Y JUSTIFICACION DE DECISIONES                       (1.5 pag)
   Fuente: §T1 completa
   2.1 Hardware ARM64                          -> §T1.1
   2.2 Por que Debian 13 y no Mint              -> §T1.2
   2.3 Virtualizacion vs. emulacion             -> §T1.4
   2.4 Por que NO Docker                        -> §T1.5
   2.5 Recursos asignados y su justificacion    -> §T1.3

3. MARCO TEORICO                                               (3-4 pag)
   3.1 El kernel monolitico modular             -> §T2.1
   3.2 El arbol del kernel                      -> §T2.2
   3.3 Las 4 etapas de GCC (con tus capturas)   -> §T3.1
   3.4 GNU Make: grafo y timestamps             -> §T3.2
   3.5 GDB y DWARF: por que -g                  -> §T3.3
   3.6 Kconfig y .config                        -> §T4.1, §T4.2
   3.7 KERNELRELEASE -> uname -r (el diagrama)  -> §T5
   3.8 Firmas de modulos y Secure Boot          -> §T6
   3.9 Initramfs, make install y GRUB           -> §T7

4. PROCEDIMIENTO EJECUTADO                                     (4-5 pag)
   Un apartado por paso: comando + captura + verificacion.
   Seguí el orden de §1.6 a §1.17.
   Incluí la tabla de dependencias de §T3.5.

5. ARCHIVOS MODIFICADOS                                        (0.5 pag)
   >>> El enunciado lo pide explicitamente. Tabla: <<<
   | Archivo                    | Modificacion                      |
   |----------------------------|-----------------------------------|
   | linux-$KVER/Makefile       | EXTRAVERSION = -tunombre-tucarne  |
   | linux-$KVER/.config        | copiado de /boot/config-*, luego  |
   |                            | localmodconfig + 12 opciones      |
   | /etc/default/grub          | GRUB_TIMEOUT, TIMEOUT_STYLE,      |
   |                            | quitado quiet splash              |
   | ~/.bashrc                  | export KVER=<tu version>          |
   Adjunta el diff:
     diff ~/evidencias/config-01-original.txt ~/evidencias/config-04-final.txt

6. RESULTADOS                                                  (2 pag)
   6.1 uname -r y uname -a               <-- LO CENTRAL
   6.2 /proc/version
   6.3 Contenido de /boot con los 4 archivos
   6.4 Menu de GRUB con ambos kernels
   6.5 Tiempo de compilacion (real/user/sys)
   6.6 Tabla de metricas antes/despues:
       | Metrica                  | Antes         | Despues            |
       | uname -r                 | 6.12.x-arm64  | 6.12.x-tunombre    |
       | Modulos en .config (=m)  |               |                    |
       | Tamaño del build         |      -        |                    |
       | Tamaño de Image.gz       |      -        |                    |
       | Tamaño del initrd.img    |      -        | (real: 532 MB)     |
       | Tiempo de compilacion    |      -        |                    |

7. ERRORES ENCONTRADOS Y SU SOLUCION                           (1-2 pag)
   >>> El enunciado lo pide explicitamente. Por cada error: <<<
   - Mensaje literal
   - Diagnostico: por que ocurrio
   - Solucion aplicada (comando exacto)
   - Verificacion de que quedo resuelto

   >>> Los 7 errores REALES de la corrida de campo (§E1.9 a §E2.7): <<<
   a) Directorio inexistente: el manual asumia 6.12.69, kernel.org
      solo tenia 6.12.102  -> variable $KVER
   b) .config sin canonical-certs porque se inspecciono ANTES de
      copiar /boot/config-*  -> orden de operaciones (§1.10)
   c) .config corrompido por pegar comandos en un make oldconfig
      interactivo (§E1.9)
   d) Loop infinito: scripts/config --disable MODULE_SIG revertido por
      make olddefconfig; MODULE_SIG forzado a -*- en Debian 13 arm64
      -> se cumple funcionalmente con FORCE/ALL apagados (§T6.1b)
   e) grep '^CONFIG_MODULE_SIG=' no encontraba las lineas
      '# ... is not set'  -> falso negativo (§E1.11)
   f) libfakeroot internal error: payload not recognized! -> bug de
      libfakeroot en arm64, el build no se detiene (§E1.10)
   g) uname -r mostraba el kernel viejo tras el reboot porque GRUB
      arranca la primera entrada; habia que ESC -> Advanced options
      (§E2.7)
   h) Kernel instalado como /boot/vmlinux-* (sin z) en arm64 (§E2.8)

   Si algo NO te fallo, documenta que lo PREVINISTE y como:
   canonical-certs.pem (§E1.1), drivers de VM en localmodconfig (§E2.1),
   tabs en Makefile (§E1.7).
   Fuente: PARTE 3.

8. PUNTOS OPCIONALES                                           (1-2 pag)
   8.1 Script bash: codigo + salida + decisiones de diseño  -> §1.18.1
   8.2 Comparativa -jN + analisis con Amdahl                -> §1.18.2, §T8

9. CONCLUSIONES                                                (0.5 pag)
   Minimo 4, tecnicas y especificas. NO "aprendi mucho".
   Ejemplos del tipo correcto:
   - El kernel no es portable a nivel binario: arch/ contiene el codigo
     dependiente de ISA, por lo que compilar en ARM64 produce Image.gz
     en lugar de bzImage.
   - EXTRAVERSION no es cosmetico: define rutas del filesystem
     (/lib/modules/<ver>), por lo que debe fijarse antes de compilar.
   - localmodconfig reduce N veces el tiempo de compilacion pero introduce
     el riesgo de eliminar drivers no cargados; en un entorno virtualizado
     eso puede impedir el arranque.
   - Desactivar CONFIG_DEBUG_INFO reduce el build de ~30 GB a ~4 GB sin
     afectar los objetivos de la practica, porque la depuracion exigida
     es de programas de usuario, no del kernel.
   - Kconfig no es una lista de interruptores independientes: las
     directivas 'select' crean opciones forzadas (-*-) que ningun
     scripts/config puede revertir, porque make olddefconfig restaura la
     coherencia del arbol. Desactivar MODULE_SIG en Debian 13 arm64 es
     imposible; el requisito se cumple neutralizando MODULE_SIG_FORCE,
     MODULE_SIG_ALL y SYSTEM_TRUSTED_KEYS.
   - Las guias escritas para x86 no se trasladan literalmente a arm64: el
     binario es Image.gz y no bzImage, y make install lo deposita como
     /boot/vmlinux-<ver> y no vmlinuz-<ver>. Verificar con rutas
     hardcodeadas produce falsos negativos.
   - Instalar un kernel y arrancarlo son operaciones distintas: GRUB
     conserva el kernel anterior como primera entrada por diseño, de modo
     que un kernel recien instalado no se ejecuta hasta seleccionarlo. Es
     el costo deliberado de mantener una ruta de recuperacion.

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

### Checklist de 34 capturas

> 🔧 Las cuatro últimas (31–34) salen de la corrida de campo y alimentan la sección 7 del informe.

| # | Captura | § | Rúbrica |
|---|---|---|---|
| 1 | `shasum` de la ISO coincidiendo | [1.2](#p2) | — |
| 2 | Settings de la VM (CPU/RAM/disco) | [1.3](#p3) | — |
| 3 | `uname -a` + `free -h` + `df -h` inicial | [1.5](#p5) | Línea base |
| 4 | `gcc/make/gdb --version` | [1.6](#p6) | **10 pts** |
| 5 | `dpkg -l \| grep lib*-dev` | [1.6](#p6) | **Librerías de C** |
| 6 | `hola.c` compilado y ejecutándose | [1.7](#p7) | Verificación entorno |
| 7 | Líneas `hola.c` → `hola.i` | [1.7](#p7) | Teoría |
| 8 | Assembler ARM64 (`head hola.s`) | [1.7](#p7) | Teoría |
| 9 | `make` diciendo "is up to date" | [1.7](#p7) | **make verificado** |
| 10 | GDB detenido en breakpoint | [1.7](#p7) | GDB verificado |
| 11 | `sha256sum -c` del tarball → OK | [1.8](#p8) | **10 pts** |
| 12 | `ls arch/` con `arm64` y `x86` | [1.8](#p8) | Teoría |
| 13 | Drivers desde `/sys/block/*/device/driver` | [1.9](#p9) | — |
| 14 | `localmodconfig` + conteo `=m` antes/después | [1.10](#p10) | **10 pts** |
| 15 | `grep` de firmas **antes** (con `canonical-certs.pem`) | [1.11](#p11) | Firmas |
| 16 | `grep` de firmas **después** (`""` + los dos `is not set`) | [1.11](#p11) | Firmas |
| 17 | `head -8 Makefile` con `EXTRAVERSION` | [1.13](#p13) | **30 pts** |
| 18 | **`make -s kernelrelease`** | [1.13](#p13) | **30 pts** |
| 19 | Compilación con núcleos al 100 % | [1.14](#p14) | **20 pts** |
| 20 | Últimas líneas (`GZIP Image.gz`) | [1.14](#p14) | **20 pts** |
| 21 | Salida de `time` (real/user/sys) | [1.14](#p14) | Opcional |
| 22 | `strings vmlinux \| grep <tu-versión>` | [1.14](#p14) | **20 pts** |
| 23 | `ls -lh /boot/` con los 4 archivos (notá `vmlinux`, sin `z`) | [1.15](#p15) | Evidencias |
| 24 | `ls -d /lib/modules/<tu-versión>` | [1.15](#p15) | Evidencias |
| 25 | **Menú de GRUB con ambos kernels** | [1.16](#p16) | Evidencias |
| 26 | Mensajes de arranque del kernel | [1.16](#p16) | Evidencias |
| 27 | ⭐ **`uname -r` + `uname -a`** | [1.17](#p17) | **LA PRUEBA CENTRAL** |
| 28 | `cat /proc/version` | [1.17](#p17) | Resultados |
| 29 | `verificar-entorno.sh` con 0 fallas | [1.18](#p18) | Opcional |
| 30 | Tabla de tiempos `-jN` | [1.18](#p18) | Opcional |
| 31 | 🔧 `make menuconfig` con `MODULE_SIG` como `-*-` | [1.11](#p11) | **Sección 7** |
| 32 | 🔧 `libfakeroot internal error` + el build siguiendo | [1.14](#p14) | **Sección 7** |
| 33 | 🔧 `uname -r` mostrando el kernel **viejo** tras el reboot, junto al correcto después de elegir en GRUB | [1.16](#p16) | **Sección 7** |
| 34 | 🔧 `ls -lh /boot/initrd.img-<ver>` con su tamaño real | [1.15](#p15) | Resultados |

> 💡 **Que las capturas sean legibles:** terminal con fondo claro o alto contraste, fuente grande (Ctrl+Shift+`+` en XFCE), y recortá solo la parte relevante. Una captura de 1920×1080 con la terminal ocupando un cuarto es ilegible en PDF.

### Antes de entregar

- [ ] El PDF tiene entre **7 y 15 páginas** (o el rango que indique tu tutor)
- [ ] La captura de `uname -r` con tu nombre está **en la portada**
- [ ] Sección 5 "Archivos modificados" completa — el enunciado la pide
- [ ] Sección 7 "Errores y solución" completa — el enunciado la pide
- [ ] Todas las capturas numeradas y **referenciadas desde el texto** ("como se observa en la Figura 12…")
- [ ] Las conclusiones son técnicas, no genéricas
- [ ] Nombre y carné en la portada y en el encabezado/pie de cada página
- [ ] Archivo: `Tarea3_SO2_<TuCarne>.pdf`
- [ ] Subido a **UEDI/Classroom** según indique tu tutor

---
---

<a name="parte-3"></a>
# 🔥 PARTE 3 — ERRORES

> Buscá tu mensaje de error acá. **Documentá en el informe cada error que te pase** — el enunciado pide explícitamente *"solución a errores obtenidos durante la compilación"*. Un error bien diagnosticado vale más que un camino sin obstáculos.

<a name="e1"></a>
## E1 — Errores de configuración y compilación

### E1.1 `No rule to make target 'debian/canonical-certs.pem'`

```
make[2]: *** No rule to make target 'debian/canonical-certs.pem',
         needed by 'certs/x509_certificate_list'.  Stop.
```

**Causa:** heredaste `CONFIG_SYSTEM_TRUSTED_KEYS="debian/canonical-certs.pem"` de la config de Debian, pero ese archivo solo existe en el árbol de packaging de Debian, no en el tarball de kernel.org.

```bash
cd ~/kernel/linux-$KVER
scripts/config --set-str SYSTEM_TRUSTED_KEYS ""
scripts/config --set-str SYSTEM_REVOCATION_KEYS ""
scripts/config --disable SYSTEM_REVOCATION_LIST
scripts/config --disable MODULE_SIG_ALL
scripts/config --disable MODULE_SIG_FORCE
make olddefconfig
grep -E 'CONFIG_SYSTEM_TRUSTED_KEYS|CONFIG_MODULE_SIG_FORCE|CONFIG_MODULE_SIG_ALL' .config
fakeroot make -j$(nproc)                       # reanuda, no recompila todo
```

> 🔧 **CAMPO:** este bloque **ya no lleva `--disable MODULE_SIG`**. Ver [§E1.10](#e1) — en Debian 13 arm64 esa línea sola te mete en un loop.

### E1.2 `BTF: .tmp_vmlinux.btf: pahole (pahole) is not available`

**Causa:** falta `pahole`, o su versión es muy vieja para generar BTF.

```bash
sudo apt install -y dwarves
pahole --version
# Si sigue fallando:
scripts/config --disable DEBUG_INFO_BTF
make olddefconfig
```

### E1.3 `bc: command not found` / `rsync: not found` / `cpio: not found`

```bash
sudo apt install -y bc rsync cpio kmod zstd
```

### E1.4 `No space left on device`

```bash
df -h /
du -sh ~/kernel/linux-$KVER

# Opcion A: bajar el peso del build
cd ~/kernel/linux-$KVER
scripts/config --disable DEBUG_INFO
scripts/config --enable  DEBUG_INFO_NONE
scripts/config --disable DEBUG_INFO_BTF
make olddefconfig
make clean                    # borra objetos, CONSERVA .config
fakeroot make -j$(nproc)

# Opcion B: agrandar el disco en Fusion
# VM apagada -> Settings -> Hard Disk -> subir tamaño -> Apply
# Luego en Debian:
sudo growpart /dev/nvme0n1 2 && sudo resize2fs /dev/nvme0n1p2
```

Si el que se llenó es `/boot`:

```bash
df -h /boot
ls -lhS /boot/                 # ordenado por tamaño: el initrd.img suele ser el culpable
dpkg --list | grep linux-image
# sudo apt remove --purge linux-image-<version-vieja>   # NUNCA la actual ni la tuya
sudo update-grub
```

> 🔧 **CAMPO — casi siempre es el `initrd.img`.** En la corrida real pesó **532 MB** porque `initramfs-tools` viene con `MODULES=most` y empaqueta todos los módulos del build. Si `/boot` no da:
>
> ```bash
> sudo sed -i 's/^MODULES=.*/MODULES=dep/' /etc/initramfs-tools/initramfs.conf
> sudo update-initramfs -c -k "$(uname -r)"     # o "$KREL" si aun no booteaste el tuyo
> ls -lh /boot/initrd.img-*
> ```
>
> ⚠️ `MODULES=dep` solo incluye los módulos del hardware **actual**. En una VM que no cambia de hardware es seguro; en un disco que vas a mover a otra máquina, no.

⛔ **`make clean` vs `mrproper` vs `distclean`:**

| Comando | Borra objetos | Borra `.config` |
|---|---|---|
| `make clean` | ✅ | ❌ (**usá este**) |
| `make mrproper` | ✅ | ✅ **borra tu configuración** |
| `make distclean` | ✅ | ✅ + archivos de editor |

**Nunca corras `mrproper` sin haber respaldado tu `.config`.** Perdés el trabajo de [§1.10](#p10) a [§1.13](#p13).

### E1.5 El compilador es matado (OOM) durante `LD vmlinux`

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

### E1.6 `error: 'gcc-plugins' ... plugin support is not available`

```bash
scripts/config --disable GCC_PLUGINS
make olddefconfig
```

### E1.7 `Makefile:3: *** missing separator. Stop.`

**Causa:** usaste **espacios** en vez de un **TAB** al inicio de una línea de receta.

```bash
cat -A Makefile | head        # ^I es TAB; los espacios se ven como espacios
# Corregí con nano presionando Tab al inicio de cada receta
```

### E1.8 `make localmodconfig` pregunta decenas de opciones

**Causa:** la config copiada es de otra serie de kernel.

```bash
yes "" | make localmodconfig      # acepta todos los defaults
```

---

> 🔧 **Los cinco errores que siguen (E1.9 – E1.13) son los que aparecieron en la corrida real de campo.** Ninguno estaba en la primera versión de este manual.

### E1.9 `libfakeroot internal error: payload not recognized!`

```text
libfakeroot internal error: payload not recognized!
```

**Causa:** bug conocido de `libfakeroot` en Debian 13 **arm64** al interceptar syscalls durante el linkado de `vmlinux`. **No es tu código, ni tu `.config`, ni tu disco.**

**Diagnóstico en 5 segundos** — ¿el build sigue avanzando?

```bash
tail -f ~/evidencias/log-compilacion.txt
```

| Ves | Veredicto |
|---|---|
| Siguen apareciendo `CC …`, `LD …`, `AR …`, `BTF …` | **Ignoralo.** El build está sano. |
| No pasa nada más / `make: *** Error` | Recompilá sin `fakeroot` (abajo) |

```bash
# Alternativa sin fakeroot: identica, solo cambia que instalás con sudo
cd ~/kernel/linux-$KVER
time ( make -j$(nproc) 2>&1 | tee ~/evidencias/log-compilacion.txt )
sudo make modules_install
sudo make install
```

> **Para el informe:** `fakeroot` existe para que `make install` pueda crear archivos con dueño `root` sin ser root. Como acá igual usamos `sudo` para instalar, **`fakeroot` es prescindible** en este flujo. Explicar eso vale más que el error en sí.

### E1.10 Loop infinito: desactivo `MODULE_SIG` y `olddefconfig` lo vuelve a activar

```bash
scripts/config --disable MODULE_SIG
make olddefconfig
grep MODULE_SIG .config
# CONFIG_MODULE_SIG=y      ← volvió
```

**Causa:** en Debian 13 arm64, `MODULE_SIG` está **forzado** por `select` desde `SYSTEM_TRUSTED_KEYRING` / el perfil de *lockdown*. En `make menuconfig` se ve como `-*-` y la barra espaciadora no responde. `make olddefconfig` existe justamente para restaurar la coherencia del árbol Kconfig, así que **siempre** lo va a volver a encender.

**Qué NO hacer:**

| Intento | Resultado |
|---|---|
| Repetir `--disable` + `olddefconfig` | Loop infinito |
| `sed -i` borrando las líneas del `.config` | `.config` inconsistente; `make` vuelve a preguntar al compilar |
| Desmarcarlo en `menuconfig` | No se puede: está en `-*-` |

**Solución — neutralizarlo sin desactivarlo:**

```bash
cd ~/kernel/linux-$KVER
scripts/config --set-str SYSTEM_TRUSTED_KEYS ""
scripts/config --set-str SYSTEM_REVOCATION_KEYS ""
scripts/config --disable SYSTEM_REVOCATION_LIST
scripts/config --disable MODULE_SIG_ALL
scripts/config --disable MODULE_SIG_FORCE
make olddefconfig

grep -E 'CONFIG_SYSTEM_TRUSTED_KEYS|CONFIG_MODULE_SIG_FORCE|CONFIG_MODULE_SIG_ALL' .config
```

Con esas tres líneas en su valor esperado, **`CONFIG_MODULE_SIG=y` no molesta**: el build genera su propia llave local y no exige firmas para cargar módulos. Detalle completo en [§1.11](#p11) y [§T6.1b](#t6).

### E1.11 El `grep` dice que la opción no existe, pero sí existe

```bash
grep -E '^CONFIG_MODULE_SIG=' .config
# (sin salida)  ← ¿desapareció la opción?
```

**Causa:** cuando una opción está **desactivada**, Kconfig no la borra: la escribe comentada.

```text
# CONFIG_MODULE_SIG is not set
```

El patrón `^CONFIG_MODULE_SIG=` **nunca** matchea eso, porque la línea empieza con `#`. Es un **falso negativo** que te hace creer que el `.config` está roto.

**Solución — greps que sí ven las dos formas:**

```bash
# Panorama completo (activadas y desactivadas)
grep -E 'CONFIG_MODULE_SIG[^_]|CONFIG_SYSTEM_TRUSTED_KEYS|CONFIG_SYSTEM_REVOCATION' .config

# Solo las tres condiciones que importan
grep -E 'CONFIG_SYSTEM_TRUSTED_KEYS|CONFIG_MODULE_SIG_FORCE|CONFIG_MODULE_SIG_ALL' .config
```

> **Regla general para todo el manual:** cuando busques una opción de Kconfig, **nunca ancles con `^CONFIG_`**. Buscá el nombre suelto y leé si la línea dice `=y`, `=m` o `is not set`.

### E1.12 El `.config` quedó corrupto y `make` pregunta cosas raras

**Síntoma en pantalla, literal, de la corrida real:**

```text
nVidia Framebuffer Support (FB_NVIDIA) [N/m/y/?] (NEW) Ycd ~/kernel/linux-6.12.69
```

**Causa:** se corrió `make oldconfig` **sin** `yes "" |`. El comando quedó en modo interactivo preguntando opción por opción. Al pegar el siguiente bloque de comandos del manual, el shell no lo ejecutó: se lo pasó a `oldconfig` **como respuestas**. `FB_NVIDIA` quedó en `Y` y el resto del texto se consumió como más respuestas.

**Recuperación:**

```bash
# 1. Ctrl+C para salir del prompt
# 2. Restaurar la config buena
cd ~/kernel/linux-$KVER
cp ~/evidencias/config-01-original.txt .config
# 3. Rehacer la secuencia, esta vez sin nada interactivo
yes "" | make localmodconfig
# ...y los scripts/config de §1.11 y §1.12
make olddefconfig
```

**Prevención — las tres reglas:**

| Regla | Comando |
|---|---|
| Preferí la variante que **no pregunta nada** | `make olddefconfig` |
| Si necesitás `oldconfig`, canalizalo | `yes "" \| make oldconfig` |
| Nunca pegues varias líneas mientras haya un prompt esperando | — |

### E1.13 `cd: /home/tu/kernel/linux-6.12.69: No such file or directory`

**Causa:** el directorio no existe porque bajaste **otra** versión. kernel.org rota los tarballs: la `6.12.69` puede no estar disponible; en la corrida real la versión fue **`6.12.102`**.

```bash
ls -d ~/kernel/linux-*                    # qué tenés de verdad
echo 'export KVER=6.12.102' >> ~/.bashrc  # fijá TU version
source ~/.bashrc
cd ~/kernel/linux-$KVER && pwd
```

**Si `echo $KVER` sale vacío en una terminal nueva:** `source ~/.bashrc`.

---

<a name="e2"></a>
## E2 — Errores de arranque

### E2.1 `VFS: Unable to mount root fs on unknown-block(0,0)` / `Kernel panic`

**Causa:** `localmodconfig` eliminó el driver del disco raíz, o el initramfs no lo incluye.

**Recuperación:**
1. **Virtual Machine → Restart**
2. **ESC** al arrancar → **Advanced options** → elegí el **kernel de Debian** (el viejo)
3. Ya adentro:

```bash
cd ~/kernel/linux-$KVER
# Reemplaza por el driver que anotaste en §1.9
scripts/config --module BLK_DEV_NVME
scripts/config --enable  NVME_CORE
scripts/config --module  SCSI_VMW_PVSCSI
scripts/config --enable  EXT4_FS
make olddefconfig
grep -E 'NVME|PVSCSI|EXT4_FS=' .config     # verificar
fakeroot make -j$(nproc)
sudo make modules_install && sudo make install
sudo update-initramfs -c -k "$(make -s kernelrelease)"
sudo update-grub
sudo reboot
```

> ⚠️ **No uses `cat ~/evidencias/kernel-release.txt` acá.** Si venís de restaurar un snapshot, ese archivo puede no existir y el `update-initramfs` se ejecutaría con la versión vacía. `make -s kernelrelease` siempre da el valor correcto → [§E2.9](#e2).

> 💡 **Este error es oro para el informe.** Documentá el mensaje literal, el diagnóstico y la solución: la sección 7 existe para esto.

### E2.2 Arranca pero no hay red

```bash
lsmod | grep vmxnet3
ip -brief addr show
# Si falta:
cd ~/kernel/linux-$KVER
scripts/config --module VMXNET3
make olddefconfig && fakeroot make -j$(nproc)
sudo make modules_install && sudo make install && sudo reboot
```

### E2.3 Arranca pero no hay entorno gráfico

```bash
lsmod | grep vmwgfx
cd ~/kernel/linux-$KVER
scripts/config --module DRM_VMWGFX
make olddefconfig && fakeroot make -j$(nproc)
sudo make modules_install && sudo make install && sudo reboot
```

### E2.4 `modprobe: FATAL: Module X not found`

**Causa:** olvidaste `make modules_install`, o `EXTRAVERSION` cambió después de compilar y los módulos quedaron en otra ruta.

```bash
ls -d /lib/modules/$(uname -r)              # debe existir
cd ~/kernel/linux-$KVER
sudo make modules_install
sudo depmod -a $(uname -r)
```

### E2.5 Mi kernel no aparece en el menú de GRUB

```bash
cd ~/kernel/linux-$KVER
KREL=$(make -s kernelrelease)
ls -l /boot/vmlinu?-$KREL /boot/initrd.img-$KREL   # ambos deben existir
sudo update-grub
sudo grep -c "$KREL" /boot/grub/grub.cfg           # debe ser > 0
```

> 🔧 En arm64 el kernel es `/boot/vmlinux-$KREL` (**sin `z`**) → [§E2.8](#e2).

### E2.6 No arranca nada, ni el kernel viejo

**Restaurá el snapshot.** Fusion → **Virtual Machine → Snapshots** → **`03-antes-de-instalar`** → **Restore**. Volvés al estado previo a tocar `/boot`, con la compilación intacta.

---

> 🔧 **Los tres que siguen (E2.7 – E2.9) salen de la corrida real. El E2.7 es el que más confunde: parece que fallaste cuando en realidad ya tenías todo bien.**

### E2.7 🔧 `uname -r` muestra el kernel VIEJO después del reboot

**Síntoma:**

```bash
uname -r
# 6.12.101+deb13-arm64        ← el de Debian, no el tuyo
```

**Esto NO significa que la compilación falló.** Verificá primero que tu kernel esté instalado:

```bash
ls -lh /boot/                                     # ¿está tu vmlinux-<ver>?
ls -d /lib/modules/*                              # ¿está tu directorio de módulos?
sudo grep -c "tunombre" /boot/grub/grub.cfg       # ¿está en el menú? (>0)
```

Si esas tres dan bien, **el kernel está instalado y en el menú: simplemente no fue el que arrancó.**

**Causa:** GRUB arranca la **primera entrada del menú principal** (`GRUB_DEFAULT=0`), que es el kernel empaquetado de Debian. Tu kernel vive dentro del submenú **Advanced options for Debian GNU/Linux**.

**Solución:**

1. `sudo reboot`
2. **ESC** repetidamente al arrancar. **En VMware Fusion + arm64 + UEFI es ESC, no SHIFT.**
3. **Advanced options for Debian GNU/Linux** → Enter.
4. Elegí la línea con **tu** nombre y carné → Enter.
5. `uname -r` → ahora sí.

**Si el menú no aparece** (arranca directo sin darte chance):

```bash
sudo sed -i 's/^GRUB_TIMEOUT=.*/GRUB_TIMEOUT=20/' /etc/default/grub
sudo sed -i 's/^#*GRUB_TIMEOUT_STYLE=.*/GRUB_TIMEOUT_STYLE=menu/' /etc/default/grub
grep -E 'GRUB_TIMEOUT|GRUB_DEFAULT|SUBMENU' /etc/default/grub
sudo update-grub
sudo reboot
```

Y si querés fijarlo como default — **solo después de haberlo booteado bien al menos una vez**:

```bash
KREL=$(uname -r)     # corrido YA dentro de tu kernel
UUID=$(findmnt -no UUID /)
sudo grub-set-default "gnulinux-advanced-$UUID>gnulinux-$KREL-advanced-$UUID"
sudo update-grub
```

> 💡 **Para el informe:** este "error" es en realidad una decisión de diseño de GRUB (conservar una ruta de recuperación). Explicarlo así vale más que reportarlo como falla.

### E2.8 🔧 `ls: /boot/vmlinuz-<ver>: No such file or directory`

**Síntoma:** después de `sudo make install`, el `ls` de verificación falla y parece que la instalación no hizo nada.

**Causa:** en **arm64** el kernel se instala como **`vmlinux-<ver>`, sin la `z`**. La `z` de `vmlinuz` (*zipped*) es convención de x86.

```bash
ls -lh /boot/                    # mirá qué hay realmente
ls -lh /boot/vmlinu?-*           # el comodín agarra vmlinux y vmlinuz
```

Ejemplo real:

```text
/boot/vmlinux-6.12.102-jbarrera-202012345
```

**No hay nada que arreglar:** `update-grub` lo detecta igual y el kernel arranca perfecto. Lo único que hay que corregir son **tus comandos de verificación**: usá `vmlinu?-` en vez de `vmlinuz-`. Detalle en [§T7.2](#t72).

### E2.9 🔧 `cat: /home/tu/evidencias/kernel-release.txt: No such file or directory`

**Causa:** el manual usa ese archivo como fuente de `$KREL` desde [§1.13](#p13). Si te saltaste ese paso, restauraste un snapshot anterior o simplemente abriste una terminal después de un `make mrproper`, el archivo no está — y `KREL` queda **vacío**, lo que hace que todos los `ls /boot/vmlinu?-` y `update-initramfs -k` posteriores apunten a nada.

**Solución — regeneralo, no lo busques.** El valor sale del Makefile:

```bash
cd ~/kernel/linux-$KVER
KREL=$(make -s kernelrelease)
echo "$KREL" > ~/evidencias/kernel-release.txt
echo "KREL = $KREL"
```

**Regla práctica:** en cualquier terminal nueva donde vayas a usar `$KREL`, corré `KREL=$(make -s kernelrelease)` desde el directorio del fuente. Es instantáneo y no depende de ningún archivo.

⚠️ **Con un `$KREL` vacío, `sudo update-initramfs -c -k ""` puede generar basura en `/boot`.** Siempre `echo "$KREL"` antes de usarlo en un comando con `sudo`.

---

<a name="e3"></a>
## E3 — Comandos de emergencia

| Situación | Comando |
|---|---|
| Ver qué versión bajé de verdad | `ls -d ~/kernel/linux-*` |
| Recuperar `$KVER` en una terminal nueva | `source ~/.bashrc && echo "$KVER"` |
| Ver la versión que se va a compilar | `make -s kernelrelease` |
| 🔧 Recuperar `$KREL` sin depender de archivos | `KREL=$(make -s kernelrelease); echo "$KREL"` |
| Reanudar un build interrumpido | `fakeroot make -j$(nproc)` (no recompila lo hecho) |
| 🔧 Compilar sin `fakeroot` (bug de arm64) | `make -j$(nproc)` + instalar con `sudo` |
| Limpiar objetos, conservar config | `make clean` |
| Respaldar la config | `cp .config ~/config-respaldo` |
| Restaurar la config | `cp ~/config-respaldo .config && make olddefconfig` |
| Ver qué cambió en la config | `diff ~/evidencias/config-01-original.txt .config \| head -60` |
| Buscar una opción de config | `grep -i '<palabra>' .config` ← 🔧 **sin `^CONFIG_`** |
| 🔧 Ver el estado real de las firmas | `grep -E 'CONFIG_SYSTEM_TRUSTED_KEYS\|CONFIG_MODULE_SIG_FORCE\|CONFIG_MODULE_SIG_ALL' .config` |
| Ver una opción en el Kconfig | `grep -rn 'config <NOMBRE>' --include=Kconfig .` |
| 🔧 Ver quién fuerza una opción a `-*-` | `grep -rn 'select <NOMBRE>' --include=Kconfig .` |
| 🔧 Ver los kernels instalados (arm64 y x86) | `ls -lh /boot/vmlinu?-*` |
| Regenerar el initramfs | `sudo update-initramfs -c -k <version>` |
| Regenerar el menú de GRUB | `sudo update-grub` |
| 🔧 Entrar al menú de GRUB en arm64/UEFI | **ESC** repetidamente al arrancar (no SHIFT) |
| Errores del último arranque | `sudo dmesg --level=err,crit` |
| Espacio ocupado por el build | `du -sh ~/kernel/linux-$KVER` |
| Volver a un estado sano | Fusion → Snapshots → Restore |

---
---

<a name="checklist-campo"></a>
# ✅ Checklist de campo (la lista corta)

> Sacada de la corrida real. Si marcás estas casillas, no te pasa ninguno de los errores de [PARTE 3](#parte-3).

**Antes de configurar:**

- [ ] `echo "$KVER"` imprime la versión que **realmente** bajaste
- [ ] `cd ~/kernel/linux-$KVER && pwd` funciona
- [ ] Copiaste `/boot/config-$(uname -r)` a `.config` **antes** de mirar los certificados

**Antes de compilar:**

- [ ] `make -s kernelrelease` muestra tu nombre y carné
- [ ] `grep CONFIG_SYSTEM_TRUSTED_KEYS .config` devuelve `""`
- [ ] `grep CONFIG_MODULE_SIG_FORCE .config` devuelve `is not set`
- [ ] `grep CONFIG_MODULE_SIG_ALL .config` devuelve `is not set`
- [ ] Sabés que `CONFIG_MODULE_SIG=y` **es correcto** y no lo peleás
- [ ] `df -h /` muestra ≥ 15 GB libres
- [ ] `make -s kernelrelease > ~/evidencias/kernel-release.txt` ya está hecho
- [ ] Los 2 snapshots (`01-debian-limpio`, `02-antes-de-compilar`) están tomados

**Durante la compilación:**

- [ ] Si aparece `libfakeroot internal error`, verificaste que el build siga y lo ignoraste

**Después de instalar:**

- [ ] `ls -lh /boot/` muestra los 4 archivos con tu versión
- [ ] Sabés que el kernel se llama **`vmlinux-<ver>`**, sin `z`
- [ ] `sudo update-grub` imprimió `Found linux image: /boot/vmlinux-<tu-versión>`
- [ ] El `initrd.img` de medio giga no te asustó
- [ ] Snapshot `03-antes-de-instalar` tomado **antes** de este bloque

**Después de reiniciar:**

- [ ] Apretaste **ESC** (no SHIFT) y elegiste tu kernel en **Advanced options**
- [ ] `uname -r` devuelve `<KVER>-tunombre-tucarne` — **si muestra el viejo, reiniciá y elegí bien; no rehagas nada**
- [ ] `lsmod | grep -Ei 'vmw|nvme'` muestra los drivers de VMware/NVMe cargados
- [ ] `findmnt /` muestra la raíz montada
- [ ] `ip -brief addr` muestra la interfaz de red con IP
- [ ] Snapshot `04-kernel-funcionando` tomado

---
---

# Resumen en una línea

Compilás un kernel de la serie **`6.12.x`** (fijá la versión real en `$KVER`, no la asumas) **nativamente para ARM64** en una VM **Debian 13 arm64** sobre VMware Fusion: copiás la config de Debian **primero**, la reducís con `localmodconfig`, **neutralizás** la verificación de firmas vaciando `SYSTEM_TRUSTED_KEYS` y apagando `MODULE_SIG_FORCE`/`_ALL` (a `MODULE_SIG` no lo vas a poder apagar y no hace falta), escribís tu nombre y carné en el `EXTRAVERSION` del Makefile, compilás con `make -j$(nproc)` ignorando el ruido de `libfakeroot`, instalás con `modules_install` + `install` — que en arm64 deja **`/boot/vmlinux-<ver>`, sin `z`** —, reiniciás, **apretás ESC y elegís tu kernel en Advanced options** (si no, arranca el viejo y parece que fallaste), y lo probás con `uname -r` — verificando en **cada** paso antes de avanzar, y guardando la evidencia de cada verificación para el informe.
