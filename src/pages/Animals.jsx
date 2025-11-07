import { useState, useEffect } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'
import Toast from '../components/Toast'
import ConfirmDialog from '../components/ConfirmDialog'
import { Plus, Search, Edit2, Trash2, Eye, X } from 'lucide-react'
import animalService from '../services/animalService'

function Animals({ user }) {
  const [animals, setAnimals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAnimal, setEditingAnimal] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [toast, setToast] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState(null)

  // Verificar permisos
  const canEdit = user?.rol === 'admin' || user?.rol === 'operario'
  const canDelete = user?.rol === 'admin'

  // Form state
  const [formData, setFormData] = useState({
    codigo: '',
    tipo: 'engorde',
    raza: '',
    fecha_nacimiento: '',
    peso_inicial: '',
    peso_actual: '',
    sexo: 'macho',
    estado: 'activo',
    grupo_id: null,
  })

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  // Cargar animales al montar el componente
  useEffect(() => {
    loadAnimals()
  }, [])

  const loadAnimals = async () => {
    try {
      setLoading(true)
      const data = await animalService.getAll()
      setAnimals(data || [])
    } catch (error) {
      console.error('Error al cargar animales:', error)
      showToast('Error al cargar los animales', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // Limpiar y validar datos antes de enviar
      const animalData = {
        codigo: formData.codigo.trim(),
        tipo: formData.tipo,
        raza: formData.raza?.trim() || null,
        fecha_nacimiento: formData.fecha_nacimiento,
        peso_inicial: formData.peso_inicial ? parseFloat(formData.peso_inicial) : null,
        peso_actual: formData.peso_actual ? parseFloat(formData.peso_actual) : null,
        sexo: formData.sexo,
        estado: formData.estado,
        grupo_id: formData.grupo_id || null,
      }
      
      console.log('📤 Enviando datos a la BD:', animalData)
      
      if (editingAnimal) {
        // Actualizar
        const response = await animalService.update(editingAnimal.id, animalData)
        console.log('✅ Respuesta actualización:', response)
        showToast(`Animal ${animalData.codigo} actualizado exitosamente`, 'success')
        loadAnimals()
        closeModal()
      } else {
        // Crear nuevo
        const response = await animalService.create(animalData)
        console.log('✅ Respuesta creación:', response)
        showToast(`Animal ${animalData.codigo} registrado exitosamente`, 'success')
        loadAnimals()
        closeModal()
      }
    } catch (error) {
      console.error('❌ Error al guardar:', error)
      showToast(error.message || 'Error al guardar el animal', 'error')
    }
  }

  const handleEdit = (animal) => {
    console.log('📝 Editando animal:', animal)
    setEditingAnimal(animal)
    
    // Formatear fecha para input type="date" (solo YYYY-MM-DD)
    const fechaNacimiento = animal.fecha_nacimiento 
      ? animal.fecha_nacimiento.split('T')[0] 
      : ''
    
    // Normalizar sexo a minúsculas para que coincida con los options del select
    const sexoNormalizado = animal.sexo 
      ? animal.sexo.toLowerCase() 
      : 'macho'
    
    // Normalizar estado a minúsculas
    const estadoNormalizado = animal.estado 
      ? animal.estado.toLowerCase() 
      : 'activo'
    
    const formDataToSet = {
      codigo: animal.codigo,
      tipo: animal.tipo,
      raza: animal.raza || '',
      fecha_nacimiento: fechaNacimiento,
      peso_inicial: animal.peso_inicial || '',
      peso_actual: animal.peso_actual || '',
      sexo: sexoNormalizado,
      estado: estadoNormalizado,
      grupo_id: animal.grupo_id || null,
    }
    
    console.log('📋 Datos del formulario:', formDataToSet)
    setFormData(formDataToSet)
    setShowModal(true)
  }

  const handleDelete = async (id, codigo) => {
    setConfirmDialog({
      title: 'Eliminar Animal',
      message: `¿Estás seguro de que deseas eliminar el animal ${codigo}? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        try {
          await animalService.delete(id)
          showToast(`Animal ${codigo} eliminado exitosamente`, 'success')
          loadAnimals()
        } catch (error) {
          console.error('Error:', error)
          showToast('Error al eliminar el animal', 'error')
        }
        setConfirmDialog(null)
      },
      onCancel: () => setConfirmDialog(null)
    })
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingAnimal(null)
    setFormData({
      codigo: '',
      tipo: 'engorde',
      raza: '',
      fecha_nacimiento: '',
      peso_inicial: '',
      peso_actual: '',
      sexo: 'macho',
      estado: 'activo',
      grupo_id: null,
    })
  }

  const openModalForNew = async () => {
    try {
      // Obtener el siguiente código automáticamente
      const nextCodigo = await animalService.getNextCodigo()
      setFormData((prev) => ({
        ...prev,
        codigo: nextCodigo,
      }))
    } catch (error) {
      console.error('Error al obtener código:', error)
    }
    setShowModal(true)
  }

  // Filtrar animales
  const filteredAnimals = animals.filter((animal) => {
    const matchesSearch =
      animal.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (animal.raza && animal.raza.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = !filterType || animal.tipo === filterType
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestión de Animales</h1>
          <p className="text-gray-600">Administra el registro de todos los animales</p>
        </div>
        {canEdit && (
          <Button onClick={openModalForNew}>
            <Plus size={20} className="inline mr-2" />
            Registrar Animal
          </Button>
        )}
      </div>

      <Card>
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por código o raza..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="input-field w-48" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="">Todos los tipos</option>
            <option value="engorde">Engorde</option>
            <option value="reproduccion">Reproducción</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-12">
            <p>Cargando animales...</p>
          </div>
        ) : filteredAnimals.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p>No hay animales registrados aún</p>
            <p className="text-sm mt-2">Comienza registrando tu primer animal</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Raza
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Nac.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Peso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAnimals.map((animal) => (
                  <tr key={animal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{animal.codigo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          animal.tipo === 'engorde' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                        }`}
                      >
                        {animal.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{animal.raza || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{animal.fecha_nacimiento}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {animal.peso_actual ? `${animal.peso_actual} kg` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          animal.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {animal.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {canEdit && (
                        <button
                          onClick={() => handleEdit(animal)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(animal.id, animal.codigo)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                      {!canEdit && !canDelete && (
                        <span className="text-gray-400 text-xs">Solo lectura</span>
                      )}
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
                {editingAnimal ? 'Editar Animal' : 'Registrar Nuevo Animal'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="codigo"
                    value={formData.codigo}
                    onChange={handleInputChange}
                    className="input-field bg-gray-50"
                    required
                    readOnly={!editingAnimal}
                    title={!editingAnimal ? 'Código generado automáticamente' : 'Código del animal'}
                  />
                  {!editingAnimal && (
                    <p className="text-xs text-gray-500 mt-1">Código generado automáticamente</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo <span className="text-red-500">*</span>
                  </label>
                  <select name="tipo" value={formData.tipo} onChange={handleInputChange} className="input-field" required>
                    <option value="engorde">Engorde</option>
                    <option value="reproduccion">Reproducción</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Raza</label>
                  <input
                    type="text"
                    name="raza"
                    value={formData.raza}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Ej: Landrace, Yorkshire"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Nacimiento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="fecha_nacimiento"
                    value={formData.fecha_nacimiento}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Peso Inicial (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="peso_inicial"
                    value={formData.peso_inicial}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Peso Actual (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="peso_actual"
                    value={formData.peso_actual}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                  <select name="sexo" value={formData.sexo} onChange={handleInputChange} className="input-field">
                    <option value="macho">Macho</option>
                    <option value="hembra">Hembra</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select name="estado" value={formData.estado} onChange={handleInputChange} className="input-field">
                    <option value="activo">Activo</option>
                    <option value="vendido">Vendido</option>
                    <option value="muerto">Muerto</option>
                    <option value="trasladado">Trasladado</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="secondary" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button type="submit">{editingAnimal ? 'Actualizar' : 'Registrar'}</Button>
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
          type="danger"
        />
      )}
    </div>
  )
}

export default Animals

