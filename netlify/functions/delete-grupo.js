const { neon } = require('@neondatabase/serverless')

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'DELETE') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method not allowed' }),
    }
  }

  try {
    const { id } = event.queryStringParameters || {}

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

    const sql = neon(process.env.NETLIFY_DATABASE_URL)

    // Verificar si hay animales asignados activamente al grupo
    const animalesActivos = await sql`
      SELECT COUNT(*) as count
      FROM animales_grupos
      WHERE grupo_id = ${id}
      AND fecha_salida IS NULL
    `

    if (parseInt(animalesActivos[0].count) > 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'No se puede eliminar un grupo con animales asignados activamente',
          message: 'Primero remueva todos los animales del grupo',
        }),
      }
    }

    // Soft delete: marcar como inactivo
    const result = await sql`
      UPDATE grupos
      SET activo = false
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
        message: 'Grupo eliminado exitosamente',
      }),
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error al eliminar grupo',
        message: error.message,
      }),
    }
  }
}
