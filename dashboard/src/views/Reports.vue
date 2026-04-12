<template>
  <div class="reports-page space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="df-panel px-5 py-4">
        <p class="text-sm" style="color: #909399;">报告总数</p>
        <p class="text-3xl font-semibold mt-1" style="color: #303133;">{{ reports.length }}</p>
      </div>
      <div class="df-panel px-5 py-4">
        <p class="text-sm" style="color: #909399;">最近生成</p>
        <p class="text-sm font-medium mt-2" style="color: #606266;">{{ latestReportTime }}</p>
      </div>
      <div class="df-panel px-5 py-4">
        <p class="text-sm" style="color: #909399;">平均通过率</p>
        <p class="text-3xl font-semibold mt-1" style="color: #67c23a;">{{ overallPassRate }}%</p>
      </div>
    </div>

    <div class="df-panel">
      <div class="px-6 py-4 border-b" style="border-color: #e4e7ed;">
        <h2 class="text-lg font-semibold" style="color: #303133;">测试报告</h2>
      </div>
      <div class="p-6">
        <div v-if="reports.length === 0" class="text-center py-12">
          <svg class="w-12 h-12 mx-auto mb-4" style="color: #c0c4cc;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p style="color: #909399;">暂无测试报告</p>
          <p class="text-sm mt-1" style="color: #c0c4cc;">运行流水线后会自动生成报告</p>
        </div>

        <div v-else class="space-y-4">
          <div v-for="report in reports" :key="report.reportId" class="df-subpanel rounded-lg p-4">
            <div class="flex items-center justify-between mb-4 gap-3">
              <div>
                <h3 class="font-medium" style="color: #303133;">{{ report.pipelineId?.slice(0, 8) || 'Unknown' }}</h3>
                <p class="text-sm" style="color: #909399;">{{ formatTime(report.timestamp) }}</p>
              </div>
              <span :class="testTypeClass(report.testType)" class="px-3 py-1 rounded-full text-xs font-medium">
                {{ report.testType || 'unknown' }}
              </span>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
              <div class="metric-card">
                <p class="metric-label">总计</p>
                <p class="metric-value" style="color: #303133;">{{ report.summary?.total || 0 }}</p>
              </div>
              <div class="metric-card">
                <p class="metric-label">通过</p>
                <p class="metric-value" style="color: #67c23a;">{{ report.summary?.passed || 0 }}</p>
              </div>
              <div class="metric-card">
                <p class="metric-label">失败</p>
                <p class="metric-value" style="color: #f56c6c;">{{ report.summary?.failed || 0 }}</p>
              </div>
              <div class="metric-card">
                <p class="metric-label">跳过</p>
                <p class="metric-value" style="color: #e6a23c;">{{ report.summary?.skipped || 0 }}</p>
              </div>
              <div class="metric-card">
                <p class="metric-label">通过率</p>
                <p class="metric-value" style="color: #409eff;">{{ reportPassRate(report) }}%</p>
              </div>
            </div>

            <div v-if="report.performance" class="grid grid-cols-2 md:grid-cols-5 gap-2">
              <div v-for="(value, key) in report.performance" :key="key" class="metric-card-sm">
                <p class="metric-label">{{ key }}</p>
                <p class="text-sm font-medium" style="color: #606266;">{{ value }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useProjectStore } from '../stores/project'

const store = useProjectStore()
const reports = ref([])

function testTypeClass(type) {
  const classes = {
    smoke: 'tag-success',
    full: 'tag-info',
    regression: 'tag-purple',
    e2e: 'tag-warning'
  }
  return classes[type] || 'tag-neutral'
}

function reportPassRate(report) {
  const total = Number(report?.summary?.total || 0)
  if (total <= 0) return 0
  const passed = Number(report?.summary?.passed || 0)
  return Math.round((passed / total) * 100)
}

const latestReportTime = computed(() => {
  if (!reports.value.length) return '-'
  const latest = [...reports.value]
    .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))[0]
  return formatTime(latest?.timestamp)
})

const overallPassRate = computed(() => {
  if (!reports.value.length) return 0
  let total = 0
  let passed = 0
  for (const report of reports.value) {
    total += Number(report?.summary?.total || 0)
    passed += Number(report?.summary?.passed || 0)
  }
  if (total <= 0) return 0
  return Math.round((passed / total) * 100)
})

function formatTime(isoString) {
  if (!isoString) return '-'
  return new Date(isoString).toLocaleString('zh-CN')
}

async function fetchReports() {
  reports.value = await store.fetchReports()
}

onMounted(fetchReports)
</script>

<style scoped>
.df-panel {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.df-subpanel {
  background: #fff;
  border: 1px solid #ebeef5;
  transition: all 0.15s ease;
}

.df-subpanel:hover {
  border-color: #dcdfe6;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.08);
}

.metric-card,
.metric-card-sm {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fafafa;
  text-align: center;
}

.metric-card {
  padding: 10px;
}

.metric-card-sm {
  padding: 8px;
}

.metric-label {
  font-size: 12px;
  color: #909399;
}

.metric-value {
  margin-top: 2px;
  font-size: 20px;
  line-height: 28px;
  font-weight: 600;
}

.tag-success {
  background: #f0f9eb;
  color: #67c23a;
}

.tag-info {
  background: #ecf5ff;
  color: #409eff;
}

.tag-purple {
  background: #f4f4f5;
  color: #909399;
}

.tag-warning {
  background: #fdf6ec;
  color: #e6a23c;
}

.tag-neutral {
  background: #f4f4f5;
  color: #909399;
}
</style>
