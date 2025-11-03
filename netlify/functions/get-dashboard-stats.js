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
    const sql = neon(process.env.NETLIFY_DATABASE_URL)

    // Obtener estadísticas de animales
    const animalesStats = await sql`
      SELECT
        COUNT(*) as total_animales,
        COUNT(*) FILTER (WHERE estado = 'activo') as animales_activos,
        COUNT(*) FILTER (WHERE tipo = 'engorde') as animales_engorde,
        COUNT(*) FILTER (WHERE tipo = 'reproduccion') as animales_reproduccion,
        COUNT(*) FILTER (WHERE sexo = 'hembra' AND tipo = 'reproduccion') as cerdas_reproductoras,
        AVG(peso_actual) FILTER (WHERE peso_actual IS NOT NULL) as peso_promedio
      FROM animales
    `

    // Obtener estadísticas de grupos
    const gruposStats = await sql`
      SELECT
        COUNT(*) as total_grupos,
        COUNT(*) FILTER (WHERE activo = true) as grupos_activos,
        SUM(cantidad_actual) as total_animales_en_grupos,
        SUM(capacidad) as capacidad_total,
        AVG(CASE WHEN capacidad > 0 THEN (cantidad_actual::float / capacidad * 100) ELSE 0 END) as ocupacion_promedio
      FROM grupos
    `

    // Obtener estadísticas de salud (últimos 30 días)
    const saludStats = await sql`
      SELECT
        COUNT(DISTINCT v.id) as vacunaciones_mes,
        COUNT(DISTINCT e.id) as enfermedades_mes,
        COUNT(DISTINCT e.id) FILTER (WHERE e.estado = 'en_tratamiento') as tratamientos_activos
      FROM (
        SELECT id FROM vacunaciones 
        WHERE fecha_aplicacion >= CURRENT_DATE - INTERVAL '30 days'
      ) v
      FULL OUTER JOIN (
        SELECT id, estado FROM enfermedades 
        WHERE fecha_deteccion >= CURRENT_DATE - INTERVAL '30 days'
      ) e ON false
    `

    // Obtener estadísticas de reproducción (últimos 30 días)
    const reproduccionStats = await sql`
      SELECT
        COUNT(DISTINCT cr.id) as ciclos_activos,
        COUNT(DISTINCT p.id) as partos_mes,
        SUM(p.lechones_nacidos_vivos) FILTER (WHERE p.fecha_parto >= CURRENT_DATE - INTERVAL '30 days') as lechones_nacidos_mes
      FROM (
        SELECT id FROM ciclos_reproductivos 
        WHERE estado = 'activo'
      ) cr
      FULL OUTER JOIN (
        SELECT id, fecha_parto, lechones_nacidos_vivos FROM partos 
        WHERE fecha_parto >= CURRENT_DATE - INTERVAL '30 days'
      ) p ON false
    `

    // Próximos partos (próximos 7 días)
    const proximosPartos = await sql`
      SELECT COUNT(*) as partos_proximos
      FROM ciclos_reproductivos
      WHERE estado = 'activo'
      AND fecha_parto_estimada BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
    `

    // Vacunaciones pendientes (próximos 7 días)
    const vacunacionesPendientes = await sql`
      SELECT COUNT(*) as vacunaciones_pendientes
      FROM vacunaciones
      WHERE fecha_proxima_dosis BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
    `

    const stats = {
      animales: {
        total: parseInt(animalesStats[0]?.total_animales || 0),
        activos: parseInt(animalesStats[0]?.animales_activos || 0),
        engorde: parseInt(animalesStats[0]?.animales_engorde || 0),
        reproduccion: parseInt(animalesStats[0]?.animales_reproduccion || 0),
        cerdas: parseInt(animalesStats[0]?.cerdas_reproductoras || 0),
        peso_promedio: parseFloat(animalesStats[0]?.peso_promedio || 0).toFixed(2),
      },
      grupos: {
        total: parseInt(gruposStats[0]?.total_grupos || 0),
        activos: parseInt(gruposStats[0]?.grupos_activos || 0),
        animales_asignados: parseInt(gruposStats[0]?.total_animales_en_grupos || 0),
        capacidad_total: parseInt(gruposStats[0]?.capacidad_total || 0),
        ocupacion_promedio: parseFloat(gruposStats[0]?.ocupacion_promedio || 0).toFixed(1),
      },
      salud: {
        vacunaciones_mes: parseInt(saludStats[0]?.vacunaciones_mes || 0),
        enfermedades_mes: parseInt(saludStats[0]?.enfermedades_mes || 0),
        tratamientos_activos: parseInt(saludStats[0]?.tratamientos_activos || 0),
      },
      reproduccion: {
        ciclos_activos: parseInt(reproduccionStats[0]?.ciclos_activos || 0),
        partos_mes: parseInt(reproduccionStats[0]?.partos_mes || 0),
        lechones_nacidos_mes: parseInt(reproduccionStats[0]?.lechones_nacidos_mes || 0),
      },
      alertas: {
        partos_proximos: parseInt(proximosPartos[0]?.partos_proximos || 0),
        vacunaciones_pendientes: parseInt(vacunacionesPendientes[0]?.vacunaciones_pendientes || 0),
      },
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: stats,
      }),
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error al obtener estadísticas del dashboard',
        message: error.message,
      }),
    }
  }
}
