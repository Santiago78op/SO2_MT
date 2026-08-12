#include <stdio.h>
#include <unistd.h>
#include <sys/syscall.h>

/* Llamamos a la syscall 172 escribiendo el ensamblador nosotros,
 * sin pasar por ninguna función de glibc. */
static long getpid_a_mano(void)
{
        register long x8 asm("x8") = 172;   /* código de operación */
        register long x0 asm("x0");         /* acá vuelve el resultado */

        asm volatile ("svc #0"              /* EL TIMBRE */
                      : "=r" (x0)
                      : "r"  (x8)
                      : "memory", "cc");

        return x0;
}

int main(void)
{
        printf("getpid()             = %d\n",  getpid());
        printf("syscall(SYS_getpid)  = %ld\n", syscall(SYS_getpid));
        printf("syscall(172)         = %ld\n", syscall(172));
        printf("svc #0 a mano        = %ld\n", getpid_a_mano());
        return 0;
}

/*
Los cuatro tienen que dar el mismo número:

getpid()             = 2104
syscall(SYS_getpid)  = 2104
syscall(172)         = 2104
svc #0 a mano        = 2104 */