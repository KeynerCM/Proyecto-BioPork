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

    // Validar que el grupo esté en estado 'programado_salida'
    if (grupoActual.estado !== 'programado_salida') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'El grupo debe estar en estado "programado_salida" para iniciar el proceso',
        }),
      }
    }

    // Actualizar el estado a 'en_proceso_salida'
    const resultado = await sql`
      UPDATE grupos
      SET estado = 'en_proceso_salida'
      WHERE id = ${id}
      RETURNING *
    `

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: resultado[0],
        message: 'Proceso de salida iniciado',
      }),
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error al iniciar proceso de salida',
        message: error.message,
      }),
    }
  }
}
