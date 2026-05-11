@echo off
title DISHA AI BOT - WHATSAPP
echo ----------------------------------------------------
echo 🔥 AUTO-FIXING STUCK PROCESSES...
echo ----------------------------------------------------
taskkill /F /IM msedge.exe /T >nul 2>&1
timeout /t 2 >nul
if exist .wwebjs_auth (
    echo 🧹 Clearing old session locks...
    rmdir /s /q .wwebjs_auth >nul 2>&1
)
echo 🚀 Starting Disha AI Bot...
SET PUPPETEER_SKIP_DOWNLOAD=true
node server.js
pause
