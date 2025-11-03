const { neon } = require('@neondatabase/serverless')

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    const data = JSON.parse(event.body)
    const sql = neon(process.env.NETLIFY_DATABASE_URL)

    // Calcular lechones muertos
    const lechonesNacidos = parseInt(data.lechones_nacidos)
    const lechonesVivos = parseInt(data.lechones_vivos)
    const lechonesMuertos = lechonesNacidos - lechonesVivos

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

    // Actualizar el estado del ciclo reproductivo a 'parto_completado'
    if (data.ciclo_id) {
      await sql`
        UPDATE ciclos_reproductivos 
        SET estado = 'parto_completado' 
        WHERE id = ${data.ciclo_id}
      `
    }

    return { statusCode: 201, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: true, data: result[0] }) }
  } catch (error) {
    console.error('Error creating parto:', error)
    return { statusCode: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: error.message }) }
  }
}




