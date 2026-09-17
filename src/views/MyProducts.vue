<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { productApi } from '../api'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()
const loading = ref(false)
const products = ref([])
const categories = ref([])
const keyword = ref('')
const page = ref(1)
const perPage = ref(10)
const total = ref(0)

async function loadCategories() {
  try { categories.value = await productApi.categories() } catch {}
}

async function loadProducts() {
  loading.value = true
  try {
    const params = { page: page.value, per_page: perPage.value, owner_id: auth.user?.id }
    if (keyword.value) params.keyword = keyword.value
    const data = await productApi.list(params)
    products.value = data.items
    total.value = data.total
  } finally { loading.value = false }
}

function handleCreate() { router.push('/products/new') }
function handleEdit(id) { router.push(`/products/${id}/edit`) }

async function handleDelete(p) {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete "${p.name}"? This action cannot be undone.`,
      'Confirm deletion',
      { type: 'warning', confirmButtonText: 'Delete', cancelButtonText: 'Cancel' }
    )
    await productApi.remove(p.id)
    ElMessage.success('Product deleted successfully')
    loadProducts()
  } catch { /* user cancelled or error handled */ }
}

onMounted(() => { loadCategories(); loadProducts() })
</script>

<template>
  <div class="container">
    <div class="flex-between mb-16">
      <h1 class="page-title">My Products</h1>
      <el-button type="primary" :icon="Plus" @click="handleCreate">List New Product</el-button>
    </div>

    <div class="card">
      <div class="toolbar mb-16">
        <el-input v-model="keyword" placeholder="Search product name" clearable style="width: 240px" :prefix-icon="Search" @keyup.enter="loadProducts" @clear="loadProducts">
          <template #append><el-button @click="loadProducts">Search</el-button></template>
        </el-input>
      </div>

      <el-table v-loading="loading" :data="products" stripe style="width: 100%">
        <el-table-column label="Product info" min-width="260">
          <template #default="{ row }">
            <div>
              <div style="font-weight: 500">{{ row.name }}</div>
              <div style="font-size: 12px; color: #909399; margin-top: 2px;">
                {{ row.description || 'No description' }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="Category" width="110">
          <template #default="{ row }">
            <el-tag v-if="row.category" size="small">{{ row.category }}</el-tag>
            <span v-else style="color: #c0c4cc">-</span>
          </template>
        </el-table-column>
        <el-table-column label="Price" width="110" align="right">
          <template #default="{ row }"><span style="color: #f56c6c; font-weight: 500">${{ row.price.toFixed(2) }}</span></template>
        </el-table-column>
        <el-table-column prop="stock" label="Stock" width="90" align="right" />
        <el-table-column label="Listed on" width="180">
          <template #default="{ row }">{{ row.created_at?.replace('T', ' ').slice(0, 16) }}</template>
        </el-table-column>
        <el-table-column label="Actions" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row.id)">Edit</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="total > perPage" class="pagination-wrap mt-16">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="perPage"
          :total="total"
          background
          layout="total, prev, pager, next"
          @current-change="loadProducts"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { Plus, Search } from '@element-plus/icons-vue'
export default { components: { Plus, Search } }
</script>

<style scoped>
.pagination-wrap { display: flex; justify-content: flex-end; }
.toolbar { display: flex; justify-content: flex-end; }
</style>
