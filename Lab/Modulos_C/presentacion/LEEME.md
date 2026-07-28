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
| `Módulos del Kernel Linux.dc.html` | **La presentación**: 30 diapositivas, 1920×1080 |
| `Manual práctico - Tu primer módulo.dc.html` | **Manual del laboratorio**: 11 capítulos, el camino recorrido paso a paso |
| `Referencia - Módulos del Kernel Linux.dc.html` | **Manual teórico**: 15 capítulos, de consulta |
| `NOTAS-DEL-ORADOR.md` | Guion: qué decir en cada una de las 30 diapositivas |
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
- Manual práctico → <http://localhost:8000/Manual%20pr%C3%A1ctico%20-%20Tu%20primer%20m%C3%B3dulo.dc.html>
- Manual teórico → <http://localhost:8000/Referencia%20-%20M%C3%B3dulos%20del%20Kernel%20Linux.dc.html>

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

## Contenido de la presentación (30 diapositivas)

| # | Bloque | Diapositivas |
|---|---|---|
| 01–05 | **Fundamentos** | Portada, contenido, qué es un módulo, monolítico vs. modular, usuario vs. kernel |
| 06–09 | **Parte I — Gestión** | Ciclo de vida, herramientas (`insmod`/`modprobe`/`rmmod`), rutas del sistema |
| 10–19 | **Parte II — Escribir** | `hello.c`, Makefile, **un módulo con uno o varios archivos**, **varios módulos**, cargar/descargar, **laboratorio**, **inspección**, parámetros, metadatos |
| 20–24 | **Parte III — Drivers** | Char device (registro y `file_operations`), `/proc` y `/sys`, depuración |
| 25–30 | **Parte IV — Producción** | Firma y Secure Boot, DKMS, hardening, errores comunes, cierre |

Las cuatro diapositivas en negrita (13, 14, 16 y 17) son las agregadas después del
laboratorio: los tres casos de `obj-m`, el recorrido completo de `hola_santiago.ko`
y las herramientas de inspección.

## Contenido del manual práctico (11 capítulos)

Documenta el laboratorio realmente hecho, con la salida real de cada comando:

1. Paso 0 — Revisar el terreno (headers, `uname -r`, vermagic)
2. Paso 1 — Anatomía del módulo mínimo
3. Paso 2 — El Makefile (se lee dos veces, el TAB, `missing separator`)
4. **Uno o varios archivos, uno o varios módulos** (`obj-m`, `-objs`, N módulos)
5. Paso 3 — Compilar (`CC [M]`, `MODPOST`, `LD [M]`)
6. Paso 4 — Cargar (el silencio como éxito, qué hace el kernel)
7. Paso 5 — Inspeccionar (`lsmod`, `/proc/modules`, `/sys/module`, banderas `OE`)
8. Paso 6 — Descargar (por nombre, no por archivo)
9. Errores y su causa (tabla de 10 síntomas)
10. El ciclo de trabajo completo y lista de verificación
11. Fuentes

## Contenido del manual teórico (15 capítulos)

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
| 11–12 · `hello.c` y Makefile | práctico 2–3 | `..\mi_primer_modulo\hola_santiago.c` ← **empezá acá** |
| 13–14 · Uno o varios archivos / varios módulos | práctico 4 | `..\lkmpg\examples\start.c` + `stop.c` y el `Makefile` de esa carpeta |
| 15–17 · Cargar, laboratorio, inspección | práctico 5–8 | `..\mi_primer_modulo\` completo |
| 18–19 · Parámetros y metadatos | teórico 7 | `..\curso_modulos\lab2_params.c`, y `..\lkmpg\examples\hello-5.c` |
| 21–22 · Char device | teórico 8 | `..\lkmpg\examples\chardev.c`, `chardev2.c`, `ioctl.c` |
| 23 · `/proc` y `/sys` | teórico 9 | `..\curso_modulos\lab3_procfs.c`, `..\lkmpg\examples\procfs1.c`, `hello-sysfs.c` |
| 24 · Depuración | teórico 10 | `..\lkmpg\examples\hello-debugfs.c` |
| 29 · Errores comunes | práctico 9 | tabla de síntomas en `..\curso_modulos\GUIA.md` |

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
