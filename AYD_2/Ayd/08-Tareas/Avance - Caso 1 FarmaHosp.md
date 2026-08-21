---
tema: Control de avance
fuente: "Rúbrica del Caso 1 - FarmaHosp"
fecha: 2026-08-20
tarea: Caso 1 - FarmaHosp
---

# Avance — Caso 1 FarmaHosp

Tablero para validar contra la rúbrica. Se tilda cuando el entregable **pasa su checklist de
rigor**, no cuando está escrito.

Entrega: [[Entrega - Caso 1 FarmaHosp]] · Plan: [[Plan - Caso 1 FarmaHosp]] · Enunciado: [[Caso 1 - FarmaHosp]]

---

## Estado por criterio de la rúbrica

| Criterio | Sub-entregable | Pts | Paso | Estado |
|---|---|---|---|---|
| **1** Caso de negocio | Diagrama de contexto | 25 | 2 | ✅ **hecho** — 14 entidades, 25 streamlines |
| | CDU de alto nivel (core) | | 3 | ✅ **hecho** — 1 elipse + 5 actores |
| | Primera descomposición | | 4 | ✅ **hecho** — 7 procesos (6 etapas + gerencial), 3 categorías |
| **2** Stakeholders | Tabla + necesidad oculta + conflictos | 25 | 1 | ✅ **cerrado** — 13 stakeholders |
| **3** Drivers | Drivers RF (CDU expandidos) | 30 | 5 | ☐ |
| | Drivers de atributos de calidad | | 6 | ☐ |
| | Drivers de restricción | | 7 | ☐ |
| | Top 5 priorizado (contexto GT) | | 8 | ☐ |
| **4** Trazabilidad | Stakeholders vs. CDU | 20 | 9 | ☐ |
| | Drivers RF vs. Drivers RF | | 9 | ☐ |
| | CDU vs. Drivers RF | | 9 | ☐ |

**Total: 100 pts**

---

## Ruta de pasos

| Paso | Qué se hace | Estado |
|---|---|---|
| **0** | Definir la frontera del negocio | ✅ **hecho** — negocio = gestión del ciclo de vida del MAC; personal clínico = trabajadores; actores = paciente, proveedor, MSPAS, Contraloría, legacy admisiones, consultora |
| **1** | Stakeholders: barrer → clasificar → necesidad oculta → conflictos | ✅ **hecho** — 13 stakeholders (8 del enunciado + 5), necesidad oculta y 6 conflictos |
| **2** | Diagrama de contexto | ✅ **hecho** — dibujado en 3 capas: 14 entidades, 25 streamlines, cada una justificada |
| **3** | CDU de alto nivel (core del negocio) | ✅ **hecho** — elipse única «Gestión del Ciclo de Vida del MAC», 5 actores, líneas sin punta, exclusiones defendidas |
| **4** | Primera descomposición | ✅ **hecho** — CDU-01..07 en columna, mismos 5 actores del core, categorías núcleo/soporte/gerencial, excepción de apoyo declarada para Almacenamiento |
| **5** | Drivers RF (CDU expandidos) | 🔄 siguiente |
| **6** | Drivers de atributos de calidad | ☐ |
| **7** | Drivers de restricción | ☐ |
| **8** | Priorizar los 5 más críticos | ☐ |
| **9** | Las 3 matrices de trazabilidad | ☐ |

---

## Sub-pasos del PASO 1 (stakeholders)

| # | Sub-paso | Estado |
|---|---|---|
| 1.0 | Frontera declarada | ✅ |
| 1.1 | Barrido A — los cinco de clase | ✅ |
| 1.2 | Barrido B — categorías de metas (PALM) | ✅ |
| 1.3 | Barrido C — internos que no son usuarios + sistemas externos | ✅ (+ barrido fino de escenarios y políticas) |
| 1.4 | Clasificar (posición vs. frontera / tipo de interés) | ✅ |
| 1.5 | Necesidad oculta de cada uno | ✅ 13/13 |
| 1.6 | Tabla de conflictos | ✅ 6 tensiones |
| 1.7 | Pasar la checklist de rigor | ✅ |

---

## Cobertura del enunciado (trazabilidad inversa)

Se valida al final de cada paso: nada del enunciado puede quedar sin aparecer en algún entregable.

- [x] Los **8 stakeholders** nombrados en la tabla del enunciado
- [x] Los stakeholders **no** nombrados en esa tabla pero presentes en el texto (5 agregados; el resto se traslada a drivers de restricción)
- [x] Cada stakeholder con su **necesidad oculta**
- [x] Las **6 etapas** del ciclo de vida como procesos de negocio (CDU-01..06)
- [ ] Los **8 acuerdos de calidad** clasificados como drivers
- [ ] Las **8 restricciones** como drivers de restricción
- [ ] Los **6 escenarios críticos** aparecen en algún entregable
- [ ] Exactamente **5** drivers priorizados con justificación guatemalteca

---

## Bitácora

| Fecha | Qué se cerró |
|---|---|
| 2026-08-20 | Paso 0: frontera del negocio definida y redactada |
| 2026-08-20 | Paso 1.1-1.3: barrido completo — de 8 del enunciado a 24 candidatos |
| 2026-08-20 | Paso 2 **cerrado**: notación + 2 ejemplos en otro dominio + diagrama de FarmaHosp dibujado en 3 capas (14 entidades / 25 streamlines) |
| 2026-08-21 | Paso 4 **cerrado**: primera descomposición con 7 procesos (las 6 etapas del enunciado + control y auditoría como gerencial), IDs CDU-01..07 listos para las matrices. **Criterio 1 completo: 25 pts cubiertos** |
| 2026-08-21 | Paso 3 **cerrado** (resolver y explicar): core dibujado y verificado; §2.2 de la Entrega con las exclusiones defendidas. Revisión del contexto de Julián: 1 error (par del médico cruzado), óvalo con descripción en vez de nombre — pendiente su v2 |
| 2026-08-21 | Paso 3 **en curso** (modo explicar): lección del core dictada. Corregida la guía §8 1.2 contra los 4 casos de la cátedra: el core es UNA elipse, no 1-5 casos |
| 2026-08-21 | **Modo explicar**: Julián redibuja el diagrama de contexto con su propia mano como práctica para el examen. La versión de referencia queda en Entrega §2.1 — se compara DESPUÉS, no antes. Al terminar: revisión contra checklist y paso 3 |
| 2026-08-20 | Paso 1 **cerrado**: lista final de 13 stakeholders (8 + 5 elegidos), clasificados, con necesidad oculta y tabla de 6 conflictos |
