import api from './api'

export const animalService = {
  // Obtener todos los animales
  getAll: async () => {
    const response = await api.get('/get-animals')
    return response.data?.data || []
  },

  // Obtener el siguiente código disponible
  getNextCodigo: async () => {
    const response = await api.get('/get-next-codigo')
    return response.data?.data || null
  },

  // Obtener un animal por ID
  getById: async (id) => {
    const response = await api.get(`/get-animal-by-id?id=${id}`)
    return response.data?.data || null
  },

  // Crear nuevo animal
  create: async (animalData) => {
    const response = await api.post('/create-animal', animalData)
    return response.data?.data || null
  },

  // Actualizar animal
  update: async (id, animalData) => {
    const response = await api.put(`/update-animal?id=${id}`, animalData)
    return response.data?.data || null
  },

  // Eliminar animal
  delete: async (id) => {
    const response = await api.delete(`/delete-animal?id=${id}`)
    return response.data?.data || null
  },

  // Buscar animales
  search: async (filters) => {
    const response = await api.post('/search-animals', filters)
    return response.data?.data || []
  },
}

// Export adicional para compatibilidad con otros componentes
export const getAnimals = animalService.getAll

export default animalService
