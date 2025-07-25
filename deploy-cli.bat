@echo off
echo ========================================
echo   🚀 AUTOMATED DEPLOYMENT SCRIPT
echo   Offline E-Learning Portal
echo ========================================
echo.

echo [INFO] This script will help you deploy your project
echo [INFO] You'll need to install CLI tools first
echo.

echo ========================================
echo   📋 STEP 1: INSTALL CLI TOOLS
echo ========================================
echo.

echo Installing Netlify CLI...
npm install -g netlify-cli

echo.
echo [INFO] For Render, you'll need to use the web interface
echo [INFO] Render CLI is not yet available for all features
echo.

echo ========================================
echo   🌐 STEP 2: DEPLOY FRONTEND (NETLIFY)
echo ========================================
echo.

echo Navigating to frontend directory...
cd frontend

echo.
echo Installing dependencies...
npm install

echo.
echo Building production version...
npm run build

echo.
echo [INFO] Now deploying to Netlify...
echo [INFO] You'll be prompted to login and configure

netlify deploy --prod --dir=build

echo.
echo ========================================
echo   ⚙️ STEP 3: BACKEND DEPLOYMENT INFO
echo ========================================
echo.

echo [INFO] For backend deployment, please:
echo.
echo 1. Go to: https://dashboard.render.com/project/prj-d21mdre3jp1c7381snn0
echo 2. Click "New +" → "Web Service"
echo 3. Connect GitHub repo: luck-7/Offline-Elearning
echo 4. Use these settings:
echo    - Name: elearning-backend
echo    - Environment: Java
echo    - Build Command: cd offline ^&^& mvn clean package -DskipTests
echo    - Start Command: cd offline ^&^& java -jar target/offline-0.0.1-SNAPSHOT.jar
echo.
echo 5. Add environment variables from EXACT_DEPLOYMENT_STEPS.md
echo 6. Create PostgreSQL database
echo 7. Deploy!
echo.

echo ========================================
echo   ✅ DEPLOYMENT COMPLETE!
echo ========================================
echo.

echo Your frontend should now be deployed to Netlify!
echo Check the output above for your site URL.
echo.
echo Next steps:
echo 1. Deploy backend using Render web interface
echo 2. Update environment variables with actual URLs
echo 3. Test your deployed application
echo.

echo ========================================

cd ..
pause
