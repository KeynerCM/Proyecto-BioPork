const { neon } = require('@neondatabase/serverless')

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'PUT') {
    return { statusCode: 405, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    const data = JSON.parse(event.body)
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

    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: true, data: result[0] }) }
  } catch (error) {
    console.error('Error updating ciclo reproductivo:', error)
    return { statusCode: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: error.message }) }
  }
}




