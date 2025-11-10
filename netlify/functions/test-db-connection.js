const { neon } = require('@neondatabase/serverless')

exports.handler = async (event) => {
  console.log('🔍 [test-db-connection] Iniciando prueba de conexión...')
  console.log('🔍 [test-db-connection] DATABASE_URL existe:', !!process.env.DATABASE_URL)
  console.log('🔍 [test-db-connection] DATABASE_URL length:', process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0)
  
  try {
    console.log('🔍 [test-db-connection] Creando cliente SQL...')
    const sql = neon(process.env.DATABASE_URL)
    
    console.log('🔍 [test-db-connection] Ejecutando query de prueba...')
    const result = await sql`SELECT NOW() as current_time, version() as pg_version`
    
    console.log('✅ [test-db-connection] Conexión exitosa!')
    console.log('✅ [test-db-connection] Resultado:', JSON.stringify(result, null, 2))
    
    // Verificar tablas
    console.log('🔍 [test-db-connection] Verificando tablas...')
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    console.log('✅ [test-db-connection] Tablas encontradas:', JSON.stringify(tables, null, 2))
    
    // Verificar tabla notificaciones
    console.log('🔍 [test-db-connection] Verificando estructura de notificaciones...')
    const notifColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'notificaciones'
      ORDER BY ordinal_position
    `
    console.log('✅ [test-db-connection] Columnas de notificaciones:', JSON.stringify(notifColumns, null, 2))
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Conexión exitosa',
        data: {
          timestamp: result[0].current_time,
          postgresVersion: result[0].pg_version,
          tables: tables.map(t => t.table_name),
          notificacionesColumns: notifColumns.map(c => `${c.column_name} (${c.data_type})`)
        }
      })
    }
  } catch (error) {
    console.error('❌ [test-db-connection] Error completo:', error)
    console.error('❌ [test-db-connection] Error message:', error.message)
    console.error('❌ [test-db-connection] Error stack:', error.stack)
    console.error('❌ [test-db-connection] Error name:', error.name)
    console.error('❌ [test-db-connection] Error code:', error.code)
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'Error en la prueba de conexión',
        details: {
          message: error.message,
          name: error.name,
          code: error.code,
          stack: error.stack
        }
      })
    }
  }
}
