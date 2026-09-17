<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminApi } from '../api'

const activeTab = ref('stats')
const stats = ref({ user_count: 0, admin_count: 0, product_count: 0 })

const userLoading = ref(false)
const users = ref([])
const userKeyword = ref('')
const userPage = ref(1)
const userPageSize = ref(10)
const userTotal = ref(0)
const editUser = ref(null)
const editDialogVisible = ref(false)

const productLoading = ref(false)
const adminProducts = ref([])
const productKeyword = ref('')
const productPage = ref(1)
const productPageSize = ref(10)
const productTotal = ref(0)

async function loadStats() {
  try { stats.value = await adminApi.stats() } catch {}
}

async function loadUsers() {
  userLoading.value = true
  try {
    const params = { page: userPage.value, per_page: userPageSize.value }
    if (userKeyword.value) params.keyword = userKeyword.value
    const data = await adminApi.users(params)
    users.value = data.items
    userTotal.value = data.total
  } finally { userLoading.value = false }
}

async function loadAdminProducts() {
  productLoading.value = true
  try {
    const params = { page: productPage.value, per_page: productPageSize.value }
    if (productKeyword.value) params.keyword = productKeyword.value
    const data = await adminApi.products(params)
    adminProducts.value = data.items
    productTotal.value = data.total
  } finally { productLoading.value = false }
}

function openEditUser(u) {
  editUser.value = { id: u.id, username: u.username, email: u.email, role: u.role, password: '' }
  editDialogVisible.value = true
}

async function saveUserEdit() {
  if (!editUser.value) return
  try {
    const payload = { role: editUser.value.role }
    if (editUser.value.password) payload.password = editUser.value.password
    await adminApi.updateUser(editUser.value.id, payload)
    ElMessage.success('Updated successfully')
    editDialogVisible.value = false
    loadUsers()
  } catch { /* handled */ }
}

async function handleDeleteUser(u) {
  try {
    await ElMessageBox.confirm(
      `Delete user "${u.username}"? All their products will also be removed.`,
      'Confirm',
      { type: 'warning' }
    )
    await adminApi.deleteUser(u.id)
    ElMessage.success('Deleted successfully')
    loadUsers()
  } catch { /* handled */ }
}

onMounted(() => { loadStats(); loadUsers(); loadAdminProducts() })
</script>

<template>
  <div class="container">
    <h1 class="page-title">Admin Dashboard</h1>

    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="Overview" name="stats">
        <div class="stats-grid">
          <div class="stat-card blue">
            <div class="stat-value">{{ stats.user_count }}</div>
            <div class="stat-label">Total users</div>
          </div>
          <div class="stat-card orange">
            <div class="stat-value">{{ stats.admin_count }}</div>
            <div class="stat-label">Admins</div>
          </div>
          <div class="stat-card green">
            <div class="stat-value">{{ stats.product_count }}</div>
            <div class="stat-label">Total products</div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="Users" name="users">
        <div class="toolbar">
          <el-input v-model="userKeyword" placeholder="Search username or email" clearable style="width: 260px" :prefix-icon="Search" @keyup.enter="loadUsers" @clear="loadUsers">
            <template #append><el-button @click="loadUsers">Search</el-button></template>
          </el-input>
        </div>

        <el-table v-loading="userLoading" :data="users" stripe style="width: 100%; margin-top: 16px">
          <el-table-column prop="username" label="Username" width="160" />
          <el-table-column prop="email" label="Email" min-width="220" />
          <el-table-column label="Role" width="120">
            <template #default="{ row }">
              <el-tag :type="row.role === 'admin' ? 'danger' : 'info'" size="small">
                {{ row.role === 'admin' ? 'Admin' : 'User' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Joined" width="180">
            <template #default="{ row }">{{ row.created_at?.replace('T', ' ').slice(0, 16) }}</template>
          </el-table-column>
          <el-table-column label="Actions" width="180" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="openEditUser(row)">Edit</el-button>
              <el-button link type="danger" size="small" @click="handleDeleteUser(row)">Delete</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div v-if="userTotal > userPageSize" class="pagination-wrap mt-16">
          <el-pagination
            v-model:current-page="userPage"
            v-model:page-size="userPageSize"
            :total="userTotal"
            background
            layout="total, sizes, prev, pager, next"
            @current-change="loadUsers"
            @size-change="loadUsers"
          />
        </div>
      </el-tab-pane>

      <el-tab-pane label="All Products" name="products">
        <div class="toolbar">
          <el-input v-model="productKeyword" placeholder="Search product name" clearable style="width: 260px" :prefix-icon="Search" @keyup.enter="loadAdminProducts" @clear="loadAdminProducts">
            <template #append><el-button @click="loadAdminProducts">Search</el-button></template>
          </el-input>
        </div>

        <el-table v-loading="productLoading" :data="adminProducts" stripe style="width: 100%; margin-top: 16px">
          <el-table-column prop="name" label="Product name" min-width="180" />
          <el-table-column prop="category" label="Category" width="120">
            <template #default="{ row }">{{ row.category || '-' }}</template>
          </el-table-column>
          <el-table-column label="Price" width="110" align="right">
            <template #default="{ row }">${{ row.price.toFixed(2) }}</template>
          </el-table-column>
          <el-table-column prop="stock" label="Stock" width="90" align="right" />
          <el-table-column prop="owner_username" label="Owner" width="140" />
          <el-table-column label="Listed on" width="180">
            <template #default="{ row }">{{ row.created_at?.replace('T', ' ').slice(0, 16) }}</template>
          </el-table-column>
        </el-table>

        <div v-if="productTotal > productPageSize" class="pagination-wrap mt-16">
          <el-pagination
            v-model:current-page="productPage"
            v-model:page-size="productPageSize"
            :total="productTotal"
            background
            layout="total, sizes, prev, pager, next"
            @current-change="loadAdminProducts"
            @size-change="loadAdminProducts"
          />
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- Edit User Dialog -->
    <el-dialog v-model="editDialogVisible" title="Edit User" width="420px" destroy-on-close>
      <el-form v-if="editUser" :model="editUser" label-width="80px">
        <el-form-item label="Username">
          <el-input :model-value="editUser.username" disabled />
        </el-form-item>
        <el-form-item label="Email">
          <el-input :model-value="editUser.email" disabled />
        </el-form-item>
        <el-form-item label="Role">
          <el-select v-model="editUser.role" style="width: 100%">
            <el-option label="User" value="user" />
            <el-option label="Admin" value="admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="Reset password">
          <el-input v-model="editUser.password" type="password" show-password placeholder="Leave blank to keep unchanged" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="saveUserEdit">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { Search } from '@element-plus/icons-vue'
export default { components: { Search } }
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding: 8px 0;
}
.stat-card {
  padding: 24px; border-radius: 10px; color: #fff; text-align: center;
}
.stat-card.blue { background: linear-gradient(135deg, #667eea, #764ba2); }
.stat-card.orange { background: linear-gradient(135deg, #f093fb, #f5576c); }
.stat-card.green { background: linear-gradient(135deg, #4facfe, #00f2fe); }
.stat-value { font-size: 36px; font-weight: 600; }
.stat-label { font-size: 14px; opacity: .85; margin-top: 4px; }

.toolbar { display: flex; justify-content: flex-end; }
.pagination-wrap { display: flex; justify-content: flex-end; }
</style>
