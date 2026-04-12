<template>
  <!-- Login page -->
  <Login v-if="!isLoggedIn" @login="handleLogin" />
  
  <!-- Main interface -->
  <div v-else class="min-h-screen bg-white">
    <!-- Header -->
    <header class="sticky top-0 z-50 border-b" style="border-color: #e4e7ed; background: #fff;">
      <div class="max-w-7xl mx-auto px-6">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-6">
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-sm">AI</span>
              </div>
              <h1 class="text-lg font-semibold" style="color: #409eff;">AI Coding PasS</h1>
            </div>
            <nav class="flex space-x-1 ml-6">
              <button
                v-for="tab in tabs" 
                :key="tab.id"
                type="button"
                @click="handleTabChange(tab.id)"
                class="app-tab px-4 py-1.5 text-sm font-medium transition-all duration-200 select-none min-h-[36px] active:scale-[0.98]"
                :class="currentTab === tab.id 
                  ? 'app-tab-active' 
                  : 'app-tab-idle'"
              >
                {{ tab.label }}
              </button>
            </nav>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm" :class="connected ? 'text-green-500' : 'text-red-400'">
              {{ connected ? '●' : '○' }} {{ connected ? '已连接' : '未连接' }}
            </span>
            <span class="text-sm text-gray-500">
              {{ currentUser?.username || 'User' }}
            </span>
            <button
              type="button"
              @click="handleLogout"
              class="px-3 py-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 active:bg-gray-200 text-sm transition-all duration-150 select-none min-h-[36px] active:scale-[0.98]"
            >
              退出
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-6 py-8">
      <!-- Project List -->
      <div v-if="currentTab === 'projects'">
        <ProjectList @select="handleProjectSelect" />
      </div>
      
      <!-- Project Detail -->
      <div v-else-if="currentTab === 'project-detail'">
        <ProjectDetail 
          :project-id="selectedProjectId" 
          @back="currentTab = 'projects'"
          @select-sprint="handleSprintSelect"
          @view-code="handleProjectCodeView"
        />
      </div>

      <!-- Project Code -->
      <div v-else-if="currentTab === 'project-code'">
        <ProjectCode
          :project-id="selectedCodeProjectId"
          @back="handleBackToProject"
        />
      </div>
      
      <!-- Sprint Detail -->
      <div v-else-if="currentTab === 'sprint-detail'">
        <SprintDetail 
          :sprint-id="selectedSprintId"
          @back="handleBackToProject"
        />
      </div>
      
      <!-- Agent Management (legacy) -->
      <div v-else-if="currentTab === 'agents'" class="space-y-6">
        <AgentManager @select-pipeline="handlePipelineSelect" />
      </div>
      
      <!-- Test Reports (legacy) -->
      <div v-else-if="currentTab === 'reports'">
        <Reports />
      </div>
      
      <!-- Pipeline Detail (legacy) -->
      <div v-else-if="currentTab === 'detail'">
        <PipelineDetail 
          :pipeline-id="selectedPipelineId" 
          @back="handleBackFromPipelineDetail"
        />
      </div>
      
      <!-- Pipeline List (legacy) -->
      <div v-else-if="currentTab === 'pipelines'">
        <PipelineList @select="handlePipelineSelect" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useProjectStore } from './stores/project'
import ProjectList from './views/ProjectList.vue'
import ProjectDetail from './views/ProjectDetail.vue'
import SprintDetail from './views/SprintDetail.vue'
import PipelineList from './views/PipelineList.vue'
import PipelineDetail from './views/PipelineDetail.vue'
import AgentManager from './views/AgentManager.vue'
import Reports from './views/Reports.vue'
import ProjectCode from './views/ProjectCode.vue'
import Login from './views/Login.vue'

const projectStore = useProjectStore()
const connected = ref(false)
const currentTab = ref('projects')
const selectedProjectId = ref(null)
const selectedSprintId = ref(null)
const selectedPipelineId = ref(null)
const selectedCodeProjectId = ref(null)
const previousTabBeforePipelineDetail = ref('projects')
const isLoggedIn = ref(false)
const currentUser = ref(null)

const tabs = [
  { id: 'projects', label: '项目' },
  { id: 'agents', label: '角色管理' },
  { id: 'reports', label: '测试报告' }
]

function handleTabChange(tabId) {
  currentTab.value = tabId
}

function handleLogin(user) {
  currentUser.value = user
  isLoggedIn.value = true
  projectStore.fetchProjects()
  projectStore.connect()
  connected.value = true
}

function handleLogout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  isLoggedIn.value = false
  currentUser.value = null
  projectStore.disconnect()
  connected.value = false
}

function handleProjectSelect(id) {
  selectedProjectId.value = id
  currentTab.value = 'project-detail'
}

function handleSprintSelect(id) {
  selectedSprintId.value = id
  currentTab.value = 'sprint-detail'
}

function handleBackToProject() {
  if (selectedProjectId.value) {
    currentTab.value = 'project-detail'
  } else {
    currentTab.value = 'projects'
  }
  selectedSprintId.value = null
}

function handleProjectCodeView(projectId) {
  selectedCodeProjectId.value = projectId
  currentTab.value = 'project-code'
}

function handlePipelineSelect(id) {
  previousTabBeforePipelineDetail.value = currentTab.value
  selectedPipelineId.value = id
  currentTab.value = 'detail'
}

function handleBackFromPipelineDetail() {
  currentTab.value = previousTabBeforePipelineDetail.value === 'detail'
    ? 'projects'
    : previousTabBeforePipelineDetail.value
}

onMounted(() => {
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user')
  
  if (token && user) {
    currentUser.value = JSON.parse(user)
    isLoggedIn.value = true
    projectStore.fetchProjects()
    connected.value = true
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.app-tab {
  position: relative;
  border-radius: 8px;
}

.app-tab::after {
  content: '';
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: -8px;
  height: 2px;
  border-radius: 999px;
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.2s ease;
  background: #409eff;
}

.app-tab-active {
  color: #303133;
}

.app-tab-active::after {
  transform: scaleX(1);
}

.app-tab-idle {
  color: #909399;
}

.app-tab-idle:hover {
  color: #606266;
  background: #f5f7fa;
}
</style>
