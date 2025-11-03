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
      INSERT INTO enfermedades (
        animal_id,
        enfermedad,
        sintomas,
        fecha_inicio,
        tratamiento,
        medicamento,
        dosis,
        estado,
        fecha_recuperacion,
        veterinario,
        costo,
        notas
      ) VALUES (
        ${data.animal_id},
        ${data.enfermedad},
        ${data.sintomas || null},
        ${data.fecha_inicio},
        ${data.tratamiento || null},
        ${data.medicamento || null},
        ${data.dosis || null},
        ${data.estado || 'en_tratamiento'},
        ${data.fecha_recuperacion || null},
        ${data.veterinario || null},
        ${data.costo || null},
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
    console.error('Error creating enfermedad:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error al crear enfermedad',
        message: error.message,
      }),
    }
  }
}
