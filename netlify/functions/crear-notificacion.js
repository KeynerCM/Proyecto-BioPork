const { neon } = require('@neondatabase/serverless')

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método no permitido' })
    }
  }

  try {
    const { titulo, mensaje, tipo, prioridad, animal_id } = JSON.parse(event.body)
    
    // Validaciones
    if (!titulo || !mensaje || !tipo || !prioridad) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Faltan campos requeridos: titulo, mensaje, tipo, prioridad'
        })
      }
    }

    // Validar tipo
    const tiposValidos = ['vacunacion', 'reproduccion', 'salud', 'grupo', 'general']
    if (!tiposValidos.includes(tipo)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Tipo inválido. Valores permitidos: ' + tiposValidos.join(', ')
        })
      }
    }

    // Validar prioridad
    const prioridadesValidas = ['urgente', 'alta', 'media', 'baja']
    if (!prioridadesValidas.includes(prioridad)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Prioridad inválida. Valores permitidos: ' + prioridadesValidas.join(', ')
        })
      }
    }

    const sql = neon(process.env.DATABASE_URL)
    
    const result = await sql`
      INSERT INTO notificaciones (
        titulo,
        mensaje,
        tipo,
        prioridad,
        animal_id,
        leida,
        fecha_creacion
      ) VALUES (
        ${titulo},
        ${mensaje},
        ${tipo},
        ${prioridad},
        ${animal_id || null},
        false,
        NOW() AT TIME ZONE 'America/Costa_Rica'
      )
      RETURNING *
    `

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Notificación creada correctamente',
        data: result[0]
      })
    }
  } catch (error) {
    console.error('Error al crear notificación:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Error al crear notificación',
        details: error.message
      })
    }
  }
}
