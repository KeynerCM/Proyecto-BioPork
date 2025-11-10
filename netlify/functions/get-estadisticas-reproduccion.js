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
    
    // Cerdas activas
    const cerdasActivas = await sql`
      SELECT COUNT(*) as count FROM animales WHERE tipo = 'cerda' AND estado = 'activo'
    `
    
    // En gestación
    const enGestacion = await sql`
      SELECT COUNT(*) as count FROM ciclos_reproductivos WHERE estado = 'gestacion'
    `
    
    // Partos esperados (próximos 30 días)
    const partosEsperados = await sql`
      SELECT COUNT(*) as count 
      FROM ciclos_reproductivos 
      WHERE estado = 'gestacion'
      AND fecha_parto_estimada BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
    `
    
    // Total de lechones
    const totalLechones = await sql`
      SELECT COUNT(*) as count FROM animales WHERE tipo = 'lechon'
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
          cerdas_activas: parseInt(cerdasActivas[0].count),
          en_gestacion: parseInt(enGestacion[0].count),
          partos_esperados: parseInt(partosEsperados[0].count),
          total_lechones: parseInt(totalLechones[0].count)
        }
      })
    }
  } catch (error) {
    console.error('Error al obtener estadísticas de reproducción:', error)
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
