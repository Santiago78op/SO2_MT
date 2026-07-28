/*
 * hola_params.c - Mi segundo modulo: el saludo ya no esta fijo en el codigo.
 *
 * Los valores llegan al cargar el modulo:
 *   sudo insmod hola_params.ko nombre="Santiago Barrera" carnet=201905884
 */

#include <linux/module.h>
#include <linux/init.h>
#include <linux/printk.h>
#include <linux/moduleparam.h>   /* module_param y MODULE_PARM_DESC */

/* Valores por defecto: se usan si el usuario no pasa nada.
 * Siempre static: son variables globales de MI modulo, no del kernel. */
static char *nombre = "Estudiante";
static int carnet;
static bool ruidoso;

/* module_param(variable, tipo, permisos)
 *
 * tipo     -> charp (puntero a char), int, bool, short, long, uint...
 * permisos -> modo del archivo en /sys/module/hola_params/parameters/
 *             0      = no aparece en sysfs
 *             0444   = visible, solo lectura
 *             0644   = root puede cambiarlo EN CALIENTE
 */
module_param(nombre, charp, 0444);
MODULE_PARM_DESC(nombre, "Nombre a saludar");

module_param(carnet, int, 0444);
MODULE_PARM_DESC(carnet, "Numero de carnet (obligatorio, mayor que cero)");

module_param(ruidoso, bool, 0644);
MODULE_PARM_DESC(ruidoso, "Si es true usa pr_warn en lugar de pr_info");

static int __init hola_params_init(void)
{
    /* VALIDAR SIEMPRE. Los parametros vienen del espacio de usuario,
     * o sea que son entrada no confiable. Fallar en init es la forma
     * limpia y correcta de rechazar valores invalidos. */
    if (!nombre || !*nombre) {
        pr_err("hola_params: 'nombre' no puede estar vacio\n");
        return -EINVAL;   /* insmod fallara con "Invalid argument" */
    }

    if (carnet <= 0) {
        pr_err("hola_params: 'carnet' invalido (%d), debe ser mayor que cero\n",
               carnet);
        return -EINVAL;
    }

    if (ruidoso)
        pr_warn("Hola, %s - Carnet %d\n", nombre, carnet);
    else
        pr_info("Hola, %s - Carnet %d\n", nombre, carnet);

    return 0;
}

static void __exit hola_params_exit(void)
{
    pr_info("Adios, %s - Carnet %d\n", nombre, carnet);
}

module_init(hola_params_init);
module_exit(hola_params_exit);

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Santiago Barrera - 201905884");
MODULE_DESCRIPTION("Saludo configurable por parametros de modulo");
MODULE_VERSION("1.0");
