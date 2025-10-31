const { neon } = require('@neondatabase/serverless')

exports.handler = async (event, context) => {
  // Solo permitir métodos PUT
  if (event.httpMethod !== 'PUT') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    const { id } = event.queryStringParameters || {}
    
    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Se requiere el ID del usuario',
        }),
      }
    }

    const data = JSON.parse(event.body)
    const { username, password, nombre, email, rol, activo } = data

    // Validar rol
    if (rol && !['admin', 'operario', 'consultor'].includes(rol)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Rol inválido',
        }),
      }
    }

    // Conectar a Neon
    const sql = neon(process.env.NETLIFY_DATABASE_URL)

    // Actualizar usuario
    const result = await sql`
      UPDATE usuarios 
      SET 
        username = ${username},
        password = ${password},
        nombre = ${nombre},
        email = ${email},
        rol = ${rol},
        activo = ${activo}
      WHERE id = ${id}
      RETURNING id, username, nombre, email, rol, activo
    `

    if (result.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          success: false,
          error: 'Usuario no encontrado',
        }),
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        data: result[0],
        message: 'Usuario actualizado exitosamente',
      }),
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Error al actualizar usuario',
        message: error.message,
      }),
    }
  }
}
