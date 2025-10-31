import api from './api'

export const animalService = {
  // Obtener todos los animales
  getAll: async () => {
    const response = await api.get('/get-animals')
    return response.data
  },

  // Obtener un animal por ID
  getById: async (id) => {
    const response = await api.get(`/get-animal?id=${id}`)
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

  // Eliminar animal (cambiar estado a inactivo)
  delete: async (id, motivo) => {
    const response = await api.post('/remove-animal', { id, motivo })
    return response.data
  },

  // Buscar animales
  search: async (filters) => {
    const response = await api.post('/search-animals', filters)
    return response.data
  },
}

export default animalService
