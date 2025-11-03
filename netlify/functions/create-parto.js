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

    // Compute piglets born/deceased, coercing empty inputs to zero
    const lechonesNacidos = Number.parseInt(data.lechones_nacidos, 10) || 0
    const lechonesVivos = Number.parseInt(data.lechones_vivos, 10) || 0
    const lechonesMuertos = Math.max(lechonesNacidos - lechonesVivos, 0)

    const result = await sql`
      INSERT INTO partos (
        cerda_id,
        ciclo_id,
        fecha_parto,
        lechones_nacidos,
        lechones_vivos,
        lechones_muertos,
        peso_promedio,
        dificultad,
        estado_cerda,
        observaciones,
        veterinario
      ) VALUES (
        ${data.cerda_id},
        ${data.ciclo_id || null},
        ${data.fecha_parto},
        ${lechonesNacidos},
        ${lechonesVivos},
        ${lechonesMuertos},
        ${data.peso_promedio || null},
        ${data.dificultad || 'normal'},
        ${data.estado_cerda || null},
        ${data.observaciones || null},
        ${data.veterinario || null}
      )
      RETURNING *
    `

    if (data.ciclo_id) {
      await sql`
        UPDATE ciclos_reproductivos 
        SET estado = 'parto_completado' 
        WHERE id = ${data.ciclo_id}
      `
    }

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ success: true, data: result[0] }),
    }
  } catch (error) {
    console.error('Error creating parto:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error al crear registro de parto',
        message: error.message,
      }),
    }
  }
}




