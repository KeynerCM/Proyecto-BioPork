import { useState, useEffect } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'
import Toast from '../components/Toast'
import ConfirmDialog from '../components/ConfirmDialog'
import { Plus, Search, Edit2, Trash2, X, Shield, User as UserIcon } from 'lucide-react'
import userService from '../services/userService'

function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRol, setFilterRol] = useState('')
  const [toast, setToast] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nombre: '',
    email: '',
    rol: 'operario',
    activo: true,
  })

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await userService.getAll()
      if (response.success) {
        setUsers(response.data)
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
      showToast('Error al cargar los usuarios', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingUser) {
        // Actualizar
        const response = await userService.update(editingUser.id, formData)
        if (response.success) {
          showToast(`Usuario ${formData.username} actualizado exitosamente`, 'success')
          loadUsers()
          closeModal()
        }
      } else {
        // Crear nuevo
        const response = await userService.create(formData)
        if (response.success) {
          showToast(`Usuario ${formData.username} creado exitosamente`, 'success')
          loadUsers()
          closeModal()
        }
      }
    } catch (error) {
      console.error('Error:', error)
      showToast(error.response?.data?.error || 'Error al guardar el usuario', 'error')
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      password: '', // No mostrar la contraseña actual
      nombre: user.nombre || '',
      email: user.email || '',
      rol: user.rol,
      activo: user.activo,
    })
    setShowModal(true)
  }

  const handleDelete = async (id, username) => {
    setConfirmDialog({
      title: 'Desactivar Usuario',
      message: `¿Estás seguro de que deseas desactivar al usuario ${username}? Esta acción se puede revertir.`,
      onConfirm: async () => {
        try {
          const response = await userService.delete(id)
          if (response.success) {
            showToast(`Usuario ${username} desactivado exitosamente`, 'warning')
            loadUsers()
          }
        } catch (error) {
          console.error('Error:', error)
          showToast('Error al desactivar el usuario', 'error')
        }
        setConfirmDialog(null)
      },
      onCancel: () => setConfirmDialog(null)
    })
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingUser(null)
    setFormData({
      username: '',
      password: '',
      nombre: '',
      email: '',
      rol: 'operario',
      activo: true,
    })
  }

  // Filtrar usuarios
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.nombre && user.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesRol = !filterRol || user.rol === filterRol
    return matchesSearch && matchesRol
  })

  const getRolBadge = (rol) => {
    const badges = {
      admin: 'bg-red-100 text-red-800',
      operario: 'bg-blue-100 text-blue-800',
      consultor: 'bg-green-100 text-green-800',
    }
    return badges[rol] || 'bg-gray-100 text-gray-800'
  }

  const getRolIcon = (rol) => {
    return rol === 'admin' ? <Shield size={16} /> : <UserIcon size={16} />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestión de Usuarios</h1>
          <p className="text-gray-600">Administra usuarios y permisos del sistema</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={20} className="inline mr-2" />
          Crear Usuario
        </Button>
      </div>

      {/* Info de roles */}
      <Card>
        <h3 className="font-semibold text-gray-800 mb-3">Roles del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <Shield size={24} className="text-red-600 mt-1" />
            <div>
              <h4 className="font-medium text-gray-800">Administrador</h4>
              <p className="text-sm text-gray-600">Acceso completo al sistema</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <UserIcon size={24} className="text-blue-600 mt-1" />
            <div>
              <h4 className="font-medium text-gray-800">Operario</h4>
              <p className="text-sm text-gray-600">Registro y edición de datos</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <UserIcon size={24} className="text-green-600 mt-1" />
            <div>
              <h4 className="font-medium text-gray-800">Consultor</h4>
              <p className="text-sm text-gray-600">Solo lectura de información</p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por usuario o nombre..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="input-field w-48" value={filterRol} onChange={(e) => setFilterRol(e.target.value)}>
            <option value="">Todos los roles</option>
            <option value="admin">Administrador</option>
            <option value="operario">Operario</option>
            <option value="consultor">Consultor</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-12">
            <p>Cargando usuarios...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p>No hay usuarios registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Último Acceso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.nombre || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getRolBadge(user.rol)}`}>
                        {getRolIcon(user.rol)}
                        {user.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {user.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.ultimo_acceso ? new Date(user.ultimo_acceso).toLocaleString('es') : 'Nunca'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id, user.username)}
                        className="text-red-600 hover:text-red-900"
                        title="Desactivar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal de formulario */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usuario <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                    disabled={editingUser !== null}
                  />
                  {editingUser && <p className="text-xs text-gray-500 mt-1">El usuario no puede modificarse</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña {!editingUser && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="input-field"
                    required={!editingUser}
                    placeholder={editingUser ? 'Dejar vacío para no cambiar' : ''}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rol <span className="text-red-500">*</span>
                  </label>
                  <select name="rol" value={formData.rol} onChange={handleInputChange} className="input-field" required>
                    <option value="admin">Administrador</option>
                    <option value="operario">Operario</option>
                    <option value="consultor">Consultor</option>
                  </select>
                </div>

                {editingUser && (
                  <div className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="activo"
                        checked={formData.activo}
                        onChange={handleInputChange}
                        className="mr-2 w-4 h-4"
                      />
                      <span className="text-sm font-medium text-gray-700">Usuario Activo</span>
                    </label>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="secondary" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button type="submit">{editingUser ? 'Actualizar' : 'Crear Usuario'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast de notificaciones */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Modal de confirmación */}
      {confirmDialog && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={confirmDialog.onCancel}
          type="warning"
        />
      )}
    </div>
  )
}

export default Users
