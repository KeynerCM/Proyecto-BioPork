-- ============================================
-- BioPork Database Schema
-- PostgreSQL (Neon)
-- ============================================

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nombre VARCHAR(100),
  email VARCHAR(100),
  rol VARCHAR(20) DEFAULT 'operario' CHECK (rol IN ('admin', 'operario', 'consultor')),
  activo BOOLEAN DEFAULT true,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultimo_acceso TIMESTAMP
);

-- Tabla de animales
CREATE TABLE IF NOT EXISTS animales (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('engorde', 'reproduccion')),
  raza VARCHAR(100),
  fecha_nacimiento DATE NOT NULL,
  fecha_ingreso DATE DEFAULT CURRENT_DATE,
  peso_inicial DECIMAL(10,2),
  peso_actual DECIMAL(10,2),
  sexo VARCHAR(10) CHECK (sexo IN ('macho', 'hembra')),
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'vendido', 'muerto', 'trasladado')),
  grupo_id INTEGER,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de vacunaciones
CREATE TABLE IF NOT EXISTS vacunaciones (
  id SERIAL PRIMARY KEY,
  animal_id INTEGER REFERENCES animales(id) ON DELETE CASCADE,
  tipo_vacuna VARCHAR(100) NOT NULL,
  fecha_aplicacion DATE NOT NULL,
  dosis VARCHAR(50),
  lote_vacuna VARCHAR(50),
  proxima_fecha DATE,
  veterinario VARCHAR(100),
  notas TEXT,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de enfermedades y tratamientos
CREATE TABLE IF NOT EXISTS enfermedades (
  id SERIAL PRIMARY KEY,
  animal_id INTEGER REFERENCES animales(id) ON DELETE CASCADE,
  enfermedad VARCHAR(100) NOT NULL,
  sintomas TEXT,
  fecha_inicio DATE NOT NULL,
  tratamiento TEXT,
  medicamento VARCHAR(200),
  dosis VARCHAR(100),
  estado VARCHAR(20) DEFAULT 'en_tratamiento' CHECK (estado IN ('en_tratamiento', 'recuperado', 'cronico')),
  fecha_recuperacion DATE,
  veterinario VARCHAR(100),
  costo DECIMAL(10,2),
  notas TEXT,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de ciclos reproductivos
CREATE TABLE IF NOT EXISTS ciclos_reproductivos (
  id SERIAL PRIMARY KEY,
  cerda_id INTEGER REFERENCES animales(id) ON DELETE CASCADE,
  fecha_celo DATE NOT NULL,
  fecha_monta DATE,
  tipo_monta VARCHAR(20) CHECK (tipo_monta IN ('natural', 'artificial')),
  verraco VARCHAR(100),
  fecha_estimada_parto DATE,
  estado VARCHAR(20) DEFAULT 'esperando' CHECK (estado IN ('esperando', 'gestante', 'parto_completado', 'fallido')),
  notas TEXT,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de partos
CREATE TABLE IF NOT EXISTS partos (
  id SERIAL PRIMARY KEY,
  cerda_id INTEGER REFERENCES animales(id) ON DELETE CASCADE,
  ciclo_id INTEGER REFERENCES ciclos_reproductivos(id),
  fecha_parto DATE NOT NULL,
  lechones_nacidos INTEGER NOT NULL,
  lechones_vivos INTEGER NOT NULL,
  lechones_muertos INTEGER NOT NULL,
  peso_promedio DECIMAL(10,2),
  dificultad VARCHAR(20) CHECK (dificultad IN ('normal', 'asistido', 'cesarea')),
  estado_cerda VARCHAR(50),
  observaciones TEXT,
  veterinario VARCHAR(100),
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de alimentación
CREATE TABLE IF NOT EXISTS alimentacion (
  id SERIAL PRIMARY KEY,
  animal_id INTEGER REFERENCES animales(id) ON DELETE CASCADE,
  grupo_id INTEGER,
  tipo_alimento VARCHAR(100),
  cantidad_kg DECIMAL(10,2),
  fecha DATE NOT NULL,
  horario VARCHAR(20),
  costo DECIMAL(10,2),
  notas TEXT,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de grupos/corrales
CREATE TABLE IF NOT EXISTS grupos (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(100),
  tipo VARCHAR(20) CHECK (tipo IN ('engorde', 'reproduccion')),
  corral_numero VARCHAR(20),
  capacidad INTEGER,
  cantidad_actual INTEGER DEFAULT 0,
  fecha_creacion DATE DEFAULT CURRENT_DATE,
  fecha_salida_programada DATE,
  peso_promedio DECIMAL(10,2),
  activo BOOLEAN DEFAULT true,
  notas TEXT,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Relación muchos a muchos: animales en grupos
CREATE TABLE IF NOT EXISTS animales_grupos (
  id SERIAL PRIMARY KEY,
  animal_id INTEGER REFERENCES animales(id) ON DELETE CASCADE,
  grupo_id INTEGER REFERENCES grupos(id) ON DELETE CASCADE,
  fecha_ingreso DATE DEFAULT CURRENT_DATE,
  fecha_salida DATE,
  UNIQUE(animal_id, grupo_id)
);

-- Tabla de salidas de animales
CREATE TABLE IF NOT EXISTS salidas_animales (
  id SERIAL PRIMARY KEY,
  animal_id INTEGER REFERENCES animales(id),
  motivo VARCHAR(50) CHECK (motivo IN ('venta', 'muerte', 'traslado', 'sacrificio')),
  fecha_salida DATE NOT NULL,
  destino VARCHAR(200),
  comprador VARCHAR(200),
  precio DECIMAL(10,2),
  peso_salida DECIMAL(10,2),
  causa_muerte TEXT,
  observaciones TEXT,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de pesajes
CREATE TABLE IF NOT EXISTS pesajes (
  id SERIAL PRIMARY KEY,
  animal_id INTEGER REFERENCES animales(id) ON DELETE CASCADE,
  peso DECIMAL(10,2) NOT NULL,
  fecha_pesaje DATE NOT NULL,
  ganancia_diaria DECIMAL(10,2),
  notas TEXT,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(50) CHECK (tipo IN ('vacunacion', 'ciclo_reproductivo', 'parto', 'salida', 'alimentacion', 'pesaje', 'enfermedad', 'general')),
  titulo VARCHAR(200) NOT NULL,
  mensaje TEXT,
  animal_id INTEGER REFERENCES animales(id) ON DELETE CASCADE,
  grupo_id INTEGER REFERENCES grupos(id) ON DELETE CASCADE,
  fecha_evento DATE,
  prioridad VARCHAR(20) DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta', 'urgente')),
  leida BOOLEAN DEFAULT false,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de historial de cambios (auditoría)
CREATE TABLE IF NOT EXISTS historial_cambios (
  id SERIAL PRIMARY KEY,
  tabla VARCHAR(50) NOT NULL,
  registro_id INTEGER NOT NULL,
  accion VARCHAR(20) CHECK (accion IN ('INSERT', 'UPDATE', 'DELETE')),
  usuario_id INTEGER REFERENCES usuarios(id),
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Índices para mejorar rendimiento
-- ============================================

CREATE INDEX idx_animales_codigo ON animales(codigo);
CREATE INDEX idx_animales_tipo ON animales(tipo);
CREATE INDEX idx_animales_estado ON animales(estado);
CREATE INDEX idx_animales_grupo ON animales(grupo_id);
CREATE INDEX idx_vacunaciones_animal ON vacunaciones(animal_id);
CREATE INDEX idx_vacunaciones_fecha ON vacunaciones(fecha_aplicacion);
CREATE INDEX idx_enfermedades_animal ON enfermedades(animal_id);
CREATE INDEX idx_partos_cerda ON partos(cerda_id);
CREATE INDEX idx_partos_fecha ON partos(fecha_parto);
CREATE INDEX idx_grupos_activo ON grupos(activo);
CREATE INDEX idx_notificaciones_leida ON notificaciones(leida);
CREATE INDEX idx_notificaciones_tipo ON notificaciones(tipo);

-- ============================================
-- Triggers para actualizar timestamps
-- ============================================

CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_ultima_actualizacion = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_animales
BEFORE UPDATE ON animales
FOR EACH ROW
EXECUTE FUNCTION actualizar_timestamp();

-- ============================================
-- Trigger para actualizar cantidad de animales en grupos
-- ============================================

CREATE OR REPLACE FUNCTION actualizar_cantidad_grupo()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE grupos 
    SET cantidad_actual = cantidad_actual + 1 
    WHERE id = NEW.grupo_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE grupos 
    SET cantidad_actual = cantidad_actual - 1 
    WHERE id = OLD.grupo_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.grupo_id != NEW.grupo_id THEN
    UPDATE grupos 
    SET cantidad_actual = cantidad_actual - 1 
    WHERE id = OLD.grupo_id;
    
    UPDATE grupos 
    SET cantidad_actual = cantidad_actual + 1 
    WHERE id = NEW.grupo_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cantidad_grupo
AFTER INSERT OR UPDATE OR DELETE ON animales_grupos
FOR EACH ROW
EXECUTE FUNCTION actualizar_cantidad_grupo();

-- ============================================
-- Datos iniciales (usuario administrador)
-- ============================================

INSERT INTO usuarios (username, password, nombre, rol)
VALUES ('admin', '$2b$10$YourHashedPasswordHere', 'Administrador', 'admin')
ON CONFLICT (username) DO NOTHING;

-- ============================================
-- Vistas útiles
-- ============================================

-- Vista de animales activos con información completa
CREATE OR REPLACE VIEW vista_animales_activos AS
SELECT 
  a.id,
  a.codigo,
  a.tipo,
  a.raza,
  a.fecha_nacimiento,
  EXTRACT(YEAR FROM AGE(CURRENT_DATE, a.fecha_nacimiento)) AS edad_anos,
  EXTRACT(MONTH FROM AGE(CURRENT_DATE, a.fecha_nacimiento)) AS edad_meses,
  a.peso_actual,
  a.sexo,
  g.nombre AS grupo_nombre,
  g.corral_numero
FROM animales a
LEFT JOIN grupos g ON a.grupo_id = g.id
WHERE a.estado = 'activo';

-- Vista de próximas vacunaciones
CREATE OR REPLACE VIEW vista_proximas_vacunaciones AS
SELECT 
  v.id,
  a.codigo AS animal_codigo,
  a.tipo AS animal_tipo,
  v.tipo_vacuna,
  v.proxima_fecha,
  CURRENT_DATE - v.proxima_fecha AS dias_diferencia
FROM vacunaciones v
JOIN animales a ON v.animal_id = a.id
WHERE v.proxima_fecha IS NOT NULL 
  AND a.estado = 'activo'
  AND v.proxima_fecha BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
ORDER BY v.proxima_fecha;

-- Vista de estadísticas generales
CREATE OR REPLACE VIEW vista_estadisticas_generales AS
SELECT 
  COUNT(*) FILTER (WHERE estado = 'activo') AS total_activos,
  COUNT(*) FILTER (WHERE tipo = 'engorde' AND estado = 'activo') AS engorde_activos,
  COUNT(*) FILTER (WHERE tipo = 'reproduccion' AND estado = 'activo') AS reproduccion_activos,
  AVG(peso_actual) FILTER (WHERE tipo = 'engorde' AND estado = 'activo') AS peso_promedio_engorde
FROM animales;

-- ============================================
-- Comentarios en tablas
-- ============================================

COMMENT ON TABLE animales IS 'Registro principal de todos los animales de la granja';
COMMENT ON TABLE grupos IS 'Organización de animales por corrales o grupos';
COMMENT ON TABLE partos IS 'Registro de partos de cerdas reproductoras';
COMMENT ON TABLE notificaciones IS 'Sistema de alertas y recordatorios';
