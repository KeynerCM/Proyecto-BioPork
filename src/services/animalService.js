import api from './api'

export const animalService = {
  // Obtener todos los animales
  getAll: async () => {
    const response = await api.get('/get-animals')
    return response.data
  },

  // Obtener el siguiente código disponible
  getNextCodigo: async () => {
    const response = await api.get('/get-next-codigo')
    return response.data
  },

  // Obtener un animal por ID
  getById: async (id) => {
    const response = await api.get(`/get-animal-by-id?id=${id}`)
    return response.data
  },

  // Crear nuevo animal
  create: async (animalData) => {
    const response = await api.post('/create-animal', animalData)
    return response.data
  },

  // Actualizar animal
  update: async (id, animalData) => {
    const response = await api.put(`/update-animal?id=${id}`, animalData)
    return response.data
  },

  // Eliminar animal
  delete: async (id) => {
    const response = await api.delete(`/delete-animal?id=${id}`)
    return response.data
  },

  // Buscar animales
  search: async (filters) => {
    const response = await api.post('/search-animals', filters)
    return response.data
  },
}

// Export adicional para compatibilidad con otros componentes
export const getAnimals = animalService.getAll

export default animalService
