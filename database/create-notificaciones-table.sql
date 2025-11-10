-- Crear tabla de notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('vacunacion', 'reproduccion', 'salud', 'grupo', 'general')),
  prioridad VARCHAR(20) NOT NULL CHECK (prioridad IN ('urgente', 'alta', 'media', 'baja')),
  leida BOOLEAN DEFAULT FALSE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  animal_id INTEGER REFERENCES animales(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_notificaciones_leida ON notificaciones(leida);
CREATE INDEX IF NOT EXISTS idx_notificaciones_tipo ON notificaciones(tipo);
CREATE INDEX IF NOT EXISTS idx_notificaciones_prioridad ON notificaciones(prioridad);
CREATE INDEX IF NOT EXISTS idx_notificaciones_fecha_creacion ON notificaciones(fecha_creacion DESC);
CREATE INDEX IF NOT EXISTS idx_notificaciones_animal_id ON notificaciones(animal_id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_notificaciones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_notificaciones_updated_at
  BEFORE UPDATE ON notificaciones
  FOR EACH ROW
  EXECUTE FUNCTION update_notificaciones_updated_at();

-- Insertar notificaciones de ejemplo (opcional)
INSERT INTO notificaciones (titulo, mensaje, tipo, prioridad, leida) VALUES
('Vacunación Pendiente', 'Hay 3 animales con vacunaciones próximas esta semana', 'vacunacion', 'alta', false),
('Parto Próximo', 'La cerda C00001 tiene parto estimado en 5 días', 'reproduccion', 'urgente', false),
('Revisar Salud', 'Animal A00005 reportado con síntomas', 'salud', 'alta', false),
('Grupo Completo', 'El grupo G00002 ha alcanzado su capacidad máxima', 'grupo', 'media', true),
('Sistema Actualizado', 'Nueva versión del sistema BioPork disponible', 'general', 'baja', true);

-- Verificar la creación
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'notificaciones'
ORDER BY ordinal_position;
