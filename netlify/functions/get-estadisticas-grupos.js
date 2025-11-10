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
    
    // Total de grupos
    const totalGrupos = await sql`
      SELECT COUNT(*) as count FROM grupos
    `
    
    // Capacidad total
    const capacidadTotal = await sql`
      SELECT SUM(capacidad_maxima) as total FROM grupos
    `
    
    // Animales en grupos
    const animalesEnGrupos = await sql`
      SELECT COUNT(*) as count FROM animales WHERE grupo_id IS NOT NULL
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
          total_grupos: parseInt(totalGrupos[0].count),
          capacidad_total: parseInt(capacidadTotal[0].total) || 0,
          animales_en_grupos: parseInt(animalesEnGrupos[0].count)
        }
      })
    }
  } catch (error) {
    console.error('Error al obtener estadísticas de grupos:', error)
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
