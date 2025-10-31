# 📋 Plan de Trabajo - BioPork

## Estado Actual del Proyecto ✅

Se ha creado la estructura completa del proyecto con:
- ✅ Configuración de React + Vite + TailwindCSS
- ✅ Estructura de carpetas organizada
- ✅ Sistema de routing implementado
- ✅ Componentes base creados (Layout, Card, Button)
- ✅ Páginas principales esqueletizadas
- ✅ Configuración de Netlify Functions
- ✅ Esquema de base de datos PostgreSQL completo
- ✅ Servicios de API configurados
- ✅ Documentación técnica completa

## 🎯 Próximos Pasos

### Fase 1: Configuración Inicial (Semana 1)

#### 1.1 Configurar Entorno Local
- [ ] Cada desarrollador clona el repositorio
- [ ] Ejecutar `npm install` para instalar dependencias
- [ ] Configurar archivo `.env` con variables locales
- [ ] Verificar que el servidor de desarrollo funciona (`npm run dev`)

#### 1.2 Configurar Servicios en la Nube
- [ ] Crear repositorio en GitHub
- [ ] Configurar cuenta en Netlify
- [ ] Crear proyecto en Neon (PostgreSQL)
- [ ] Ejecutar script `database-schema.sql` en Neon
- [ ] Configurar variables de entorno en Netlify

#### 1.3 Deploy Inicial
- [ ] Conectar repositorio GitHub con Netlify
- [ ] Verificar que el deploy automático funciona
- [ ] Probar la aplicación en producción

### Fase 2: Desarrollo del Backend (Semana 2-3)

#### 2.1 Implementar Netlify Functions
**Responsable sugerido: Angelo**

Funciones prioritarias a crear en `netlify/functions/`:

1. **Autenticación**
   - [ ] `login.js` - Inicio de sesión
   - [ ] `register.js` - Registro de usuarios
   - [ ] `verify-token.js` - Verificación de sesión

2. **Gestión de Animales**
   - [ ] `get-animals.js` - Listar animales (✅ ya creada)
   - [ ] `create-animal.js` - Crear animal (✅ ya creada)
   - [ ] `update-animal.js` - Actualizar animal
   - [ ] `delete-animal.js` - Eliminar/desactivar animal
   - [ ] `search-animals.js` - Buscar animales con filtros

3. **Control Sanitario**
   - [ ] `add-vaccination.js` - Registrar vacunación
   - [ ] `get-vaccinations.js` - Obtener vacunaciones
   - [ ] `add-treatment.js` - Registrar tratamiento
   - [ ] `get-treatments.js` - Obtener tratamientos

4. **Gestión Reproductiva**
   - [ ] `create-cycle.js` - Registrar ciclo reproductivo
   - [ ] `register-birth.js` - Registrar parto
   - [ ] `get-births.js` - Obtener historial de partos
   - [ ] `get-pregnant-sows.js` - Obtener cerdas gestantes

5. **Grupos y Corrales**
   - [ ] `create-group.js` - Crear grupo
   - [ ] `assign-animals.js` - Asignar animales a grupo
   - [ ] `get-groups.js` - Listar grupos

6. **Notificaciones**
   - [ ] `get-notifications.js` - Obtener notificaciones
   - [ ] `mark-as-read.js` - Marcar como leída
   - [ ] `generate-alerts.js` - Generar alertas automáticas

7. **Estadísticas**
   - [ ] `get-dashboard-stats.js` - Estadísticas del dashboard
   - [ ] `get-production-stats.js` - Estadísticas de producción
   - [ ] `generate-report.js` - Generar reporte

### Fase 3: Desarrollo del Frontend (Semana 3-5)

#### 3.1 Módulo de Animales
**Responsable sugerido: Angelo + Yader**

- [ ] Formulario de registro de animales
- [ ] Tabla/grid de listado de animales
- [ ] Vista de detalle de animal individual
- [ ] Búsqueda y filtros
- [ ] Edición de información
- [ ] Sistema de eliminación (soft delete)

#### 3.2 Módulo de Reproducción
**Responsable sugerido: Keyner**

- [ ] Listado de cerdas reproductoras
- [ ] Registro de ciclos reproductivos
- [ ] Calendario de partos
- [ ] Formulario de registro de partos
- [ ] Historial reproductivo por cerda
- [ ] Estadísticas reproductivas

#### 3.3 Módulo de Salud
**Responsable sugerido: Angelo**

- [ ] Registro de vacunaciones
- [ ] Calendario de vacunaciones
- [ ] Registro de enfermedades y tratamientos
- [ ] Historial sanitario por animal
- [ ] Alertas de vacunaciones pendientes

#### 3.4 Módulo de Grupos
**Responsable sugerido: Keyner**

- [ ] Creación de grupos/corrales
- [ ] Asignación de animales a grupos
- [ ] Vista de ocupación de corrales
- [ ] Gestión de traslados
- [ ] Programación de salidas

#### 3.5 Módulo de Estadísticas
**Responsable sugerido: Yader**

- [ ] Implementar gráficos con Recharts
- [ ] Dashboard con métricas clave
- [ ] Reportes de productividad
- [ ] Exportación de reportes a PDF
- [ ] Filtros por fecha y tipo

#### 3.6 Módulo de Notificaciones
**Responsable sugerido: Yader**

- [ ] Panel de notificaciones
- [ ] Sistema de alertas
- [ ] Marcar como leídas
- [ ] Filtros por tipo y prioridad

### Fase 4: Refinamiento y Testing (Semana 6)

#### 4.1 UI/UX
**Responsable: Yader**

- [ ] Revisar y mejorar diseño de todas las páginas
- [ ] Asegurar responsive design
- [ ] Agregar animaciones con Framer Motion
- [ ] Mejorar feedback visual (loading, success, errors)
- [ ] Optimizar navegación

#### 4.2 Testing
**Responsable: Todo el equipo**

- [ ] Pruebas de funcionalidad en cada módulo
- [ ] Pruebas de integración frontend-backend
- [ ] Pruebas en diferentes dispositivos
- [ ] Pruebas en diferentes navegadores
- [ ] Corrección de bugs encontrados

#### 4.3 Documentación
**Responsable: Keyner**

- [ ] Completar comentarios en código
- [ ] Documentar funciones de API
- [ ] Manual de usuario
- [ ] Video tutorial (opcional)

### Fase 5: Deployment Final (Semana 7)

- [ ] Revisión final de código
- [ ] Optimización de performance
- [ ] Deploy a producción
- [ ] Configuración de dominio (opcional)
- [ ] Backup de base de datos
- [ ] Presentación del proyecto

## 📝 Distribución de Tareas Sugerida

### Keyner (Líder de Proyecto)
- Coordinación general
- Módulo de Reproducción
- Módulo de Grupos
- Documentación final
- Presentación

### Angelo (Desarrollador Principal)
- Configuración inicial del backend
- Netlify Functions
- Módulo de Animales
- Módulo de Salud
- Integración frontend-backend

### Yader (Diseño y Testing)
- Diseño UI/UX
- Módulo de Estadísticas
- Módulo de Notificaciones
- Testing general
- Responsive design

## 🛠️ Herramientas de Colaboración

### Git Flow Sugerido
```bash
main          # Producción (siempre estable)
├── develop   # Desarrollo (integración)
    ├── feature/animales
    ├── feature/reproduccion
    ├── feature/salud
    └── feature/estadisticas
```

### Comandos Git Básicos
```bash
# Crear rama de feature
git checkout -b feature/nombre-modulo

# Trabajar y hacer commits
git add .
git commit -m "descripción del cambio"

# Actualizar con cambios de develop
git checkout develop
git pull origin develop
git checkout feature/nombre-modulo
git merge develop

# Subir cambios
git push origin feature/nombre-modulo

# Crear Pull Request en GitHub
# Después de revisión, merge a develop
```

## 📅 Calendario Sugerido

| Semana | Actividades | Entregables |
|--------|-------------|-------------|
| 1 | Setup y configuración | Entorno funcionando |
| 2-3 | Backend y APIs | Funciones implementadas |
| 3-5 | Frontend módulos | Interfaces completadas |
| 6 | Testing y refinamiento | App testeada |
| 7 | Deploy y presentación | Proyecto final |

## 🎯 Criterios de Éxito

- [ ] Todos los requerimientos funcionales implementados
- [ ] Sistema funcionando en producción (Netlify)
- [ ] Base de datos persistente (Neon)
- [ ] Interfaz responsive y moderna
- [ ] Código limpio y documentado
- [ ] Sistema de notificaciones funcionando
- [ ] Exportación de reportes PDF
- [ ] Manual de usuario completo

## 📞 Comunicación

**Reuniones Semanales:**
- Día: [Por definir]
- Hora: [Por definir]
- Plataforma: [Por definir]

**Canales de Comunicación:**
- WhatsApp/Telegram: Comunicación rápida
- GitHub Issues: Tracking de bugs y features
- GitHub Projects: Tablero Kanban

## 🚨 Problemas Comunes y Soluciones

### Problema: Error de ejecución de scripts en PowerShell
**Solución:**
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### Problema: Conflictos en Git
**Solución:**
```bash
git stash
git pull
git stash pop
# Resolver conflictos manualmente
```

### Problema: Errores de dependencias
**Solución:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📚 Recursos Útiles

- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Recharts Examples](https://recharts.org/en-US/examples)

---

**¡Éxito con el desarrollo de BioPork!** 🐷✨

*Última actualización: Octubre 2025*
