import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import './style.css'

import PipelineList from './views/PipelineList.vue'
import PipelineDetail from './views/PipelineDetail.vue'
import Reports from './views/Reports.vue'

const routes = [
  { path: '/', name: 'home', component: PipelineList },
  { path: '/pipeline/:id', name: 'pipeline', component: PipelineDetail },
  { path: '/reports', name: 'reports', component: Reports }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)

// 注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.mount('#app')
