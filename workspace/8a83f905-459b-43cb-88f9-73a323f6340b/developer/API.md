# API 接口详细文档

## 基础信息

- **Base URL**: http://localhost:3001
- **API Prefix**: /api
- **认证方式**: Bearer Token (JWT)

## 目录

1. [认证接口](#认证接口)
2. [计算器接口](#计算器接口)
3. [健康检查](#健康检查)

---

## 认证接口

### 1. 用户注册

**端点**: `POST /api/auth/register`

**描述**: 创建新用户账号

**是否需要认证**: 否

**请求头**:
```
Content-Type: application/json
```

**请求体**:
```json
{
  "username": "string (必填, 3-20个字符)",
  "password": "string (必填, 至少6位)"
}
```

**示例请求**:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "123456"}'
```

**成功响应 (200)**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoidGVzdHVzZXIiLCJpYXQiOjE3MDk0NjQwMDAsImV4cCI6MTcwOTU1MDQwMH0.xxxxxxxxxxxxxx",
  "user": {
    "id": 1,
    "username": "testuser"
  }
}
```

**错误响应**:

| 状态码 | 响应体 | 说明 |
|--------|--------|------|
| 400 | `{"success": false, "message": "请输入用户名和密码"}` | 缺少必填字段 |
| 400 | `{"success": false, "message": "密码长度至少6位"}` | 密码长度不足 |
| 400 | `{"success": false, "message": "用户名已存在"}` | 用户名重复 |

---

### 2. 用户登录

**端点**: `POST /api/auth/login`

**描述**: 用户登录并获取 Token

**是否需要认证**: 否

**请求头**:
```
Content-Type: application/json
```

**请求体**:
```json
{
  "username": "string (必填)",
  "password": "string (必填)"
}
```

**示例请求**:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "123456"}'
```

**成功响应 (200)**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoidGVzdHVzZXIiLCJpYXQiOjE3MDk0NjQwMDAsImV4cCI6MTcwOTU1MDQwMH0.xxxxxxxxxxxxxx",
  "user": {
    "id": 1,
    "username": "testuser"
  }
}
```

**错误响应**:

| 状态码 | 响应体 | 说明 |
|--------|--------|------|
| 400 | `{"success": false, "message": "请输入用户名和密码"}` | 缺少必填字段 |
| 401 | `{"success": false, "message": "用户名或密码错误"}` | 用户名或密码错误 |

---

### 3. 获取当前用户

**端点**: `GET /api/auth/me`

**描述**: 获取当前登录用户信息

**是否需要认证**: 是

**请求头**:
```
Authorization: Bearer <token>
```

**示例请求**:
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应 (200)**:
```json
{
  "success": true,
  "user": {
    "userId": 1,
    "username": "testuser"
  }
}
```

**错误响应**:

| 状态码 | 响应体 | 说明 |
|--------|--------|------|
| 401 | `{"success": false, "message": "未授权访问"}` | 缺少 Token |
| 401 | `{"success": false, "message": "无效的令牌"}` | Token 无效或过期 |

---

### 4. 用户登出

**端点**: `POST /api/auth/logout`

**描述**: 用户登出 (客户端清除 Token 即可，后端无需额外处理)

**是否需要认证**: 是

**请求头**:
```
Authorization: Bearer <token>
```

**示例请求**:
```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应 (200)**:
```json
{
  "success": true,
  "message": "登出成功"
}
```

---

## 计算器接口

### 5. 执行计算

**端点**: `POST /api/calculator/calculate`

**描述**: 执行数学表达式计算并保存到历史记录

**是否需要认证**: 是

**请求头**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**:
```json
{
  "expression": "string (必填, 如: 2+3*4)"
}
```

**支持的运算符**:
- 加法: `+`
- 减法: `-`
- 乘法: `*`
- 除法: `/`
- 括号: `(`, `)`
- 小数: `.`

**示例请求**:
```bash
curl -X POST http://localhost:3001/api/calculator/calculate \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"expression": "2+3*4"}'
```

**成功响应 (200)**:
```json
{
  "success": true,
  "result": 14
}
```

**错误响应**:

| 状态码 | 响应体 | 说明 |
|--------|--------|------|
| 400 | `{"success": false, "message": "请输入表达式"}` | 表达式为空 |
| 400 | `{"success": false, "message": "无效的表达式"}` | 表达式语法错误 |
| 400 | `{"success": false, "message": "无效的计算结果"}` | 计算结果无效 (如除零) |

---

### 6. 获取计算历史

**端点**: `GET /api/calculator/history`

**描述**: 获取当前用户的计算历史记录

**是否需要认证**: 是

**请求头**:
```
Authorization: Bearer <token>
```

**查询参数**:
无 (默认返回最近 10 条)

**示例请求**:
```bash
curl -X GET http://localhost:3001/api/calculator/history \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应 (200)**:
```json
{
  "success": true,
  "history": [
    {
      "id": 1,
      "user_id": 1,
      "expression": "2+3*4",
      "result": "14",
      "created_at": "2024-01-15 10:30:00"
    },
    {
      "id": 2,
      "user_id": 1,
      "expression": "100/5",
      "result": "20",
      "created_at": "2024-01-15 10:25:00"
    }
  ]
}
```

**错误响应**:

| 状态码 | 响应体 | 说明 |
|--------|--------|------|
| 401 | `{"success": false, "message": "未授权访问"}` | 缺少 Token |

---

### 7. 清空计算历史

**端点**: `DELETE /api/calculator/history`

**描述**: 清空当前用户的全部计算历史记录

**是否需要认证**: 是

**请求头**:
```
Authorization: Bearer <token>
```

**示例请求**:
```bash
curl -X DELETE http://localhost:3001/api/calculator/history \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应 (200)**:
```json
{
  "success": true,
  "message": "历史记录已清空"
}
```

**错误响应**:

| 状态码 | 响应体 | 说明 |
|--------|--------|------|
| 401 | `{"success": false, "message": "未授权访问"}` | 缺少 Token |

---

## 健康检查

### 8. 服务健康状态

**端点**: `GET /api/health`

**描述**: 检查后端服务是否正常运行

**是否需要认证**: 否

**示例请求**:
```bash
curl -X GET http://localhost:3001/api/health
```

**成功响应 (200)**:
```json
{
  "status": "ok"
}
```

---

## 响应格式统一规范

所有 API 响应均遵循以下格式:

### 成功响应
```json
{
  "success": true,
  // ... 其他字段
}
```

### 错误响应
```json
{
  "success": false,
  "message": "错误信息描述"
}
```

---

## 错误码汇总

| 状态码 | 说明 | 常见原因 |
|--------|------|----------|
| 200 | 请求成功 | - |
| 400 | 请求参数错误 | 缺少必填字段、格式错误、值不合法 |
| 401 | 未授权 | 缺少 Token、Token 无效、Token 过期 |
| 500 | 服务器内部错误 | 数据库错误、未捕获的异常 |

---

## 使用示例

### JavaScript (fetch)

```javascript
// 登录
const login = async () => {
  const response = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'testuser', password: '123456' })
  });
  const data = await response.json();
  return data.token;
};

// 计算
const calculate = async (token, expression) => {
  const response = await fetch('http://localhost:3001/api/calculator/calculate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ expression })
  });
  return response.json();
};
```

### Python (requests)

```python
import requests

BASE_URL = "http://localhost:3001/api"

# 登录
def login(username, password):
    response = requests.post(f"{BASE_URL}/auth/login", json={
        "username": username,
        "password": password
    })
    return response.json()

# 计算
def calculate(token, expression):
    response = requests.post(
        f"{BASE_URL}/calculator/calculate",
        json={"expression": expression},
        headers={"Authorization": f"Bearer {token}"}
    )
    return response.json()
```