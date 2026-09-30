-- =====================================================
-- DATOS DE PRUEBA PARA LOS GRÁFICOS (oct-2025 a sep-2026)
-- Ejecutar DESPUÉS de init.sql. Se puede correr varias veces:
-- no inserta un mes que ya exista para ese depto/servicio.
--   docker compose exec -T db mysql -uroot -proot monitoreo_bd < datos_prueba.sql
-- "lectura" = consumo del mes (m³ agua / kWh luz)
-- =====================================================
SET NAMES utf8mb4;
USE monitoreo_bd;

CREATE TEMPORARY TABLE tmp_consumos (
    departamento VARCHAR(50), servicio VARCHAR(10), lectura DECIMAL(10,2), fecha DATE
);

INSERT INTO tmp_consumos VALUES
('Apto 101','Agua',15.74,'2025-10-05'),
('Apto 101','Luz',93.3,'2025-10-05'),
('Apto 101','Agua',14.82,'2025-11-05'),
('Apto 101','Luz',113.85,'2025-11-05'),
('Apto 101','Agua',14.85,'2025-12-05'),
('Apto 101','Luz',127.35,'2025-12-05'),
('Apto 101','Agua',17.37,'2026-01-05'),
('Apto 101','Luz',112.64,'2026-01-05'),
('Apto 101','Agua',16.9,'2026-02-05'),
('Apto 101','Luz',120.75,'2026-02-05'),
('Apto 101','Agua',16.18,'2026-03-05'),
('Apto 101','Luz',121.72,'2026-03-05'),
('Apto 101','Agua',16.46,'2026-04-05'),
('Apto 101','Luz',97.4,'2026-04-05'),
('Apto 101','Agua',15.23,'2026-05-05'),
('Apto 101','Luz',91.77,'2026-05-05'),
('Apto 101','Agua',14.99,'2026-06-05'),
('Apto 101','Luz',70.39,'2026-06-05'),
('Apto 101','Agua',14.68,'2026-07-05'),
('Apto 101','Luz',70.26,'2026-07-05'),
('Apto 101','Agua',12.69,'2026-08-05'),
('Apto 101','Luz',79.24,'2026-08-05'),
('Apto 101','Agua',15.22,'2026-09-05'),
('Apto 101','Luz',75.78,'2026-09-05'),
('Apto 102','Agua',21.4,'2025-10-05'),
('Apto 102','Luz',207.78,'2025-10-05'),
('Apto 102','Agua',20.93,'2025-11-05'),
('Apto 102','Luz',239.93,'2025-11-05'),
('Apto 102','Agua',22.92,'2025-12-05'),
('Apto 102','Luz',239.28,'2025-12-05'),
('Apto 102','Agua',22.38,'2026-01-05'),
('Apto 102','Luz',221.51,'2026-01-05'),
('Apto 102','Agua',21.55,'2026-02-05'),
('Apto 102','Luz',241.97,'2026-02-05'),
('Apto 102','Agua',23.38,'2026-03-05'),
('Apto 102','Luz',233.24,'2026-03-05'),
('Apto 102','Agua',23.55,'2026-04-05'),
('Apto 102','Luz',192.01,'2026-04-05'),
('Apto 102','Agua',22.35,'2026-05-05'),
('Apto 102','Luz',160.41,'2026-05-05'),
('Apto 102','Agua',21.63,'2026-06-05'),
('Apto 102','Luz',145.16,'2026-06-05'),
('Apto 102','Agua',21.54,'2026-07-05'),
('Apto 102','Luz',142.87,'2026-07-05'),
('Apto 102','Agua',19.81,'2026-08-05'),
('Apto 102','Luz',153.34,'2026-08-05'),
('Apto 102','Agua',27.63,'2026-09-05'),
('Apto 102','Luz',156.12,'2026-09-05'),
('Local Comercial 1','Agua',48.43,'2025-10-05'),
('Local Comercial 1','Luz',333.7,'2025-10-05'),
('Local Comercial 1','Agua',45.81,'2025-11-05'),
('Local Comercial 1','Luz',353.29,'2025-11-05'),
('Local Comercial 1','Agua',50.8,'2025-12-05'),
('Local Comercial 1','Luz',411.17,'2025-12-05'),
('Local Comercial 1','Agua',57.98,'2026-01-05'),
('Local Comercial 1','Luz',367.25,'2026-01-05'),
('Local Comercial 1','Agua',52.61,'2026-02-05'),
('Local Comercial 1','Luz',358.47,'2026-02-05'),
('Local Comercial 1','Agua',53.26,'2026-03-05'),
('Local Comercial 1','Luz',391.84,'2026-03-05'),
('Local Comercial 1','Agua',49.98,'2026-04-05'),
('Local Comercial 1','Luz',325.22,'2026-04-05'),
('Local Comercial 1','Agua',41.41,'2026-05-05'),
('Local Comercial 1','Luz',257.39,'2026-05-05'),
('Local Comercial 1','Agua',41.56,'2026-06-05'),
('Local Comercial 1','Luz',229.74,'2026-06-05'),
('Local Comercial 1','Agua',40.04,'2026-07-05'),
('Local Comercial 1','Luz',262.05,'2026-07-05'),
('Local Comercial 1','Agua',42.51,'2026-08-05'),
('Local Comercial 1','Luz',271.12,'2026-08-05'),
('Local Comercial 1','Agua',47.98,'2026-09-05'),
('Local Comercial 1','Luz',295.42,'2026-09-05');

-- 1. Insertar solo los meses que no existan todavía
INSERT INTO Consumos (id_departamento, servicio, lectura, fecha_facturacion)
SELECT d.id_departamento, t.servicio, t.lectura, t.fecha
FROM tmp_consumos t
JOIN Departamentos d ON d.nombre = t.departamento
WHERE NOT EXISTS (
    SELECT 1 FROM Consumos c
    WHERE c.id_departamento = d.id_departamento AND c.servicio = t.servicio
      AND YEAR(c.fecha_facturacion) = YEAR(t.fecha) AND MONTH(c.fecha_facturacion) = MONTH(t.fecha)
);

DROP TEMPORARY TABLE tmp_consumos;

-- 2. Recalcular categoría según umbrales
UPDATE Consumos c
JOIN Configuracion_Umbrales u ON u.servicio = c.servicio
SET c.categoria = CASE
    WHEN c.lectura <= u.limite_optimo  THEN 'ÓPTIMO'
    WHEN c.lectura <= u.limite_regular THEN 'REGULAR'
    ELSE 'EXCESIVO' END;

-- 3. Recalcular variación contra el mes anterior del mismo depto/servicio
UPDATE Consumos c
JOIN (
    SELECT id_consumo, lectura,
           LAG(lectura) OVER (PARTITION BY id_departamento, servicio ORDER BY fecha_facturacion) AS anterior
    FROM Consumos
) x ON x.id_consumo = c.id_consumo
SET c.diferencia_absoluta   = IF(x.anterior IS NULL, 0, x.lectura - x.anterior),
    c.diferencia_porcentual = IF(x.anterior IS NULL OR x.anterior = 0, 0, ROUND((x.lectura - x.anterior) / x.anterior * 100, 2));
