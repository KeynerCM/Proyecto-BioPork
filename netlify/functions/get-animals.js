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

    const result = await sql`
      SELECT 
        id,
        codigo,
        tipo,
        raza,
        fecha_nacimiento,
        peso_inicial,
        peso_actual,
        sexo,
        estado,
        grupo_id
      FROM animales
      ORDER BY fecha_nacimiento DESC
    `

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, data: result }),
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error al obtener animales',
        message: error.message,
      }),
    }
  }
}
