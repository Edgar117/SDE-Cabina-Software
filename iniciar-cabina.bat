@echo off
title SDE Eventos - Cabina de Fotos
cd /d "%~dp0"

echo ========================================
echo   Cabina de Fotos SDE Eventos
echo   (funciona SIN internet)
echo ========================================
echo.

if not exist "node_modules" (
  echo ERROR: Falta node_modules. Con internet, ejecuta: npm install
  pause
  exit /b 1
)

if not exist "dist\index.html" (
  echo Compilando app...
  call npm run build
  if errorlevel 1 (
    echo ERROR al compilar.
    pause
    exit /b 1
  )
)

echo.
echo Abre en el navegador:
echo   http://localhost:4173
echo.
echo En la TV: Win+P - Extender, F11 pantalla completa
echo Operador: ESPACIO para disparar fotos
echo.
echo Cierra esta ventana para detener la cabina.
echo.

call npm run preview -- --host --port 4173
