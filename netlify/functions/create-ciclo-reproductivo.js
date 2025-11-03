const { neon } = require('@neondatabase/serverless')

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    const data = JSON.parse(event.body)
    const sql = neon(process.env.NETLIFY_DATABASE_URL)

    // Calcular fecha estimada de parto (114 dÃ­as despuÃ©s de la monta)
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

    return { statusCode: 201, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: true, data: result[0] }) }
  } catch (error) {
    console.error('Error creating ciclo reproductivo:', error)
    return { statusCode: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: error.message }) }
  }
}




