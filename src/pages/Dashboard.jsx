import { useState, useEffect } from 'react'
import {
  getDashboardStats,
  getRecentActivities,
  getAlerts,
  getTiempoRelativo,
  getIconoActividad,
  getClaseAlerta,
} from '../services/dashboardService'

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [actividades, setActividades] = useState([])
  const [alertas, setAlertas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('📊 Cargando datos del dashboard...')

      const [statsData, actividadesData, alertasData] = await Promise.all([
        getDashboardStats(),
        getRecentActivities(8),
        getAlerts(),
      ])

      console.log('✅ Datos del dashboard cargados')

      setStats(statsData)
      setActividades(actividadesData || [])
      setAlertas(alertasData?.alertas || [])
    } catch (err) {
      console.error('❌ Error al cargar dashboard:', err)
      setError(err.message || 'Error al cargar datos del dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container-fluid mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <h5 className="mt-3 text-muted">Cargando dashboard...</h5>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container-fluid mt-4">
        <div className="alert alert-danger border-0 shadow-sm" role="alert">
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill fs-3 me-3"></i>
            <div>
              <h4 className="alert-heading mb-1">Error al cargar dashboard</h4>
              <p className="mb-2">{error}</p>
              <button className="btn btn-danger btn-sm" onClick={loadDashboardData}>
                <i className="bi bi-arrow-clockwise me-1"></i>
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid px-4 py-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
      {/* Header Mejorado */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-lg" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
            <div className="card-body py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="mb-1 fw-bold text-gradient" style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    <i className="bi bi-speedometer2 me-2"></i>
                    Dashboard BioPork
                  </h2>
                  <p className="text-muted mb-0">
                    <i className="bi bi-calendar-check me-1"></i>
                    {new Date().toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <button className="btn btn-primary btn-lg shadow-sm" onClick={loadDashboardData}>
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Actualizar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjetas de Estadísticas Principales - Diseño Mejorado */}
      <div className="row g-4 mb-4">
        {/* Card 1: Total de Animales */}
        <div className="col-xl-3 col-lg-6 col-md-6">
          <div className="card border-0 shadow-lg hover-card h-100" style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            transition: 'transform 0.3s'
          }}>
            <div className="card-body text-white p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="mb-1 opacity-75 fw-bold">TOTAL ANIMALES</p>
                  <h1 className="mb-0 fw-bold display-4">{stats?.animales?.total || 0}</h1>
                </div>
                <div className="bg-white bg-opacity-25 p-3 rounded-circle">
                  <i className="bi bi-piggy-bank fs-1"></i>
                </div>
              </div>
              <div className="d-flex justify-content-between border-top border-white border-opacity-25 pt-3">
                <span><i className="bi bi-check-circle me-1"></i>{stats?.animales?.activos || 0} Activos</span>
                <span><i className="bi bi-percent me-1"></i>{stats?.animales?.peso_promedio || 0} kg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Cerdas Reproductoras */}
        <div className="col-xl-3 col-lg-6 col-md-6">
          <div className="card border-0 shadow-lg hover-card h-100" style={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            transition: 'transform 0.3s'
          }}>
            <div className="card-body text-white p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="mb-1 opacity-75 fw-bold">CERDAS</p>
                  <h1 className="mb-0 fw-bold display-4">{stats?.animales?.cerdas || 0}</h1>
                </div>
                <div className="bg-white bg-opacity-25 p-3 rounded-circle">
                  <i className="bi bi-heart-fill fs-1"></i>
                </div>
              </div>
              <div className="d-flex justify-content-between border-top border-white border-opacity-25 pt-3">
                <span><i className="bi bi-arrow-repeat me-1"></i>{stats?.reproduccion?.ciclos_activos || 0} En Ciclo</span>
                <span><i className="bi bi-calendar-heart me-1"></i>{stats?.reproduccion?.partos_mes || 0} Partos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Engorde */}
        <div className="col-xl-3 col-lg-6 col-md-6">
          <div className="card border-0 shadow-lg hover-card h-100" style={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            transition: 'transform 0.3s'
          }}>
            <div className="card-body text-white p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="mb-1 opacity-75 fw-bold">ENGORDE</p>
                  <h1 className="mb-0 fw-bold display-4">{stats?.animales?.engorde || 0}</h1>
                </div>
                <div className="bg-white bg-opacity-25 p-3 rounded-circle">
                  <i className="bi bi-graph-up-arrow fs-1"></i>
                </div>
              </div>
              <div className="d-flex justify-content-between border-top border-white border-opacity-25 pt-3">
                <span><i className="bi bi-grid-3x3 me-1"></i>{stats?.grupos?.activos || 0} Grupos</span>
                <span><i className="bi bi-people-fill me-1"></i>{stats?.grupos?.animales_asignados || 0} Asignados</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Alertas */}
        <div className="col-xl-3 col-lg-6 col-md-6">
          <div className="card border-0 shadow-lg hover-card h-100" style={{ 
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            transition: 'transform 0.3s'
          }}>
            <div className="card-body text-white p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="mb-1 opacity-75 fw-bold">ALERTAS</p>
                  <h1 className="mb-0 fw-bold display-4">
                    {(stats?.alertas?.partos_proximos || 0) + (stats?.alertas?.vacunaciones_pendientes || 0)}
                  </h1>
                </div>
                <div className="bg-white bg-opacity-25 p-3 rounded-circle">
                  <i className="bi bi-exclamation-triangle-fill fs-1"></i>
                </div>
              </div>
              <div className="d-flex justify-content-between border-top border-white border-opacity-25 pt-3">
                <span><i className="bi bi-calendar-event me-1"></i>{stats?.alertas?.partos_proximos || 0} Partos</span>
                <span><i className="bi bi-shield-fill-check me-1"></i>{stats?.alertas?.vacunaciones_pendientes || 0} Vacunas</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjetas Secundarias */}
      <div className="row g-4 mb-4">
        {/* Grupos y Corrales */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-lg h-100">
            <div className="card-header bg-gradient text-white border-0 py-3" style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
              <h5 className="mb-0">
                <i className="bi bi-grid-3x3-gap-fill me-2"></i>
                Grupos y Corrales
              </h5>
            </div>
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-6 text-center">
                  <div className="bg-primary bg-opacity-10 p-3 rounded">
                    <h2 className="mb-1 text-primary fw-bold">{stats?.grupos?.total || 0}</h2>
                    <small className="text-muted">Total Grupos</small>
                  </div>
                </div>
                <div className="col-6 text-center">
                  <div className="bg-success bg-opacity-10 p-3 rounded">
                    <h2 className="mb-1 text-success fw-bold">{stats?.grupos?.activos || 0}</h2>
                    <small className="text-muted">Activos</small>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Ocupación Promedio</span>
                    <strong className="text-primary">{stats?.grupos?.ocupacion_promedio || 0}%</strong>
                  </div>
                  <div className="progress" style={{ height: '12px' }}>
                    <div 
                      className="progress-bar bg-primary" 
                      style={{ width: `${stats?.grupos?.ocupacion_promedio || 0}%` }}
                    ></div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="alert alert-info mb-0 py-2">
                    <small>
                      <i className="bi bi-info-circle me-1"></i>
                      <strong>{stats?.grupos?.animales_asignados || 0}</strong> animales de <strong>{stats?.grupos?.capacidad_total || 0}</strong> capacidad total
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Salud */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-lg h-100">
            <div className="card-header bg-gradient text-white border-0 py-3" style={{ 
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
            }}>
              <h5 className="mb-0">
                <i className="bi bi-heart-pulse-fill me-2"></i>
                Salud (Último Mes)
              </h5>
            </div>
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-4 text-center">
                  <div className="bg-info bg-opacity-10 p-3 rounded">
                    <i className="bi bi-shield-fill-check fs-1 text-info mb-2"></i>
                    <h3 className="mb-1 text-info fw-bold">{stats?.salud?.vacunaciones_mes || 0}</h3>
                    <small className="text-muted">Vacunaciones</small>
                  </div>
                </div>
                <div className="col-4 text-center">
                  <div className="bg-warning bg-opacity-10 p-3 rounded">
                    <i className="bi bi-bandaid-fill fs-1 text-warning mb-2"></i>
                    <h3 className="mb-1 text-warning fw-bold">{stats?.salud?.enfermedades_mes || 0}</h3>
                    <small className="text-muted">Enfermedades</small>
                  </div>
                </div>
                <div className="col-4 text-center">
                  <div className="bg-danger bg-opacity-10 p-3 rounded">
                    <i className="bi bi-capsule fs-1 text-danger mb-2"></i>
                    <h3 className="mb-1 text-danger fw-bold">{stats?.salud?.tratamientos_activos || 0}</h3>
                    <small className="text-muted">Tratamientos</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reproducción */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-lg h-100">
            <div className="card-header bg-gradient text-white border-0 py-3" style={{ 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
            }}>
              <h5 className="mb-0">
                <i className="bi bi-heart-fill me-2"></i>
                Reproducción (Último Mes)
              </h5>
            </div>
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-4 text-center">
                  <div className="bg-danger bg-opacity-10 p-3 rounded">
                    <i className="bi bi-arrow-repeat fs-1 text-danger mb-2"></i>
                    <h3 className="mb-1 text-danger fw-bold">{stats?.reproduccion?.ciclos_activos || 0}</h3>
                    <small className="text-muted">Ciclos</small>
                  </div>
                </div>
                <div className="col-4 text-center">
                  <div className="bg-success bg-opacity-10 p-3 rounded">
                    <i className="bi bi-balloon-heart-fill fs-1 text-success mb-2"></i>
                    <h3 className="mb-1 text-success fw-bold">{stats?.reproduccion?.partos_mes || 0}</h3>
                    <small className="text-muted">Partos</small>
                  </div>
                </div>
                <div className="col-4 text-center">
                  <div className="bg-info bg-opacity-10 p-3 rounded">
                    <i className="bi bi-people-fill fs-1 text-info mb-2"></i>
                    <h3 className="mb-1 text-info fw-bold">{stats?.reproduccion?.lechones_nacidos_mes || 0}</h3>
                    <small className="text-muted">Lechones</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas y Actividad Reciente - Diseño Mejorado */}
      <div className="row g-4">
        {/* Alertas */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-lg h-100">
            <div className="card-header bg-gradient text-white border-0 py-3" style={{ 
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
            }}>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-bell-fill me-2"></i>
                  Alertas y Notificaciones
                </h5>
                <span className="badge bg-white text-dark fs-6 px-3 py-2">{alertas.length}</span>
              </div>
            </div>
            <div className="card-body p-0" style={{ maxHeight: '450px', overflowY: 'auto' }}>
              {alertas.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <i className="bi bi-check-circle fs-1 text-success mb-3 d-block"></i>
                  <h5>¡Todo al día!</h5>
                  <p className="mb-0">No hay alertas pendientes</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {alertas.slice(0, 10).map((alerta, index) => (
                    <div
                      key={index}
                      className="list-group-item border-start-0 border-end-0 hover-bg-light p-3"
                      style={{ transition: 'background-color 0.2s' }}
                    >
                      <div className="d-flex">
                        <div className={`text-${getClaseAlerta(alerta.severidad)} me-3`}>
                          <i className={`bi ${
                            alerta.severidad === 'danger' ? 'bi-exclamation-triangle-fill' :
                            alerta.severidad === 'warning' ? 'bi-exclamation-circle-fill' :
                            'bi-info-circle-fill'
                          } fs-2`}></i>
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="mb-0 fw-bold">{alerta.titulo}</h6>
                            <span className={`badge bg-${getClaseAlerta(alerta.severidad)} ms-2`}>
                              {alerta.tipo}
                            </span>
                          </div>
                          <p className="mb-2 text-muted small">{alerta.mensaje}</p>
                          <small className="text-muted">
                            <i className="bi bi-clock me-1"></i>
                            {getTiempoRelativo(alerta.fecha)}
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-lg h-100">
            <div className="card-header bg-gradient text-white border-0 py-3" style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-activity me-2"></i>
                  Actividad Reciente
                </h5>
                <span className="badge bg-white text-dark fs-6 px-3 py-2">{actividades.length}</span>
              </div>
            </div>
            <div className="card-body p-0" style={{ maxHeight: '450px', overflowY: 'auto' }}>
              {actividades.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <i className="bi bi-inbox fs-1 text-secondary mb-3 d-block"></i>
                  <h5>Sin actividad</h5>
                  <p className="mb-0">No hay actividad reciente registrada</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {actividades.map((actividad, index) => (
                    <div 
                      key={index} 
                      className="list-group-item border-start-0 border-end-0 hover-bg-light p-3"
                      style={{ transition: 'background-color 0.2s' }}
                    >
                      <div className="d-flex align-items-start">
                        <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3" style={{ width: '48px', height: '48px' }}>
                          <div className="text-center" style={{ fontSize: '1.5rem', lineHeight: '32px' }}>
                            {getIconoActividad(actividad.tipo)}
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start mb-1">
                            <h6 className="mb-0 fw-bold">{actividad.titulo}</h6>
                            <span className="badge bg-primary ms-2">{actividad.modulo}</span>
                          </div>
                          <p className="mb-2 text-muted small">{actividad.descripcion}</p>
                          <div className="d-flex align-items-center text-muted small">
                            <i className="bi bi-clock me-1"></i>
                            {getTiempoRelativo(actividad.fecha)}
                            {actividad.usuario && (
                              <>
                                <span className="mx-2">•</span>
                                <i className="bi bi-person me-1"></i>
                                {actividad.usuario}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
