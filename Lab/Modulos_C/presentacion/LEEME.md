# Presentación y manual — Módulos del Kernel Linux

Material importado del proyecto de Claude Design **«Módulos del Kernel Linux»**
(`33e23990-7c67-446a-8101-052bfa9050f5`), materializado acá como archivos locales.

Todo el contenido está anclado en el libro clonado en `..\lkmpg\`
(*The Linux Kernel Module Programming Guide*, sysprog21) y en los laboratorios
de `..\mi_primer_modulo\` y `..\curso_modulos\`.

---

## Qué es cada archivo

| Archivo | Qué es |
|---|---|
| `Módulos del Kernel Linux.dc.html` | **La presentación**: 26 diapositivas, 1920×1080 |
| `Referencia - Módulos del Kernel Linux.dc.html` | **El manual**: 15 capítulos, documento imprimible |
| `NOTAS-DEL-ORADOR.md` | Guion: qué decir en cada una de las 26 diapositivas |
| `deck-stage.js` | Motor de la presentación (navegación, escalado, notas) |
| `doc-page.js` | Motor del manual (paginado, impresión, PDF) |
| `support.js` | Runtime común de los `.dc.html` |

---

## Cómo abrirlos — importante

**No funciona haciendo doble clic.** El runtime carga `deck-stage.js` con
`fetch()`, y los navegadores bloquean `fetch` bajo `file://` por seguridad. Vas
a ver una pantalla en blanco.

Hay que servir la carpeta por HTTP. Desde esta carpeta:

```powershell
python -m http.server 8000
```

Y en el navegador:

- Presentación → <http://localhost:8000/M%C3%B3dulos%20del%20Kernel%20Linux.dc.html>
- Manual → <http://localhost:8000/Referencia%20-%20M%C3%B3dulos%20del%20Kernel%20Linux.dc.html>

O más simple: abrí <http://localhost:8000/> y hacé clic en el archivo de la lista.

> **Requiere internet.** `support.js` baja React desde `unpkg.com` y las
> tipografías IBM Plex desde Google Fonts. Sin red, el deck no renderiza.

Para cortar el servidor: `Ctrl+C` en esa terminal.

---

## Cómo presentar

Con el deck abierto:

| Tecla | Qué hace |
|---|---|
| `→` `↓` `Espacio` `PgDn` | Siguiente diapositiva |
| `←` `↑` `PgUp` | Anterior |
| `Home` / `End` | Primera / última |
| `1`…`9` | Salta a esa diapositiva |
| `R` | Volver a la portada |
| `F11` | Pantalla completa del navegador |

En pantallas táctiles, tocar la mitad izquierda/derecha va atrás/adelante.
El contador de diapositivas aparece abajo al mover el mouse y se desvanece solo.

## Exportar a PDF

`Ctrl+P` en el navegador (Chrome recomendado). Los dos documentos traen su
propio CSS de impresión:

- **La presentación** sale una diapositiva por hoja, apaisada y a sangre.
- **El manual** se pagina solo en tu tamaño de papel, con márgenes de 0.8 in.
  En el diálogo activá *"Gráficos de fondo"* para que salgan los bloques de
  código con su fondo.

---

## Contenido de la presentación (26 diapositivas)

| # | Bloque | Diapositivas |
|---|---|---|
| 01–05 | **Fundamentos** | Portada, contenido, qué es un módulo, monolítico vs. modular, usuario vs. kernel |
| 06–09 | **Parte I — Gestión** | Ciclo de vida, herramientas (`insmod`/`modprobe`/`rmmod`), rutas del sistema |
| 10–15 | **Parte II — Escribir** | `hello.c`, Makefile, cargar/descargar, parámetros, metadatos |
| 16–20 | **Parte III — Drivers** | Char device (registro y `file_operations`), `/proc` y `/sys`, depuración |
| 21–26 | **Parte IV — Producción** | Firma y Secure Boot, DKMS, hardening, errores comunes, cierre |

## Contenido del manual (15 capítulos)

1. Qué es un módulo y por qué existe
2. Reglas del entorno del kernel
3. Preparar el entorno en Pop!_OS
4. Ciclo de vida y herramientas
5. El módulo mínimo
6. Compilar con kbuild
7. Parámetros y metadatos
8. Character device completo
9. Interfaces por `/proc` y `/sys`
10. Depuración
11. Firma de módulos y Secure Boot
12. Empaquetado con DKMS
13. Seguridad y hardening
14. Lista de verificación
15. Fuentes

---

## Cómo se conecta con el resto del proyecto

Cada bloque teórico tiene su código para tocar:

| Diapositivas | Manual | Código para practicar |
|---|---|---|
| 11–13 · `hello.c`, Makefile, cargar | cap. 5–6 | `..\mi_primer_modulo\hola_santiago.c` ← **empezá acá** |
| 14–15 · Parámetros y metadatos | cap. 7 | `..\curso_modulos\lab2_params.c`, y `..\lkmpg\examples\hello-5.c` |
| 19 · `/proc` y `/sys` | cap. 9 | `..\curso_modulos\lab3_procfs.c`, `..\lkmpg\examples\procfs1.c`, `hello-sysfs.c` |
| 17–18 · Char device | cap. 8 | `..\lkmpg\examples\chardev.c`, `chardev2.c`, `ioctl.c` |
| 20 · Depuración | cap. 10 | `..\lkmpg\examples\hello-debugfs.c` |
| 25 · Errores comunes | cap. 14 | tabla de síntomas en `..\curso_modulos\GUIA.md` |

---

## Editar el contenido

Los `.dc.html` son HTML plano con estilos en línea: cada diapositiva es un
`<section data-label="...">`. Podés editarlos con cualquier editor de texto.
Las notas del orador viven en el atributo `data-speaker-notes` de cada sección
— si las cambiás ahí, regenerá `NOTAS-DEL-ORADOR.md` a mano o pedime que lo
vuelva a extraer.

No toques `deck-stage.js`, `doc-page.js` ni `support.js`: son runtime generado.

---

*Resumen en una línea: serví esta carpeta con `python -m http.server 8000`, abrí
el `.dc.html` en el navegador, y presentá con las flechas.*
