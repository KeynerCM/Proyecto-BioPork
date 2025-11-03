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

    return new Response(JSON.stringify({ success: true, data: result[0] }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error creating enfermedad:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export const config = {
  path: '/api/create-enfermedad'
}
