@echo off
title IGo Academy Platform Setup
color 0A
echo.
echo  =============================================
echo   IGo Academy Learning Platform
echo   Grow. Learn. Lead.
echo  =============================================
echo.

:: Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed!
    echo Download from: https://nodejs.org
    pause
    exit /b 1
)
echo [OK] Node.js found:
node --version

:: Check Redis (optional for dev)
echo.
echo [INFO] Make sure Redis is running (redis-server)
echo        Download: https://github.com/microsoftarchive/redis/releases
echo.

:: Step 1: Run migrations against Supabase
echo [STEP 1] Running database migrations on Supabase...
echo.
cd /d "%~dp0"
node migrate-and-seed.js
if errorlevel 1 (
    echo.
    echo [ERROR] Migration failed. Check your internet connection and Supabase credentials.
    pause
    exit /b 1
)

:: Step 2: Install server dependencies
echo.
echo [STEP 2] Installing server dependencies...
cd /d "%~dp0server"
set PUPPETEER_SKIP_DOWNLOAD=true
npm install
if errorlevel 1 ( echo [ERROR] Server npm install failed & pause & exit /b 1 )
echo [OK] Server dependencies installed

:: Step 3: Install client dependencies
echo.
echo [STEP 3] Installing client dependencies...
cd /d "%~dp0client"
npm install
if errorlevel 1 ( echo [ERROR] Client npm install failed & pause & exit /b 1 )
echo [OK] Client dependencies installed

:: Step 4: Start both servers
echo.
echo  =============================================
echo   Starting IGo Academy Platform...
echo  =============================================
echo.
echo   API Server  -> http://localhost:5000
echo   Web App     -> http://localhost:3000
echo.
echo   Admin Login -> admin@igoacademy.in
echo   Password    -> IGo^@Admin2026
echo.
echo   Press Ctrl+C to stop
echo  =============================================
echo.

:: Start server in new window
start "IGo API Server" cmd /k "cd /d "%~dp0server" && set PUPPETEER_SKIP_DOWNLOAD=true && npm run dev"

:: Wait 3 seconds then start client
timeout /t 3 /nobreak >nul
start "IGo Web Client" cmd /k "cd /d "%~dp0client" && npm run dev"

echo [OK] Both servers started in separate windows.
echo.
echo Opening browser...
timeout /t 4 /nobreak >nul
start http://localhost:3000

pause
