<script setup>
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const formRef = ref()
const loading = ref(false)
const form = reactive({
  username: '',
  password: '',
})

async function handleLogin() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const user = await auth.login({ ...form })
      ElMessage.success(`Welcome back, ${user.username}!`)
      const redirect = route.query.redirect || '/'
      router.push(redirect)
    } catch {
      // error handled by interceptor
    } finally {
      loading.value = false
    }
  })
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2 class="auth-title">Sign In</h2>
      <p class="auth-sub">Welcome back, please sign in to your account</p>

      <el-form ref="formRef" :model="form" :rules="{
        username: [{ required: true, message: 'Please enter your username', trigger: 'blur' }],
        password: [{ required: true, message: 'Please enter your password', trigger: 'blur' }],
      }" label-width="0" size="large">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="Username / Email" :prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="Password" show-password :prefix-icon="Lock" @keyup.enter="handleLogin" />
        </el-form-item>
        <el-button type="primary" :loading="loading" class="submit-btn" @click="handleLogin">Sign In</el-button>
      </el-form>

      <div class="auth-footer">
        Don't have an account? <router-link to="/register">Create one now</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { User, Lock } from '@element-plus/icons-vue'
export default { components: { User, Lock } }
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 60px);
  display: flex; align-items: center; justify-content: center;
  background: #4b9cd3;
}
.auth-card {
  width: 400px; background: #fff; border-radius: 12px;
  padding: 40px 32px; box-shadow: 0 10px 40px rgba(0,0,0,0.15);
}
.auth-title { font-size: 24px; font-weight: 600; margin-bottom: 6px; }
.auth-sub { color: #909399; font-size: 14px; margin-bottom: 28px; }
.submit-btn { width: 100%; margin-top: 8px; }
.auth-footer { text-align: center; margin-top: 20px; font-size: 14px; color: #606266; }
.auth-hint { text-align: center; margin-top: 16px; font-size: 12px; color: #909399; }
</style>
