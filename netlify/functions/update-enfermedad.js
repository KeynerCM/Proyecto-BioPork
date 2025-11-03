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
      UPDATE enfermedades SET
        animal_id = ${data.animal_id},
        enfermedad = ${data.enfermedad},
        sintomas = ${data.sintomas || null},
        fecha_inicio = ${data.fecha_inicio},
        tratamiento = ${data.tratamiento || null},
        medicamento = ${data.medicamento || null},
        dosis = ${data.dosis || null},
        estado = ${data.estado},
        fecha_recuperacion = ${data.fecha_recuperacion || null},
        veterinario = ${data.veterinario || null},
        costo = ${data.costo || null},
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
    console.error('Error updating enfermedad:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error al actualizar enfermedad',
        message: error.message,
      }),
    }
  }
}

export const config = {
  path: '/api/update-enfermedad'
}


