@echo off
echo ====================================
echo Execution avec SerpApi (RECOMMANDE)
echo ====================================
echo.
echo Cette version utilise SerpApi pour eviter les CAPTCHA Google.
echo.
echo Verifications:
echo - Avez-vous un compte SerpApi? https://serpapi.com/
echo - Avez-vous ajoute SERPAPI_KEY dans le fichier .env?
echo.
echo ATTENTION: Cette operation va:
echo - Lire TOUS les mots-cles de la colonne A
echo - Effectuer 5 recherches par mot-cle (FR, US, DE, UK, IT)
echo - Consommer des credits SerpApi (100 gratuits/mois)
echo.
echo Appuyez sur une touche pour continuer ou fermez cette fenetre pour annuler...
pause >nul

node scraper-positions-serpapi.js

echo.
echo ====================================
echo Scraping termine!
echo ====================================
echo.
echo Verifiez votre Google Sheet pour les resultats.
echo.
pause
