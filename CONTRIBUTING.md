# Contributing to BioPork

¡Gracias por tu interés en contribuir a BioPork! 🐷

## 🚀 Cómo Contribuir

### 1. Fork y Clone

```bash
# Fork el repositorio en GitHub
# Luego clona tu fork
git clone https://github.com/TU_USUARIO/biopork.git
cd biopork
```

### 2. Crear una Rama

```bash
# Crea una rama para tu feature
git checkout -b feature/nombre-descriptivo
```

### 3. Hacer Cambios

- Escribe código limpio y bien documentado
- Sigue las convenciones de estilo del proyecto
- Agrega comentarios donde sea necesario

### 4. Commits

Usa mensajes de commit descriptivos:

```bash
git commit -m "feat: agregar registro de vacunaciones"
git commit -m "fix: corregir error en búsqueda de animales"
git commit -m "docs: actualizar README con instrucciones"
```

Tipos de commits:
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Documentación
- `style`: Formato de código
- `refactor`: Refactorización
- `test`: Pruebas
- `chore`: Mantenimiento

### 5. Push y Pull Request

```bash
# Push a tu fork
git push origin feature/nombre-descriptivo

# Crear Pull Request en GitHub
```

## 📋 Estándares de Código

### JavaScript/React

- Usar ES6+ features
- Componentes funcionales con hooks
- Props destructuring
- Nombres descriptivos de variables y funciones

```javascript
// ✅ Bueno
const AnimalCard = ({ animal, onSelect }) => {
  const { codigo, tipo, raza } = animal
  
  return (
    <div onClick={() => onSelect(animal)}>
      <h3>{codigo}</h3>
      <p>{tipo} - {raza}</p>
    </div>
  )
}

// ❌ Evitar
const Card = (props) => {
  return <div onClick={() => props.func(props.data)}>
    <h3>{props.data.codigo}</h3>
  </div>
}
```

### CSS/Tailwind

- Usar clases de Tailwind cuando sea posible
- Mantener consistencia en espaciado
- Mobile-first approach

### Netlify Functions

- Validar entrada de datos
- Manejar errores apropiadamente
- Cerrar conexiones de base de datos
- Usar códigos de estado HTTP correctos

```javascript
// ✅ Bueno
exports.handler = async (event) => {
  try {
    // Validación
    if (!data.codigo) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Código requerido' }) }
    }
    
    // Lógica
    const result = await db.query(...)
    
    return { statusCode: 200, body: JSON.stringify({ success: true, data: result }) }
  } catch (error) {
    console.error(error)
    return { statusCode: 500, body: JSON.stringify({ error: 'Error del servidor' }) }
  } finally {
    await client.end()
  }
}
```

## 🧪 Testing

Antes de hacer un PR:

1. Prueba tu código localmente
2. Verifica que no haya errores de console
3. Prueba en diferentes tamaños de pantalla
4. Verifica que no rompiste funcionalidad existente

## 📝 Pull Request Checklist

- [ ] Mi código sigue el estilo del proyecto
- [ ] He probado los cambios localmente
- [ ] He agregado comentarios donde es necesario
- [ ] La documentación está actualizada (si aplica)
- [ ] No hay errores de console
- [ ] El código es responsive
- [ ] He revisado mis cambios antes de enviar

## ❓ ¿Necesitas Ayuda?

- Revisa la documentación existente
- Abre un Issue en GitHub
- Contacta al equipo de desarrollo

## 📜 Código de Conducta

- Sé respetuoso con todos los contribuidores
- Acepta críticas constructivas
- Enfócate en el bien del proyecto
- Ayuda a otros cuando sea posible

¡Gracias por contribuir a BioPork! 🎉
