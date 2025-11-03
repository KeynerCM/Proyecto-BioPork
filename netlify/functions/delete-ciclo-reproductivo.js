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
    const id = event.queryStringParameters?.id
    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'ID es requerido' }),
      }
    }

    const sql = neon(process.env.NETLIFY_DATABASE_URL)
    await sql`DELETE FROM ciclos_reproductivos WHERE id = ${id}`

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true }),
    }
  } catch (error) {
    console.error('Error deleting ciclo reproductivo:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error al eliminar ciclo reproductivo',
        message: error.message,
      }),
    }
  }
}




