@echo off
title Medicinety - Netlify Login
color 0B
echo ========================================================
echo        Medicinety Platform - Netlify Authorization
echo ========================================================
echo.
echo Opening Netlify Authorization page in browser...
call npx -y netlify-cli login
echo.
echo Authorized successfully! You can now run Deploy-Website.bat.
pause
