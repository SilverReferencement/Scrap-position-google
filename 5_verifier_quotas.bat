@echo off
chcp 65001 > nul
cls

echo ╔════════════════════════════════════════════════════════╗
echo ║   🔍 Vérificateur de Quotas SerpApi                   ║
echo ╚════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

REM Vérifier si node est installé
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Node.js n'est pas installé ou n'est pas dans le PATH
    echo.
    echo Pour installer Node.js:
    echo → https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Vérifier si les dépendances sont installées
if not exist "node_modules" (
    echo ⚠️  Les dépendances ne sont pas installées
    echo Exécution de: npm install
    call npm install
    echo.
)

REM Exécuter le script
echo Récupération des quotas en cours...
echo.
call node check-quotas.js

echo.
pause
