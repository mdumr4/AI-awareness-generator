import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Auth API
export const authAPI = {
  register: async (name: string, email: string, password: string) => {
    const response = await api.post("/auth/register", { name, email, password })
    return response.data
  },
  login: async (idToken: string) => {
    const response = await api.post("/auth/login", { idToken })
    return response.data
  },
  getUser: async () => {
    const response = await api.get("/auth/user")
    return response.data
  },
}

// Campaigns API
export const campaignsAPI = {
  generate: async (topic: string) => {
    const response = await api.post("/campaigns/generate", { topic })
    return response.data
  },
  list: async () => {
    const response = await api.get("/campaigns/list")
    return response.data
  },
  get: async (id: string) => {
    const response = await api.get(`/campaigns/${id}`)
    return response.data
  },
  update: async (id: string, text: string) => {
    const response = await api.put(`/campaigns/${id}`, { text })
    return response.data
  },
  delete: async (id: string) => {
    const response = await api.delete(`/campaigns/${id}`)
    return response.data
  },
  regenerate: async (id: string) => {
    const response = await api.post(`/campaigns/regenerate/${id}`)
    return response.data
  },
}

// News API
export const newsAPI = {
  getTrending: async (topic = "environment", page = 1, pageSize = 5) => {
    const response = await api.get("/news/trending", {
      params: { topic, page, pageSize },
    })
    return response.data
  },
  getTopics: async () => {
    const response = await api.get("/news/topics")
    return response.data
  },
}

export default api

