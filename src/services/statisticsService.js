const API_URL = '/.netlify/functions'

const statisticsService = {
  // Resumen general
  async getGeneralStats() {
    const response = await fetch(`${API_URL}/get-estadisticas-generales`)
    const data = await response.json()
    return data
  },

  // Distribución por tipo de animal
  async getAnimalsByType() {
    const response = await fetch(`${API_URL}/get-animales-por-tipo`)
    const data = await response.json()
    return data
  },

  // Distribución por estado
  async getAnimalsByState() {
    const response = await fetch(`${API_URL}/get-animales-por-estado`)
    const data = await response.json()
    return data
  },

  // Distribución por sexo
  async getAnimalsBySex() {
    const response = await fetch(`${API_URL}/get-animales-por-sexo`)
    const data = await response.json()
    return data
  },

  // Grupos y ocupación
  async getGroupsStats() {
    const response = await fetch(`${API_URL}/get-estadisticas-grupos`)
    const data = await response.json()
    return data
  },

  // Estadísticas de salud
  async getHealthStats() {
    const response = await fetch(`${API_URL}/get-estadisticas-salud`)
    const data = await response.json()
    return data
  },

  // Estadísticas de reproducción
  async getReproductionStats() {
    const response = await fetch(`${API_URL}/get-estadisticas-reproduccion`)
    const data = await response.json()
    return data
  },

  // Evolución de peso (últimos 6 meses)
  async getWeightEvolution() {
    const response = await fetch(`${API_URL}/get-evolucion-peso`)
    const data = await response.json()
    return data
  }
}

export default statisticsService
