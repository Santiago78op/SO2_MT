# Errata y Mejoras al Manual — Tarea 3 Kernel (Campo real)

> Documento generado a partir de la sesión de compilación real en Debian 13 arm64 sobre VMware Fusion + Mac M5.
> Aplica al manual base que usa `linux-6.12.69` pero los problemas son idénticos para cualquier 6.12.x.

---

## 1. Directorio de trabajo: no asumir `linux-6.12.69`

**Problema:** El manual asume `~/kernel/linux-6.12.69/`, pero la versión descargada puede ser otra (ej. `6.12.102`). Todos los `cd` fallan si el directorio no existe.

**Solución:** Usar una variable de entorno o verificar antes de cada bloque:

```bash
KVER="6.12.102"   # ajustar a la versión real descargada
cd ~/kernel/linux-${KVER}
```

---

## 2. El `.config` por defecto NO trae `debian/canonical-certs.pem`

**Problema:** Si se corre `grep ... .config` antes de copiar `/boot/config-$(uname -r)`, `SYSTEM_TRUSTED_KEYS` aparece vacío y no se ve la ruta `debian/canonical-certs.pem`.

**Causa:** El tarball de kernel.org no tiene los certificados de Debian.

**Solución:** Siempre copiar primero la configuración del sistema:

```bash
cp /boot/config-$(uname -r) .config
make olddefconfig
```

**Después** verificar el estado de las firmas.

---

## 3. NO pegar bloques de comandos durante `make oldconfig` interactivo

**Problema:** `make oldconfig` (sin `yes "" |`) entra en modo interactivo. Si se pega un bloque de texto con múltiples comandos, el shell lo interpreta como respuestas a las preguntas de configuración, corrompiendo el `.config`.

**Ejemplo real:**
```text
nVidia Framebuffer Support (FB_NVIDIA) [N/m/y/?] (NEW) Ycd ~/kernel/linux-6.12.69
```

**Solución:**
- Usar `yes "" | make oldconfig` o directamente `make olddefconfig` (preferido).
- Nunca pegar texto durante un prompt interactivo.

---

## 4. Loop infinito: `scripts/config` desactiva `MODULE_SIG`, pero `make olddefconfig` lo reactiva

**Problema:** En Debian 13, el default de `MODULE_SIG` en el árbol Kconfig es `y`. Si se usa:

```bash
scripts/config --disable MODULE_SIG
make olddefconfig
```

`olddefconfig` detecta la inconsistencia y vuelve a activar `MODULE_SIG` (a veces cambiando el algoritmo de SHA256 a SHA1 o de RSA a ECDSA).

**Intentos fallidos:**
- `sed -i` para borrar líneas del `.config` → deja el archivo inconsistente y `make` vuelve a preguntar al compilar.
- `scripts/config` seguido de `olddefconfig` → loop infinito.

**Solución real:**
En Debian 13 arm64, `MODULE_SIG` está marcado como **obligatorio** (`-*-` en `menuconfig`) porque es requerido por `SYSTEM_TRUSTED_KEYRING` o el lockdown del kernel. **No se puede desactivar completamente** desde `menuconfig`.

Lo que SÍ se puede hacer (y es suficiente para que el build no muera) es:

```bash
scripts/config --set-str SYSTEM_TRUSTED_KEYS ""
scripts/config --set-str SYSTEM_REVOCATION_KEYS ""
scripts/config --disable MODULE_SIG_ALL
scripts/config --disable MODULE_SIG_FORCE
scripts/config --disable SYSTEM_REVOCATION_LIST
make olddefconfig
```

**Verificación final válida:**
```bash
grep -E 'CONFIG_SYSTEM_TRUSTED_KEYS|CONFIG_MODULE_SIG_FORCE|CONFIG_MODULE_SIG_ALL' .config
```

**Esperado:**
```text
CONFIG_SYSTEM_TRUSTED_KEYS=""
# CONFIG_MODULE_SIG_FORCE is not set
# CONFIG_MODULE_SIG_ALL is not set
```

> Nota: `CONFIG_MODULE_SIG=y` puede quedar activo, pero como `FORCE` y `ALL` están desactivados y las rutas de certificados están vacías, el build usa su propia clave local (`certs/signing_key.pem`) y no falla.

---

## 5. `grep -E '^CONFIG_MODULE_SIG='` es un patrón defectuoso

**Problema:** Cuando `MODULE_SIG` está desactivado, la línea es:
```text
# CONFIG_MODULE_SIG is not set
```

El patrón `^CONFIG_MODULE_SIG=` **no la encuentra** porque empieza con `#`.

**Solución:** Usar un grep más amplio:

```bash
grep -E 'CONFIG_MODULE_SIG[^_]|CONFIG_SYSTEM_TRUSTED_KEYS|CONFIG_SYSTEM_REVOCATION' .config
```

O verificar directamente las condiciones críticas:
```bash
grep -E 'CONFIG_SYSTEM_TRUSTED_KEYS|CONFIG_MODULE_SIG_FORCE|CONFIG_MODULE_SIG_ALL' .config
```

---

## 6. `libfakeroot internal error: payload not recognized!` en arm64

**Problema:** Durante la compilación aparece:
```text
libfakeroot internal error: payload not recognized!
```

**Impacto:** El build **no se detiene**. Es un bug conocido de `libfakeroot` en Debian 13 arm64 al interceptar syscalls durante el linkado de `vmlinux`.

**Solución:** Si la compilación sigue avanzando (se ven líneas de `LD`, `AR`, `BTF` después), **ignorarlo**. Si el build se cuelga o falla al final, recompilar sin `fakeroot`:

```bash
# Compilación
make -j$(nproc) 2>&1 | tee ~/evidencias/log-compilacion.txt

# Instalación con sudo
sudo make modules_install
sudo make install
```

---

## 7. En ARM64 el kernel se instala como `vmlinux`, no `vmlinuz`

**Problema:** El manual usa `ls -lh /boot/vmlinuz-$KREL` para verificar, pero en arm64 el archivo se llama `vmlinux-6.12.xxx` (sin la `z`).

**Ejemplo real:**
```text
/boot/vmlinux-6.12.102-jbarrera-202012345
```

**Solución:** Adaptar los comandos de verificación:

```bash
ls -lh /boot/vmlinux-$KREL /boot/initrd.img-$KREL /boot/System.map-$KREL /boot/config-$KREL
```

O listar todo `/boot`:
```bash
ls -lh /boot/
```

---

## 8. Archivo `~/evidencias/kernel-release.txt` puede no existir

**Problema:** El manual asume que existe `~/evidencias/kernel-release.txt` (creado en §1.13), pero si se saltó ese paso o se reinició la terminal, el comando:

```bash
KREL=$(cat ~/evidencias/kernel-release.txt)
```

falla con `No such file or directory`.

**Solución:** Recrearlo al vuelo antes de usarlo:

```bash
KREL=$(make -s kernelrelease)
echo "$KREL" > ~/evidencias/kernel-release.txt
```

O simplemente usar `make -s kernelrelease` directamente en cada paso.

---

## 9. Reiniciar NO es suficiente: hay que seleccionar el kernel en GRUB

**Problema:** Después de `sudo reboot`, el sistema arranca con el kernel **viejo** de Debian porque GRUB selecciona el primero de la lista por defecto.

**Síntoma:**
```bash
uname -r
# 6.12.101+deb13-arm64   <-- kernel viejo, no el compilado
```

**Solución:**
1. Al arrancar la VM, apretar **ESC** repetidamente (en UEFI/arm64) para entrar al menú de GRUB.
2. Elegir **"Advanced options for Debian GNU/Linux"** → Enter.
3. Seleccionar el kernel con tu nombre: `6.12.102-jbarrera-202012345`.
4. Verificar:
   ```bash
   uname -r
   # 6.12.102-jbarrera-202012345   <-- correcto
   ```

**Nota:** El manual menciona SHIFT para x86/BIOS, pero en VMware Fusion + ARM64 + UEFI se usa **ESC**.

---

## 10. `make menuconfig` puede mostrar `MODULE_SIG` como `-*-` (no modificable)

**Problema:** Al intentar desactivar `Module signature verification` en `menuconfig`, aparece `-*-` en vez de `[ ]` o `[*]`, y la barra espaciadora no hace nada.

**Causa:** Otra opción del Kconfig (ej. `SYSTEM_TRUSTED_KEYRING` o el perfil de seguridad de Debian) lo fuerza a `y`.

**Solución:** No perder tiempo intentando desactivarlo. Volver a la estrategia de §4: vaciar las rutas de certificados y desactivar `FORCE`/`ALL`.

---

## 11. El initramfs generado puede ser muy grande (>500 MB)

**Observación:** En la compilación real, `initrd.img-6.12.102-jbarrera-202012345` pesó **532 MB**.

**Causa:** El initramfs incluye todos los módulos construidos, firmwares y herramientas de rescate.

**Impacto:** No bloquea el arranque, pero ocupa espacio en `/boot`.

**Solución (opcional):** Si `/boot` se llena, reducir el tamaño del initramfs editando `/etc/initramfs-tools/initramfs.conf` y limitando `MODULES=dep` en lugar de `MODULES=most`, pero esto va más allá del alcance de la tarea.

---

## Checklist de verificación final (resumido)

Antes de compilar:
- [ ] `make -s kernelrelease` muestra tu nombre y carné.
- [ ] `grep SYSTEM_TRUSTED_KEYS .config` devuelve `""`.
- [ ] `grep MODULE_SIG_FORCE .config` devuelve `is not set`.
- [ ] `grep MODULE_SIG_ALL .config` devuelve `is not set`.
- [ ] `df -h /` muestra ≥ 15 GB libres.

Después de instalar:
- [ ] `ls /boot/` muestra los 4 archivos con tu versión.
- [ ] `sudo update-grub` muestra `Found linux image: /boot/vmlinux-6.12.xxx-tunombre`.

Después de reiniciar:
- [ ] Apreté ESC y elegí mi kernel en **Advanced options**.
- [ ] `uname -r` devuelve `6.12.xxx-tunombre-tucarne`.
- [ ] `lsmod | grep -Ei 'vmw|nvme'` muestra los drivers de VMware/NVMe cargados.
- [ ] `findmnt /` muestra la raíz montada.
- [ ] `ip -brief addr` muestra la interfaz de red con IP.

---

*Generado el 2026-08-07 a partir de la sesión real de compilación del kernel 6.12.102 en Debian 13 arm64.*
