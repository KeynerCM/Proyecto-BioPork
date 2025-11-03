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

    // Obtener el último código registrado
    const result = await sql`
      SELECT codigo 
      FROM grupos 
      ORDER BY id DESC 
      LIMIT 1
    `

    let nextCodigo = 'G00001' // Código por defecto

    if (result.length > 0) {
      const lastCodigo = result[0].codigo
      const numero = parseInt(lastCodigo.substring(1)) + 1
      nextCodigo = `G${numero.toString().padStart(5, '0')}`
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, codigo: nextCodigo }),
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error al obtener siguiente código',
        message: error.message,
      }),
    }
  }
}
