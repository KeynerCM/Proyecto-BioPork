const { neon } = require('@neondatabase/serverless')

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}

/**
 * Calcula el estado del grupo según la lógica del diagrama UML
 * Estados: en_creacion, incompleto, completo, programado_salida, en_proceso_salida, cerrado, inactivo
 */
const calcularEstadoGrupo = (grupo) => {
  // Si está marcado como inactivo
  if (!grupo.activo) {
    return 'inactivo'
  }

  // Si el estado es cerrado, mantenerlo
  if (grupo.estado === 'cerrado') {
    return 'cerrado'
  }

  // Si está en proceso de salida, mantenerlo
  if (grupo.estado === 'en_proceso_salida') {
    return 'en_proceso_salida'
  }

  const cantidad = parseInt(grupo.cantidad_actual) || 0
  const capacidad = parseInt(grupo.capacidad) || 0

  // Calcular días restantes hasta la fecha de salida
  let diasRestantes = null
  if (grupo.fecha_salida_programada) {
    const hoy = new Date()
    const fechaSalida = new Date(grupo.fecha_salida_programada)
    diasRestantes = Math.ceil((fechaSalida - hoy) / (1000 * 60 * 60 * 24))
  }

  // Programado para salida (fecha de salida <= 7 días)
  if (diasRestantes !== null && diasRestantes <= 7 && diasRestantes >= 0 && cantidad > 0) {
    return 'programado_salida'
  }

  // Completo (animales = capacidad)
  if (cantidad >= capacidad && cantidad > 0) {
    return 'completo'
  }

  // Incompleto (animales > 0 pero < capacidad)
  if (cantidad > 0 && cantidad < capacidad) {
    return 'incompleto'
  }

  // En creación (sin animales)
  return 'en_creacion'
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

    const grupos = await sql`
      SELECT 
        g.*,
        COUNT(ag.animal_id) as animales_count
      FROM grupos g
      LEFT JOIN animales_grupos ag ON g.id = ag.grupo_id AND ag.fecha_salida IS NULL
      GROUP BY g.id
      ORDER BY g.fecha_creacion DESC
    `

    // Calcular el estado dinámico de cada grupo
    const gruposConEstado = grupos.map(grupo => ({
      ...grupo,
      estado_calculado: calcularEstadoGrupo(grupo),
      dias_hasta_salida: grupo.fecha_salida_programada 
        ? Math.ceil((new Date(grupo.fecha_salida_programada) - new Date()) / (1000 * 60 * 60 * 24))
        : null
    }))

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, data: gruposConEstado }),
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error al obtener grupos',
        message: error.message,
      }),
    }
  }
}
