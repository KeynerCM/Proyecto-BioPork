const { neon } = require('@neondatabase/serverless')

exports.handler = async (event) => {
  if (event.httpMethod !== 'PUT') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método no permitido' })
    }
  }

  try {
    const sql = neon(process.env.NETLIFY_DATABASE_URL)
    
    const result = await sql`
      UPDATE notificaciones
      SET leida = true
      WHERE leida = false
      RETURNING COUNT(*) as count
    `

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Todas las notificaciones marcadas como leídas',
        data: {
          updated: result.length
        }
      })
    }
  } catch (error) {
    console.error('Error al marcar todas como leídas:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Error al actualizar notificaciones',
        details: error.message
      })
    }
  }
}
