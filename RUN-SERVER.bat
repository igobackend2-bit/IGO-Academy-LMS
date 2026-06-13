@echo off
title IGo Academy - API Server
color 0A
echo  IGo Academy API Server - http://localhost:5000
echo  ------------------------------------------------
set PUPPETEER_SKIP_DOWNLOAD=true
cd /d "%~dp0server"
npm run dev
pause
