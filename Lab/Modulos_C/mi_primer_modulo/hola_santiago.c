/*
 * hola_santiago.c - Mi primer modulo del kernel Linux.
 *
 * Imprime un mensaje al cargarse y otro al descargarse.
 */

#include <linux/module.h>   /* Esto lo necesita TODO modulo */
#include <linux/init.h>     /* Para module_init y module_exit */
#include <linux/printk.h>   /* Para pr_info (el "printf" del kernel) */

/* Esta funcion se ejecuta cuando CARGO el modulo (insmod) */
static int __init hola_init(void)
{
    pr_info("Hola, Santiago Barrera - Carnet 201905884\n");
    return 0;   /* 0 significa "todo salio bien" */
}

/* Esta funcion se ejecuta cuando DESCARGO el modulo (rmmod) */
static void __exit hola_exit(void)
{
    pr_info("Adios, Santiago Barrera - Carnet 201905884\n");
}

/* Le decimos al kernel cual funcion es la de entrada y cual la de salida */
module_init(hola_init);
module_exit(hola_exit);

/* Datos del modulo. La licencia es obligatoria. */
MODULE_LICENSE("GPL");
MODULE_AUTHOR("Santiago Barrera - 201905884");
MODULE_DESCRIPTION("Mi primer modulo: saluda al cargar y al descargar");
MODULE_VERSION("1.0");
