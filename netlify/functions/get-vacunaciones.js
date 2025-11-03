const { neon } = require('@neondatabase/serverless')

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const sql = neon(process.env.NETLIFY_DATABASE_URL)
    
    const vacunaciones = await sql`
      SELECT 
        v.*,
        a.codigo as animal_codigo,
        a.tipo as animal_tipo,
        a.raza as animal_raza
      FROM vacunaciones v
      INNER JOIN animales a ON v.animal_id = a.id
      ORDER BY v.fecha_aplicacion DESC
    `

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ success: true, data: vacunaciones })
    }
  } catch (error) {
    console.error('Error fetching vacunaciones:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false,
        error: 'Error al obtener vacunaciones',
        message: error.message 
      })
    }
  }
}

export const config = {
  path: '/api/get-vacunaciones'
}
