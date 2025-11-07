import { useState, useEffect } from 'react'
import { Package, Plus, Edit2, Trash2, Users, CheckCircle, XCircle } from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import Toast from '../components/Toast'
import ConfirmDialog from '../components/ConfirmDialog'
import {
  getGrupos,
  getNextCodigoGrupo,
  createGrupo,
  updateGrupo,
  deleteGrupo,
  getAnimalesByGrupo,
  asignarAnimalGrupo,
  removerAnimalGrupo,
  confirmarGrupo,
  iniciarSalidaGrupo,
  completarSalidaGrupo,
  getEstadoInfo,
} from '../services/groupService'
import { getAnimals } from '../services/animalService'

function Groups({ user }) {
  const [activeTab, setActiveTab] = useState('grupos')
  const [grupos, setGrupos] = useState([])
  const [animales, setAnimales] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showAnimalModal, setShowAnimalModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [selectedGrupo, setSelectedGrupo] = useState(null)
  const [toast, setToast] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState(null)
  
  // Verificar permisos
  const canEdit = user?.rol === 'admin' || user?.rol === 'operario'
  const canDelete = user?.rol === 'admin'
  
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    tipo: 'engorde',
    corral_numero: '',
    capacidad: 10,
    fecha_creacion: new Date().toISOString().split('T')[0],
    fecha_salida_programada: '',
    notas: '',
  })

  const [animalSeleccionado, setAnimalSeleccionado] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [gruposData, animalesData] = await Promise.all([
        getGrupos(),
        getAnimals()
      ])
      
      console.log('📊 Animales cargados:', animalesData)
      console.log('📊 Grupos cargados:', gruposData)
      
      setGrupos(gruposData || [])
      setAnimales(animalesData || [])
    } catch (error) {
      console.error('Error loading groups data:', error)
      showToast('Error al cargar los datos', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  const openModal = async (grupo = null) => {
    if (grupo) {
      setEditingItem(grupo)
      setFormData({
        codigo: grupo.codigo,
        nombre: grupo.nombre || '',
        tipo: grupo.tipo,
        corral_numero: grupo.corral_numero || '',
        capacidad: grupo.capacidad,
        fecha_creacion: grupo.fecha_creacion?.split('T')[0] || '',
        fecha_salida_programada: grupo.fecha_salida_programada?.split('T')[0] || '',
        notas: grupo.notas || '',
      })
    } else {
      try {
        const nextCodigo = await getNextCodigoGrupo()
        setEditingItem(null)
        setFormData({
          codigo: nextCodigo,
          nombre: '',
          tipo: 'engorde',
          corral_numero: '',
          capacidad: 10,
          fecha_creacion: new Date().toISOString().split('T')[0],
          fecha_salida_programada: '',
          notas: '',
        })
      } catch (error) {
        showToast('Error al obtener código', 'error')
        return
      }
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingItem(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const grupoData = {
        codigo: formData.codigo.trim(),
        nombre: formData.nombre?.trim() || null,
        tipo: formData.tipo,
        corral_numero: formData.corral_numero?.trim() || null,
        capacidad: parseInt(formData.capacidad),
        fecha_creacion: formData.fecha_creacion || new Date().toISOString().split('T')[0],
        fecha_salida_programada: formData.fecha_salida_programada || null,
        notas: formData.notas?.trim() || null,
      }

      if (editingItem) {
        await updateGrupo(editingItem.id, grupoData)
        showToast('Grupo actualizado exitosamente', 'success')
      } else {
        await createGrupo(grupoData)
        showToast('Grupo creado exitosamente', 'success')
      }

      closeModal()
      await loadData()
    } catch (error) {
      console.error('Error submitting grupo:', error)
      showToast(error.message || 'Error al guardar el grupo', 'error')
    }
  }

  const handleDelete = (grupo) => {
    setConfirmDialog({
      title: '¿Eliminar grupo?',
      message: `¿Estás seguro de que deseas eliminar el grupo ${grupo.codigo}?`,
      onConfirm: async () => {
        try {
          await deleteGrupo(grupo.id)
          showToast('Grupo eliminado exitosamente', 'success')
          await loadData()
        } catch (error) {
          showToast(error.message || 'Error al eliminar', 'error')
        }
        setConfirmDialog(null)
      },
      onCancel: () => setConfirmDialog(null)
    })
  }

  const handleConfirmarGrupo = async (grupo) => {
    try {
      const result = await confirmarGrupo(grupo.id)
      showToast(result.message, 'success')
      if (result.notificacion) {
        showToast(result.notificacion, 'info')
      }
      await loadData()
    } catch (error) {
      showToast(error.message || 'Error al confirmar grupo', 'error')
    }
  }

  const openAnimalModal = (grupo) => {
    setSelectedGrupo(grupo)
    setAnimalSeleccionado('')
    setShowAnimalModal(true)
  }

  const handleAsignarAnimal = async (e) => {
    e.preventDefault()
    
    if (!animalSeleccionado) {
      showToast('Selecciona un animal', 'error')
      return
    }

    try {
      await asignarAnimalGrupo(parseInt(animalSeleccionado), selectedGrupo.id)
      showToast('Animal asignado exitosamente', 'success')
      setShowAnimalModal(false)
      await loadData()
    } catch (error) {
      showToast(error.message || 'Error al asignar animal', 'error')
    }
  }

  // Filtrar animales disponibles (sin grupo y activos)
  const animalesDisponibles = animales.filter(a => {
    const disponible = !a.grupo_id && a.estado === 'activo'
    if (!disponible) {
      console.log(`❌ Animal ${a.codigo} NO disponible - grupo_id: ${a.grupo_id}, estado: ${a.estado}`)
    } else {
      console.log(`✅ Animal ${a.codigo} DISPONIBLE`)
    }
    return disponible
  })
  
  console.log(`🎯 Total animales disponibles: ${animalesDisponibles.length} de ${animales.length}`)

  const getEstadoBadge = (grupo) => {
    const estadoInfo = getEstadoInfo(grupo.estado_calculado || grupo.estado)
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${estadoInfo.color}-100 text-${estadoInfo.color}-800`}>
        {estadoInfo.icon} {estadoInfo.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando grupos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-8 h-8 text-blue-600" />
            Gestión de Grupos y Corrales
          </h1>
          <p className="text-gray-600 mt-1">
            Administra grupos de engorde y reproducción
          </p>
        </div>
        {canEdit && (
          <Button onClick={() => openModal()} className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nuevo Grupo
          </Button>
        )}
      </div>

      {/* Lista de Grupos */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ocupación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {grupos.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No hay grupos registrados
                  </td>
                </tr>
              ) : (
                grupos.map((grupo) => (
                  <tr key={grupo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {grupo.codigo}
                      </div>
                      {grupo.corral_numero && (
                        <div className="text-sm text-gray-500">
                          Corral: {grupo.corral_numero}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {grupo.nombre || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        grupo.tipo === 'engorde' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                      }`}>
                        {grupo.tipo === 'engorde' ? '🐷 Engorde' : '❤️ Reproducción'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getEstadoBadge(grupo)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {grupo.cantidad_actual || 0} / {grupo.capacidad}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${((grupo.cantidad_actual || 0) / grupo.capacidad) * 100}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {/* Botón Confirmar (solo si está en_creacion) */}
                      {grupo.estado === 'en_creacion' && canEdit && (
                        <button
                          onClick={() => handleConfirmarGrupo(grupo)}
                          className="text-green-600 hover:text-green-900"
                          title="Confirmar grupo"
                        >
                          <CheckCircle className="w-5 h-5 inline" />
                        </button>
                      )}
                      
                      {/* Botón Agregar Animal (si está confirmado y no está lleno) */}
                      {(grupo.estado === 'incompleto' || grupo.estado === 'completo') && 
                       (grupo.cantidad_actual || 0) < grupo.capacidad && canEdit && (
                        <button
                          onClick={() => openAnimalModal(grupo)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Agregar animal"
                        >
                          <Users className="w-5 h-5 inline" />
                        </button>
                      )}
                      
                      {canEdit && (
                        <button
                          onClick={() => openModal(grupo)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Editar"
                        >
                          <Edit2 className="w-5 h-5 inline" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(grupo)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <Trash2 className="w-5 h-5 inline" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Crear/Editar Grupo - Ventana Emergente Centrada */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'modalSlideIn 0.3s ease-out'
            }}
          >
            {/* Header del Modal */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Package className="w-6 h-6" />
                  {editingItem ? 'Editar Grupo' : 'Crear Nuevo Grupo'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Contenido del Modal */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Sección: Información Básica */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 bg-blue-600 rounded"></div>
                  Información Básica
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.codigo}
                      readOnly
                      className="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm text-gray-600 font-mono text-sm px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Grupo
                    </label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      placeholder="Ej: Grupo Primavera"
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all px-3 py-2"
                    />
                  </div>
                </div>
              </div>

              {/* Sección: Configuración */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 bg-green-600 rounded"></div>
                  Configuración
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Grupo <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.tipo}
                      onChange={(e) => setFormData({...formData, tipo: e.target.value, capacidad: e.target.value === 'engorde' ? 10 : 5})}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all px-3 py-2"
                      required
                    >
                      <option value="engorde">🐷 Engorde</option>
                      <option value="reproduccion">❤️ Reproducción</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Capacidad <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.capacidad}
                      onChange={(e) => setFormData({...formData, capacidad: e.target.value})}
                      min="1"
                      max={formData.tipo === 'engorde' ? 10 : 5}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all px-3 py-2"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 bg-gray-400 rounded-full"></span>
                      Máximo: {formData.tipo === 'engorde' ? 10 : 5} animales
                    </p>
                  </div>
                </div>
              </div>

              {/* Sección: Ubicación y Fechas */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 bg-purple-600 rounded"></div>
                  Ubicación y Fechas
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número de Corral
                      </label>
                      <input
                        type="text"
                        value={formData.corral_numero}
                        onChange={(e) => setFormData({...formData, corral_numero: e.target.value})}
                        placeholder="Ej: C-101"
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de Creación
                      </label>
                      <input
                        type="date"
                        value={formData.fecha_creacion}
                        onChange={(e) => setFormData({...formData, fecha_creacion: e.target.value})}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all px-3 py-2"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Salida Programada
                    </label>
                    <input
                      type="date"
                      value={formData.fecha_salida_programada}
                      onChange={(e) => setFormData({...formData, fecha_salida_programada: e.target.value})}
                      min={formData.fecha_creacion}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all px-3 py-2"
                    />
                  </div>
                </div>
              </div>

              {/* Sección: Notas */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 bg-orange-600 rounded"></div>
                  Notas Adicionales
                </h3>
                <textarea
                  value={formData.notas}
                  onChange={(e) => setFormData({...formData, notas: e.target.value})}
                  rows="3"
                  placeholder="Escribe notas o comentarios sobre este grupo..."
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all px-3 py-2"
                />
              </div>

              {/* Botones de Acción */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all flex items-center gap-2"
                >
                  {editingItem ? (
                    <>
                      <Edit2 className="w-4 h-4" />
                      Actualizar Grupo
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Crear Grupo
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Asignar Animal - Ventana Emergente Centrada */}
      {showAnimalModal && selectedGrupo && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAnimalModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'modalSlideIn 0.3s ease-out'
            }}
          >
            {/* Header del Modal */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  Asignar Animal
                </h2>
                <button
                  onClick={() => setShowAnimalModal(false)}
                  className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <p className="text-green-100 text-sm mt-1">
                Grupo: <span className="font-semibold">{selectedGrupo.codigo}</span>
                {selectedGrupo.nombre && ` - ${selectedGrupo.nombre}`}
              </p>
            </div>

            {/* Contenido del Modal */}
            <form onSubmit={handleAsignarAnimal} className="p-6 space-y-5">
              {/* Info del Grupo */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Tipo:</span>
                    <span className="ml-2 font-semibold text-gray-900">
                      {selectedGrupo.tipo === 'engorde' ? '🐷 Engorde' : '❤️ Reproducción'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Ocupación:</span>
                    <span className="ml-2 font-semibold text-gray-900">
                      {selectedGrupo.cantidad_actual || 0} / {selectedGrupo.capacidad}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Espacios disponibles:</span>
                    <span className="ml-2 font-bold text-green-600">
                      {selectedGrupo.capacidad - (selectedGrupo.cantidad_actual || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Selector de Animal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar Animal <span className="text-red-500">*</span>
                </label>
                <select
                  value={animalSeleccionado}
                  onChange={(e) => setAnimalSeleccionado(e.target.value)}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all px-3 py-2.5"
                  required
                >
                  <option value="">-- Seleccione un animal --</option>
                  {animalesDisponibles.map(animal => (
                    <option key={animal.id} value={animal.id}>
                      {animal.codigo} - {animal.raza} ({animal.sexo === 'M' ? 'Macho' : 'Hembra'})
                    </option>
                  ))}
                </select>
                
                {/* Info de Animales Disponibles */}
                <div className="mt-3 flex items-center gap-2">
                  {animalesDisponibles.length > 0 ? (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-medium">{animalesDisponibles.length} animales disponibles</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-orange-600">
                      <XCircle className="w-4 h-4" />
                      <span className="font-medium">No hay animales disponibles sin grupo</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAnimalModal(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={animalesDisponibles.length === 0}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Asignar Animal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

export default Groups
