@echo off
title IGO Academy - Flutter Setup
color 0A
echo ============================================
echo   IGO Academy - Flutter Setup
echo ============================================
echo.

cd /d "E:\igo_academy_client\igo_academy_client"
echo [1/3] Working directory: %CD%
echo.

echo [2/3] Running flutter pub get...
echo ----------------------------------------
flutter pub get
echo ----------------------------------------

if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo ERROR: flutter pub get failed!
    echo Make sure Flutter is installed and in PATH.
    echo Download Flutter from: https://docs.flutter.dev/get-started/install/windows
    echo.
    pause
    exit /b 1
)

echo.
echo [3/3] flutter pub get completed successfully!
echo.
echo ============================================
echo   Checking connected devices...
echo ============================================
flutter devices
echo.
echo ============================================
echo   Starting flutter run...
echo ============================================
echo.
flutter run
echo.
pause
