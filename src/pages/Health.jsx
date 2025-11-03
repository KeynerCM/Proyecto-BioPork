import { useState, useEffect } from 'react'
import { Syringe, Activity, Plus, Edit2, Trash2, Calendar, AlertCircle } from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import Toast from '../components/Toast'
import ConfirmDialog from '../components/ConfirmDialog'
import { vacunacionService, enfermedadService } from '../services/healthService'
import { animalService } from '../services/animalService'

function Health() {
  const [activeTab, setActiveTab] = useState('vacunaciones')
  const [vacunaciones, setVacunaciones] = useState([])
  const [enfermedades, setEnfermedades] = useState([])
  const [animales, setAnimales] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [toast, setToast] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState(null)
  
  const [formData, setFormData] = useState({
    animal_id: '',
    // Vacunación
    tipo_vacuna: '',
    fecha_aplicacion: '',
    dosis: '',
    lote_vacuna: '',
    proxima_fecha: '',
    // Enfermedad
    enfermedad: '',
    sintomas: '',
    fecha_inicio: '',
    tratamiento: '',
    medicamento: '',
    estado: 'en_tratamiento',
    fecha_recuperacion: '',
    costo: '',
    // Común
    veterinario: '',
    notas: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [vacResponse, enfResponse, animResponse] = await Promise.all([
        vacunacionService.getAll(),
        enfermedadService.getAll(),
        animalService.getAll()
      ])
      
      setVacunaciones(vacResponse.data || [])
      setEnfermedades(enfResponse.data || [])
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
      if (activeTab === 'vacunaciones') {
        const vacData = {
          animal_id: parseInt(formData.animal_id),
          tipo_vacuna: formData.tipo_vacuna,
          fecha_aplicacion: formData.fecha_aplicacion,
          dosis: formData.dosis,
          lote_vacuna: formData.lote_vacuna,
          proxima_fecha: formData.proxima_fecha || null,
          veterinario: formData.veterinario,
          notas: formData.notas,
        }

        if (editingItem) {
          await vacunacionService.update({ ...vacData, id: editingItem.id })
          showToast('Vacunación actualizada exitosamente', 'success')
        } else {
          await vacunacionService.create(vacData)
          showToast('Vacunación registrada exitosamente', 'success')
        }
      } else {
        const enfData = {
          animal_id: parseInt(formData.animal_id),
          enfermedad: formData.enfermedad,
          sintomas: formData.sintomas,
          fecha_inicio: formData.fecha_inicio,
          tratamiento: formData.tratamiento,
          medicamento: formData.medicamento,
          dosis: formData.dosis,
          estado: formData.estado,
          fecha_recuperacion: formData.fecha_recuperacion || null,
          veterinario: formData.veterinario,
          costo: formData.costo ? parseFloat(formData.costo) : null,
          notas: formData.notas,
        }

        if (editingItem) {
          await enfermedadService.update({ ...enfData, id: editingItem.id })
          showToast('Tratamiento actualizado exitosamente', 'success')
        } else {
          await enfermedadService.create(enfData)
          showToast('Tratamiento registrado exitosamente', 'success')
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
    
    if (activeTab === 'vacunaciones') {
      setFormData({
        animal_id: item.animal_id.toString(),
        tipo_vacuna: item.tipo_vacuna,
        fecha_aplicacion: item.fecha_aplicacion,
        dosis: item.dosis || '',
        lote_vacuna: item.lote_vacuna || '',
        proxima_fecha: item.proxima_fecha || '',
        veterinario: item.veterinario || '',
        notas: item.notas || '',
      })
    } else {
      setFormData({
        animal_id: item.animal_id.toString(),
        enfermedad: item.enfermedad,
        sintomas: item.sintomas || '',
        fecha_inicio: item.fecha_inicio,
        tratamiento: item.tratamiento || '',
        medicamento: item.medicamento || '',
        dosis: item.dosis || '',
        estado: item.estado,
        fecha_recuperacion: item.fecha_recuperacion || '',
        veterinario: item.veterinario || '',
        costo: item.costo || '',
        notas: item.notas || '',
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
          if (activeTab === 'vacunaciones') {
            await vacunacionService.delete(id)
            showToast('Vacunación eliminada exitosamente', 'success')
          } else {
            await enfermedadService.delete(id)
            showToast('Tratamiento eliminado exitosamente', 'success')
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
      animal_id: '',
      tipo_vacuna: '',
      fecha_aplicacion: '',
      dosis: '',
      lote_vacuna: '',
      proxima_fecha: '',
      enfermedad: '',
      sintomas: '',
      fecha_inicio: '',
      tratamiento: '',
      medicamento: '',
      estado: 'en_tratamiento',
      fecha_recuperacion: '',
      costo: '',
      veterinario: '',
      notas: '',
    })
  }

  const getEstadoBadge = (estado) => {
    const styles = {
      en_tratamiento: 'bg-yellow-100 text-yellow-800',
      recuperado: 'bg-green-100 text-green-800',
      cronico: 'bg-red-100 text-red-800',
    }
    const labels = {
      en_tratamiento: 'En Tratamiento',
      recuperado: 'Recuperado',
      cronico: 'Crónico',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[estado]}`}>
        {labels[estado]}
      </span>
    )
  }

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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Control Sanitario</h1>
          <p className="text-gray-600">Gestión de vacunaciones y tratamientos</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={20} className="mr-2" />
          Nuevo Registro
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('vacunaciones')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'vacunaciones'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Syringe size={18} />
          Vacunaciones ({vacunaciones.length})
        </button>
        <button
          onClick={() => setActiveTab('enfermedades')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'enfermedades'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Activity size={18} />
          Enfermedades y Tratamientos ({enfermedades.length})
        </button>
      </div>

      {/* Contenido de Vacunaciones */}
      {activeTab === 'vacunaciones' && (
        <Card>
          {vacunaciones.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <Syringe size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No hay vacunaciones registradas</p>
              <p className="text-sm mt-2">Crea el primer registro para comenzar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Animal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vacuna</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Aplicación</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Próxima Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Veterinario</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vacunaciones.map((vac) => (
                    <tr key={vac.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{vac.animal_codigo}</div>
                        <div className="text-sm text-gray-500">{vac.animal_raza}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{vac.tipo_vacuna}</div>
                        {vac.dosis && <div className="text-sm text-gray-500">Dosis: {vac.dosis}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(vac.fecha_aplicacion).toLocaleDateString('es')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {vac.proxima_fecha ? (
                          <div className="flex items-center text-sm">
                            <Calendar size={14} className="mr-1 text-orange-500" />
                            {new Date(vac.proxima_fecha).toLocaleDateString('es')}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {vac.veterinario || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(vac)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(vac.id, 'vacunación', vac.tipo_vacuna)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
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
      )}

      {/* Contenido de Enfermedades */}
      {activeTab === 'enfermedades' && (
        <Card>
          {enfermedades.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <Activity size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No hay enfermedades registradas</p>
              <p className="text-sm mt-2">Crea el primer registro para comenzar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Animal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enfermedad</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Inicio</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicamento</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Costo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {enfermedades.map((enf) => (
                    <tr key={enf.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{enf.animal_codigo}</div>
                        <div className="text-sm text-gray-500">{enf.animal_raza}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{enf.enfermedad}</div>
                        {enf.sintomas && (
                          <div className="text-sm text-gray-500 max-w-xs truncate">{enf.sintomas}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(enf.fecha_inicio).toLocaleDateString('es')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{enf.medicamento || '-'}</div>
                        {enf.dosis && <div className="text-sm text-gray-500">{enf.dosis}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getEstadoBadge(enf.estado)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {enf.costo ? `$${parseFloat(enf.costo).toFixed(2)}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(enf)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(enf.id, 'tratamiento', enf.enfermedad)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
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
      )}

      {/* Modal de formulario */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingItem ? 'Editar' : 'Nuevo'} {activeTab === 'vacunaciones' ? 'Vacunación' : 'Tratamiento'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Selección de Animal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Animal <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.animal_id}
                    onChange={(e) => setFormData({ ...formData, animal_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="">Seleccionar animal</option>
                    {animales.map((animal) => (
                      <option key={animal.id} value={animal.id}>
                        {animal.codigo} - {animal.raza} ({animal.tipo})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Formulario de Vacunación */}
                {activeTab === 'vacunaciones' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo de Vacuna <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.tipo_vacuna}
                          onChange={(e) => setFormData({ ...formData, tipo_vacuna: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fecha de Aplicación <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={formData.fecha_aplicacion}
                          onChange={(e) => setFormData({ ...formData, fecha_aplicacion: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Dosis</label>
                        <input
                          type="text"
                          value={formData.dosis}
                          onChange={(e) => setFormData({ ...formData, dosis: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Ej: 2ml"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Lote de Vacuna</label>
                        <input
                          type="text"
                          value={formData.lote_vacuna}
                          onChange={(e) => setFormData({ ...formData, lote_vacuna: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Próxima Fecha de Aplicación
                      </label>
                      <input
                        type="date"
                        value={formData.proxima_fecha}
                        onChange={(e) => setFormData({ ...formData, proxima_fecha: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </>
                )}

                {/* Formulario de Enfermedad */}
                {activeTab === 'enfermedades' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Enfermedad <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.enfermedad}
                          onChange={(e) => setFormData({ ...formData, enfermedad: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fecha de Inicio <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={formData.fecha_inicio}
                          onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Síntomas</label>
                      <textarea
                        value={formData.sintomas}
                        onChange={(e) => setFormData({ ...formData, sintomas: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        rows="2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tratamiento</label>
                      <textarea
                        value={formData.tratamiento}
                        onChange={(e) => setFormData({ ...formData, tratamiento: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        rows="2"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Medicamento</label>
                        <input
                          type="text"
                          value={formData.medicamento}
                          onChange={(e) => setFormData({ ...formData, medicamento: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Dosis</label>
                        <input
                          type="text"
                          value={formData.dosis}
                          onChange={(e) => setFormData({ ...formData, dosis: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Ej: 10mg cada 12h"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
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
                          <option value="en_tratamiento">En Tratamiento</option>
                          <option value="recuperado">Recuperado</option>
                          <option value="cronico">Crónico</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Recuperación</label>
                        <input
                          type="date"
                          value={formData.fecha_recuperacion}
                          onChange={(e) => setFormData({ ...formData, fecha_recuperacion: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Costo ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.costo}
                          onChange={(e) => setFormData({ ...formData, costo: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Campos comunes */}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
                  <textarea
                    value={formData.notas}
                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows="3"
                  />
                </div>

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

export default Health
