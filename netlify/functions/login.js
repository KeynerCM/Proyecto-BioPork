const { neon } = require('@neondatabase/serverless')

exports.handler = async (event, context) => {
  // Solo permitir métodos POST (login)
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    const { username, password } = JSON.parse(event.body)

    if (!username || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Usuario y contraseña son requeridos',
        }),
      }
    }

    // Conectar a Neon
    const sql = neon(process.env.NETLIFY_DATABASE_URL)

    // Buscar usuario (por ahora sin encriptar password)
    const result = await sql`
      SELECT 
        id,
        username,
        nombre,
        email,
        rol,
        activo
      FROM usuarios
      WHERE username = ${username} 
        AND password = ${password}
        AND activo = true
    `

    if (result.length === 0) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          success: false,
          error: 'Usuario o contraseña incorrectos',
        }),
      }
    }

    const user = result[0]

    // Actualizar último acceso
    await sql`
      UPDATE usuarios 
      SET ultimo_acceso = CURRENT_TIMESTAMP 
      WHERE id = ${user.id}
    `

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol,
        },
        message: 'Login exitoso',
      }),
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Error al iniciar sesión',
        message: error.message,
      }),
    }
  }
}
