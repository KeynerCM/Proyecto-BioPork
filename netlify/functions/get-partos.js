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

    const partos = await sql`
      SELECT 
        p.*,
        a.codigo AS cerda_codigo,
        a.raza AS cerda_raza,
        c.fecha_estimada_parto,
        c.verraco
      FROM partos p
      INNER JOIN animales a ON p.cerda_id = a.id
      LEFT JOIN ciclos_reproductivos c ON p.ciclo_id = c.id
      ORDER BY p.fecha_parto DESC
    `

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, data: partos }),
    }
  } catch (error) {
    console.error('Error fetching partos:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error al obtener partos',
        message: error.message,
      }),
    }
  }
}




