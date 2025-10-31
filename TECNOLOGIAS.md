# Documento Técnico: Tecnologías Seleccionadas para el Proyecto BioPork

## 1. Introducción

El presente documento tiene como objetivo detallar y justificar las tecnologías seleccionadas para el desarrollo del sistema BioPork, una aplicación web destinada a la gestión integral de granjas porcinas.

La elección de estas herramientas responde a la necesidad de contar con un sistema escalable, moderno, accesible y persistente, que facilite el control productivo, sanitario y reproductivo de los animales, así como la generación de reportes y notificaciones inteligentes.

## 2. Arquitectura General del Sistema

BioPork se desarrollará bajo una arquitectura web modular de tres capas:

- **Frontend (Interfaz de Usuario)** – Desarrollada en React.js, alojada en Netlify, con un diseño adaptable y moderno.

- **Backend Serverless** – Implementado mediante Netlify Functions y conectado a una base de datos PostgreSQL Serverless (Neon).

- **Base de Datos Persistente** – Administrada con Neon, que provee almacenamiento seguro y escalable para los datos del sistema.

Esta arquitectura permite un flujo de comunicación eficiente entre la interfaz del usuario, las funciones lógicas del servidor y la base de datos, garantizando persistencia real, mantenimiento sencillo y despliegue automático desde GitHub.

## 3. Tecnologías Principales

### 3.1 Frontend

**Tecnologías:**

- **React.js (con Vite)** → Framework moderno para construir interfaces dinámicas y modulares.
- **TailwindCSS** → Framework de estilos utilitario para crear diseños responsivos, limpios y coherentes.
- **React Router DOM** → Permite la navegación entre módulos (animales, partos, control sanitario, reportes, etc.).
- **Axios** → Cliente HTTP que gestiona las solicitudes hacia las funciones serverless o la base de datos.
- **Recharts / Chart.js** → Librerías para la generación de gráficos estadísticos y reportes visuales.
- **html2pdf.js** → Utilizada para exportar datos y reportes en formato PDF.

**Justificación:**

React, junto con Vite y TailwindCSS, ofrece un entorno de desarrollo rápido, altamente modular y de excelente rendimiento. Estas tecnologías permiten desarrollar una interfaz intuitiva, visualmente atractiva y accesible desde cualquier dispositivo (computadora, tablet o teléfono móvil).

### 3.2 Backend (Serverless)

**Tecnologías:**

- **Netlify Functions (Lambda Functions)** → Permiten crear funciones de backend ligeras sin necesidad de mantener un servidor.
- **Node.js / JavaScript (ES6)** → Lenguaje base utilizado para la creación de las funciones lógicas del sistema.
- **pg (node-postgres)** → Librería para conectar las funciones de Netlify con la base de datos PostgreSQL (Neon).

**Justificación:**

Se optó por un enfoque serverless, eliminando la necesidad de un servidor dedicado y reduciendo los costos operativos. Cada operación (registro, consulta, actualización o eliminación) se ejecuta mediante funciones independientes, que se comunican directamente con la base de datos Neon, garantizando una estructura ligera, escalable y fácil de mantener.

### 3.3 Base de Datos

**Tecnología:** Neon (PostgreSQL Serverless)

**Características y ventajas:**

- Base de datos PostgreSQL totalmente administrada y compatible con Netlify.
- Almacenamiento persistente y global (los datos se mantienen aunque se actualice o reinicie el sistema).
- Integración nativa con Netlify DB, lo que permite configurar la conexión con un solo comando (`netlify addons:create neon`).
- Escalabilidad automática y consumo bajo (ideal para proyectos académicos y productivos).
- Seguridad basada en credenciales cifradas y variables de entorno (DATABASE_URL).

**Justificación:**

Neon garantiza persistencia real de los datos sin requerir infraestructura adicional. Además, su modelo serverless es ideal para proyectos con cargas variables, asegurando disponibilidad y rendimiento constante.

## 4. Tecnologías Complementarias

| Tecnología | Función | Beneficio |
|------------|---------|-----------|
| GitHub | Control de versiones y repositorio principal del código | Colaboración segura entre los miembros del equipo |
| Netlify | Despliegue automático del frontend y manejo de funciones serverless | Integración CI/CD (actualización inmediata desde cada commit) |
| ESLint / Prettier | Linter y formateador de código | Asegura calidad y consistencia en la codificación |
| Lucide React / Heroicons | Librerías de íconos SVG | Interfaz más intuitiva y moderna |
| Framer Motion | Animaciones suaves en la interfaz | Mejora la experiencia de usuario |

## 5. Flujo de Trabajo del Proyecto

### Desarrollo local:
Cada integrante trabaja en su rama de GitHub, desarrollando componentes o funciones.

### Integración continua (CI/CD):
Netlify detecta los cambios al realizar un commit y reconstruye automáticamente la aplicación.

### Persistencia y pruebas:
Las funciones de Netlify se comunican con la base de datos Neon para leer/escribir información.

### Despliegue final:
El sistema queda accesible en una URL pública de Netlify (https://biopork.netlify.app) y conectado con la base de datos Neon para operación completa.

## 6. Estructura del Proyecto

```
biopork/
├── netlify/
│   └── functions/          # Funciones serverless (API Backend)
│       ├── get-animals.js
│       ├── create-animal.js
│       └── ...
├── src/
│   ├── components/         # Componentes React reutilizables
│   ├── pages/              # Páginas/vistas de la aplicación
│   ├── services/           # Servicios para comunicación con API
│   └── utils/              # Funciones utilitarias
├── public/                 # Archivos estáticos
├── package.json            # Dependencias y scripts
├── netlify.toml           # Configuración de despliegue
├── tailwind.config.js     # Configuración de Tailwind
└── vite.config.js         # Configuración de Vite
```

## 7. Guía de Implementación

### 7.1 Configuración Inicial

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con credenciales de Neon

# 3. Ejecutar en desarrollo
npm run dev
```

### 7.2 Deployment en Netlify

```bash
# Opción 1: Deploy automático desde GitHub
# - Conectar repositorio en Netlify Dashboard
# - Configurar variables de entorno
# - Push a main branch despliega automáticamente

# Opción 2: Deploy manual con CLI
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

### 7.3 Configuración de Base de Datos Neon

```bash
# Crear database addon en Netlify
netlify addons:create neon

# Esto configura automáticamente DATABASE_URL
```

## 8. Ventajas de la Arquitectura Seleccionada

### ✅ **Escalabilidad**
- Arquitectura serverless que escala automáticamente según demanda
- Base de datos Neon con escalado automático

### ✅ **Bajo Costo**
- Sin servidores dedicados que mantener
- Modelo de pago por uso (ideal para desarrollo y producción inicial)

### ✅ **Desarrollo Rápido**
- Vite proporciona hot module replacement (HMR) ultrarrápido
- TailwindCSS acelera el desarrollo de interfaces

### ✅ **Mantenibilidad**
- Código modular y bien estructurado
- Separación clara entre frontend, backend y datos

### ✅ **CI/CD Automático**
- Deploy automático con cada push a GitHub
- Preview deployments para pull requests

### ✅ **Seguridad**
- Variables de entorno para credenciales sensibles
- Conexiones SSL/TLS por defecto
- Autenticación y autorización a nivel de funciones

## 9. Conclusión

Las tecnologías seleccionadas para BioPork proporcionan una solución moderna, eficiente y sostenible para la digitalización de procesos en granjas porcinas.

Gracias a la combinación de **React** (frontend), **Netlify Functions** (backend) y **Neon** (base de datos), el proyecto contará con un entorno totalmente serverless, de alta disponibilidad y con persistencia garantizada, preparado tanto para su evaluación académica como para una futura implementación real en el sector productivo.

La arquitectura elegida permite:
- Desarrollo ágil y colaborativo
- Despliegue continuo y automatizado
- Escalabilidad según crecimiento
- Costos operativos mínimos
- Experiencia de usuario moderna y fluida

---

**Documento preparado por:**
- Keyner Cerdas Morales
- Angelo Piedra Castro
- Yader Siezar Chaves

**Curso:** Requerimientos de Software
**Profesor:** Jose Angel Campos Aguilar
**Fecha:** Octubre 2025
