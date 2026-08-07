--darle permiso a sql server para acceder a la carpeta de descargas
EXEC xp_cmdshell 'dir D:\Descargas\practica1.csv';

EXEC sp_configure 'show advanced options', 1;
RECONFIGURE;
EXEC sp_configure 'xp_cmdshell', 1;
RECONFIGURE;
GO

--eliminar tabla si existe
DROP TABLE IF EXISTS datacsv;
GO
--crear tabla y subida de todo
CREATE TABLE datacsv (
    name VARCHAR(50),
    year int,
    quarter int,
    count int
);
GO

BULK INSERT datacsv
FROM 'D:\Descargas\practica1.csv'
WITH (
    FIELDTERMINATOR = ',',
    ROWTERMINATOR = '0x0a', -- Código hexadecimal exacto para \n
    FIRSTROW = 2
);
GO

SELECT * FROM datacsv;
GO
INSERT INTO Lenguajes (nombre)
SELECT DISTINCT name 
FROM datacsv
where name is not null;
GO

select * from Lenguajes;
GO

INSERT INTO Periodos (anio, trimestre)
SELECT DISTINCT year, quarter
FROM datacsv
WHERE year IS NOT NULL AND quarter IS NOT NULL;
GO

SELECT * FROM Periodos;
GO

INSERT INTO Actividad_Lenguajes (idLenguaje, idPeriodo, cantidad)
SELECT l.idLenguaje, p.idPeriodo, d.count
FROM datacsv d
JOIN Lenguajes l ON d.name = l.nombre
JOIN Periodos p ON d.year = p.anio AND d.quarter = p.trimestre;
GO
SELECT * FROM Actividad_Lenguajes;
--cOMPROBAR CONSULTA FINAL PARA VERIFICAR QUE SE HAYA INSERTADO CORRECTAMENTE
SELECT 
    L.nombre AS NombreLenguaje,
    P.anio AS Anio,
    P.trimestre AS Trimestre,
    A.cantidad AS ConteoActividades
FROM Actividad_Lenguajes A
JOIN Lenguajes L 
    ON A.idLenguaje = L.idLenguaje
JOIN Periodos P 
    ON A.idPeriodo = P.idPeriodo
WHERE L.nombre = 'Ruby' 
  AND P.anio = 2011 
  AND P.trimestre = 3;

--ELIMINAMOS LA TABLA TEMPORAL CREADA PARA LA CARGA DEL CSV
DROP TABLE IF EXISTS datacsv;
GO
