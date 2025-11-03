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
    const sql = neon(process.env.NETLIFY_DATABASE_URL)

    const grupos = await sql`
      SELECT 
        g.*,
        COUNT(ag.animal_id) as animales_count
      FROM grupos g
      LEFT JOIN animales_grupos ag ON g.id = ag.grupo_id AND ag.fecha_salida IS NULL
      GROUP BY g.id
      ORDER BY g.fecha_creacion DESC
    `

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, data: grupos }),
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error al obtener grupos',
        message: error.message,
      }),
    }
  }
}
