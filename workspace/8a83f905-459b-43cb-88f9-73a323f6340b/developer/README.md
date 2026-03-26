# 登录计算器 Web 应用

## 📋 项目概述

- **项目名称**: Login Calculator
- **功能简介**: 支持用户注册登录的基础四则运算计算器前后端分离项目，包含计算历史记录功能
- **技术栈**:
  - 前端: Vue 3 + Composition API + Vite + Pinia + Vue Router + Axios
  - 后端: Express.js + SQLite (better-sqlite3) + JWT + bcryptjs

## 🚀 快速启动

### 前置要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 启动服务

```bash
# 启动后端 (端口: 3001)
cd backend
npm start

# 启动前端开发服务器 (端口: 5173)
cd frontend
npm run dev
```

### 生产构建

```bash
# 前端构建
cd frontend
npm run build

# 构建产物在 dist 目录
```

### 访问地址
- 前端: http://localhost:5173
- 后端 API: http://localhost:3001

## 📡 API 接口文档

### 认证接口

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | /api/auth/register | 用户注册 | 否 |
| POST | /api/auth/login | 用户登录 | 否 |
| POST | /api/auth/logout | 用户登出 | 是 |
| GET | /api/auth/me | 获取当前用户 | 是 |

### 计算器接口

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | /api/calculator/calculate | 执行计算 | 是 |
| GET | /api/calculator/history | 获取计算历史 | 是 |
| DELETE | /api/calculator/history | 清空历史 | 是 |

### 健康检查

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/health | 服务健康检查 |

### 详细接口定义

#### POST /api/auth/register - 用户注册

**请求参数:**
```json
{
  "username": "string (必填)",
  "password": "string (必填, 至少6位)"
}
```

**成功响应 (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser"
  }
}
```

**错误响应 (400):**
```json
{
  "success": false,
  "message": "用户名已存在"
}
```

---

#### POST /api/auth/login - 用户登录

**请求参数:**
```json
{
  "username": "string (必填)",
  "password": "string (必填)"
}
```

**成功响应 (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser"
  }
}
```

**错误响应 (401):**
```json
{
  "success": false,
  "message": "用户名或密码错误"
}
```

---

#### GET /api/auth/me - 获取当前用户

**请求头:**
```
Authorization: Bearer <token>
```

**成功响应 (200):**
```json
{
  "success": true,
  "user": {
    "userId": 1,
    "username": "testuser"
  }
}
```

**错误响应 (401):**
```json
{
  "success": false,
  "message": "无效的令牌"
}
```

---

#### POST /api/auth/logout - 用户登出

**请求头:**
```
Authorization: Bearer <token>
```

**成功响应 (200):**
```json
{
  "success": true,
  "message": "登出成功"
}
```

---

#### POST /api/calculator/calculate - 执行计算

**请求头:**
```
Authorization: Bearer <token>
```

**请求参数:**
```json
{
  "expression": "string (必填, 如: 2+3*4)"
}
```

**成功响应 (200):**
```json
{
  "success": true,
  "result": 14
}
```

**错误响应 (400):**
```json
{
  "success": false,
  "message": "无效的表达式"
}
```

---

#### GET /api/calculator/history - 获取计算历史

**请求头:**
```
Authorization: Bearer <token>
```

**成功响应 (200):**
```json
{
  "success": true,
  "history": [
    {
      "id": 1,
      "user_id": 1,
      "expression": "2+3*4",
      "result": "14",
      "created_at": "2024-01-01 12:00:00"
    }
  ]
}
```

---

#### DELETE /api/calculator/history - 清空历史

**请求头:**
```
Authorization: Bearer <token>
```

**成功响应 (200):**
```json
{
  "success": true,
  "message": "历史记录已清空"
}
```

### 错误码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 (令牌无效或过期) |
| 500 | 服务器内部错误 |

## 📁 项目结构

```
.
├── frontend/                    # Vue 3 前端项目
│   ├── src/
│   │   ├── api/                 # API 请求封装
│   │   │   └── index.js
│   │   ├── components/          # 组件
│   │   │   ├── auth/            # 认证组件
│   │   │   │   ├── LoginForm.vue
│   │   │   │   └── RegisterForm.vue
│   │   │   └── calculator/      # 计算器组件
│   │   │       ├── Display.vue
│   │   │       └── Keypad.vue
│   │   ├── router/              # 路由配置
│   │   │   └── index.js
│   │   ├── stores/              # Pinia 状态管理
│   │   │   ├── auth.js
│   │   │   └── calculator.js
│   │   ├── styles/              # 样式文件
│   │   │   └── main.css
│   │   ├── views/              # 页面视图
│   │   │   ├── LoginView.vue
│   │   │   ├── RegisterView.vue
│   │   │   └── CalculatorView.vue
│   │   ├── App.vue
│   │   └── main.js
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/                     # Express.js 后端项目
│   ├── config/
│   │   └── database.js          # SQLite 数据库配置
│   ├── controllers/             # 控制器层
│   │   ├── authController.js
│   │   └── calculatorController.js
│   ├── middleware/              # 中间件
│   │   ├── auth.js              # JWT 认证中间件
│   │   └── error.js            # 错误处理中间件
│   ├── models/                  # 数据模型
│   │   ├── User.js
│   │   └── History.js
│   ├── routes/                  # 路由
│   │   ├── auth.js
│   │   └── calculator.js
│   ├── services/                # 服务层
│   │   ├── authService.js
│   │   └── calculatorService.js
│   ├── app.js
│   └── package.json
│
└── README.md
```

## ⚙️ 环境变量

后端支持以下环境变量:

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| PORT | 3001 | 服务器端口 |
| JWT_SECRET | calculator-secret-key-2024 | JWT 密钥 |

前端通过 Vite 代理转发 API 请求到后端。

## 📝 开发记录

### 开发时间
- 完成时间: 2026-03-27

### 完成的功能清单

#### 后端
- [x] 用户注册接口 (POST /api/auth/register)
- [x] 用户登录接口 (POST /api/auth/login)
- [x] 用户登出接口 (POST /api/auth/logout)
- [x] 获取当前用户接口 (GET /api/auth/me)
- [x] 计算表达式接口 (POST /api/calculator/calculate)
- [x] 获取计算历史 (GET /api/calculator/history)
- [x] 清空计算历史 (DELETE /api/calculator/history)
- [x] JWT 认证中间件
- [x] SQLite 数据库集成
- [x] 密码 bcrypt 加密

#### 前端
- [x] 用户登录页面
- [x] 用户注册页面
- [x] 计算器主页面
- [x] 计算器显示组件
- [x] 计算器按键组件
- [x] 计算历史显示
- [x] 用户登出功能
- [x] Pinia 状态管理
- [x] Vue Router 路由守卫
- [x] Axios 请求拦截器
- [x] API 代理配置

### 遇到的问题和解决方案

1. **前后端联调问题**: 前端开发环境需要代理 API 请求，通过 vite.config.js 配置 proxy 解决
2. **数据库初始化**: 使用 better-sqlite3 自动创建表结构，确保应用启动时数据库就绪
3. **JWT 认证**: 后端使用 JWT 前端通过 localStorage 存储令牌，每次请求自动添加到 Authorization 头