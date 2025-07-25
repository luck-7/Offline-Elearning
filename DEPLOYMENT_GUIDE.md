# 🚀 Deployment Guide - Offline E-Learning Portal

## Overview
This guide will help you deploy your Offline E-Learning Portal with:
- **Backend**: Spring Boot on Render (with PostgreSQL)
- **Frontend**: React on Netlify

---

## 📋 Prerequisites

### Required Accounts
- [x] GitHub account (for code repository)
- [x] Netlify account: https://app.netlify.com/teams/luck-7/projects
- [x] Render account: https://dashboard.render.com/

### Required Tools
- [x] Git installed locally
- [x] Node.js 18+ installed
- [x] Java 17+ installed
- [x] Maven 3.8+ installed

---

## 🗄️ PART 1: Backend Deployment on Render

### Step 1: Prepare Your Repository

1. **Initialize Git Repository** (if not already done):
```bash
cd offline-elearning-portal
git init
git add .
git commit -m "Initial commit - Offline E-Learning Portal"
```

2. **Create GitHub Repository**:
   - Go to GitHub and create a new repository
   - Name it: `offline-elearning-portal`
   - Push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/offline-elearning-portal.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy Backend on Render

1. **Go to Render Dashboard**: https://dashboard.render.com/

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select `offline-elearning-portal`

3. **Configure Web Service**:
   ```
   Name: elearning-backend
   Environment: Java
   Build Command: cd offline && mvn clean package -DskipTests
   Start Command: cd offline && java -jar target/offline-0.0.1-SNAPSHOT.jar
   ```

4. **Set Environment Variables**:
   ```
   SPRING_PROFILES_ACTIVE=production
   SERVER_PORT=10000
   JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
   JWT_EXPIRATION=86400000
   CORS_ALLOWED_ORIGINS=https://your-frontend-domain.netlify.app
   ```

5. **Create PostgreSQL Database**:
   - In Render Dashboard, click "New +" → "PostgreSQL"
   - Name: `elearning-db`
   - Plan: Free
   - Note down the connection details

6. **Add Database Environment Variables**:
   ```
   SPRING_DATASOURCE_URL=postgresql://[host]:[port]/[database]
   SPRING_DATASOURCE_USERNAME=[username]
   SPRING_DATASOURCE_PASSWORD=[password]
   SPRING_JPA_HIBERNATE_DDL_AUTO=update
   SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.PostgreSQLDialect
   ```

7. **Deploy**:
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Your backend will be available at: `https://your-service-name.onrender.com`

---

## 🌐 PART 2: Frontend Deployment on Netlify

### Step 1: Prepare Frontend

1. **Update API Base URL**:
   - Edit `frontend/.env.production`
   - Replace `your-backend-domain.onrender.com` with your actual Render URL

2. **Update CORS Configuration**:
   - Go back to Render dashboard
   - Update `CORS_ALLOWED_ORIGINS` with your Netlify URL

### Step 2: Deploy on Netlify

1. **Go to Netlify**: https://app.netlify.com/teams/luck-7/projects

2. **Import from Git**:
   - Click "Add new site" → "Import an existing project"
   - Choose "Deploy with GitHub"
   - Select your repository: `offline-elearning-portal`

3. **Configure Build Settings**:
   ```
   Base directory: frontend
   Build command: npm run build
   Publish directory: frontend/build
   ```

4. **Set Environment Variables**:
   - Go to Site Settings → Environment Variables
   - Add:
   ```
   REACT_APP_API_BASE_URL=https://your-backend-domain.onrender.com/api
   REACT_APP_ENVIRONMENT=production
   REACT_APP_ENABLE_OFFLINE_MODE=true
   ```

5. **Deploy**:
   - Click "Deploy site"
   - Wait for build completion (3-5 minutes)
   - Your frontend will be available at: `https://your-site-name.netlify.app`

---

## 🔧 Post-Deployment Configuration

### Update CORS Settings

1. **Update Backend CORS**:
   - Go to Render dashboard
   - Update environment variable:
   ```
   CORS_ALLOWED_ORIGINS=https://your-actual-netlify-domain.netlify.app
   ```

2. **Update Frontend API URL**:
   - In Netlify dashboard, update environment variable:
   ```
   REACT_APP_API_BASE_URL=https://your-actual-render-domain.onrender.com/api
   ```

### Test Deployment

1. **Backend Health Check**:
   - Visit: `https://your-backend-domain.onrender.com/api/actuator/health`
   - Should return: `{"status":"UP"}`

2. **Frontend Test**:
   - Visit your Netlify URL
   - Try logging in with sample credentials
   - Test offline functionality

---

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Ensure CORS_ALLOWED_ORIGINS includes your Netlify domain
   - Check that API URLs are correct

2. **Database Connection Issues**:
   - Verify PostgreSQL connection string
   - Check database credentials

3. **Build Failures**:
   - Check build logs in respective dashboards
   - Ensure all dependencies are properly configured

### Monitoring

1. **Backend Logs**: Available in Render dashboard
2. **Frontend Logs**: Available in Netlify dashboard
3. **Database Monitoring**: Available in Render PostgreSQL dashboard

---

## 🎉 Success!

Your Offline E-Learning Portal is now deployed and accessible:
- **Frontend**: https://your-site-name.netlify.app
- **Backend**: https://your-service-name.onrender.com
- **Database**: Managed PostgreSQL on Render

The application supports:
- ✅ Offline functionality
- ✅ Progressive Web App features
- ✅ Automatic deployments from Git
- ✅ SSL certificates
- ✅ Global CDN (Netlify)
- ✅ Database backups (Render)

---

## 📝 Quick Deployment Checklist

### Before You Start:
- [ ] Create GitHub repository
- [ ] Push your code to GitHub
- [ ] Have Render and Netlify accounts ready

### Backend Deployment (Render):
- [ ] Create new Web Service on Render
- [ ] Connect GitHub repository
- [ ] Set build command: `cd offline && mvn clean package -DskipTests`
- [ ] Set start command: `cd offline && java -jar target/offline-0.0.1-SNAPSHOT.jar`
- [ ] Create PostgreSQL database
- [ ] Configure environment variables
- [ ] Deploy and test

### Frontend Deployment (Netlify):
- [ ] Create new site on Netlify
- [ ] Connect GitHub repository
- [ ] Set base directory: `frontend`
- [ ] Set build command: `npm run build`
- [ ] Set publish directory: `frontend/build`
- [ ] Configure environment variables
- [ ] Deploy and test

### Final Steps:
- [ ] Update CORS settings with actual domains
- [ ] Test login functionality
- [ ] Test offline features
- [ ] Verify PWA installation
- [ ] Check mobile responsiveness

---

## 🔗 Important URLs to Update

After deployment, update these URLs in your configuration:

1. **In Render (Backend)**:
   - `CORS_ALLOWED_ORIGINS` → Your Netlify URL

2. **In Netlify (Frontend)**:
   - `REACT_APP_API_BASE_URL` → Your Render API URL

3. **In Code** (if needed):
   - Update any hardcoded URLs
   - Update service worker cache URLs

---

## 💡 Pro Tips

1. **Free Tier Limitations**:
   - Render: Service sleeps after 15 minutes of inactivity
   - Netlify: 100GB bandwidth per month
   - Both: Automatic SSL certificates

2. **Performance Optimization**:
   - Enable gzip compression (automatic on both platforms)
   - Use CDN for static assets (Netlify provides this)
   - Implement proper caching headers

3. **Monitoring**:
   - Set up uptime monitoring
   - Monitor error logs regularly
   - Use health check endpoints

4. **Security**:
   - Use strong JWT secrets
   - Enable HTTPS only
   - Implement proper CORS policies
   - Regular security updates
