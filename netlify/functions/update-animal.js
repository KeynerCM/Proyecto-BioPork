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
          error: 'Se requiere el ID del animal',
        }),
      }
    }

    const data = JSON.parse(event.body)
    const { codigo, tipo, raza, fecha_nacimiento, peso_inicial, peso_actual, sexo, estado, grupo_id } = data

    // Conectar a Neon
    const sql = neon(process.env.NETLIFY_DATABASE_URL)

    // Actualizar animal
    const result = await sql`
      UPDATE animales 
      SET 
        codigo = ${codigo},
        tipo = ${tipo},
        raza = ${raza || null},
        fecha_nacimiento = ${fecha_nacimiento},
        peso_inicial = ${peso_inicial || null},
        peso_actual = ${peso_actual || null},
        sexo = ${sexo},
        estado = ${estado},
        grupo_id = ${grupo_id || null}
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          success: false,
          error: 'Animal no encontrado',
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
        message: 'Animal actualizado exitosamente',
      }),
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Error al actualizar animal',
        message: error.message,
      }),
    }
  }
}
