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

    return new Response(JSON.stringify({ success: true, data: result[0] }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error creating vacunacion:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export const config = {
  path: '/api/create-vacunacion'
}
