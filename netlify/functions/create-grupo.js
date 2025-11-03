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
    const data = JSON.parse(event.body)
    const {
      codigo,
      nombre,
      tipo,
      corral_numero,
      capacidad,
      fecha_creacion,
      fecha_salida_programada,
      notas
    } = data

    // Validaciones básicas
    if (!codigo || !tipo || !capacidad) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Faltan campos requeridos: codigo, tipo, capacidad',
        }),
      }
    }

    // Validar tipo
    if (!['engorde', 'reproduccion'].includes(tipo)) {
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
      INSERT INTO grupos (
        codigo,
        nombre,
        tipo,
        corral_numero,
        capacidad,
        cantidad_actual,
        fecha_creacion,
        fecha_salida_programada,
        peso_promedio,
        activo,
        estado,
        notas
      )
      VALUES (
        ${codigo},
        ${nombre || null},
        ${tipo},
        ${corral_numero || null},
        ${capacidad},
        0,
        ${fecha_creacion || null},
        ${fecha_salida_programada || null},
        0,
        true,
        'en_creacion',
        ${notas || null}
      )
      RETURNING *
    `

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        data: result[0],
        message: 'Grupo registrado exitosamente',
      }),
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error al registrar grupo',
        message: error.message,
      }),
    }
  }
}
