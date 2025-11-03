import axios from 'axios'

const API_BASE_URL = '/.netlify/functions'

// Configuración de axios con timeout y manejo de errores
const axiosConfig = {
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
}

// Función helper para manejar errores
const handleError = (error, operacion) => {
  console.error(`❌ Error en ${operacion}:`, error)
  
  if (error.response) {
    throw new Error(error.response.data?.error || error.response.data?.message || `Error en ${operacion}`)
  } else if (error.request) {
    throw new Error(`No se recibió respuesta del servidor en ${operacion}`)
  } else {
    throw new Error(`Error al realizar ${operacion}: ${error.message}`)
  }
}

/**
 * Obtener estadísticas generales del dashboard
 */
export const getDashboardStats = async () => {
  try {
    console.log('📊 Obteniendo estadísticas del dashboard...')
    const response = await axios.get(`${API_BASE_URL}/get-dashboard-stats`, axiosConfig)
    
    if (response.data?.success && response.data?.data) {
      console.log('✅ Estadísticas obtenidas')
      return response.data.data
    }
    
    throw new Error('Respuesta inválida del servidor')
  } catch (error) {
    handleError(error, 'getDashboardStats')
  }
}

/**
 * Obtener actividades recientes
 */
export const getRecentActivities = async (limit = 10) => {
  try {
    console.log(`📋 Obteniendo últimas ${limit} actividades...`)
    const response = await axios.get(
      `${API_BASE_URL}/get-recent-activities?limit=${limit}`,
      axiosConfig
    )
    
    if (response.data?.success && Array.isArray(response.data?.data)) {
      console.log(`✅ ${response.data.count} actividades obtenidas`)
      return response.data.data
    }
    
    throw new Error('Respuesta inválida del servidor')
  } catch (error) {
    handleError(error, 'getRecentActivities')
  }
}

/**
 * Obtener alertas y notificaciones
 */
export const getAlerts = async () => {
  try {
    console.log('🔔 Obteniendo alertas...')
    const response = await axios.get(`${API_BASE_URL}/get-alerts`, axiosConfig)
    
    if (response.data?.success && Array.isArray(response.data?.data)) {
      console.log(`✅ ${response.data.count} alertas obtenidas`)
      return {
        alertas: response.data.data,
        summary: response.data.summary,
      }
    }
    
    throw new Error('Respuesta inválida del servidor')
  } catch (error) {
    handleError(error, 'getAlerts')
  }
}

/**
 * Formatear fecha en español
 */
export const formatearFecha = (fecha) => {
  if (!fecha) return 'No especificada'
  
  try {
    const date = new Date(fecha)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return 'Fecha inválida'
  }
}

/**
 * Formatear fecha con hora
 */
export const formatearFechaHora = (fecha) => {
  if (!fecha) return 'No especificada'
  
  try {
    const date = new Date(fecha)
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return 'Fecha inválida'
  }
}

/**
 * Obtener tiempo relativo (hace 2 días, hace 3 horas, etc.)
 */
export const getTiempoRelativo = (fecha) => {
  if (!fecha) return 'Fecha desconocida'
  
  try {
    const ahora = new Date()
    const fechaObj = new Date(fecha)
    const diffMs = ahora - fechaObj
    const diffSeg = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSeg / 60)
    const diffHoras = Math.floor(diffMin / 60)
    const diffDias = Math.floor(diffHoras / 24)

    if (diffDias > 30) {
      return formatearFecha(fecha)
    } else if (diffDias > 0) {
      return `Hace ${diffDias} día${diffDias > 1 ? 's' : ''}`
    } else if (diffHoras > 0) {
      return `Hace ${diffHoras} hora${diffHoras > 1 ? 's' : ''}`
    } else if (diffMin > 0) {
      return `Hace ${diffMin} minuto${diffMin > 1 ? 's' : ''}`
    } else {
      return 'Hace un momento'
    }
  } catch {
    return 'Fecha inválida'
  }
}

/**
 * Obtener icono según tipo de actividad
 */
export const getIconoActividad = (tipo) => {
  const iconos = {
    animal: '🐷',
    vacunacion: '💉',
    enfermedad: '🏥',
    parto: '👶',
    grupo: '🏠',
    default: '📋',
  }
  return iconos[tipo] || iconos.default
}

/**
 * Obtener clase de color según tipo de alerta
 */
export const getClaseAlerta = (severidad) => {
  const clases = {
    danger: 'danger',
    warning: 'warning',
    info: 'info',
    success: 'success',
  }
  return clases[severidad] || 'secondary'
}

/**
 * Calcular porcentaje de cambio
 */
export const calcularPorcentajeCambio = (actual, anterior) => {
  if (!anterior || anterior === 0) return 0
  return ((actual - anterior) / anterior * 100).toFixed(1)
}

export default {
  getDashboardStats,
  getRecentActivities,
  getAlerts,
  formatearFecha,
  formatearFechaHora,
  getTiempoRelativo,
  getIconoActividad,
  getClaseAlerta,
  calcularPorcentajeCambio,
}
