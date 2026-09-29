-- 1. Crear la base de datos
CREATE DATABASE IF NOT EXISTS monitoreo_bd;
USE monitoreo_bd;

-- 2. Tabla de Departamentos
CREATE TABLE Departamentos (
    id_departamento INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    estado VARCHAR(15) DEFAULT 'Activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Usuarios
CREATE TABLE Usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'operador',
    estado VARCHAR(15) DEFAULT 'Activo',
    intentos_fallidos INT DEFAULT 0,
    bloqueado_hasta DATETIME NULL
);

-- 4. Tabla de Configuración de Umbrales y Tarifas
CREATE TABLE Configuracion_Umbrales (
    id_umbral INT AUTO_INCREMENT PRIMARY KEY,
    servicio ENUM('Agua', 'Luz') NOT NULL UNIQUE,
    unidad_medida VARCHAR(10) NOT NULL,
    tarifa_por_unidad DECIMAL(10,2) NOT NULL,
    limite_optimo INT NOT NULL,
    limite_regular INT NOT NULL
);

-- 5. Tabla Central de Consumos
CREATE TABLE Consumos (
    id_consumo INT AUTO_INCREMENT PRIMARY KEY,
    id_departamento INT NOT NULL,
    servicio ENUM('Agua', 'Luz') NOT NULL,
    lectura DECIMAL(10,2) NOT NULL,
    fecha_facturacion DATE NOT NULL,
    diferencia_absoluta DECIMAL(10,2) DEFAULT 0,
    diferencia_porcentual DECIMAL(10,2) DEFAULT 0,
    categoria VARCHAR(20) DEFAULT 'NO CLASIFICADO',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_departamento) REFERENCES Departamentos(id_departamento) ON DELETE CASCADE
);

-- 6. Tabla de Bitácora de Alertas
CREATE TABLE Bitacora_Alertas (
    id_alerta INT AUTO_INCREMENT PRIMARY KEY,
    id_consumo INT NOT NULL,
    porcentaje_exceso DECIMAL(5,2) NOT NULL,
    fecha_alerta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_consumo) REFERENCES Consumos(id_consumo) ON DELETE CASCADE
);

-- ==========================================
-- INSERCIÓN DE DATOS POR DEFECTO Y DE PRUEBA
-- ==========================================

-- Umbrales y Tarifas Reales (Agua y Luz separados)
INSERT INTO Configuracion_Umbrales (servicio, unidad_medida, tarifa_por_unidad, limite_optimo, limite_regular) 
VALUES 
('Agua', 'm³', 5.50, 50, 100), 
('Luz', 'kWh', 0.85, 100, 200);

-- Administrador con contraseña encriptada (Contraseña: 123456)
INSERT INTO Usuarios (username, password_hash, rol, estado) 
VALUES ('admin', '$2b$10$fKg7NwlIC0TjbStbTgNN6.B2mRZDl2DRuXoR3UcJkozHD3.uiDTmK', 'admin', 'Activo');
-- Departamentos para la demostración
INSERT INTO Departamentos (nombre, descripcion) VALUES 
('Apto 101', 'Familia Perez'), 
('Apto 102', 'Familia Gomez'), 
('Local Comercial 1', 'Tienda Principal');

-- Consumos iniciales para que el Dashboard tenga datos al arrancar
INSERT INTO Consumos (id_departamento, servicio, lectura, fecha_facturacion) VALUES 
(1, 'Agua', 14.5, '2023-10-01'), 
(1, 'Luz', 150.0, '2023-10-01'),
(2, 'Agua', 22.0, '2023-10-01'), 
(2, 'Luz', 185.0, '2023-10-01');