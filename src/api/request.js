import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'

const request = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

// Request interceptor: add JWT token
request.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: handle errors and extract data
request.interceptors.response.use(
  (response) => {
    const body = response.data
    if (body && typeof body === 'object' && 'code' in body) {
      if (body.code >= 200 && body.code < 300) {
        return body.data !== undefined ? body.data : body
      }
      ElMessage.error(body.message || 'Request failed')
      if (body.code === 401) {
        const authStore = useAuthStore()
        authStore.logout()
      }
      return Promise.reject(new Error(body.message || 'Request failed'))
    }
    return body
  },
  (error) => {
    let msg = 'Network error'
    if (error.response) {
      const body = error.response.data
      msg = (body && body.message) || `Request failed (${error.response.status})`
      if (error.response.status === 401) {
        const authStore = useAuthStore()
        authStore.logout()
      }
    }
    ElMessage.error(msg)
    return Promise.reject(error)
  }
)

export default request
