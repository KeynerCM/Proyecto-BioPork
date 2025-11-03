const { neon } = require('@neondatabase/serverless')

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method not allowed' }),
    }
  }

  try {
    const { limit = 10 } = event.queryStringParameters || {}

    const sql = neon(process.env.NETLIFY_DATABASE_URL)

    // Obtener actividades recientes de diferentes módulos
    const actividades = []

    // Animales registrados recientemente
    try {
      const animalesRecientes = await sql`
        SELECT 
          'animal' as tipo,
          'Nuevo animal registrado' as titulo,
          'Animal ' || codigo || ' (' || raza || ')' as descripcion,
          fecha_registro as fecha,
          id
        FROM animales
        ORDER BY fecha_registro DESC
        LIMIT 3
      `
      actividades.push(...animalesRecientes)
    } catch (e) {
      console.log('Error en animales recientes:', e.message)
    }

    // Vacunaciones recientes
    try {
      const vacunacionesRecientes = await sql`
        SELECT 
          'vacunacion' as tipo,
          'Vacunación aplicada' as titulo,
          v.vacuna || ' - Animal ' || a.codigo as descripcion,
          v.fecha_aplicacion as fecha,
          v.id
        FROM vacunaciones v
        JOIN animales a ON v.animal_id = a.id
        ORDER BY v.fecha_aplicacion DESC
        LIMIT 3
      `
      actividades.push(...vacunacionesRecientes)
    } catch (e) {
      console.log('Error en vacunaciones recientes:', e.message)
    }

    // Enfermedades/Tratamientos recientes
    try {
      const enfermedadesRecientes = await sql`
        SELECT 
          'enfermedad' as tipo,
          'Nueva enfermedad/tratamiento' as titulo,
          e.nombre || ' - Animal ' || a.codigo as descripcion,
          e.fecha_deteccion as fecha,
          e.id
        FROM enfermedades e
        JOIN animales a ON e.animal_id = a.id
        ORDER BY e.fecha_deteccion DESC
        LIMIT 3
      `
      actividades.push(...enfermedadesRecientes)
    } catch (e) {
      console.log('Error en enfermedades recientes:', e.message)
    }

    // Partos recientes
    try {
      const partosRecientes = await sql`
        SELECT 
          'parto' as tipo,
          'Parto registrado' as titulo,
          'Cerda ' || a.codigo || ' - ' || p.lechones_nacidos_vivos || ' lechones vivos' as descripcion,
          p.fecha_parto as fecha,
          p.id
        FROM partos p
        JOIN ciclos_reproductivos cr ON p.ciclo_id = cr.id
        JOIN animales a ON cr.cerda_id = a.id
        ORDER BY p.fecha_parto DESC
        LIMIT 3
      `
      actividades.push(...partosRecientes)
    } catch (e) {
      console.log('Error en partos recientes:', e.message)
    }

    // Grupos creados recientemente
    try {
      const gruposRecientes = await sql`
        SELECT 
          'grupo' as tipo,
          'Nuevo grupo creado' as titulo,
          'Grupo ' || codigo || ' (' || tipo || ')' as descripcion,
          fecha_creacion as fecha,
          id
        FROM grupos
        WHERE fecha_creacion IS NOT NULL
        ORDER BY fecha_creacion DESC
        LIMIT 2
      `
      actividades.push(...gruposRecientes)
    } catch (e) {
      console.log('Error en grupos recientes:', e.message)
    }

    // Ordenar todas las actividades por fecha
    actividades.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

    // Limitar al número solicitado
    const actividadesLimitadas = actividades.slice(0, parseInt(limit))

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: actividadesLimitadas,
        count: actividadesLimitadas.length,
      }),
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error al obtener actividades recientes',
        message: error.message,
      }),
    }
  }
}
