const { neon } = require('@neondatabase/serverless')

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'PUT') {
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
      UPDATE vacunaciones SET
        animal_id = ${data.animal_id},
        tipo_vacuna = ${data.tipo_vacuna},
        fecha_aplicacion = ${data.fecha_aplicacion},
        dosis = ${data.dosis || null},
        lote_vacuna = ${data.lote_vacuna || null},
        proxima_fecha = ${data.proxima_fecha || null},
        veterinario = ${data.veterinario || null},
        notas = ${data.notas || null}
      WHERE id = ${data.id}
      RETURNING *
    `

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, data: result[0] }),
    }
  } catch (error) {
    console.error('Error updating vacunacion:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error al actualizar vacunación',
        message: error.message,
      }),
    }
  }
}
