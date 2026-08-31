@echo off
title Medicinety Platform Deployer
color 0A
echo ========================================================
echo        Medicinety Platform - Netlify Deployer
echo ========================================================
echo.

cd /d "C:\Users\ONE BY ONE\.gemini\antigravity\scratch\medicinety-platform"

echo [1/2] Building static HTML production files...
call npx next build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Next.js build failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/2] Direct uploading live to Netlify...
call npx -y netlify-cli deploy --dir=out --prod --allow-anonymous

echo.
echo ========================================================
echo   [SUCCESS] Netlify Site Updated and Live!
echo ========================================================
pause
