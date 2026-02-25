# 🔐 Auth System

A production-ready authentication and authorization system built with Express.js and MongoDB. This project implements industry-standard security practices including JWT-based authentication, OAuth 2.0 integration, email verification, password reset functionality, and comprehensive rate limiting.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [Running the Project](#-running-the-project)
- [API Documentation](#-api-documentation)
- [Testing with Postman](#-testing-with-postman)
- [Security Features](#-security-features)
- [Error Handling](#-error-handling)
- [Contributing](#-contributing)

---

## ✨ Features

### Authentication
- ✅ **Email & Password Registration** - Secure user registration with email verification
- ✅ **JWT-Based Authentication** - Stateless authentication using access and refresh tokens
- ✅ **Email Verification** - Verify user email before account activation
- ✅ **Password Reset** - Secure password reset flow with email verification tokens
- ✅ **OAuth 2.0 Integration** - Google OAuth authentication with automatic account linking
- ✅ **Refresh Token Rotation** - Secure token rotation with automatic cleanup

### User Management
- ✅ **Profile Management** - Update user profile (name, avatar)
- ✅ **Password Management** - Change password with current password verification
- ✅ **Account Deletion** - Securely delete user accounts with password confirmation
- ✅ **Multi-Device Logout** - Logout from all devices simultaneously

### Security
- ✅ **Rate Limiting** - Brute-force protection on auth endpoints
- ✅ **CORS Protection** - Configurable cross-origin requests
- ✅ **MongoDB Injection Prevention** - NoSQL injection protection
- ✅ **XSS Protection** - Security headers via Helmet.js
- ✅ **Password Hashing** - bcryptjs for secure password storage
- ✅ **Input Validation** - Zod schema validation for all inputs
- ✅ **Token Expiration** - Short-lived access tokens (15 min) and long-lived refresh tokens (7 days)

### Developer Experience
- ✅ **Async Error Handling** - Robust try-catch wrapper
- ✅ **Standardized API Responses** - Consistent JSON response format
- ✅ **Comprehensive Logging** - Morgan logging middleware
- ✅ **Environment Configuration** - Dotenv for environment management
- ✅ **Graceful Shutdown** - Proper server cleanup on process termination

---

## 🛠 Tech Stack

### Backend Framework
- **Express.js** (v4.21.2) - Web application framework
- **Node.js** - Runtime environment

### Database
- **MongoDB** - NoSQL database
- **Mongoose** (v8.9.5) - MongoDB object modeling

### Authentication
- **JWT (jsonwebtoken)** (v9.0.2) - Token-based authentication
- **Passport.js** (v0.7.0) - OAuth authentication middleware
  - passport-google-oauth20 (v2.0.0)
- **bcryptjs** (v2.4.3) - Password hashing

### Validation & Security
- **Zod** (v3.24.2) - Schema validation
- **Validator.js** (v13.12.0) - String validation utilities
- **Helmet** (v8.0.0) - Security headers
- **express-mongo-sanitize** (v2.2.0) - NoSQL injection prevention
- **express-rate-limit** (v7.5.0) - Rate limiting

### Additional Libraries
- **Nodemailer** (v6.9.16) - Email sending (password reset, verification)
- **Morgan** (v1.10.0) - HTTP request logging
- **CORS** (v2.8.5) - Cross-origin resource sharing
- **Cookie Parser** (v1.4.7) - Cookie parsing
- **UUID** (v11.0.5) - Unique token generation

### Development Tools
- **Nodemon** (v3.1.14) - Auto-restart during development
- **Dotenv** (v16.4.5) - Environment variable management

---

## 📁 Project Structure

```
auth-system/
├── src/
│   ├── app.js                      # Express app configuration
│   ├── index.js                    # Server entry point
│   ├── config/
│   │   └── passport.js             # Passport OAuth strategies
│   ├── constants/
│   │   └── index.js                # App constants (roles, expiry times, HTTP codes)
│   ├── controllers/
│   │   ├── auth.controller.js      # Authentication endpoints
│   │   └── user.controller.js      # User management endpoints
│   ├── db/
│   │   └── index.js                # MongoDB connection
│   ├── middlewares/
│   │   ├── auth.middleware.js      # JWT verification & role-based access
│   │   ├── error.middleware.js     # Global error handler
│   │   ├── rateLimiter.middleware.js # Rate limiting
│   │   └── validate.middleware.js  # Zod validation middleware
│   ├── models/
│   │   └── user.model.js           # User schema & methods
│   ├── routes/
│   │   ├── auth.routes.js          # Authentication routes
│   │   └── user.routes.js          # User management routes
│   ├── utils/
│   │   ├── ApiError.js             # Error response utility
│   │   ├── ApiResponse.js          # Success response utility
│   │   ├── asyncHandler.js         # Async/await error wrapper
│   │   ├── email.utils.js          # Email sending functions
│   │   └── token.utils.js          # JWT token generation & cookie handling
│   └── validators/
│       ├── auth.validators.js      # Authentication input schemas
│       ├── shared.validators.js    # Shared validation schemas
│       └── user.validators.js      # User management input schemas
├── package.json                    # Project dependencies
└── README.md                       # This file
```

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local or cloud - MongoDB Atlas recommended)

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd auth-system
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Create a `.env` file in the root directory (see [Environment Variables](#-environment-variables) section)

### Step 4: Connect MongoDB
Ensure your MongoDB connection string is properly configured in the `.env` file

---

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=8000
NODE_ENV=development
SERVER_URL=http://localhost:8000
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net

# JWT Secrets (Generate strong random strings)
ACCESS_TOKEN_SECRET=your_access_token_secret_key_here_min_32_chars
REFRESH_TOKEN_SECRET=your_refresh_token_secret_key_here_min_32_chars

# OAuth - Google
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# CORS
CORS_ORIGIN=http://localhost:3000

# Email Configuration (Nodemailer)
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM=noreply@yourdomain.com

# API Response
API_VERSION=v1
```

### Generating Strong Secret Keys
```bash
# In Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## ▶️ Running the Project

### Development Mode (with auto-reload)
```bash
npm run dev
```
The server will start on `http://localhost:8000`

### Production Mode
```bash
npm start
```

### Health Check
```bash
curl http://localhost:8000/healthcheck
```

Expected response:
```json
{
  "status": "ok",
  "uptime": 123.45,
  "timestamp": "2024-02-25T10:30:00.000Z"
}
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api/v1
```

### Response Format

**Success Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

**Error Response:**
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Error description",
  "data": null,
  "errors": [ /* detailed errors */ ]
}
```

---

## 🔐 Authentication Endpoints

### 1. **Register User**
- **Endpoint:** `POST /auth/register`
- **Rate Limit:** 10 requests per 15 minutes
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }
  ```
- **Response (201):**
  ```json
  {
    "statusCode": 201,
    "success": true,
    "message": "Account created! Please check your email to verify your account.",
    "data": {
      "email": "john@example.com"
    }
  }
  ```
- **Validation Rules:**
  - Name: 2-50 characters, trimmed, HTML-escaped
  - Email: Valid email format, lowercase
  - Password: Minimum 8 characters, must include uppercase, lowercase, number, special character

---

### 2. **Verify Email**
- **Endpoint:** `GET /auth/verify-email?token=<verification_token>`
- **Description:** Verify user email using token sent in registration email
- **Response (200):**
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Email verified successfully! You can now log in.",
    "data": null
  }
  ```

---

### 3. **Resend Verification Email**
- **Endpoint:** `POST /auth/resend-verification`
- **Rate Limit:** 3 requests per hour
- **Body:**
  ```json
  {
    "email": "john@example.com"
  }
  ```
- **Response (200):** Same safe response regardless of whether email exists
- **Note:** Returns generic response to prevent email enumeration attacks

---

### 4. **Login User**
- **Endpoint:** `POST /auth/login`
- **Rate Limit:** 10 requests per 15 minutes
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "SecurePass123!"
  }
  ```
- **Response (200):**
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": null,
        "role": "user",
        "isEmailVerified": true
      },
      "accessToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
  ```
- **Cookies Set:**
  - `refreshToken`: HttpOnly, Secure, SameSite=Strict (7 days)

---

### 5. **Refresh Access Token**
- **Endpoint:** `POST /auth/refresh-token`
- **Body:** No body required (uses refreshToken cookie)
- **Response (200):**
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Access token refreshed successfully",
    "data": {
      "accessToken": "new_access_token"
    }
  }
  ```

---

### 6. **Forgot Password**
- **Endpoint:** `POST /auth/forgot-password`
- **Rate Limit:** 10 requests per 15 minutes
- **Body:**
  ```json
  {
    "email": "john@example.com"
  }
  ```
- **Response (200):** Generic success message
- **Side Effect:** Sends password reset email with secure token

---

### 7. **Reset Password**
- **Endpoint:** `POST /auth/reset-password`
- **Body:**
  ```json
  {
    "token": "reset_token_from_email",
    "password": "NewSecurePass123!",
    "confirmPassword": "NewSecurePass123!"
  }
  ```
- **Response (200):**
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Password reset successful. Please log in with your new password.",
    "data": null
  }
  ```

---

### 8. **Logout**
- **Endpoint:** `POST /auth/logout`
- **Headers:** 
  ```
  Authorization: Bearer <accessToken>
  ```
- **Response (200):**
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Logged out successfully",
    "data": null
  }
  ```
- **Side Effect:** Invalidates current refresh token, clears cookie

---

### 9. **Logout All Devices**
- **Endpoint:** `POST /auth/logout-all`
- **Headers:** 
  ```
  Authorization: Bearer <accessToken>
  ```
- **Response (200):**
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Logged out from all devices",
    "data": null
  }
  ```
- **Side Effect:** Clears ALL refresh tokens for the user

---

### 10. **Google OAuth Login**
- **Endpoint:** `GET /auth/google`
- **Description:** Redirect to Google login page
- **Callback:** `/auth/google/callback`
- **Response:** Redirects to client with tokens and user data

---

## 👤 User Endpoints (Protected)

### 1. **Get Current User Profile**
- **Endpoint:** `GET /user/profile`
- **Headers:** 
  ```
  Authorization: Bearer <accessToken>
  ```
- **Response (200):**
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "User profile fetched successfully",
    "data": {
      "user": {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": "https://example.com/avatar.jpg",
        "role": "user",
        "isEmailVerified": true,
        "createdAt": "2024-02-25T10:00:00.000Z",
        "updatedAt": "2024-02-25T10:00:00.000Z"
      }
    }
  }
  ```

---

### 2. **Update User Profile**
- **Endpoint:** `PUT /user/profile`
- **Headers:** 
  ```
  Authorization: Bearer <accessToken>
  ```
- **Body:**
  ```json
  {
    "name": "Jane Doe",
    "avatar": "https://example.com/new-avatar.jpg"
  }
  ```
- **Note:** Both fields are optional, but at least one must be provided
- **Response (200):**
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Profile updated successfully",
    "data": {
      "user": { /* updated user object */ }
    }
  }
  ```

---

### 3. **Change Password**
- **Endpoint:** `PUT /user/change-password`
- **Headers:** 
  ```
  Authorization: Bearer <accessToken>
  ```
- **Body:**
  ```json
  {
    "currentPassword": "OldPass123!",
    "newPassword": "NewSecurePass123!",
    "confirmNewPassword": "NewSecurePass123!"
  }
  ```
- **Response (200):**
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Password changed successfully. Please log in again with your new password.",
    "data": null
  }
  ```
- **Side Effect:** 
  - Clears ALL refresh tokens (logout from all devices)
  - Clears refresh token cookie on current device

---

### 4. **Delete Account**
- **Endpoint:** `DELETE /user/account`
- **Headers:** 
  ```
  Authorization: Bearer <accessToken>
  ```
- **Body:**
  ```json
  {
    "password": "YourPassword123!"
  }
  ```
- **Note:** Password is required for password-based accounts (not OAuth-only)
- **Response (200):**
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Account deleted successfully",
    "data": null
  }
  ```
- **Side Effect:** Permanently deletes user account and all associated data

---

## 🧪 Testing with Postman

### Setup

1. **Import Environment Variables**
   - In Postman, create a new Environment called `Auth System`
   - Add the following variables:
     ```
     base_url: http://localhost:8000
     api_url: http://localhost:8000/api/v1
     accessToken: (empty - auto-populated after login)
     refreshToken: (empty - auto-populated after login)
     ```

2. **Create Requests**

---

### Complete Postman Testing Flow

#### **Step 1: Register a New User**
- **Method:** POST
- **URL:** `{{api_url}}/auth/register`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (JSON):**
  ```json
  {
    "name": "Test User",
    "email": "testuser@example.com",
    "password": "TestPass123!"
  }
  ```
- **Post-request Script:**
  ```javascript
  // No token yet - just check response
  console.log(pm.response.json());
  ```

---

#### **Step 2: Verify Email**
- **Method:** GET
- **URL:** `{{api_url}}/auth/verify-email?token=<token_from_email>`
- **Note:** In development, check console logs for the verification token
- **Expected:** Email verified successfully

---

#### **Step 3: Login**
- **Method:** POST
- **URL:** `{{api_url}}/auth/login`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (JSON):**
  ```json
  {
    "email": "testuser@example.com",
    "password": "TestPass123!"
  }
  ```
- **Post-request Script:**
  ```javascript
  var jsonData = pm.response.json();
  pm.environment.set("accessToken", jsonData.data.accessToken);
  pm.environment.set("user_id", jsonData.data.user._id);
  console.log("Access Token:", jsonData.data.accessToken);
  ```

---

#### **Step 4: Get User Profile (Protected)**
- **Method:** GET
- **URL:** `{{api_url}}/user/profile`
- **Headers:**
  ```
  Authorization: Bearer {{accessToken}}
  ```
- **Expected:** Returns user profile data

---

#### **Step 5: Update Profile**
- **Method:** PUT
- **URL:** `{{api_url}}/user/profile`
- **Headers:**
  ```
  Authorization: Bearer {{accessToken}}
  Content-Type: application/json
  ```
- **Body (JSON):**
  ```json
  {
    "name": "Updated Name",
    "avatar": "https://example.com/avatar.jpg"
  }
  ```

---

#### **Step 6: Change Password**
- **Method:** PUT
- **URL:** `{{api_url}}/user/change-password`
- **Headers:**
  ```
  Authorization: Bearer {{accessToken}}
  Content-Type: application/json
  ```
- **Body (JSON):**
  ```json
  {
    "currentPassword": "TestPass123!",
    "newPassword": "NewTestPass123!",
    "confirmNewPassword": "NewTestPass123!"
  }
  ```
- **Note:** You'll be logged out and need to login again with the new password

---

#### **Step 7: Refresh Token**
- **Method:** POST
- **URL:** `{{api_url}}/auth/refresh-token`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body:** Empty (uses refresh token from cookies)
- **Post-request Script:**
  ```javascript
  var jsonData = pm.response.json();
  pm.environment.set("accessToken", jsonData.data.accessToken);
  console.log("New Access Token:", jsonData.data.accessToken);
  ```

---

#### **Step 8: Logout**
- **Method:** POST
- **URL:** `{{api_url}}/auth/logout`
- **Headers:**
  ```
  Authorization: Bearer {{accessToken}}
  ```
- **Expected:** Successfully logged out, refresh token cookie cleared

---

#### **Step 9: Forgot Password**
- **Method:** POST
- **URL:** `{{api_url}}/auth/forgot-password`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (JSON):**
  ```json
  {
    "email": "testuser@example.com"
  }
  ```
- **Side Effect:** Sends reset password email

---

#### **Step 10: Reset Password**
- **Method:** POST
- **URL:** `{{api_url}}/auth/reset-password`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (JSON):**
  ```json
  {
    "token": "reset_token_from_email",
    "password": "AnotherNewPass123!",
    "confirmPassword": "AnotherNewPass123!"
  }
  ```

---

### Postman Collection Export

You can create a Postman Collection by:
1. Right-click on folder → Export
2. Select format: Postman Collection v2.1
3. Save and share with team

---

## 🔒 Security Features

### 1. **Authentication & Authorization**
- JWT-based stateless authentication
- Role-based access control (USER, ADMIN)
- Session management with refresh token rotation

### 2. **Password Security**
- Bcryptjs hashing with salt rounds
- Strong password requirements (min 8 chars, mixed case, numbers, symbols)
- Password reset flow with secure tokens

### 3. **Rate Limiting**
- Auth endpoints: 10 requests per 15 minutes
- Email resend: 3 requests per hour
- Prevents brute-force attacks

### 4. **Input Validation**
- Zod schema validation for all inputs
- Email format validation
- HTML escaping for text inputs
- URL validation for avatars

### 5. **NoSQL Injection Prevention**
- Express-mongo-sanitize strips `$` and `.` from inputs
- Protects against MongoDB query operators

### 6. **Security Headers**
- Helmet.js sets 15+ HTTP security headers
- XSS Protection
- Clickjacking prevention
- Content Security Policy

### 7. **CORS Protection**
- Configurable allowed origins
- Credentials/cookies support
- Whitelist HTTP methods

### 8. **Email Verification**
- Secure token-based verification flow
- Token expiration (24 hours)
- Resend verification with rate limiting

### 9. **Token Management**
- Short-lived access tokens (15 minutes)
- Long-lived refresh tokens (7 days)
- Automatic cleanup of expired tokens
- Token rotation on refresh

### 10. **Secure Cookies**
- HttpOnly flag (prevents XSS access)
- Secure flag (HTTPS only in production)
- SameSite=Strict (prevents CSRF)

---

## ⚠️ Error Handling

The API returns standardized error responses:

### Error Codes & Status

| HTTP Status | Meaning | When |
|---|---|---|
| 200 | OK | Successful GET/PUT requests |
| 201 | Created | Successful POST registration |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid input/validation error |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Email already exists |
| 422 | Unprocessable | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Unexpected error |

### Example Error Response
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Validation failed",
  "data": null,
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

---

## 🤝 Contributing

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use ES6+ syntax
- Follow async/await patterns
- Use meaningful variable names
- Add comments for complex logic

---

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Thunderoustyphoon (Anuj)**

---

## 🔗 Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [JWT.io](https://jwt.io/)
- [Passport.js Documentation](http://www.passportjs.org/)
- [Zod Validation](https://zod.dev/)
- [Postman Learning Center](https://learning.postman.com/)

---

## 📧 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Last Updated:** February 25, 2026  
**Version:** 1.0.0
