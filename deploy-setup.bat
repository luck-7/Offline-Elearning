@echo off
echo ========================================
echo   Offline E-Learning Portal Deployment
echo ========================================
echo.

echo [1/5] Checking prerequisites...
echo.

REM Check if Git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git is not installed. Please install Git first.
    pause
    exit /b 1
)
echo ✅ Git is installed

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)
echo ✅ Node.js is installed

REM Check if Java is installed
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Java is not installed. Please install Java 17+ first.
    pause
    exit /b 1
)
echo ✅ Java is installed

echo.
echo [2/5] Setting up Git repository...
echo.

REM Initialize Git if not already done
if not exist .git (
    git init
    echo ✅ Git repository initialized
) else (
    echo ✅ Git repository already exists
)

REM Add all files
git add .
git status

echo.
echo [3/5] Building frontend for production...
echo.

cd frontend
if exist node_modules (
    echo ✅ Node modules already installed
) else (
    echo Installing dependencies...
    npm install
)

echo Building production build...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed
    pause
    exit /b 1
)
echo ✅ Frontend build successful

cd ..

echo.
echo [4/5] Testing backend build...
echo.

cd offline
echo Building backend...
mvn clean package -DskipTests
if %errorlevel% neq 0 (
    echo ❌ Backend build failed
    pause
    exit /b 1
)
echo ✅ Backend build successful

cd ..

echo.
echo [5/5] Preparing for deployment...
echo.

echo Creating deployment commit...
git add .
git commit -m "Prepare for deployment - Add production configurations"

echo.
echo ========================================
echo   🎉 SETUP COMPLETE!
echo ========================================
echo.
echo Next steps:
echo.
echo 1. Push to GitHub:
echo    git remote add origin https://github.com/YOUR_USERNAME/offline-elearning-portal.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 2. Deploy Backend on Render:
echo    - Go to: https://dashboard.render.com/
echo    - Create new Web Service
echo    - Connect your GitHub repo
echo    - Use the configuration from DEPLOYMENT_GUIDE.md
echo.
echo 3. Deploy Frontend on Netlify:
echo    - Go to: https://app.netlify.com/teams/luck-7/projects
echo    - Import from Git
echo    - Use the configuration from DEPLOYMENT_GUIDE.md
echo.
echo 4. Read the complete guide: DEPLOYMENT_GUIDE.md
echo.
echo ========================================

pause
