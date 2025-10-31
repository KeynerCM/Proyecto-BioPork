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
    // Conectar a Neon
    const sql = neon(process.env.NETLIFY_DATABASE_URL)
    
    const result = await sql`
      SELECT 
        id,
        username,
        nombre,
        email,
        rol,
        activo,
        fecha_registro,
        ultimo_acceso
      FROM usuarios
      ORDER BY fecha_registro DESC
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
        error: 'Error al obtener usuarios',
        message: error.message,
      }),
    }
  }
}
