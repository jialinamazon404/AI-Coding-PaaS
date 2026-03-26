# Calculator API

RESTful API for mathematical calculations with user authentication.

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | User registration | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/logout` | User logout | Yes |
| POST | `/api/calculate` | Perform calculation | Yes |
| GET | `/api/history` | Get calculation history | Yes |
| DELETE | `/api/history` | Clear calculation history | Yes |

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### POST /api/auth/register

Register a new user account.

**Request Body:**
```json
{
  "username": "user1",
  "password": "password123",
  "email": "user@example.com"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "username": "user1",
    "email": "user@example.com"
  }
}
```

### POST /api/auth/login

Login with username and password.

**Request Body:**
```json
{
  "username": "user1",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "username": "user1",
    "email": "user@example.com"
  }
}
```

### POST /api/auth/logout

Logout the current user.

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

## Calculator Endpoints

### POST /api/calculate

Perform a mathematical calculation.

**Request Body:**
```json
{
  "operation": "add",
  "operands": [10, 5]
}
```

**Operations:**
- `add` - Addition
- `subtract` - Subtraction
- `multiply` - Multiplication
- `divide` - Division
- `power` - Power (operands[0] ^ operands[1])
- `sqrt` - Square root (single operand)
- `modulo` - Modulo

**Response:**
```json
{
  "result": 15,
  "operation": "add",
  "operands": [10, 5],
  "timestamp": "2026-03-26T00:00:00Z"
}
```

### GET /api/history

Get calculation history.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | integer | 10 | Max records to return |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "operation": "add",
      "operands": [10, 5],
      "result": 15,
      "timestamp": "2026-03-26T00:00:00Z"
    }
  ],
  "total": 1
}
```

### DELETE /api/history

Clear all calculation history.

**Response (200):**
```json
{
  "message": "History cleared"
}
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3000 | Server port |
| JWT_SECRET | - | JWT secret key (required) |
| LOG_LEVEL | info | Logging level |
| DB_PATH | ./data.db | SQLite database path |
