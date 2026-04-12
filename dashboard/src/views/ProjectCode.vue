<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <button
          type="button"
          @click="$emit('back')"
          class="p-2 -ml-2 rounded-lg transition-all duration-150 hover:bg-gray-100 active:bg-gray-200 active:scale-95"
          style="color: #909399;"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 class="text-xl font-semibold" style="color: #303133;">项目代码（只读）</h1>
          <p class="text-sm mt-1" style="color: #909399;">
            {{ codePath || '该项目尚未绑定代码路径' }}
          </p>
        </div>
      </div>
    </div>

    <div v-if="!codePath" class="df-panel p-6">
      <p class="text-sm mb-3" style="color: #909399;">请先为项目绑定代码路径后再查看代码。</p>
      <div class="flex gap-2">
        <input
          v-model="codePathInput"
          type="text"
          class="flex-1 border rounded px-4 py-2.5"
          style="border-color: #dcdfe6; color: #606266;"
          placeholder="/Users/xxx/Projects/my-app"
        />
        <button
          type="button"
          @click="handleBindCodePath"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 select-none min-h-[40px] shadow-sm hover:brightness-105 active:brightness-95 active:scale-[0.98]"
          style="background: #409eff; color: #fff;"
        >
          绑定路径
        </button>
      </div>
      <p v-if="errorMessage" class="text-sm mt-2" style="color: #f56c6c;">{{ errorMessage }}</p>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="df-panel overflow-hidden">
        <div class="px-4 py-3 border-b" style="border-color: #e4e7ed;">
          <h2 class="text-sm font-semibold" style="color: #303133;">文件列表</h2>
        </div>
        <div class="max-h-[65vh] overflow-auto p-2">
          <div v-if="loadingFiles" class="p-4 text-sm" style="color: #909399;">加载文件中...</div>
          <div v-else-if="sortedFileItems.length === 0" class="p-4 text-sm" style="color: #909399;">暂无可展示文件</div>
          <button
            v-for="item in sortedFileItems"
            :key="item.path"
            type="button"
            class="w-full text-left px-3 py-2 rounded-md transition-all duration-150"
            :class="[
              item.type === 'directory' ? 'cursor-default' : 'hover:bg-[#f5f7fa] active:bg-[#ebeef5]',
              selectedFilePath === item.path ? 'bg-[#ecf5ff]' : ''
            ]"
            :style="{ paddingLeft: `${12 + item.depth * 14}px` }"
            @click="item.type === 'file' && selectFile(item.path)"
          >
            <span class="text-sm" :style="item.type === 'directory' ? 'color:#909399;' : 'color:#606266;'">
              {{ item.type === 'directory' ? '📁' : '📄' }} {{ item.name }}
            </span>
          </button>
        </div>
      </div>

      <div class="df-panel lg:col-span-2 overflow-hidden">
        <div class="px-4 py-3 border-b" style="border-color: #e4e7ed;">
          <h2 class="text-sm font-semibold" style="color: #303133;">
            {{ selectedFilePath || '文件内容预览' }}
          </h2>
        </div>
        <div class="max-h-[65vh] overflow-auto p-4" style="background: #fafafa;">
          <div v-if="loadingContent" class="text-sm" style="color: #909399;">读取文件中...</div>
          <div v-else-if="contentType === 'binary'" class="text-sm" style="color: #e6a23c;">二进制文件暂不支持预览</div>
          <div v-else-if="selectedFilePath && fileContent === ''" class="text-sm" style="color: #909399;">空文件</div>
          <pre v-else-if="selectedFilePath" class="text-xs whitespace-pre-wrap" style="color: #303133; line-height: 1.55;">{{ fileContent }}</pre>
          <div v-else class="text-sm" style="color: #909399;">请从左侧选择文件</div>
          <p v-if="truncated" class="text-xs mt-3" style="color: #e6a23c;">文件较大，仅显示前 1MB 内容</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useProjectStore } from '../stores/project'

const props = defineProps({
  projectId: {
    type: String,
    required: true
  }
})

defineEmits(['back'])

const store = useProjectStore()
const loadingFiles = ref(false)
const loadingContent = ref(false)
const fileItems = ref([])
const codePath = ref('')
const codePathInput = ref('')
const selectedFilePath = ref('')
const fileContent = ref('')
const contentType = ref('file')
const truncated = ref(false)
const errorMessage = ref('')

const sortedFileItems = computed(() => {
  const mapped = fileItems.value
    .map(item => ({
      ...item,
      depth: item.path.split('/').length - 1
    }))
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === 'directory' ? -1 : 1
      return a.path.localeCompare(b.path)
    })
  return mapped
})

async function loadFiles() {
  loadingFiles.value = true
  errorMessage.value = ''
  selectedFilePath.value = ''
  fileContent.value = ''
  contentType.value = 'file'
  truncated.value = false

  const result = await store.fetchProjectCodeFiles(props.projectId)
  loadingFiles.value = false

  if (!result) {
    fileItems.value = []
    codePath.value = store.error ? '' : codePath.value
    errorMessage.value = store.error || '读取文件列表失败'
    return
  }

  codePath.value = result.codePath || ''
  fileItems.value = Array.isArray(result.files) ? result.files : []
  codePathInput.value = codePath.value
}

async function selectFile(filePath) {
  selectedFilePath.value = filePath
  loadingContent.value = true
  fileContent.value = ''
  contentType.value = 'file'
  truncated.value = false

  const result = await store.fetchProjectCodeContent(props.projectId, filePath)
  loadingContent.value = false
  if (!result) {
    fileContent.value = ''
    contentType.value = 'file'
    return
  }

  contentType.value = result.type || 'file'
  fileContent.value = result.content || ''
  truncated.value = Boolean(result.truncated)
}

async function handleBindCodePath() {
  if (!codePathInput.value?.trim()) {
    errorMessage.value = '请输入代码路径'
    return
  }
  const updated = await store.updateProjectCodePath(props.projectId, codePathInput.value)
  if (!updated) {
    errorMessage.value = store.error || '绑定失败'
    return
  }
  codePath.value = updated.codePath || ''
  errorMessage.value = ''
  await loadFiles()
}

onMounted(loadFiles)
watch(() => props.projectId, loadFiles)
</script>

<style scoped>
.df-panel {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
</style>
