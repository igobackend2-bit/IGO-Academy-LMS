@echo off
title IGO Academy - Force Restart
color 0E
cls

set LOG=E:\igo_academy_client\igo_academy_client\build_log.txt

echo ============================================================
echo   IGO Academy - Force Kill + Clean Build
echo   Killing ALL stuck processes then rebuilding
echo ============================================================
echo.

echo [FORCE KILL] Terminating ALL flutter/dart/java processes ...
taskkill /F /IM flutter.exe  2>nul
taskkill /F /IM dart.exe     2>nul
taskkill /F /IM java.exe     2>nul
taskkill /F /IM gradle.exe   2>nul
taskkill /F /IM gradlew.exe  2>nul
echo Done killing processes.
timeout /t 3 /nobreak >nul

cd /d "E:\igo_academy_client\igo_academy_client"

:: Stop Gradle daemons
cd android
call gradlew.bat --stop 2>nul
cd ..

:: Force-delete all caches (no flutter clean needed since build/ is already empty)
echo [DELETE] Removing .dart_tool, build, .gradle caches ...
if exist ".dart_tool"        rmdir /s /q ".dart_tool"        2>nul
if exist "build"             rmdir /s /q "build"             2>nul
if exist ".gradle"           rmdir /s /q ".gradle"           2>nul
if exist "android\.gradle"   rmdir /s /q "android\.gradle"   2>nul
if exist "android\app\build" rmdir /s /q "android\app\build" 2>nul
echo Done deleting caches.
echo.

:: Now write fresh log
echo ============================================================  > "%LOG%"
echo IGO Academy Build Log - Force Restart                        >> "%LOG%"
echo Build started: %DATE% %TIME%                                 >> "%LOG%"
echo ============================================================  >> "%LOG%"
echo.                                                             >> "%LOG%"

:: flutter pub get
echo [PUB GET] Running flutter pub get ...
echo [1/3] flutter pub get ... >> "%LOG%"
flutter pub get >> "%LOG%" 2>&1
echo ERRORLEVEL: %ERRORLEVEL% >> "%LOG%"
echo.
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo ERROR: flutter pub get failed. Check build_log.txt
    pause & exit /b 1
)

:: flutter devices
echo [DEVICES] Checking connected devices ...
echo [2/3] flutter devices ... >> "%LOG%"
flutter devices >> "%LOG%" 2>&1
echo.

:: flutter run
echo [RUN] Starting flutter run ... (first build takes 3-5 min)
echo [3/3] flutter run started at %TIME% ... >> "%LOG%"
flutter run >> "%LOG%" 2>&1
echo ERRORLEVEL: %ERRORLEVEL% >> "%LOG%"

echo. >> "%LOG%"
echo Build finished: %DATE% %TIME% >> "%LOG%"
echo.
echo Done! Check build_log.txt
pause
