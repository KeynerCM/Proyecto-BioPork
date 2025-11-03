import { neon } from '@neondatabase/serverless'

export default async (req, context) => {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const sql = neon(process.env.DATABASE_URL)
    
    const vacunaciones = await sql`
      SELECT 
        v.*,
        a.codigo as animal_codigo,
        a.tipo as animal_tipo,
        a.raza as animal_raza
      FROM vacunaciones v
      INNER JOIN animales a ON v.animal_id = a.id
      ORDER BY v.fecha_aplicacion DESC
    `

    return new Response(JSON.stringify({ success: true, data: vacunaciones }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error fetching vacunaciones:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export const config = {
  path: '/api/get-vacunaciones'
}
