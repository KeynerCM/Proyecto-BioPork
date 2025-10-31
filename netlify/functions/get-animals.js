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
    // Conectar a Neon usando la variable de entorno
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
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        data: result,
      }),
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Error al obtener animales',
        message: error.message,
      }),
    }
  }
}
