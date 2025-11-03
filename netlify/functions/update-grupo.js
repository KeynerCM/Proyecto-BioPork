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
    const { id } = event.queryStringParameters || {}
    const data = JSON.parse(event.body)
    const {
      nombre,
      tipo,
      corral_numero,
      capacidad,
      fecha_salida_programada,
      notas
    } = data

    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Se requiere el ID del grupo',
        }),
      }
    }

    // Validar tipo si se proporciona
    if (tipo && !['engorde', 'reproduccion'].includes(tipo)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Tipo debe ser "engorde" o "reproduccion"',
        }),
      }
    }

    const sql = neon(process.env.NETLIFY_DATABASE_URL)

    const result = await sql`
      UPDATE grupos
      SET
        nombre = COALESCE(${nombre}, nombre),
        tipo = COALESCE(${tipo}, tipo),
        corral_numero = COALESCE(${corral_numero || null}, corral_numero),
        capacidad = COALESCE(${capacidad || null}, capacidad),
        fecha_salida_programada = COALESCE(${fecha_salida_programada || null}, fecha_salida_programada),
        notas = COALESCE(${notas || null}, notas)
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Grupo no encontrado',
        }),
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: result[0],
        message: 'Grupo actualizado exitosamente',
      }),
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error al actualizar grupo',
        message: error.message,
      }),
    }
  }
}
