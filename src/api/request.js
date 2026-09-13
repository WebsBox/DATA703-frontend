import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'

// 后端域名（开发代理 target 与生产 API 同源）
export const API_ORIGIN = 'https://2hand.houzhaohan.vip'
export const API_BASE = `${API_ORIGIN}/api`

const request = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
})

/**
 * 将图片相对路径转为完整绝对 URL
 * 后端返回的 image_url 是相对路径如 /api/images/5
 * 在 Cloudflare Pages 等静态部署环境下需要补上后端域名前缀
 */
export function getImageUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//.test(path)) return path  // 已经是绝对 URL，直接返回
  if (!API_ORIGIN) return path                // 没有配置后端域名，原样返回（开发代理场景）
  if (path.startsWith('/')) return `${API_ORIGIN}${path}`
  return `${API_ORIGIN}/${path}`
}

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
