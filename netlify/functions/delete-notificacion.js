const { neon } = require('@neondatabase/serverless')

exports.handler = async (event) => {
  if (event.httpMethod !== 'DELETE') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método no permitido' })
    }
  }

  try {
    const { id } = JSON.parse(event.body)
    
    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'ID de notificación requerido'
        })
      }
    }

    const sql = neon(process.env.DATABASE_URL)
    
    const result = await sql`
      DELETE FROM notificaciones
      WHERE id = ${id}
      RETURNING id
    `

    if (result.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          success: false,
          error: 'Notificación no encontrada'
        })
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Notificación eliminada correctamente'
      })
    }
  } catch (error) {
    console.error('Error al eliminar notificación:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Error al eliminar notificación',
        details: error.message
      })
    }
  }
}
