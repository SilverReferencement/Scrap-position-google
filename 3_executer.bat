@echo off
echo ====================================
echo Execution complete du scraping
echo ====================================
echo.
echo ATTENTION: Cette operation va:
echo - Lire TOUS les mots-cles de la colonne A
echo - Effectuer 5 recherches par mot-cle (FR, US, DE, UK, IT)
echo - Peut prendre plusieurs minutes selon le nombre de mots-cles
echo.
echo Appuyez sur une touche pour continuer ou fermez cette fenetre pour annuler...
pause >nul

npm start

echo.
echo ====================================
echo Scraping termine!
echo ====================================
echo.
echo Verifiez votre Google Sheet pour les resultats.
echo.
pause
