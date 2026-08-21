#!/usr/bin/env python3
"""
sincronizar.py — valida (y opcionalmente repara) que los dos repos esten iguales.

EL PROBLEMA QUE RESUELVE
El material vive espejado en dos repos, y se trabaja en dos maquinas:

    SO2_MT   ~/Desktop/SO2/AYD_2/Ayd          el vault de trabajo
    MCP-AYD  ~/Desktop/tutor-ayds/boveda      la copia que sirve el MCP

Si se edita en uno y no en el otro, la segunda maquina trabaja con material
viejo. Ya paso: la otra maquina seguia la regla vieja de tutoria porque el
CLAUDE.md del tutor no se habia actualizado.

USO
    python sincronizar.py                 solo revisa e informa
    python sincronizar.py --aplicar       copia del vault hacia la boveda
    python sincronizar.py --raiz-vault X --raiz-tutor Y   rutas distintas

Sale con codigo 0 si todo esta alineado, 1 si hay desfases.

EXCEPCIONES LEGITIMAS (no se espejan, y no cuentan como desfase)
    .claude/     configuracion local de la maquina
    CLAUDE.md    el vault tiene el suyo; el repo del tutor tiene otro en su raiz

Este script SI se espeja, y se valida a si mismo como cualquier otro archivo.
"""

import argparse
import filecmp
import os
import subprocess
import sys

EXCEPCIONES = {".claude", "CLAUDE.md"}

VAULT = os.path.expanduser(r"~/Desktop/SO2/AYD_2/Ayd")
TUTOR = os.path.expanduser(r"~/Desktop/tutor-ayds")


def listar(raiz):
    """Rutas relativas de todos los archivos, saltando las excepciones."""
    out = {}
    for base, dirs, files in os.walk(raiz):
        dirs[:] = [d for d in dirs if d not in EXCEPCIONES and d != ".git"]
        for f in files:
            ruta = os.path.join(base, f)
            rel = os.path.relpath(ruta, raiz).replace("\\", "/")
            if rel.split("/")[0] in EXCEPCIONES:
                continue
            out[rel] = ruta
    return out


def git(repo, *args):
    try:
        r = subprocess.run(["git", "-C", repo, *args],
                           capture_output=True, text=True, timeout=60)
        return r.stdout.strip()
    except Exception as e:
        return f"(error: {e})"


def main():
    ap = argparse.ArgumentParser(add_help=True)
    ap.add_argument("--aplicar", action="store_true",
                    help="copia del vault a la boveda lo que falte o difiera")
    ap.add_argument("--raiz-vault", default=VAULT)
    ap.add_argument("--raiz-tutor", default=TUTOR)
    a = ap.parse_args()

    vault, tutor = a.raiz_vault, a.raiz_tutor
    boveda = os.path.join(tutor, "boveda")

    for r in (vault, boveda):
        if not os.path.isdir(r):
            print(f"ERROR: no existe {r}")
            return 2

    A, B = listar(vault), listar(boveda)
    solo_vault = sorted(set(A) - set(B))
    solo_boveda = sorted(set(B) - set(A))
    distintos = sorted(k for k in set(A) & set(B)
                       if not filecmp.cmp(A[k], B[k], shallow=False))

    print("=" * 68)
    print("ESPEJO  vault <-> boveda")
    print("=" * 68)
    print(f"  archivos en el vault : {len(A)}")
    print(f"  archivos en la boveda: {len(B)}")

    def bloque(titulo, items, marca):
        if items:
            print(f"\n  {marca} {titulo} ({len(items)})")
            for k in items[:40]:
                print(f"      {k}")
            if len(items) > 40:
                print(f"      ... y {len(items) - 40} mas")

    bloque("solo en el vault (falta espejar)", solo_vault, "FALTA")
    bloque("solo en la boveda (huerfano o borrado en el vault)", solo_boveda, "SOBRA")
    bloque("con contenido distinto", distintos, "DIFIERE")

    desfases = len(solo_vault) + len(solo_boveda) + len(distintos)
    if desfases == 0:
        print("\n  OK: los dos lados son identicos "
              "(excepto .claude/ y CLAUDE.md, que no se espejan)")

    if a.aplicar and (solo_vault or distintos):
        print("\n  --aplicar: copiando del vault a la boveda")
        import shutil
        for k in solo_vault + distintos:
            dst = os.path.join(boveda, k)
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copy2(A[k], dst)
            print(f"      copiado  {k}")
        if solo_boveda:
            print("\n  OJO: hay archivos solo en la boveda. No se borran solos:")
            for k in solo_boveda:
                print(f"      revisar  {k}")

    print("\n" + "=" * 68)
    print("ESTADO DE LOS DOS REPOS")
    print("=" * 68)
    for nombre, repo in (("SO2_MT ", os.path.dirname(os.path.dirname(vault))),
                         ("MCP-AYD", tutor)):
        sucio = git(repo, "status", "--short")
        rama = git(repo, "status", "-sb").splitlines()[0] if git(repo, "status", "-sb") else "?"
        print(f"\n  {nombre}  {rama}")
        if sucio:
            print("    sin commitear:")
            for ln in sucio.splitlines()[:20]:
                print(f"      {ln}")
        else:
            print("    limpio")

    print()
    return 1 if desfases else 0


if __name__ == "__main__":
    sys.exit(main())
