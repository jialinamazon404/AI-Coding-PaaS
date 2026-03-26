<template>
  <div>
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div class="card-vue p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm">全部项目</p>
            <p class="text-3xl font-semibold text-white mt-1">{{ store.projects.length }}</p>
          </div>
          <div class="w-10 h-10 bg-vue-primary/20 rounded-vue flex items-center justify-center">
            <svg class="w-5 h-5 text-vue-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>
      </div>
      
      <div class="card-vue p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm">活跃项目</p>
            <p class="text-3xl font-semibold text-vue-primary mt-1">{{ store.activeProjects.length }}</p>
          </div>
          <div class="w-10 h-10 bg-vue-primary/20 rounded-vue flex items-center justify-center">
            <svg class="w-5 h-5 text-vue-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="card-vue p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm">冲刺总数</p>
            <p class="text-3xl font-semibold text-white mt-1">{{ store.sprintCount }}</p>
          </div>
          <div class="w-10 h-10 bg-vue-secondary/30 rounded-vue flex items-center justify-center">
            <svg class="w-5 h-5 text-vue-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="card-vue p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm">进行中</p>
            <p class="text-3xl font-semibold text-yellow-400 mt-1">{{ store.runningSprints.length }}</p>
          </div>
          <div class="w-10 h-10 bg-yellow-400/20 rounded-vue flex items-center justify-center">
            <div class="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Project List -->
    <div class="card-vue">
      <div class="px-6 py-4 border-b border-vue-border flex items-center justify-between">
        <h2 class="text-lg font-semibold text-white">项目列表</h2>
        <button
          @click="showNewProject = true"
          class="px-4 py-2 bg-gradient-to-r from-vue-primary to-vue-secondary text-white rounded-vue text-sm font-medium transition-all hover:shadow-vue-glow"
        >
          + 新建项目
        </button>
      </div>
      
      <div v-if="store.projects.length === 0" class="p-12 text-center">
        <svg class="w-12 h-12 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <p class="text-gray-400">暂无项目</p>
        <p class="text-gray-500 text-sm mt-1">点击右上角「新建项目」开始</p>
      </div>

      <div v-else class="divide-y divide-vue-border">
        <div 
          v-for="project in store.projects" 
          :key="project.id"
          class="px-6 py-4 hover:bg-vue-primary/5 cursor-pointer transition-all border-l-2 border-transparent hover:border-vue-primary"
          @click="$emit('select', project.id)"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 bg-gradient-to-br from-vue-primary to-vue-secondary rounded-vue flex items-center justify-center">
                <span class="text-white font-semibold">{{ project.name?.charAt(0) || 'P' }}</span>
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  <h3 class="text-white font-medium">{{ project.name }}</h3>
                  <span :class="statusClass(project.status)" class="px-2 py-0.5 rounded text-xs">
                    {{ statusText(project.status) }}
                  </span>
                </div>
                <p class="text-gray-400 text-sm mt-1">{{ project.description || '暂无描述' }}</p>
              </div>
            </div>
            <div class="flex items-center space-x-4 text-sm text-gray-400">
              <div class="text-right">
                <div class="text-white">{{ formatDate(project.createdAt) }}</div>
                <div class="text-xs">创建时间</div>
              </div>
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- New Project Modal -->
    <div v-if="showNewProject" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showNewProject = false"></div>
      
      <div class="relative card-vue w-full max-w-sm mx-4">
        <div class="flex items-center justify-between px-6 py-4 border-b border-vue-border">
          <h2 class="text-lg font-semibold text-white">新建项目</h2>
          <button @click="showNewProject = false" class="text-gray-400 hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="handleCreateProject" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">项目名称</label>
            <input
              v-model="newProject.name"
              type="text"
              class="w-full bg-vue-darker border border-vue-border rounded-vue px-4 py-2.5 text-white focus:outline-none focus:border-vue-primary transition-all"
              placeholder="输入项目名称..."
              required
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">项目描述</label>
            <textarea
              v-model="newProject.description"
              rows="3"
              class="w-full bg-vue-darker border border-vue-border rounded-vue px-4 py-2.5 text-white focus:outline-none focus:border-vue-primary transition-all"
              placeholder="描述项目用途..."
            ></textarea>
          </div>
          
          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="showNewProject = false"
              class="px-4 py-2 bg-vue-card border border-vue-border text-gray-300 hover:text-white hover:border-vue-primary rounded-vue transition-all"
            >
              取消
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-gradient-to-r from-vue-primary to-vue-secondary text-white rounded-vue font-medium transition-all hover:shadow-vue-glow"
            >
              创建项目
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProjectStore } from '../stores/project'

const emit = defineEmits(['select'])

const store = useProjectStore()
const showNewProject = ref(false)
const newProject = ref({
  name: '',
  description: ''
})

onMounted(() => {
  store.fetchProjects()
})

async function handleCreateProject() {
  const project = await store.createProject(newProject.value)
  if (project) {
    showNewProject.value = false
    newProject.value = { name: '', description: '' }
  }
}

function statusClass(status) {
  const classes = {
    active: 'bg-vue-primary/20 text-vue-primary',
    archived: 'bg-gray-500/20 text-gray-400'
  }
  return classes[status] || classes.active
}

function statusText(status) {
  const texts = {
    active: '活跃',
    archived: '已归档'
  }
  return texts[status] || status
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}
</script>