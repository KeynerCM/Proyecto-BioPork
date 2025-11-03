import { neon } from '@neondatabase/serverless'

export default async (req, context) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const data = await req.json()
    const sql = neon(process.env.DATABASE_URL)

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

    return new Response(JSON.stringify({ success: true, data: result[0] }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error creating parto:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export const config = {
  path: '/api/create-parto'
}
