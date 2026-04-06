import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Login from './views/Login.vue'
import UserList from './views/UserList.vue'
import ContentList from './views/ContentList.vue'
import ContentEditor from './views/ContentEditor.vue'
import ContentReview from './views/ContentReview.vue'
import StatsOverview from './views/StatsOverview.vue'
import RoleList from './views/RoleList.vue'
import OperationLog from './views/OperationLog.vue'

const routes = [
  { path: '/login', component: Login },
  { path: '/users', component: UserList },
  { path: '/contents', component: ContentList },
  { path: '/contents/editor', component: ContentEditor },
  { path: '/contents/review', component: ContentReview },
  { path: '/stats', component: StatsOverview },
  { path: '/roles', component: RoleList },
  { path: '/logs', component: OperationLog },
  { path: '/', redirect: '/login' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
app.use(router)
app.mount('#app')
