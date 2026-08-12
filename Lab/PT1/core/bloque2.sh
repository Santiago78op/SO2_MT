#!/bin/bash
KVER="6.12.69"
KDIR="$HOME/kernel/linux-$KVER"
KDIR_T3="$HOME/kernel/linux-6.12.102"

cd "$HOME/kernel" || exit 1
SHA=$(grep " linux-${KVER}.tar.xz$" sha256sums.asc 2>/dev/null | sha256sum -c - 2>&1 \
      | grep -o 'OK\|FAILED' || echo "sin-asc")

cd "$KDIR" || { echo "ERROR: no existe $KDIR"; exit 1; }
SUB=$(grep -m1 '^SUBLEVEL' Makefile | tr -d ' ' | cut -d= -f2)

if [ -f "$KDIR_T3/.config" ]; then
    cp "$KDIR_T3/.config" .config; SRC="arbol-T3"
elif ls /boot/config-*jbarrera* >/dev/null 2>&1; then
    cp "$(ls -t /boot/config-*jbarrera* | head -1)" .config; SRC="/boot"
else
    SRC="NO-ENCONTRADO"
fi

if [ "$SRC" != "NO-ENCONTRADO" ]; then
    make olddefconfig >/dev/null 2>&1
    scripts/config --set-str SYSTEM_TRUSTED_KEYS ""
    scripts/config --set-str SYSTEM_REVOCATION_KEYS ""
    scripts/config --disable MODULE_SIG_ALL
    scripts/config --disable MODULE_SIG_FORCE
    scripts/config --disable SYSTEM_REVOCATION_LIST
    make olddefconfig >/dev/null 2>&1
fi

TK=$(grep '^CONFIG_SYSTEM_TRUSTED_KEYS=' .config | cut -d= -f2)
SF=$(grep -q '^CONFIG_MODULE_SIG_FORCE=y' .config && echo "ACTIVA-MAL" || echo "not-set")
SA=$(grep -q '^CONFIG_MODULE_SIG_ALL=y' .config && echo "ACTIVA-MAL" || echo "not-set")
LV=$(grep '^CONFIG_LOCALVERSION=' .config | cut -d= -f2)
KR=$(make -s kernelrelease 2>/dev/null)
BOOTP=$(findmnt -n -o SOURCE /boot 2>/dev/null || echo "no-separada")

echo "=== RESUMEN BLOQUE 2 ==="
echo "sha256       : $SHA"
echo "SUBLEVEL     : $SUB"
echo "config_src   : $SRC"
echo "TRUSTED_KEYS : $TK"
echo "SIG_FORCE    : $SF"
echo "SIG_ALL      : $SA"
echo "LOCALVERSION : $LV"
echo "kernelrelease: $KR"
echo "/boot        : $BOOTP"