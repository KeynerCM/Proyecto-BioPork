import { neon } from '@neondatabase/serverless'

export default async (req, context) => {
  if (req.method !== 'PUT') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const data = await req.json()
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

    return new Response(JSON.stringify({ success: true, data: result[0] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error updating parto:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export const config = {
  path: '/api/update-parto'
}
