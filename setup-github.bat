@echo off
echo ====================================
echo Configuration GitHub
echo ====================================
echo.

echo Etape 1: Initialisation du repository Git...
git init

echo.
echo Etape 2: Ajout des fichiers...
git add .

echo.
echo Etape 3: Premier commit...
git commit -m "Initial commit - Automatisation scraping positions Google"

echo.
echo Etape 4: Configuration de la branche principale...
git branch -M main

echo.
echo ====================================
echo Configuration locale terminee!
echo ====================================
echo.
echo PROCHAINES ETAPES MANUELLES:
echo.
echo 1. Creer un nouveau repository sur GitHub:
echo    https://github.com/new
echo.
echo 2. Executer ces commandes en remplacant [URL] par l'URL de votre repo:
echo    git remote add origin [URL]
echo    git push -u origin main
echo.
echo 3. Configurer les secrets GitHub (Settings ^> Secrets ^> Actions):
echo    - SPREADSHEET_ID : Votre ID de Google Sheet
echo    - SHEET_NAME : Le nom de l'onglet
echo    - GOOGLE_CREDENTIALS : Le contenu du fichier credentials.json
echo.
echo 4. Le workflow s'executera automatiquement chaque lundi a 8h
echo    Vous pouvez aussi l'executer manuellement dans Actions ^> Scraping Positions Google ^> Run workflow
echo.
pause
