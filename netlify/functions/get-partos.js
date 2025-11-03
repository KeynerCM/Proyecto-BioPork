import { neon } from '@neondatabase/serverless'

export default async (req, context) => {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
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

    return new Response(JSON.stringify({ success: true, data: partos }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error fetching partos:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export const config = {
  path: '/api/get-partos'
}
