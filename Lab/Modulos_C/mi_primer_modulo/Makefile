# Makefile para compilar hola_santiago.c
# OJO: las lineas de abajo van con TAB, no con espacios.

obj-m += hola_santiago.o

all:
	make -C /lib/modules/$(shell uname -r)/build M=$(CURDIR) modules

clean:
	make -C /lib/modules/$(shell uname -r)/build M=$(CURDIR) clean
