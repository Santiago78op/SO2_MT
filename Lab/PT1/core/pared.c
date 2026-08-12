#include <stdio.h>

int main(void)
{
        /* En arm64, el espacio del kernel arranca por acá */
        unsigned long *direccion_del_kernel = (unsigned long *)0xffff800000000000UL;

        printf("Voy a intentar leer memoria del kernel...\n");
        fflush(stdout);

        printf("Valor: %lu\n", *direccion_del_kernel);   /* acá muere */

        printf("Esta línea NUNCA se imprime.\n");
        return 0;
}