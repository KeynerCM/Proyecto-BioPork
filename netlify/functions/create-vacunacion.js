const { neon } = require('@neondatabase/serverless')

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method not allowed' }),
    }
  }

  try {
    const data = JSON.parse(event.body)
    const sql = neon(process.env.NETLIFY_DATABASE_URL)

    const result = await sql`
      INSERT INTO vacunaciones (
        animal_id,
        tipo_vacuna,
        fecha_aplicacion,
        dosis,
        lote_vacuna,
        proxima_fecha,
        veterinario,
        notas
      ) VALUES (
        ${data.animal_id},
        ${data.tipo_vacuna},
        ${data.fecha_aplicacion},
        ${data.dosis || null},
        ${data.lote_vacuna || null},
        ${data.proxima_fecha || null},
        ${data.veterinario || null},
        ${data.notas || null}
      )
      RETURNING *
    `

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ success: true, data: result[0] }),
    }
  } catch (error) {
    console.error('Error creating vacunacion:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error al crear vacunación',
        message: error.message,
      }),
    }
  }
}
