# Guía de Inicio Rápido - BioPork

## ⚠️ Solución al problema de ejecución de scripts en PowerShell

Si ves este error al intentar ejecutar npm:
```
No se puede cargar el archivo C:\Program Files\nodejs\npm.ps1 porque la ejecución de scripts está deshabilitada en este sistema.
```

**Solución:**

Abre PowerShell como Administrador y ejecuta:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

O para una solución temporal solo en la sesión actual:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

## 🚀 Instalación y Ejecución

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia el archivo de ejemplo:
```bash
copy .env.example .env
```

Edita `.env` con tus credenciales de Neon Database.

### 3. Iniciar servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: http://localhost:3000

## 📝 Credenciales de Prueba (Temporal)

- **Usuario:** admin
- **Contraseña:** cualquier cosa (sin validación aún)

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo

# Build
npm run build            # Construir para producción
npm run preview          # Previsualizar build

# Código
npm run lint             # Ejecutar linter
```

## 🌐 Configurar Netlify (Deployment)

### Opción A: Deploy desde GitHub (Recomendado)

1. Sube tu código a GitHub
2. Ve a https://app.netlify.com
3. Click en "Add new site" > "Import an existing project"
4. Conecta tu repositorio de GitHub
5. Netlify detectará automáticamente la configuración
6. Agrega las variables de entorno en Settings > Environment variables
7. Deploy!

### Opción B: Deploy con Netlify CLI

```bash
# Instalar Netlify CLI globalmente
npm install -g netlify-cli

# Login en tu cuenta
netlify login

# Inicializar proyecto
netlify init

# Deploy
netlify deploy --prod
```

## 🗄️ Configurar Base de Datos Neon

### Opción 1: Integración automática con Netlify

```bash
netlify addons:create neon
```

Esto creará automáticamente:
- Una base de datos PostgreSQL en Neon
- Variable de entorno `DATABASE_URL` en Netlify

### Opción 2: Configuración manual

1. Ve a https://neon.tech
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto
4. Copia la connection string
5. Agrégala como `DATABASE_URL` en:
   - `.env` (desarrollo local)
   - Netlify Dashboard > Site settings > Environment variables (producción)

### Crear las tablas necesarias

Ejecuta estos scripts SQL en tu base de datos Neon:

```sql
-- Tabla de usuarios
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nombre VARCHAR(100),
  rol VARCHAR(20) DEFAULT 'operario',
  activo BOOLEAN DEFAULT true,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de animales
CREATE TABLE animales (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('engorde', 'reproduccion')),
  raza VARCHAR(100),
  fecha_nacimiento DATE,
  fecha_ingreso DATE DEFAULT CURRENT_DATE,
  peso_inicial DECIMAL(10,2),
  estado VARCHAR(20) DEFAULT 'activo',
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de vacunaciones
CREATE TABLE vacunaciones (
  id SERIAL PRIMARY KEY,
  animal_id INTEGER REFERENCES animales(id),
  tipo_vacuna VARCHAR(100),
  fecha_aplicacion DATE,
  dosis VARCHAR(50),
  proxima_fecha DATE,
  notas TEXT,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de enfermedades
CREATE TABLE enfermedades (
  id SERIAL PRIMARY KEY,
  animal_id INTEGER REFERENCES animales(id),
  enfermedad VARCHAR(100),
  fecha_inicio DATE,
  tratamiento TEXT,
  estado VARCHAR(20) DEFAULT 'en_tratamiento',
  fecha_recuperacion DATE,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de partos
CREATE TABLE partos (
  id SERIAL PRIMARY KEY,
  cerda_id INTEGER REFERENCES animales(id),
  fecha_parto DATE,
  lechones_nacidos INTEGER,
  lechones_vivos INTEGER,
  lechones_muertos INTEGER,
  peso_promedio DECIMAL(10,2),
  observaciones TEXT,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de grupos/corrales
CREATE TABLE grupos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50),
  tipo VARCHAR(20) CHECK (tipo IN ('engorde', 'reproduccion')),
  capacidad INTEGER,
  cantidad_actual INTEGER DEFAULT 0,
  fecha_creacion DATE DEFAULT CURRENT_DATE,
  fecha_salida_programada DATE,
  activo BOOLEAN DEFAULT true
);

-- Tabla de notificaciones
CREATE TABLE notificaciones (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(50),
  titulo VARCHAR(200),
  mensaje TEXT,
  prioridad VARCHAR(20) DEFAULT 'media',
  leida BOOLEAN DEFAULT false,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 📱 Estructura de Módulos

- **Dashboard** - Vista general de la granja
- **Animales** - Registro y gestión de animales
- **Reproducción** - Control de ciclos reproductivos
- **Salud** - Vacunaciones y tratamientos
- **Grupos** - Organización por corrales
- **Estadísticas** - Reportes y gráficos
- **Notificaciones** - Alertas del sistema

## 🐛 Solución de Problemas

### El servidor no inicia
```bash
# Limpia caché y reinstala
rm -rf node_modules package-lock.json
npm install
```

### Errores de Tailwind
```bash
# Regenera configuración
npx tailwindcss init -p
```

### Problemas con Netlify Functions
```bash
# Instala dependencias de funciones
cd netlify
npm install
cd ..
```

## 📚 Recursos Adicionales

- [Documentación de React](https://react.dev)
- [Documentación de Vite](https://vitejs.dev)
- [Documentación de Tailwind](https://tailwindcss.com)
- [Documentación de Netlify](https://docs.netlify.com)
- [Documentación de Neon](https://neon.tech/docs)

## 👥 Contacto y Soporte

Para preguntas sobre el proyecto:
- Keyner Cerdas Morales
- Angelo Piedra Castro
- Yader Siezar Chaves

---

¡Buena suerte con el desarrollo de BioPork! 🐷✨
