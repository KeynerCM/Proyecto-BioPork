const { neon } = require('@neondatabase/serverless')

exports.handler = async (event) => {
  console.log('🔍 [get-animales-por-estado] Iniciando función...')
  console.log('🔍 [get-animales-por-estado] Método HTTP:', event.httpMethod)
  
  if (event.httpMethod !== 'GET') {
    console.log('❌ [get-animales-por-estado] Método no permitido:', event.httpMethod)
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método no permitido' })
    }
  }

  try {
    console.log('🔍 [get-animales-por-estado] Conectando a la base de datos...')
    const sql = neon(process.env.DATABASE_URL)
    
    console.log('🔍 [get-animales-por-estado] Ejecutando query...')
    const result = await sql`
      SELECT estado, COUNT(*) as cantidad
      FROM animales
      GROUP BY estado
      ORDER BY cantidad DESC
    `

    console.log('✅ [get-animales-por-estado] Query exitosa. Resultados:', JSON.stringify(result, null, 2))

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
    console.error('❌ [get-animales-por-estado] Error completo:', error)
    console.error('❌ [get-animales-por-estado] Error message:', error.message)
    console.error('❌ [get-animales-por-estado] Error stack:', error.stack)
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
