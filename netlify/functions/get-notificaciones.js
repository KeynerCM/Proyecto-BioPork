const { neon } = require('@neondatabase/serverless')

exports.handler = async (event) => {
  console.log('🔍 [get-notificaciones] Iniciando función...')
  console.log('🔍 [get-notificaciones] Método HTTP:', event.httpMethod)
  
  if (event.httpMethod !== 'GET') {
    console.log('❌ [get-notificaciones] Método no permitido:', event.httpMethod)
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método no permitido' })
    }
  }

  try {
    console.log('🔍 [get-notificaciones] Conectando a la base de datos...')
    const sql = neon(process.env.NETLIFY_DATABASE_URL)
    
    console.log('🔍 [get-notificaciones] Ejecutando query...')
    const notificaciones = await sql`
      SELECT 
        id,
        titulo,
        mensaje,
        tipo,
        prioridad,
        leida,
        fecha_creacion,
        animal_id
      FROM notificaciones
      ORDER BY 
        CASE prioridad
          WHEN 'urgente' THEN 1
          WHEN 'alta' THEN 2
          WHEN 'media' THEN 3
          WHEN 'baja' THEN 4
        END,
        fecha_creacion DESC
    `

    console.log('✅ [get-notificaciones] Query exitosa. Registros encontrados:', notificaciones.length)
    console.log('📊 [get-notificaciones] Datos:', JSON.stringify(notificaciones, null, 2))

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        data: notificaciones
      })
    }
  } catch (error) {
    console.error('❌ [get-notificaciones] Error completo:', error)
    console.error('❌ [get-notificaciones] Error message:', error.message)
    console.error('❌ [get-notificaciones] Error stack:', error.stack)
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Error al obtener notificaciones',
        details: error.message
      })
    }
  }
}
