-- ============================================
-- Insertar usuarios iniciales para BioPork
-- ============================================

-- Eliminar usuarios existentes (opcional)
-- DELETE FROM usuarios;

-- Usuario Administrador
INSERT INTO usuarios (username, password, nombre, email, rol, activo)
VALUES ('admin', 'admin123', 'Administrador del Sistema', 'admin@biopork.com', 'admin', true)
ON CONFLICT (username) DO UPDATE SET
  password = 'admin123',
  nombre = 'Administrador del Sistema',
  email = 'admin@biopork.com',
  rol = 'admin',
  activo = true;

-- Usuario Operario de ejemplo
INSERT INTO usuarios (username, password, nombre, email, rol, activo)
VALUES ('operario1', 'operario123', 'Juan Pérez', 'juan@biopork.com', 'operario', true)
ON CONFLICT (username) DO NOTHING;

-- Usuario Consultor de ejemplo
INSERT INTO usuarios (username, password, nombre, email, rol, activo)
VALUES ('consultor1', 'consultor123', 'María García', 'maria@biopork.com', 'consultor', true)
ON CONFLICT (username) DO NOTHING;

-- Verificar usuarios creados
SELECT id, username, nombre, rol, activo FROM usuarios;
