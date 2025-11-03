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
    const sql = neon(process.env.DATABASE_URL)

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

    return new Response(JSON.stringify({ success: true, data: result[0] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error updating enfermedad:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export const config = {
  path: '/api/update-enfermedad'
}
