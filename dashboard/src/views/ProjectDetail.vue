<template>
  <div v-if="project" class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <button @click="$emit('back')" class="text-gray-400 hover:text-white transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <div class="flex items-center space-x-3">
            <h1 class="text-xl font-semibold text-white">{{ project.name }}</h1>
            <span :class="statusClass(project.status)" class="px-2 py-0.5 rounded text-xs">
              {{ statusText(project.status) }}
            </span>
          </div>
          <p class="text-gray-400 text-sm mt-1">{{ project.description || '暂无描述' }}</p>
        </div>
      </div>
      <div class="flex items-center space-x-3">
        <button
          @click="showEditProject = true"
          class="px-4 py-2 bg-vue-card border border-vue-border text-white rounded-vue text-sm transition-all hover:border-vue-primary"
        >
          编辑项目
        </button>
        <button
          @click="showNewSprint = true"
          class="px-4 py-2 bg-gradient-to-r from-vue-primary to-vue-secondary text-white rounded-vue text-sm font-medium transition-all hover:shadow-vue-glow"
        >
          + 新建冲刺
        </button>
      </div>
    </div>

    <!-- Sprint Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="card-vue p-4">
        <div class="text-gray-400 text-sm">全部冲刺</div>
        <div class="text-2xl font-semibold text-white mt-1">{{ sprints.length }}</div>
      </div>
      <div class="card-vue p-4">
        <div class="text-gray-400 text-sm">进行中</div>
        <div class="text-2xl font-semibold text-yellow-400 mt-1">{{ runningCount }}</div>
      </div>
      <div class="card-vue p-4">
        <div class="text-gray-400 text-sm">已完成</div>
        <div class="text-2xl font-semibold text-vue-primary mt-1">{{ completedCount }}</div>
      </div>
    </div>

    <!-- Sprint List -->
    <div class="card-vue">
      <div class="px-6 py-4 border-b border-vue-border">
        <h2 class="text-lg font-medium text-white">冲刺列表</h2>
      </div>
      
      <div v-if="sprints.length === 0" class="p-8 text-center">
        <svg class="w-12 h-12 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <p class="text-gray-400">暂无冲刺</p>
        <p class="text-gray-500 text-sm mt-1">点击「新建冲刺」开始</p>
      </div>

      <div v-else class="divide-y divide-vue-border">
        <div 
          v-for="sprint in sprints" 
          :key="sprint.id"
          class="px-6 py-4 hover:bg-vue-primary/5 cursor-pointer transition-all border-l-2 border-transparent hover:border-vue-primary"
          @click="$emit('selectSprint', sprint.id)"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div :class="sprintStatusIconBg(sprint.status)" class="w-10 h-10 rounded-vue flex items-center justify-center">
                <span v-if="sprint.status === 'completed'" class="text-white">✓</span>
                <span v-else-if="sprint.status === 'running'" class="w-3 h-3 bg-white rounded-full animate-pulse"></span>
                <span v-else class="text-gray-400 text-lg">🚀</span>
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  <h3 class="text-white font-medium">{{ sprint.name }}</h3>
                  <span :class="sprintStatusClass(sprint.status)" class="px-2 py-0.5 rounded text-xs">
                    {{ sprintStatusText(sprint.status) }}
                  </span>
                </div>
                <p class="text-gray-400 text-sm mt-1">{{ sprint.goal || sprint.rawInput || '暂无目标' }}</p>
                <div class="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <span>角色: {{ sprint.roles?.join(' → ') || '-' }}</span>
                  <span>当前: {{ sprint.iterations?.[sprint.currentRoleIndex]?.roleInfo?.name || '-' }}</span>
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <div class="text-right text-sm">
                <div class="text-gray-400">{{ formatDate(sprint.createdAt) }}</div>
                <div class="text-xs text-gray-500">创建时间</div>
              </div>
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- New Sprint Modal -->
    <div v-if="showNewSprint" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showNewSprint = false"></div>
      
      <div class="relative card-vue w-full max-w-lg mx-4 max-h-[90vh] overflow-auto">
        <div class="flex items-center justify-between px-6 py-4 border-b border-vue-border sticky top-0 bg-vue-card">
          <h2 class="text-lg font-semibold text-white">新建冲刺</h2>
          <button @click="showNewSprint = false" class="text-gray-400 hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="handleCreateSprint" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">冲刺名称</label>
            <input
              v-model="newSprint.name"
              type="text"
              class="w-full bg-vue-darker border border-vue-border rounded-vue px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-vue-primary"
              placeholder="如: Sprint #1, v1.0 功能开发"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">冲刺目标</label>
            <textarea
              v-model="newSprint.goal"
              rows="2"
              class="w-full bg-vue-darker border border-vue-border rounded-vue px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-vue-primary"
              placeholder="描述这次冲刺的目标..."
            ></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">需求描述</label>
            <textarea
              v-model="newSprint.rawInput"
              rows="3"
              class="w-full bg-vue-darker border border-vue-border rounded-vue px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-vue-primary"
              placeholder="详细描述你想要实现的功能..."
              required
            ></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">本地项目路径（可选）</label>
            <div class="flex space-x-2">
              <input
                v-model="newSprint.localProjectPath"
                type="text"
                class="flex-1 bg-vue-darker border border-vue-border rounded-vue px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-vue-primary"
                placeholder="/Users/xxx/Projects/my-app"
              />
              <button
                type="button"
                @click="validateLocalPath"
                :disabled="!newSprint.localProjectPath || validating"
                class="px-4 py-2 bg-vue-card border border-vue-border text-white rounded-vue text-sm transition-all hover:border-vue-primary disabled:opacity-50"
              >
                {{ validating ? '验证中...' : '验证' }}
              </button>
            </div>
            <p v-if="localProjectValid !== null" class="mt-2 text-sm" :class="localProjectValid ? 'text-vue-primary' : 'text-red-400'">
              {{ localProjectValid ? '✅ 路径有效' : '❌ 路径无效' }}
            </p>
          </div>
          
          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="showNewSprint = false"
              class="px-4 py-2 bg-vue-card border border-vue-border text-gray-300 hover:text-white hover:border-vue-primary rounded-vue transition-all"
            >
              取消
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-gradient-to-r from-vue-primary to-vue-secondary text-white rounded-vue font-medium transition-all hover:shadow-vue-glow"
            >
              创建冲刺
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Project Modal -->
    <div v-if="showEditProject" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showEditProject = false"></div>
      
      <div class="relative card-vue w-full max-w-lg mx-4">
        <div class="flex items-center justify-between px-6 py-4 border-b border-vue-border">
          <h2 class="text-lg font-semibold text-white">编辑项目</h2>
          <button @click="showEditProject = false" class="text-gray-400 hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="handleUpdateProject" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">项目名称</label>
            <input
              v-model="editProject.name"
              type="text"
              class="w-full bg-vue-darker border border-vue-border rounded-vue px-4 py-3 text-white focus:outline-none focus:border-vue-primary"
              required
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">项目描述</label>
            <textarea
              v-model="editProject.description"
              rows="3"
              class="w-full bg-vue-darker border border-vue-border rounded-vue px-4 py-3 text-white focus:outline-none focus:border-vue-primary"
            ></textarea>
          </div>
          
          <div class="flex justify-between pt-4">
            <button
              type="button"
              @click="handleDeleteProject"
              class="px-4 py-2 bg-red-600/20 border border-red-600/50 text-red-400 hover:bg-red-600/30 rounded-vue transition-all"
            >
              删除项目
            </button>
            <div class="flex space-x-3">
              <button
                type="button"
                @click="showEditProject = false"
                class="px-4 py-2 bg-vue-card border border-vue-border text-gray-300 hover:text-white hover:border-vue-primary rounded-vue transition-all"
              >
                取消
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-gradient-to-r from-vue-primary to-vue-secondary text-white rounded-vue font-medium transition-all hover:shadow-vue-glow"
              >
                保存
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-20">
    <div class="animate-spin w-8 h-8 border-2 border-vue-primary border-t-transparent rounded-full mx-auto mb-4"></div>
    <p class="text-gray-400">加载中...</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useProjectStore } from '../stores/project'

const props = defineProps({
  projectId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['back', 'selectSprint'])

const store = useProjectStore()

const project = computed(() => store.currentProject)
const sprints = computed(() => store.sprints)

const runningCount = computed(() => sprints.value.filter(s => s.status === 'running').length)
const completedCount = computed(() => sprints.value.filter(s => s.status === 'completed').length)

const showNewSprint = ref(false)
const showEditProject = ref(false)
const validating = ref(false)
const localProjectValid = ref(null)

const newSprint = ref({
  name: '',
  goal: '',
  rawInput: '',
  localProjectPath: ''
})

const editProject = ref({
  name: '',
  description: ''
})

onMounted(async () => {
  await store.fetchProject(props.projectId)
  await store.fetchSprints(props.projectId)
  if (project.value) {
    editProject.value = {
      name: project.value.name,
      description: project.value.description || ''
    }
  }
})

watch(() => props.projectId, async (newId) => {
  await store.fetchProject(newId)
  await store.fetchSprints(newId)
  if (project.value) {
    editProject.value = {
      name: project.value.name,
      description: project.value.description || ''
    }
  }
})

async function validateLocalPath() {
  if (!newSprint.value.localProjectPath) return
  
  validating.value = true
  const result = await store.validateLocalProject(newSprint.value.localProjectPath)
  localProjectValid.value = result.valid
  validating.value = false
}

async function handleCreateSprint() {
  const sprint = await store.createSprint(props.projectId, newSprint.value)
  if (sprint) {
    showNewSprint.value = false
    newSprint.value = { name: '', goal: '', rawInput: '', localProjectPath: '' }
    localProjectValid.value = null
  }
}

async function handleUpdateProject() {
  await store.updateProject(props.projectId, editProject.value)
  showEditProject.value = false
}

async function handleDeleteProject() {
  if (confirm('确定要删除这个项目吗？所有冲刺数据将被清除。')) {
    await store.deleteProject(props.projectId)
    emit('back')
  }
}

function statusClass(status) {
  return status === 'active' ? 'bg-vue-primary/20 text-vue-primary' : 'bg-gray-500/20 text-gray-400'
}

function statusText(status) {
  return status === 'active' ? '活跃' : '已归档'
}

function sprintStatusClass(status) {
  const classes = {
    pending: 'bg-gray-500/20 text-gray-400',
    running: 'bg-yellow-500/20 text-yellow-400',
    completed: 'bg-vue-primary/20 text-vue-primary',
    cancelled: 'bg-red-500/20 text-red-400'
  }
  return classes[status] || classes.pending
}

function sprintStatusText(status) {
  const texts = {
    pending: '待开始',
    running: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return texts[status] || status
}

function sprintStatusIconBg(status) {
  const classes = {
    pending: 'bg-vue-card',
    running: 'bg-yellow-500/20',
    completed: 'bg-vue-primary/20',
    cancelled: 'bg-red-500/20'
  }
  return classes[status] || classes.pending
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}
</script>