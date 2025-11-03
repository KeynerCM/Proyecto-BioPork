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

    // Calcular fecha estimada de parto (114 días después de la monta)
    let fechaEstimadaParto = null
    if (data.fecha_monta) {
      const fechaMonta = new Date(data.fecha_monta)
      fechaMonta.setDate(fechaMonta.getDate() + 114)
      fechaEstimadaParto = fechaMonta.toISOString().split('T')[0]
    }

    const result = await sql`
      INSERT INTO ciclos_reproductivos (
        cerda_id,
        fecha_celo,
        fecha_monta,
        tipo_monta,
        verraco,
        fecha_estimada_parto,
        estado,
        notas
      ) VALUES (
        ${data.cerda_id},
        ${data.fecha_celo},
        ${data.fecha_monta || null},
        ${data.tipo_monta || null},
        ${data.verraco || null},
        ${fechaEstimadaParto},
        ${data.estado || 'esperando'},
        ${data.notas || null}
      )
      RETURNING *
    `

    return new Response(JSON.stringify({ success: true, data: result[0] }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error creating ciclo reproductivo:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export const config = {
  path: '/api/create-ciclo-reproductivo'
}
