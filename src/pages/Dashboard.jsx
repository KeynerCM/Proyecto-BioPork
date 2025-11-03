import { useState, useEffect } from 'react'
import { PiggyBank, Heart, Syringe, AlertCircle, Users, TrendingUp, Activity } from 'lucide-react'
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
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando dashboard...</p>
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
          <button className="btn btn-primary" onClick={loadDashboardData}>
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  const statsCards = [
    {
      title: 'Total de Animales',
      value: stats?.animales?.total || 0,
      icon: PiggyBank,
      color: 'primary',
      detail: `${stats?.animales?.activos || 0} activos`,
      bgColor: 'bg-primary',
    },
    {
      title: 'Cerdas Reproductoras',
      value: stats?.animales?.cerdas || 0,
      icon: Heart,
      color: 'danger',
      detail: `${stats?.reproduccion?.ciclos_activos || 0} en ciclo`,
      bgColor: 'bg-danger',
    },
    {
      title: 'Animales de Engorde',
      value: stats?.animales?.engorde || 0,
      icon: PiggyBank,
      color: 'success',
      detail: `${stats?.grupos?.animales_asignados || 0} en grupos`,
      bgColor: 'bg-success',
    },
    {
      title: 'Alertas Pendientes',
      value: (stats?.alertas?.partos_proximos || 0) + (stats?.alertas?.vacunaciones_pendientes || 0),
      icon: AlertCircle,
      color: 'warning',
      detail: `${stats?.salud?.tratamientos_activos || 0} tratamientos activos`,
      bgColor: 'bg-warning',
    },
  ]

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="h2 text-gray-800 mb-2">📊 Dashboard</h1>
        <p className="text-muted">Resumen general de tu granja porcina</p>
      </div>

      {/* Estadísticas Principales */}
      <div className="row mb-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.title} className="col-md-6 col-lg-3 mb-3">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted small mb-1">{stat.title}</p>
                      <h3 className="mb-1">{stat.value}</h3>
                      <p className="text-muted small mb-0">{stat.detail}</p>
                    </div>
                    <div className={`${stat.bgColor} text-white p-3 rounded`}>
                      <Icon size={24} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Estadísticas Adicionales */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <Users size={20} className="text-primary me-2" />
                <h6 className="mb-0">Grupos y Corrales</h6>
              </div>
              <div className="row text-center">
                <div className="col-6">
                  <h4 className="mb-0">{stats?.grupos?.activos || 0}</h4>
                  <small className="text-muted">Grupos activos</small>
                </div>
                <div className="col-6">
                  <h4 className="mb-0">{stats?.grupos?.ocupacion_promedio || 0}%</h4>
                  <small className="text-muted">Ocupación</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <Syringe size={20} className="text-success me-2" />
                <h6 className="mb-0">Salud (último mes)</h6>
              </div>
              <div className="row text-center">
                <div className="col-6">
                  <h4 className="mb-0">{stats?.salud?.vacunaciones_mes || 0}</h4>
                  <small className="text-muted">Vacunaciones</small>
                </div>
                <div className="col-6">
                  <h4 className="mb-0">{stats?.salud?.enfermedades_mes || 0}</h4>
                  <small className="text-muted">Tratamientos</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <Heart size={20} className="text-danger me-2" />
                <h6 className="mb-0">Reproducción (último mes)</h6>
              </div>
              <div className="row text-center">
                <div className="col-6">
                  <h4 className="mb-0">{stats?.reproduccion?.partos_mes || 0}</h4>
                  <small className="text-muted">Partos</small>
                </div>
                <div className="col-6">
                  <h4 className="mb-0">{stats?.reproduccion?.lechones_nacidos_mes || 0}</h4>
                  <small className="text-muted">Lechones</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas y Actividad Reciente */}
      <div className="row">
        {/* Alertas */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <AlertCircle size={20} className="me-2" />
                  Alertas y Notificaciones
                </h5>
                <span className="badge bg-danger">{alertas.length}</span>
              </div>
            </div>
            <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {alertas.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <p>No hay alertas pendientes</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {alertas.slice(0, 10).map((alerta, index) => (
                    <div
                      key={index}
                      className={`list-group-item list-group-item-${getClaseAlerta(alerta.severidad)} border-0 mb-2`}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">{alerta.titulo}</h6>
                          <p className="mb-1 small">{alerta.mensaje}</p>
                          <small className="text-muted">
                            {getTiempoRelativo(alerta.fecha)}
                          </small>
                        </div>
                        <span className={`badge bg-${getClaseAlerta(alerta.severidad)}`}>
                          {alerta.tipo}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <Activity size={20} className="me-2" />
                  Actividad Reciente
                </h5>
                <span className="badge bg-info">{actividades.length}</span>
              </div>
            </div>
            <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {actividades.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <p>No hay actividad reciente</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {actividades.map((actividad, index) => (
                    <div key={index} className="list-group-item border-0 px-0">
                      <div className="d-flex align-items-start">
                        <span className="me-3" style={{ fontSize: '1.5rem' }}>
                          {getIconoActividad(actividad.tipo)}
                        </span>
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{actividad.titulo}</h6>
                          <p className="mb-1 small text-muted">{actividad.descripcion}</p>
                          <small className="text-muted">
                            {getTiempoRelativo(actividad.fecha)}
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
      </div>
    </div>
  )
}

export default Dashboard
