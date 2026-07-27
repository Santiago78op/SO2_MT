# Notas del orador - Modulos del Kernel Linux

Guion de la presentacion `Modulos del Kernel Linux.dc.html` (26 diapositivas).
Cada bloque es lo que se dice mientras esa diapositiva esta en pantalla.

## 01 - Portada

Material de referencia personal sobre módulos del kernel Linux en C, orientado a Pop!_OS y kernel 6.x.

## 02 - Contenido

Cuatro bloques: gestión, escritura, drivers y depuración, distribución y seguridad.

## 03 - Qué es un módulo

Un .ko es código objeto enlazable en caliente contra el kernel en ejecución.

## 04 - Monolítico vs. modular

Linux es monolítico pero modular: todo corre en un único espacio de direcciones privilegiado.

## 05 - Usuario vs. kernel

Las reglas de C cambian: no hay libc, la pila es diminuta, no hay coma flotante.

## 06 - Parte I

Divisor: gestión de módulos desde la línea de comandos.

## 07 - Ciclo de vida

Cuatro estados. El contador de referencias es lo que impide descargar un módulo en uso.

## 08 - Herramientas

insmod es primitivo; modprobe resuelve dependencias vía modules.dep.

## 09 - Rutas del sistema

Dónde vive todo en Pop!_OS: headers, módulos instalados, configuración de carga.

## 10 - Parte II

Divisor: escribir el módulo.

## 11 - hello.c

Sin main(): dos puntos de entrada declarados con module_init y module_exit.

## 12 - Makefile

El Makefile solo delega: el build real lo hace el árbol del kernel.

## 13 - Cargar y descargar

Flujo completo de prueba en Pop!_OS.

## 14 - Parámetros

module_param expone variables al usuario en tiempo de carga y por /sys.

## 15 - Metadatos

Las macros MODULE_* alimentan modinfo, el sistema de alias y udev.

## 16 - Parte III

Divisor: drivers y depuración.

## 17 - Char device: registro

Cuatro pasos: reservar el número mayor, cdev, clase, nodo en /dev.

## 18 - Char device: fops

file_operations conecta las syscalls del usuario con funciones del módulo.

## 19 - /proc y /sys

procfs para depuración rápida; sysfs es la interfaz correcta para atributos de dispositivo.

## 20 - Depuración

dmesg es el primer recurso; dynamic debug enciende pr_debug sin recompilar.

## 21 - Parte IV

Divisor: distribución y seguridad.

## 22 - Firma y Secure Boot

Con Secure Boot activo el kernel exige firma; se registra una clave MOK propia.

## 23 - DKMS

DKMS recompila el módulo automáticamente en cada actualización de kernel.

## 24 - Hardening

Un módulo cargable es la vía más directa a ejecución arbitraria en anillo 0.

## 25 - Errores comunes

Lista de verificación antes de dar por bueno un módulo.

## 26 - Cierre

Fuentes canónicas para seguir estudiando.

