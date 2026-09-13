<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { productApi } from '../api'
import { useAuthStore } from '../stores/auth'
import { getImageUrl } from '../api/request'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const productId = computed(() => Number(route.params.id))
const loading = ref(true)
const product = ref(null)

async function loadProduct() {
  loading.value = true
  try {
    product.value = await productApi.get(productId.value)
  } catch {
    ElMessage.error('Product not found or has been removed')
    router.push('/')
  } finally {
    loading.value = false
  }
}

const isOwner = computed(() => {
  return auth.isLoggedIn && product.value && auth.user?.id === product.value.owner_id
})

const canEdit = computed(() => isOwner.value || auth.isAdmin)
const canDelete = computed(() => isOwner.value || auth.isAdmin)

function handleEdit() {
  router.push(`/products/${product.value.id}/edit`)
}

async function handleDelete() {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete "${product.value.name}"? This action cannot be undone.`,
      'Confirm deletion',
      { type: 'warning', confirmButtonText: 'Delete', cancelButtonText: 'Cancel' }
    )
    await productApi.remove(product.value.id)
    ElMessage.success('Product deleted successfully')
    if (isOwner.value) {
      router.push('/products/my')
    } else {
      router.push('/')
    }
  } catch { /* handled */ }
}

function copyEmail() {
  if (!product.value?.owner_email) return
  navigator.clipboard.writeText(product.value.owner_email).then(() => {
    ElMessage.success('Email copied to clipboard')
  }).catch(() => {
    ElMessage.warning('Copy failed, please copy manually')
  })
}

onMounted(loadProduct)
</script>

<template>
  <div class="container">
    <el-page-header @back="router.back()" style="margin-bottom: 16px" />

    <div v-loading="loading" v-if="product" class="detail-wrap">
      <!-- Left: product image -->
      <div class="detail-image card">
        <template v-if="product.image_url">
          <img :src="getImageUrl(product.image_url)" :alt="product.name" />
        </template>
        <template v-else>
          <div class="placeholder">
            <el-icon :size="80"><Picture /></el-icon>
            <span>No image</span>
          </div>
        </template>
      </div>

      <!-- Right: product info + seller info -->
      <div class="detail-info card">
        <div class="info-header">
          <el-tag v-if="product.category" size="large" effect="plain">{{ product.category }}</el-tag>
          <h1 class="info-title">{{ product.name }}</h1>
          <div class="info-price">${{ product.price.toFixed(2) }}</div>
        </div>

        <div class="info-section">
          <h3 class="section-title">Description</h3>
          <p class="section-body">{{ product.description || 'No description provided' }}</p>
        </div>

        <div class="info-section">
          <h3 class="section-title">Stock</h3>
          <el-tag :type="product.stock > 0 ? 'success' : 'danger'" size="large">
            {{ product.stock > 0 ? `In stock (${product.stock} available)` : 'Out of stock' }}
          </el-tag>
        </div>

        <!-- Seller info card -->
        <div class="seller-section">
          <h3 class="section-title">
            <el-icon><User /></el-icon> Seller info
          </h3>
          <div class="seller-card">
            <div class="seller-avatar">
              {{ product.owner_username?.[0]?.toUpperCase() }}
            </div>
            <div class="seller-detail">
              <div class="seller-name">{{ product.owner_username }}</div>
              <div class="seller-contact">
                <span class="label">Contact email:</span>
                <a :href="`mailto:${product.owner_email}`" class="email-link">
                  <el-icon><Message /></el-icon>
                  {{ product.owner_email }}
                </a>
                <el-button link type="primary" size="small" @click="copyEmail">Copy</el-button>
              </div>
            </div>
          </div>
        </div>

        <div class="info-footer">
          <span class="meta">Listed on {{ product.created_at?.replace('T', ' ').slice(0, 16) }}</span>
          <template v-if="canEdit">
            <el-button type="primary" :icon="Edit" @click="handleEdit">Edit Product</el-button>
            <el-button type="danger" :icon="Delete" @click="handleDelete">Delete</el-button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-wrap {
  display: grid;
  grid-template-columns: minmax(280px, 400px) 1fr;
  gap: 20px;
  align-items: start;
}

@media (max-width: 768px) {
  .detail-wrap { grid-template-columns: 1fr; }
}

.detail-image {
  padding: 0; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  min-height: 360px;
}
.detail-image img { width: 100%; height: 100%; object-fit: cover; max-height: 520px; }
.detail-image .placeholder {
  display: flex; flex-direction: column; gap: 12px;
  align-items: center; color: #c0c4cc; font-size: 14px;
}

.detail-info { padding: 24px; }

.info-header { margin-bottom: 20px; }
.info-title { font-size: 24px; font-weight: 600; margin: 10px 0 6px; color: #303133; }
.info-price { font-size: 32px; font-weight: 700; color: #f56c6c; }

.info-section { margin-bottom: 20px; }
.section-title {
  font-size: 14px; font-weight: 600; color: #606266;
  margin-bottom: 10px; padding-left: 10px; border-left: 3px solid #409eff;
  display: flex; align-items: center; gap: 6px;
}
.section-body { color: #606266; line-height: 1.7; font-size: 15px; white-space: pre-wrap; }

.seller-section {
  background: #fafafa; border-radius: 10px; padding: 18px;
  border: 1px solid #ebeef5;
}
.seller-card { display: flex; gap: 14px; align-items: center; }
.seller-avatar {
  width: 52px; height: 52px; border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff; font-size: 22px; font-weight: 600;
  display: flex; align-items: center; justify-content: center;
}
.seller-detail { flex: 1; }
.seller-name { font-size: 16px; font-weight: 600; color: #303133; margin-bottom: 6px; }
.seller-contact { font-size: 14px; color: #606266; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.label { color: #909399; }
.email-link {
  display: inline-flex; align-items: center; gap: 4px;
  color: #409eff; text-decoration: none;
}
.email-link:hover { text-decoration: underline; }

.info-footer {
  margin-top: 24px; padding-top: 16px;
  border-top: 1px solid #ebeef5;
  display: flex; justify-content: space-between; align-items: center; gap: 10px;
  flex-wrap: wrap;
}
.meta { color: #909399; font-size: 13px; }
</style>
