import { useState, useEffect } from 'react'
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
  calcularOcupacion,
  getEstadoInfo,
  formatearFecha,
  puedeAsignarAnimal,
} from '../services/groupService'
import { getAnimals } from '../services/animalService'

const Groups = () => {
  // ============================================
  // Estados
  // ============================================
  const [grupos, setGrupos] = useState([])
  const [animales, setAnimales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtroTipo, setFiltroTipo] = useState('todos') // todos, engorde, reproduccion
  const [filtroEstado, setFiltroEstado] = useState('todos') // todos, en_creacion, incompleto, completo, etc.

  // Estados para modales
  const [showModalGrupo, setShowModalGrupo] = useState(false)
  const [showModalAnimales, setShowModalAnimales] = useState(false)
  const [showModalAsignar, setShowModalAsignar] = useState(false)
  const [showModalSalida, setShowModalSalida] = useState(false)

  // Estados para formularios
  const [grupoActual, setGrupoActual] = useState(null)
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

  // Estados para gestión de animales
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null)
  const [animalesGrupo, setAnimalesGrupo] = useState([])
  const [animalSeleccionado, setAnimalSeleccionado] = useState('')
  const [tipoSalida, setTipoSalida] = useState('total') // total o parcial

  // ============================================
  // Efectos
  // ============================================
  useEffect(() => {
    loadData()
  }, [])

  // ============================================
  // Funciones de carga de datos
  // ============================================
  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔍 Cargando datos de grupos y animales...')

      const [gruposData, animalesData] = await Promise.all([
        getGrupos(),
        getAnimals(),
      ])

      console.log('✅ Datos cargados:', {
        grupos: gruposData.length,
        animales: animalesData.length,
      })

      setGrupos(gruposData || [])
      setAnimales(animalesData || [])
    } catch (err) {
      console.error('❌ Error al cargar datos:', err)
      setError(err.message || 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const loadAnimalesGrupo = async (grupoId) => {
    try {
      const animalesData = await getAnimalesByGrupo(grupoId, false)
      setAnimalesGrupo(animalesData || [])
    } catch (err) {
      console.error('❌ Error al cargar animales del grupo:', err)
      alert('Error al cargar animales del grupo: ' + err.message)
    }
  }

  // ============================================
  // Funciones de manejo de formularios
  // ============================================
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleNuevoGrupo = async () => {
    try {
      const nextCodigo = await getNextCodigoGrupo()
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
      setGrupoActual(null)
      setShowModalGrupo(true)
    } catch (err) {
      alert('Error al obtener código: ' + err.message)
    }
  }

  const handleEditarGrupo = (grupo) => {
    setGrupoActual(grupo)
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
    setShowModalGrupo(true)
  }

  const handleSubmitGrupo = async (e) => {
    e.preventDefault()

    try {
      // Validaciones
      if (!formData.codigo || !formData.tipo || !formData.capacidad) {
        alert('Por favor complete los campos requeridos: código, tipo y capacidad')
        return
      }

      if (formData.capacidad < 1) {
        alert('La capacidad debe ser mayor a 0')
        return
      }

      if (grupoActual) {
        // Actualizar
        await updateGrupo(grupoActual.id, formData)
        alert('Grupo actualizado exitosamente')
      } else {
        // Crear nuevo
        await createGrupo(formData)
        alert('Grupo creado exitosamente')
      }

      setShowModalGrupo(false)
      loadData()
    } catch (err) {
      alert('Error al guardar grupo: ' + err.message)
    }
  }

  const handleEliminarGrupo = async (grupo) => {
    if (!confirm(`¿Está seguro de eliminar el grupo ${grupo.codigo}?`)) {
      return
    }

    try {
      await deleteGrupo(grupo.id)
      alert('Grupo eliminado exitosamente')
      loadData()
    } catch (err) {
      alert('Error al eliminar grupo: ' + err.message)
    }
  }

  // ============================================
  // Funciones de gestión de animales
  // ============================================
  const handleVerAnimales = async (grupo) => {
    setGrupoSeleccionado(grupo)
    await loadAnimalesGrupo(grupo.id)
    setShowModalAnimales(true)
  }

  const handleAsignarAnimal = (grupo) => {
    if (!puedeAsignarAnimal(grupo)) {
      alert('El grupo está lleno o inactivo')
      return
    }

    setGrupoSeleccionado(grupo)
    setAnimalSeleccionado('')
    setShowModalAsignar(true)
  }

  const handleSubmitAsignar = async (e) => {
    e.preventDefault()

    if (!animalSeleccionado) {
      alert('Por favor seleccione un animal')
      return
    }

    try {
      await asignarAnimalGrupo(
        parseInt(animalSeleccionado),
        grupoSeleccionado.id
      )
      alert('Animal asignado exitosamente')
      setShowModalAsignar(false)
      loadData()
    } catch (err) {
      alert('Error al asignar animal: ' + err.message)
    }
  }

  const handleRemoverAnimal = async (animalId) => {
    if (!confirm('¿Está seguro de remover este animal del grupo?')) {
      return
    }

    try {
      await removerAnimalGrupo(animalId, grupoSeleccionado.id)
      alert('Animal removido exitosamente')
      await loadAnimalesGrupo(grupoSeleccionado.id)
      loadData()
    } catch (err) {
      alert('Error al remover animal: ' + err.message)
    }
  }

  // ============================================
  // Funciones de gestión de estados (Diagrama UML)
  // ============================================
  const handleConfirmarGrupo = async (grupo) => {
    if (!confirm(`¿Confirmar grupo ${grupo.codigo}? Esto cambiará su estado a Incompleto/Completo.`)) {
      return
    }

    try {
      const result = await confirmarGrupo(grupo.id)
      alert(result.message)
      if (result.notificacion) {
        alert(`🔔 ${result.notificacion}`)
      }
      loadData()
    } catch (err) {
      alert('Error al confirmar grupo: ' + err.message)
    }
  }

  const handleIniciarSalida = async (grupo) => {
    if (!confirm(`¿Iniciar proceso de salida para el grupo ${grupo.codigo}?`)) {
      return
    }

    try {
      const result = await iniciarSalidaGrupo(grupo.id)
      alert(result.message)
      loadData()
    } catch (err) {
      alert('Error al iniciar salida: ' + err.message)
    }
  }

  const handleCompletarSalida = (grupo) => {
    setGrupoSeleccionado(grupo)
    setTipoSalida('total')
    setShowModalSalida(true)
  }

  const handleSubmitSalida = async (e) => {
    e.preventDefault()

    try {
      const result = await completarSalidaGrupo(grupoSeleccionado.id, tipoSalida)
      alert(result.message)
      setShowModalSalida(false)
      loadData()
    } catch (err) {
      alert('Error al completar salida: ' + err.message)
    }
  }

  // ============================================
  // Funciones auxiliares
  // ============================================
  const gruposFiltrados = (grupos || []).filter((g) => {
    const cumpleTipo = filtroTipo === 'todos' || g.tipo === filtroTipo
    const cumpleEstado = filtroEstado === 'todos' || g.estado_calculado === filtroEstado
    return cumpleTipo && cumpleEstado
  })

  const animalesDisponibles = (animales || []).filter((a) => {
    // Solo mostrar animales del mismo tipo que el grupo y que no estén asignados
    if (!grupoSeleccionado) return false
    if (a.tipo !== grupoSeleccionado.tipo) return false
    if (a.estado !== 'activo') return false
    
    // Verificar si el animal ya está asignado a algún grupo activo
    // (esto se puede mejorar consultando al backend)
    return true
  })

  const getProgressBarClass = (porcentaje) => {
    if (porcentaje >= 100) return 'bg-danger'
    if (porcentaje >= 80) return 'bg-warning'
    if (porcentaje >= 50) return 'bg-info'
    return 'bg-success'
  }

  // ============================================
  // Renderizado
  // ============================================
  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando grupos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadData}>
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid mt-4 px-4">
      {/* Header mejorado */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">
                <i className="bi bi-grid-3x3-gap-fill text-primary me-2"></i>
                Grupos y Corrales
              </h2>
              <p className="text-muted mb-0">Gestión de grupos con control de estados</p>
            </div>
            <button className="btn btn-primary btn-lg shadow-sm" onClick={handleNuevoGrupo}>
              <i className="bi bi-plus-circle me-2"></i>
              Nuevo Grupo
            </button>
          </div>
        </div>
      </div>

      {/* Filtros mejorados */}
      <div className="card mb-4 shadow-sm border-0">
        <div className="card-body">
          <div className="row g-3 align-items-center">
            {/* Filtro por Tipo */}
            <div className="col-md-4">
              <label className="form-label fw-bold mb-1">
                <i className="bi bi-funnel me-1"></i>
                Tipo de Grupo
              </label>
              <select
                className="form-select"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
              >
                <option value="todos">Todos los tipos</option>
                <option value="engorde">🐖 Engorde</option>
                <option value="reproduccion">🐷 Reproducción</option>
              </select>
            </div>

            {/* Filtro por Estado */}
            <div className="col-md-4">
              <label className="form-label fw-bold mb-1">
                <i className="bi bi-diagram-3 me-1"></i>
                Estado del Grupo
              </label>
              <select
                className="form-select"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="todos">Todos los estados</option>
                <option value="en_creacion">📝 En Creación</option>
                <option value="incompleto">⏳ Incompleto</option>
                <option value="completo">✅ Completo</option>
                <option value="programado_salida">📅 Programado para Salida</option>
                <option value="en_proceso_salida">🚪 En Proceso de Salida</option>
                <option value="cerrado">🔒 Cerrado</option>
                <option value="inactivo">❌ Inactivo</option>
              </select>
            </div>

            {/* Estadísticas */}
            <div className="col-md-4">
              <label className="form-label fw-bold mb-1">Resumen</label>
              <div className="d-flex flex-wrap gap-2">
                <span className="badge bg-primary py-2 px-3">
                  <i className="bi bi-box me-1"></i>
                  Total: {gruposFiltrados.length}
                </span>
                <span className="badge bg-success py-2 px-3">
                  <i className="bi bi-check-circle me-1"></i>
                  Activos: {gruposFiltrados.filter((g) => g.activo).length}
                </span>
                <span className="badge bg-info py-2 px-3">
                  <i className="bi bi-piggy-bank me-1"></i>
                  Animales: {gruposFiltrados.reduce((sum, g) => sum + (g.cantidad_actual || 0), 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de grupos mejorada */}
      {gruposFiltrados.length === 0 ? (
        <div className="alert alert-info border-0 shadow-sm">
          <div className="d-flex align-items-center">
            <i className="bi bi-info-circle fs-3 me-3"></i>
            <div>
              <h5 className="alert-heading mb-1">No hay grupos para mostrar</h5>
              <p className="mb-0">
                {filtroTipo === 'todos' && filtroEstado === 'todos'
                  ? 'No hay grupos registrados. Cree uno nuevo para comenzar.'
                  : 'No hay grupos que coincidan con los filtros seleccionados.'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {gruposFiltrados.map((grupo) => {
            const ocupacion = calcularOcupacion(grupo.cantidad_actual, grupo.capacidad)
            const estadoInfo = getEstadoInfo(grupo.estado_calculado || grupo.estado)

            return (
              <div key={grupo.id} className="col-xl-4 col-lg-6 col-md-12">
                <div className="card h-100 shadow-sm border-0 hover-shadow" style={{ transition: 'all 0.3s' }}>
                  {/* Header de la card con estado */}
                  <div className={`card-header bg-gradient text-white d-flex justify-content-between align-items-center`}
                       style={{ background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` }}>
                    <div>
                      <h5 className="mb-0">
                        <span className="badge bg-light text-dark me-2">{grupo.codigo}</span>
                        {grupo.nombre || 'Sin nombre'}
                      </h5>
                      <small className="opacity-75">
                        {grupo.corral_numero && `Corral #${grupo.corral_numero}`}
                      </small>
                    </div>
                    <span className={`badge bg-${estadoInfo.color} fs-6 px-3 py-2`}>
                      {estadoInfo.icon} {estadoInfo.label}
                    </span>
                  </div>

                  <div className="card-body">
                    {/* Tipo */}
                    <div className="mb-3">
                      <span className={`badge ${grupo.tipo === 'engorde' ? 'bg-info' : 'bg-warning'} px-3 py-2`}>
                        {grupo.tipo === 'engorde' ? '🐖 Engorde' : '🐷 Reproducción'}
                      </span>
                    </div>

                    {/* Capacidad con barra de progreso mejorada */}
                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-2">
                        <small className="text-muted fw-bold">Ocupación</small>
                        <small className="fw-bold">
                          {grupo.cantidad_actual || 0}/{grupo.capacidad} ({ocupacion}%)
                        </small>
                      </div>
                      <div className="progress" style={{ height: '12px' }}>
                        <div
                          className={`progress-bar ${
                            ocupacion >= 100 ? 'bg-danger' :
                            ocupacion >= 80 ? 'bg-warning' :
                            ocupacion >= 50 ? 'bg-info' : 'bg-success'
                          }`}
                          role="progressbar"
                          style={{ width: `${ocupacion}%` }}
                          aria-valuenow={ocupacion}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        >
                          {ocupacion}%
                        </div>
                      </div>
                    </div>

                    {/* Alertas de fecha de salida */}
                    {grupo.dias_hasta_salida !== null && grupo.dias_hasta_salida <= 7 && (
                      <div className={`alert ${grupo.dias_hasta_salida <= 3 ? 'alert-danger' : 'alert-warning'} py-2 mb-3`}>
                        <small className="mb-0">
                          <i className="bi bi-exclamation-triangle me-1"></i>
                          <strong>Salida en {grupo.dias_hasta_salida} días</strong>
                          {grupo.fecha_salida_programada && ` - ${formatearFecha(grupo.fecha_salida_programada)}`}
                        </small>
                      </div>
                    )}

                    {/* Información adicional */}
                    <div className="row g-2 mb-3 text-muted small">
                      <div className="col-6">
                        <i className="bi bi-calendar-event me-1"></i>
                        <strong>Creación:</strong><br/>
                        {formatearFecha(grupo.fecha_creacion)}
                      </div>
                      {grupo.fecha_salida_programada && (
                        <div className="col-6">
                          <i className="bi bi-calendar-check me-1"></i>
                          <strong>Salida:</strong><br/>
                          {formatearFecha(grupo.fecha_salida_programada)}
                        </div>
                      )}
                    </div>

                    {/* Notas */}
                    {grupo.notas && (
                      <div className="mb-3">
                        <small className="text-muted">
                          <i className="bi bi-sticky me-1"></i>
                          {grupo.notas}
                        </small>
                      </div>
                    )}
                  </div>

                  {/* Footer con acciones según estado */}
                  <div className="card-footer bg-light border-0">
                    <div className="d-flex gap-2 flex-wrap">
                      {/* Botones según estado del diagrama UML */}
                      {grupo.estado_calculado === 'en_creacion' && (
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleConfirmarGrupo(grupo)}
                        >
                          <i className="bi bi-check-circle me-1"></i>
                          Confirmar Grupo
                        </button>
                      )}

                      {(grupo.estado_calculado === 'incompleto' || grupo.estado_calculado === 'completo') && (
                        <>
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleAsignarAnimal(grupo)}
                            disabled={!puedeAsignarAnimal(grupo)}
                          >
                            <i className="bi bi-plus-circle me-1"></i>
                            Agregar Animal
                          </button>
                          <button
                            className="btn btn-sm btn-info"
                            onClick={() => handleVerAnimales(grupo)}
                            disabled={grupo.cantidad_actual === 0}
                          >
                            <i className="bi bi-list-ul me-1"></i>
                            Ver Animales ({grupo.cantidad_actual || 0})
                          </button>
                        </>
                      )}

                      {grupo.estado_calculado === 'programado_salida' && (
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() => handleIniciarSalida(grupo)}
                        >
                          <i className="bi bi-door-open me-1"></i>
                          Iniciar Salida
                        </button>
                      )}

                      {grupo.estado_calculado === 'en_proceso_salida' && (
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleCompletarSalida(grupo)}
                        >
                          <i className="bi bi-check2-square me-1"></i>
                          Completar Salida
                        </button>
                      )}

                      {/* Botones comunes */}
                      {grupo.estado_calculado !== 'cerrado' && (
                        <>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleEditarGrupo(grupo)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleEliminarGrupo(grupo)}
                            disabled={grupo.cantidad_actual > 0}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Crear/Editar Grupo */}
      {showModalGrupo && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {grupoActual ? 'Editar Grupo' : 'Nuevo Grupo'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModalGrupo(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmitGrupo}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Código <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="codigo"
                        value={formData.codigo}
                        readOnly
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Nombre</label>
                      <input
                        type="text"
                        className="form-control"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        placeholder="Ej: Grupo Norte"
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Tipo <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        name="tipo"
                        value={formData.tipo}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="engorde">Engorde</option>
                        <option value="reproduccion">Reproducción</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Número de Corral</label>
                      <input
                        type="text"
                        className="form-control"
                        name="corral_numero"
                        value={formData.corral_numero}
                        onChange={handleInputChange}
                        placeholder="Ej: C-01"
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Capacidad <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        name="capacidad"
                        value={formData.capacidad}
                        onChange={handleInputChange}
                        min="1"
                        required
                      />
                      <small className="text-muted">
                        Recomendado: 10 para engorde, 5 para reproducción
                      </small>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Fecha de Creación</label>
                      <input
                        type="date"
                        className="form-control"
                        name="fecha_creacion"
                        value={formData.fecha_creacion}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Fecha Salida Programada</label>
                      <input
                        type="date"
                        className="form-control"
                        name="fecha_salida_programada"
                        value={formData.fecha_salida_programada}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Notas</label>
                      <textarea
                        className="form-control"
                        name="notas"
                        value={formData.notas}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Observaciones adicionales..."
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModalGrupo(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {grupoActual ? 'Actualizar' : 'Crear'} Grupo
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ver Animales del Grupo */}
      {showModalAnimales && grupoSeleccionado && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Animales del Grupo {grupoSeleccionado.codigo}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModalAnimales(false)}
                ></button>
              </div>
              <div className="modal-body">
                {animalesGrupo.length === 0 ? (
                  <div className="alert alert-info">
                    No hay animales asignados a este grupo
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Código</th>
                          <th>Raza</th>
                          <th>Sexo</th>
                          <th>Peso Actual</th>
                          <th>Fecha Ingreso</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {animalesGrupo.map((animal) => (
                          <tr key={animal.id}>
                            <td>
                              <strong>{animal.codigo}</strong>
                            </td>
                            <td>{animal.raza}</td>
                            <td>
                              <span className={`badge ${animal.sexo === 'macho' ? 'bg-primary' : 'bg-pink'}`}>
                                {animal.sexo}
                              </span>
                            </td>
                            <td>{animal.peso_actual ? `${animal.peso_actual} kg` : '-'}</td>
                            <td>{formatearFecha(animal.fecha_ingreso)}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleRemoverAnimal(animal.id)}
                              >
                                <i className="bi bi-x-circle"></i> Remover
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModalAnimales(false)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Asignar Animal */}
      {showModalAsignar && grupoSeleccionado && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Asignar Animal al Grupo {grupoSeleccionado.codigo}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModalAsignar(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmitAsignar}>
                <div className="modal-body">
                  <div className="alert alert-info">
                    <strong>Tipo de grupo:</strong>{' '}
                    <span className={`badge ${grupoSeleccionado.tipo === 'engorde' ? 'bg-info' : 'bg-warning'}`}>
                      {grupoSeleccionado.tipo}
                    </span>
                    <br />
                    <strong>Capacidad disponible:</strong>{' '}
                    {grupoSeleccionado.capacidad - grupoSeleccionado.cantidad_actual} espacios
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Seleccionar Animal <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={animalSeleccionado}
                      onChange={(e) => setAnimalSeleccionado(e.target.value)}
                      required
                    >
                      <option value="">-- Seleccione un animal --</option>
                      {animalesDisponibles.map((animal) => (
                        <option key={animal.id} value={animal.id}>
                          {animal.codigo} - {animal.raza} ({animal.sexo})
                          {animal.peso_actual && ` - ${animal.peso_actual} kg`}
                        </option>
                      ))}
                    </select>
                    {animalesDisponibles.length === 0 && (
                      <small className="text-danger">
                        No hay animales disponibles de tipo "{grupoSeleccionado.tipo}"
                      </small>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModalAsignar(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={animalesDisponibles.length === 0}
                  >
                    Asignar Animal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Completar Salida */}
      {showModalSalida && grupoSeleccionado && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSubmitSalida}>
                <div className="modal-header bg-warning text-white">
                  <h5 className="modal-title">
                    <i className="bi bi-door-open me-2"></i>
                    Completar Salida - {grupoSeleccionado.codigo}
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowModalSalida(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="alert alert-warning">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    <strong>¿Tipo de salida?</strong>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Seleccione el tipo de salida:</label>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="tipoSalida"
                        id="salidaTotal"
                        value="total"
                        checked={tipoSalida === 'total'}
                        onChange={(e) => setTipoSalida(e.target.value)}
                      />
                      <label className="form-check-label" htmlFor="salidaTotal">
                        <strong>Salida Total</strong>
                        <br />
                        <small className="text-muted">
                          Todos los animales salen y el grupo se cierra permanentemente.
                        </small>
                      </label>
                    </div>
                    <div className="form-check mt-2">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="tipoSalida"
                        id="salidaParcial"
                        value="parcial"
                        checked={tipoSalida === 'parcial'}
                        onChange={(e) => setTipoSalida(e.target.value)}
                      />
                      <label className="form-check-label" htmlFor="salidaParcial">
                        <strong>Salida Parcial</strong>
                        <br />
                        <small className="text-muted">
                          Algunos animales salen, el grupo vuelve a estado incompleto/completo según capacidad.
                        </small>
                      </label>
                    </div>
                  </div>

                  <div className="alert alert-info">
                    <small>
                      <strong>Animales actuales:</strong> {grupoSeleccionado.cantidad_actual} de {grupoSeleccionado.capacidad}
                    </small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModalSalida(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-warning">
                    <i className="bi bi-check2-square me-1"></i>
                    Completar Salida {tipoSalida === 'total' ? 'Total' : 'Parcial'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Groups
