const { neon } = require('@neondatabase/serverless')

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method not allowed' }),
    }
  }

  try {
    const { id } = JSON.parse(event.body)

    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Se requiere el ID del grupo',
        }),
      }
    }

    const sql = neon(process.env.NETLIFY_DATABASE_URL)

    // Obtener el grupo actual
    const grupo = await sql`
      SELECT * FROM grupos WHERE id = ${id}
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

    const grupoActual = grupo[0]

    // Validar que el grupo esté en estado 'en_creacion'
    if (grupoActual.estado !== 'en_creacion') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'El grupo ya fue confirmado',
        }),
      }
    }

    // Determinar el nuevo estado basado en la cantidad de animales
    const cantidad = parseInt(grupoActual.cantidad_actual) || 0
    const capacidad = parseInt(grupoActual.capacidad) || 0
    
    let nuevoEstado = 'incompleto'
    let notificacion = null

    if (cantidad >= capacidad) {
      nuevoEstado = 'completo'
      notificacion = 'Capacidad completa'
    }

    // Actualizar el estado del grupo
    const resultado = await sql`
      UPDATE grupos
      SET estado = ${nuevoEstado}
      WHERE id = ${id}
      RETURNING *
    `

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: resultado[0],
        message: `Grupo confirmado como ${nuevoEstado}`,
        notificacion,
      }),
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error al confirmar grupo',
        message: error.message,
      }),
    }
  }
}
