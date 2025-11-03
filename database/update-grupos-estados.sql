-- Agregar campo estado a la tabla grupos
-- Ejecutar este SQL en Neon Database Console

ALTER TABLE grupos 
ADD COLUMN IF NOT EXISTS estado VARCHAR(50) DEFAULT 'en_creacion';

-- Actualizar registros existentes basado en su condición actual
UPDATE grupos
SET estado = CASE
  WHEN NOT activo THEN 'inactivo'
  WHEN cantidad_actual = 0 THEN 'en_creacion'
  WHEN cantidad_actual >= capacidad THEN 'completo'
  WHEN cantidad_actual > 0 AND cantidad_actual < capacidad THEN 'incompleto'
  ELSE 'en_creacion'
END
WHERE estado = 'en_creacion';

-- Comentario: Los posibles estados son:
-- 'en_creacion': Grupo nuevo sin confirmar
-- 'incompleto': Grupo con animales < capacidad
-- 'completo': Grupo con animales = capacidad
-- 'programado_salida': Fecha de salida <= 7 días
-- 'en_proceso_salida': Iniciando gestión de salida
-- 'cerrado': Salida completada
-- 'inactivo': Eliminado por admin
