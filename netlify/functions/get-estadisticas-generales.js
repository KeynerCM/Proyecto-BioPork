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
    
    // Total de animales
    const totalAnimales = await sql`
      SELECT COUNT(*) as count FROM animales
    `
    
    // Animales activos
    const animalesActivos = await sql`
      SELECT COUNT(*) as count FROM animales WHERE estado = 'activo'
    `
    
    // Grupos activos
    const gruposActivos = await sql`
      SELECT COUNT(*) as count FROM grupos WHERE estado IN ('abierto', 'en_llenado')
    `
    
    // Peso promedio
    const pesoPromedio = await sql`
      SELECT AVG(peso_actual) as promedio FROM animales WHERE peso_actual IS NOT NULL
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
          total_animales: parseInt(totalAnimales[0].count),
          animales_activos: parseInt(animalesActivos[0].count),
          grupos_activos: parseInt(gruposActivos[0].count),
          peso_promedio: pesoPromedio[0].promedio || 0
        }
      })
    }
  } catch (error) {
    console.error('Error al obtener estadísticas generales:', error)
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
