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

    const alertas = []

    // 1. Partos próximos (próximos 7 días)
    const partosProximos = await sql`
      SELECT 
        'parto' as tipo,
        'warning' as severidad,
        'Parto próximo' as titulo,
        'Cerda ' || a.codigo || ' tiene parto estimado para ' || TO_CHAR(cr.fecha_parto_estimada, 'DD/MM/YYYY') as mensaje,
        cr.fecha_parto_estimada as fecha,
        a.id as animal_id,
        cr.id as relacionado_id
      FROM ciclos_reproductivos cr
      JOIN animales a ON cr.cerda_id = a.id
      WHERE cr.estado = 'activo'
      AND cr.fecha_parto_estimada BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
      ORDER BY cr.fecha_parto_estimada ASC
    `
    alertas.push(...partosProximos)

    // 2. Vacunaciones pendientes (próximos 7 días)
    const vacunacionesPendientes = await sql`
      SELECT 
        'vacunacion' as tipo,
        'info' as severidad,
        'Vacunación próxima' as titulo,
        'Animal ' || a.codigo || ' requiere ' || v.vacuna || ' el ' || TO_CHAR(v.fecha_proxima_dosis, 'DD/MM/YYYY') as mensaje,
        v.fecha_proxima_dosis as fecha,
        a.id as animal_id,
        v.id as relacionado_id
      FROM vacunaciones v
      JOIN animales a ON v.animal_id = a.id
      WHERE v.fecha_proxima_dosis BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
      ORDER BY v.fecha_proxima_dosis ASC
    `
    alertas.push(...vacunacionesPendientes)

    // 3. Tratamientos activos que requieren atención
    const tratamientosActivos = await sql`
      SELECT 
        'tratamiento' as tipo,
        'danger' as severidad,
        'Tratamiento en curso' as titulo,
        'Animal ' || a.codigo || ' - ' || e.nombre || ' (' || e.estado || ')' as mensaje,
        e.fecha_deteccion as fecha,
        a.id as animal_id,
        e.id as relacionado_id
      FROM enfermedades e
      JOIN animales a ON e.animal_id = a.id
      WHERE e.estado = 'en_tratamiento'
      ORDER BY e.fecha_deteccion DESC
      LIMIT 5
    `
    alertas.push(...tratamientosActivos)

    // 4. Grupos cercanos a capacidad máxima (>= 90%)
    const gruposLlenos = await sql`
      SELECT 
        'grupo' as tipo,
        'warning' as severidad,
        'Grupo casi lleno' as titulo,
        'Grupo ' || codigo || ' al ' || ROUND((cantidad_actual::float / capacidad * 100), 0) || '% de capacidad (' || cantidad_actual || '/' || capacidad || ')' as mensaje,
        fecha_creacion as fecha,
        null as animal_id,
        id as relacionado_id
      FROM grupos
      WHERE activo = true
      AND capacidad > 0
      AND (cantidad_actual::float / capacidad) >= 0.9
      ORDER BY (cantidad_actual::float / capacidad) DESC
    `
    alertas.push(...gruposLlenos)

    // 5. Ciclos reproductivos que llevan mucho tiempo activos (>150 días)
    const ciclosLargos = await sql`
      SELECT 
        'reproduccion' as tipo,
        'info' as severidad,
        'Ciclo reproductivo prolongado' as titulo,
        'Cerda ' || a.codigo || ' lleva ' || (CURRENT_DATE - cr.fecha_servicio) || ' días en ciclo' as mensaje,
        cr.fecha_servicio as fecha,
        a.id as animal_id,
        cr.id as relacionado_id
      FROM ciclos_reproductivos cr
      JOIN animales a ON cr.cerda_id = a.id
      WHERE cr.estado = 'activo'
      AND (CURRENT_DATE - cr.fecha_servicio) > 150
      ORDER BY cr.fecha_servicio ASC
      LIMIT 3
    `
    alertas.push(...ciclosLargos)

    // Ordenar alertas por severidad y fecha
    const ordenSeveridad = { danger: 1, warning: 2, info: 3 }
    alertas.sort((a, b) => {
      const sevA = ordenSeveridad[a.severidad] || 99
      const sevB = ordenSeveridad[b.severidad] || 99
      if (sevA !== sevB) return sevA - sevB
      return new Date(b.fecha) - new Date(a.fecha)
    })

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: alertas,
        count: alertas.length,
        summary: {
          danger: alertas.filter(a => a.severidad === 'danger').length,
          warning: alertas.filter(a => a.severidad === 'warning').length,
          info: alertas.filter(a => a.severidad === 'info').length,
        },
      }),
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error al obtener alertas',
        message: error.message,
      }),
    }
  }
}
