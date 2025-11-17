@echo off
echo ====================================
echo Test du scraper (mode visible)
echo ====================================
echo.
echo Ce test va:
echo - Effectuer UNE recherche sur Google France
echo - Vous montrer le navigateur en action
echo - Prendre une capture d'ecran
echo - Afficher les resultats dans le terminal
echo.
echo Appuyez sur une touche pour continuer...
pause >nul

npm test

echo.
echo ====================================
echo Test termine!
echo ====================================
echo.
echo Verifiez:
echo - Le fichier test-screenshot.png pour voir la page Google
echo - Les resultats affiches ci-dessus
echo.
pause
