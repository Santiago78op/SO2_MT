SELECT VERSION() AS version_del_servidor;

-- Collation _as_ci = insensible a mayúsculas: el UNIQUE de Lenguajes rechaza
-- 'MATLAB' si ya existe 'Matlab'. Intencional. Si el servidor es < 8.0.1,
-- reemplazar utf8mb4_0900_as_ci por utf8mb4_unicode_ci.
CREATE DATABASE IF NOT EXISTS MayaCode_DB
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_0900_as_ci;

USE MayaCode_DB;

-- Orden hija -> padre
DROP TABLE IF EXISTS Actividad_Lenguajes;
DROP TABLE IF EXISTS Lenguajes;
DROP TABLE IF EXISTS Periodos;

CREATE TABLE Lenguajes (
    idLenguaje  INT          NOT NULL AUTO_INCREMENT,
    nombre      VARCHAR(50)  COLLATE utf8mb4_0900_as_ci NOT NULL,

    CONSTRAINT PK_Lenguajes        PRIMARY KEY (idLenguaje),
    CONSTRAINT UQ_Lenguajes_Nombre UNIQUE (nombre)
) ENGINE = InnoDB;

CREATE TABLE Periodos (
    idPeriodo   INT NOT NULL AUTO_INCREMENT,
    anio        INT NOT NULL,
    trimestre   INT NOT NULL,
    orden       INT GENERATED ALWAYS AS (anio * 10 + trimestre) STORED,  -- eje temporal para Power BI

    CONSTRAINT PK_Periodos           PRIMARY KEY (idPeriodo),
    CONSTRAINT UQ_Periodos_AnioTrim  UNIQUE (anio, trimestre),
    CONSTRAINT CK_Periodos_Trimestre CHECK (trimestre BETWEEN 1 AND 4),
    CONSTRAINT CK_Periodos_Anio      CHECK (anio BETWEEN 2011 AND 2100)
) ENGINE = InnoDB;

-- IX_Actividad_Periodo: InnoDB exige índice en la columna de cada FK; idLenguaje ya lo
-- tiene por ser prefijo de la PK, idPeriodo no.
CREATE TABLE Actividad_Lenguajes (
    idLenguaje  INT NOT NULL,
    idPeriodo   INT NOT NULL,
    cantidad    INT NOT NULL,

    CONSTRAINT PK_Actividad_Lenguajes PRIMARY KEY (idLenguaje, idPeriodo),

    INDEX IX_Actividad_Periodo (idPeriodo),

    CONSTRAINT FK_Actividad_Lenguajes FOREIGN KEY (idLenguaje)
        REFERENCES Lenguajes (idLenguaje) ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT FK_Actividad_Periodos  FOREIGN KEY (idPeriodo)
        REFERENCES Periodos (idPeriodo)  ON UPDATE NO ACTION ON DELETE NO ACTION,

    CONSTRAINT CK_Actividad_Cantidad  CHECK (cantidad >= 0)
) ENGINE = InnoDB;


-- MySQL ignora el nombre de las PK y siempre las llama 'PRIMARY'.
SELECT  TABLE_NAME AS tabla, CONSTRAINT_NAME AS restriccion, CONSTRAINT_TYPE AS tipo
FROM    information_schema.TABLE_CONSTRAINTS
WHERE   TABLE_SCHEMA = 'MayaCode_DB'
ORDER   BY TABLE_NAME, CONSTRAINT_TYPE, CONSTRAINT_NAME;

-- La PK del hecho debe tener 2 columnas: idLenguaje (1), idPeriodo (2).
SELECT  COLUMN_NAME AS columna, ORDINAL_POSITION AS posicion
FROM    information_schema.KEY_COLUMN_USAGE
WHERE   TABLE_SCHEMA = 'MayaCode_DB'
    AND TABLE_NAME = 'Actividad_Lenguajes'
    AND CONSTRAINT_NAME = 'PRIMARY'
ORDER   BY ORDINAL_POSITION;
