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
  calcularOcupacion,
  getEstadoOcupacion,
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

  // Estados para modales
  const [showModalGrupo, setShowModalGrupo] = useState(false)
  const [showModalAnimales, setShowModalAnimales] = useState(false)
  const [showModalAsignar, setShowModalAsignar] = useState(false)

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
  // Funciones auxiliares
  // ============================================
  const gruposFiltrados = grupos.filter((g) => {
    if (filtroTipo === 'todos') return true
    return g.tipo === filtroTipo
  })

  const animalesDisponibles = animales.filter((a) => {
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
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>🏠 Grupos y Corrales</h2>
        <button className="btn btn-primary" onClick={handleNuevoGrupo}>
          <i className="bi bi-plus-circle"></i> Nuevo Grupo
        </button>
      </div>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-6">
              <label className="form-label">Filtrar por tipo:</label>
              <select
                className="form-select"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
              >
                <option value="todos">Todos los grupos</option>
                <option value="engorde">Engorde</option>
                <option value="reproduccion">Reproducción</option>
              </select>
            </div>
            <div className="col-md-6 text-end mt-3 mt-md-0">
              <div className="badge bg-primary me-2">
                Total: {gruposFiltrados.length} grupos
              </div>
              <div className="badge bg-success me-2">
                Activos: {gruposFiltrados.filter((g) => g.activo).length}
              </div>
              <div className="badge bg-info">
                Animales: {gruposFiltrados.reduce((sum, g) => sum + (g.cantidad_actual || 0), 0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de grupos (Card View) */}
      {gruposFiltrados.length === 0 ? (
        <div className="alert alert-info">
          <p className="mb-0">
            {filtroTipo === 'todos'
              ? 'No hay grupos registrados. Cree uno nuevo para comenzar.'
              : `No hay grupos de tipo "${filtroTipo}".`}
          </p>
        </div>
      ) : (
        <div className="row">
          {gruposFiltrados.map((grupo) => {
            const ocupacion = calcularOcupacion(grupo.cantidad_actual, grupo.capacidad)
            const estadoOcupacion = getEstadoOcupacion(grupo.cantidad_actual, grupo.capacidad)

            return (
              <div key={grupo.id} className="col-md-6 col-lg-4 mb-4">
                <div className="card h-100 shadow-sm">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                      <span className="badge bg-secondary me-2">{grupo.codigo}</span>
                      {grupo.nombre || 'Sin nombre'}
                    </h5>
                    {!grupo.activo && (
                      <span className="badge bg-danger">Inactivo</span>
                    )}
                  </div>

                  <div className="card-body">
                    {/* Tipo y Corral */}
                    <div className="mb-3">
                      <span className={`badge ${grupo.tipo === 'engorde' ? 'bg-info' : 'bg-warning'} me-2`}>
                        {grupo.tipo === 'engorde' ? '🐖 Engorde' : '🐷 Reproducción'}
                      </span>
                      {grupo.corral_numero && (
                        <span className="badge bg-secondary">
                          Corral #{grupo.corral_numero}
                        </span>
                      )}
                    </div>

                    {/* Capacidad */}
                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <small className="text-muted">Ocupación</small>
                        <small>
                          <strong>{grupo.cantidad_actual || 0}/{grupo.capacidad}</strong>
                          {' '}({ocupacion}%)
                        </small>
                      </div>
                      <div className="progress" style={{ height: '20px' }}>
                        <div
                          className={`progress-bar ${getProgressBarClass(ocupacion)}`}
                          role="progressbar"
                          style={{ width: `${ocupacion}%` }}
                          aria-valuenow={ocupacion}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        >
                          {ocupacion}%
                        </div>
                      </div>
                      <div className="text-center mt-1">
                        <span className={`badge bg-${estadoOcupacion.color}`}>
                          {estadoOcupacion.label}
                        </span>
                      </div>
                    </div>

                    {/* Información adicional */}
                    <div className="small text-muted">
                      <p className="mb-1">
                        <strong>Creación:</strong> {formatearFecha(grupo.fecha_creacion)}
                      </p>
                      {grupo.fecha_salida_programada && (
                        <p className="mb-1">
                          <strong>Salida programada:</strong>{' '}
                          {formatearFecha(grupo.fecha_salida_programada)}
                        </p>
                      )}
                      {grupo.peso_promedio > 0 && (
                        <p className="mb-1">
                          <strong>Peso promedio:</strong> {grupo.peso_promedio} kg
                        </p>
                      )}
                      {grupo.notas && (
                        <p className="mb-1">
                          <strong>Notas:</strong> {grupo.notas.substring(0, 50)}
                          {grupo.notas.length > 50 && '...'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="card-footer bg-white border-top">
                    <div className="d-flex justify-content-between">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleVerAnimales(grupo)}
                        disabled={grupo.cantidad_actual === 0}
                      >
                        <i className="bi bi-list"></i> Ver Animales
                      </button>
                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() => handleAsignarAnimal(grupo)}
                        disabled={!puedeAsignarAnimal(grupo)}
                      >
                        <i className="bi bi-plus"></i> Asignar
                      </button>
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
    </div>
  )
}

export default Groups
