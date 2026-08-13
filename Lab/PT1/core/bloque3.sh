#!/bin/bash
# ============================================================================
# Practica 1 - Sistemas Operativos 2 - 2S2026 - Carne 201905884
#
# Fija el identificador de version local y verifica el arbol de fuentes
# linux-6.12.69 antes de modificar el codigo.
#
# Uso:  bash bloque3.sh
# ============================================================================

KDIR="$HOME/kernel/linux-6.12.69"
CARNE="201905884"
USUARIO="jbarrera"          # <-- ajustar si se desea otro nombre en el kernel

cd "$KDIR" || { echo "ERROR: no existe $KDIR"; exit 1; }

# --- Identificador de version local -----------------------------------------
scripts/config --set-str LOCALVERSION "-${USUARIO}-${CARNE}"
scripts/config --disable LOCALVERSION_AUTO
make olddefconfig >/dev/null 2>&1
make syncconfig   >/dev/null 2>&1   # imprescindible: regenera include/config/auto.conf

LV=$(grep '^CONFIG_LOCALVERSION=' .config | cut -d= -f2)
LVA=$(grep -q '^CONFIG_LOCALVERSION_AUTO=y' .config && echo "ACTIVA-MAL" || echo "not-set")
KR=$(make -s kernelrelease 2>/dev/null)

# --- Firmas de modulos ------------------------------------------------------
TK=$(grep '^CONFIG_SYSTEM_TRUSTED_KEYS=' .config | cut -d= -f2)
SF=$(grep -q '^CONFIG_MODULE_SIG_FORCE=y' .config && echo "ACTIVA-MAL" || echo "not-set")
SA=$(grep -q '^CONFIG_MODULE_SIG_ALL=y'   .config && echo "ACTIVA-MAL" || echo "not-set")

# --- Reconocimiento del arbol -----------------------------------------------
SL=$(readlink arch/arm64/tools/syscall_64.tbl 2>/dev/null || echo "NO-ES-SYMLINK")
LAST=$(awk '!/^#/ && NF {print $1}' scripts/syscall.tbl | sort -n | tail -1)
LASTLINE=$(awk -v n="$LAST" '$1==n' scripts/syscall.tbl)
NEXT=$((LAST + 1))
GL=$(grep -n "SYSCALL_DEFINE0(getpid)" kernel/sys.c | head -1 | cut -d: -f1)
GBODY=$(awk -v n="$GL" 'NR==n+2' kernel/sys.c | sed 's/^[[:space:]]*//')
PL=$(grep -n "asmlinkage long sys_getpid(void);" include/linux/syscalls.h | cut -d: -f1)
TABS=$(tail -1 scripts/syscall.tbl | awk -F'\t' '{print (NF>1) ? "si" : "NO"}')

echo "=== VERSION LOCAL ==="
echo "LOCALVERSION  : $LV"
echo "LOCALVER_AUTO : $LVA"
echo "kernelrelease : $KR"
echo "=== FIRMAS DE MODULOS ==="
echo "TRUSTED_KEYS  : $TK"
echo "SIG_FORCE     : $SF"
echo "SIG_ALL       : $SA"
echo "=== RECONOCIMIENTO DEL ARBOL ==="
echo "symlink_arm64 : $SL"
echo "ultimo_syscall: $LASTLINE"
echo "MI_NUMERO     : $NEXT"
echo "getpid_linea  : $GL"
echo "getpid_cuerpo : $GBODY"
echo "proto_linea   : $PL"
echo "tabs_en_tbl   : $TABS"

# ============================================================================
# Salida esperada:
#
#   LOCALVERSION  : "-jbarrera-201905884"
#   LOCALVER_AUTO : not-set
#   kernelrelease : 6.12.69-jbarrera-201905884
#   TRUSTED_KEYS  : ""
#   SIG_FORCE     : not-set
#   SIG_ALL       : not-set
#   symlink_arm64 : ../../../scripts/syscall.tbl
#   ultimo_syscall: 462  common  mseal  sys_mseal
#   MI_NUMERO     : 463
#   getpid_linea  : 967
#   getpid_cuerpo : return task_tgid_vnr(current);
#   proto_linea   : <numero de linea>
#   tabs_en_tbl   : si
# ============================================================================
