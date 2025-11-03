import { useState, useEffect } from 'react'
import { Heart, Baby, Plus, Edit2, Trash2, Calendar, AlertCircle, CheckCircle } from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import Toast from '../components/Toast'
import ConfirmDialog from '../components/ConfirmDialog'
import { cicloReproductivoService, partoService } from '../services/reproductionService'
import { animalService } from '../services/animalService'

function Reproduction({ user }) {
  const [activeTab, setActiveTab] = useState('ciclos')
  const [ciclos, setCiclos] = useState([])
  const [partos, setPartos] = useState([])
  const [animales, setAnimales] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [toast, setToast] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState(null)
  
  // Verificar permisos
  const canEdit = user?.rol === 'admin' || user?.rol === 'operario'
  const canDelete = user?.rol === 'admin'
  
  const [formData, setFormData] = useState({
    // Ciclo Reproductivo
    cerda_id: '',
    fecha_celo: '',
    fecha_monta: '',
    tipo_monta: 'natural',
    verraco: '',
    estado: 'esperando',
    // Parto
    ciclo_id: '',
    fecha_parto: '',
    lechones_nacidos: '',
    lechones_vivos: '',
    peso_promedio: '',
    dificultad: 'normal',
    estado_cerda: '',
    observaciones: '',
    veterinario: '',
    notas: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [ciclosResponse, partosResponse, animResponse] = await Promise.all([
        cicloReproductivoService.getAll(),
        partoService.getAll(),
        animalService.getAll()
      ])
      
      setCiclos(ciclosResponse.data || [])
      setPartos(partosResponse.data || [])
      setAnimales(animResponse.data || [])
    } catch (error) {
      showToast('Error al cargar los datos', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (activeTab === 'ciclos') {
        const cicloData = {
          cerda_id: parseInt(formData.cerda_id),
          fecha_celo: formData.fecha_celo,
          fecha_monta: formData.fecha_monta || null,
          tipo_monta: formData.tipo_monta,
          verraco: formData.verraco,
          estado: formData.estado,
          notas: formData.notas,
        }

        if (editingItem) {
          await cicloReproductivoService.update({ ...cicloData, id: editingItem.id })
          showToast('Ciclo reproductivo actualizado exitosamente', 'success')
        } else {
          await cicloReproductivoService.create(cicloData)
          showToast('Ciclo reproductivo registrado exitosamente', 'success')
        }
      } else {
        const partoData = {
          cerda_id: parseInt(formData.cerda_id),
          ciclo_id: formData.ciclo_id ? parseInt(formData.ciclo_id) : null,
          fecha_parto: formData.fecha_parto,
          lechones_nacidos: parseInt(formData.lechones_nacidos),
          lechones_vivos: parseInt(formData.lechones_vivos),
          peso_promedio: formData.peso_promedio ? parseFloat(formData.peso_promedio) : null,
          dificultad: formData.dificultad,
          estado_cerda: formData.estado_cerda,
          observaciones: formData.observaciones,
          veterinario: formData.veterinario,
        }

        if (editingItem) {
          await partoService.update({ ...partoData, id: editingItem.id })
          showToast('Parto actualizado exitosamente', 'success')
        } else {
          await partoService.create(partoData)
          showToast('Parto registrado exitosamente', 'success')
        }
      }

      closeModal()
      loadData()
    } catch (error) {
      showToast('Error al guardar el registro', 'error')
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    
    if (activeTab === 'ciclos') {
      setFormData({
        cerda_id: item.cerda_id.toString(),
        fecha_celo: item.fecha_celo,
        fecha_monta: item.fecha_monta || '',
        tipo_monta: item.tipo_monta || 'natural',
        verraco: item.verraco || '',
        estado: item.estado,
        notas: item.notas || '',
      })
    } else {
      setFormData({
        cerda_id: item.cerda_id.toString(),
        ciclo_id: item.ciclo_id?.toString() || '',
        fecha_parto: item.fecha_parto,
        lechones_nacidos: item.lechones_nacidos.toString(),
        lechones_vivos: item.lechones_vivos.toString(),
        peso_promedio: item.peso_promedio || '',
        dificultad: item.dificultad,
        estado_cerda: item.estado_cerda || '',
        observaciones: item.observaciones || '',
        veterinario: item.veterinario || '',
      })
    }
    
    setShowModal(true)
  }

  const handleDelete = (id, tipo, nombre) => {
    setConfirmDialog({
      title: `Eliminar ${tipo}`,
      message: `¿Estás seguro de que deseas eliminar este registro de ${nombre}? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        try {
          if (activeTab === 'ciclos') {
            await cicloReproductivoService.delete(id)
            showToast('Ciclo reproductivo eliminado exitosamente', 'success')
          } else {
            await partoService.delete(id)
            showToast('Parto eliminado exitosamente', 'success')
          }
          loadData()
        } catch (error) {
          showToast('Error al eliminar el registro', 'error')
        }
        setConfirmDialog(null)
      },
      onCancel: () => setConfirmDialog(null)
    })
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingItem(null)
    setFormData({
      cerda_id: '',
      fecha_celo: '',
      fecha_monta: '',
      tipo_monta: 'natural',
      verraco: '',
      estado: 'esperando',
      ciclo_id: '',
      fecha_parto: '',
      lechones_nacidos: '',
      lechones_vivos: '',
      peso_promedio: '',
      dificultad: 'normal',
      estado_cerda: '',
      observaciones: '',
      veterinario: '',
      notas: '',
    })
  }

  const getEstadoCicloBadge = (estado) => {
    const styles = {
      esperando: 'bg-blue-100 text-blue-800',
      gestante: 'bg-purple-100 text-purple-800',
      parto_completado: 'bg-green-100 text-green-800',
      fallido: 'bg-red-100 text-red-800',
    }
    const labels = {
      esperando: 'Esperando',
      gestante: 'Gestante',
      parto_completado: 'Parto Completado',
      fallido: 'Fallido',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[estado]}`}>
        {labels[estado]}
      </span>
    )
  }

  const getDificultadBadge = (dificultad) => {
    const styles = {
      normal: 'bg-green-100 text-green-800',
      asistido: 'bg-yellow-100 text-yellow-800',
      cesarea: 'bg-red-100 text-red-800',
    }
    const labels = {
      normal: 'Normal',
      asistido: 'Asistido',
      cesarea: 'Cesárea',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[dificultad]}`}>
        {labels[dificultad]}
      </span>
    )
  }

  const getDiasParaParto = (dias) => {
    if (!dias || dias < 0) return null
    if (dias === 0) return <span className="text-red-600 font-semibold">¡Hoy!</span>
    if (dias <= 7) return <span className="text-orange-600 font-semibold">{dias} días</span>
    return <span className="text-gray-600">{dias} días</span>
  }

  // Filtrar solo cerdas hembras tipo reproducción
  const cerdas = animales.filter(a => a.sexo === 'hembra' && a.tipo === 'reproduccion')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando datos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestión Reproductiva</h1>
          <p className="text-gray-600">Control de ciclos reproductivos y partos</p>
        </div>
        {canEdit && (
          <Button onClick={() => setShowModal(true)}>
            <Plus size={20} className="mr-2" />
            Nuevo Registro
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('ciclos')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'ciclos'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Heart size={18} />
          Ciclos Reproductivos ({ciclos.length})
        </button>
        <button
          onClick={() => setActiveTab('partos')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'partos'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Baby size={18} />
          Partos ({partos.length})
        </button>
      </div>

      {/* Contenido de Ciclos Reproductivos */}
      {activeTab === 'ciclos' && (
        <Card>
          {ciclos.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <Heart size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No hay ciclos reproductivos registrados</p>
              <p className="text-sm mt-2">Crea el primer registro para comenzar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cerda</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Celo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monta</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verraco</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parto Estimado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ciclos.map((ciclo) => (
                    <tr key={ciclo.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{ciclo.cerda_codigo}</div>
                        <div className="text-sm text-gray-500">{ciclo.cerda_raza}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(ciclo.fecha_celo).toLocaleDateString('es')}
                      </td>
                      <td className="px-6 py-4">
                        {ciclo.fecha_monta ? (
                          <>
                            <div className="text-sm text-gray-900">
                              {new Date(ciclo.fecha_monta).toLocaleDateString('es')}
                            </div>
                            <div className="text-xs text-gray-500">
                              {ciclo.tipo_monta === 'natural' ? '🐷 Natural' : '💉 Artificial'}
                            </div>
                          </>
                        ) : (
                          <span className="text-gray-400">Pendiente</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ciclo.verraco || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {ciclo.fecha_estimada_parto ? (
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar size={14} className="text-purple-500" />
                              {new Date(ciclo.fecha_estimada_parto).toLocaleDateString('es')}
                            </div>
                            <div className="text-xs mt-1">
                              {getDiasParaParto(ciclo.dias_para_parto)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getEstadoCicloBadge(ciclo.estado)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {canEdit && (
                          <button
                            onClick={() => handleEdit(ciclo)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(ciclo.id, 'ciclo', ciclo.cerda_codigo)}
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
      )}

      {/* Contenido de Partos */}
      {activeTab === 'partos' && (
        <Card>
          {partos.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <Baby size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No hay partos registrados</p>
              <p className="text-sm mt-2">Crea el primer registro para comenzar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cerda</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Parto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lechones</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Peso Prom.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dificultad</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado Cerda</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {partos.map((parto) => (
                    <tr key={parto.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{parto.cerda_codigo}</div>
                        <div className="text-sm text-gray-500">{parto.cerda_raza}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(parto.fecha_parto).toLocaleDateString('es')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <CheckCircle size={14} className="text-green-500" />
                            <span className="font-medium text-green-700">{parto.lechones_vivos} vivos</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {parto.lechones_muertos > 0 && (
                              <span className="text-red-600">❌ {parto.lechones_muertos} muertos</span>
                            )}
                            <span className="text-gray-400 ml-2">Total: {parto.lechones_nacidos}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {parto.peso_promedio ? `${parto.peso_promedio} kg` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getDificultadBadge(parto.dificultad)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {parto.estado_cerda || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {canEdit && (
                          <button
                            onClick={() => handleEdit(parto)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(parto.id, 'parto', parto.cerda_codigo)}
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
      )}

      {/* Modal de formulario */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingItem ? 'Editar' : 'Nuevo'} {activeTab === 'ciclos' ? 'Ciclo Reproductivo' : 'Parto'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Selección de Cerda */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cerda <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.cerda_id}
                    onChange={(e) => setFormData({ ...formData, cerda_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="">Seleccionar cerda</option>
                    {cerdas.map((cerda) => (
                      <option key={cerda.id} value={cerda.id}>
                        {cerda.codigo} - {cerda.raza}
                      </option>
                    ))}
                  </select>
                  {cerdas.length === 0 && (
                    <p className="text-sm text-orange-600 mt-1">
                      ⚠️ No hay cerdas disponibles. Asegúrate de tener animales hembra tipo reproducción.
                    </p>
                  )}
                </div>

                {/* Formulario de Ciclo Reproductivo */}
                {activeTab === 'ciclos' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fecha de Celo <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={formData.fecha_celo}
                          onChange={(e) => setFormData({ ...formData, fecha_celo: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fecha de Monta
                        </label>
                        <input
                          type="date"
                          value={formData.fecha_monta}
                          onChange={(e) => setFormData({ ...formData, fecha_monta: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          📅 Parto estimado: +114 días
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo de Monta
                        </label>
                        <select
                          value={formData.tipo_monta}
                          onChange={(e) => setFormData({ ...formData, tipo_monta: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="natural">Natural</option>
                          <option value="artificial">Artificial</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Verraco
                        </label>
                        <input
                          type="text"
                          value={formData.verraco}
                          onChange={(e) => setFormData({ ...formData, verraco: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Nombre o código del verraco"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.estado}
                        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      >
                        <option value="esperando">Esperando</option>
                        <option value="gestante">Gestante</option>
                        <option value="parto_completado">Parto Completado</option>
                        <option value="fallido">Fallido</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
                      <textarea
                        value={formData.notas}
                        onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        rows="3"
                      />
                    </div>
                  </>
                )}

                {/* Formulario de Parto */}
                {activeTab === 'partos' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ciclo Reproductivo (Opcional)
                      </label>
                      <select
                        value={formData.ciclo_id}
                        onChange={(e) => setFormData({ ...formData, ciclo_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">Sin ciclo asociado</option>
                        {ciclos
                          .filter(c => c.cerda_id.toString() === formData.cerda_id)
                          .map((ciclo) => (
                            <option key={ciclo.id} value={ciclo.id}>
                              Ciclo {new Date(ciclo.fecha_celo).toLocaleDateString('es')} - {ciclo.estado}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha del Parto <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.fecha_parto}
                        onChange={(e) => setFormData({ ...formData, fecha_parto: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Lechones Nacidos <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.lechones_nacidos}
                          onChange={(e) => setFormData({ ...formData, lechones_nacidos: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Lechones Vivos <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.lechones_vivos}
                          onChange={(e) => setFormData({ ...formData, lechones_vivos: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Peso Promedio (kg)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.peso_promedio}
                          onChange={(e) => setFormData({ ...formData, peso_promedio: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="1.5"
                        />
                      </div>
                    </div>

                    {formData.lechones_nacidos && formData.lechones_vivos && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                          ℹ️ Lechones muertos (calculado): {
                            parseInt(formData.lechones_nacidos) - parseInt(formData.lechones_vivos)
                          }
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Dificultad del Parto <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.dificultad}
                          onChange={(e) => setFormData({ ...formData, dificultad: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                        >
                          <option value="normal">Normal</option>
                          <option value="asistido">Asistido</option>
                          <option value="cesarea">Cesárea</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Estado de la Cerda
                        </label>
                        <input
                          type="text"
                          value={formData.estado_cerda}
                          onChange={(e) => setFormData({ ...formData, estado_cerda: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Ej: Saludable, Débil, etc."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Veterinario</label>
                      <input
                        type="text"
                        value={formData.veterinario}
                        onChange={(e) => setFormData({ ...formData, veterinario: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
                      <textarea
                        value={formData.observaciones}
                        onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        rows="3"
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="secondary" onClick={closeModal}>
                    Cancelar
                  </Button>
                  <Button type="submit">{editingItem ? 'Actualizar' : 'Registrar'}</Button>
                </div>
              </form>
            </div>
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

export default Reproduction
