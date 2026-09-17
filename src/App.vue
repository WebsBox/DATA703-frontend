<script setup>
import { computed, ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from './stores/auth'
import { authApi } from './api'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const navItems = computed(() => [
  { name: 'home', label: 'Plaza', icon: 'Shop' },
  ...(auth.isLoggedIn ? [{ name: 'my-products', label: 'My Products', icon: 'Goods' }] : []),
  ...(auth.isAdmin ? [{ name: 'admin', label: 'Admin', icon: 'Setting' }] : []),
  { name: 'help', label: 'Help', icon: 'QuestionFilled' },
])

/* ---------- Logout ---------- */
function handleLogout() {
  ElMessageBox.confirm('Are you sure you want to sign out?', 'Confirm', {
    confirmButtonText: 'Sign out',
    cancelButtonText: 'Cancel',
    type: 'warning',
  }).then(() => {
    auth.logout()
    ElMessage.success('Signed out')
    router.push({ name: 'home' })
  }).catch(() => {})
}

/* ---------- Change password ---------- */
const pwdDialog = ref(false)
const pwdLoading = ref(false)
const pwdFormRef = ref()
const pwdForm = reactive({
  old_password: '',
  new_password: '',
  confirm_password: '',
})
const pwdRules = {
  old_password: [{ required: true, message: 'Please enter your current password', trigger: 'blur' }],
  new_password: [
    { required: true, message: 'Please enter a new password', trigger: 'blur' },
    { min: 6, message: 'New password must be at least 6 characters', trigger: 'blur' },
  ],
  confirm_password: [
    { required: true, message: 'Please confirm your new password', trigger: 'blur' },
    {
      validator: (_, value, cb) => {
        if (value !== pwdForm.new_password) cb(new Error('Passwords do not match'))
        else cb()
      },
      trigger: 'blur',
    },
  ],
}

function openChangePassword() {
  pwdForm.old_password = ''
  pwdForm.new_password = ''
  pwdForm.confirm_password = ''
  pwdDialog.value = true
}

async function submitChangePassword() {
  if (!pwdFormRef.value) return
  await pwdFormRef.value.validate(async (valid) => {
    if (!valid) return
    pwdLoading.value = true
    try {
      await authApi.changePassword({
        old_password: pwdForm.old_password,
        new_password: pwdForm.new_password,
      })
      ElMessage.success('Password changed successfully. Please sign in again.')
      pwdDialog.value = false
      // Force logout so user signs in with the new password
      auth.logout()
      router.push({ name: 'login' })
    } catch { /* handled by interceptor */ }
    finally { pwdLoading.value = false }
  })
}

const userDropdownCommands = [
  { command: 'password', label: 'Change Password', icon: 'Lock' },
  { command: 'logout', label: 'Sign Out', icon: 'SwitchButton' },
]

function handleUserCommand(cmd) {
  if (cmd === 'password') openChangePassword()
  else if (cmd === 'logout') handleLogout()
}
</script>

<template>
  <el-container class="app-root">
    <el-header class="app-header">
      <div class="header-left">
        <router-link to="/" class="logo">
          <img src="./assets/UNC.svg" alt="logo" class="logo-img" />
          <span>UNC Second-hand</span>
        </router-link>
        <nav class="nav">
          <router-link
            v-for="item in navItems"
            :key="item.name"
            :to="{ name: item.name }"
            class="nav-item"
            :class="{ active: route.name === item.name }"
          >
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.label }}</span>
          </router-link>
        </nav>
      </div>

      <div class="header-right">
        <template v-if="auth.isLoggedIn">
          <el-dropdown trigger="hover" @command="handleUserCommand" :show-timeout="100" :hide-timeout="150">
            <span class="user-info" style="cursor: pointer;">
              <el-avatar :size="28">{{ auth.user?.username?.[0]?.toUpperCase() }}</el-avatar>
              <span class="username">{{ auth.user?.username }}</span>
              <el-icon class="caret"><ArrowDown /></el-icon>
              <el-tag v-if="auth.isAdmin" type="danger" size="small" class="role-tag">Admin</el-tag>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="it in userDropdownCommands" :key="it.command" :command="it.command">
                  <el-icon><component :is="it.icon" /></el-icon>
                  <span>{{ it.label }}</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <el-button link type="primary" @click="router.push({ name: 'login' })">Sign In</el-button>
          <el-button type="primary" @click="router.push({ name: 'register' })">Sign Up</el-button>
        </template>
      </div>
    </el-header>

    <el-main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </el-main>

    <!-- Change password dialog -->
    <el-dialog v-model="pwdDialog" title="Change Password" width="420px" destroy-on-close>
      <el-form ref="pwdFormRef" :model="pwdForm" :rules="pwdRules" label-width="120px">
        <el-form-item label="Current password" prop="old_password">
          <el-input v-model="pwdForm.old_password" type="password" show-password placeholder="Enter current password" />
        </el-form-item>
        <el-form-item label="New password" prop="new_password">
          <el-input v-model="pwdForm.new_password" type="password" show-password placeholder="At least 6 characters" />
        </el-form-item>
        <el-form-item label="Confirm new password" prop="confirm_password">
          <el-input v-model="pwdForm.confirm_password" type="password" show-password placeholder="Re-enter new password" @keyup.enter="submitChangePassword" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="pwdDialog = false">Cancel</el-button>
        <el-button type="primary" :loading="pwdLoading" @click="submitChangePassword">Confirm</el-button>
      </template>
    </el-dialog>
  </el-container>
</template>

<script>
import { ArrowDown, Lock, SwitchButton, QuestionFilled } from '@element-plus/icons-vue'
export default { components: { ArrowDown, Lock, SwitchButton, QuestionFilled } }
</script>

<style scoped>
.app-root { min-height: 100vh; }
.app-header {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 24px; height: 60px;
  position: sticky; top: 0; z-index: 100;
}
.header-left { display: flex; align-items: center; gap: 28px; }
.logo {
  display: flex; align-items: center; gap: 26px;
  font-size: 18px; font-weight: 600; color: #303133;
  text-decoration: none !important;
}
.logo-img { height: 50px; width: auto; }
.nav { display: flex; gap: 4px; }
.nav-item {
  display: flex; align-items: center; gap: 4px;
  padding: 6px 14px; border-radius: 6px;
  color: #606266; font-size: 14px;
  text-decoration: none !important;
  transition: all .2s;
}
.nav-item:hover { background: #f0f2f5; color: #409eff; }
.nav-item.active { background: #ecf5ff; color: #409eff; font-weight: 500; }

.header-right { display: flex; align-items: center; gap: 12px; }
.user-info {
  display: flex; align-items: center; gap: 8px;
  padding: 4px 8px; border-radius: 6px;
  transition: background .2s;
}
.user-info:hover { background: #f0f2f5; }
.username { font-size: 14px; color: #303133; }
.role-tag { margin-left: 4px; }
.caret { font-size: 12px; color: #909399; }

.app-main { padding: 0; background: #f5f7fa; }

.fade-enter-active, .fade-leave-active { transition: opacity .15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
