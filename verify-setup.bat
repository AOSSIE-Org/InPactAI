@echo off
echo ==========================================
echo InPactAI Docker Setup Verification
echo ==========================================
echo.

echo Checking prerequisites...
echo.

where docker >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Docker is installed
) else (
    echo [FAIL] Docker is not installed
    goto :end
)

where docker-compose >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Docker Compose is installed
) else (
    docker compose version >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo [OK] Docker Compose is installed
    ) else (
        echo [FAIL] Docker Compose is not installed
        goto :end
    )
)

echo.
echo Checking environment files...
echo.

if exist "Backend\.env" (
    echo [OK] Backend\.env exists
) else (
    echo [FAIL] Backend\.env missing - copy from Backend\.env.example
)

if exist "Frontend\.env" (
    echo [OK] Frontend\.env exists
) else (
    echo [FAIL] Frontend\.env missing - copy from Frontend\.env.example
)

echo.
echo Checking Docker services...
echo.

curl -s -o nul -w "%%{http_code}" http://localhost:8000/ | findstr "200" >nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Backend API is running
) else (
    echo [FAIL] Backend API is not responding
)

curl -s -o nul -w "%%{http_code}" http://localhost:5173/ | findstr "200" >nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Frontend is running
) else (
    echo [FAIL] Frontend is not responding
)

echo.
echo ==========================================
echo Verification complete
echo ==========================================
echo.
echo Access the application:
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo.
echo To start services:
echo   docker compose up --build
echo.

:end
pause
