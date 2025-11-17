@echo off
echo ====================================
echo Installation du projet
echo ====================================
echo.

echo Etape 1: Installation des dependances npm...
call npm install

echo.
echo Etape 2: Installation de Playwright...
call npx playwright install chromium

echo.
echo ====================================
echo Installation terminee!
echo ====================================
echo.
echo Prochaines etapes:
echo 1. Modifier le fichier .env avec votre SPREADSHEET_ID
echo 2. Lancer 2_tester.bat pour tester le script
echo 3. Lancer 3_executer.bat pour executer le scraping complet
echo.
pause
