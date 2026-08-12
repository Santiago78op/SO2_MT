#!/bin/bash
KDIR="$HOME/kernel/linux-6.12.69"
cd "$KDIR" || exit 1

# --- Fix LOCALVERSION ---
scripts/config --set-str LOCALVERSION "-jbarrera-202012345"
scripts/config --disable LOCALVERSION_AUTO
make olddefconfig >/dev/null 2>&1

LV=$(grep '^CONFIG_LOCALVERSION=' .config | cut -d= -f2)
LVA=$(grep -q '^CONFIG_LOCALVERSION_AUTO=y' .config && echo "ACTIVA-MAL" || echo "not-set")
KR=$(make -s kernelrelease 2>/dev/null)

# --- Reconocimiento ---
SL=$(readlink arch/arm64/tools/syscall_64.tbl 2>/dev/null || echo "NO-ES-SYMLINK")
LAST=$(awk '!/^#/ && NF {print $1}' scripts/syscall.tbl | sort -n | tail -1)
LASTLINE=$(awk -v n="$LAST" '$1==n' scripts/syscall.tbl)
NEXT=$((LAST + 1))
GL=$(grep -n "SYSCALL_DEFINE0(getpid)" kernel/sys.c | cut -d: -f1)
GBODY=$(sed -n "$(
TABS=$(tail -1 scripts/syscall.tbl | grep -qP '\t' && echo "si" || echo "NO")

echo "=== FIX LOCALVERSION ==="
echo "LOCALVERSION : $LV"
echo "LOCALVER_AUTO: $LVA"
echo "kernelrelease: $KR"
echo "=== BLOQUE 3 - RECONOCIMIENTO ==="
echo "symlink_arm64 : $SL"
echo "ultimo_syscall: $LASTLINE"
echo "MI_NUMERO     : $NEXT"
echo "getpid_linea  : $GL"
echo "getpid_cuerpo : $GBODY"
echo "proto_linea   : $PL"
echo "tabs_en_tbl   : $TABS"

/*
=== FIX LOCALVERSION ===
LOCALVERSION : "-jbarrera-202012345"
LOCALVER_AUTO: not-set
kernelrelease: 6.12.69
=== BLOQUE 3 - RECONOCIMIENTO ===
symlink_arm64 : ../../../scripts/syscall.tbl
ultimo_syscall: 462	common	mseal				sys_mseal
MI_NUMERO     : 463
getpid_linea  : 967
getpid_cuerpo :
 * the pid are identical unless CLONE_THREAD was specified on clone() in
 * which case the tgid is the same in all threads of the same group.
 *
 * This is SMP safe as current->tgid does not change.
 */
SYSCALL_DEFINE0(getpid)
{
	return task_tgid_vnr(current);
}

/* Thread ID - the internal kernel "pid" */
SYSCALL_DEFINE0(gettid)
{
	return task_pid_vnr(current);
}

/*
 * Accessing ->real_parent is not SMP-safe, it could
 * change from under us. However, we can use a stale
 * value of ->real_parent under rcu_read_lock(), see
 * release_task()->call_rcu(delayed_put_task_struct).
tabs_en_tbl   : si
*/