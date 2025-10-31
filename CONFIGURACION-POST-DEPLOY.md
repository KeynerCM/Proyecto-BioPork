# 🚀 Guía de Configuración Post-Deploy

## ✅ Estado Actual
- ✅ Código desplegado en Netlify
- ✅ Base de datos Neon temporal creada (expira en 7 días)
- ⚠️ Base de datos sin tablas (vacía)

## 📋 Pasos Necesarios

### 1️⃣ Conectar y Reclamar tu Base de Datos Neon

**⚠️ IMPORTANTE: Hazlo antes de 7 días o perderás la base de datos**

#### Opción A: Desde Netlify Dashboard (Recomendado)

1. Ve a tu sitio en Netlify Dashboard
2. Ve a la sección **"Integrations"** o **"Database"**
3. Busca tu base de datos: `billowing-rice-95345438`
4. Click en **"Connect Neon"**
5. Sigue los pasos para conectar tu cuenta de Neon

#### Opción B: Crear cuenta en Neon directamente

1. Ve a https://neon.tech
2. Crea una cuenta (puedes usar GitHub)
3. Una vez dentro, Netlify te permitirá "reclamar" la base de datos

---

### 2️⃣ Acceder a tu Base de Datos Neon

Una vez conectado:

1. Ve a https://console.neon.tech
2. Selecciona tu proyecto (debería ser `billowing-rice-95345438` o similar)
3. Click en **"SQL Editor"** en el menú lateral

---

### 3️⃣ Crear las Tablas de la Base de Datos

Tienes el archivo `database-schema.sql` con todo el esquema. Aquí hay dos formas:

#### Opción A: SQL Editor de Neon (Fácil)

1. Abre el archivo `database-schema.sql` en VS Code
2. Copia TODO el contenido (Ctrl+A, Ctrl+C)
3. Ve al SQL Editor en Neon Console
4. Pega el contenido (Ctrl+V)
5. Click en **"Run"** o presiona **F5**

⚠️ **Nota:** El schema es grande, si hay timeout, ejecuta por secciones:
- Primero las tablas (hasta línea ~200)
- Luego los índices (hasta línea ~250)
- Luego los triggers (hasta línea ~300)
- Finalmente las vistas y datos iniciales

#### Opción B: Conexión desde VS Code (Avanzado)

Si tienes extensión de PostgreSQL en VS Code:

1. Copia el valor de `NETLIFY_DATABASE_URL` desde Netlify
2. Usa una extensión como "PostgreSQL" de Chris Kolkman
3. Conecta usando el connection string
4. Ejecuta el script completo

---

### 4️⃣ Verificar que las Tablas se Crearon

En el SQL Editor de Neon, ejecuta:

```sql
-- Ver todas las tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Deberías ver 13 tablas:
- alimentacion
- animales
- animales_grupos
- ciclos_reproductivos
- enfermedades
- grupos
- historial_cambios
- notificaciones
- partos
- pesajes
- salidas_animales
- usuarios
- vacunaciones

---

### 5️⃣ Insertar Datos de Prueba (Opcional)

Para probar la aplicación, puedes insertar algunos datos:

```sql
-- Insertar usuario de prueba
INSERT INTO usuarios (username, password, nombre, rol)
VALUES ('admin', 'admin123', 'Administrador BioPork', 'admin');

-- Insertar animales de prueba
INSERT INTO animales (codigo, tipo, raza, fecha_nacimiento, peso_inicial, sexo)
VALUES 
  ('A-001', 'engorde', 'Duroc', '2024-06-15', 25.5, 'macho'),
  ('A-002', 'engorde', 'Yorkshire', '2024-06-18', 24.8, 'hembra'),
  ('R-001', 'reproduccion', 'Landrace', '2022-03-10', 80.0, 'hembra'),
  ('R-002', 'reproduccion', 'Duroc', '2022-05-22', 85.5, 'hembra');

-- Insertar un grupo
INSERT INTO grupos (codigo, nombre, tipo, corral_numero, capacidad)
VALUES ('G-001', 'Grupo Engorde 1', 'engorde', 'C-05', 10);

-- Insertar notificación de ejemplo
INSERT INTO notificaciones (tipo, titulo, mensaje, prioridad)
VALUES 
  ('general', 'Bienvenido a BioPork', 'Sistema de gestión iniciado correctamente', 'baja'),
  ('vacunacion', 'Vacunación Pendiente', 'Revisar calendario de vacunaciones', 'alta');
```

---

### 6️⃣ Actualizar y Hacer Push de los Cambios

Ahora que actualizamos las funciones para usar `@netlify/neon`:

```bash
# Ver los cambios
git status

# Agregar los archivos modificados
git add netlify/functions/get-animals.js
git add netlify/functions/create-animal.js
git add netlify/package.json

# Hacer commit
git commit -m "Update functions to use @netlify/neon package"

# Push a GitHub (esto hará auto-deploy en Netlify)
git push origin main
```

---

### 7️⃣ Verificar el Deployment

1. Ve a Netlify Dashboard
2. Verifica que el nuevo deploy se completó exitosamente
3. Abre tu sitio (tu-sitio.netlify.app)
4. Intenta hacer login

---

## 🔍 Verificar Variables de Entorno en Netlify

Asegúrate de que estas variables existen en Netlify:

1. Ve a tu sitio en Netlify
2. **Site settings** > **Environment variables**
3. Deberías ver:
   - `NETLIFY_DATABASE_URL` (conexión pooled)
   - `NETLIFY_DATABASE_URL_UNPOOLED` (conexión directa)

Estas se crearon automáticamente cuando se creó la base de datos.

---

## 🧪 Probar la Conexión

Una vez que hayas:
1. ✅ Conectado tu cuenta de Neon
2. ✅ Ejecutado el schema SQL
3. ✅ Hecho push de los cambios actualizados

Prueba acceder a:
```
https://tu-sitio.netlify.app/.netlify/functions/get-animals
```

Deberías ver una respuesta JSON (probablemente vacía si no hay animales):
```json
{
  "success": true,
  "data": []
}
```

---

## 📊 Estado de las Variables de Entorno

Tu Neon database tiene:

- **Nombre:** billowing-rice-95345438
- **Región:** US East (Ohio)
- **Expires:** 7/11/2025 (¡Conecta antes!)
- **Storage:** 100 MB
- **Compute:** 40 horas/mes

---

## ❓ Problemas Comunes

### ❌ Error: "relation does not exist"
**Causa:** Las tablas no se han creado
**Solución:** Ejecuta `database-schema.sql` en SQL Editor de Neon

### ❌ Error: "permission denied"
**Causa:** Problemas con los permisos de la BD
**Solución:** Asegúrate de estar usando NETLIFY_DATABASE_URL

### ❌ Error: "connection timeout"
**Causa:** URL de conexión incorrecta o BD no accesible
**Solución:** Verifica las variables de entorno en Netlify

### ❌ Base de datos expiró después de 7 días
**Solución:** Debes conectar tu cuenta de Neon ANTES de que expire

---

## 📚 Recursos

- **Neon Console:** https://console.neon.tech
- **Netlify Dashboard:** https://app.netlify.com
- **Documentación Netlify DB:** https://docs.netlify.com/data/neon/
- **Tu sitio:** Busca la URL en tu dashboard de Netlify

---

## ✅ Checklist Final

- [ ] Conectar cuenta de Neon con Netlify
- [ ] Ejecutar `database-schema.sql` completo en Neon
- [ ] Verificar que las 13 tablas existen
- [ ] (Opcional) Insertar datos de prueba
- [ ] Hacer commit y push de los cambios actualizados
- [ ] Verificar que el deploy fue exitoso
- [ ] Probar el login en la aplicación
- [ ] Probar endpoint de API: `/.netlify/functions/get-animals`

---

## 🎉 ¡Una vez completado todo esto, tu aplicación estará 100% funcional!

La base de datos estará conectada, las funciones funcionando, y podrás comenzar a usar BioPork completamente.

**Siguiente paso:** Desarrollar los módulos restantes según el PLAN-DE-TRABAJO.md

---

*Última actualización: 30 de octubre de 2025*
