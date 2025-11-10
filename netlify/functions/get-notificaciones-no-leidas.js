const { neon } = require('@neondatabase/serverless')

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método no permitido' })
    }
  }

  try {
    const sql = neon(process.env.NETLIFY_DATABASE_URL)
    
    const notificaciones = await sql`
      SELECT 
        id,
        titulo,
        mensaje,
        tipo,
        prioridad,
        leida,
        fecha_creacion,
        animal_id
      FROM notificaciones
      WHERE leida = false
      ORDER BY 
        CASE prioridad
          WHEN 'urgente' THEN 1
          WHEN 'alta' THEN 2
          WHEN 'media' THEN 3
          WHEN 'baja' THEN 4
        END,
        fecha_creacion DESC
    `

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        data: notificaciones
      })
    }
  } catch (error) {
    console.error('Error al obtener notificaciones no leídas:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Error al obtener notificaciones no leídas',
        details: error.message
      })
    }
  }
}
