const { neon } = require('@neondatabase/serverless')

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    const sql = neon(process.env.NETLIFY_DATABASE_URL)
    
    const partos = await sql`
      SELECT 
        p.*,
        a.codigo as cerda_codigo,
        a.raza as cerda_raza,
        c.fecha_estimada_parto,
        c.verraco
      FROM partos p
      INNER JOIN animales a ON p.cerda_id = a.id
      LEFT JOIN ciclos_reproductivos c ON p.ciclo_id = c.id
      ORDER BY p.fecha_parto DESC
    `

    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: true, data: partos }) }
  } catch (error) {
    console.error('Error fetching partos:', error)
    return { statusCode: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: error.message }) }
  }
}




