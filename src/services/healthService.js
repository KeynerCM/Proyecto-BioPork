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

export const vacunacionService = {
  getAll: async () => {
    try {
      const response = await axios.get(`${API_URL}/get-vacunaciones`, axiosConfig)
      return response.data
    } catch (error) {
      handleError(error, 'obtener vacunaciones')
    }
  },

  create: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/create-vacunacion`, data, axiosConfig)
      return response.data
    } catch (error) {
      handleError(error, 'crear vacunación')
    }
  },

  update: async (data) => {
    try {
      const response = await axios.put(`${API_URL}/update-vacunacion`, data, axiosConfig)
      return response.data
    } catch (error) {
      handleError(error, 'actualizar vacunación')
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/delete-vacunacion?id=${id}`, axiosConfig)
      return response.data
    } catch (error) {
      handleError(error, 'eliminar vacunación')
    }
  }
}

export const enfermedadService = {
  getAll: async () => {
    try {
      const response = await axios.get(`${API_URL}/get-enfermedades`, axiosConfig)
      return response.data
    } catch (error) {
      handleError(error, 'obtener enfermedades')
    }
  },

  create: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/create-enfermedad`, data, axiosConfig)
      return response.data
    } catch (error) {
      handleError(error, 'crear tratamiento')
    }
  },

  update: async (data) => {
    try {
      const response = await axios.put(`${API_URL}/update-enfermedad`, data, axiosConfig)
      return response.data
    } catch (error) {
      handleError(error, 'actualizar tratamiento')
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/delete-enfermedad?id=${id}`, axiosConfig)
      return response.data
    } catch (error) {
      handleError(error, 'eliminar tratamiento')
    }
  }
}
