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

    const ciclos = await sql`
      SELECT 
        c.*,
        a.codigo AS cerda_codigo,
        a.raza AS cerda_raza,
        CASE 
          WHEN c.fecha_estimada_parto IS NOT NULL 
          THEN DATE_PART('day', c.fecha_estimada_parto::timestamp - CURRENT_DATE::timestamp)
          ELSE NULL
        END AS dias_para_parto
      FROM ciclos_reproductivos c
      INNER JOIN animales a ON c.cerda_id = a.id
      ORDER BY c.fecha_celo DESC
    `

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, data: ciclos }),
    }
  } catch (error) {
    console.error('Error fetching ciclos reproductivos:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error al obtener ciclos reproductivos',
        message: error.message,
      }),
    }
  }
}




