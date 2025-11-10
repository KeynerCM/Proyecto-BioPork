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
      SELECT estado, COUNT(*) as cantidad
      FROM animales
      GROUP BY estado
      ORDER BY cantidad DESC
    `

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        data: result
      })
    }
  } catch (error) {
    console.error('Error al obtener animales por estado:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Error al obtener estadísticas',
        details: error.message
      })
    }
  }
}
