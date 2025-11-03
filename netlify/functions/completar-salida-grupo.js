const { neon } = require('@neondatabase/serverless')

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method not allowed' }),
    }
  }

  try {
    const { id, tipo } = JSON.parse(event.body)
    // tipo puede ser: 'total' o 'parcial'

    if (!id || !tipo) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Se requiere el ID del grupo y el tipo de salida (total o parcial)',
        }),
      }
    }

    const sql = neon(process.env.NETLIFY_DATABASE_URL)

    // Obtener el grupo actual
    const grupo = await sql`
      SELECT * FROM grupos WHERE id = ${id}
    `

    if (grupo.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Grupo no encontrado',
        }),
      }
    }

    const grupoActual = grupo[0]

    // Validar que el grupo esté en estado 'en_proceso_salida'
    if (grupoActual.estado !== 'en_proceso_salida') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'El grupo debe estar en proceso de salida',
        }),
      }
    }

    let resultado

    if (tipo === 'total') {
      // Salida total: cerrar el grupo
      resultado = await sql`
        UPDATE grupos
        SET 
          estado = 'cerrado',
          activo = false,
          cantidad_actual = 0
        WHERE id = ${id}
        RETURNING *
      `

      // Marcar todos los animales del grupo como salidos
      await sql`
        UPDATE animales_grupos
        SET fecha_salida = CURRENT_DATE
        WHERE grupo_id = ${id} AND fecha_salida IS NULL
      `

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: resultado[0],
          message: 'Grupo cerrado exitosamente. Salida total completada.',
        }),
      }
    } else if (tipo === 'parcial') {
      // Salida parcial: verificar si quedan animales
      const cantidad = parseInt(grupoActual.cantidad_actual) || 0

      if (cantidad === 0) {
        // Si no quedan animales, cerrar el grupo
        resultado = await sql`
          UPDATE grupos
          SET 
            estado = 'cerrado',
            activo = false
          WHERE id = ${id}
          RETURNING *
        `

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            data: resultado[0],
            message: 'Grupo cerrado. No quedan animales.',
          }),
        }
      } else {
        // Si quedan animales, volver a estado según capacidad
        const capacidad = parseInt(grupoActual.capacidad) || 0
        const nuevoEstado = cantidad >= capacidad ? 'completo' : 'incompleto'

        resultado = await sql`
          UPDATE grupos
          SET estado = ${nuevoEstado}
          WHERE id = ${id}
          RETURNING *
        `

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            data: resultado[0],
            message: `Salida parcial completada. El grupo vuelve a estado ${nuevoEstado}.`,
          }),
        }
      }
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Tipo de salida inválido. Use "total" o "parcial"',
        }),
      }
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error al completar salida',
        message: error.message,
      }),
    }
  }
}
