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

    const enfermedades = await sql`
      SELECT 
        e.*,
        a.codigo AS animal_codigo,
        a.tipo AS animal_tipo,
        a.raza AS animal_raza
      FROM enfermedades e
      INNER JOIN animales a ON e.animal_id = a.id
      ORDER BY e.fecha_inicio DESC
    `

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, data: enfermedades }),
    }
  } catch (error) {
    console.error('Error fetching enfermedades:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error al obtener enfermedades',
        message: error.message,
      }),
    }
  }
}




