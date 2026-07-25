@echo off
title IGO Academy - Build Log
color 0A

set LOG=E:\igo_academy_client\igo_academy_client\build_log.txt
echo ============================================================ > "%LOG%"
echo IGO Academy Build Log - Kotlin 1.9.25 >> "%LOG%"
echo Build started: %DATE% %TIME% >> "%LOG%"
echo ============================================================ >> "%LOG%"
echo. >> "%LOG%"

cd /d "E:\igo_academy_client\igo_academy_client"
echo Working in: %CD% >> "%LOG%"
echo. >> "%LOG%"

echo [1/6] Stopping ALL Gradle daemons and java.exe ... >> "%LOG%"
cd android
call gradlew.bat --stop >> "%LOG%" 2>&1
cd ..
taskkill /F /IM java.exe >> "%LOG%" 2>&1
echo Step 1 done >> "%LOG%"
echo. >> "%LOG%"

echo [2/6] flutter clean ... >> "%LOG%"
flutter clean >> "%LOG%" 2>&1
echo ERRORLEVEL: %ERRORLEVEL% >> "%LOG%"
echo. >> "%LOG%"

echo [3/6] Clearing Gradle caches ... >> "%LOG%"
if exist "build"             rmdir /s /q "build"
if exist ".gradle"           rmdir /s /q ".gradle"
if exist "android\.gradle"   rmdir /s /q "android\.gradle"
if exist "android\app\build" rmdir /s /q "android\app\build"
echo Caches cleared >> "%LOG%"
echo. >> "%LOG%"

echo [4/6] flutter pub get ... >> "%LOG%"
flutter pub get >> "%LOG%" 2>&1
echo ERRORLEVEL: %ERRORLEVEL% >> "%LOG%"
echo. >> "%LOG%"

echo [5/6] flutter devices ... >> "%LOG%"
flutter devices >> "%LOG%" 2>&1
echo. >> "%LOG%"

echo [6/6] flutter run (logging output) ... >> "%LOG%"
echo Started at: %TIME% >> "%LOG%"
flutter run >> "%LOG%" 2>&1
echo ERRORLEVEL: %ERRORLEVEL% >> "%LOG%"

echo. >> "%LOG%"
echo ============================================================ >> "%LOG%"
echo Build finished: %DATE% %TIME% >> "%LOG%"
echo ============================================================ >> "%LOG%"
echo.
echo Done! Check build_log.txt
pause
