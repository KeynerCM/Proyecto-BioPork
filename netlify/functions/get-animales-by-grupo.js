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
    const { grupo_id, incluir_historicos } = event.queryStringParameters || {}

    if (!grupo_id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Se requiere el grupo_id',
        }),
      }
    }

    const sql = neon(process.env.NETLIFY_DATABASE_URL)

    let result

    if (incluir_historicos === 'true') {
      // Incluir todos los animales (actuales e históricos)
      result = await sql`
        SELECT
          a.*,
          ag.fecha_ingreso,
          ag.fecha_salida,
          CASE
            WHEN ag.fecha_salida IS NULL THEN 'activo'
            ELSE 'historico'
          END as estado_asignacion
        FROM animales a
        INNER JOIN animales_grupos ag ON a.id = ag.animal_id
        WHERE ag.grupo_id = ${grupo_id}
        ORDER BY ag.fecha_ingreso DESC
      `
    } else {
      // Solo animales actualmente en el grupo
      result = await sql`
        SELECT
          a.*,
          ag.fecha_ingreso,
          ag.fecha_salida
        FROM animales a
        INNER JOIN animales_grupos ag ON a.id = ag.animal_id
        WHERE ag.grupo_id = ${grupo_id}
        AND ag.fecha_salida IS NULL
        ORDER BY ag.fecha_ingreso DESC
      `
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: result,
        count: result.length,
      }),
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error al obtener animales del grupo',
        message: error.message,
      }),
    }
  }
}
