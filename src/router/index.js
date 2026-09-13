import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/', name: 'home', component: () => import('../views/ProductList.vue'), meta: { title: 'Product Plaza' } },
  { path: '/login', name: 'login', component: () => import('../views/Login.vue'), meta: { title: 'Sign In' } },
  { path: '/register', name: 'register', component: () => import('../views/Register.vue'), meta: { title: 'Create Account' } },
  { path: '/products/my', name: 'my-products', component: () => import('../views/MyProducts.vue'), meta: { title: 'My Products', requiresAuth: true } },
  { path: '/products/new', name: 'product-create', component: () => import('../views/ProductForm.vue'), meta: { title: 'Create Product', requiresAuth: true } },
  { path: '/products/:id', name: 'product-detail', component: () => import('../views/ProductDetail.vue'), meta: { title: 'Product Detail' }, props: true },
  { path: '/products/:id/edit', name: 'product-edit', component: () => import('../views/ProductForm.vue'), meta: { title: 'Edit Product', requiresAuth: true }, props: true },
  { path: '/admin', name: 'admin', component: () => import('../views/Admin.vue'), meta: { title: 'Admin Dashboard', requiresAuth: true, requiresAdmin: true } },
  { path: '/help', name: 'help', component: () => import('../views/HelpPage.vue'), meta: { title: 'Help' } },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() { return { top: 0 } },
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: 'home' }
  }
})

export default router
