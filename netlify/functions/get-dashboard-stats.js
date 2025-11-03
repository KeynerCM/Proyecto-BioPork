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

    // Inicializar resultados con valores por defecto
    let animalesStats = [{ total_animales: 0, animales_activos: 0, animales_engorde: 0, animales_reproduccion: 0, cerdas_reproductoras: 0, peso_promedio: 0 }]
    let gruposStats = [{ total_grupos: 0, grupos_activos: 0, total_animales_en_grupos: 0, capacidad_total: 0, ocupacion_promedio: 0 }]
    let vacunacionesMes = [{ vacunaciones_mes: 0 }]
    let enfermedadesMes = [{ enfermedades_mes: 0 }]
    let tratamientosActivos = [{ tratamientos_activos: 0 }]
    let ciclosActivos = [{ ciclos_activos: 0 }]
    let partosMes = [{ partos_mes: 0 }]
    let lechonesNacidos = [{ lechones_nacidos_mes: 0 }]
    let proximosPartos = [{ partos_proximos: 0 }]
    let vacunacionesPendientes = [{ vacunaciones_pendientes: 0 }]

    // Obtener estadísticas de animales
    try {
      animalesStats = await sql`
        SELECT
          COUNT(*) as total_animales,
          COUNT(CASE WHEN estado = 'activo' THEN 1 END) as animales_activos,
          COUNT(CASE WHEN tipo = 'engorde' THEN 1 END) as animales_engorde,
          COUNT(CASE WHEN tipo = 'reproduccion' THEN 1 END) as animales_reproduccion,
          COUNT(CASE WHEN sexo = 'hembra' AND tipo = 'reproduccion' THEN 1 END) as cerdas_reproductoras,
          AVG(CASE WHEN peso_actual IS NOT NULL THEN peso_actual END) as peso_promedio
        FROM animales
      `
    } catch (error) {
      console.error('Error obteniendo animalesStats:', error.message)
    }

    // Obtener estadísticas de grupos
    try {
      gruposStats = await sql`
        SELECT
          COUNT(*) as total_grupos,
          COUNT(CASE WHEN activo = true THEN 1 END) as grupos_activos,
          COALESCE(SUM(cantidad_actual), 0) as total_animales_en_grupos,
          COALESCE(SUM(capacidad), 0) as capacidad_total,
          AVG(CASE WHEN capacidad > 0 THEN (cantidad_actual::float / capacidad * 100) ELSE 0 END) as ocupacion_promedio
        FROM grupos
      `
    } catch (error) {
      console.error('Error obteniendo gruposStats:', error.message)
    }

    // Obtener estadísticas de salud (últimos 30 días)
    try {
      vacunacionesMes = await sql`
        SELECT COUNT(*) as vacunaciones_mes
        FROM vacunaciones 
        WHERE fecha_aplicacion >= CURRENT_DATE - INTERVAL '30 days'
      `
    } catch (error) {
      console.error('Error obteniendo vacunacionesMes:', error.message)
    }
    
    try {
      enfermedadesMes = await sql`
        SELECT COUNT(*) as enfermedades_mes
        FROM enfermedades 
        WHERE fecha_deteccion >= CURRENT_DATE - INTERVAL '30 days'
      `
    } catch (error) {
      console.error('Error obteniendo enfermedadesMes:', error.message)
    }
    
    try {
      tratamientosActivos = await sql`
        SELECT COUNT(*) as tratamientos_activos
        FROM enfermedades 
        WHERE estado = 'en_tratamiento'
      `
    } catch (error) {
      console.error('Error obteniendo tratamientosActivos:', error.message)
    }

    // Obtener estadísticas de reproducción
    try {
      ciclosActivos = await sql`
        SELECT COUNT(*) as ciclos_activos
        FROM ciclos_reproductivos 
        WHERE estado = 'activo'
      `
    } catch (error) {
      console.error('Error obteniendo ciclosActivos:', error.message)
    }
    
    try {
      partosMes = await sql`
        SELECT COUNT(*) as partos_mes
        FROM partos 
        WHERE fecha_parto >= CURRENT_DATE - INTERVAL '30 days'
      `
    } catch (error) {
      console.error('Error obteniendo partosMes:', error.message)
    }
    
    try {
      lechonesNacidos = await sql`
        SELECT COALESCE(SUM(lechones_nacidos_vivos), 0) as lechones_nacidos_mes
        FROM partos 
        WHERE fecha_parto >= CURRENT_DATE - INTERVAL '30 days'
      `
    } catch (error) {
      console.error('Error obteniendo lechonesNacidos:', error.message)
    }

    // Próximos partos (próximos 7 días)
    try {
      proximosPartos = await sql`
        SELECT COUNT(*) as partos_proximos
        FROM ciclos_reproductivos
        WHERE estado = 'activo'
        AND fecha_parto_estimada BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
      `
    } catch (error) {
      console.error('Error obteniendo proximosPartos:', error.message)
    }

    // Vacunaciones pendientes (próximos 7 días)
    try {
      vacunacionesPendientes = await sql`
        SELECT COUNT(*) as vacunaciones_pendientes
        FROM vacunaciones
        WHERE fecha_proxima_dosis BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
      `
    } catch (error) {
      console.error('Error obteniendo vacunacionesPendientes:', error.message)
    }

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
        vacunaciones_mes: parseInt(vacunacionesMes[0]?.vacunaciones_mes || 0),
        enfermedades_mes: parseInt(enfermedadesMes[0]?.enfermedades_mes || 0),
        tratamientos_activos: parseInt(tratamientosActivos[0]?.tratamientos_activos || 0),
      },
      reproduccion: {
        ciclos_activos: parseInt(ciclosActivos[0]?.ciclos_activos || 0),
        partos_mes: parseInt(partosMes[0]?.partos_mes || 0),
        lechones_nacidos_mes: parseInt(lechonesNacidos[0]?.lechones_nacidos_mes || 0),
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
