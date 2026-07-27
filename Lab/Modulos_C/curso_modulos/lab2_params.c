// SPDX-License-Identifier: GPL-2.0
/*
 * lab2_params.c — Parámetros de módulo.
 *
 * Objetivo didáctico: un módulo no recibe argv[]. Recibe *parámetros*
 * declarados, que el kernel parsea y valida por tipo antes de llamar a init.
 *
 *   sudo insmod lab2_params.ko nombre="Saju" veces=3
 *
 * Y si les das permisos distintos de 0, además quedan visibles (y a veces
 * escribibles) en caliente desde:
 *   /sys/module/lab2_params/parameters/
 */

#include <linux/init.h>
#include <linux/module.h>
#include <linux/moduleparam.h>
#include <linux/printk.h>

/*
 * Valores por defecto. Si el usuario no pasa nada, se usan estos.
 * Siempre 'static': son variables globales del módulo, no del kernel.
 */
static char *nombre = "mundo";
static int veces = 1;
static bool ruidoso;

/*
 * module_param(variable, tipo, permisos)
 *
 * tipo: byte, short, ushort, int, uint, long, ulong, charp, bool, invbool
 * permisos: modo del archivo en /sys/module/<mod>/parameters/<var>
 *           0     -> no aparece en sysfs
 *           0444  -> visible para todos, solo lectura
 *           0644  -> root puede escribirlo EN CALIENTE (ojo: sin avisarte)
 *
 * Regla de oro: si el parámetro es escribible en sysfs, tu código debe
 * tolerar que cambie en cualquier momento. No lo cachees asumiendo que es fijo.
 */
module_param(nombre, charp, 0444);
MODULE_PARM_DESC(nombre, "A quién saludar (cadena)");

module_param(veces, int, 0444);
MODULE_PARM_DESC(veces, "Cuántas veces saludar (1-10)");

module_param(ruidoso, bool, 0644);
MODULE_PARM_DESC(ruidoso, "Si es true, usa pr_warn en vez de pr_info");

static int __init lab2_init(void)
{
    int i;

    /*
     * VALIDÁ SIEMPRE los parámetros. Vienen de espacio de usuario.
     * Un módulo que confía en su entrada es un bug de seguridad esperando turno.
     * Fallar en init es la forma correcta y limpia de rechazar basura.
     */
    if (veces < 1 || veces > 10) {
        pr_err("lab2: 'veces' fuera de rango (%d), debe estar entre 1 y 10\n",
               veces);
        return -EINVAL; /* insmod fallará con "Invalid argument" */
    }

    if (!nombre || !*nombre) {
        pr_err("lab2: 'nombre' no puede estar vacío\n");
        return -EINVAL;
    }

    for (i = 1; i <= veces; i++) {
        if (ruidoso)
            pr_warn("lab2: ¡HOLA %s! (%d/%d)\n", nombre, i, veces);
        else
            pr_info("lab2: hola %s (%d/%d)\n", nombre, i, veces);
    }

    return 0;
}

static void __exit lab2_exit(void)
{
    pr_info("lab2: adiós %s\n", nombre);
}

module_init(lab2_init);
module_exit(lab2_exit);

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Curso de módulos");
MODULE_DESCRIPTION("Demostración de parámetros de módulo y su validación");
MODULE_VERSION("1.0");
