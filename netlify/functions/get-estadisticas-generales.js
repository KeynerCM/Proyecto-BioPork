const { neon } = require('@neondatabase/serverless')

exports.handler = async (event) => {
  console.log('🔍 [get-estadisticas-generales] Iniciando función...')
  console.log('🔍 [get-estadisticas-generales] Método HTTP:', event.httpMethod)
  
  if (event.httpMethod !== 'GET') {
    console.log('❌ [get-estadisticas-generales] Método no permitido:', event.httpMethod)
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método no permitido' })
    }
  }

  try {
    console.log('🔍 [get-estadisticas-generales] Conectando a la base de datos...')
    const sql = neon(process.env.NETLIFY_DATABASE_URL)
    
    // Total de animales
    console.log('🔍 [get-estadisticas-generales] Obteniendo total de animales...')
    const totalAnimales = await sql`
      SELECT COUNT(*) as count FROM animales
    `
    console.log('✅ [get-estadisticas-generales] Total animales:', totalAnimales[0].count)
    
    // Animales activos
    console.log('🔍 [get-estadisticas-generales] Obteniendo animales activos...')
    const animalesActivos = await sql`
      SELECT COUNT(*) as count FROM animales WHERE estado = 'activo'
    `
    console.log('✅ [get-estadisticas-generales] Animales activos:', animalesActivos[0].count)
    
    // Grupos activos
    console.log('🔍 [get-estadisticas-generales] Obteniendo grupos activos...')
    const gruposActivos = await sql`
      SELECT COUNT(*) as count FROM grupos WHERE estado IN ('abierto', 'en_llenado')
    `
    console.log('✅ [get-estadisticas-generales] Grupos activos:', gruposActivos[0].count)
    
    // Peso promedio
    console.log('🔍 [get-estadisticas-generales] Obteniendo peso promedio...')
    const pesoPromedio = await sql`
      SELECT AVG(peso_actual) as promedio FROM animales WHERE peso_actual IS NOT NULL
    `
    console.log('✅ [get-estadisticas-generales] Peso promedio:', pesoPromedio[0].promedio)

    const result = {
      total_animales: parseInt(totalAnimales[0].count),
      animales_activos: parseInt(animalesActivos[0].count),
      grupos_activos: parseInt(gruposActivos[0].count),
      peso_promedio: pesoPromedio[0].promedio || 0
    }
    
    console.log('✅ [get-estadisticas-generales] Resultado final:', JSON.stringify(result, null, 2))

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        data: result
      })
    }
  } catch (error) {
    console.error('❌ [get-estadisticas-generales] Error completo:', error)
    console.error('❌ [get-estadisticas-generales] Error message:', error.message)
    console.error('❌ [get-estadisticas-generales] Error stack:', error.stack)
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
