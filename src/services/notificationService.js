import api from './api'

export const notificationService = {
  // Obtener todas las notificaciones
  getAll: async () => {
    const response = await api.get('/get-notificaciones')
    return response.data
  },

  // Obtener notificaciones no leídas
  getUnread: async () => {
    const response = await api.get('/get-notificaciones-no-leidas')
    return response.data
  },

  // Marcar notificación como leída
  markAsRead: async (id) => {
    const response = await api.post('/marcar-notificacion-leida', { id })
    return response.data
  },

  // Marcar todas como leídas
  markAllAsRead: async () => {
    const response = await api.post('/marcar-todas-leidas')
    return response.data
  },

  // Eliminar notificación
  delete: async (id) => {
    const response = await api.delete(`/delete-notificacion?id=${id}`)
    return response.data
  },

  // Crear notificación manual
  create: async (data) => {
    const response = await api.post('/crear-notificacion', data)
    return response.data
  },

  // Obtener contador de no leídas
  getUnreadCount: async () => {
    const response = await api.get('/get-contador-no-leidas')
    return response.data?.count || 0
  }
}

export default notificationService
