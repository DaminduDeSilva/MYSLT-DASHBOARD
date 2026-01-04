# Admin Registration & Authentication

This system now includes a complete authentication system with registration capabilities.

## Features

✅ **User Registration** - Create new admin accounts
✅ **Secure Login** - JWT-based authentication
✅ **Password Hashing** - bcrypt encryption
✅ **Role-Based Access** - Admin and SuperAdmin roles
✅ **Token Management** - 7-day session tokens

## Setup Instructions

### 1. Install Dependencies

The following packages have been installed:
- `jsonwebtoken` - JWT token generation
- `bcryptjs` - Password hashing

### 2. Seed Initial Admin User

Run this command to create the default admin account:

```bash
cd server
npm run seed-admin
```

This creates:
- **Username:** admin
- **Password:** 123456
- **Email:** admin@myslt.com
- **Role:** superadmin

### 3. Start the Server

```bash
npm run dev
```

## API Endpoints

### POST `/api/auth/register`
Register a new admin user

**Request Body:**
```json
{
  "username": "newadmin",
  "password": "password123",
  "email": "newadmin@example.com",
  "fullName": "New Admin Name",
  "role": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "username": "newadmin",
      "email": "newadmin@example.com",
      "fullName": "New Admin Name",
      "role": "admin"
    }
  }
}
```

### POST `/api/auth/login`
Login with credentials

**Request Body:**
```json
{
  "username": "admin",
  "password": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "username": "admin",
      "email": "admin@myslt.com",
      "fullName": "System Administrator",
      "role": "superadmin",
      "lastLogin": "2026-01-04T..."
    }
  }
}
```

### GET `/api/auth/me`
Get current user info (Protected route)

**Headers:**
```
Authorization: Bearer <token>
```

### GET `/api/auth/users`
Get all users (Admin only)

**Headers:**
```
Authorization: Bearer <token>
```

## Frontend Usage

### Login Page Features

1. **Sign In Mode** (Default)
   - Username and password fields
   - Demo credentials shown
   - Toggle to registration

2. **Registration Mode**
   - Full name field
   - Username field
   - Email field
   - Password field
   - Confirm password field
   - Toggle back to login

### Switching Modes

Click the button at the bottom:
- "Don't have an account? Register" (when in login mode)
- "Already have an account? Sign In" (when in register mode)

## Security Features

- ✅ Passwords hashed with bcrypt (10 salt rounds)
- ✅ JWT tokens with 7-day expiration
- ✅ Password validation (minimum 6 characters)
- ✅ Email validation
- ✅ Unique username and email enforcement
- ✅ Protected routes with middleware
- ✅ Role-based access control

## User Roles

- **admin** - Standard admin privileges
- **superadmin** - Full system access

## Database Schema

### User Model
```javascript
{
  username: String (unique, required, min: 3)
  password: String (hashed, required, min: 6)
  email: String (unique, required)
  fullName: String (required)
  role: String (enum: ['admin', 'superadmin'])
  isActive: Boolean (default: true)
  lastLogin: Date
  createdAt: Date
  updatedAt: Date
}
```

## Notes

- The system maintains backward compatibility with the demo credentials
- New registered users can login immediately after registration
- Tokens are stored in localStorage on the client side
- The demo credentials box only shows in login mode
