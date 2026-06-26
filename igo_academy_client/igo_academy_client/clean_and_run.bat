@echo off
title IGO Academy - Clean Build & Run
color 0A
cls

echo ============================================================
echo   IGO Academy - Clean Build ^& Run
echo   Kotlin 1.9.25 (no BTAPI) + incremental=false
echo ============================================================
echo.

cd /d "E:\igo_academy_client\igo_academy_client"
echo Working in: %CD%
echo.

:: ── Step 1: Stop ALL Gradle daemons FIRST ───────────────────────
echo [1/6] Stopping ALL Gradle daemons ...
cd android
call gradlew.bat --stop 2>nul
cd ..
taskkill /F /IM java.exe 2>nul
echo Done.
echo.

:: ── Step 2: Flutter clean ───────────────────────────────────────
echo [2/6] Running flutter clean ...
flutter clean
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo ERROR: flutter clean failed.
    pause & exit /b 1
)
echo Done.
echo.

:: ── Step 3: Wipe ALL build and Gradle caches ────────────────────
echo [3/6] Clearing ALL Gradle and Kotlin caches ...
if exist "build"             rmdir /s /q "build"
if exist ".gradle"           rmdir /s /q ".gradle"
if exist "android\.gradle"   rmdir /s /q "android\.gradle"
if exist "android\app\build" rmdir /s /q "android\app\build"
echo Done.
echo.

:: ── Step 4: flutter pub get ─────────────────────────────────────
echo [4/6] Running flutter pub get ...
flutter pub get
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo ERROR: flutter pub get failed. Check pubspec.yaml.
    pause & exit /b 1
)
echo Done.
echo.

:: ── Step 5: Show connected devices ──────────────────────────────
echo [5/6] Connected devices:
flutter devices
echo.

:: ── Step 6: flutter run ─────────────────────────────────────────
echo [6/6] Starting flutter run ...
echo       First Gradle build = 3-5 min. Please wait.
echo.
flutter run
echo.

echo ============================================================
echo   Done. Press any key to close.
echo ============================================================
pause
