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
    // El servidor respondió con un código de error
    throw new Error(error.response.data?.error || error.response.data?.message || `Error en ${operacion}`)
  } else if (error.request) {
    // La petición se hizo pero no hubo respuesta
    throw new Error(`No se recibió respuesta del servidor en ${operacion}`)
  } else {
    // Error al configurar la petición
    throw new Error(`Error al realizar ${operacion}: ${error.message}`)
  }
}

// ============================================
// CRUD de Grupos
// ============================================

/**
 * Obtener el siguiente código disponible para un grupo
 */
export const getNextCodigoGrupo = async () => {
  try {
    console.log('🔍 Obteniendo siguiente código de grupo...')
    const response = await axios.get(`${API_BASE_URL}/get-next-codigo-grupo`, axiosConfig)
    
    if (response.data?.success && response.data?.data?.next_codigo) {
      console.log('✅ Código obtenido:', response.data.data.next_codigo)
      return response.data.data.next_codigo
    }
    
    throw new Error('Respuesta inválida del servidor')
  } catch (error) {
    handleError(error, 'getNextCodigoGrupo')
  }
}

/**
 * Obtener todos los grupos
 */
export const getGrupos = async () => {
  try {
    console.log('🔍 Obteniendo lista de grupos...')
    const response = await axios.get(`${API_BASE_URL}/get-grupos`, axiosConfig)
    
    if (response.data?.success && Array.isArray(response.data?.data)) {
      console.log(`✅ ${response.data.data.length} grupos obtenidos`)
      return response.data.data
    }
    
    throw new Error('Respuesta inválida del servidor')
  } catch (error) {
    handleError(error, 'getGrupos')
  }
}

/**
 * Obtener un grupo por ID
 */
export const getGrupoById = async (id) => {
  try {
    console.log(`🔍 Obteniendo grupo ID: ${id}...`)
    const response = await axios.get(
      `${API_BASE_URL}/get-grupo-by-id?id=${id}`,
      axiosConfig
    )
    
    if (response.data?.success && response.data?.data) {
      console.log('✅ Grupo obtenido:', response.data.data.codigo)
      return response.data.data
    }
    
    throw new Error('Respuesta inválida del servidor')
  } catch (error) {
    handleError(error, 'getGrupoById')
  }
}

/**
 * Crear un nuevo grupo
 */
export const createGrupo = async (grupoData) => {
  try {
    console.log('📝 Creando nuevo grupo:', grupoData)
    const response = await axios.post(
      `${API_BASE_URL}/create-grupo`,
      grupoData,
      axiosConfig
    )
    
    if (response.data?.success && response.data?.data) {
      console.log('✅ Grupo creado exitosamente:', response.data.data.codigo)
      return response.data.data
    }
    
    throw new Error('Respuesta inválida del servidor')
  } catch (error) {
    handleError(error, 'createGrupo')
  }
}

/**
 * Actualizar un grupo existente
 */
export const updateGrupo = async (id, grupoData) => {
  try {
    console.log(`📝 Actualizando grupo ID: ${id}`, grupoData)
    const response = await axios.put(
      `${API_BASE_URL}/update-grupo?id=${id}`,
      grupoData,
      axiosConfig
    )
    
    if (response.data?.success && response.data?.data) {
      console.log('✅ Grupo actualizado exitosamente:', response.data.data.codigo)
      return response.data.data
    }
    
    throw new Error('Respuesta inválida del servidor')
  } catch (error) {
    handleError(error, 'updateGrupo')
  }
}

/**
 * Eliminar un grupo (soft delete)
 */
export const deleteGrupo = async (id) => {
  try {
    console.log(`🗑️ Eliminando grupo ID: ${id}...`)
    const response = await axios.delete(
      `${API_BASE_URL}/delete-grupo?id=${id}`,
      axiosConfig
    )
    
    if (response.data?.success) {
      console.log('✅ Grupo eliminado exitosamente')
      return response.data
    }
    
    throw new Error('Respuesta inválida del servidor')
  } catch (error) {
    handleError(error, 'deleteGrupo')
  }
}

// ============================================
// Gestión de Animales en Grupos
// ============================================

/**
 * Obtener animales de un grupo
 */
export const getAnimalesByGrupo = async (grupoId, incluirHistoricos = false) => {
  try {
    console.log(`🔍 Obteniendo animales del grupo ID: ${grupoId}...`)
    const response = await axios.get(
      `${API_BASE_URL}/get-animales-by-grupo?grupo_id=${grupoId}&incluir_historicos=${incluirHistoricos}`,
      axiosConfig
    )
    
    if (response.data?.success && Array.isArray(response.data?.data)) {
      console.log(`✅ ${response.data.count} animales obtenidos`)
      return response.data.data
    }
    
    throw new Error('Respuesta inválida del servidor')
  } catch (error) {
    handleError(error, 'getAnimalesByGrupo')
  }
}

/**
 * Asignar un animal a un grupo
 */
export const asignarAnimalGrupo = async (animalId, grupoId, fechaIngreso = null) => {
  try {
    console.log(`📝 Asignando animal ${animalId} al grupo ${grupoId}...`)
    const response = await axios.post(
      `${API_BASE_URL}/asignar-animal-grupo`,
      {
        animal_id: animalId,
        grupo_id: grupoId,
        fecha_ingreso: fechaIngreso || new Date().toISOString(),
      },
      axiosConfig
    )
    
    if (response.data?.success && response.data?.data) {
      console.log('✅ Animal asignado exitosamente')
      return response.data.data
    }
    
    throw new Error('Respuesta inválida del servidor')
  } catch (error) {
    handleError(error, 'asignarAnimalGrupo')
  }
}

/**
 * Remover un animal de un grupo
 */
export const removerAnimalGrupo = async (animalId, grupoId, fechaSalida = null) => {
  try {
    console.log(`📝 Removiendo animal ${animalId} del grupo ${grupoId}...`)
    const response = await axios.put(
      `${API_BASE_URL}/remover-animal-grupo`,
      {
        animal_id: animalId,
        grupo_id: grupoId,
        fecha_salida: fechaSalida || new Date().toISOString(),
      },
      axiosConfig
    )
    
    if (response.data?.success && response.data?.data) {
      console.log('✅ Animal removido exitosamente')
      return response.data.data
    }
    
    throw new Error('Respuesta inválida del servidor')
  } catch (error) {
    handleError(error, 'removerAnimalGrupo')
  }
}

// ============================================
// Funciones Auxiliares
// ============================================

/**
 * Calcular el porcentaje de ocupación de un grupo
 */
export const calcularOcupacion = (cantidadActual, capacidad) => {
  if (!capacidad || capacidad === 0) return 0
  return Math.round((cantidadActual / capacidad) * 100)
}

/**
 * Determinar el estado del grupo según su ocupación
 */
export const getEstadoOcupacion = (cantidadActual, capacidad) => {
  const porcentaje = calcularOcupacion(cantidadActual, capacidad)
  
  if (porcentaje >= 100) return { label: 'Lleno', color: 'danger' }
  if (porcentaje >= 80) return { label: 'Casi lleno', color: 'warning' }
  if (porcentaje >= 50) return { label: 'Medio', color: 'info' }
  if (porcentaje > 0) return { label: 'Disponible', color: 'success' }
  return { label: 'Vacío', color: 'secondary' }
}

/**
 * Formatear fecha para mostrar
 */
export const formatearFecha = (fecha) => {
  if (!fecha) return 'No especificada'
  
  try {
    const date = new Date(fecha)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return 'Fecha inválida'
  }
}

/**
 * Validar si un grupo puede recibir más animales
 */
export const puedeAsignarAnimal = (grupo) => {
  return grupo.activo && grupo.cantidad_actual < grupo.capacidad
}

// ============================================
// Gestión de Estados del Grupo (según diagrama UML)
// ============================================

/**
 * Confirmar grupo (transición de en_creacion a incompleto/completo)
 */
export const confirmarGrupo = async (id) => {
  try {
    console.log(`📝 Confirmando grupo ID: ${id}...`)
    const response = await axios.post(
      `${API_BASE_URL}/confirmar-grupo`,
      { id },
      axiosConfig
    )
    
    if (response.data?.success) {
      console.log('✅ Grupo confirmado:', response.data.message)
      if (response.data.notificacion) {
        console.log(`🔔 Notificación: ${response.data.notificacion}`)
      }
      return response.data
    }
    
    throw new Error('Respuesta inválida del servidor')
  } catch (error) {
    handleError(error, 'confirmarGrupo')
  }
}

/**
 * Iniciar proceso de salida del grupo
 */
export const iniciarSalidaGrupo = async (id) => {
  try {
    console.log(`🚪 Iniciando salida de grupo ID: ${id}...`)
    const response = await axios.post(
      `${API_BASE_URL}/iniciar-salida-grupo`,
      { id },
      axiosConfig
    )
    
    if (response.data?.success) {
      console.log('✅ Proceso de salida iniciado')
      return response.data
    }
    
    throw new Error('Respuesta inválida del servidor')
  } catch (error) {
    handleError(error, 'iniciarSalidaGrupo')
  }
}

/**
 * Completar salida del grupo (total o parcial)
 */
export const completarSalidaGrupo = async (id, tipo = 'total') => {
  try {
    console.log(`✅ Completando salida ${tipo} de grupo ID: ${id}...`)
    const response = await axios.post(
      `${API_BASE_URL}/completar-salida-grupo`,
      { id, tipo },
      axiosConfig
    )
    
    if (response.data?.success) {
      console.log('✅ Salida completada:', response.data.message)
      return response.data
    }
    
    throw new Error('Respuesta inválida del servidor')
  } catch (error) {
    handleError(error, 'completarSalidaGrupo')
  }
}

/**
 * Obtener el label y color del estado según el diagrama UML
 */
export const getEstadoInfo = (estado) => {
  const estados = {
    'en_creacion': { label: 'En Creación', color: 'secondary', icon: '📝' },
    'incompleto': { label: 'Incompleto', color: 'info', icon: '⏳' },
    'completo': { label: 'Completo', color: 'success', icon: '✅' },
    'programado_salida': { label: 'Programado para Salida', color: 'warning', icon: '📅' },
    'en_proceso_salida': { label: 'En Proceso de Salida', color: 'warning', icon: '🚪' },
    'cerrado': { label: 'Cerrado', color: 'dark', icon: '🔒' },
    'inactivo': { label: 'Inactivo', color: 'secondary', icon: '❌' },
  }
  
  return estados[estado] || { label: 'Desconocido', color: 'secondary', icon: '❓' }
}

export default {
  // CRUD Grupos
  getNextCodigoGrupo,
  getGrupos,
  getGrupoById,
  createGrupo,
  updateGrupo,
  deleteGrupo,
  // Gestión de Animales
  getAnimalesByGrupo,
  asignarAnimalGrupo,
  removerAnimalGrupo,
  // Gestión de Estados
  confirmarGrupo,
  iniciarSalidaGrupo,
  completarSalidaGrupo,
  getEstadoInfo,
  // Funciones Auxiliares
  calcularOcupacion,
  getEstadoOcupacion,
  formatearFecha,
  puedeAsignarAnimal,
}
