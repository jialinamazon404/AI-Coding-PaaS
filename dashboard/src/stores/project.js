import { defineStore } from 'pinia'
import axios from 'axios'
import { io } from 'socket.io-client'
import { getApiUrl, getSocketUrl } from '../utils/api'

const API_URL = getApiUrl()
const SOCKET_URL = getSocketUrl()

export const useProjectStore = defineStore('project', {
  state: () => ({
    projects: [],
    currentProject: null,
    sprints: [],
    currentSprint: null,
    loading: false,
    error: null,
    connected: false,
    socket: null
  }),

  getters: {
    activeProjects: (state) => state.projects.filter(p => p.status === 'active'),
    projectCount: (state) => state.projects.length,
    sprintCount: (state) => state.sprints.length,
    runningSprints: (state) => state.sprints.filter(s => s.status === 'running'),
    completedSprints: (state) => state.sprints.filter(s => s.status === 'completed')
  },

  actions: {
    // WebSocket 连接
    connect() {
      if (this.socket) return
      
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling']
      })
      
      this.socket.on('connect', () => {
        this.connected = true
        console.log('[Project Store] WebSocket connected')
        
        // 订阅项目事件
        if (this.currentProject) {
          this.socket.emit('subscribe', { projectId: this.currentProject.id })
        }
      })
      
      this.socket.on('disconnect', () => {
        this.connected = false
        console.log('[Project Store] WebSocket disconnected')
      })
    },

    disconnect() {
      if (this.socket) {
        this.socket.disconnect()
        this.socket = null
        this.connected = false
      }
    },

    async fetchProjects() {
      this.loading = true
      this.error = null
      try {
        const { data } = await axios.get(`${API_URL}/api/projects`)
        this.projects = data
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    async fetchProject(id) {
      this.loading = true
      this.error = null
      try {
        const { data } = await axios.get(`${API_URL}/api/projects/${id}`)
        this.currentProject = data
        return data
      } catch (e) {
        this.error = e.message
        return null
      } finally {
        this.loading = false
      }
    },

    async createProject(projectData) {
      this.loading = true
      this.error = null
      try {
        const { data } = await axios.post(`${API_URL}/api/projects`, projectData)
        this.projects.push(data)
        return data
      } catch (e) {
        this.error = e.message
        return null
      } finally {
        this.loading = false
      }
    },

    async updateProject(id, updates) {
      this.loading = true
      this.error = null
      try {
        const { data } = await axios.put(`${API_URL}/api/projects/${id}`, updates)
        const index = this.projects.findIndex(p => p.id === id)
        if (index !== -1) this.projects[index] = data
        if (this.currentProject?.id === id) this.currentProject = data
        return data
      } catch (e) {
        this.error = e.message
        return null
      } finally {
        this.loading = false
      }
    },

    async deleteProject(id) {
      this.loading = true
      this.error = null
      try {
        await axios.delete(`${API_URL}/api/projects/${id}`)
        this.projects = this.projects.filter(p => p.id !== id)
        if (this.currentProject?.id === id) this.currentProject = null
        return true
      } catch (e) {
        this.error = e.message
        return false
      } finally {
        this.loading = false
      }
    },

    async fetchSprints(projectId) {
      this.loading = true
      this.error = null
      try {
        const { data } = await axios.get(`${API_URL}/api/projects/${projectId}/sprints`)
        this.sprints = data
        return data
      } catch (e) {
        this.error = e.message
        return []
      } finally {
        this.loading = false
      }
    },

    async fetchSprint(id) {
      this.loading = true
      this.error = null
      try {
        const { data } = await axios.get(`${API_URL}/api/sprints/${id}`)
        this.currentSprint = data
        return data
      } catch (e) {
        this.error = e.message
        return null
      } finally {
        this.loading = false
      }
    },

    async createSprint(projectId, sprintData) {
      this.loading = true
      this.error = null
      try {
        const { data } = await axios.post(`${API_URL}/api/projects/${projectId}/sprints`, sprintData)
        this.sprints.push(data)
        return data
      } catch (e) {
        this.error = e.response?.data?.error || e.message
        return null
      } finally {
        this.loading = false
      }
    },

    async fetchReports(projectId = null) {
      this.error = null
      try {
        const endpoint = projectId
          ? `${API_URL}/api/projects/${projectId}/reports`
          : `${API_URL}/api/reports`
        const { data } = await axios.get(endpoint)
        return Array.isArray(data) ? data : []
      } catch (e) {
        this.error = e.response?.data?.error || e.message
        return []
      }
    },

    async updateProjectCodePath(projectId, codePath) {
      this.error = null
      try {
        const { data } = await axios.put(`${API_URL}/api/projects/${projectId}/code-path`, { codePath })
        const idx = this.projects.findIndex(p => p.id === projectId)
        if (idx !== -1) this.projects[idx] = data
        if (this.currentProject?.id === projectId) this.currentProject = data
        return data
      } catch (e) {
        this.error = e.response?.data?.error || e.message
        return null
      }
    },

    async fetchProjectCodeFiles(projectId) {
      this.error = null
      try {
        const { data } = await axios.get(`${API_URL}/api/projects/${projectId}/code/files`)
        return data
      } catch (e) {
        this.error = e.response?.data?.error || e.message
        return null
      }
    },

    async fetchProjectCodeContent(projectId, filePath) {
      this.error = null
      try {
        const { data } = await axios.get(`${API_URL}/api/projects/${projectId}/code/content`, {
          params: { file: filePath }
        })
        return data
      } catch (e) {
        this.error = e.response?.data?.error || e.message
        return null
      }
    },

    async startSprint(id) {
      this.loading = true
      this.error = null
      try {
        const { data } = await axios.post(`${API_URL}/api/sprints/${id}/start`)
        const index = this.sprints.findIndex(s => s.id === id)
        if (index !== -1) this.sprints[index] = data
        if (this.currentSprint?.id === id) this.currentSprint = data
        return data
      } catch (e) {
        this.error = e.message
        return null
      } finally {
        this.loading = false
      }
    },

    async updateSprint(id, updates) {
      this.loading = true
      this.error = null
      try {
        const { data } = await axios.put(`${API_URL}/api/sprints/${id}`, updates)
        const index = this.sprints.findIndex(s => s.id === id)
        if (index !== -1) this.sprints[index] = data
        if (this.currentSprint?.id === id) this.currentSprint = data
        return data
      } catch (e) {
        this.error = e.message
        return null
      } finally {
        this.loading = false
      }
    },

    async deleteSprint(id) {
      this.loading = true
      this.error = null
      try {
        await axios.delete(`${API_URL}/api/sprints/${id}`)
        this.sprints = this.sprints.filter(s => s.id !== id)
        if (this.currentSprint?.id === id) this.currentSprint = null
        return true
      } catch (e) {
        this.error = e.message
        return false
      } finally {
        this.loading = false
      }
    },

    async inputIteration(sprintId, roleIndex, userInput) {
      this.error = null
      try {
        const { data } = await axios.put(
          `${API_URL}/api/sprints/${sprintId}/iterations/${roleIndex}/input`,
          { userInput }
        )
        if (this.currentSprint?.id === sprintId) {
          this.currentSprint = await this.fetchSprint(sprintId)
        }
        return data
      } catch (e) {
        this.error = e.message
        return null
      }
    },

    async confirmIteration(sprintId, roleIndex, output) {
      this.error = null
      try {
        const { data } = await axios.put(
          `${API_URL}/api/sprints/${sprintId}/iterations/${roleIndex}/confirm`,
          { output }
        )
        if (this.currentSprint?.id === sprintId) {
          this.currentSprint = await this.fetchSprint(sprintId)
        }
        return data
      } catch (e) {
        this.error = e.message
        return null
      }
    },

    /** 将某流程阶段（如 tech-design）内全部角色标为 confirmed，解锁下一阶段 */
    async markStageConfirmed(sprintId, stageId) {
      this.error = null
      try {
        const { data } = await axios.post(
          `${API_URL}/api/sprints/${sprintId}/mark-stage-confirmed`,
          { stageId }
        )
        if (this.currentSprint?.id === sprintId) {
          this.currentSprint = await this.fetchSprint(sprintId)
        }
        return data
      } catch (e) {
        const msg = e.response?.data?.error || e.message
        this.error = msg
        throw new Error(msg)
      }
    },

    async updateEnvironment(sprintId, roleIndex, testEnvironmentUrl) {
      this.error = null
      try {
        const { data } = await axios.put(
          `${API_URL}/api/sprints/${sprintId}/iterations/${roleIndex}/environment`,
          { testEnvironmentUrl }
        )
        if (this.currentSprint?.id === sprintId) {
          this.currentSprint = await this.fetchSprint(sprintId)
        }
        return data
      } catch (e) {
        this.error = e.message
        return null
      }
    },

    async rerunIteration(sprintId, roleIndex) {
      this.error = null
      try {
        const { data } = await axios.post(
          `${API_URL}/api/sprints/${sprintId}/iterations/${roleIndex}/rerun`
        )
        if (this.currentSprint?.id === sprintId) {
          this.currentSprint = await this.fetchSprint(sprintId)
        }
        return data
      } catch (e) {
        this.error = e.message
        return null
      }
    },

    async executeIteration(sprintId, roleIndex, stepIndex = null, extra = {}) {
      this.error = null
      try {
        const body = { ...extra }
        if (stepIndex !== null && stepIndex !== undefined) {
          body.stepIndex = stepIndex
        }
        const { data } = await axios.post(
          `${API_URL}/api/sprints/${sprintId}/iterations/${roleIndex}/execute`,
          body
        )
        return data
      } catch (e) {
        const msg = e.response?.data?.error || e.message
        this.error = msg
        throw new Error(msg)
      }
    },

    async fetchDeveloperState(sprintId) {
      this.error = null
      try {
        const { data } = await axios.get(`${API_URL}/api/sprints/${sprintId}/developer/state`)
        return data
      } catch (e) {
        this.error = e.response?.data?.error || e.message
        return null
      }
    },

    async fetchDeveloperTaskRuns(sprintId) {
      this.error = null
      try {
        const { data } = await axios.get(`${API_URL}/api/sprints/${sprintId}/developer/task-runs`)
        return Array.isArray(data?.items) ? data.items : []
      } catch (e) {
        this.error = e.response?.data?.error || e.message
        return []
      }
    },

    async fetchDeveloperTaskRunDetail(sprintId, taskIndex) {
      this.error = null
      try {
        const { data } = await axios.get(`${API_URL}/api/sprints/${sprintId}/developer/task-runs/${taskIndex}`)
        return data
      } catch (e) {
        this.error = e.response?.data?.error || e.message
        return null
      }
    },

    async updateIterationOutput(sprintId, roleIndex, output) {
      this.error = null
      try {
        const { data } = await axios.put(
          `${API_URL}/api/sprints/${sprintId}/iterations/${roleIndex}/output`,
          { output, status: 'completed' }
        )
        if (this.currentSprint?.id === sprintId) {
          this.currentSprint = await this.fetchSprint(sprintId)
        }
        return data
      } catch (e) {
        this.error = e.message
        return null
      }
    },

    async validateLocalProject(path) {
      try {
        const { data } = await axios.get(`${API_URL}/api/local-project/validate`, { params: { path } })
        return data
      } catch (e) {
        return { valid: false, error: e.message }
      }
    },

    // 获取 sprint 的实际文件列表
    async fetchSprintFiles(sprintId) {
      try {
        const { data } = await axios.get(`${API_URL}/api/sprints/${sprintId}/files`)
        return data.files || []
      } catch (e) {
        return []
      }
    },

    async fetchSprintPreviewMeta(sprintId) {
      this.error = null
      try {
        const { data } = await axios.get(`${API_URL}/api/sprints/${sprintId}/preview/meta`)
        return data
      } catch (e) {
        this.error = e.response?.data?.error || e.message
        return null
      }
    },

    async fetchSprintPreviewStatus(sprintId) {
      this.error = null
      try {
        const { data } = await axios.get(`${API_URL}/api/sprints/${sprintId}/preview/status`)
        return data
      } catch (e) {
        this.error = e.response?.data?.error || e.message
        return null
      }
    },

    async startSprintPreview(sprintId, target = 'frontend') {
      this.error = null
      try {
        const { data } = await axios.post(`${API_URL}/api/sprints/${sprintId}/preview/start`, { target })
        return data
      } catch (e) {
        const msg = e.response?.data?.error || e.message
        this.error = msg
        throw new Error(msg)
      }
    },

    async stopSprintPreview(sprintId, target = 'all') {
      this.error = null
      try {
        const { data } = await axios.post(`${API_URL}/api/sprints/${sprintId}/preview/stop`, { target })
        return data
      } catch (e) {
        const msg = e.response?.data?.error || e.message
        this.error = msg
        throw new Error(msg)
      }
    },

    async sendSprintPreviewApiRequest(sprintId, payload) {
      this.error = null
      try {
        const { data } = await axios.post(`${API_URL}/api/sprints/${sprintId}/preview/api/request`, payload)
        return data
      } catch (e) {
        const msg = e.response?.data?.message || e.response?.data?.error || e.message
        this.error = msg
        throw new Error(msg)
      }
    },

    // 模型配置
    async fetchModelConfig() {
      try {
        const { data } = await axios.get(`${API_URL}/api/config/models`)
        return data
      } catch (e) {
        return null
      }
    },

    async saveModelConfig(config) {
      try {
        await axios.put(`${API_URL}/api/config/models`, config)
        return true
      } catch (e) {
        return false
      }
    },

    async fetchAvailableModels() {
      this.error = null
      try {
        const { data } = await axios.get(`${API_URL}/api/config/models/available`)
        return Array.isArray(data?.models) ? data.models : []
      } catch (e) {
        this.error = e.response?.data?.error || e.message
        return []
      }
    }
  }
})
