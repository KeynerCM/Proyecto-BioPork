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
    
    const ciclos = await sql`
      SELECT 
        c.*,
        a.codigo as cerda_codigo,
        a.raza as cerda_raza,
        CASE 
          WHEN c.fecha_estimada_parto IS NOT NULL 
          THEN DATE_PART('day', c.fecha_estimada_parto::timestamp - CURRENT_DATE::timestamp)
          ELSE NULL
        END as dias_para_parto
      FROM ciclos_reproductivos c
      INNER JOIN animales a ON c.cerda_id = a.id
      ORDER BY c.fecha_celo DESC
    `

    return new Response(JSON.stringify({ success: true, data: ciclos }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error fetching ciclos reproductivos:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export const config = {
  path: '/api/get-ciclos-reproductivos'
}
