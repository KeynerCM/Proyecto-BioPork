const { neon } = require('@neondatabase/serverless')

exports.handler = async (event, context) => {
  // Solo permitir métodos DELETE
  if (event.httpMethod !== 'DELETE') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    const { id } = event.queryStringParameters || {}
    
    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Se requiere el ID del usuario',
        }),
      }
    }

    // Conectar a Neon
    const sql = neon(process.env.NETLIFY_DATABASE_URL)

    // Desactivar usuario en lugar de eliminarlo (soft delete)
    const result = await sql`
      UPDATE usuarios 
      SET activo = false
      WHERE id = ${id}
      RETURNING id, username, nombre
    `

    if (result.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          success: false,
          error: 'Usuario no encontrado',
        }),
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        data: result[0],
        message: 'Usuario desactivado exitosamente',
      }),
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Error al desactivar usuario',
        message: error.message,
      }),
    }
  }
}
