// SPDX-License-Identifier: GPL-2.0
/*
 * lab3_procfs.c — Hablar con el mundo: un contador en /proc.
 *
 * Objetivo didáctico: cruzar la frontera kernel/usuario correctamente.
 * Creamos /proc/contador_curso:
 *   cat /proc/contador_curso          -> lee el contador y lo incrementa
 *   echo 100 > /proc/contador_curso   -> fija el contador en 100
 *
 * Tres lecciones grandes acá:
 *   1. Nunca se desreferencia un puntero de usuario. Se usa copy_to_user /
 *      copy_from_user (o helpers como simple_read_from_buffer).
 *   2. Un read() tiene *offset*: el usuario puede leer en varias tandas.
 *      Ignorar el offset produce el clásico cat en bucle infinito.
 *   3. Todo lo que se crea en init se destruye en exit, en orden inverso.
 *      Un /proc huérfano deja el kernel con un puntero a código descargado
 *      = panic garantizado.
 */

#include <linux/atomic.h>
#include <linux/fs.h>
#include <linux/init.h>
#include <linux/kernel.h> /* scnprintf(), kstrtoint() */
#include <linux/module.h>
#include <linux/printk.h>
#include <linux/proc_fs.h>
#include <linux/string.h>  /* strim() */
#include <linux/uaccess.h> /* copy_from_user() */
#include <linux/version.h>

/*
 * La API del kernel no es estable entre versiones. En 5.6 las entradas de
 * /proc pasaron de 'struct file_operations' a 'struct proc_ops'.
 * Así se escribe un módulo que compila en ambos mundos.
 */
#if LINUX_VERSION_CODE >= KERNEL_VERSION(5, 6, 0)
#define TIENE_PROC_OPS
#endif

#define NOMBRE_PROC "contador_curso"

static struct proc_dir_entry *entrada_proc;

/*
 * atomic_t en vez de int: /proc puede ser leído por dos procesos a la vez,
 * en dos CPUs distintas. Un 'contador++' sobre un int es una carrera de datos.
 */
static atomic_t lecturas = ATOMIC_INIT(0);

static ssize_t contador_read(struct file *archivo, char __user *buf, size_t len,
                             loff_t *off)
{
    char tmp[64];
    int n;

    /*
     * Solo incrementamos en la PRIMERA pasada de esta lectura (*off == 0).
     * Si no, un archivo leído en dos tandas contaría doble.
     */
    if (*off == 0)
        atomic_inc(&lecturas);

    n = scnprintf(tmp, sizeof(tmp), "lecturas=%d\n", atomic_read(&lecturas));

    /*
     * simple_read_from_buffer() hace por nosotros lo tedioso y fácil de
     * arruinar: respeta *off, recorta a 'len', llama a copy_to_user() y
     * devuelve 0 cuando ya no queda nada (que es lo que hace terminar a cat).
     */
    return simple_read_from_buffer(buf, len, off, tmp, n);
}

static ssize_t contador_write(struct file *archivo, const char __user *buf,
                              size_t len, loff_t *off)
{
    char tmp[16];
    int nuevo;

    if (len == 0)
        return 0;

    /* Límite explícito: el buffer es nuestro y es chico. Nada de confiar en len. */
    if (len > sizeof(tmp) - 1)
        return -EINVAL;

    if (copy_from_user(tmp, buf, len))
        return -EFAULT; /* el puntero de usuario era inválido */

    tmp[len] = '\0'; /* el espacio de usuario NO manda cadenas terminadas */

    /* strim() quita el '\n' que deja echo; kstrtoint valida que sea número. */
    if (kstrtoint(strim(tmp), 10, &nuevo))
        return -EINVAL;

    if (nuevo < 0)
        return -EINVAL;

    atomic_set(&lecturas, nuevo);
    pr_info("lab3: contador fijado en %d\n", nuevo);

    /*
     * Se devuelve la cantidad de bytes consumidos. Devolver menos que 'len'
     * hace que write() se reintente; devolver más es corrupción.
     */
    return len;
}

#ifdef TIENE_PROC_OPS
static const struct proc_ops contador_ops = {
    .proc_read = contador_read,
    .proc_write = contador_write,
};
#else
static const struct file_operations contador_ops = {
    .read = contador_read,
    .write = contador_write,
};
#endif

static int __init lab3_init(void)
{
    /* 0644: root escribe, todos leen. NULL = raíz de /proc. */
    entrada_proc = proc_create(NOMBRE_PROC, 0644, NULL, &contador_ops);
    if (!entrada_proc) {
        pr_alert("lab3: no se pudo crear /proc/%s\n", NOMBRE_PROC);
        return -ENOMEM; /* falla limpia: no queda nada a medias */
    }

    pr_info("lab3: /proc/%s creado\n", NOMBRE_PROC);
    return 0;
}

static void __exit lab3_exit(void)
{
    /* Deshacer TODO lo de init. Este es el paso que la gente olvida. */
    proc_remove(entrada_proc);
    pr_info("lab3: /proc/%s eliminado (total lecturas: %d)\n", NOMBRE_PROC,
            atomic_read(&lecturas));
}

module_init(lab3_init);
module_exit(lab3_exit);

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Curso de módulos");
MODULE_DESCRIPTION("Contador de lecturas expuesto en /proc/contador_curso");
MODULE_VERSION("1.0");
