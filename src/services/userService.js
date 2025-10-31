import api from './api'

export const userService = {
  // Login
  login: async (username, password) => {
    const response = await api.post('/login', { username, password })
    return response.data
  },

  // Obtener todos los usuarios
  getAll: async () => {
    const response = await api.get('/get-users')
    return response.data
  },

  // Crear nuevo usuario
  create: async (userData) => {
    const response = await api.post('/create-user', userData)
    return response.data
  },

  // Actualizar usuario
  update: async (id, userData) => {
    const response = await api.put(`/update-user?id=${id}`, userData)
    return response.data
  },

  // Desactivar usuario
  delete: async (id) => {
    const response = await api.delete(`/delete-user?id=${id}`)
    return response.data
  },
}

export default userService
