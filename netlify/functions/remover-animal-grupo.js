const { neon } = require('@neondatabase/serverless')

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'PUT') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method not allowed' }),
    }
  }

  try {
    const data = JSON.parse(event.body)
    const { animal_id, grupo_id, fecha_salida } = data

    if (!animal_id || !grupo_id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Faltan campos requeridos: animal_id, grupo_id',
        }),
      }
    }

    const sql = neon(process.env.NETLIFY_DATABASE_URL)

    // Verificar que existe una asignación activa
    const asignacion = await sql`
      SELECT id FROM animales_grupos
      WHERE animal_id = ${animal_id}
      AND grupo_id = ${grupo_id}
      AND fecha_salida IS NULL
    `

    if (asignacion.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'No se encontró una asignación activa del animal en este grupo',
        }),
      }
    }

    // Actualizar fecha_salida de la asignación
    const result = await sql`
      UPDATE animales_grupos
      SET fecha_salida = ${fecha_salida || new Date().toISOString()}
      WHERE id = ${asignacion[0].id}
      RETURNING *
    `

    // Decrementar cantidad_actual del grupo
    await sql`
      UPDATE grupos
      SET cantidad_actual = GREATEST(cantidad_actual - 1, 0)
      WHERE id = ${grupo_id}
    `

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: result[0],
        message: 'Animal removido del grupo exitosamente',
      }),
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error al remover animal del grupo',
        message: error.message,
      }),
    }
  }
}
