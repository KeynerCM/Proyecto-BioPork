const { neon } = require('@neondatabase/serverless')

exports.handler = async (event) => {
  console.log('🔍 [get-estadisticas-grupos] Iniciando función...')
  console.log('🔍 [get-estadisticas-grupos] Método HTTP:', event.httpMethod)
  
  if (event.httpMethod !== 'GET') {
    console.log('❌ [get-estadisticas-grupos] Método no permitido:', event.httpMethod)
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método no permitido' })
    }
  }

  try {
    console.log('🔍 [get-estadisticas-grupos] Conectando a la base de datos...')
    const sql = neon(process.env.NETLIFY_DATABASE_URL)
    
    console.log('🔍 [get-estadisticas-grupos] Ejecutando query para total de grupos...')
    // Total de grupos
    const totalGrupos = await sql`
      SELECT COUNT(*) as count FROM grupos
    `
    console.log('✅ [get-estadisticas-grupos] Total de grupos:', JSON.stringify(totalGrupos, null, 2))
    
    console.log('🔍 [get-estadisticas-grupos] Ejecutando query para capacidad total...')
    // Capacidad total
    const capacidadTotal = await sql`
      SELECT SUM(capacidad_maxima) as total FROM grupos
    `
    console.log('✅ [get-estadisticas-grupos] Capacidad total:', JSON.stringify(capacidadTotal, null, 2))
    
    console.log('🔍 [get-estadisticas-grupos] Ejecutando query para animales en grupos...')
    // Animales en grupos
    const animalesEnGrupos = await sql`
      SELECT COUNT(*) as count FROM animales WHERE grupo_id IS NOT NULL
    `
    console.log('✅ [get-estadisticas-grupos] Animales en grupos:', JSON.stringify(animalesEnGrupos, null, 2))

    const resultado = {
      total_grupos: parseInt(totalGrupos[0].count),
      capacidad_total: parseInt(capacidadTotal[0].total) || 0,
      animales_en_grupos: parseInt(animalesEnGrupos[0].count)
    }
    
    console.log('✅ [get-estadisticas-grupos] Resultado final:', JSON.stringify(resultado, null, 2))

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        data: resultado
      })
    }
  } catch (error) {
    console.error('❌ [get-estadisticas-grupos] Error completo:', error)
    console.error('❌ [get-estadisticas-grupos] Error message:', error.message)
    console.error('❌ [get-estadisticas-grupos] Error stack:', error.stack)
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
