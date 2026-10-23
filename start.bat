@echo off
title CareerForge launcher
echo Starting CareerForge API and frontend...
start "CareerForge API" cmd /k "cd /d %~dp0backend && php artisan serve"
start "CareerForge Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 4 >nul
start http://localhost:5173
