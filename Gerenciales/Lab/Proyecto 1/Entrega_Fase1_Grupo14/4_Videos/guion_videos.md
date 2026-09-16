# Guion de los videos demostrativos — Fase 1

Documento 4 de los cinco entregables. El enunciado pide *"videos alojados en Google Drive que evidencien el proceso de instalación y validación de los sistemas (ERP/CRM)"*.

Son **dos videos**, uno por rol, para que ninguno dependa del otro para grabar.

| Video | Quién graba | Duración objetivo |
|---|---|---|
| Instalación y validación del ERP (Odoo Community) | Rol 3 | 6 a 9 minutos |
| Instalación y validación del CRM (Odoo CRM) | Rol 4 | 4 a 6 minutos |

---

## Reglas para los dos

- **Grabá la pantalla, no la cara.** OBS Studio o Xbox Game Bar (`Win + G`) bastan; los dos son gratis y ya vienen o se instalan en un minuto.
- **Narrá mientras hacés.** Un video mudo no evidencia dominio, y el dominio es lo que se califica.
- **Una sola toma es suficiente.** No hace falta editar. Si te equivocás, explicá el error y cómo lo resolvés: eso suma, no resta.
- **Resolución mínima 1080p** y que el texto de la pantalla se lea. Si tenés la pantalla en 4K, bajá la resolución antes de grabar o no se va a leer nada.
- **Aparecé identificándote** al inicio: nombre, carné y qué vas a mostrar.
- **Subilo a la carpeta del grupo en Drive** y verificá el enlace **desde una sesión distinta** o en ventana de incógnito. Un enlace con permisos mal puestos es lo mismo que no entregar.
- Nombre del archivo: `Fase1_Video_ERP_Grupo14.mp4` y `Fase1_Video_CRM_Grupo14.mp4`.

---

## Video 1 — Instalación del ERP · Rol 3

### Minuto 0:00 — Presentación
> "Buenas, soy [nombre], carné [número], del Grupo 14. En este video muestro la instalación y validación de Odoo Community, el ERP que seleccionamos para el proyecto de RutaMoto, nuestra tienda en línea de repuestos para motocicleta."

### 0:30 — Requerimientos
Mostrá en pantalla, antes de tocar el instalador:

- Las propiedades del sistema (`Win + Pausa`): versión de Windows, procesador, RAM.
- El espacio libre en disco.
- La página oficial de descarga de Odoo y la versión que vas a instalar.

> Decí por qué esa versión y no otra.

### 1:30 — Instalación
Grabá sin cortar:

1. Ejecutar el instalador.
2. Aceptar los términos.
3. La parte donde instala **PostgreSQL** — señalala explícitamente, porque el enunciado pide indicar el gestor de base de datos.
4. Configuración de puerto y contraseña maestra.
5. Fin de la instalación.

### 4:00 — Primer arranque y base de datos
1. Abrir el navegador en `localhost:8069`.
2. Crear la base de datos del proyecto.
3. Crear el usuario administrador.
4. Iniciar sesión por primera vez.

### 5:30 — Instalación de módulos
Entrá a Aplicaciones e instalá **Inventario, Ventas y Compras**. Mientras lo hacés, explicá en una frase para qué sirve cada uno en RutaMoto:

> "Inventario porque necesitamos alertas de stock bajo: si no hay la pieza, el cliente se va al local de enfrente. Compras porque el ciclo de requisición a recepción es la operación normal del negocio. Ventas porque los talleres piden cotización antes de comprar."

### 7:00 — Validación
Mostrá funcionando:

- La interfaz web con sesión iniciada.
- Los tres módulos en el menú.
- Crear un producto de prueba, por ejemplo `LUB-001 Aceite mineral 20W-50`.
- Que ese producto aparece en el listado de inventario.

### 8:00 — Cierre
> "Con esto queda validada la instalación del ERP. El módulo CRM lo muestra [nombre del rol 4] en el segundo video, sobre esta misma instalación."

---

## Video 2 — Instalación y configuración del CRM · Rol 4

### 0:00 — Presentación
> "Buenas, soy [nombre], carné [número], del Grupo 14. En este video muestro la instalación y configuración de Odoo CRM para el proyecto de RutaMoto."

### 0:20 — Por qué este CRM
Antes de tocar nada, mostrá el cuadro comparativo del informe y explicá la decisión en treinta segundos:

> "Comparamos [opción 1] contra [opción 2]. Elegimos Odoo CRM porque comparte base de datos con el ERP, así que el cliente que se registra en la tienda queda disponible en Ventas sin construir una integración por API. Con tres días de plazo, esa integración era el riesgo más grande del proyecto."

### 1:00 — Instalación del módulo
1. Entrar a Aplicaciones.
2. Buscar CRM.
3. Instalar.
4. Ver que aparece en el menú principal.

### 2:00 — Configuración
- Configurar el servidor de correo saliente.
- Definir las etapas del pipeline.
- Configurar permisos del usuario comercial.

### 3:30 — Validación
Mostrá funcionando:

- El tablero Kanban del pipeline.
- Crear una oportunidad de prueba con uno de nuestros segmentos, por ejemplo un taller mecánico.
- Moverla de etapa arrastrándola.
- **Lo más importante:** que el cliente creado en el CRM aparece también en Ventas del ERP. Esa es la evidencia de que comparten base y de que la integración de la Fase 3 es viable.

### 5:00 — Cierre
> "Con esto quedan validados el ERP y el CRM sobre la misma instalación. En la Fase 2 se cargan los datos maestros y se configura la cadena de suministros."

---

## Antes de subir: lista de comprobación

- [ ] Se lee el texto de la pantalla sin forzar la vista.
- [ ] Se escucha la narración, sin ruido de fondo que tape la voz.
- [ ] Aparece el nombre y el carné de quien graba.
- [ ] Se ve la instalación **y** la validación, no solo una de las dos.
- [ ] El archivo está en la carpeta del grupo en Drive.
- [ ] El enlace abre desde una ventana de incógnito.
- [ ] El enlace está pegado en el **Anexo** del informe.

---

## Un aviso honesto

El enunciado dice *"videos"* en plural y menciona *"los sistemas (ERP/CRM)"*, pero **no especifica si debe ser uno o dos**. Acá está planteado como dos porque permite que los roles 3 y 4 graben en paralelo, que con tres días importa. Si prefieren uno solo, se junta el contenido en el mismo orden y también cumple.
