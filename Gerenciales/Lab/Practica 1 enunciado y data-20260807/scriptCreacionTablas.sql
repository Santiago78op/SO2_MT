CREATE DATABASE MayaCode_DB;
GO

USE MayaCode_DB;
GO

CREATE TABLE Lenguajes (
    idLenguaje INT PRIMARY KEY IDENTITY(1,1),
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Periodos (
    idPeriodo INT PRIMARY KEY IDENTITY(1,1),
    anio INT NOT NULL,
    trimestre INT CHECK (trimestre BETWEEN 1 AND 4) NOT NULL,
    CONSTRAINT UQ_Periodo UNIQUE (anio, trimestre) 
);

CREATE TABLE Actividad_Lenguajes (
    idActividad INT PRIMARY KEY IDENTITY(1,1),
    idLenguaje INT NOT NULL,
    idPeriodo INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 0,
    CONSTRAINT FK_Lenguaje FOREIGN KEY (idLenguaje) 
        REFERENCES Lenguajes(idLenguaje)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT FK_Periodo FOREIGN KEY (idPeriodo) 
        REFERENCES Periodos(idPeriodo)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


