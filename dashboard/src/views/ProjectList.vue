<template>
  <div>
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg p-5" style="box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm" style="color: #909399;">全部项目</p>
            <p class="text-3xl font-semibold mt-1" style="color: #303133;">{{ store.projects.length }}</p>
          </div>
          <div class="w-10 h-10 rounded flex items-center justify-center" style="background: #ecf5ff;">
            <svg class="w-5 h-5" style="color: #409eff;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg p-5" style="box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm" style="color: #909399;">活跃项目</p>
            <p class="text-3xl font-semibold mt-1" style="color: #67c23a;">{{ store.activeProjects.length }}</p>
          </div>
          <div class="w-10 h-10 rounded flex items-center justify-center" style="background: #f0f9eb;">
            <svg class="w-5 h-5" style="color: #67c23a;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg p-5" style="box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm" style="color: #909399;">冲刺总数</p>
            <p class="text-3xl font-semibold mt-1" style="color: #303133;">{{ store.sprintCount }}</p>
          </div>
          <div class="w-10 h-10 rounded flex items-center justify-center" style="background: #f4f4f5;">
            <svg class="w-5 h-5" style="color: #909399;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg p-5" style="box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm" style="color: #909399;">进行中</p>
            <p class="text-3xl font-semibold mt-1" style="color: #e6a23c;">{{ store.runningSprints.length }}</p>
          </div>
          <div class="w-10 h-10 rounded flex items-center justify-center" style="background: #fdf6ec;">
            <div class="w-3 h-3 rounded-full" style="background: #e6a23c; animation: pulse 2s infinite;"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Project List -->
    <div class="bg-white rounded-lg" style="box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
      <div class="px-6 py-4 flex items-center justify-between" style="border-bottom: 1px solid #e4e7ed;">
        <h2 class="text-lg font-semibold" style="color: #303133;">项目列表</h2>
        <button
          type="button"
          @click="showNewProject = true"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 select-none min-h-[40px] shadow-sm hover:brightness-105 active:brightness-95 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
          style="background: #409eff; color: white;"
        >
          + 新建项目
        </button>
      </div>
      
      <div v-if="store.projects.length === 0" class="p-12 text-center">
        <svg class="w-12 h-12 mx-auto mb-4" style="color: #c0c4cc;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <p style="color: #909399;">暂无项目</p>
        <p class="text-sm mt-1" style="color: #c0c4cc;">点击右上角「新建项目」开始</p>
      </div>

      <div v-else>
        <div 
          v-for="project in store.projects" 
          :key="project.id"
          class="df-list-row group px-6 py-5 cursor-pointer"
          style="border-bottom: 1px solid #f0f0f0;"
          role="button"
          tabindex="0"
          @click="$emit('select', project.id)"
          @keydown.enter="$emit('select', project.id)"
          @keydown.space.prevent="$emit('select', project.id)"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 rounded flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-105 group-active:scale-95" style="background: #409eff;">
                <span class="text-white font-semibold">{{ project.name?.charAt(0) || 'P' }}</span>
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  <h3 class="font-medium" style="color: #303133;">{{ project.name }}</h3>
                  <span :class="statusClass(project.status)" class="px-2 py-0.5 rounded text-xs">
                    {{ statusText(project.status) }}
                  </span>
                </div>
                <p class="text-sm mt-1" style="color: #909399;">{{ project.description || '暂无描述' }}</p>
              </div>
            </div>
            <div class="flex items-center space-x-4 text-sm">
              <div class="text-right">
                <div style="color: #606266;">{{ formatDate(project.createdAt) }}</div>
                <div class="text-xs" style="color: #c0c4cc;">创建时间</div>
              </div>
              <svg class="df-list-row-chevron w-5 h-5 shrink-0" style="color: #c0c4cc;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- New Project Modal -->
    <div v-if="showNewProject" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0" style="background: rgba(0,0,0,0.5);" @click="showNewProject = false"></div>
      
      <div class="relative bg-white rounded w-full max-w-sm mx-4">
        <div class="flex items-center justify-between px-6 py-4" style="border-bottom: 1px solid #e4e7ed;">
          <h2 class="text-lg font-semibold" style="color: #303133;">新建项目</h2>
          <button type="button" @click="showNewProject = false" class="p-1 rounded-lg transition-all duration-150 hover:bg-gray-100 active:bg-gray-200 active:scale-95" style="color: #909399;">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="handleCreateProject" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2" style="color: #606266;">项目名称</label>
            <input
              v-model="newProject.name"
              type="text"
              class="w-full border rounded px-4 py-2.5 transition-all"
              style="border-color: #dcdfe6; color: #606266;"
              placeholder="输入项目名称..."
              required
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2" style="color: #606266;">项目描述</label>
            <textarea
              v-model="newProject.description"
              rows="3"
              class="w-full border rounded px-4 py-2.5 transition-all"
              style="border-color: #dcdfe6; color: #606266;"
              placeholder="描述项目用途..."
            ></textarea>
          </div>
          
          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="showNewProject = false"
              class="px-4 py-2 border rounded-lg transition-all duration-150 select-none min-h-[40px] hover:bg-gray-50 active:bg-[#ebeef5] active:scale-[0.98]"
              style="border-color: #dcdfe6; color: #606266;"
            >
              取消
            </button>
            <button
              type="submit"
              class="px-4 py-2 rounded-lg font-medium transition-all duration-150 select-none min-h-[40px] shadow-sm hover:brightness-105 active:brightness-95 active:scale-[0.98]"
              style="background: #409eff; color: white;"
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
    active: 'text-white',
    archived: 'text-white'
  }
  const bgColors = {
    active: '#67c23a',
    archived: '#909399'
  }
  return { 
    background: bgColors[status] || bgColors.active,
    color: 'white'
  }
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

<style scoped>
div:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
