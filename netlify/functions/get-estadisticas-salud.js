const { neon } = require('@neondatabase/serverless')

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método no permitido' })
    }
  }

  try {
    const sql = neon(process.env.DATABASE_URL)
    
    // Total de vacunaciones
    const totalVacunaciones = await sql`
      SELECT COUNT(*) as count FROM vacunaciones
    `
    
    // Total de enfermedades
    const totalEnfermedades = await sql`
      SELECT COUNT(*) as count FROM enfermedades
    `
    
    // Vacunas próximas (próximos 7 días)
    const vacunasProximas = await sql`
      SELECT COUNT(*) as count 
      FROM vacunaciones 
      WHERE proxima_dosis IS NOT NULL
      AND proxima_dosis BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
    `

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        data: {
          total_vacunaciones: parseInt(totalVacunaciones[0].count),
          total_enfermedades: parseInt(totalEnfermedades[0].count),
          vacunas_proximas: parseInt(vacunasProximas[0].count)
        }
      })
    }
  } catch (error) {
    console.error('Error al obtener estadísticas de salud:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Error al obtener estadísticas',
        details: error.message
      })
    }
  }
}
