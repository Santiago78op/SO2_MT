# Makefile del laboratorio - dos modulos independientes.
# OJO: las lineas de receta van con TAB, no con espacios.

obj-m += hola_santiago.o
obj-m += hola_params.o

KDIR ?= /lib/modules/$(shell uname -r)/build
PWD  := $(CURDIR)

all:
	$(MAKE) -C $(KDIR) M=$(PWD) modules

clean:
	$(MAKE) -C $(KDIR) M=$(PWD) clean
