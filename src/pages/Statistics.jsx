import { useState, useEffect } from 'react'
import { BarChart3, PieChart, TrendingUp, Users, Activity, Heart, Package, AlertCircle } from 'lucide-react'
import Card from '../components/Card'
import statisticsService from '../services/statisticsService'

function Statistics() {
  const [loading, setLoading] = useState(true)
  const [generalStats, setGeneralStats] = useState(null)
  const [animalsByType, setAnimalsByType] = useState([])
  const [animalsByState, setAnimalsByState] = useState([])
  const [animalsBySex, setAnimalsBySex] = useState([])
  const [groupsStats, setGroupsStats] = useState(null)
  const [healthStats, setHealthStats] = useState(null)
  const [reproductionStats, setReproductionStats] = useState(null)

  useEffect(() => {
    loadAllStats()
  }, [])

  const loadAllStats = async () => {
    try {
      setLoading(true)
      
      // Cargar todas las estadísticas en paralelo
      const [general, byType, byState, bySex, groups, health, reproduction] = await Promise.all([
        statisticsService.getGeneralStats(),
        statisticsService.getAnimalsByType(),
        statisticsService.getAnimalsByState(),
        statisticsService.getAnimalsBySex(),
        statisticsService.getGroupsStats(),
        statisticsService.getHealthStats(),
        statisticsService.getReproductionStats()
      ])

      if (general.success) setGeneralStats(general.data)
      if (byType.success) setAnimalsByType(byType.data)
      if (byState.success) setAnimalsByState(byState.data)
      if (bySex.success) setAnimalsBySex(bySex.data)
      if (groups.success) setGroupsStats(groups.data)
      if (health.success) setHealthStats(health.data)
      if (reproduction.success) setReproductionStats(reproduction.data)

    } catch (error) {
      console.error('Error al cargar estadísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const getColorByType = (type) => {
    const colors = {
      'cerdo': 'bg-pink-500',
      'cerda': 'bg-purple-500',
      'verraco': 'bg-blue-600',
      'lechon': 'bg-yellow-500'
    }
    return colors[type] || 'bg-gray-500'
  }

  const getColorByState = (state) => {
    const colors = {
      'activo': 'bg-green-500',
      'enfermo': 'bg-red-500',
      'cuarentena': 'bg-orange-500',
      'vendido': 'bg-blue-500',
      'muerto': 'bg-gray-600'
    }
    return colors[state] || 'bg-gray-500'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Estadísticas</h1>
        <Card>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Cargando estadísticas...</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Estadísticas</h1>
        <p className="text-gray-600">Análisis y reportes de la granja</p>
      </div>

      {/* KPIs Generales */}
      {generalStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                  <Users className="text-blue-600" size={28} />
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-1">Total Animales</p>
              <p className="text-3xl font-bold text-gray-800">{generalStats.total_animales}</p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">
                  <Activity className="text-green-600" size={28} />
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-1">Animales Activos</p>
              <p className="text-3xl font-bold text-gray-800">{generalStats.animales_activos}</p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center">
                  <Package className="text-purple-600" size={28} />
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-1">Grupos Activos</p>
              <p className="text-3xl font-bold text-gray-800">{generalStats.grupos_activos}</p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-pink-100 flex items-center justify-center">
                  <Heart className="text-pink-600" size={28} />
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-1">Peso Promedio</p>
              <p className="text-3xl font-bold text-gray-800">
                {parseFloat(generalStats.peso_promedio).toFixed(1)} kg
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Distribuciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Por Tipo */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <PieChart className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Por Tipo de Animal</h3>
                <p className="text-sm text-gray-500">Distribución de animales</p>
              </div>
            </div>

            {animalsByType.length > 0 ? (
              <div className="space-y-4">
                {animalsByType.map((item) => {
                  const percentage = ((item.cantidad / generalStats.total_animales) * 100).toFixed(1)
                  return (
                    <div key={item.tipo}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 capitalize">{item.tipo}</span>
                        <span className="text-sm text-gray-600">{item.cantidad} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${getColorByType(item.tipo)}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No hay datos disponibles</p>
            )}
          </div>
        </Card>

        {/* Por Estado */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Activity className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Por Estado</h3>
                <p className="text-sm text-gray-500">Condición de los animales</p>
              </div>
            </div>

            {animalsByState.length > 0 ? (
              <div className="space-y-4">
                {animalsByState.map((item) => {
                  const percentage = ((item.cantidad / generalStats.total_animales) * 100).toFixed(1)
                  return (
                    <div key={item.estado}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 capitalize">{item.estado}</span>
                        <span className="text-sm text-gray-600">{item.cantidad} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${getColorByState(item.estado)}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No hay datos disponibles</p>
            )}
          </div>
        </Card>

        {/* Por Sexo */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Users className="text-purple-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Por Sexo</h3>
                <p className="text-sm text-gray-500">Distribución por género</p>
              </div>
            </div>

            {animalsBySex.length > 0 ? (
              <div className="space-y-4">
                {animalsBySex.map((item) => {
                  const percentage = ((item.cantidad / generalStats.total_animales) * 100).toFixed(1)
                  const color = item.sexo === 'Macho' ? 'bg-blue-500' : 'bg-pink-500'
                  return (
                    <div key={item.sexo}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">{item.sexo}</span>
                        <span className="text-sm text-gray-600">{item.cantidad} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${color}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No hay datos disponibles</p>
            )}
          </div>
        </Card>

        {/* Grupos */}
        {groupsStats && (
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Package className="text-orange-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Grupos y Corrales</h3>
                  <p className="text-sm text-gray-500">Ocupación y capacidad</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Total Grupos</span>
                  <span className="text-lg font-semibold text-gray-800">{groupsStats.total_grupos}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Capacidad Total</span>
                  <span className="text-lg font-semibold text-gray-800">{groupsStats.capacidad_total}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Animales en Grupos</span>
                  <span className="text-lg font-semibold text-gray-800">{groupsStats.animales_en_grupos}</span>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Ocupación</span>
                    <span className="text-sm text-gray-600">
                      {((groupsStats.animales_en_grupos / groupsStats.capacidad_total) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-orange-500"
                      style={{ 
                        width: `${Math.min(100, (groupsStats.animales_en_grupos / groupsStats.capacidad_total) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Salud y Reproducción */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Salud */}
        {healthStats && (
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                  <AlertCircle className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Salud</h3>
                  <p className="text-sm text-gray-500">Vacunaciones y tratamientos</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Vacunaciones</p>
                  <p className="text-2xl font-bold text-blue-600">{healthStats.total_vacunaciones}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Enfermedades</p>
                  <p className="text-2xl font-bold text-red-600">{healthStats.total_enfermedades}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Vacunas Pendientes (próximos 7 días)</p>
                  <p className="text-2xl font-bold text-purple-600">{healthStats.vacunas_proximas}</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Reproducción */}
        {reproductionStats && (
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center">
                  <Heart className="text-pink-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Reproducción</h3>
                  <p className="text-sm text-gray-500">Ciclos y nacimientos</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Cerdas Activas</p>
                  <p className="text-2xl font-bold text-purple-600">{reproductionStats.cerdas_activas}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">En Gestación</p>
                  <p className="text-2xl font-bold text-blue-600">{reproductionStats.en_gestacion}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Partos Esperados</p>
                  <p className="text-2xl font-bold text-green-600">{reproductionStats.partos_esperados}</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Lechones</p>
                  <p className="text-2xl font-bold text-yellow-600">{reproductionStats.total_lechones}</p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

export default Statistics

