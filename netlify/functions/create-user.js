const { neon } = require('@neondatabase/serverless')

exports.handler = async (event, context) => {
  // Solo permitir métodos POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    const data = JSON.parse(event.body)
    const { username, password, nombre, email, rol } = data

    // Validaciones
    if (!username || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Usuario y contraseña son requeridos',
        }),
      }
    }

    if (!['admin', 'operario', 'consultor'].includes(rol)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Rol inválido. Debe ser: admin, operario o consultor',
        }),
      }
    }

    // Conectar a Neon
    const sql = neon(process.env.NETLIFY_DATABASE_URL)

    // Verificar si el usuario ya existe
    const existing = await sql`
      SELECT id FROM usuarios WHERE username = ${username}
    `

    if (existing.length > 0) {
      return {
        statusCode: 409,
        body: JSON.stringify({
          success: false,
          error: 'El nombre de usuario ya está en uso',
        }),
      }
    }

    // Crear usuario (sin encriptar por ahora)
    const result = await sql`
      INSERT INTO usuarios (username, password, nombre, email, rol)
      VALUES (${username}, ${password}, ${nombre}, ${email}, ${rol})
      RETURNING id, username, nombre, email, rol, activo, fecha_registro
    `

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        data: result[0],
        message: 'Usuario creado exitosamente',
      }),
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Error al crear usuario',
        message: error.message,
      }),
    }
  }
}
