@echo off
echo ========================================
echo   SISTEMA KARDEX EMI - Iniciando...
echo ========================================

echo [1/3] Iniciando Backend Django (puerto 8000)...
start "Django API" cmd /k "cd /d "%~dp0backend-django" && call venv\Scripts\activate && python manage.py runserver"

timeout /t 2 >nul

echo [2/3] Iniciando Backend Node Blockchain (puerto 3000)...
start "Node Blockchain" cmd /k "cd /d "%~dp0backend-node" && npm run dev"

timeout /t 2 >nul

echo [3/3] Iniciando Frontend React (puerto 5173)...
start "Frontend React" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo ========================================
echo   Todos los servicios iniciados!
echo   Django:   http://localhost:8000
echo   Node:     http://localhost:3000
echo   Frontend: http://localhost:5173
echo ========================================
pause
