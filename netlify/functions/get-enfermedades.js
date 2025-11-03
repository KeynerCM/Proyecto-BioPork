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

    return new Response(JSON.stringify({ success: true, data: enfermedades }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error fetching enfermedades:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export const config = {
  path: '/api/get-enfermedades'
}
