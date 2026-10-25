@echo off
title Smartcvmaker launcher
echo Starting Smartcvmaker API and frontend...
start "Smartcvmaker API" cmd /k "cd /d %~dp0backend && php artisan serve"
start "Smartcvmaker Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 4 >nul
start http://localhost:5173
