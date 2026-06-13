@echo off
title IGo Academy - Web App
color 0B
echo  IGo Academy Web App - http://localhost:3000
echo  ------------------------------------------------
cd /d "%~dp0client"
npm run dev
pause
