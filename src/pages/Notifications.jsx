import { useState, useEffect } from 'react'
import { Bell, Check, CheckCheck, Trash2, Filter, Calendar, AlertCircle, Heart, Syringe, Package } from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import Toast from '../components/Toast'
import ConfirmDialog from '../components/ConfirmDialog'
import notificationService from '../services/notificationService'
import { formatearFechaHora } from '../utils/dateUtils'

function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [toast, setToast] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState(null)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const response = await notificationService.getAll()
      
      if (response.success && Array.isArray(response.data)) {
        setNotifications(response.data)
      } else {
        setNotifications([])
      }
    } catch (error) {
      console.error('Error al cargar notificaciones:', error)
      showToast('Error al cargar las notificaciones', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, leida: true } : n
      ))
      showToast('Notificación marcada como leída', 'success')
    } catch (error) {
      console.error('Error:', error)
      showToast('Error al actualizar notificación', 'error')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(notifications.map(n => ({ ...n, leida: true })))
      showToast('Todas las notificaciones marcadas como leídas', 'success')
    } catch (error) {
      console.error('Error:', error)
      showToast('Error al actualizar notificaciones', 'error')
    }
  }

  const handleDelete = (notification) => {
    setConfirmDialog({
      title: 'Eliminar Notificación',
      message: `¿Estás seguro de que deseas eliminar esta notificación?`,
      onConfirm: async () => {
        try {
          await notificationService.delete(notification.id)
          setNotifications(notifications.filter(n => n.id !== notification.id))
          showToast('Notificación eliminada', 'success')
        } catch (error) {
          console.error('Error:', error)
          showToast('Error al eliminar notificación', 'error')
        } finally {
          setConfirmDialog(null)
        }
      },
      onCancel: () => setConfirmDialog(null)
    })
  }

  const getIconByType = (type) => {
    const icons = {
      vacunacion: <Syringe className="text-blue-600" size={20} />,
      reproduccion: <Heart className="text-pink-600" size={20} />,
      salud: <AlertCircle className="text-red-600" size={20} />,
      grupo: <Package className="text-purple-600" size={20} />,
      general: <Bell className="text-gray-600" size={20} />
    }
    return icons[type] || icons.general
  }

  const getPriorityColor = (priority) => {
    const colors = {
      urgente: 'bg-red-100 text-red-800 border-red-200',
      alta: 'bg-orange-100 text-orange-800 border-orange-200',
      media: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      baja: 'bg-green-100 text-green-800 border-green-200'
    }
    return colors[priority] || colors.baja
  }

  const getPriorityLabel = (priority) => {
    const labels = {
      urgente: 'Urgente',
      alta: 'Alta',
      media: 'Media',
      baja: 'Baja'
    }
    return labels[priority] || priority
  }

  // Filtrar notificaciones
  const filteredNotifications = notifications.filter(notification => {
    if (filterType !== 'all' && notification.tipo !== filterType) return false
    if (filterPriority !== 'all' && notification.prioridad !== filterPriority) return false
    if (showUnreadOnly && notification.leida) return false
    return true
  })

  const unreadCount = notifications.filter(n => !n.leida).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Notificaciones</h1>
          <p className="text-gray-600">
            {unreadCount > 0 ? (
              <span className="text-blue-600 font-semibold">{unreadCount} sin leer</span>
            ) : (
              'No tienes notificaciones sin leer'
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllAsRead} variant="secondary">
            <CheckCheck size={18} className="mr-2" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      {/* Filtros */}
      <Card>
        <div className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtros:</span>
            </div>

            {/* Filtro por tipo */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input-field text-sm"
            >
              <option value="all">Todos los tipos</option>
              <option value="vacunacion">Vacunaciones</option>
              <option value="reproduccion">Reproducción</option>
              <option value="salud">Salud</option>
              <option value="grupo">Grupos</option>
              <option value="general">General</option>
            </select>

            {/* Filtro por prioridad */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="input-field text-sm"
            >
              <option value="all">Todas las prioridades</option>
              <option value="urgente">Urgente</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>

            {/* Toggle no leídas */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showUnreadOnly}
                onChange={(e) => setShowUnreadOnly(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Solo no leídas</span>
            </label>
          </div>
        </div>
      </Card>

      {/* Lista de notificaciones */}
      <div className="space-y-3">
        {loading ? (
          <Card>
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Cargando notificaciones...</p>
            </div>
          </Card>
        ) : filteredNotifications.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Bell size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No hay notificaciones</p>
              {(filterType !== 'all' || filterPriority !== 'all' || showUnreadOnly) && (
                <p className="text-sm text-gray-400 mt-2">Intenta ajustar los filtros</p>
              )}
            </div>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card key={notification.id}>
              <div className={`p-4 ${!notification.leida ? 'bg-blue-50' : ''}`}>
                <div className="flex items-start gap-4">
                  {/* Icono */}
                  <div className="flex-shrink-0 mt-1">
                    {getIconByType(notification.tipo)}
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <h3 className={`font-semibold ${!notification.leida ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.titulo}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.mensaje}
                        </p>
                      </div>
                      
                      {/* Badge de prioridad */}
                      <span className={`text-xs px-2 py-1 rounded border ${getPriorityColor(notification.prioridad)}`}>
                        {getPriorityLabel(notification.prioridad)}
                      </span>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar size={14} />
                        <span>{formatearFechaHora(notification.fecha_creacion)}</span>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center gap-2">
                        {!notification.leida && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                            title="Marcar como leída"
                          >
                            <Check size={16} />
                            <span>Marcar leída</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification)}
                          className="text-red-600 hover:text-red-800"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Confirm Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={confirmDialog.onCancel}
        />
      )}
    </div>
  )
}

export default Notifications

