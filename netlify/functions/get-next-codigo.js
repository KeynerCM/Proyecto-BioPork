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
    
    // Obtener el último código registrado
    const result = await sql`
      SELECT codigo 
      FROM animales 
      WHERE codigo ~ '^A[0-9]+$'
      ORDER BY 
        CAST(SUBSTRING(codigo FROM 2) AS INTEGER) DESC 
      LIMIT 1
    `

    let nextCodigo = 'A00001'

    if (result.length > 0) {
      // Extraer el número del último código (ej: A00005 -> 5)
      const lastCodigo = result[0].codigo
      const lastNumber = parseInt(lastCodigo.substring(1))
      
      // Incrementar y formatear con ceros a la izquierda
      const nextNumber = lastNumber + 1
      nextCodigo = 'A' + nextNumber.toString().padStart(5, '0')
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        codigo: nextCodigo,
      }),
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Error al generar código',
        message: error.message,
      }),
    }
  }
}
