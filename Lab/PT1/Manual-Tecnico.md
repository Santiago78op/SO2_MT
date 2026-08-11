# Modificación de funciones del kernel

## ¿Qué es realmente una llamada al sistema?

Un programa en C corre en **espacio de usuario** (en ARM64: nivel de excepción **EL0**). El kernel corre en **espacio de kernel** (**EL1**). Son dos mundos con privilegios distintos, y la separación la impone el **hardware**, no el software.

### Niveles y tipos de excepción (Arquitectura AArch64)

+ EL0 — Aplicaciones normales de usuario.
+ EL1 — Kernel (núcleo) del sistema operativo, típicamente descrito como privilegiado. 
+ EL2 — Hipervisor.
+ EL3 — Firmware de bajo nivel, incluido el Monitor Seguro.

![aarch64](./img/aarch64.png)

En EL0 la CPU **físicamente prohíbe**:
- ejecutar instrucciones privilegiadas (cambiar tablas de páginas, apagar interrupciones),
- leer o escribir memoria marcada como del kernel,
- hablarle directo al hardware.

Entonces, ¿cómo hace un programa para obtener su PID, si esa información vive en una estructura del kernel? No puede leerla. Lo que puede hacer es **pedir que el kernel la lea por él**.

Ese pedido es la llamada al sistema: **la única puerta legítima de EL0 a EL1**. Y es una puerta angosta a propósito — no se puede saltar a cualquier dirección del kernel, solo se puede decir *"ejecutá la operación número N"*. El kernel valida N contra su tabla y ejecuta solo lo que está registrado ahí.

> Una syscall no es una llamada a función. Es una **excepción controlada** — se le pide al hardware que suba el nivel de privilegio y salte a un punto de entrada fijo del kernel. Es más parecido a una interrupción que a un `call`.

## El recorrido de `getpid()`

Esto es lo que pasa cuando se escribe `getpid()` en C: