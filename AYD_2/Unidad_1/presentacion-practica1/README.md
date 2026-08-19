# Presentación Práctica 1 — AutoRent Express S.A.

PowerPoint de defensa de la Práctica 1 (Análisis y Diseño de Sistemas 2, USAC — Grupo 2, sección A),
armado siguiendo la estructura del enunciado `Practica 1.pdf`.

| Archivo | Qué es |
|---|---|
| `Presentacion_Practica1_AutoRent_G2.pptx` | El entregable. 24 diapositivas, 16:9, con notas del orador en cada una. |
| `generar_pptx.py` | El generador. Regenera el `.pptx` desde cero. |

## Regenerar

```powershell
python generar_pptx.py
```

Requiere `python-pptx` (`pip install python-pptx`). El script sobrescribe el `.pptx` en esta misma
carpeta, así que cualquier edición hecha a mano en PowerPoint se pierde al volver a correrlo. Si vas
a retocar diapositivas a mano, hacelo sobre una copia.

## Contenido

Sigue el orden del enunciado, no el del manual técnico:

1. Portada e integrantes · agenda · competencias y objetivos
2. Contexto: enunciado, actores y flujo de la renta
3. **Instrucción 1a** — framework: Django 6.0.7 + PostgreSQL y su justificación
4. **Instrucción 1b** — patrones: State, Strategy y Factory Method, con UML y colaboración entre los tres
5. **Instrucción 2** — el demo: arquitectura MTV, las cuatro apps y el modelo de datos
6. Documentación: 14 RF, 15 casos de uso (uno expandido) y 10 RNF
7. **Instrucción 3** — Git Flow: ramas, convenciones y evidencia real del repositorio
8. Entregables, recorrido de la demo, preguntas anticipadas y cierre

Los datos salen de `docs/MANUAL_TECNICO.md` en la rama `develop` del repositorio
`AYD2_A_2S2026_PRACTICA1_G2`. Si el manual cambia, hay que actualizar el script.

## Notas del orador

Cada diapositiva lleva notas en el panel de PowerPoint (vista Presentador). Son indicaciones de qué
decir y qué no leer en voz alta. El guion largo de la parte de patrones sigue estando en
`../presentacion-patrones/GUION.md`.
