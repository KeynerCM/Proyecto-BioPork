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
    const { codigo, tipo, raza, fecha_nacimiento, peso_inicial, peso_actual, sexo, estado, grupo_id } = data

    console.log('📥 Datos recibidos para crear animal:', data)

    // Validaciones básicas
    if (!codigo || !tipo || !fecha_nacimiento || !sexo) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Faltan campos requeridos: codigo, tipo, fecha_nacimiento, sexo',
        }),
      }
    }

    // Conectar a Neon usando la variable de entorno
    const sql = neon(process.env.NETLIFY_DATABASE_URL)

    const result = await sql`
      INSERT INTO animales (
        codigo, 
        tipo, 
        raza, 
        fecha_nacimiento, 
        peso_inicial, 
        peso_actual,
        sexo,
        estado,
        grupo_id
      )
      VALUES (
        ${codigo}, 
        ${tipo}, 
        ${raza || null}, 
        ${fecha_nacimiento}, 
        ${peso_inicial || null}, 
        ${peso_actual || null},
        ${sexo},
        ${estado || 'activo'},
        ${grupo_id || null}
      )
      RETURNING *
    `

    console.log('✅ Animal creado en BD:', result[0])

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        data: result[0],
        message: 'Animal registrado exitosamente',
      }),
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Error al registrar animal',
        message: error.message,
      }),
    }
  }
}
