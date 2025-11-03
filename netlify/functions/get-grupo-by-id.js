const { neon } = require('@neondatabase/serverless')

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method not allowed' }),
    }
  }

  try {
    const { id } = event.queryStringParameters || {}

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

    const result = await sql`
      SELECT
        g.*,
        COUNT(ag.id) FILTER (WHERE ag.fecha_salida IS NULL) as cantidad_animales_actuales
      FROM grupos g
      LEFT JOIN animales_grupos ag ON g.id = ag.grupo_id
      WHERE g.id = ${id}
      GROUP BY g.id
    `

    if (result.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Grupo no encontrado',
        }),
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: result[0],
      }),
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error al obtener grupo',
        message: error.message,
      }),
    }
  }
}
