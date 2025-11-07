/**
 * Utilidades para manejo de fechas en zona horaria de Costa Rica
 * Zona horaria: America/Costa_Rica (GMT-6)
 */

/**
 * Obtiene la fecha actual en Costa Rica en formato YYYY-MM-DD
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export const getFechaCostaRica = () => {
  const fecha = new Date()
  
  // Convertir a zona horaria de Costa Rica (America/Costa_Rica, GMT-6)
  const fechaCostaRica = new Date(fecha.toLocaleString('en-US', { 
    timeZone: 'America/Costa_Rica' 
  }))
  
  const year = fechaCostaRica.getFullYear()
  const month = String(fechaCostaRica.getMonth() + 1).padStart(2, '0')
  const day = String(fechaCostaRica.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

/**
 * Obtiene la fecha y hora actual en Costa Rica en formato ISO
 * @returns {string} Fecha y hora en formato ISO
 */
export const getFechaHoraCostaRica = () => {
  const fecha = new Date()
  
  // Convertir a zona horaria de Costa Rica
  const fechaCostaRica = new Date(fecha.toLocaleString('en-US', { 
    timeZone: 'America/Costa_Rica' 
  }))
  
  return fechaCostaRica.toISOString()
}

/**
 * Formatea una fecha ISO a formato legible en español (Costa Rica)
 * @param {string} fechaISO - Fecha en formato ISO
 * @returns {string} Fecha formateada
 */
export const formatearFecha = (fechaISO) => {
  if (!fechaISO) return 'N/A'
  
  const fecha = new Date(fechaISO)
  
  return fecha.toLocaleDateString('es-CR', {
    timeZone: 'America/Costa_Rica',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

/**
 * Formatea una fecha ISO a formato completo con hora (Costa Rica)
 * @param {string} fechaISO - Fecha en formato ISO
 * @returns {string} Fecha y hora formateadas
 */
export const formatearFechaHora = (fechaISO) => {
  if (!fechaISO) return 'N/A'
  
  const fecha = new Date(fechaISO)
  
  return fecha.toLocaleString('es-CR', {
    timeZone: 'America/Costa_Rica',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

/**
 * Convierte una fecha del input (YYYY-MM-DD) a ISO con zona horaria de Costa Rica
 * @param {string} fechaInput - Fecha del input en formato YYYY-MM-DD
 * @returns {string} Fecha en formato ISO con zona horaria correcta
 */
export const inputToISOCostaRica = (fechaInput) => {
  if (!fechaInput) return null
  
  // Crear fecha a medianoche en Costa Rica
  const [year, month, day] = fechaInput.split('-')
  const fecha = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), 6, 0, 0))
  
  return fecha.toISOString()
}

/**
 * Convierte una fecha ISO a formato para input type="date" (YYYY-MM-DD)
 * @param {string} fechaISO - Fecha en formato ISO
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export const isoToInputDate = (fechaISO) => {
  if (!fechaISO) return ''
  
  // Extraer solo la parte de fecha
  if (fechaISO.includes('T')) {
    return fechaISO.split('T')[0]
  } else if (fechaISO.includes(' ')) {
    return fechaISO.split(' ')[0]
  }
  
  return fechaISO
}

export default {
  getFechaCostaRica,
  getFechaHoraCostaRica,
  formatearFecha,
  formatearFechaHora,
  inputToISOCostaRica,
  isoToInputDate
}
