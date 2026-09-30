-- =====================================================
-- MIGRACIÓN: ÁREAS COMUNES
-- Agrega el tipo de unidad (Departamento | Local | Área común) y crea
-- las áreas comunes del edificio. Para bases que ya existen.
-- Se puede ejecutar varias veces: no duplica ni borra datos.
--   docker compose cp migracion_areas_comunes.sql db:/tmp/migracion.sql
--   docker compose exec db sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" < /tmp/migracion.sql'
-- =====================================================
SET NAMES utf8mb4;
USE monitoreo_bd;

-- 1. Columna "tipo" (MySQL 8 no tiene ADD COLUMN IF NOT EXISTS, por eso se revisa antes)
SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS
           WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Departamentos' AND COLUMN_NAME = 'tipo');
SET @s := IF(@c = 0,
    "ALTER TABLE Departamentos ADD COLUMN tipo VARCHAR(20) NOT NULL DEFAULT 'Departamento' AFTER nombre",
    'DO 0');
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

-- 2. Los locales comerciales existentes pasan a tipo "Local"
UPDATE Departamentos SET tipo = 'Local'
WHERE tipo = 'Departamento' AND nombre LIKE 'Local%';

-- 3. Áreas comunes del edificio (solo las que no existan)
INSERT INTO Departamentos (nombre, tipo, descripcion)
SELECT t.nombre, 'Área común', t.descripcion
FROM (
    SELECT 'Piscina' AS nombre, 'Bomba de filtrado y reposición de agua' AS descripcion
    UNION ALL SELECT 'Bombas de agua', 'Bombeo al tanque elevado'
    UNION ALL SELECT 'Ascensor', 'Ascensor principal'
    UNION ALL SELECT 'Pasillos y escaleras', 'Iluminación y limpieza'
    UNION ALL SELECT 'Jardín y riego', 'Riego e iluminación exterior'
) t
WHERE NOT EXISTS (SELECT 1 FROM Departamentos d WHERE d.nombre = t.nombre);
