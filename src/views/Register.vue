<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const formRef = ref()
const loading = ref(false)
const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const rules = {
  username: [
    { required: true, message: 'Please enter a username', trigger: 'blur' },
    { min: 3, message: 'Username must be at least 3 characters', trigger: 'blur' },
  ],
  email: [
    { required: true, message: 'Please enter your email', trigger: 'blur' },
    { type: 'email', message: 'Please enter a valid email address', trigger: 'blur' },
  ],
  password: [
    { required: true, message: 'Please enter a password', trigger: 'blur' },
    { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: 'Please confirm your password', trigger: 'blur' },
    {
      validator: (_, value, cb) => {
        if (value !== form.password) cb(new Error('Passwords do not match'))
        else cb()
      },
      trigger: 'blur',
    },
  ],
}

async function handleRegister() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const user = await auth.register({
        username: form.username,
        email: form.email,
        password: form.password,
      })
      ElMessage.success(`Welcome, ${user.username}! Your account is ready.`)
      router.push('/')
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
      <h2 class="auth-title">Create an Account</h2>
      <p class="auth-sub">Join the marketplace in seconds</p>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="0" size="large">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="Username" />
        </el-form-item>
        <el-form-item prop="email">
          <el-input v-model="form.email" placeholder="Email" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="Password (min. 6 characters)" show-password />
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" placeholder="Confirm password" show-password @keyup.enter="handleRegister" />
        </el-form-item>
        <el-button type="primary" :loading="loading" class="submit-btn" @click="handleRegister">Create Account</el-button>
      </el-form>

      <div class="auth-footer">
        Already have an account? <router-link to="/login">Sign in</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: calc(100vh - 60px);
  display: flex; align-items: center; justify-content: center;
  background: #4b9cd3;
}
.auth-card {
  width: 420px; background: #fff; border-radius: 12px;
  padding: 40px 32px; box-shadow: 0 10px 40px rgba(0,0,0,0.15);
}
.auth-title { font-size: 24px; font-weight: 600; margin-bottom: 6px; }
.auth-sub { color: #909399; font-size: 14px; margin-bottom: 28px; }
.submit-btn { width: 100%; margin-top: 8px; }
.auth-footer { text-align: center; margin-top: 20px; font-size: 14px; color: #606266; }
</style>
