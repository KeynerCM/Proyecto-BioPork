const { neon } = require('@neondatabase/serverless')

exports.handler = async (event) => {
  console.log('🔍 [get-estadisticas-salud] Iniciando función...')
  console.log('🔍 [get-estadisticas-salud] Método HTTP:', event.httpMethod)
  
  if (event.httpMethod !== 'GET') {
    console.log('❌ [get-estadisticas-salud] Método no permitido:', event.httpMethod)
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método no permitido' })
    }
  }

  try {
    console.log('🔍 [get-estadisticas-salud] Conectando a la base de datos...')
    const sql = neon(process.env.DATABASE_URL)
    
    console.log('🔍 [get-estadisticas-salud] Ejecutando query para total de vacunaciones...')
    // Total de vacunaciones
    const totalVacunaciones = await sql`
      SELECT COUNT(*) as count FROM vacunaciones
    `
    console.log('✅ [get-estadisticas-salud] Total vacunaciones:', JSON.stringify(totalVacunaciones, null, 2))
    
    console.log('🔍 [get-estadisticas-salud] Ejecutando query para total de enfermedades...')
    // Total de enfermedades
    const totalEnfermedades = await sql`
      SELECT COUNT(*) as count FROM enfermedades
    `
    console.log('✅ [get-estadisticas-salud] Total enfermedades:', JSON.stringify(totalEnfermedades, null, 2))
    
    console.log('🔍 [get-estadisticas-salud] Ejecutando query para vacunas próximas...')
    // Vacunas próximas (próximos 7 días) - campo correcto es 'proxima_fecha' según schema
    const vacunasProximas = await sql`
      SELECT COUNT(*) as count 
      FROM vacunaciones 
      WHERE proxima_fecha IS NOT NULL
      AND proxima_fecha BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
    `
    console.log('✅ [get-estadisticas-salud] Vacunas próximas:', JSON.stringify(vacunasProximas, null, 2))

    const resultado = {
      total_vacunaciones: parseInt(totalVacunaciones[0].count),
      total_enfermedades: parseInt(totalEnfermedades[0].count),
      vacunas_proximas: parseInt(vacunasProximas[0].count)
    }
    
    console.log('✅ [get-estadisticas-salud] Resultado final:', JSON.stringify(resultado, null, 2))

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
    console.error('❌ [get-estadisticas-salud] Error completo:', error)
    console.error('❌ [get-estadisticas-salud] Error message:', error.message)
    console.error('❌ [get-estadisticas-salud] Error stack:', error.stack)
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
