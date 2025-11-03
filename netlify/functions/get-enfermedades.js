const { neon } = require('@neondatabase/serverless')

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    const sql = neon(process.env.NETLIFY_DATABASE_URL)
    
    const enfermedades = await sql`
      SELECT 
        e.*,
        a.codigo as animal_codigo,
        a.tipo as animal_tipo,
        a.raza as animal_raza
      FROM enfermedades e
      INNER JOIN animales a ON e.animal_id = a.id
      ORDER BY e.fecha_inicio DESC
    `

    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: true, data: enfermedades }) }
  } catch (error) {
    console.error('Error fetching enfermedades:', error)
    return { statusCode: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: error.message }) }
  }
}




