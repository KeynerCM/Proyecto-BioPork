const { neon } = require('@neondatabase/serverless')

exports.handler = async (event) => {
  console.log('🔍 [get-estadisticas-reproduccion] Iniciando función...')
  console.log('🔍 [get-estadisticas-reproduccion] Método HTTP:', event.httpMethod)
  
  if (event.httpMethod !== 'GET') {
    console.log('❌ [get-estadisticas-reproduccion] Método no permitido:', event.httpMethod)
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método no permitido' })
    }
  }

  try {
    console.log('🔍 [get-estadisticas-reproduccion] Conectando a la base de datos...')
    const sql = neon(process.env.NETLIFY_DATABASE_URL)
    
    console.log('🔍 [get-estadisticas-reproduccion] Ejecutando query para cerdas activas...')
    // Cerdas activas (animales de reproducción tipo hembra)
    const cerdasActivas = await sql`
      SELECT COUNT(*) as count FROM animales WHERE tipo = 'reproduccion' AND sexo = 'hembra' AND estado = 'activo'
    `
    console.log('✅ [get-estadisticas-reproduccion] Cerdas activas:', JSON.stringify(cerdasActivas, null, 2))
    
    console.log('🔍 [get-estadisticas-reproduccion] Ejecutando query para en gestación...')
    // En gestación (estado correcto es 'gestante' según schema)
    const enGestacion = await sql`
      SELECT COUNT(*) as count FROM ciclos_reproductivos WHERE estado = 'gestante'
    `
    console.log('✅ [get-estadisticas-reproduccion] En gestación:', JSON.stringify(enGestacion, null, 2))
    
    console.log('🔍 [get-estadisticas-reproduccion] Ejecutando query para partos esperados...')
    // Partos esperados (próximos 30 días, estado 'gestante')
    const partosEsperados = await sql`
      SELECT COUNT(*) as count 
      FROM ciclos_reproductivos 
      WHERE estado = 'gestante'
      AND fecha_estimada_parto BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
    `
    console.log('✅ [get-estadisticas-reproduccion] Partos esperados:', JSON.stringify(partosEsperados, null, 2))
    
    console.log('🔍 [get-estadisticas-reproduccion] Ejecutando query para total lechones...')
    // Total de lechones (suma de lechones vivos de todos los partos recientes)
    const totalLechones = await sql`
      SELECT COALESCE(SUM(lechones_vivos), 0) as count FROM partos 
      WHERE fecha_parto >= CURRENT_DATE - INTERVAL '60 days'
    `
    console.log('✅ [get-estadisticas-reproduccion] Total lechones:', JSON.stringify(totalLechones, null, 2))

    const resultado = {
      cerdas_activas: parseInt(cerdasActivas[0].count),
      en_gestacion: parseInt(enGestacion[0].count),
      partos_esperados: parseInt(partosEsperados[0].count),
      total_lechones: parseInt(totalLechones[0].count)
    }
    
    console.log('✅ [get-estadisticas-reproduccion] Resultado final:', JSON.stringify(resultado, null, 2))

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
    console.error('❌ [get-estadisticas-reproduccion] Error completo:', error)
    console.error('❌ [get-estadisticas-reproduccion] Error message:', error.message)
    console.error('❌ [get-estadisticas-reproduccion] Error stack:', error.stack)
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
