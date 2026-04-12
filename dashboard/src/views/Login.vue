<template>
  <div class="min-h-screen flex items-center justify-center" style="background: #f5f5f5;">
    <!-- Login Card -->
    <div class="relative bg-white rounded-lg p-8 w-full max-w-sm mx-4" style="box-shadow: 0 2px 12px rgba(0,0,0,0.1);">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span class="text-white font-bold text-2xl">AI</span>
        </div>
        <h1 class="text-2xl font-bold" style="color: #409eff;">AI Coding PasS</h1>
        <p class="text-gray-400 text-sm mt-2">AI 开发者的超能力套装</p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="block text-gray-500 text-sm font-medium mb-2">用户名</label>
          <input 
            v-model="username"
            type="text" 
            class="w-full border rounded px-4 py-3 text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            style="border-color: #dcdfe6;"
            placeholder="输入用户名"
            required
          />
        </div>
        
        <div>
          <label class="block text-gray-500 text-sm font-medium mb-2">密码</label>
          <input 
            v-model="password"
            type="password" 
            class="w-full border rounded px-4 py-3 text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            style="border-color: #dcdfe6;"
            placeholder="输入密码"
            required
          />
        </div>

        <div v-if="error" class="rounded p-3" style="background: #fef0f0; border: 1px solid #fde2e2;">
          <p class="text-sm" style="color: #f56c6c;">{{ error }}</p>
        </div>

        <button 
          type="submit"
          :disabled="loading"
          class="w-full py-3 font-medium flex items-center justify-center space-x-2 rounded-lg transition-all duration-150 select-none shadow-sm hover:brightness-105 active:brightness-95 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
          style="background: #409eff; color: white;"
        >
          <span v-if="loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <span v-else>登录</span>
        </button>
      </form>

      <p class="text-gray-400 text-xs text-center mt-6">
        默认账号: admin / admin
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['login'])

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  error.value = ''
  loading.value = true

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.value,
        password: password.value
      })
    })

    const data = await response.json()

    if (!response.ok) {
      error.value = data.error || '登录失败'
      return
    }

    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    
    emit('login', data.user)
  } catch (e) {
    error.value = '网络错误，请重试'
  } finally {
    loading.value = false
  }
}
</script>
