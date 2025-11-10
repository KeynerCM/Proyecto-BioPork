const { neon } = require('@neondatabase/serverless')

async function testConnection() {
  try {
    const DATABASE_URL = 'postgresql://neondb_owner:npg_xFHT0oRpj1fI@ep-purple-sun-aecgxezb-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require'
    
    console.log('🔌 Conectando a Neon PostgreSQL...')
    const sql = neon(DATABASE_URL)
    
    // Probar conexión
    console.log('\n📊 Verificando tablas...')
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    console.log('Tablas encontradas:', tables.map(t => t.table_name))
    
    // Verificar usuarios
    console.log('\n👤 Verificando usuarios...')
    const usuarios = await sql`
      SELECT id, username, nombre, email, rol, activo, ultimo_acceso
      FROM usuarios
      ORDER BY id
    `
    console.log(`Total usuarios: ${usuarios.length}`)
    usuarios.forEach(u => {
      console.log(`  - ID: ${u.id}, User: ${u.username}, Nombre: ${u.nombre}, Rol: ${u.rol}, Activo: ${u.activo}`)
    })
    
    // Verificar animales
    console.log('\n🐷 Verificando animales...')
    const animales = await sql`
      SELECT id, codigo, tipo, raza, sexo, estado
      FROM animales
      ORDER BY id
    `
    console.log(`Total animales: ${animales.length}`)
    animales.forEach(a => {
      console.log(`  - ID: ${a.id}, Código: ${a.codigo}, Tipo: ${a.tipo}, Raza: ${a.raza}, Sexo: ${a.sexo}, Estado: ${a.estado}`)
    })
    
    // Verificar vacunaciones
    console.log('\n💉 Verificando vacunaciones...')
    const vacunaciones = await sql`
      SELECT COUNT(*) as total FROM vacunaciones
    `
    console.log(`Total vacunaciones: ${vacunaciones[0].total}`)
    
    // Verificar enfermedades
    console.log('\n🏥 Verificando enfermedades...')
    const enfermedades = await sql`
      SELECT COUNT(*) as total FROM enfermedades
    `
    console.log(`Total enfermedades: ${enfermedades[0].total}`)
    
    // Verificar ciclos reproductivos
    console.log('\n🔄 Verificando ciclos reproductivos...')
    const ciclos = await sql`
      SELECT COUNT(*) as total FROM ciclos_reproductivos
    `
    console.log(`Total ciclos: ${ciclos[0].total}`)
    
    // Verificar partos
    console.log('\n👶 Verificando partos...')
    const partos = await sql`
      SELECT COUNT(*) as total FROM partos
    `
    console.log(`Total partos: ${partos[0].total}`)
    
    console.log('\n✅ Conexión exitosa!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('Detalles:', error)
  }
}

testConnection()
