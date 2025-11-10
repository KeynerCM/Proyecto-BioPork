const { neon } = require('@neondatabase/serverless')

exports.handler = async (event) => {
  console.log('🔍 [get-animales-por-tipo] Iniciando función...')
  console.log('🔍 [get-animales-por-tipo] Método HTTP:', event.httpMethod)
  
  if (event.httpMethod !== 'GET') {
    console.log('❌ [get-animales-por-tipo] Método no permitido:', event.httpMethod)
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método no permitido' })
    }
  }

  try {
    console.log('🔍 [get-animales-por-tipo] Conectando a la base de datos...')
    const sql = neon(process.env.NETLIFY_DATABASE_URL)
    
    console.log('🔍 [get-animales-por-tipo] Ejecutando query...')
    const result = await sql`
      SELECT tipo, COUNT(*) as cantidad
      FROM animales
      GROUP BY tipo
      ORDER BY cantidad DESC
    `

    console.log('✅ [get-animales-por-tipo] Query exitosa. Resultados:', JSON.stringify(result, null, 2))

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
    console.error('❌ [get-animales-por-tipo] Error completo:', error)
    console.error('❌ [get-animales-por-tipo] Error message:', error.message)
    console.error('❌ [get-animales-por-tipo] Error stack:', error.stack)
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
