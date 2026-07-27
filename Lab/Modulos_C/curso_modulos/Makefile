# Makefile "out-of-tree": no compilamos nosotros, delegamos en Kbuild.
#
# Este archivo se lee DOS veces:
#   1) Como Makefile normal, cuando ejecutás 'make' -> corre la regla 'all'.
#   2) Como fragmento de Kbuild, cuando el kernel lo reinvoca con M=$(PWD)
#      -> ahí solo le interesan las líneas 'obj-m'.
#
# IMPORTANTE: las líneas de receta van con TAB real, no espacios.

# obj-m = "construir como módulo cargable". El nombre del .o debe coincidir
# con el .c. El .ko final se llama igual.
obj-m += lab1_hola.o
obj-m += lab2_params.o
obj-m += lab3_procfs.o

# KDIR = árbol de headers del kernel EN EJECUCIÓN. Si compilás contra otra
# versión, insmod rechaza el módulo por "vermagic" distinto.
KDIR ?= /lib/modules/$(shell uname -r)/build
PWD  := $(CURDIR)

all:
	$(MAKE) -C $(KDIR) M=$(PWD) modules

clean:
	$(MAKE) -C $(KDIR) M=$(PWD) clean

# Atajos del laboratorio ------------------------------------------------

load1:
	sudo insmod lab1_hola.ko
unload1:
	sudo rmmod lab1_hola

load2:
	sudo insmod lab2_params.ko nombre="Saju" veces=3
unload2:
	sudo rmmod lab2_params

load3:
	sudo insmod lab3_procfs.ko
unload3:
	sudo rmmod lab3_procfs

# Ver los mensajes del kernel en vivo (Ctrl-C para salir)
log:
	sudo dmesg -wH

.PHONY: all clean load1 unload1 load2 unload2 load3 unload3 log
