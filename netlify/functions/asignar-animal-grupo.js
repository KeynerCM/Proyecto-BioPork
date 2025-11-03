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
    const { animal_id, grupo_id, fecha_ingreso } = data

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

    // Verificar que el animal existe
    const animal = await sql`
      SELECT id, tipo FROM animales WHERE id = ${animal_id}
    `

    if (animal.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Animal no encontrado',
        }),
      }
    }

    // Verificar que el grupo existe y obtener sus datos
    const grupo = await sql`
      SELECT id, tipo, capacidad, cantidad_actual FROM grupos
      WHERE id = ${grupo_id} AND activo = true
    `

    if (grupo.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Grupo no encontrado o inactivo',
        }),
      }
    }

    // Verificar compatibilidad de tipos
    if (animal[0].tipo !== grupo[0].tipo) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Tipo de animal no compatible con tipo de grupo',
          message: `Animal tipo "${animal[0].tipo}" no puede asignarse a grupo tipo "${grupo[0].tipo}"`,
        }),
      }
    }

    // Verificar capacidad del grupo
    if (grupo[0].cantidad_actual >= grupo[0].capacidad) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Grupo ha alcanzado su capacidad máxima',
          message: `Capacidad: ${grupo[0].cantidad_actual}/${grupo[0].capacidad}`,
        }),
      }
    }

    // Verificar que el animal no esté ya asignado activamente a un grupo
    const asignacionActual = await sql`
      SELECT id FROM animales_grupos
      WHERE animal_id = ${animal_id}
      AND fecha_salida IS NULL
    `

    if (asignacionActual.length > 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Animal ya está asignado a un grupo activo',
          message: 'Primero remueva el animal de su grupo actual',
        }),
      }
    }

    // Asignar animal al grupo
    const asignacion = await sql`
      INSERT INTO animales_grupos (animal_id, grupo_id, fecha_ingreso)
      VALUES (${animal_id}, ${grupo_id}, ${fecha_ingreso || new Date().toISOString()})
      RETURNING *
    `

    // Actualizar cantidad_actual del grupo
    await sql`
      UPDATE grupos
      SET cantidad_actual = cantidad_actual + 1
      WHERE id = ${grupo_id}
    `

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        data: asignacion[0],
        message: 'Animal asignado al grupo exitosamente',
      }),
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error al asignar animal al grupo',
        message: error.message,
      }),
    }
  }
}
