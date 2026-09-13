<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { productApi } from '../api'

const router = useRouter()
const loading = ref(false)
const products = ref([])
const categories = ref([])
const page = ref(1)
const perPage = ref(12)
const total = ref(0)

const filters = reactive({
  keyword: '',
  category: '',
  min_price: null,
  max_price: null,
})

let searchTimer = null

async function loadCategories() {
  try {
    categories.value = await productApi.categories()
  } catch { /* ignore */ }
}

async function loadProducts() {
  loading.value = true
  try {
    const params = { page: page.value, per_page: perPage.value }
    if (filters.keyword) params.keyword = filters.keyword
    if (filters.category) params.category = filters.category
    if (filters.min_price != null && filters.min_price !== '') params.min_price = filters.min_price
    if (filters.max_price != null && filters.max_price !== '') params.max_price = filters.max_price
    const data = await productApi.list(params)
    products.value = data.items
    total.value = data.total
  } finally {
    loading.value = false
  }
}

function onSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    page.value = 1
    loadProducts()
  }, 300)
}

function onReset() {
  filters.keyword = ''
  filters.category = ''
  filters.min_price = null
  filters.max_price = null
  page.value = 1
  loadProducts()
}

function onPageChange(p) {
  page.value = p
  loadProducts()
}

onMounted(() => {
  loadCategories()
  loadProducts()
})

watch(() => perPage.value, () => {
  page.value = 1
  loadProducts()
})
</script>

<template>
  <div class="container"><div class="card filter-card">
      <el-form :inline="true" :model="filters" class="filter-form">
        <el-form-item label="Keyword">
          <el-input v-model="filters.keyword" placeholder="Search name or description" clearable @input="onSearch" style="width: 220px" />
        </el-form-item>
        <el-form-item label="Category">
          <el-select v-model="filters.category" placeholder="All categories" clearable @change="onSearch" style="width: 160px">
            <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-form-item label="Price range">
          <el-input-number v-model="filters.min_price" :min="0" :precision="2" :step="10" controls-position="right" placeholder="Min" style="width: 100px" />
          <span style="margin: 0 6px; color: #909399">—</span>
          <el-input-number v-model="filters.max_price" :min="0" :precision="2" :step="10" controls-position="right" placeholder="Max" style="width: 100px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">Search</el-button>
          <el-button @click="onReset">Reset</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div v-loading="loading" class="product-grid mt-16">
      <div v-if="products.length === 0 && !loading" class="empty">
        <el-empty description="No products yet. Why not list the first one?">
          <el-button type="primary" @click="router.push('/login')">Sign in to list</el-button>
        </el-empty>
      </div>

      <el-card
        v-for="p in products"
        :key="p.id"
        class="product-card"
        shadow="hover"
        @click="router.push(`/products/${p.id}`)"
      >
        <div class="product-image">
          <img v-if="p.image_url" :src="p.image_url" :alt="p.name" />
          <div v-else class="placeholder">
            <el-icon :size="40"><Goods /></el-icon>
          </div>
        </div>
        <div class="product-info">
          <h3 class="product-name">{{ p.name }}</h3>
          <p class="product-desc">{{ p.description || 'No description' }}</p>
          <div class="product-meta">
            <el-tag v-if="p.category" size="small">{{ p.category }}</el-tag>
            <span class="stock">Stock: {{ p.stock }}</span>
          </div>
          <div class="product-bottom">
            <span class="price">${{ p.price.toFixed(2) }}</span>
            <span class="owner">by {{ p.owner_username }}</span>
          </div>
        </div>
      </el-card>
    </div>

    <div class="pagination-wrap mt-16" v-if="total > perPage">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="perPage"
        :page-sizes="[8, 12, 24, 48]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @size-change="loadProducts"
        @current-change="onPageChange"
      />
    </div>
  </div>
</template>

<style scoped>
.filter-card { margin-bottom: 0; }
.filter-card :deep(.el-form-item) { margin-bottom: 0; }
.filter-form { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; }

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  min-height: 200px;
}
.empty { grid-column: 1 / -1; }

.product-card { cursor: pointer; display: flex; flex-direction: column; overflow: hidden; transition: transform .2s; }
.product-card:hover { transform: translateY(-2px); }
.product-card :deep(.el-card__body) { padding: 0; }

.product-image {
  width: 100%; height: 160px; background: #f0f2f5;
  display: flex; align-items: center; justify-content: center; overflow: hidden;
}
.product-image img { width: 100%; height: 100%; object-fit: cover; }
.product-image .placeholder { color: #c0c4cc; }

.product-info { padding: 14px 16px 16px; flex: 1; display: flex; flex-direction: column; }
.product-name { font-size: 16px; font-weight: 600; margin-bottom: 6px; color: #303133; }
.product-desc {
  font-size: 13px; color: #909399;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden; margin-bottom: 10px;
}
.product-meta { display: flex; align-items: center; gap: 8px; margin-bottom: auto; }
.stock { font-size: 12px; color: #909399; }
.product-bottom { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
.price { font-size: 18px; font-weight: 600; color: #f56c6c; }
.owner { font-size: 12px; color: #909399; }

.pagination-wrap { display: flex; justify-content: center; padding: 16px 0; }
</style>
