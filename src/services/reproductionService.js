import axios from 'axios'

const API_URL = '/.netlify/functions'

// Configuración de timeout y manejo de errores
const axiosConfig = {
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
}

const handleError = (error, operation) => {
  console.error(`Error in ${operation}:`, error)
  
  if (error.response) {
    // El servidor respondió con un código de error
    throw new Error(error.response.data?.error || error.response.data?.message || `Error en ${operation}`)
  } else if (error.request) {
    // La petición fue enviada pero no hubo respuesta
    throw new Error('No se pudo conectar con el servidor. Verifica tu conexión.')
  } else {
    // Error al configurar la petición
    throw new Error(error.message || `Error desconocido en ${operation}`)
  }
}

export const cicloReproductivoService = {
  getAll: async () => {
    try {
      const response = await axios.get(`${API_URL}/get-ciclos-reproductivos`, axiosConfig)
      return response.data
    } catch (error) {
      handleError(error, 'obtener ciclos reproductivos')
    }
  },

  create: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/create-ciclo-reproductivo`, data, axiosConfig)
      return response.data
    } catch (error) {
      handleError(error, 'crear ciclo reproductivo')
    }
  },

  update: async (data) => {
    try {
      const response = await axios.put(`${API_URL}/update-ciclo-reproductivo`, data, axiosConfig)
      return response.data
    } catch (error) {
      handleError(error, 'actualizar ciclo reproductivo')
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/delete-ciclo-reproductivo?id=${id}`, axiosConfig)
      return response.data
    } catch (error) {
      handleError(error, 'eliminar ciclo reproductivo')
    }
  }
}

export const partoService = {
  getAll: async () => {
    try {
      const response = await axios.get(`${API_URL}/get-partos`, axiosConfig)
      return response.data
    } catch (error) {
      handleError(error, 'obtener partos')
    }
  },

  create: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/create-parto`, data, axiosConfig)
      return response.data
    } catch (error) {
      handleError(error, 'crear registro de parto')
    }
  },

  update: async (data) => {
    try {
      const response = await axios.put(`${API_URL}/update-parto`, data, axiosConfig)
      return response.data
    } catch (error) {
      handleError(error, 'actualizar registro de parto')
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/delete-parto?id=${id}`, axiosConfig)
      return response.data
    } catch (error) {
      handleError(error, 'eliminar registro de parto')
    }
  }
}
