# BioPork 🐷

Sistema de gestión integral para granjas porcinas desarrollado con tecnologías modernas y arquitectura serverless.

## 📋 Descripción

BioPork es una aplicación web que permite digitalizar y automatizar los procesos de gestión en granjas porcinas, incluyendo:

- Registro y seguimiento de animales
- Control sanitario y veterinario
- Gestión reproductiva
- Organización por grupos y corrales
- Notificaciones inteligentes
- Estadísticas y reportes

## 🚀 Tecnologías

### Frontend
- **React 18** - Framework de UI
- **Vite** - Build tool y dev server
- **TailwindCSS** - Framework de estilos
- **React Router DOM** - Enrutamiento
- **Framer Motion** - Animaciones
- **Lucide React** - Iconos
- **Recharts / Chart.js** - Gráficos
- **Axios** - Cliente HTTP
- **html2pdf.js** - Exportación de reportes

### Backend
- **Netlify Functions** - Funciones serverless
- **Node.js** - Runtime de JavaScript
- **pg (node-postgres)** - Cliente PostgreSQL

### Base de Datos
- **Neon PostgreSQL** - Base de datos serverless

### Deployment
- **Netlify** - Hosting y CI/CD
- **GitHub** - Control de versiones

## 📦 Instalación

### Prerrequisitos
- Node.js 18+ instalado
- npm o yarn
- Cuenta en Netlify (para deployment)
- Base de datos Neon configurada

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/biopork.git
cd biopork
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:
```env
DATABASE_URL=postgresql://user:password@host/database
VITE_API_URL=/.netlify/functions
```

4. **Ejecutar en desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🛠️ Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Vista previa de la build de producción
- `npm run lint` - Ejecuta el linter

## 📁 Estructura del Proyecto

```
biopork/
├── netlify/
│   └── functions/          # Funciones serverless
│       ├── get-animals.js
│       └── create-animal.js
├── public/                 # Archivos estáticos
├── src/
│   ├── components/         # Componentes reutilizables
│   │   ├── Layout.jsx
│   │   ├── Card.jsx
│   │   └── Button.jsx
│   ├── pages/              # Páginas principales
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Animals.jsx
│   │   ├── Reproduction.jsx
│   │   ├── Health.jsx
│   │   ├── Groups.jsx
│   │   ├── Statistics.jsx
│   │   └── Notifications.jsx
│   ├── services/           # Servicios y API
│   │   ├── api.js
│   │   └── animalService.js
│   ├── utils/              # Utilidades
│   ├── App.jsx             # Componente principal
│   ├── main.jsx            # Punto de entrada
│   └── index.css           # Estilos globales
├── .env.example            # Variables de entorno de ejemplo
├── netlify.toml            # Configuración de Netlify
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## 🌐 Deployment en Netlify

### Opción 1: Deploy automático desde GitHub

1. Conecta tu repositorio con Netlify
2. Netlify detectará automáticamente la configuración de `netlify.toml`
3. Configura las variables de entorno en Netlify Dashboard
4. Cada push a la rama principal desplegará automáticamente

### Opción 2: Deploy manual con Netlify CLI

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login en Netlify
netlify login

# Inicializar proyecto
netlify init

# Deploy
netlify deploy --prod
```

### Configurar Neon Database

**Opción 1: Usando Netlify DB (Recomendado)**

```bash
# La base de datos se crea automáticamente al hacer deploy en Netlify
# Solo necesitas:
# 1. Conectar tu cuenta de Neon desde Netlify Dashboard
# 2. Ejecutar database-schema.sql en el SQL Editor de Neon
```

**Opción 2: Manualmente**

```bash
# Crear cuenta en neon.tech
# Copiar connection string a variables de entorno en Netlify
```

Ver guía completa en: `CONFIGURACION-POST-DEPLOY.md`

## 🗄️ Esquema de Base de Datos

```sql
-- Tabla de animales
CREATE TABLE animales (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  tipo VARCHAR(20) NOT NULL, -- 'engorde' o 'reproduccion'
  raza VARCHAR(100),
  fecha_nacimiento DATE,
  peso_inicial DECIMAL(10,2),
  estado VARCHAR(20) DEFAULT 'activo',
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Más tablas según los requerimientos...
```

## 👥 Equipo de Desarrollo

- **Keyner Cerdas Morales** - Líder de proyecto
- **Angelo Piedra Castro** - Desarrollador principal
- **Yader Siezar Chaves** - Diseñador UI/UX y Testing

**Profesor:** Jose Angel Campos Aguilar

**Institución:** Semestre II, 2025

## 📄 Licencia

Este proyecto es de uso académico para el curso de Requerimientos de Software.

## 🤝 Contribución

Este es un proyecto académico, pero las sugerencias son bienvenidas:

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Contacto

Para más información sobre el proyecto BioPork, contacta al equipo de desarrollo.

---

**BioPork** - Modernizando la gestión porcina 🐷✨
