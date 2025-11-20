# BioPork 🐷

Sistema de gestión integral para granjas porcinas desarrollado con tecnologías modernas y arquitectura serverless.

## Descripción

BioPork es una aplicación web que permite digitalizar y automatizar los procesos de gestión en granjas porcinas, incluyendo:

- Registro y seguimiento de animales
- Control sanitario y veterinario
- Gestión reproductiva
- Organización por grupos y corrales
- Notificaciones inteligentes
- Estadísticas y reportes

## Tecnologías

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

## Instalación

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

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Vista previa de la build de producción
- `npm run lint` - Ejecuta el linter


## Link de deploy:
```bash
https://proyectobiopork.netlify.app/
```
##  Equipo de Desarrollo

- **Keyner Cerdas Morales** - Líder de proyecto
- **Angelo Piedra Castro** - Desarrollador principal
- **Yader Siezar Chaves** - Diseñador UI/UX y Testing

**Profesor:** Jose Angel Campos Aguilar

**Institución:** Semestre II, 2025
