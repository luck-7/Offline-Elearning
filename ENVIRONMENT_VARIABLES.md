# 🔧 Environment Variables Configuration

## Backend Environment Variables (Render)

### Required Variables
```bash
# Spring Profile
SPRING_PROFILES_ACTIVE=production

# Server Configuration
SERVER_PORT=10000

# Database Configuration (Auto-filled by Render PostgreSQL)
SPRING_DATASOURCE_URL=postgresql://[host]:[port]/[database]
SPRING_DATASOURCE_USERNAME=[username]
SPRING_DATASOURCE_PASSWORD=[password]
SPRING_JPA_HIBERNATE_DDL_AUTO=update
SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.PostgreSQLDialect

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-256-bits-long-random-string
JWT_EXPIRATION=86400000

# CORS Configuration
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.netlify.app,http://localhost:3000
```

### Optional Variables
```bash
# Logging
LOGGING_LEVEL_COM_ELEARNING=INFO
LOGGING_LEVEL_ORG_SPRINGFRAMEWORK_SECURITY=INFO

# File Upload
SPRING_SERVLET_MULTIPART_MAX_FILE_SIZE=10MB
SPRING_SERVLET_MULTIPART_MAX_REQUEST_SIZE=10MB

# Actuator
MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE=health,info
```

---

## Frontend Environment Variables (Netlify)

### Required Variables
```bash
# API Configuration
REACT_APP_API_BASE_URL=https://your-backend-domain.onrender.com/api

# App Configuration
REACT_APP_APP_NAME=Offline E-Learning Portal
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=production

# Feature Flags
REACT_APP_ENABLE_OFFLINE_MODE=true
REACT_APP_ENABLE_PWA=true
```

### Optional Variables
```bash
# Analytics (if you add analytics later)
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_GA_TRACKING_ID=

# Service Worker
REACT_APP_SW_UPDATE_POPUP=true

# Cache Configuration
REACT_APP_CACHE_VERSION=v1
REACT_APP_API_CACHE_DURATION=300000

# Build Configuration
GENERATE_SOURCEMAP=false
INLINE_RUNTIME_CHUNK=false
```

---

## 🔐 Security Notes

### JWT Secret Generation
Generate a secure JWT secret using one of these methods:

**Method 1: Online Generator**
- Visit: https://generate-secret.vercel.app/32
- Copy the generated secret

**Method 2: Command Line**
```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Environment Variable Security
- ✅ Never commit `.env` files to Git
- ✅ Use different secrets for development and production
- ✅ Rotate secrets regularly
- ✅ Use Render's built-in secret generation when possible

---

## 📋 Step-by-Step Configuration

### 1. Render Backend Setup

1. **Create Web Service**:
   - Name: `elearning-backend`
   - Environment: `Java`
   - Build Command: `cd offline && mvn clean package -DskipTests`
   - Start Command: `cd offline && java -jar target/offline-0.0.1-SNAPSHOT.jar`

2. **Add Environment Variables**:
   ```
   SPRING_PROFILES_ACTIVE=production
   SERVER_PORT=10000
   JWT_SECRET=[generate-secure-secret]
   JWT_EXPIRATION=86400000
   CORS_ALLOWED_ORIGINS=https://your-netlify-domain.netlify.app
   ```

3. **Create PostgreSQL Database**:
   - Name: `elearning-db`
   - Plan: Free
   - Auto-connects to your web service

### 2. Netlify Frontend Setup

1. **Site Settings**:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/build`

2. **Environment Variables**:
   ```
   REACT_APP_API_BASE_URL=https://your-render-domain.onrender.com/api
   REACT_APP_ENVIRONMENT=production
   REACT_APP_ENABLE_OFFLINE_MODE=true
   REACT_APP_ENABLE_PWA=true
   ```

---

## 🔄 Update Process

### After Initial Deployment

1. **Get Your Actual URLs**:
   - Render backend URL: `https://[your-service-name].onrender.com`
   - Netlify frontend URL: `https://[your-site-name].netlify.app`

2. **Update Backend CORS**:
   - In Render dashboard, update `CORS_ALLOWED_ORIGINS`
   - Replace with your actual Netlify URL

3. **Update Frontend API URL**:
   - In Netlify dashboard, update `REACT_APP_API_BASE_URL`
   - Replace with your actual Render API URL

4. **Redeploy Both Services**:
   - Render: Automatic on environment variable change
   - Netlify: Automatic on environment variable change

---

## ✅ Verification Checklist

### Backend Health Check
- [ ] Visit: `https://your-backend.onrender.com/api/actuator/health`
- [ ] Should return: `{"status":"UP"}`

### Frontend Functionality
- [ ] Site loads without errors
- [ ] Login functionality works
- [ ] API calls are successful
- [ ] Offline mode works
- [ ] PWA installation available

### CORS Configuration
- [ ] No CORS errors in browser console
- [ ] API calls work from frontend domain
- [ ] Preflight requests succeed

---

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Check `CORS_ALLOWED_ORIGINS` includes your Netlify domain
   - Ensure no trailing slashes in URLs
   - Verify protocol (https vs http)

2. **API Connection Issues**:
   - Verify `REACT_APP_API_BASE_URL` is correct
   - Check if backend is sleeping (Render free tier)
   - Test backend health endpoint directly

3. **Build Failures**:
   - Check build logs in respective dashboards
   - Verify all environment variables are set
   - Ensure dependencies are properly installed

4. **Database Connection**:
   - Verify PostgreSQL connection string
   - Check database credentials
   - Ensure database is running
