# Instrucciones para Actualizar Grupos Existentes

## ⚠️ Importante - Ejecutar Solo Una Vez

Si tienes grupos creados **antes** de implementar la máquina de estados, necesitas ejecutar este script SQL para establecer el estado correcto.

## 📝 Pasos para Ejecutar

### Opción 1: Desde Neon Console (Recomendado)

1. Abre tu proyecto en [Neon Console](https://console.neon.tech/)
2. Ve a la sección **SQL Editor**
3. Copia y pega el contenido del archivo `update-grupos-estado-existentes.sql`
4. Ejecuta el script
5. Verifica los resultados en la tabla de verificación

### Opción 2: Desde pgAdmin o cualquier cliente PostgreSQL

1. Conéctate a tu base de datos Neon
2. Abre el archivo `update-grupos-estado-existentes.sql`
3. Ejecuta todo el contenido
4. Revisa los resultados

## ✅ Verificación

Después de ejecutar el script, verás una tabla con todos los grupos y sus estados actualizados:

- `en_creacion`: Grupos activos sin animales
- `incompleto`: Grupos activos con animales pero no llenos
- `completo`: Grupos activos con capacidad completa
- `cerrado`: Grupos inactivos

## 🔄 Después de Ejecutar

Una vez ejecutado el script:

1. Los grupos existentes tendrán el estado correcto
2. Podrás usar el botón "Confirmar Grupo" normalmente
3. Podrás agregar animales a los grupos
4. Las transiciones de estado funcionarán correctamente

## ⚙️ Máquina de Estados

Los estados del grupo siguen este flujo:

```
en_creacion → (confirmar) → incompleto/completo
                               ↓
                          programado_salida
                               ↓
                          en_proceso_salida
                               ↓
                            cerrado
```

## 📌 Nota

Los **nuevos grupos** creados después de esta actualización ya tendrán el estado `'en_creacion'` automáticamente, por lo que no necesitarás ejecutar este script nuevamente.
