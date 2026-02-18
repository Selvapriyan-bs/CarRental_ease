@echo off
echo ========================================
echo   CAR RENTAL SYSTEM - LOCALHOST
echo ========================================
echo.
echo Starting Backend Server...
start cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul
echo.
echo Starting Frontend Server...
start cmd /k "cd project && npm run dev"
echo.
echo ========================================
echo   Backend: http://localhost:5000
echo   Frontend: http://localhost:3000
echo ========================================
echo.
echo Both servers are starting in separate windows...
pause
