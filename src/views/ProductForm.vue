<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { productApi, imageApi } from '../api'

const route = useRoute()
const router = useRouter()
const productId = computed(() => route.params.id ? Number(route.params.id) : null)
const isEdit = computed(() => !!productId.value)

const formRef = ref()
const loading = ref(false)
const submitting = ref(false)
const uploading = ref(false)
const categories = ref([])

const form = reactive({
  name: '',
  description: '',
  price: 0,
  category: '',
  image_id: null,        // backend image ID, linked to Neon DB
  stock: 0,
})

const imagePreview = computed(() =>
  form.image_id ? `/api/images/${form.image_id}` : ''
)

/* ---------- Image upload ---------- */
const MAX_SIZE_MB = 10
const ACCEPT = '.jpg,.jpeg,.png'

function beforeUpload(file) {
  const name = (file.name || '').toLowerCase()
  const okExt = name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png')
  if (!okExt) {
    ElMessage.error('Only JPG / PNG formats are supported')
    return false
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    ElMessage.error(`Image size must not exceed ${MAX_SIZE_MB}MB`)
    return false
  }
  return true
}

async function customUpload({ file, onSuccess, onError }) {
  if (!beforeUpload(file)) {
    onError?.(new Error('validation failed'))
    return
  }
  uploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', file)
    const res = await imageApi.upload(fd)
    // Upload succeeded: remove the old image if one existed before
    if (form.image_id && form.image_id !== res.id) {
      try { await imageApi.remove(form.image_id) } catch {}
    }
    form.image_id = res.id
    ElMessage.success('Image uploaded successfully')
    onSuccess?.(res)
  } catch (err) {
    onError?.(err)
  } finally {
    uploading.value = false
  }
}

async function handleRemoveImage() {
  if (!form.image_id) return
  try {
    await ElMessageBox.confirm('Are you sure you want to remove this image?', 'Confirm', { type: 'warning' })
    try { await imageApi.remove(form.image_id) } catch {}
    form.image_id = null
  } catch { /* user cancelled */ }
}

/* ---------- Product load / submit ---------- */
async function loadCategories() {
  try { categories.value = await productApi.categories() } catch {}
}

async function loadProduct() {
  if (!productId.value) return
  loading.value = true
  try {
    const p = await productApi.get(productId.value)
    Object.assign(form, {
      name: p.name,
      description: p.description || '',
      price: p.price,
      category: p.category || '',
      image_id: p.image_id || null,
      stock: p.stock,
    })
  } catch {
    ElMessage.error('Failed to load product')
    router.push('/products/my')
  } finally { loading.value = false }
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        image_id: form.image_id,
        stock: Number(form.stock),
      }
      if (isEdit.value) {
        await productApi.update(productId.value, payload)
        ElMessage.success('Updated successfully')
      } else {
        await productApi.create(payload)
        ElMessage.success('Created successfully')
      }
      router.push('/products/my')
    } catch { /* handled by interceptor */ }
    finally { submitting.value = false }
  })
}

onMounted(() => {
  loadCategories()
  loadProduct()
})
</script>

<template>
  <div class="container">
    <h1 class="page-title">{{ isEdit ? 'Edit Product' : 'Create Product' }}</h1>

    <div class="card" v-loading="loading">
      <el-form
        ref="formRef"
        :model="form"
        :rules="{
          name: [{ required: true, message: 'Please enter a product name', trigger: 'blur' }, { min: 2, message: 'At least 2 characters', trigger: 'blur' }],
          price: [{ required: true, message: 'Please enter a price', trigger: 'blur' }],
        }"
        label-width="100px"
        label-position="right"
        style="max-width: 640px"
      >
        <el-form-item label="Product name" prop="name">
          <el-input v-model="form.name" placeholder="Enter product name" />
        </el-form-item>
        <el-form-item label="Description">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="Product description (optional)" />
        </el-form-item>
        <el-form-item label="Category">
          <el-select v-model="form.category" placeholder="Select or enter a category" allow-create filterable default-first-option clearable style="width: 100%">
            <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-form-item label="Price" prop="price">
          <el-input-number v-model="form.price" :min="0" :precision="2" :step="10" controls-position="right" style="width: 200px" />
        </el-form-item>
        <el-form-item label="Stock">
          <el-input-number v-model="form.stock" :min="0" :precision="0" :step="10" controls-position="right" style="width: 200px" />
        </el-form-item>

        <!-- Image upload (stored in Neon PostgreSQL BYTEA) -->
        <el-form-item label="Product image">
          <el-upload
            class="image-uploader"
            :show-file-list="false"
            :accept="ACCEPT"
            :before-upload="beforeUpload"
            :http-request="customUpload"
            :disabled="uploading"
          >
            <template v-if="imagePreview">
              <div class="preview-wrap">
                <img :src="imagePreview" class="preview-img" />
                <div class="preview-mask">
                  <el-icon class="preview-icon"><ZoomIn /></el-icon>
                  <el-icon class="preview-icon" @click.stop.native="handleRemoveImage"><Delete /></el-icon>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="upload-placeholder">
                <el-icon :size="28" :class="{ uploading }"><Plus /></el-icon>
                <div class="upload-text" v-if="!uploading">Click to upload</div>
                <div class="upload-text" v-else>Uploading...</div>
              </div>
            </template>
          </el-upload>
          <div class="upload-tip">Only JPG / PNG, up to {{ MAX_SIZE_MB }}MB</div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            {{ isEdit ? 'Save Changes' : 'Create Product' }}
          </el-button>
          <el-button @click="router.back()">Cancel</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { Plus, Delete, ZoomIn } from '@element-plus/icons-vue'
export default { components: { Plus, Delete, ZoomIn } }
</script>

<style scoped>
.image-uploader :deep(.el-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color .2s;
}
.image-uploader :deep(.el-upload:hover) { border-color: #409eff; }

.upload-placeholder {
  width: 148px; height: 148px;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  color: #8c939d; gap: 6px;
}
.upload-text { font-size: 12px; }
.uploading { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.preview-wrap {
  width: 148px; height: 148px; position: relative;
}
.preview-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.preview-mask {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.55);
  display: none; align-items: center; justify-content: center; gap: 16px;
  color: #fff;
}
.preview-wrap:hover .preview-mask { display: flex; }
.preview-icon { font-size: 22px; cursor: pointer; }
.preview-icon:hover { color: #f56c6c; }

.upload-tip { font-size: 12px; color: #909399; margin-top: 6px; }
</style>
