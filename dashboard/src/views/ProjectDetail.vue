<template>
  <div v-if="project" class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <button type="button" @click="$emit('back')" class="p-2 -ml-2 rounded-lg transition-all duration-150 hover:bg-gray-100 active:bg-gray-200 active:scale-95" style="color: #909399;">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <div class="flex items-center space-x-3">
            <h1 class="text-xl font-semibold" style="color: #303133;">{{ project.name }}</h1>
            <span :class="statusClass(project.status)" class="px-2 py-0.5 rounded text-xs">
              {{ statusText(project.status) }}
            </span>
          </div>
          <p class="text-sm mt-1" style="color: #909399;">{{ project.description || '暂无描述' }}</p>
        </div>
      </div>
      <div class="flex items-center space-x-3">
        <button
          type="button"
          @click="$emit('viewCode', project.id)"
          class="px-4 py-2 border rounded-lg text-sm transition-all duration-150 select-none min-h-[40px] hover:bg-gray-50 active:bg-[#ebeef5] active:scale-[0.98]"
          style="border-color: #dcdfe6; color: #606266;"
        >
          查看代码
        </button>
        <button
          type="button"
          @click="showEditProject = true"
          class="px-4 py-2 border rounded-lg text-sm transition-all duration-150 select-none min-h-[40px] hover:bg-gray-50 active:bg-[#ebeef5] active:scale-[0.98]"
          style="border-color: #dcdfe6; color: #606266;"
        >
          编辑项目
        </button>
        <button
          type="button"
          @click="showNewSprint = true"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 select-none min-h-[40px] shadow-sm hover:brightness-105 active:brightness-95 active:scale-[0.98]"
          style="background: #409eff; color: white;"
        >
          + 新建冲刺
        </button>
      </div>
    </div>

    <!-- Sprint Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white rounded-lg p-4" style="box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
        <div class="text-sm" style="color: #909399;">全部冲刺</div>
        <div class="text-2xl font-semibold mt-1" style="color: #303133;">{{ sprints.length }}</div>
      </div>
      <div class="bg-white rounded-lg p-4" style="box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
        <div class="text-sm" style="color: #909399;">进行中</div>
        <div class="text-2xl font-semibold mt-1" style="color: #e6a23c;">{{ runningCount }}</div>
      </div>
      <div class="bg-white rounded-lg p-4" style="box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
        <div class="text-sm" style="color: #909399;">已完成</div>
        <div class="text-2xl font-semibold mt-1" style="color: #409eff;">{{ completedCount }}</div>
      </div>
    </div>

    <!-- Sprint List -->
    <div class="bg-white rounded-lg" style="box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
      <div class="px-6 py-4" style="border-bottom: 1px solid #e4e7ed;">
        <h2 class="text-lg font-medium" style="color: #303133;">冲刺列表</h2>
      </div>
      
      <div v-if="sprints.length === 0" class="p-8 text-center">
        <svg class="w-12 h-12 mx-auto mb-4" style="color: #c0c4cc;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <p style="color: #909399;">暂无冲刺</p>
        <p class="text-sm mt-1" style="color: #c0c4cc;">点击「新建冲刺」开始</p>
      </div>

      <div v-else>
        <div 
          v-for="sprint in sprints" 
          :key="sprint.id"
          class="df-list-row group px-6 py-5 cursor-pointer"
          style="border-bottom: 1px solid #f0f0f0;"
          role="button"
          tabindex="0"
          @click="$emit('selectSprint', sprint.id)"
          @keydown.enter="$emit('selectSprint', sprint.id)"
          @keydown.space.prevent="$emit('selectSprint', sprint.id)"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div :class="sprintStatusIconBg(sprint.status)" class="w-10 h-10 rounded flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-105 group-active:scale-95">
                <span v-if="sprint.status === 'completed'" style="color: white;">✓</span>
                <span v-else-if="sprint.status === 'running'" class="w-3 h-3 rounded-full" style="background: white; animation: pulse 2s infinite;"></span>
                <span v-else class="text-lg" style="color: #909399;">🚀</span>
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  <h3 class="font-medium" style="color: #303133;">{{ sprint.name }}</h3>
                  <span :class="sprintStatusClass(sprint.status)" class="px-2 py-0.5 rounded text-xs">
                    {{ sprintStatusText(sprint.status) }}
                  </span>
                </div>
                <p class="text-sm mt-1" style="color: #909399;">{{ sprint.goal || sprint.rawInput || '暂无目标' }}</p>
                <div class="flex items-center space-x-4 mt-2 text-xs" style="color: #c0c4cc;">
                  <span v-if="sprint.scenario" class="px-1.5 py-0.5 rounded" style="background: #ecf5ff; color: #409eff;">{{ scenarioShortLabel(sprint.scenario) }}</span>
                  <span>角色: {{ sprint.roles?.join(' → ') || '-' }}</span>
                  <span>当前: {{ sprint.iterations?.[sprint.currentRoleIndex]?.roleInfo?.name || '-' }}</span>
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <div class="text-right text-sm">
                <div style="color: #606266;">{{ formatDate(sprint.createdAt) }}</div>
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

    <!-- New Sprint Modal -->
    <div v-if="showNewSprint" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0" style="background: rgba(0,0,0,0.5);" @click="showNewSprint = false"></div>
      
      <div class="relative bg-white rounded w-full max-w-lg mx-4 max-h-[90vh] overflow-auto">
        <div class="flex items-center justify-between px-6 py-4 sticky top-0 bg-white" style="border-bottom: 1px solid #e4e7ed;">
          <h2 class="text-lg font-semibold" style="color: #303133;">新建冲刺</h2>
          <button type="button" @click="showNewSprint = false" class="p-1 rounded-lg transition-all duration-150 hover:bg-gray-100 active:bg-gray-200 active:scale-95" style="color: #909399;">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="handleCreateSprint" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2" style="color: #606266;">冲刺名称</label>
            <input
              v-model="newSprint.name"
              type="text"
              class="w-full border rounded px-4 py-3"
              style="border-color: #dcdfe6; color: #606266;"
              placeholder="如: Sprint #1, v1.0 功能开发"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2" style="color: #606266;">冲刺目标</label>
            <textarea
              v-model="newSprint.goal"
              rows="2"
              class="w-full border rounded px-4 py-3"
              style="border-color: #dcdfe6; color: #606266;"
              placeholder="描述这次冲刺的目标..."
            ></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2" style="color: #606266;">业务场景</label>
            <select
              v-model="newSprint.scenario"
              class="w-full border rounded px-4 py-3 bg-white"
              style="border-color: #dcdfe6; color: #606266;"
            >
              <option v-for="opt in scenarioOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }} — {{ opt.desc }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2" style="color: #606266;">需求描述</label>
            <textarea
              v-model="newSprint.rawInput"
              rows="3"
              class="w-full border rounded px-4 py-3"
              style="border-color: #dcdfe6; color: #606266;"
              :placeholder="rawInputPlaceholder"
              required
            ></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2" style="color: #606266;">本地项目路径（可选）</label>
            <div class="flex space-x-2">
              <input
                v-model="newSprint.localProjectPath"
                type="text"
                class="flex-1 border rounded px-4 py-3"
                style="border-color: #dcdfe6; color: #606266;"
                placeholder="/Users/xxx/Projects/my-app"
              />
              <button
                type="button"
                @click="validateLocalPath"
                :disabled="!newSprint.localProjectPath || validating"
                class="px-4 py-2 border rounded-lg text-sm transition-all duration-150 select-none min-h-[40px] hover:bg-gray-50 active:bg-[#ebeef5] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                style="border-color: #dcdfe6; color: #606266;"
              >
                {{ validating ? '验证中...' : '验证' }}
              </button>
            </div>
            <p v-if="localProjectValid !== null" class="mt-2 text-sm" :style="localProjectValid ? 'color: #67c23a;' : 'color: #f56c6c;'">
              {{ localProjectValid ? '✅ 路径有效' : '❌ 路径无效' }}
            </p>
          </div>
          
          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="showNewSprint = false"
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
              创建冲刺
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Project Modal -->
    <div v-if="showEditProject" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0" style="background: rgba(0,0,0,0.5);" @click="showEditProject = false"></div>
      
      <div class="relative bg-white rounded w-full max-w-lg mx-4">
        <div class="flex items-center justify-between px-6 py-4" style="border-bottom: 1px solid #e4e7ed;">
          <h2 class="text-lg font-semibold" style="color: #303133;">编辑项目</h2>
          <button type="button" @click="showEditProject = false" class="p-1 rounded-lg transition-all duration-150 hover:bg-gray-100 active:bg-gray-200 active:scale-95" style="color: #909399;">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="handleUpdateProject" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2" style="color: #606266;">项目名称</label>
            <input
              v-model="editProject.name"
              type="text"
              class="w-full border rounded px-4 py-3"
              style="border-color: #dcdfe6; color: #606266;"
              required
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2" style="color: #606266;">项目描述</label>
            <textarea
              v-model="editProject.description"
              rows="3"
              class="w-full border rounded px-4 py-3"
              style="border-color: #dcdfe6; color: #606266;"
            ></textarea>
          </div>
          
          <div class="flex justify-between pt-4">
            <button
              type="button"
              @click="handleDeleteProject"
              class="px-4 py-2 border rounded-lg transition-all duration-150 select-none min-h-[40px] hover:bg-red-50 active:bg-red-100 active:scale-[0.98]"
              style="border-color: #f56c6c; color: #f56c6c;"
            >
              删除项目
            </button>
            <div class="flex space-x-3">
              <button
                type="button"
                @click="showEditProject = false"
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
                保存
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-20">
    <div class="w-8 h-8 border-2 mx-auto mb-4 rounded-full" style="border-color: #409eff; border-top-color: transparent; animation: spin 1s linear infinite;"></div>
    <p style="color: #909399;">加载中...</p>
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

const emit = defineEmits(['back', 'selectSprint', 'viewCode'])

const store = useProjectStore()

const project = computed(() => store.currentProject)
const sprints = computed(() => store.sprints)

const runningCount = computed(() => sprints.value.filter(s => s.status === 'running').length)
const completedCount = computed(() => sprints.value.filter(s => s.status === 'completed').length)

const showNewSprint = ref(false)
const showEditProject = ref(false)
const validating = ref(false)
const localProjectValid = ref(null)

const scenarioOptions = [
  { value: 'BUILD', label: '从零构建新功能', desc: '产品→设计→开发→测试→部署' },
  { value: 'CRITICAL', label: '核心/高风险功能', desc: '强化评审与测试' },
  { value: 'REVIEW', label: '代码/设计审查', desc: '创意→安全→测试' },
  { value: 'QUERY', label: '技术可行性调研', desc: '开发教练单角色' },
  { value: 'SECURITY', label: '安全检查', desc: '安全审计→架构评估' }
]

const newSprint = ref({
  name: '',
  goal: '',
  scenario: 'BUILD',
  rawInput: '',
  localProjectPath: ''
})

const rawInputPlaceholder = computed(() => {
  const map = {
    BUILD: '详细描述要实现的功能、用户场景与验收标准…',
    CRITICAL: '说明高风险范围、合规要求、失败影响与约束…',
    REVIEW: '粘贴设计稿说明、代码仓库路径或需评审的差异说明…',
    QUERY: '描述技术问题、可选方案、约束与期望结论（是否可行、推荐方案）…',
    SECURITY: '说明系统范围、资产、威胁关注点与合规要求…'
  }
  return map[newSprint.value.scenario] || map.BUILD
})

function scenarioShortLabel(scenario) {
  const o = scenarioOptions.find(x => x.value === scenario)
  return o ? o.label : scenario
}

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
    newSprint.value = { name: '', goal: '', scenario: 'BUILD', rawInput: '', localProjectPath: '' }
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
  return status === 'active' 
    ? { background: '#67c23a', color: 'white' }
    : { background: '#909399', color: 'white' }
}

function statusText(status) {
  return status === 'active' ? '活跃' : '已归档'
}

function sprintStatusClass(status) {
  const colors = {
    pending: { background: '#f4f4f5', color: '#909399' },
    running: { background: '#fdf6ec', color: '#e6a23c' },
    completed: { background: '#f0f9eb', color: '#67c23a' },
    cancelled: { background: '#fef0f0', color: '#f56c6c' }
  }
  return colors[status] || colors.pending
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
  const colors = {
    pending: { background: '#f4f4f5' },
    running: { background: '#fdf6ec' },
    completed: { background: '#f0f9eb' },
    cancelled: { background: '#fef0f0' }
  }
  return colors[status] || colors.pending
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
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

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
