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

    // Recalcular fecha estimada de parto si cambia la fecha de monta
    let fechaEstimadaParto = data.fecha_estimada_parto
    if (data.fecha_monta) {
      const fechaMonta = new Date(data.fecha_monta)
      fechaMonta.setDate(fechaMonta.getDate() + 114)
      fechaEstimadaParto = fechaMonta.toISOString().split('T')[0]
    }

    const result = await sql`
      UPDATE ciclos_reproductivos SET
        cerda_id = ${data.cerda_id},
        fecha_celo = ${data.fecha_celo},
        fecha_monta = ${data.fecha_monta || null},
        tipo_monta = ${data.tipo_monta || null},
        verraco = ${data.verraco || null},
        fecha_estimada_parto = ${fechaEstimadaParto},
        estado = ${data.estado},
        notas = ${data.notas || null}
      WHERE id = ${data.id}
      RETURNING *
    `

    return new Response(JSON.stringify({ success: true, data: result[0] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error updating ciclo reproductivo:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export const config = {
  path: '/api/update-ciclo-reproductivo'
}
