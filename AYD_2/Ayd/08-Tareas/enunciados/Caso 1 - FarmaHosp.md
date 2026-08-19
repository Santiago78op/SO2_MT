---
tema: Enunciado
fuente: "Caso FarmaHosp.pdf — AYD2 785, ECYS-USAC"
fecha: 2026-08-19
tarea: Caso 1 - FarmaHosp
---

# Caso 1 — FarmaHosp (texto extraído)

> [!info] Extracción automática del PDF
> Texto extraído de `Caso 1 - FarmaHosp.pdf` con `pdftotext -layout`, para poder **buscarlo y
> citarlo textual**. Las tablas del original (stakeholders, rúbrica) quedan descuadradas acá:
> **para leerlas bien, ir al PDF**. El original manda.

 UNIVERSIDAD DE SAN CARLOS DE GUATEMALA
 FACULTAD DE INGENIERIA
 ESCUELA DE CIENCIAS Y SISTEMAS
 ANÁLISIS Y DISEÑO DE SISTEMAS II

                                                            CASO 1
                                                          FarmaHosp
                           Sistema Integral de Gestión de Medicamentos de Alto Costo

Contexto y Entorno
El Hospital Universitario "Dr. Juan José Ortega" es un centro de referencia nacional de tercer nivel, ubicado
en la Ciudad de Guatemala. Atiende a más de 1,200 pacientes diarios, con un enfoque particular en
enfermedades crónicas complejas (oncología, VIH, enfermedades autoinmunes, trasplantes) que
requieren medicamentos de alto costo (MAC), cuyo valor mensual por paciente puede superar los Q.
50,000.
Actualmente, el hospital enfrenta una crisis administrativa y clínica debido a la gestión ineficiente de estos
medicamentos:

    • Pérdidas económicas: Se han detectado caducidades de medicamentos por valor de Q. 2.5 millones
         en el último año debido a mala rotación de inventarios.

    • Problemas de trazabilidad: En 3 casos, pacientes recibieron el medicamento incorrecto porque la
         etiqueta del lote fue mal transcrita manualmente.

    • Falta de visibilidad: Los médicos no saben en tiempo real si el medicamento prescrito está
         disponible en la farmacia, lo que genera retrasos en el inicio de tratamientos (hasta 48 horas).

    • Auditorías fallidas: La Contraloría General de Cuentas exige trazabilidad completa desde la compra
         hasta la administración al paciente, pero el hospital solo tiene registros en papel y hojas de cálculo.

Por estas razones, la Junta Directiva del hospital ha aprobado un proyecto de transformación
digital: "FarmaHosp", un sistema integral que debe gestionar todo el ciclo de vida del medicamento de alto
costo, desde la adquisición hasta la administración al paciente y el seguimiento farmacoterapéutico.

El Ciclo de Vida del Medicamento
Las 6 etapas críticas:

    1. Adquisición: Gestión de órdenes de compra, recepción de lotes, control de calidad (temperatura,
         humedad), registro de fechas de vencimiento y números de lote.

    2. Almacenamiento: Control de inventario en cámaras de refrigeración (2-8°C), congelación (-20°C) y
         temperatura ambiente. Cada cámara tiene sensores IoT que monitorean temperatura y humedad
         cada 5 minutos. Si se rompe la cadena de frío, el medicamento debe ser descartado
         automáticamente.

    3. Prescripción: El médico tratante prescribe un medicamento específico para un paciente, indicando
         dosis, vía de administración y frecuencia. La prescripción debe validarse contra:
              o Protocolos clínicos aprobados (ej. solo ciertos medicamentos para ciertos tipos de cáncer).
              o Interacciones medicamentosas con otros fármacos que el paciente ya está tomando.
              o Contraindicaciones por alergias o condiciones del paciente (ej. insuficiencia renal).

    4. Dispensación: El farmacéutico recibe la orden, verifica disponibilidad en el inventario del hospital
         (no en farmacia externa), asigna un lote específico al paciente y genera la etiqueta con código de
         barras/QR para la administración.

    5. Administración: El enfermero/a aplica el medicamento al paciente en el área de hospitalización o
         en consulta externa. Debe escanear:
              o La pulsera del paciente (identificación única).
         o El código de barras del medicamento dispensado.
         o Su propia credencial (autenticación biométrica en tablet).
         o Registrar hora, fecha, sitio de aplicación y reacciones adversas inmediatas.
6. Seguimiento y Farmacovigilancia: Monitoreo de efectos adversos en los días posteriores, reporte
    al sistema nacional de farmacovigilancia (obligatorio por ley), y ajuste de dosis por parte del médico
    según respuesta.

StakeHolders y sus Necesidades

Stakeholder          Lo que dicen que        Lo que realmente necesitan (necesidad oculta)
                          quieren

Médico tratante      "Quiero poder           Necesita que el sistema le “sugiera” el
(especialista en     prescribir              medicamento más adecuado según el protocolo y
oncología)           rápidamente, en         le alerte si hay interacciones con otros fármacos.
                     menos de 5 minutos,     Pero además, necesita que la prescripción
                     sin tener que andar     se valide contra el inventario en tiempo real; si no
                     buscando papel."        hay stock, debe poder solicitar una compra
                                             urgente o reemplazo terapéutico desde la misma
                                             pantalla. Y necesita que el sistema recuerde su
                                             patrón de prescripción (ej. siempre prefiere
                                             ciertas marcas sobre otras).

Farmacéutico/a       "Quiero un sistema      Necesita que el sistema sea rápido (< 2 segundos
clínico/a            que no se caiga,        por operación) y que funcione incluso si el
                     porque si no puedo      internet del hospital falla, porque la farmacia está
                     dispensar, los          en el sótano y la conexión es inestable. Además,
                     pacientes no reciben    necesita una vista de inventario predictivo: que le
                     su quimioterapia."      diga cuándo va a faltar un medicamento antes de
                                             que ocurra, basado en las prescripciones
                                             programadas para los próximos 7 días.

Enfermero/a de piso  "Quiero que el escáner  Necesita que el sistema valide al paciente y
                     funcione rápido y no    medicamento en menos de 1 segundo para no
                     se trabe."              retrasar el pase de visita. Pero su necesidad más
                                             crítica es que, si el escáner falla o no hay
                                             conexión, pueda administrar el medicamento de
                                             forma offline y que la trazabilidad se registre
                                             automáticamente cuando la conexión regrese.
                                             También necesita que el sistema registre
                                             reacciones adversas con voz a texto (dictado),
                                             porque escribir en la tablet mientras el paciente
                                             está en shock es inviable.

Director             "Quiero ahorrar dinero  Necesita un tablero de control financiero que le
Administrativo del   y evitar pérdidas por   muestre el costo por paciente, por servicio, y el
Hospital             caducidad."             porcentaje de desperdicio. Pero también
      Stakeholder           Lo que dicen que     Lo que realmente necesitan (necesidad oculta)
                                  quieren
Jefe de                                          necesita auditar quién autorizó cada compra y
Farmacovigilancia        "Quiero cumplir con la  quién dio de baja un medicamento vencido.
                         ley y reportar efectos  Necesita que el sistema sea transparente para la
Paciente                 adversos."              Contraloría.
(usuario final)
                         "Quiero que me den      Necesita que el sistema detecte
Ministerio de Salud      mi medicamento          automáticamente patrones de efectos adversos
(ente regulador)         rápido y no me          (ej. si 5 pacientes con el mismo lote reportan
                         equivoquen."            náuseas) y genere una alerta temprana. También
Equipo de Desarrollo                             necesita que los reportes al sistema nacional (que
(interno del hospital +  "Queremos               es externo y con formato fijo) se
consultoría externa)     estandarizar la         generen automáticamente sin que su equipo
                         trazabilidad a nivel    tenga que transcribir manualmente.
                         nacional."
                                                 Necesita trazabilidad completa: poder escanear el
                         "Queremos usar          código QR de su medicamento y ver que es el
                         tecnologías modernas    correcto, con su nombre y dosis. Pero además,
                         y entregar rápido."     necesita que el sistema le notifique (vía SMS o
                                                 WhatsApp) cuándo debe tomar su próxima dosis,
                                                 especialmente en tratamientos ambulatorios. Y
                                                 necesita confidencialidad total: que los datos de
                                                 su enfermedad (ej. VIH, cáncer) no sean visibles
                                                 para personal no autorizado.

                                                 Necesita que el sistema exporte datos en formato
                                                 estándar (HL7 FHIR) para interoperabilidad con
                                                 otros hospitales. Y que el hospital exponga APIs
                                                 seguras para que el sistema nacional de
                                                 farmacovigilancia pueda consultar datos de
                                                 efectos adversos en tiempo real.

                                                 Necesitan que el sistema sea mantenible porque
                                                 el personal de TI del hospital es reducido (3
                                                 personas) y con experiencia en Java y Oracle (no
                                                 en Node.js o MongoDB). Además, necesitan que
                                                 el sistema pueda evolucionar incrementalmente:
                                                 primero el módulo de dispensación y almacén,
                                                 luego prescripción, luego farmacovigilancia. Y
                                                 necesitan documentación viva porque la rotación
                                                 de personal es alta (contratos de consultoría de
                                                 12 meses).
El Entorno Técnico-Organizativo
Infraestructura del hospital:

    • Data center propio con servidores virtualizados (VMware), pero con recursos limitados: 32 vCPUs,
         128 GB RAM, almacenamiento SAN de 10 TB.

    • Red interna: Ethernet 1 Gbps en la mayoría de áreas, pero el área de farmacia (sótano) tiene
         conexión inalámbrica inestable (Wi-Fi con intermitencias).

    • Conexión a internet: 50 Mbps simétricos, compartidos con todo el hospital. El sistema debe
         priorizar tráfico crítico (dispensaciones) sobre otros usos (ej. streaming de imágenes médicas).

    • Las tablets de los enfermeros son Panasonic Toughpad (Android 9, 3 GB RAM, 32 GB
         almacenamiento), resistentes a caídas y líquidos.

    • Los escáneres de código de barras son Bluetooth y tienen una tasa de fallo del 5% en lectura (por
         etiquetas dañadas). El sistema debe permitir entrada manual del código como respaldo.

Equipo de desarrollo (situación crítica):
    • El equipo interno del hospital son 3 desarrolladores con experiencia en Java 8, Spring Boot, Oracle
         PL/SQL y Angular.
    • Se ha contratado una consultora externa con 5 desarrolladores expertos en Python (Django), React,
         MongoDB y Kafka.
    • El hospital exige que el sistema final pueda ser mantenido exclusivamente por el equipo interno
         después de la entrega (en 12 meses).
    • Conflicto organizativo: El equipo interno prefiere Oracle y Java; la consultora prefiere PostgreSQL y
         Python. Se debe decidir un stack que ambos equipos puedan mantener.

Regulaciones y cumplimiento:
    • Ley de Acceso a la Información Pública: Cualquier ciudadano puede solicitar datos estadísticos (no
         personales) y el hospital debe responder en 10 días hábiles.
    • Norma Técnica de Farmacovigilancia del MSPAS: Obliga a reportar efectos adversos en un plazo
         máximo de 24 horas, en un formato XML específico (DTD definida por el MSPAS).
    • Política de Datos Personales del Hospital: Los datos de pacientes con VIH, cáncer y enfermedades
         psiquiátricas tienen “nivel de confidencialidad máxima”. Solo el médico tratante, el farmacéutico
         clínico y el enfermero asignado pueden ver el diagnóstico. Ni siquiera el director del hospital puede
         ver esos diagnósticos a menos que haya una orden judicial.
    • Regulación de medicamentos controlados (INCAP): Los medicamentos oncológicos y opioides
         requieren un doble registro: el farmacéutico que dispensa y el enfermero que administra deben
         coincidir en tiempo real. Si hay discrepancia > 5 minutos, se activa una alerta de seguridad.

Volumen de datos estimado (primer año):
    • 15,000 pacientes activos en tratamiento con MAC.
    • 45,000 prescripciones/mes.
    • 60,000 dispensaciones/mes.
    • 25,000 administraciones/mes (algunas son dosis múltiples del mismo medicamento).
    • 500,000 registros de sensores de temperatura/día (cada sensor envía datos cada 5 minutos).
    • Almacenamiento total estimado: 5 TB de datos estructurados + 2 TB de logs + 100 GB de imágenes
         de etiquetas/escáneres.
Algunos Escenarios Críticos
La cadena de frío se rompe
Son las 3:00 AM. Los sensores IoT de la cámara de refrigeración de medicamentos biológicos (ej.
inmunoglobulina) reportan un aumento de temperatura de 2°C a 10°C durante 15 minutos debido a un
corte de energía. El sistema debe:

    • Registrar el incidente con timestamp exacto.
    • Determinar automáticamente qué lotes estaban en esa cámara.
    • Enviar una alerta al farmacéutico de guardia (vía SMS y correo) con la lista de lotes afectados.
    • Bloquear esos lotes para su dispensación hasta que un farmacéutico los evalúe físicamente.
    • Generar un reporte de pérdida estimada (en quetzales) para el director administrativo.

Pregunta emergente: ¿Cómo manejar la decisión de descartar o no un lote que estuvo fuera de
temperatura por solo 15 minutos? El fabricante dice que soporta hasta 30 minutos, pero la política del
hospital dice que se descarta. El sistema debe permitir sobrescribir la regla con justificación y firma del
farmacéutico jefe (pero auditando eso).

Urgencia oncológica (sábado a las 6:00 PM)
Un paciente con leucemia llega al servicio de urgencias con una crisis de neutropenia febril. El médico de
urgencias prescribe un antibiótico de alto costo (meropenem) y un factor de crecimiento (filgrastim). El
sistema muestra que hay stock en la farmacia central, pero el farmacéutico de turno está atendiendo otra
urgencia y no puede dispensar en los próximos 20 minutos. El médico necesita el medicamento “ya”.
Alternativas que el sistema debe soportar:

    • Opción A: El enfermero puede ir a la farmacia, tomar el medicamento de la gaveta de "dispensación
         inmediata" y escanearlo en el sistema, pero debe quedar registro de quién lo tomó y por qué.

    • Opción B: El sistema autoriza un "préstamo" de medicamento de otro paciente que tiene el mismo
         fármaco prescrito para mañana, pero debe generar una notificación automática para reponerlo
         antes de que ese paciente lo necesite.

    • Opción C: El sistema permite la dispensación virtual (reservar el lote en el sistema) sin retiro físico
         inmediato, pero el farmacéutico debe validar la entrega física dentro de las siguientes 12 horas.

Error de medicación (casi incidente crítico)
El enfermero escanea la pulsera del paciente, el código de barras del medicamento, y el sistema muestra
un alerta roja: "¡ALTO! El medicamento que está administrando (metotrexato) está prescrito para el
paciente de la cama 302, pero usted está en la cama 304." El enfermero detiene el proceso. Esto evitó un
error fatal. Sin embargo, el enfermero reporta que la alerta tardó 4 segundos en mostrarse, y que si hubiera
estado distraído, ya habría inyectado al paciente equivocado.
Requisito emergente: La validación debe ser < 500 ms en condiciones normales de red, y < 2
segundos incluso si la conexión es lenta.

Auditoría de la Contraloría (sin previo aviso)
La Contraloría General de Cuentas llega al hospital sin previo aviso y solicita la trazabilidad completa de un
lote específico de rituximab (medicamento oncológico) que fue adquirido hace 8 meses. El director
administrativo pide al sistema que genere un informe forense que muestre:

    • Fecha de compra, proveedor, factura.
    • Fecha de ingreso al almacén, temperatura durante el almacenamiento (datos de sensores).
    • Todos los pacientes a los que se les administró ese lote.
    • Hora, fecha, enfermero que administró, y médico que prescribió.
    • Si hubo devoluciones, caducidades o ajustes de inventario.
El sistema debe generar este informe en menos de 10 minutos, y debe ser inmutable: no se pueden
modificar los registros históricos (ni siquiera por el administrador del sistema).

Caída del servidor central (hora pico)
Es lunes a las 8:30 AM, el momento de mayor actividad en el hospital. El servidor central colapsa debido a
un pico de solicitudes (muchas dispensaciones y prescripciones al mismo tiempo). La farmacia queda
incomunicada. Los enfermeros tienen pacientes esperando quimioterapia. El sistema de respaldo (que es
una réplica en otra ubicación) toma 3 minutos en activarse. Durante esos 3 minutos:

    • La farmacia no puede dispensar (no sabe si hay stock).
    • Los enfermeros no pueden validar la identidad del paciente.
    • El sistema de monitoreo de temperatura sigue funcionando, pero no puede enviar alertas.
¿Qué debe hacer el sistema durante esos 3 minutos de transición? ¿Degradar funcionalidad? ¿Permitir
operaciones offline con riesgo de duplicación?

Farmacovigilancia (efecto adverso grave)
Un paciente tratado con infliximab (para artritis reumatoide) desarrolla una reacción alérgica grave
(anafilaxia) a los 10 minutos de la administración. El enfermero registra la reacción en el sistema. El sistema
debe:

    • Notificar automáticamente al médico tratante (vía app).
    • Generar un reporte al sistema nacional de farmacovigilancia (formato estándar exigido por el

         MSPAS).
    • Cruzar con otros reportes del mismo lote a nivel nacional (si otros hospitales reportan reacciones

         similares, se activa una alerta de retiro del mercado).
    • Pero: El sistema nacional solo recibe datos entre 8:00 AM y 4:00 PM (porque es un sistema legacy

         con batch diario). El incidente ocurrió a las 7:30 PM. ¿Cómo manejar la asincronía?

Acuerdos de calidad esperados:
Los siguientes escenarios de calidad deben ser considerados, clasificados bajo el nombre que corresponda
y deberán ser tratados como drivers arquitectónicos.

    1. La validación paciente-medicamento debe ser < 500 ms en condiciones de red normal, y < 2
         segundos en condiciones degradadas. Pero la base de datos de pacientes tiene 15,000 registros y
         la de medicamentos 800 SKUs. ¿Cómo lograr esa velocidad con un equipo de desarrollo con
         habilidades mixtas?

    2. Si el servidor central experimenta una caída, el sistema debe permitir dispensaciones y
         administraciones offline por al menos 4 horas, pero la trazabilidad debe resolverse
         automáticamente cuando la conectividad regrese (sin duplicar registros). ¿Qué patrón de
         consistencia usar? .

    3. Todos los cambios en el inventario, prescripciones, dispensaciones y administraciones deben
         ser inmutables y trazables hasta el usuario. No debe ser posible eliminar un registro ni modificar un
         campo histórico. ¿Cómo implementar esto sin que el rendimiento se degrade por el historial
         inmutable?

    4. El acceso a los diagnósticos sensibles (VIH, cáncer) debe ser contextual: el médico tratante y el
         farmacéutico pueden verlo; el personal de admisión no. Pero en una emergencia, cualquier médico
         de urgencias debe poder acceder con justificación (y quedar registrado en el log). ¿Cómo diseñar
         un modelo de autorización dinámica (ABAC) sin que sea un cuello de botella?

    5. Los lunes a las 8:30 AM hay un pico de 10x el tráfico normal. El sistema debe manejar ese pico sin
         colapsar, pero el presupuesto para infraestructura es fijo (no hay autoescalado en el data
         center). ¿Qué estrategias de mitigación se pueden implementar a nivel arquitectónico?
    6. Interacción con otros sistemas:
              o El sistema debe consumir datos de pacientes del sistema legacy de admisiones (basado en
                   COBOL con interfaz SOAP) y proveer datos al sistema nacional de farmacovigilancia
                   (formato XML con DTD específica).
              o El sistema legacy es lento (responde en 3-5 segundos) y solo está disponible en horario
                   laboral (7:00 AM - 5:00 PM). ¿Cómo manejar la dependencia sin afectar el tiempo de
                   respuesta del farmacéutico?

    7. El equipo interno (Java/Oracle) debe poder mantener el sistema después de que la consultora
         (Python/PostgreSQL) se vaya. ¿Cómo elegir un stack y una arquitectura que ambos equipos puedan
         soportar?

    8. Los datos de temperatura deben ser inalterables y verificables (si un lote se descarta por
         temperatura, debe quedar evidencia criptográfica de que los datos no fueron manipulados). ¿Qué
         técnica usar? (Blockchain? Hash encadenado? Firma digital de sensores?)

Lo que NO debe hacer el sistema (Restricciones explícitas e implícitas)
    • No se puede usar una base de datos que no soporte transacciones ACID para el módulo de
         inventario (porque la doble validación farmacéutico-enfermero exige consistencia fuerte en la
         asignación de lotes).
    • No se puede depender de la nube pública para el almacenamiento de datos sensibles de pacientes
         (política del hospital); todo debe residir en el data center local. Solo se puede usar nube para
         análisis estadístico agregado (datos anonimizados).
    • No se puede usar una tecnología que requiera licencias de pago anuales que el hospital no pueda
         renovar (ej. Oracle Enterprise, SQL Server Enterprise). Se prefiere software open-source.
    • No se puede obligar a los enfermeros a usar dispositivos personales (BYOD) para la administración
         de medicamentos; el hospital provee los Toughpads.
    • No se puede diseñar un sistema monolítico, porque el módulo de farmacovigilancia tiene ciclos de
         entrega diferentes al módulo de inventario, y la integración con el sistema nacional es un proyecto
         paralelo.
    • No se pueden almacenar contraseñas ni credenciales en texto plano en ninguna capa del sistema.
    • No se puede implementar una solución que requiera entrenamiento de más de 2 horas para los
         enfermeros (porque el hospital no puede detener la atención para capacitar al personal).
    • No se puede generar un único punto de falla en la autenticación; si el sistema de directorio activo
         (LDAP) cae, el hospital debe seguir operando con un mecanismo de autenticación de respaldo (ej.
         OTP por SMS).
Rúbrica de calificación.

IMPORTANTE: Desde el punto de vista de la arquitectura del software:

               CRITERIO / NIVEL                       NIVEL DE EVALUACIÓN

No.  CRITERIO DE EVALUACIÓN                           EXCELENTE MUY BIEN BUENO       NECESITA
                                                                                     MEJORAR
1 Habilidad para identificar el caso de negocio                                      5 puntos
                                                                                     5 puntos
     • Diagrama de Contexto                                                          5 puntos

     • Diagrama de CDU de alto nivel (core del                                       5 puntos

     negocio)                                         25 puntos 15 puntos 10 puntos

     • Primera Descomposición. Diagrama de

     CDU que modele los procesos de negocio

2 Identificación de Stakeholders                      25 puntos 15 puntos 10 puntos

3 Obtención y modelado de las necesidades a

     nivel de arquitectura de software

     • Completitud de los drivers RF (diagramas

       de CDU expandidos)                             30 puntos 25 puntos 20 puntos
     • Drivers Atributos de Calidad

     • Drivers de Restricción

     • Priorizar los 5 drivers más críticos según el

     contexto guatemalteco.

4 Matrices de trazabilidad de requerimientos

     • Stakeholders vrs. CDU                          20 puntos 15 puntos 10 puntos
     • Drivers RF vrs. Drivers RF

     • CDU vrs. Drivers RF
