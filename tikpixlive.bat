@echo off
title TikPix Live

cd /d "%~dp0"

echo [1/2] Building...
call pnpm build

echo [2/2] Starting server on port 3001...

:: Start the server in a minimized window
start "TikPix API" /min node server.js

:: Wait for server
timeout /t 3 /nobreak >nul

:: Start ngrok
start "ngrok" /min ngrok http 3001

:: Wait for ngrok and get URL (/nubank redirects to /#/nubank)
set NGROK_URL=
for /f "tokens=*" %%a in ('powershell -ExecutionPolicy Bypass -File "%~dp0get-ngrok-url.ps1"') do set NGROK_URL=%%a

:: Open local pages
start http://localhost:3001
start http://localhost:3001/#/nubank

cls
echo ============================================
echo   TikPix Live - rodando!
echo ============================================
echo.
echo  PC:
echo    Main:     http://localhost:3001
echo    Nubank:   http://localhost:3001/#/nubank
echo.
if not "%NGROK_URL%"=="" (
  echo  CELULAR (WiFi/4G):
  echo    %NGROK_URL%
  echo %NGROK_URL% | clip
  echo  ^(URL copiada para a area de transferencia^)
  powershell -Command "Start-Process '%NGROK_URL%'"
) else (
  echo  ngrok: URL nao detectada - veja a janela do ngrok
)
echo.
echo ============================================
echo  Pressione ENTER para parar tudo
echo.

pause >nul

:: Kill everything
taskkill /fi "windowtitle eq ngrok" /f >nul 2>&1
taskkill /fi "windowtitle eq TikPix API" /f >nul 2>&1
