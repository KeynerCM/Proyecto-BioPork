import axios from 'axios'

const API_URL = '/.netlify/functions'

export const cicloReproductivoService = {
  getAll: async () => {
    const response = await axios.get(`${API_URL}/get-ciclos-reproductivos`)
    return response.data
  },

  create: async (data) => {
    const response = await axios.post(`${API_URL}/create-ciclo-reproductivo`, data)
    return response.data
  },

  update: async (data) => {
    const response = await axios.put(`${API_URL}/update-ciclo-reproductivo`, data)
    return response.data
  },

  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/delete-ciclo-reproductivo?id=${id}`)
    return response.data
  }
}

export const partoService = {
  getAll: async () => {
    const response = await axios.get(`${API_URL}/get-partos`)
    return response.data
  },

  create: async (data) => {
    const response = await axios.post(`${API_URL}/create-parto`, data)
    return response.data
  },

  update: async (data) => {
    const response = await axios.put(`${API_URL}/update-parto`, data)
    return response.data
  },

  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/delete-parto?id=${id}`)
    return response.data
  }
}
