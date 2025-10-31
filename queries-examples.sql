-- ============================================
-- BioPork - Consultas SQL Útiles
-- ============================================

-- ============================================
-- CONSULTAS DE ANIMALES
-- ============================================

-- Obtener todos los animales activos
SELECT * FROM vista_animales_activos ORDER BY codigo;

-- Buscar animal por código
SELECT * FROM animales WHERE codigo = 'A-001';

-- Animales de engorde próximos a peso de venta (ej: > 100kg)
SELECT 
  codigo,
  raza,
  peso_actual,
  EXTRACT(MONTH FROM AGE(CURRENT_DATE, fecha_nacimiento)) AS edad_meses
FROM animales
WHERE tipo = 'engorde' 
  AND estado = 'activo' 
  AND peso_actual >= 100
ORDER BY peso_actual DESC;

-- Cerdas reproductoras activas
SELECT 
  codigo,
  raza,
  fecha_nacimiento,
  EXTRACT(YEAR FROM AGE(CURRENT_DATE, fecha_nacimiento)) AS edad_anos
FROM animales
WHERE tipo = 'reproduccion' 
  AND sexo = 'hembra'
  AND estado = 'activo'
ORDER BY fecha_nacimiento;

-- ============================================
-- CONSULTAS DE SALUD Y VACUNACIONES
-- ============================================

-- Próximas vacunaciones (próximos 7 días)
SELECT 
  a.codigo,
  v.tipo_vacuna,
  v.proxima_fecha,
  CURRENT_DATE - v.proxima_fecha AS dias_vencidos
FROM vacunaciones v
JOIN animales a ON v.animal_id = a.id
WHERE v.proxima_fecha BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
  AND a.estado = 'activo'
ORDER BY v.proxima_fecha;

-- Historial de vacunaciones de un animal
SELECT 
  tipo_vacuna,
  fecha_aplicacion,
  dosis,
  proxima_fecha,
  veterinario
FROM vacunaciones
WHERE animal_id = (SELECT id FROM animales WHERE codigo = 'A-001')
ORDER BY fecha_aplicacion DESC;

-- Animales con tratamientos activos
SELECT 
  a.codigo,
  e.enfermedad,
  e.tratamiento,
  e.fecha_inicio,
  CURRENT_DATE - e.fecha_inicio AS dias_tratamiento
FROM enfermedades e
JOIN animales a ON e.animal_id = a.id
WHERE e.estado = 'en_tratamiento'
ORDER BY e.fecha_inicio;

-- ============================================
-- CONSULTAS DE REPRODUCCIÓN
-- ============================================

-- Cerdas en gestación
SELECT 
  a.codigo,
  c.fecha_celo,
  c.fecha_monta,
  c.fecha_estimada_parto,
  c.fecha_estimada_parto - CURRENT_DATE AS dias_hasta_parto
FROM ciclos_reproductivos c
JOIN animales a ON c.cerda_id = a.id
WHERE c.estado = 'gestante'
ORDER BY c.fecha_estimada_parto;

-- Próximos partos (próximos 10 días)
SELECT 
  a.codigo AS cerda,
  c.fecha_estimada_parto,
  c.tipo_monta,
  c.verraco
FROM ciclos_reproductivos c
JOIN animales a ON c.cerda_id = a.id
WHERE c.estado = 'gestante'
  AND c.fecha_estimada_parto BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '10 days'
ORDER BY c.fecha_estimada_parto;

-- Historial de partos de una cerda
SELECT 
  p.fecha_parto,
  p.lechones_nacidos,
  p.lechones_vivos,
  p.lechones_muertos,
  p.peso_promedio,
  p.dificultad
FROM partos p
JOIN animales a ON p.cerda_id = a.id
WHERE a.codigo = 'R-001'
ORDER BY p.fecha_parto DESC;

-- Estadísticas reproductivas por cerda
SELECT 
  a.codigo AS cerda,
  COUNT(p.id) AS total_partos,
  AVG(p.lechones_vivos) AS promedio_lechones_vivos,
  SUM(p.lechones_vivos) AS total_lechones_producidos,
  MAX(p.fecha_parto) AS ultimo_parto
FROM animales a
LEFT JOIN partos p ON a.id = p.cerda_id
WHERE a.tipo = 'reproduccion' AND a.sexo = 'hembra'
GROUP BY a.id, a.codigo
ORDER BY total_lechones_producidos DESC;

-- ============================================
-- CONSULTAS DE GRUPOS Y CORRALES
-- ============================================

-- Estado actual de los grupos
SELECT 
  g.codigo,
  g.nombre,
  g.tipo,
  g.corral_numero,
  g.cantidad_actual,
  g.capacidad,
  g.cantidad_actual::float / g.capacidad * 100 AS porcentaje_ocupacion,
  g.fecha_salida_programada
FROM grupos
WHERE activo = true
ORDER BY g.codigo;

-- Animales por grupo
SELECT 
  g.codigo AS grupo,
  g.nombre AS nombre_grupo,
  a.codigo AS animal,
  a.tipo,
  a.peso_actual,
  ag.fecha_ingreso
FROM animales_grupos ag
JOIN animales a ON ag.animal_id = a.id
JOIN grupos g ON ag.grupo_id = g.id
WHERE ag.fecha_salida IS NULL
  AND a.estado = 'activo'
ORDER BY g.codigo, a.codigo;

-- Grupos próximos a salida (próximos 15 días)
SELECT 
  codigo,
  nombre,
  tipo,
  cantidad_actual,
  peso_promedio,
  fecha_salida_programada,
  fecha_salida_programada - CURRENT_DATE AS dias_hasta_salida
FROM grupos
WHERE activo = true
  AND fecha_salida_programada BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '15 days'
ORDER BY fecha_salida_programada;

-- ============================================
-- CONSULTAS DE ESTADÍSTICAS
-- ============================================

-- Resumen general de la granja
SELECT * FROM vista_estadisticas_generales;

-- Animales registrados por mes (último año)
SELECT 
  TO_CHAR(fecha_registro, 'YYYY-MM') AS mes,
  COUNT(*) AS cantidad,
  tipo
FROM animales
WHERE fecha_registro >= CURRENT_DATE - INTERVAL '1 year'
GROUP BY mes, tipo
ORDER BY mes DESC;

-- Tasa de mortalidad por tipo
SELECT 
  tipo,
  COUNT(*) FILTER (WHERE estado = 'muerto') AS muertes,
  COUNT(*) AS total,
  ROUND(COUNT(*) FILTER (WHERE estado = 'muerto')::numeric / COUNT(*) * 100, 2) AS tasa_mortalidad
FROM animales
GROUP BY tipo;

-- Estadísticas de partos (último año)
SELECT 
  COUNT(*) AS total_partos,
  SUM(lechones_nacidos) AS total_lechones_nacidos,
  SUM(lechones_vivos) AS total_lechones_vivos,
  SUM(lechones_muertos) AS total_lechones_muertos,
  AVG(lechones_vivos) AS promedio_vivos_por_parto,
  AVG(peso_promedio) AS peso_promedio_lechones
FROM partos
WHERE fecha_parto >= CURRENT_DATE - INTERVAL '1 year';

-- Evolución de peso (ganancia diaria promedio)
SELECT 
  a.codigo,
  a.tipo,
  ROUND(AVG(p.ganancia_diaria), 2) AS ganancia_diaria_promedio,
  MAX(p.peso) AS peso_maximo,
  COUNT(p.id) AS numero_pesajes
FROM pesajes p
JOIN animales a ON p.animal_id = a.id
WHERE p.fecha_pesaje >= CURRENT_DATE - INTERVAL '3 months'
GROUP BY a.id, a.codigo, a.tipo
ORDER BY ganancia_diaria_promedio DESC;

-- Gastos en salud (último mes)
SELECT 
  SUM(costo) AS costo_total_tratamientos,
  COUNT(*) AS numero_tratamientos,
  AVG(costo) AS costo_promedio
FROM enfermedades
WHERE fecha_inicio >= CURRENT_DATE - INTERVAL '1 month'
  AND costo IS NOT NULL;

-- ============================================
-- CONSULTAS DE NOTIFICACIONES
-- ============================================

-- Notificaciones no leídas por prioridad
SELECT 
  prioridad,
  tipo,
  COUNT(*) AS cantidad
FROM notificaciones
WHERE leida = false
GROUP BY prioridad, tipo
ORDER BY 
  CASE prioridad
    WHEN 'urgente' THEN 1
    WHEN 'alta' THEN 2
    WHEN 'media' THEN 3
    WHEN 'baja' THEN 4
  END;

-- Últimas notificaciones
SELECT 
  id,
  tipo,
  titulo,
  mensaje,
  prioridad,
  fecha_creacion
FROM notificaciones
ORDER BY fecha_creacion DESC
LIMIT 20;

-- ============================================
-- CONSULTAS DE ALIMENTACIÓN
-- ============================================

-- Consumo de alimento por día (último mes)
SELECT 
  fecha,
  SUM(cantidad_kg) AS total_kg,
  SUM(costo) AS costo_total,
  COUNT(DISTINCT animal_id) + COUNT(DISTINCT grupo_id) AS registros
FROM alimentacion
WHERE fecha >= CURRENT_DATE - INTERVAL '1 month'
GROUP BY fecha
ORDER BY fecha DESC;

-- Consumo promedio por animal tipo engorde
SELECT 
  a.codigo,
  COUNT(al.id) AS registros,
  SUM(al.cantidad_kg) AS total_consumido,
  AVG(al.cantidad_kg) AS promedio_diario
FROM alimentacion al
JOIN animales a ON al.animal_id = a.id
WHERE a.tipo = 'engorde'
  AND al.fecha >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY a.id, a.codigo
ORDER BY total_consumido DESC;

-- ============================================
-- CONSULTAS DE SALIDAS/VENTAS
-- ============================================

-- Ventas del último mes
SELECT 
  a.codigo,
  sa.fecha_salida,
  sa.peso_salida,
  sa.precio,
  sa.comprador,
  sa.destino
FROM salidas_animales sa
JOIN animales a ON sa.animal_id = a.id
WHERE sa.motivo = 'venta'
  AND sa.fecha_salida >= CURRENT_DATE - INTERVAL '1 month'
ORDER BY sa.fecha_salida DESC;

-- Ingresos por ventas
SELECT 
  DATE_TRUNC('month', fecha_salida) AS mes,
  COUNT(*) AS animales_vendidos,
  SUM(precio) AS ingresos_totales,
  AVG(precio) AS precio_promedio,
  SUM(peso_salida) AS peso_total_vendido
FROM salidas_animales
WHERE motivo = 'venta'
  AND fecha_salida >= CURRENT_DATE - INTERVAL '1 year'
GROUP BY mes
ORDER BY mes DESC;

-- Causas de muerte (último año)
SELECT 
  causa_muerte,
  COUNT(*) AS cantidad
FROM salidas_animales
WHERE motivo = 'muerte'
  AND fecha_salida >= CURRENT_DATE - INTERVAL '1 year'
GROUP BY causa_muerte
ORDER BY cantidad DESC;

-- ============================================
-- CONSULTAS AVANZADAS
-- ============================================

-- Ranking de cerdas más productivas
SELECT 
  a.codigo,
  a.raza,
  COUNT(p.id) AS numero_partos,
  SUM(p.lechones_vivos) AS total_lechones_vivos,
  AVG(p.lechones_vivos) AS promedio_por_parto,
  MIN(p.fecha_parto) AS primer_parto,
  MAX(p.fecha_parto) AS ultimo_parto
FROM animales a
JOIN partos p ON a.id = p.cerda_id
WHERE a.tipo = 'reproduccion'
GROUP BY a.id, a.codigo, a.raza
HAVING COUNT(p.id) > 0
ORDER BY total_lechones_vivos DESC
LIMIT 10;

-- Eficiencia de ganancia de peso por animal
SELECT 
  a.codigo,
  a.fecha_nacimiento,
  EXTRACT(DAY FROM AGE(CURRENT_DATE, a.fecha_nacimiento)) AS dias_vida,
  a.peso_inicial,
  a.peso_actual,
  a.peso_actual - a.peso_inicial AS ganancia_total,
  ROUND((a.peso_actual - a.peso_inicial) / EXTRACT(DAY FROM AGE(CURRENT_DATE, a.fecha_nacimiento)), 3) AS ganancia_diaria
FROM animales a
WHERE a.tipo = 'engorde'
  AND a.estado = 'activo'
  AND a.peso_inicial IS NOT NULL
  AND a.peso_actual IS NOT NULL
ORDER BY ganancia_diaria DESC;

-- Alertas críticas (requieren atención inmediata)
SELECT 
  'Vacunación vencida' AS tipo_alerta,
  a.codigo AS animal,
  v.tipo_vacuna AS detalle,
  v.proxima_fecha AS fecha
FROM vacunaciones v
JOIN animales a ON v.animal_id = a.id
WHERE v.proxima_fecha < CURRENT_DATE
  AND a.estado = 'activo'

UNION ALL

SELECT 
  'Tratamiento prolongado' AS tipo_alerta,
  a.codigo AS animal,
  e.enfermedad AS detalle,
  e.fecha_inicio AS fecha
FROM enfermedades e
JOIN animales a ON e.animal_id = a.id
WHERE e.estado = 'en_tratamiento'
  AND CURRENT_DATE - e.fecha_inicio > 30

UNION ALL

SELECT 
  'Parto próximo' AS tipo_alerta,
  a.codigo AS animal,
  'Gestación' AS detalle,
  c.fecha_estimada_parto AS fecha
FROM ciclos_reproductivos c
JOIN animales a ON c.cerda_id = a.id
WHERE c.estado = 'gestante'
  AND c.fecha_estimada_parto BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days'

ORDER BY fecha;
