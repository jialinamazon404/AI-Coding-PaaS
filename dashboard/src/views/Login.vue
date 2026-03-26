<template>
  <div class="min-h-screen flex items-center justify-center">
    <!-- Background Effects -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-vue-primary/20 to-transparent rounded-full blur-3xl"></div>
      <div class="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-vue-secondary/20 to-transparent rounded-full blur-3xl"></div>
    </div>

    <!-- Whale Ship Animation -->
    <div class="fixed bottom-0 left-0 right-0 h-32 overflow-hidden pointer-events-none">
      <div class="whale-ship absolute" style="left: -100px;">
        <svg viewBox="0 0 200 60" class="w-48 h-16">
          <path d="M20 40 Q40 20 60 40 T100 40 T140 40 T180 40 L190 50 L10 50 Z" fill="#1a1a2e" stroke="#42b883" stroke-width="2"/>
          <path d="M60 40 L60 20 L80 40" fill="#1a1a2e" stroke="#42b883" stroke-width="2"/>
          <path d="M100 40 L100 15 L120 40" fill="#1a1a2e" stroke="#42b883" stroke-width="2"/>
          <circle cx="30" cy="35" r="3" fill="#42b883" class="animate-pulse"/>
          <!-- Flag -->
          <path d="M140 15 L140 5 L160 10 L140 15" fill="#ff4444" class="animate-pulse"/>
        </svg>
      </div>
      <div class="waves absolute bottom-0 left-0 right-0 h-8 opacity-50">
        <svg viewBox="0 0 400 30" class="w-full h-8">
          <path d="M0 15 Q50 5 100 15 T200 15 T300 15 T400 15 V30 H0 Z" fill="#42b883" opacity="0.3"/>
        </svg>
      </div>
    </div>

    <!-- Login Card -->
    <div class="relative card-vue p-8 w-full max-w-sm mx-4 mt-8">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-gradient-to-br from-vue-primary to-vue-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 glow-green">
          <span class="text-white font-bold text-2xl">MD</span>
        </div>
        <h1 class="text-2xl font-bold gradient-text">Moby Dick</h1>
        <p class="text-gray-400 text-sm mt-2">致敬白胡子的 AI 开发舰队</p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="block text-gray-400 text-sm font-medium mb-2">用户名</label>
          <input 
            v-model="username"
            type="text" 
            class="w-full bg-vue-darker border border-vue-border rounded-vue px-4 py-3 text-white focus:outline-none focus:border-vue-primary focus:ring-1 focus:ring-vue-primary transition-all"
            placeholder="输入用户名"
            required
          />
        </div>
        
        <div>
          <label class="block text-gray-400 text-sm font-medium mb-2">密码</label>
          <input 
            v-model="password"
            type="password" 
            class="w-full bg-vue-darker border border-vue-border rounded-vue px-4 py-3 text-white focus:outline-none focus:border-vue-primary focus:ring-1 focus:ring-vue-primary transition-all"
            placeholder="输入密码"
            required
          />
        </div>

        <div v-if="error" class="bg-red-500/20 border border-red-500/50 rounded-vue p-3">
          <p class="text-red-400 text-sm">{{ error }}</p>
        </div>

        <button 
          type="submit"
          :disabled="loading"
          class="w-full btn-vue py-3 font-medium flex items-center justify-center space-x-2"
        >
          <span v-if="loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <span v-else>登录</span>
        </button>
      </form>

      <p class="text-gray-500 text-xs text-center mt-6">
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

<style scoped>
.min-h-screen {
  background: linear-gradient(180deg, #0a0a1a 0%, #0f0f23 100%);
}

.whale-ship {
  animation: sail 20s linear infinite;
}

@keyframes sail {
  0% {
    transform: translateX(-100px);
  }
  100% {
    transform: translateX(calc(100vw + 100px));
  }
}

.waves {
  animation: wave 3s ease-in-out infinite;
}

@keyframes wave {
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-20px);
  }
}
</style>