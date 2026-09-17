<template>
  <div class="help-page">
    <div class="help-hero">
      <h1>Help Center</h1>
      <p>Everything you need to know about buying, selling, and managing products on our platform.</p>
    </div>

    <el-divider />

    <!-- 1. How to buy -->
    <section class="help-section">
      <div class="section-title">
        <el-icon :size="28" color="#409eff"><ShoppingCart /></el-icon>
        <h2>How to Purchase a Product</h2>
      </div>
      <ol class="steps">
        <li>
          <strong>Browse the Product Plaza.</strong> Click <em>Product Plaza</em> in the top navigation to see all listed
          products. Use the search bar and category / price filters to narrow down results.
        </li>
        <li>
          <strong>Open a product detail page.</strong> Click on any product card to view full information — images,
          description, price, stock status, and the seller's contact email.
        </li>
        <li>
          <strong>Contact the seller.</strong> On the product detail page you'll find the seller's email address. Click
          the mail link or copy it to your clipboard, then reach out directly to discuss payment, delivery, and any
          questions about the item.
        </li>
        <li>
          <strong>Complete the transaction.</strong> Our platform does not handle payments or shipments — all
          arrangements are made directly between buyer and seller. Always verify the product before sending payment.
        </li>
      </ol>
    </section>

    <!-- 2. How to publish -->
    <section class="help-section">
      <div class="section-title">
        <el-icon :size="28" color="#67c23a"><Upload /></el-icon>
        <h2>How to Publish a Product</h2>
      </div>
      <ol class="steps">
        <li>
          <strong>Sign in.</strong> You must have an account to list products. If you don't have one yet, click
          <em>Register</em> in the top-right corner to create a free account.
        </li>
        <li>
          <strong>Go to "My Products".</strong> After logging in, the <em>My Products</em> navigation item becomes
          visible. Click it, then press the <em>New Product</em> button.
        </li>
        <li>
          <strong>Fill in the product form.</strong> Provide a clear title, a detailed description, a category, a fair
          price, and the number of items in stock.
        </li>
        <li>
          <strong>Upload an image.</strong> Click the image upload area and choose a JPG or PNG file (max 10 MB). A
          preview will appear once the upload succeeds. You can replace or remove it before saving.
        </li>
        <li>
          <strong>Publish.</strong> Click <em>Create Product</em>. Your listing is now live in the Product Plaza and
          buyers can start contacting you.
        </li>
      </ol>
    </section>

    <!-- 3. How to manage -->
    <section class="help-section">
      <div class="section-title">
        <el-icon :size="28" color="#e6a23c"><Edit /></el-icon>
        <h2>How to Manage "My Products"</h2>
      </div>
      <ol class="steps">
        <li>
          <strong>View your listings.</strong> In the <em>My Products</em> page you'll see every product you've
          published, along with its current stock and category.
        </li>
        <li>
          <strong>Edit a product.</strong> Click the pencil icon on any card to change title, description, price,
          category, stock, or replace the image. Remember to save your changes.
        </li>
        <li>
          <strong>Delete a product.</strong> Use the trash icon to remove a listing you no longer want to offer. This
          action is permanent — the product and its image are deleted from our database.
        </li>
        <li>
          <strong>Keep stock up to date.</strong> If an item sells out, mark it with stock <code>0</code> so buyers know
          it's temporarily unavailable.
        </li>
      </ol>
    </section>

    <!-- 4. Team -->
    <el-divider />
    <section class="help-section team-section">
      <div class="section-title">
        <el-icon :size="28" color="#909399"><User /></el-icon>
        <h2>About the Development Team</h2>
      </div>
      <div class="unc-course-block">
        <img :src="uncLogo" alt="UNC" class="unc-logo" />
        <p class="course-text">
          A project for <strong>DATA703</strong> — University of North Carolina at Chapel Hill
        </p>
      </div>
      <p class="team-intro">
        This platform is a student project built for educational purposes. It demonstrates a full-stack web
        application with a Python Flask backend, a Vue 3 + Element Plus frontend, and a Neon PostgreSQL cloud
        database. We designed it to be clean, responsive, and easy to extend.
      </p>
      <el-row :gutter="20" class="team-cards">
        <el-col :xs="24" :sm="12" v-for="m in teamMembers" :key="m.name">
          <el-card class="team-card" shadow="hover">
            <div class="avatar" :style="{ background: m.color }">{{ m.name[0] }}</div>
            <h3>{{ m.name }}</h3>
            <div class="role">{{ m.role }}</div>
            <p class="bio">{{ m.bio }}</p>
            <a class="email" :href="`mailto:${m.email}`">{{ m.email }}</a>
          </el-card>
        </el-col>
      </el-row>
    </section>

    <footer class="help-footer">
      Still have questions? Drop us a line — you can reach any team member at the email listed on their card.
    </footer>
  </div>
</template>

<script setup>
import { ShoppingCart, Upload, Edit, User } from '@element-plus/icons-vue'
import uncLogo from '../assets/UNC.svg'

const teamMembers = [
  {
    name: 'Zhaohan Hou',
    role: 'Full-Stack Developer',
    bio: 'Backend development, database design, and core marketplace functions, including product CRUD operations and user authentication.',
    color: '#409eff',
    email: 'houzh@unc.edu',
  },
  {
    name: 'Jiaxin Wang',
    role: 'Data Scientist',
    bio: 'Requirement analysis, data processing and analytics, testing, documentation, and the visualization component of the system.',
    color: '#67c23a',
    email: 'jwang3@unc.edu',
  },
]
</script>

<style scoped>
.help-page {
  max-width: 880px;
  margin: 0 auto;
  padding: 48px 24px 64px;
  color: #303133;
  line-height: 1.7;
}

.help-hero {
  text-align: center;
  padding: 16px 0 8px;
}
.help-hero h1 {
  font-size: 34px;
  font-weight: 700;
  margin: 0 0 8px;
  color: #1f2937;
}
.help-hero p {
  font-size: 16px;
  color: #606266;
  margin: 0;
}

.unc-course-block {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  background: #f4f9fd;
  border: 1px solid #d6eaf8;
  border-radius: 10px;
  margin-bottom: 20px;
}
.unc-course-block .unc-logo {
  height: 48px;
  width: auto;
  flex-shrink: 0;
}
.course-text {
  margin: 0 !important;
  font-size: 14px;
  color: #4b9cd3;
  letter-spacing: 0.3px;
}

.help-section {
  margin: 36px 0;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}
.section-title h2 {
  font-size: 22px;
  margin: 0;
  font-weight: 600;
}

.steps {
  padding-left: 22px;
  margin: 0;
}
.steps li {
  margin-bottom: 12px;
  color: #4b5563;
  font-size: 15px;
}
.steps li strong { color: #303133; }
.steps li em { color: #409eff; font-style: normal; font-weight: 500; }
.steps li code {
  background: #f0f2f5;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 13px;
  color: #c7254e;
}

.team-section .team-intro {
  color: #606266;
  margin-bottom: 24px;
  font-size: 15px;
}
.team-cards { margin-top: 12px; }
.team-card { text-align: center; border-radius: 10px; }
.team-card :deep(.el-card__body) { padding: 24px 16px 20px; }
.team-card .avatar {
  width: 64px; height: 64px; line-height: 64px;
  border-radius: 50%; margin: 0 auto 12px;
  color: #fff; font-size: 26px; font-weight: 700;
}
.team-card h3 { margin: 0 0 4px; font-size: 17px; }
.team-card .role {
  color: #409eff; font-size: 13px; font-weight: 500; margin-bottom: 10px;
}
.team-card .bio {
  margin: 0 0 12px; color: #606266; font-size: 14px; line-height: 1.6;
}
.team-card .email {
  display: inline-block;
  font-size: 13px;
  color: #4b9cd3;
  border-top: 1px solid #ebeef5;
  padding-top: 10px;
  width: 100%;
}

.help-footer {
  margin-top: 40px;
  padding: 20px;
  background: #ecf5ff;
  border-radius: 8px;
  text-align: center;
  color: #606266;
  font-size: 14px;
}
</style>
