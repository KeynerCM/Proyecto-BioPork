import axios from 'axios'

const API_URL = '/.netlify/functions'

export const vacunacionService = {
  getAll: async () => {
    const response = await axios.get(`${API_URL}/get-vacunaciones`)
    return response.data
  },

  create: async (data) => {
    const response = await axios.post(`${API_URL}/create-vacunacion`, data)
    return response.data
  },

  update: async (data) => {
    const response = await axios.put(`${API_URL}/update-vacunacion`, data)
    return response.data
  },

  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/delete-vacunacion?id=${id}`)
    return response.data
  }
}

export const enfermedadService = {
  getAll: async () => {
    const response = await axios.get(`${API_URL}/get-enfermedades`)
    return response.data
  },

  create: async (data) => {
    const response = await axios.post(`${API_URL}/create-enfermedad`, data)
    return response.data
  },

  update: async (data) => {
    const response = await axios.put(`${API_URL}/update-enfermedad`, data)
    return response.data
  },

  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/delete-enfermedad?id=${id}`)
    return response.data
  }
}
