// SPDX-License-Identifier: GPL-2.0
/*
 * lab1_hola.c — El módulo mínimo viable.
 *
 * Objetivo didáctico: entender que un módulo NO es un programa.
 * No tiene main(). Tiene dos ganchos (hooks) que el kernel llama:
 *   - uno cuando lo cargás   (insmod)
 *   - uno cuando lo descargás (rmmod)
 * Entre esos dos momentos el módulo no "corre": duerme. Solo despierta
 * cuando alguien lo invoca (una syscall, una interrupción, un timer).
 */

#include <linux/init.h>   /* macros module_init() / module_exit(), __init, __exit */
#include <linux/module.h> /* obligatorio en TODO módulo: MODULE_*, THIS_MODULE   */
#include <linux/printk.h> /* pr_info(), pr_err(), pr_alert()                     */

/*
 * __init le dice al kernel: "esta función solo se usa una vez, al cargar".
 * El kernel libera esa memoria después de ejecutarla. Es un ahorro real,
 * no un adorno.
 *
 * static: la función no se exporta al espacio de nombres global del kernel.
 * Sin static, tu 'init' colisiona con los símbolos de otros 20.000 módulos.
 */
static int __init lab1_init(void)
{
    pr_info("lab1: hola, mundo del kernel\n");

    /*
     * El valor de retorno ES el contrato con insmod:
     *   0        -> módulo cargado
     *   negativo -> falló; el kernel deshace la carga e insmod devuelve error
     *
     * Nunca se devuelve un positivo, y nunca se devuelve un código propio:
     * se usan los errores estándar en negativo (-ENOMEM, -EINVAL, -EBUSY...).
     */
    return 0;
}

/*
 * __exit: si el módulo se compila dentro del kernel (built-in, no cargable),
 * esta función se descarta directamente porque nunca podría llamarse.
 */
static void __exit lab1_exit(void)
{
    pr_info("lab1: adiós, mundo del kernel\n");
}

/* Registro de los ganchos. Sin estas dos líneas el módulo carga y no hace nada. */
module_init(lab1_init);
module_exit(lab1_exit);

/*
 * Metadatos. MODULE_LICENSE no es burocracia:
 * si no declarás una licencia compatible con GPL, el kernel se marca como
 * "tainted" (contaminado) y tu módulo pierde acceso a los símbolos exportados
 * con EXPORT_SYMBOL_GPL, que son la mayoría de los interesantes.
 */
MODULE_LICENSE("GPL");
MODULE_AUTHOR("Curso de módulos");
MODULE_DESCRIPTION("Módulo mínimo: solo saluda al cargar y al descargar");
MODULE_VERSION("1.0");
