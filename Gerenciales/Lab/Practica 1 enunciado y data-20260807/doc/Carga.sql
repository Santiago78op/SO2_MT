USE MayaCode_DB;

-- Debe decir ON. Si dice OFF: SET GLOBAL local_infile = 1;  y reconectar la sesión.
SHOW VARIABLES LIKE 'local_infile';


-- Vaciar, por si el script se corre de nuevo.
-- DELETE y no TRUNCATE: TRUNCATE falla en tablas referenciadas por una FK.
DELETE FROM Actividad_Lenguajes;
DELETE FROM Lenguajes;
DELETE FROM Periodos;
ALTER TABLE Lenguajes AUTO_INCREMENT = 1;
ALTER TABLE Periodos  AUTO_INCREMENT = 1;


DROP TABLE IF EXISTS datacsv;

CREATE TABLE datacsv (
    name       VARCHAR(50) COLLATE utf8mb4_0900_as_ci,
    anio       INT,
    trimestre  INT,
    cantidad   INT
) ENGINE = InnoDB;


-- ÚNICA línea a editar: la ruta del CSV. Barras normales, incluso en Windows.
-- El archivo usa saltos LF. Si se cambia a '\r\n' la última columna falla.
LOAD DATA LOCAL INFILE 'C:/Users/72358/Desktop/SO2/Gerenciales/Lab/Practica 1 enunciado y data-20260807/practica1.csv'
INTO TABLE datacsv
FIELDS TERMINATED BY ','
LINES  TERMINATED BY '\n'
IGNORE 1 ROWS
(name, anio, trimestre, cantidad);

-- Debe dar 3375.
SELECT COUNT(*) AS filas_cargadas FROM datacsv;


-- Grafías inconsistentes. Hoy devuelve 2 filas: fortran y matlab.
SELECT LOWER(name) AS lenguaje,
       COUNT(DISTINCT name COLLATE utf8mb4_bin) AS grafias,
       GROUP_CONCAT(DISTINCT name COLLATE utf8mb4_bin SEPARATOR ' / ') AS variantes
FROM   datacsv
GROUP  BY LOWER(name)
HAVING grafias > 1;

-- Unificación. La comparación es insensible a mayúsculas, así que cada UPDATE
-- alcanza a las dos grafías y deja la elegida: la más frecuente, que además es
-- la oficial del lenguaje.   Fortran 32 vs FORTRAN 2   ·   MATLAB 31 vs Matlab 26
UPDATE datacsv SET name = 'Fortran' WHERE name = 'Fortran';
UPDATE datacsv SET name = 'MATLAB'  WHERE name = 'MATLAB';


INSERT INTO Lenguajes (nombre)
SELECT DISTINCT name FROM datacsv WHERE name IS NOT NULL ORDER BY name;

INSERT INTO Periodos (anio, trimestre)
SELECT DISTINCT anio, trimestre FROM datacsv
WHERE  anio IS NOT NULL AND trimestre IS NOT NULL
ORDER  BY anio, trimestre;


-- El GROUP BY con SUM no es opcional: sin él, las 22 combinaciones repetidas
-- del CSV hacen fallar el INSERT contra la clave primaria compuesta.
INSERT INTO Actividad_Lenguajes (idLenguaje, idPeriodo, cantidad)
SELECT l.idLenguaje, p.idPeriodo, SUM(d.cantidad)
FROM   datacsv  d
JOIN   Lenguajes l ON l.nombre    = d.name
JOIN   Periodos  p ON p.anio      = d.anio
                  AND p.trimestre = d.trimestre
GROUP  BY l.idLenguaje, p.idPeriodo;


-- Esperado: 176 · 43 · 3353 · 31085015. Las dos sumas deben ser IGUALES.
SELECT (SELECT COUNT(*)      FROM Lenguajes)           AS lenguajes,
       (SELECT COUNT(*)      FROM Periodos)            AS periodos,
       (SELECT COUNT(*)      FROM Actividad_Lenguajes) AS hechos,
       (SELECT SUM(cantidad) FROM Actividad_Lenguajes) AS suma_hechos,
       (SELECT SUM(cantidad) FROM datacsv)             AS suma_origen;

-- Los dos casos unificados. Esperado: Fortran 568 y MATLAB 1405.
SELECT l.nombre, p.anio, p.trimestre, a.cantidad
FROM   Actividad_Lenguajes a
JOIN   Lenguajes l ON l.idLenguaje = a.idLenguaje
JOIN   Periodos  p ON p.idPeriodo  = a.idPeriodo
WHERE  l.nombre IN ('Fortran', 'MATLAB') AND p.anio = 2016 AND p.trimestre = 1;


DROP TABLE datacsv;
