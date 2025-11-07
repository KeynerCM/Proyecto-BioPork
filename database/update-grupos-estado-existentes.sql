-- Script para actualizar grupos existentes que no tienen el campo estado
-- Este script establece el estado correcto para grupos creados antes de implementar la máquina de estados

-- Actualizar grupos que tienen animales pero no tienen estado establecido
UPDATE grupos
SET estado = CASE
  -- Si el grupo está inactivo, marcarlo como cerrado
  WHEN activo = false THEN 'cerrado'
  -- Si está activo y tiene animales
  WHEN activo = true AND cantidad_actual >= capacidad THEN 'completo'
  WHEN activo = true AND cantidad_actual > 0 AND cantidad_actual < capacidad THEN 'incompleto'
  -- Si está activo pero sin animales, marcarlo como en creación
  WHEN activo = true AND (cantidad_actual IS NULL OR cantidad_actual = 0) THEN 'en_creacion'
  -- Caso por defecto
  ELSE 'en_creacion'
END
WHERE estado IS NULL OR estado = '';

-- Verificar los resultados
SELECT 
  id,
  codigo,
  tipo,
  activo,
  cantidad_actual,
  capacidad,
  estado,
  fecha_creacion
FROM grupos
ORDER BY id;
