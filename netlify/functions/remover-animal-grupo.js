const { neon } = require('@neondatabase/serverless')

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'PUT') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method not allowed' }),
    }
  }

  try {
    const data = JSON.parse(event.body)
    const { animal_id, grupo_id, fecha_salida } = data

    if (!animal_id || !grupo_id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Faltan campos requeridos: animal_id, grupo_id',
        }),
      }
    }

    const sql = neon(process.env.NETLIFY_DATABASE_URL)

    // Verificar que existe una asignación activa
    const asignacion = await sql`
      SELECT id FROM animales_grupos
      WHERE animal_id = ${animal_id}
      AND grupo_id = ${grupo_id}
      AND fecha_salida IS NULL
    `

    if (asignacion.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'No se encontró una asignación activa del animal en este grupo',
        }),
      }
    }

    // Actualizar fecha_salida de la asignación
    const result = await sql`
      UPDATE animales_grupos
      SET fecha_salida = ${fecha_salida || new Date().toISOString()}
      WHERE id = ${asignacion[0].id}
      RETURNING *
    `

    // Obtener datos del grupo para actualizar estado
    const grupo = await sql`
      SELECT cantidad_actual, capacidad, estado FROM grupos
      WHERE id = ${grupo_id}
    `

    if (grupo.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Grupo no encontrado',
        }),
      }
    }

    // Calcular nueva cantidad y estado
    const nuevaCantidad = Math.max((grupo[0].cantidad_actual || 0) - 1, 0)
    const capacidad = grupo[0].capacidad
    
    // Determinar nuevo estado según la lógica del diagrama UML
    let nuevoEstado = grupo[0].estado
    
    // Si estaba completo y ahora tiene espacio, pasa a incompleto
    if (grupo[0].estado === 'completo' && nuevaCantidad < capacidad) {
      nuevoEstado = 'incompleto'
    }
    
    // Si se quedó sin animales, vuelve a en_creacion
    if (nuevaCantidad === 0 && grupo[0].estado !== 'cerrado') {
      nuevoEstado = 'en_creacion'
    }

    // Actualizar cantidad_actual y estado del grupo
    const grupoActualizado = await sql`
      UPDATE grupos
      SET 
        cantidad_actual = ${nuevaCantidad},
        estado = ${nuevoEstado}
      WHERE id = ${grupo_id}
      RETURNING *
    `

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: result[0],
        grupo: grupoActualizado[0],
        message: 'Animal removido del grupo exitosamente',
      }),
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error al remover animal del grupo',
        message: error.message,
      }),
    }
  }
}
