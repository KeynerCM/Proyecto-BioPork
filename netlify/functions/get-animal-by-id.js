const { neon } = require('@neondatabase/serverless')

exports.handler = async (event, context) => {
  // Solo permitir métodos GET
  if (event.httpMethod !== 'GET') {
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
          error: 'Se requiere el ID del animal',
        }),
      }
    }

    // Conectar a Neon
    const sql = neon(process.env.NETLIFY_DATABASE_URL)
    
    // Obtener animal con información completa
    const result = await sql`
      SELECT 
        a.*,
        g.nombre AS grupo_nombre,
        g.corral_numero,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, a.fecha_nacimiento)) AS edad_anos,
        EXTRACT(MONTH FROM AGE(CURRENT_DATE, a.fecha_nacimiento)) AS edad_meses,
        (SELECT COUNT(*) FROM vacunaciones WHERE animal_id = a.id) AS total_vacunaciones,
        (SELECT COUNT(*) FROM pesajes WHERE animal_id = a.id) AS total_pesajes
      FROM animales a
      LEFT JOIN grupos g ON a.grupo_id = g.id
      WHERE a.id = ${id}
    `

    if (result.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          success: false,
          error: 'Animal no encontrado',
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
      }),
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Error al obtener animal',
        message: error.message,
      }),
    }
  }
}
