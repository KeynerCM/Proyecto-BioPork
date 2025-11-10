const { neon } = require('@neondatabase/serverless')

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método no permitido' })
    }
  }

  try {
    const sql = neon(process.env.DATABASE_URL)
    
    const result = await sql`
      SELECT COUNT(*) as count
      FROM notificaciones
      WHERE leida = false
    `

    const count = parseInt(result[0].count)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        data: {
          count: count
        }
      })
    }
  } catch (error) {
    console.error('Error al obtener contador:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Error al obtener contador',
        details: error.message
      })
    }
  }
}
