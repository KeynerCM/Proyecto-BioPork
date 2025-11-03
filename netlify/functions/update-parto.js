const { neon } = require('@neondatabase/serverless')

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'PUT') {
    return { statusCode: 405, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    const data = JSON.parse(event.body)
    const sql = neon(process.env.NETLIFY_DATABASE_URL)

    // Recalcular lechones muertos
    const lechonesNacidos = parseInt(data.lechones_nacidos)
    const lechonesVivos = parseInt(data.lechones_vivos)
    const lechonesMuertos = lechonesNacidos - lechonesVivos

    const result = await sql`
      UPDATE partos SET
        cerda_id = ${data.cerda_id},
        ciclo_id = ${data.ciclo_id || null},
        fecha_parto = ${data.fecha_parto},
        lechones_nacidos = ${lechonesNacidos},
        lechones_vivos = ${lechonesVivos},
        lechones_muertos = ${lechonesMuertos},
        peso_promedio = ${data.peso_promedio || null},
        dificultad = ${data.dificultad},
        estado_cerda = ${data.estado_cerda || null},
        observaciones = ${data.observaciones || null},
        veterinario = ${data.veterinario || null}
      WHERE id = ${data.id}
      RETURNING *
    `

    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: true, data: result[0] }) }
  } catch (error) {
    console.error('Error updating parto:', error)
    return { statusCode: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: error.message }) }
  }
}




