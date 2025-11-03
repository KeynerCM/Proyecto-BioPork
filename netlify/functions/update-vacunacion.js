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

    return new Response(JSON.stringify({ success: true, data: result[0] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error updating vacunacion:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export const config = {
  path: '/api/update-vacunacion'
}
