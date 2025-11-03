const { neon } = require('@neondatabase/serverless')

async function checkTables() {
  try {
    const sql = neon('postgresql://neondb_owner:npg_xFHT0oRpj1fI@ep-purple-sun-aecgxezb-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require')

    console.log('🔍 Verificando estructura de tablas para Grupos...\n')

    // Verificar tabla grupos
    console.log('📋 TABLA: grupos')
    const grupos = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'grupos'
      ORDER BY ordinal_position
    `
    console.table(grupos)

    // Verificar tabla animales_grupos
    console.log('\n📋 TABLA: animales_grupos')
    const animales_grupos = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'animales_grupos'
      ORDER BY ordinal_position
    `
    console.table(animales_grupos)

    // Ver si hay datos
    console.log('\n📊 Datos actuales:')
    const gruposCount = await sql`SELECT COUNT(*) as total FROM grupos`
    console.log(`- Grupos registrados: ${gruposCount[0].total}`)
    
    const asignacionesCount = await sql`SELECT COUNT(*) as total FROM animales_grupos`
    console.log(`- Asignaciones registradas: ${asignacionesCount[0].total}`)

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

checkTables()
