import request from './request'

export const authApi = {
  register: (data) => request.post('/auth/register', data),
  login: (data) => request.post('/auth/login', data),
  me: () => request.get('/auth/me'),
  changePassword: (data) => request.post('/auth/change-password', data),
}

export const productApi = {
  list: (params) => request.get('/products', { params }),
  categories: () => request.get('/products/categories'),
  get: (id) => request.get(`/products/${id}`),
  create: (data) => request.post('/products', data),
  update: (id, data) => request.put(`/products/${id}`, data),
  remove: (id) => request.delete(`/products/${id}`),
}

export const imageApi = {
  // upload 接收 FormData（含 file 字段），返回 { id, image_url, filename, size }
  upload: (formData) =>
    request.post('/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  remove: (id) => request.delete(`/images/${id}`),
}

export const adminApi = {
  stats: () => request.get('/admin/stats'),
  users: (params) => request.get('/admin/users', { params }),
  updateUser: (id, data) => request.put(`/admin/users/${id}`, data),
  deleteUser: (id) => request.delete(`/admin/users/${id}`),
  products: (params) => request.get('/admin/products', { params }),
}
